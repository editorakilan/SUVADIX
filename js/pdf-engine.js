/**
 * PDF Suite - Core Client-Side PDF Engine
 * Zero-server, 100% in-browser manipulation using PDF-Lib, PDF.js, and JSZip.
 */

class PDFEngine {
  constructor() {
    this.pdfjsInitialized = false;
  }

  initPdfJs() {
    if (this.pdfjsInitialized) return;
    if (window.pdfjsLib) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      this.pdfjsInitialized = true;
    }
  }

  // --- Safe Buffer Cloning (Prevents Detached ArrayBuffer Errors) ---
  cloneBuffer(buffer) {
    if (!buffer) return null;
    if (buffer instanceof ArrayBuffer) {
      return buffer.slice(0);
    }
    if (buffer.buffer instanceof ArrayBuffer) {
      return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
    }
    return buffer;
  }

  // --- File I/O Helpers ---
  readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);
  }

  formatBytes(bytes, decimals = 2) {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  // --- PDF-Lib Core Manipulations ---

  /**
   * Lossless Merge of multiple PDFs (100% Vector & Text Stream Preserving)
   */
  async mergePDFs(arrayBuffers, onProgress) {
    const { PDFDocument } = PDFLib;
    const mergedDoc = await PDFDocument.create();

    const total = arrayBuffers.length;
    for (let i = 0; i < total; i++) {
      if (onProgress) onProgress((i / total) * 0.9, `Merging file ${i + 1} of ${total}...`);
      // Clone buffer to prevent detaching
      const safeBuffer = this.cloneBuffer(arrayBuffers[i]);
      const srcDoc = await PDFDocument.load(safeBuffer, { ignoreEncryption: true });
      const indices = srcDoc.getPageIndices();
      const copiedPages = await mergedDoc.copyPages(srcDoc, indices);
      copiedPages.forEach(p => mergedDoc.addPage(p));
    }

    if (onProgress) onProgress(0.95, 'Finalizing merged document...');
    // useObjectStreams: false ensures standard compatibility with all text search and viewers
    const pdfBytes = await mergedDoc.save({ useObjectStreams: false });
    if (onProgress) onProgress(1.0, 'Done!');
    return new Blob([pdfBytes], { type: 'application/pdf' });
  }

  /**
   * Split PDF into separate pages or ranges
   */
  async splitPDF(arrayBuffer, rangeStr, onProgress) {
    const { PDFDocument } = PDFLib;
    const safeBuffer = this.cloneBuffer(arrayBuffer);
    const srcDoc = await PDFDocument.load(safeBuffer, { ignoreEncryption: true });
    const totalPages = srcDoc.getPageCount();

    // Mode A: Split each page individually
    if (!rangeStr || rangeStr.trim().toLowerCase() === 'all') {
      const results = [];
      for (let i = 0; i < totalPages; i++) {
        if (onProgress) onProgress((i / totalPages), `Splitting page ${i + 1} of ${totalPages}...`);
        const subDoc = await PDFDocument.create();
        const [copied] = await subDoc.copyPages(srcDoc, [i]);
        subDoc.addPage(copied);
        const bytes = await subDoc.save({ useObjectStreams: false });
        results.push({
          name: `page_${i + 1}.pdf`,
          blob: new Blob([bytes], { type: 'application/pdf' })
        });
      }
      return results;
    }

    // Mode B: Split by ranges (e.g. "1-3, 5, 7-9")
    const ranges = rangeStr.split(',').map(s => s.trim()).filter(Boolean);
    const results = [];

    for (let rIdx = 0; rIdx < ranges.length; rIdx++) {
      const part = ranges[rIdx];
      let pageIndices = [];
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(n => parseInt(n.trim(), 10));
        if (!isNaN(start) && !isNaN(end)) {
          for (let p = Math.max(1, start); p <= Math.min(totalPages, end); p++) {
            pageIndices.push(p - 1);
          }
        }
      } else {
        const p = parseInt(part, 10);
        if (!isNaN(p) && p >= 1 && p <= totalPages) {
          pageIndices.push(p - 1);
        }
      }

      if (pageIndices.length > 0) {
        const subDoc = await PDFDocument.create();
        const copied = await subDoc.copyPages(srcDoc, pageIndices);
        copied.forEach(p => subDoc.addPage(p));
        const bytes = await subDoc.save({ useObjectStreams: false });
        results.push({
          name: `pages_${part.replace(/\s+/g, '')}.pdf`,
          blob: new Blob([bytes], { type: 'application/pdf' })
        });
      }
    }
    return results;
  }

  /**
   * Remove specified pages
   */
  async removePages(arrayBuffer, pageIndicesToRemove) {
    const { PDFDocument } = PDFLib;
    const safeBuffer = this.cloneBuffer(arrayBuffer);
    const srcDoc = await PDFDocument.load(safeBuffer, { ignoreEncryption: true });
    const totalPages = srcDoc.getPageCount();
    const removeSet = new Set(pageIndicesToRemove);

    const pagesToKeep = [];
    for (let i = 0; i < totalPages; i++) {
      if (!removeSet.has(i)) pagesToKeep.push(i);
    }

    if (pagesToKeep.length === 0) {
      throw new Error('Cannot delete all pages from the document.');
    }

    const newDoc = await PDFDocument.create();
    const copiedPages = await newDoc.copyPages(srcDoc, pagesToKeep);
    copiedPages.forEach(p => newDoc.addPage(p));
    const bytes = await newDoc.save({ useObjectStreams: false });
    return new Blob([bytes], { type: 'application/pdf' });
  }

  /**
   * Extract specified pages
   */
  async extractPages(arrayBuffer, pageIndicesToExtract) {
    const { PDFDocument } = PDFLib;
    const safeBuffer = this.cloneBuffer(arrayBuffer);
    const srcDoc = await PDFDocument.load(safeBuffer, { ignoreEncryption: true });
    if (!pageIndicesToExtract || pageIndicesToExtract.length === 0) {
      throw new Error('Please select at least one page to extract.');
    }
    const newDoc = await PDFDocument.create();
    const copiedPages = await newDoc.copyPages(srcDoc, pageIndicesToExtract);
    copiedPages.forEach(p => newDoc.addPage(p));
    const bytes = await newDoc.save({ useObjectStreams: false });
    return new Blob([bytes], { type: 'application/pdf' });
  }

  /**
   * Reorganize pages (order, rotation, removals)
   */
  async organizePages(arrayBuffer, pageConfigList) {
    const { PDFDocument, degrees } = PDFLib;
    const safeBuffer = this.cloneBuffer(arrayBuffer);
    const srcDoc = await PDFDocument.load(safeBuffer, { ignoreEncryption: true });
    const newDoc = await PDFDocument.create();

    const originalIndices = pageConfigList.map(c => c.originalIndex);
    const copiedPages = await newDoc.copyPages(srcDoc, originalIndices);

    copiedPages.forEach((page, i) => {
      const config = pageConfigList[i];
      if (config.rotation) {
        const curRot = page.getRotation().angle;
        page.setRotation(degrees(curRot + config.rotation));
      }
      newDoc.addPage(page);
    });

    const bytes = await newDoc.save({ useObjectStreams: false });
    return new Blob([bytes], { type: 'application/pdf' });
  }

  /**
   * Rotate pages by 90/180/270 degrees (Supports both global angle and per-page rotation maps)
   */
  async rotatePages(arrayBuffer, rotationAngle, targetIndices = null) {
    const { PDFDocument, degrees } = PDFLib;
    const safeBuffer = this.cloneBuffer(arrayBuffer);
    const doc = await PDFDocument.load(safeBuffer, { ignoreEncryption: true });
    const pages = doc.getPages();

    if (typeof rotationAngle === 'object' && rotationAngle !== null) {
      if (Array.isArray(rotationAngle)) {
        rotationAngle.forEach(item => {
          const page = pages[item.pageIndex];
          if (page && item.rotation) {
            const cur = page.getRotation().angle;
            page.setRotation(degrees(cur + item.rotation));
          }
        });
      } else {
        Object.entries(rotationAngle).forEach(([idxStr, rot]) => {
          const idx = parseInt(idxStr, 10);
          const page = pages[idx];
          if (page && rot) {
            const cur = page.getRotation().angle;
            page.setRotation(degrees(cur + rot));
          }
        });
      }
    } else {
      pages.forEach((page, idx) => {
        if (!targetIndices || targetIndices.includes(idx)) {
          const cur = page.getRotation().angle;
          page.setRotation(degrees(cur + rotationAngle));
        }
      });
    }

    const bytes = await doc.save({ useObjectStreams: false });
    return new Blob([bytes], { type: 'application/pdf' });
  }

  /**
   * Add page numbers
   */
  async addPageNumbers(arrayBuffer, options = {}) {
    const {
      position = 'bottom-center',
      format = 'Page {n} of {total}',
      fontSize = 10,
      margin = 30,
      startNumber = 1
    } = options;

    const { PDFDocument, StandardFonts, rgb } = PDFLib;
    const safeBuffer = this.cloneBuffer(arrayBuffer);
    const doc = await PDFDocument.load(safeBuffer, { ignoreEncryption: true });
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const pages = doc.getPages();
    const total = pages.length;

    pages.forEach((page, i) => {
      const n = startNumber + i;
      const text = format.replace('{n}', n).replace('{total}', total);
      const textWidth = font.widthOfTextAtSize(text, fontSize);
      const textHeight = font.heightAtSize(fontSize);
      const { width, height } = page.getSize();

      let x = (width - textWidth) / 2;
      let y = margin;

      if (position === 'bottom-left') {
        x = margin;
      } else if (position === 'bottom-right') {
        x = width - textWidth - margin;
      } else if (position === 'top-center') {
        y = height - margin - textHeight;
      } else if (position === 'top-right') {
        x = width - textWidth - margin;
        y = height - margin - textHeight;
      } else if (position === 'top-left') {
        x = margin;
        y = height - margin - textHeight;
      }

      page.drawText(text, {
        x,
        y,
        size: fontSize,
        font,
        color: rgb(0.3, 0.3, 0.3)
      });
    });

    const bytes = await doc.save({ useObjectStreams: false });
    return new Blob([bytes], { type: 'application/pdf' });
  }

  /**
   * Comprehensive Watermark Tool (Text & Image with Alignment, Position, Angle, Opacity)
   */
  async addWatermark(arrayBuffer, options = {}) {
    const {
      type = 'text', // 'text' | 'image'
      // Text options
      text = 'CONFIDENTIAL',
      fontSize = 48,
      fontFamily = 'HelveticaBold',
      opacity = 0.25,
      angle = -45,
      colorHex = '#EF4444',
      position = 'center-diag', // 'center-diag' | 'center' | 'top-left' | 'top-center' | 'top-right' | 'middle-left' | 'middle-right' | 'bottom-left' | 'bottom-center' | 'bottom-right' | 'repeat'
      offsetX = 0,
      offsetY = 0,
      // Image options
      imageBuffer = null,
      imageType = 'png',
      imageScale = 0.5,
      // Target pages
      targetPages = null // null for all, or array of page indices
    } = options;

    const { PDFDocument, StandardFonts, degrees, rgb } = PDFLib;
    const safeBuffer = this.cloneBuffer(arrayBuffer);
    const doc = await PDFDocument.load(safeBuffer, { ignoreEncryption: true });
    const pages = doc.getPages();

    // Prepare font if text watermark
    let font = null;
    let r = 0.8, g = 0.1, b = 0.1;
    if (type === 'text') {
      const fontMap = {
        'HelveticaBold': StandardFonts.HelveticaBold,
        'Helvetica': StandardFonts.Helvetica,
        'TimesRomanBold': StandardFonts.TimesRomanBold,
        'CourierBold': StandardFonts.CourierBold
      };
      font = await doc.embedFont(fontMap[fontFamily] || StandardFonts.HelveticaBold);
      const hex = colorHex.replace('#', '');
      r = parseInt(hex.substring(0, 2), 16) / 255 || 0.8;
      g = parseInt(hex.substring(2, 4), 16) / 255 || 0.1;
      b = parseInt(hex.substring(4, 6), 16) / 255 || 0.1;
    }

    // Prepare image if image watermark
    let embeddedImg = null;
    if (type === 'image' && imageBuffer) {
      const safeImgBuf = this.cloneBuffer(imageBuffer);
      if (imageType.includes('png')) {
        embeddedImg = await doc.embedPng(safeImgBuf);
      } else {
        embeddedImg = await doc.embedJpg(safeImgBuf);
      }
    }

    pages.forEach((page, pIdx) => {
      if (targetPages && !targetPages.includes(pIdx)) return;

      const { width, height } = page.getSize();

      if (type === 'text') {
        const textWidth = font.widthOfTextAtSize(text, fontSize);
        const textHeight = font.heightAtSize(fontSize);

        if (position === 'repeat') {
          // Repeated diagonal grid
          const stepX = Math.max(160, textWidth + 80);
          const stepY = 160;
          for (let x = -80; x < width + 120; x += stepX) {
            for (let y = -80; y < height + 120; y += stepY) {
              page.drawText(text, {
                x: x + offsetX,
                y: y + offsetY,
                size: fontSize * 0.7,
                font,
                color: rgb(r, g, b),
                opacity,
                rotate: degrees(angle)
              });
            }
          }
        } else {
          // Calculate 9-point anchor coordinate
          let cx = (width - textWidth) / 2;
          let cy = (height - textHeight) / 2;
          let rot = angle;

          if (position === 'center-diag') {
            rot = -45;
            cx = (width - textWidth) / 2;
            cy = (height - textHeight) / 2;
          } else if (position === 'center') {
            cx = (width - textWidth) / 2;
            cy = (height - textHeight) / 2;
          } else if (position === 'top-left') {
            cx = 40;
            cy = height - textHeight - 40;
          } else if (position === 'top-center') {
            cx = (width - textWidth) / 2;
            cy = height - textHeight - 40;
          } else if (position === 'top-right') {
            cx = width - textWidth - 40;
            cy = height - textHeight - 40;
          } else if (position === 'middle-left') {
            cx = 40;
            cy = (height - textHeight) / 2;
          } else if (position === 'middle-right') {
            cx = width - textWidth - 40;
            cy = (height - textHeight) / 2;
          } else if (position === 'bottom-left') {
            cx = 40;
            cy = 40;
          } else if (position === 'bottom-center') {
            cx = (width - textWidth) / 2;
            cy = 40;
          } else if (position === 'bottom-right') {
            cx = width - textWidth - 40;
            cy = 40;
          }

          page.drawText(text, {
            x: cx + offsetX,
            y: cy + offsetY,
            size: fontSize,
            font,
            color: rgb(r, g, b),
            opacity,
            rotate: degrees(rot)
          });
        }
      } else if (type === 'image' && embeddedImg) {
        // Image watermark
        const imgW = embeddedImg.width * imageScale;
        const imgH = embeddedImg.height * imageScale;

        let cx = (width - imgW) / 2;
        let cy = (height - imgH) / 2;

        if (position === 'top-left') {
          cx = 40;
          cy = height - imgH - 40;
        } else if (position === 'top-center') {
          cx = (width - imgW) / 2;
          cy = height - imgH - 40;
        } else if (position === 'top-right') {
          cx = width - imgW - 40;
          cy = height - imgH - 40;
        } else if (position === 'bottom-left') {
          cx = 40;
          cy = 40;
        } else if (position === 'bottom-center') {
          cx = (width - imgW) / 2;
          cy = 40;
        } else if (position === 'bottom-right') {
          cx = width - imgW - 40;
          cy = 40;
        }

        page.drawImage(embeddedImg, {
          x: cx + offsetX,
          y: cy + offsetY,
          width: imgW,
          height: imgH,
          opacity,
          rotate: degrees(angle)
        });
      }
    });

    const bytes = await doc.save({ useObjectStreams: false });
    return new Blob([bytes], { type: 'application/pdf' });
  }

  /**
   * Apply digital signature onto PDF with custom placement on any chosen page(s)
   */
  async applySignature(arrayBuffer, signaturesList) {
    // signaturesList: array of { pageIndex, signatureDataUrl, x, y, width, height }
    const { PDFDocument } = PDFLib;
    const safeBuffer = this.cloneBuffer(arrayBuffer);
    const doc = await PDFDocument.load(safeBuffer, { ignoreEncryption: true });
    const pages = doc.getPages();

    for (const item of signaturesList) {
      const page = pages[item.pageIndex];
      if (!page) continue;

      const base64Data = item.signatureDataUrl.split(',')[1];
      const sigBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      let sigImg;
      if (item.signatureDataUrl.startsWith('data:image/jpeg') || item.signatureDataUrl.startsWith('data:image/jpg')) {
        sigImg = await doc.embedJpg(sigBytes);
      } else {
        sigImg = await doc.embedPng(sigBytes);
      }

      page.drawImage(sigImg, {
        x: item.x,
        y: item.y,
        width: item.width,
        height: item.height
      });
    }

    const bytes = await doc.save({ useObjectStreams: false });
    return new Blob([bytes], { type: 'application/pdf' });
  }

  /**
   * Crop PDF Margins
   */
  async cropPages(arrayBuffer, margins) {
    const { top = 20, bottom = 20, left = 20, right = 20 } = margins;
    const { PDFDocument } = PDFLib;
    const safeBuffer = this.cloneBuffer(arrayBuffer);
    const doc = await PDFDocument.load(safeBuffer, { ignoreEncryption: true });
    const pages = doc.getPages();

    pages.forEach(page => {
      const { width, height } = page.getSize();
      const newWidth = Math.max(50, width - left - right);
      const newHeight = Math.max(50, height - top - bottom);
      page.setCropBox(left, bottom, newWidth, newHeight);
    });

    const bytes = await doc.save({ useObjectStreams: false });
    return new Blob([bytes], { type: 'application/pdf' });
  }

  /**
   * Convert Images (JPG/PNG/WebP) to PDF
   */
  async imagesToPDF(imageFileList, options = {}) {
    const { pageSize = 'A4', orientation = 'portrait', margin = 20 } = options;
    const { PDFDocument, PageSizes } = PDFLib;
    const doc = await PDFDocument.create();

    const standardSizes = {
      'A4': PageSizes.A4,
      'Letter': PageSizes.Letter,
      'Legal': PageSizes.Legal
    };

    for (const file of imageFileList) {
      const arrayBuffer = await this.readFileAsArrayBuffer(file);
      let image;
      const type = file.type || '';
      if (type.includes('png')) {
        image = await doc.embedPng(arrayBuffer);
      } else {
        image = await doc.embedJpg(arrayBuffer);
      }

      let pageWidth, pageHeight;
      if (pageSize === 'Fit') {
        pageWidth = image.width + margin * 2;
        pageHeight = image.height + margin * 2;
      } else {
        const baseSize = standardSizes[pageSize] || PageSizes.A4;
        pageWidth = orientation === 'landscape' ? baseSize[1] : baseSize[0];
        pageHeight = orientation === 'landscape' ? baseSize[0] : baseSize[1];
      }

      const page = doc.addPage([pageWidth, pageHeight]);
      const availWidth = pageWidth - margin * 2;
      const availHeight = pageHeight - margin * 2;

      const imgRatio = image.width / image.height;
      const pageRatio = availWidth / availHeight;

      let renderWidth = availWidth;
      let renderHeight = availHeight;

      if (imgRatio > pageRatio) {
        renderHeight = availWidth / imgRatio;
      } else {
        renderWidth = availHeight * imgRatio;
      }

      const x = margin + (availWidth - renderWidth) / 2;
      const y = margin + (availHeight - renderHeight) / 2;

      page.drawImage(image, {
        x,
        y,
        width: renderWidth,
        height: renderHeight
      });
    }

    const bytes = await doc.save({ useObjectStreams: false });
    return new Blob([bytes], { type: 'application/pdf' });
  }

  /**
   * Convert Images to Searchable OCR PDF (Image + Invisible Searchable & Selectable Text Layer)
   */
  async imagesToSearchablePdf(imageFileList, options = {}, onProgress) {
    const { pageSize = 'A4', orientation = 'portrait', margin = 20 } = options;
    const { PDFDocument, PageSizes, StandardFonts, rgb } = PDFLib;
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);

    const standardSizes = {
      'A4': PageSizes.A4,
      'Letter': PageSizes.Letter,
      'Legal': PageSizes.Legal
    };

    const total = imageFileList.length;
    for (let i = 0; i < total; i++) {
      const file = imageFileList[i];
      if (onProgress) onProgress((i / total) * 0.25, `Preparing image ${i + 1} of ${total}...`);

      const arrayBuffer = await this.readFileAsArrayBuffer(file);
      let image;
      const type = file.type || '';
      if (type.includes('png')) {
        image = await doc.embedPng(arrayBuffer);
      } else {
        image = await doc.embedJpg(arrayBuffer);
      }

      let pageWidth, pageHeight;
      if (pageSize === 'Fit') {
        pageWidth = image.width + margin * 2;
        pageHeight = image.height + margin * 2;
      } else {
        const baseSize = standardSizes[pageSize] || PageSizes.A4;
        pageWidth = orientation === 'landscape' ? baseSize[1] : baseSize[0];
        pageHeight = orientation === 'landscape' ? baseSize[0] : baseSize[1];
      }

      const page = doc.addPage([pageWidth, pageHeight]);
      const availWidth = pageWidth - margin * 2;
      const availHeight = pageHeight - margin * 2;

      const imgRatio = image.width / image.height;
      const pageRatio = availWidth / availHeight;

      let renderWidth = availWidth;
      let renderHeight = availHeight;

      if (imgRatio > pageRatio) {
        renderHeight = availWidth / imgRatio;
      } else {
        renderWidth = availHeight * imgRatio;
      }

      const x = margin + (availWidth - renderWidth) / 2;
      const y = margin + (availHeight - renderHeight) / 2;

      page.drawImage(image, {
        x,
        y,
        width: renderWidth,
        height: renderHeight
      });

      // Optical Character Recognition (OCR) for Searchable Text Layer
      try {
        if (window.Tesseract) {
          if (onProgress) onProgress(0.25 + (i / total) * 0.65, `Running OCR text recognition on image ${i + 1}...`);
          const res = await Tesseract.recognize(file, 'eng', {
            logger: m => {
              if (m.status === 'recognizing text' && onProgress) {
                const prog = 0.25 + ((i + m.progress) / total) * 0.65;
                onProgress(prog, `OCR page ${i + 1}: ${Math.round(m.progress * 100)}%`);
              }
            }
          });

          if (res && res.data && res.data.words) {
            const scaleX = renderWidth / image.width;
            const scaleY = renderHeight / image.height;

            for (const w of res.data.words) {
              if (!w.text || !w.bbox) continue;
              const bbox = w.bbox;
              const wordX = x + (bbox.x0 * scaleX);
              const wordH = (bbox.y1 - bbox.y0) * scaleY;
              // In PDF coordinates, origin is bottom-left; image top-left is at y + renderHeight
              const wordY = y + renderHeight - (bbox.y1 * scaleY);
              const fontSize = Math.max(7, Math.min(60, wordH * 0.85));

              try {
                page.drawText(w.text, {
                  x: wordX,
                  y: wordY,
                  size: fontSize,
                  font,
                  color: rgb(0, 0, 0),
                  opacity: 0 // Invisible overlay: completely selectable, copyable, and searchable (Ctrl+F)
                });
              } catch (_) {}
            }
          }
        }
      } catch (ocrErr) {
        console.warn('OCR error on image:', ocrErr);
      }
    }

    if (onProgress) onProgress(0.95, 'Finalizing Searchable OCR PDF...');
    const bytes = await doc.save({ useObjectStreams: false });
    return new Blob([bytes], { type: 'application/pdf' });
  }

  /**
   * Extract top header logo / emblem / graphic from an image file
   */
  async extractHeaderLogo(file, topRatio = 0.20) {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        try {
          const cropH = Math.max(50, Math.floor(img.height * topRatio));
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = cropH;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, img.width, cropH, 0, 0, img.width, cropH);

          canvas.toBlob((blob) => {
            URL.revokeObjectURL(url);
            if (!blob) return resolve(null);
            blob.arrayBuffer().then(buf => resolve({
              buffer: buf,
              width: img.width,
              height: cropH,
              aspectRatio: img.width / cropH
            })).catch(() => resolve(null));
          }, 'image/png');
        } catch (_) {
          URL.revokeObjectURL(url);
          resolve(null);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };
      img.src = url;
    });
  }

  /**
   * Convert Images to Pure Digital Text PDF with Embedded Logo/Photos & Clean Vector Text
   */
  async imagesToTextPdf(imageFileList, options = {}, onProgress) {
    const {
      pageSize = 'A4',
      orientation = 'portrait',
      margin = 40,
      includeLogo = true,
      logoRatio = 0.20
    } = options;

    const { PDFDocument, PageSizes, StandardFonts, rgb } = PDFLib;
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);

    const standardSizes = {
      'A4': PageSizes.A4,
      'Letter': PageSizes.Letter,
      'Legal': PageSizes.Legal
    };

    const base = standardSizes[pageSize] || PageSizes.A4;
    const pageWidth = orientation === 'landscape' ? base[1] : base[0];
    const pageHeight = orientation === 'landscape' ? base[0] : base[1];
    const usableWidth = pageWidth - margin * 2;
    const fontSize = 11;
    const lineHeight = 16;

    const total = imageFileList.length;

    for (let i = 0; i < total; i++) {
      const file = imageFileList[i];
      if (onProgress) onProgress((i / total) * 0.35, `Processing image & header logo ${i + 1} of ${total}...`);

      // 1. Extract Header Logo / Graphic crop if requested
      let logoData = null;
      if (includeLogo) {
        logoData = await this.extractHeaderLogo(file, logoRatio);
      }

      // 2. Extract OCR Text
      if (onProgress) onProgress(0.35 + (i / total) * 0.55, `Extracting digital text from image ${i + 1} of ${total}...`);
      let pageText = '';
      if (window.Tesseract) {
        const res = await Tesseract.recognize(file, 'eng', {
          logger: m => {
            if (m.status === 'recognizing text' && onProgress) {
              const prog = 0.35 + ((i + m.progress) / total) * 0.55;
              onProgress(prog, `OCR page ${i + 1}: ${Math.round(m.progress * 100)}%`);
            }
          }
        });
        if (res && res.data && res.data.text) {
          pageText = res.data.text;
        }
      }

      if (!pageText.trim()) {
        pageText = `(No text detected on image ${i + 1})`;
      }

      // 3. Create PDF Page
      let currentPage = doc.addPage([pageWidth, pageHeight]);
      let currentY = pageHeight - margin;

      // 4. Draw Logo / Header at top of page
      if (logoData && logoData.buffer) {
        try {
          const embeddedLogo = await doc.embedPng(logoData.buffer);
          const maxLogoH = Math.min(120, Math.round(pageHeight * 0.17));
          let logoW = usableWidth;
          let logoH = logoW / logoData.aspectRatio;
          if (logoH > maxLogoH) {
            logoH = maxLogoH;
            logoW = logoH * logoData.aspectRatio;
          }
          const logoX = margin + (usableWidth - logoW) / 2;
          const logoY = pageHeight - margin - logoH;

          currentPage.drawImage(embeddedLogo, {
            x: logoX,
            y: logoY,
            width: logoW,
            height: logoH
          });

          currentY = logoY - 16;

          // Elegant dividing rule below logo
          currentPage.drawLine({
            start: { x: margin, y: currentY + 8 },
            end: { x: pageWidth - margin, y: currentY + 8 },
            thickness: 0.5,
            color: rgb(0.85, 0.85, 0.85)
          });
        } catch (logoErr) {
          console.warn('Error embedding logo:', logoErr);
          currentY = pageHeight - margin - 20;
        }
      } else {
        currentY = pageHeight - margin - 20;
      }

      // 5. Typeset Clean Digital Vector Text
      const lines = pageText.split('\n');

      for (const rawLine of lines) {
        if (!rawLine.trim()) {
          currentY -= 8;
          continue;
        }

        const words = rawLine.split(/\s+/);
        let lineBuf = '';

        for (const w of words) {
          const testLine = lineBuf ? `${lineBuf} ${w}` : w;
          let testWidth = usableWidth + 1;
          try {
            testWidth = font.widthOfTextAtSize(testLine, fontSize);
          } catch (_) {
            testWidth = testLine.length * (fontSize * 0.55);
          }

          if (testWidth > usableWidth && lineBuf) {
            if (currentY < margin + lineHeight) {
              currentPage = doc.addPage([pageWidth, pageHeight]);
              currentY = pageHeight - margin - 20;
            }
            try {
              currentPage.drawText(lineBuf, {
                x: margin,
                y: currentY,
                size: fontSize,
                font,
                color: rgb(0.12, 0.12, 0.12)
              });
            } catch (_) {}
            currentY -= lineHeight;
            lineBuf = w;
          } else {
            lineBuf = testLine;
          }
        }

        if (lineBuf) {
          if (currentY < margin + lineHeight) {
            currentPage = doc.addPage([pageWidth, pageHeight]);
            currentY = pageHeight - margin - 20;
          }
          try {
            currentPage.drawText(lineBuf, {
              x: margin,
              y: currentY,
              size: fontSize,
              font,
              color: rgb(0.12, 0.12, 0.12)
            });
          } catch (_) {}
          currentY -= lineHeight;
        }
      }
    }

    if (onProgress) onProgress(0.95, 'Finalizing Digital Text Document...');
    const bytes = await doc.save({ useObjectStreams: false });
    return new Blob([bytes], { type: 'application/pdf' });
  }

  /**
   * Apply Redactions (blackout boxes) permanently
   */
  async applyRedactions(arrayBuffer, redactionsList) {
    const { PDFDocument, rgb } = PDFLib;
    const safeBuffer = this.cloneBuffer(arrayBuffer);
    const doc = await PDFDocument.load(safeBuffer, { ignoreEncryption: true });
    const pages = doc.getPages();

    redactionsList.forEach(red => {
      const page = pages[red.pageIndex];
      if (page) {
        page.drawRectangle({
          x: red.x,
          y: red.y,
          width: red.width,
          height: red.height,
          color: rgb(0, 0, 0),
          borderColor: rgb(0, 0, 0)
        });
      }
    });

    const bytes = await doc.save({ useObjectStreams: false });
    return new Blob([bytes], { type: 'application/pdf' });
  }

  // --- PDF.js Page Rendering & Conversion ---

  async getPdfJsDoc(arrayBuffer) {
    this.initPdfJs();
    // CLONE the buffer so PDF.js worker transfer NEVER detaches the original ArrayBuffer!
    const clonedData = this.cloneBuffer(arrayBuffer);
    const loadingTask = window.pdfjsLib.getDocument({ data: clonedData });
    return await loadingTask.promise;
  }

  async renderPageToCanvas(pdfDoc, pageNumber, canvas, targetWidth = 300) {
    const page = await pdfDoc.getPage(pageNumber);
    const unscaledViewport = page.getViewport({ scale: 1.0 });
    const scale = targetWidth / unscaledViewport.width;
    const viewport = page.getViewport({ scale });

    // HiDPI Supersampling: renders at at least 2x device pixel ratio so text stays razor sharp when zooming
    const dpr = Math.max(2.0, window.devicePixelRatio || 1);
    canvas.width = Math.floor(viewport.width * dpr);
    canvas.height = Math.floor(viewport.height * dpr);
    canvas.style.width = `${Math.floor(viewport.width)}px`;
    canvas.style.height = `${Math.floor(viewport.height)}px`;

    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const renderContext = {
      canvasContext: ctx,
      viewport: viewport
    };
    await page.render(renderContext).promise;
    return canvas;
  }

  async pdfToImages(arrayBuffer, format = 'image/jpeg', scale = 2.0, onProgress) {
    const pdfDoc = await this.getPdfJsDoc(arrayBuffer);
    const totalPages = pdfDoc.numPages;
    const results = [];

    for (let i = 1; i <= totalPages; i++) {
      if (onProgress) onProgress((i / totalPages), `Rendering page ${i} of ${totalPages}...`);
      const page = await pdfDoc.getPage(i);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      await page.render({ canvasContext: ctx, viewport }).promise;

      const blob = await new Promise(resolve => {
        canvas.toBlob(resolve, format, 0.95);
      });

      const ext = format === 'image/png' ? 'png' : 'jpg';
      results.push({
        pageNum: i,
        name: `page_${i}.${ext}`,
        blob,
        dataUrl: canvas.toDataURL(format, 0.95)
      });
    }

    return results;
  }

  async extractText(arrayBuffer, onProgress) {
    const pdfDoc = await this.getPdfJsDoc(arrayBuffer);
    const totalPages = pdfDoc.numPages;
    let fullText = '';

    for (let i = 1; i <= totalPages; i++) {
      if (onProgress) onProgress((i / totalPages), `Extracting text from page ${i} of ${totalPages}...`);
      const page = await pdfDoc.getPage(i);
      const textContent = await page.getTextContent();
      const pageStr = textContent.items.map(item => item.str).join(' ');
      fullText += `--- Page ${i} ---\n` + pageStr + '\n\n';
    }

    return fullText;
  }

  /**
   * Apply Content Edits (Sentence Replacement, Whiteout, Text Insertion, Image Replacement)
   */
  async applyContentEdits(arrayBuffer, editsList) {
    const { PDFDocument, StandardFonts, rgb } = PDFLib;
    const safeBuffer = this.cloneBuffer(arrayBuffer);
    const doc = await PDFDocument.load(safeBuffer, { ignoreEncryption: true });
    const pages = doc.getPages();

    const fontMap = {
      'Helvetica': await doc.embedFont(StandardFonts.Helvetica),
      'HelveticaBold': await doc.embedFont(StandardFonts.HelveticaBold),
      'TimesRoman': await doc.embedFont(StandardFonts.TimesRoman),
      'TimesRomanBold': await doc.embedFont(StandardFonts.TimesRomanBold),
      'Courier': await doc.embedFont(StandardFonts.Courier),
      'CourierBold': await doc.embedFont(StandardFonts.CourierBold)
    };

    for (const edit of editsList) {
      const page = pages[edit.pageIndex];
      if (!page) continue;

      if (edit.type === 'whiteout') {
        // Eraser / Whiteout patch
        page.drawRectangle({
          x: edit.x,
          y: edit.y,
          width: edit.width,
          height: edit.height,
          color: rgb(1, 1, 1) // Clean opaque white
        });
      } else if (edit.type === 'text' || edit.type === 'replace') {
        // Cover old sentence with whiteout background if requested
        if (edit.bgWhiteout !== false) {
          page.drawRectangle({
            x: edit.x - 2,
            y: edit.y - 2,
            width: edit.width + 4,
            height: edit.height + 4,
            color: rgb(1, 1, 1)
          });
        }

        const selectedFont = fontMap[edit.font] || fontMap['Helvetica'];
        let r = 0, g = 0, b = 0;
        if (edit.color && edit.color.startsWith('#')) {
          r = parseInt(edit.color.slice(1, 3), 16) / 255;
          g = parseInt(edit.color.slice(3, 5), 16) / 255;
          b = parseInt(edit.color.slice(5, 7), 16) / 255;
        }

        const textToDraw = edit.newText || edit.text || '';
        const fontSize = edit.size || 12;

        page.drawText(textToDraw, {
          x: edit.x,
          y: edit.y + 2,
          size: fontSize,
          font: selectedFont,
          color: rgb(r, g, b)
        });
      } else if (edit.type === 'image' && edit.imageBuffer) {
        let embeddedImg;
        if (edit.imageType?.includes('png')) {
          embeddedImg = await doc.embedPng(edit.imageBuffer);
        } else {
          embeddedImg = await doc.embedJpg(edit.imageBuffer);
        }
        page.drawImage(embeddedImg, {
          x: edit.x,
          y: edit.y,
          width: edit.width,
          height: edit.height
        });
      }
    }

    const bytes = await doc.save({ useObjectStreams: false });
    return new Blob([bytes], { type: 'application/pdf' });
  }

  // --- JSZip Helper ---
  async createZip(files, onProgress) {
    const zip = new window.JSZip();
    files.forEach(f => {
      zip.file(f.name, f.blob);
    });
    return await zip.generateAsync({ type: 'blob' }, metadata => {
      if (onProgress) onProgress(metadata.percent / 100, `Packing ZIP: ${Math.round(metadata.percent)}%`);
    });
  }
}

window.pdfEngine = new PDFEngine();
