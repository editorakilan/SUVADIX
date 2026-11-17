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
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  // --- PDF-Lib Core Manipulations ---

  /**
   * Lossless Merge of multiple PDFs
   */
  async mergePDFs(arrayBuffers, onProgress) {
    const { PDFDocument } = PDFLib;
    const mergedDoc = await PDFDocument.create();

    const total = arrayBuffers.length;
    for (let i = 0; i < total; i++) {
      if (onProgress) onProgress((i / total) * 0.9, `Merging file ${i + 1} of ${total}...`);
      const srcDoc = await PDFDocument.load(arrayBuffers[i], { ignoreEncryption: true });
      const indices = srcDoc.getPageIndices();
      const copiedPages = await mergedDoc.copyPages(srcDoc, indices);
      copiedPages.forEach(p => mergedDoc.addPage(p));
    }

    if (onProgress) onProgress(0.95, 'Finalizing merged document...');
    const pdfBytes = await mergedDoc.save();
    if (onProgress) onProgress(1.0, 'Done!');
    return new Blob([pdfBytes], { type: 'application/pdf' });
  }

  /**
   * Split PDF into separate pages or ranges
   */
  async splitPDF(arrayBuffer, rangeStr, onProgress) {
    const { PDFDocument } = PDFLib;
    const srcDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const totalPages = srcDoc.getPageCount();

    // Mode A: Split each page individually
    if (!rangeStr || rangeStr.trim().toLowerCase() === 'all') {
      const results = [];
      for (let i = 0; i < totalPages; i++) {
        if (onProgress) onProgress((i / totalPages), `Splitting page ${i + 1} of ${totalPages}...`);
        const subDoc = await PDFDocument.create();
        const [copied] = await subDoc.copyPages(srcDoc, [i]);
        subDoc.addPage(copied);
        const bytes = await subDoc.save();
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
        const bytes = await subDoc.save();
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
    const srcDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
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
    const bytes = await newDoc.save();
    return new Blob([bytes], { type: 'application/pdf' });
  }

  /**
   * Extract specified pages
   */
  async extractPages(arrayBuffer, pageIndicesToExtract) {
    const { PDFDocument } = PDFLib;
    const srcDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    if (!pageIndicesToExtract || pageIndicesToExtract.length === 0) {
      throw new Error('Please select at least one page to extract.');
    }
    const newDoc = await PDFDocument.create();
    const copiedPages = await newDoc.copyPages(srcDoc, pageIndicesToExtract);
    copiedPages.forEach(p => newDoc.addPage(p));
    const bytes = await newDoc.save();
    return new Blob([bytes], { type: 'application/pdf' });
  }

  /**
   * Reorganize pages (order, rotation, removals)
   */
  async organizePages(arrayBuffer, pageConfigList) {
    // pageConfigList: array of { originalIndex, rotation }
    const { PDFDocument, degrees } = PDFLib;
    const srcDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
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

    const bytes = await newDoc.save();
    return new Blob([bytes], { type: 'application/pdf' });
  }

  /**
   * Rotate pages by 90/180/270 degrees
   */
  async rotatePages(arrayBuffer, rotationAngle, targetIndices = null) {
    const { PDFDocument, degrees } = PDFLib;
    const doc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const pages = doc.getPages();

    pages.forEach((page, idx) => {
      if (!targetIndices || targetIndices.includes(idx)) {
        const cur = page.getRotation().angle;
        page.setRotation(degrees(cur + rotationAngle));
      }
    });

    const bytes = await doc.save();
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
    const doc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
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

    const bytes = await doc.save();
    return new Blob([bytes], { type: 'application/pdf' });
  }

  /**
   * Add Text Watermark
   */
  async addWatermark(arrayBuffer, options = {}) {
    const {
      text = 'CONFIDENTIAL',
      fontSize = 48,
      opacity = 0.25,
      angle = -45,
      colorHex = '#EF4444',
      repeat = false
    } = options;

    const { PDFDocument, StandardFonts, degrees, rgb } = PDFLib;
    const doc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const font = await doc.embedFont(StandardFonts.HelveticaBold);
    const pages = doc.getPages();

    // Parse hex color
    const hex = colorHex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) / 255 || 0.8;
    const g = parseInt(hex.substring(2, 4), 16) / 255 || 0.1;
    const b = parseInt(hex.substring(4, 6), 16) / 255 || 0.1;

    pages.forEach(page => {
      const { width, height } = page.getSize();
      const textWidth = font.widthOfTextAtSize(text, fontSize);

      if (repeat) {
        // Repeated grid pattern
        const stepX = textWidth + 120;
        const stepY = 160;
        for (let x = -50; x < width + 100; x += stepX) {
          for (let y = -50; y < height + 100; y += stepY) {
            page.drawText(text, {
              x,
              y,
              size: fontSize * 0.7,
              font,
              color: rgb(r, g, b),
              opacity,
              rotate: degrees(angle)
            });
          }
        }
      } else {
        // Single centered watermark
        page.drawText(text, {
          x: width / 2 - textWidth / 2,
          y: height / 2,
          size: fontSize,
          font,
          color: rgb(r, g, b),
          opacity,
          rotate: degrees(angle)
        });
      }
    });

    const bytes = await doc.save();
    return new Blob([bytes], { type: 'application/pdf' });
  }

  /**
   * Crop PDF Margins
   */
  async cropPages(arrayBuffer, margins) {
    const { top = 20, bottom = 20, left = 20, right = 20 } = margins;
    const { PDFDocument } = PDFLib;
    const doc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const pages = doc.getPages();

    pages.forEach(page => {
      const { width, height } = page.getSize();
      const newWidth = Math.max(50, width - left - right);
      const newHeight = Math.max(50, height - top - bottom);
      page.setCropBox(left, bottom, newWidth, newHeight);
    });

    const bytes = await doc.save();
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
        // Default to JPG embed
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

      // Fit aspect ratio
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

    const bytes = await doc.save();
    return new Blob([bytes], { type: 'application/pdf' });
  }

  /**
   * Apply digital signature onto PDF
   */
  async applySignature(arrayBuffer, pageIndex, signaturePngDataUrl, rect) {
    const { PDFDocument } = PDFLib;
    const doc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const pages = doc.getPages();
    const page = pages[pageIndex] || pages[0];

    const base64Data = signaturePngDataUrl.split(',')[1];
    const signatureBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    const signatureImage = await doc.embedPng(signatureBytes);

    const { width: pWidth, height: pHeight } = page.getSize();
    // Default or user rect: { x, y, width, height }
    const sigWidth = rect?.width || 150;
    const sigHeight = rect?.height || 60;
    const sigX = rect?.x || (pWidth - sigWidth - 40);
    const sigY = rect?.y || 40;

    page.drawImage(signatureImage, {
      x: sigX,
      y: sigY,
      width: sigWidth,
      height: sigHeight
    });

    const bytes = await doc.save();
    return new Blob([bytes], { type: 'application/pdf' });
  }

  /**
   * Apply Redactions (blackout boxes) permanently
   */
  async applyRedactions(arrayBuffer, redactionsList) {
    // redactionsList: [{ pageIndex, x, y, width, height }]
    const { PDFDocument, rgb } = PDFLib;
    const doc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
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

    const bytes = await doc.save();
    return new Blob([bytes], { type: 'application/pdf' });
  }

  // --- PDF.js Page Rendering & Conversion ---

  async getPdfJsDoc(arrayBuffer) {
    this.initPdfJs();
    const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
    return await loadingTask.promise;
  }

  async renderPageToCanvas(pdfDoc, pageNumber, canvas, targetWidth = 300) {
    const page = await pdfDoc.getPage(pageNumber);
    const unscaledViewport = page.getViewport({ scale: 1.0 });
    const scale = targetWidth / unscaledViewport.width;
    const viewport = page.getViewport({ scale });

    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');

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

      // Fill white background for JPEG
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
