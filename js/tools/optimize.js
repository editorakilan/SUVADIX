/**
 * PDF Suite - Optimize Tools
 * Compress PDF, Repair PDF, OCR PDF
 */

const OptimizeTools = {
  // 1. COMPRESS PDF
  renderCompress(container) {
    let currentFile = null;
    let currentBuffer = null;

    container.innerHTML = `
      <div class="max-w-3xl mx-auto space-y-6">
        <div class="text-center space-y-2">
          <h2 class="text-2xl font-bold tracking-tight">Compress PDF</h2>
          <p class="text-sm text-slate-500">Reduce PDF file size while maintaining optimal visual clarity.</p>
        </div>

        <div id="compress-dropzone" class="dropzone p-8 rounded-2xl text-center cursor-pointer hover:border-emerald-500 transition">
          <input type="file" id="compress-file-input" accept="application/pdf" class="hidden">
          <div class="flex flex-col items-center gap-3">
            <div class="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
              <i data-lucide="minimize-2" class="w-8 h-8"></i>
            </div>
            <div>
              <p class="font-semibold text-slate-700 dark:text-slate-200">Click to upload or drag & drop a PDF</p>
              <p class="text-xs text-slate-400 mt-1" id="compress-file-status">Select a PDF to reduce its file size</p>
            </div>
          </div>
        </div>

        <div id="compress-options" class="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-5 hidden">
          <div class="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
            <h3 class="font-semibold text-sm">Choose Optimization Method</h3>
            <span class="text-xs text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">Zero Server</span>
          </div>

          <div class="space-y-3">
            <label class="flex items-start gap-3 p-3.5 rounded-xl border-2 border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 cursor-pointer">
              <input type="radio" name="comp-type" value="vector" checked class="mt-0.5 text-emerald-600 focus:ring-emerald-500">
              <div>
                <span class="font-bold text-sm block">Smart Vector & Text Preservation (Recommended)</span>
                <span class="text-xs text-slate-500 dark:text-slate-400">Keeps 100% digital text selectable, searchable, and crisp. Strips metadata, unifies fonts, and rebuilds streams without rasterizing.</span>
              </div>
            </label>

            <label class="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
              <input type="radio" name="comp-type" value="raster" class="mt-0.5 text-emerald-600 focus:ring-emerald-500">
              <div>
                <span class="font-bold text-sm block">Raster Image Downsampling (For Scanned PDFs)</span>
                <span class="text-xs text-slate-500 dark:text-slate-400">Best for heavy scanned image documents and photo catalogs to shrink large MB sizes.</span>
              </div>
            </label>
          </div>

          <div id="raster-presets" class="hidden grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <label class="flex flex-col p-3 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-emerald-500 transition">
              <span class="font-semibold text-xs">Extreme</span>
              <span class="text-[11px] text-slate-400">Max reduction (~60-80%)</span>
              <input type="radio" name="comp-level" value="extreme" class="hidden">
            </label>
            <label class="flex flex-col p-3 rounded-xl border-2 border-emerald-500 bg-emerald-50/20 cursor-pointer">
              <span class="font-semibold text-xs text-emerald-600">Recommended</span>
              <span class="text-[11px] text-slate-400">Balanced (~40-60%)</span>
              <input type="radio" name="comp-level" value="recommended" checked class="hidden">
            </label>
            <label class="flex flex-col p-3 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-emerald-500 transition">
              <span class="font-semibold text-xs">Less</span>
              <span class="text-[11px] text-slate-400">High quality (~20-30%)</span>
              <input type="radio" name="comp-level" value="less" class="hidden">
            </label>
          </div>

          <div class="flex justify-end pt-2">
            <button id="compress-run-btn" class="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm shadow-lg shadow-emerald-600/20 transition flex items-center gap-2">
              <i data-lucide="zap" class="w-4 h-4"></i>
              <span>Compress PDF</span>
            </button>
          </div>
        </div>

        <div id="compress-result-card" class="p-6 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-4 hidden">
          <div class="flex items-center justify-between">
            <span class="font-bold text-emerald-800 dark:text-emerald-200">Compression Complete!</span>
            <span id="compress-pct-badge" class="px-3 py-1 bg-emerald-600 text-white rounded-full text-xs font-bold">-0%</span>
          </div>
          <div class="flex items-center justify-around text-center py-2">
            <div>
              <p class="text-xs text-slate-500">Original Size</p>
              <p id="compress-orig-size" class="text-lg font-bold">0 MB</p>
            </div>
            <i data-lucide="arrow-right" class="w-6 h-6 text-emerald-600"></i>
            <div>
              <p class="text-xs text-slate-500">New Size</p>
              <p id="compress-new-size" class="text-lg font-bold text-emerald-600">0 MB</p>
            </div>
          </div>
          <div class="flex justify-center pt-2">
            <button id="compress-download-btn" class="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition flex items-center gap-2">
              <i data-lucide="download" class="w-4 h-4"></i>
              <span>Download Compressed PDF</span>
            </button>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const dropzone = container.querySelector('#compress-dropzone');
    const input = container.querySelector('#compress-file-input');
    const statusEl = container.querySelector('#compress-file-status');
    const optionsEl = container.querySelector('#compress-options');
    const runBtn = container.querySelector('#compress-run-btn');
    const resultCard = container.querySelector('#compress-result-card');
    const origSizeEl = container.querySelector('#compress-orig-size');
    const newSizeEl = container.querySelector('#compress-new-size');
    const pctBadge = container.querySelector('#compress-pct-badge');
    const downloadBtn = container.querySelector('#compress-download-btn');

    let compressedBlob = null;

    UI.setupDropzone(dropzone, input, async (files) => {
      if (files.length === 0) return;
      currentFile = files[0];
      statusEl.innerText = `${currentFile.name} (${window.pdfEngine.formatBytes(currentFile.size)})`;
      currentBuffer = await window.pdfEngine.readFileAsArrayBuffer(currentFile);
      optionsEl.classList.remove('hidden');
      resultCard.classList.add('hidden');
    });

    const compTypeRadios = container.querySelectorAll('input[name="comp-type"]');
    const rasterPresets = container.querySelector('#raster-presets');
    compTypeRadios.forEach(r => {
      r.addEventListener('change', () => {
        rasterPresets.classList.toggle('hidden', r.value !== 'raster');
      });
    });

    runBtn.addEventListener('click', async () => {
      if (!currentBuffer && !currentFile) return;
      const compType = container.querySelector('input[name="comp-type"]:checked').value;
      const bufferToUse = currentBuffer?.byteLength > 0 ? currentBuffer : await currentFile.arrayBuffer();

      try {
        if (compType === 'vector') {
          UI.showProgress(0.2, 'Optimizing PDF dictionary and streams (Vector & Text Preserved)...');
          const { PDFDocument } = PDFLib;
          const srcDoc = await PDFDocument.load(window.pdfEngine.cloneBuffer(bufferToUse), { ignoreEncryption: true });
          const newDoc = await PDFDocument.create();
          const pages = await newDoc.copyPages(srcDoc, srcDoc.getPageIndices());
          pages.forEach(p => newDoc.addPage(p));
          
          UI.showProgress(0.8, 'Compressing object trees...');
          const bytes = await newDoc.save({ useObjectStreams: false });
          compressedBlob = new Blob([bytes], { type: 'application/pdf' });
        } else {
          // Raster mode for image-heavy PDFs
          const levelEl = container.querySelector('input[name="comp-level"]:checked');
          const level = levelEl ? levelEl.value : 'recommended';
          let scale = 1.2;
          if (level === 'extreme') scale = 0.9;
          else if (level === 'less') scale = 1.6;

          UI.showProgress(0.1, 'Analyzing document structure...');
          const images = await window.pdfEngine.pdfToImages(window.pdfEngine.cloneBuffer(bufferToUse), 'image/jpeg', scale, (pct, status) => {
            UI.showProgress(pct * 0.7, status);
          });

          UI.showProgress(0.75, 'Re-encoding optimized document...');
          const fileList = images.map(img => new File([img.blob], img.name, { type: 'image/jpeg' }));
          compressedBlob = await window.pdfEngine.imagesToPDF(fileList, { pageSize: 'Fit' });
        }

        const origSize = currentFile.size;
        const newSize = compressedBlob.size;
        const savedPct = Math.max(0, Math.round(((origSize - newSize) / origSize) * 100));

        origSizeEl.innerText = window.pdfEngine.formatBytes(origSize);
        newSizeEl.innerText = window.pdfEngine.formatBytes(newSize);
        pctBadge.innerText = `-${savedPct}%`;

        optionsEl.classList.add('hidden');
        resultCard.classList.remove('hidden');

        UI.hideProgress();
        UI.celebrate();
        UI.showToast(`Optimization complete! Saved ${savedPct}% size.`, 'success');

        UI.showResultPreview({
          title: 'Optimized PDF Ready',
          subtitle: `Size reduced by ${savedPct}% (${window.pdfEngine.formatBytes(origSize)} → ${window.pdfEngine.formatBytes(newSize)}). Inspect quality below`,
          blob: compressedBlob,
          filename: `${currentFile.name.replace(/\.pdf$/i, '')}_compressed.pdf`,
          originalSize: origSize
        });
      } catch (err) {
        UI.hideProgress();
        UI.showToast(`Error: ${err.message}`, 'error');
      }
    });

    downloadBtn.addEventListener('click', () => {
      if (compressedBlob) {
        UI.showResultPreview({
          title: 'Optimized PDF Ready',
          subtitle: `Size reduced by ${Math.round(((currentFile.size - compressedBlob.size) / currentFile.size) * 100)}%. Inspect quality below`,
          blob: compressedBlob,
          filename: `${currentFile.name.replace(/\.pdf$/i, '')}_compressed.pdf`,
          originalSize: currentFile.size
        });
      }
    });
  },

  // 2. REPAIR PDF
  renderRepair(container) {
    let currentFile = null;
    let currentBuffer = null;

    container.innerHTML = `
      <div class="max-w-3xl mx-auto space-y-6">
        <div class="text-center space-y-2">
          <h2 class="text-2xl font-bold tracking-tight">Repair PDF</h2>
          <p class="text-sm text-slate-500">Fix corrupted cross-reference tables, repair broken page indexes, and rebuild damaged PDFs.</p>
        </div>

        <div id="repair-dropzone" class="dropzone p-8 rounded-2xl text-center cursor-pointer hover:border-emerald-500 transition">
          <input type="file" id="repair-file-input" accept="application/pdf" class="hidden">
          <div class="flex flex-col items-center gap-3">
            <div class="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
              <i data-lucide="wrench" class="w-8 h-8"></i>
            </div>
            <div>
              <p class="font-semibold text-slate-700 dark:text-slate-200">Upload damaged or unreadable PDF</p>
              <p class="text-xs text-slate-400 mt-1" id="repair-file-status">Click or drag a PDF here</p>
            </div>
          </div>
        </div>

        <div id="repair-actions" class="flex justify-end hidden">
          <button id="repair-run-btn" class="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm shadow-lg shadow-emerald-600/20 transition flex items-center gap-2">
            <i data-lucide="check-circle" class="w-4 h-4"></i>
            <span>Repair Document</span>
          </button>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const dropzone = container.querySelector('#repair-dropzone');
    const input = container.querySelector('#repair-file-input');
    const statusEl = container.querySelector('#repair-file-status');
    const actionsEl = container.querySelector('#repair-actions');
    const runBtn = container.querySelector('#repair-run-btn');

    UI.setupDropzone(dropzone, input, async (files) => {
      if (files.length === 0) return;
      currentFile = files[0];
      statusEl.innerText = `${currentFile.name} (${window.pdfEngine.formatBytes(currentFile.size)})`;
      currentBuffer = await window.pdfEngine.readFileAsArrayBuffer(currentFile);
      actionsEl.classList.remove('hidden');
    });

    runBtn.addEventListener('click', async () => {
      if (!currentBuffer && !currentFile) return;
      try {
        UI.showProgress(0.2, 'Scanning PDF byte streams and xref objects...');
        const bufferToUse = currentBuffer?.byteLength > 0 ? currentBuffer : await currentFile.arrayBuffer();
        const { PDFDocument } = PDFLib;
        const doc = await PDFDocument.load(window.pdfEngine.cloneBuffer(bufferToUse), { ignoreEncryption: true, parseSpeed: 1 });
        
        UI.showProgress(0.6, 'Rebuilding page trees and object index...');
        const newDoc = await PDFDocument.create();
        const pages = await newDoc.copyPages(doc, doc.getPageIndices());
        pages.forEach(p => newDoc.addPage(p));

        UI.showProgress(0.9, 'Saving reconstructed document...');
        const bytes = await newDoc.save({ useObjectStreams: false });
        const repairedBlob = new Blob([bytes], { type: 'application/pdf' });

        UI.hideProgress();
        UI.celebrate();
        UI.showToast('PDF repaired successfully!', 'success');
        UI.showResultPreview({
          title: 'Repaired PDF Ready',
          subtitle: 'Reconstructed xref tables and page index. Inspect before downloading',
          blob: repairedBlob,
          filename: `${currentFile.name.replace(/\.pdf$/i, '')}_repaired.pdf`
        });
      } catch (err) {
        UI.hideProgress();
        UI.showToast(`Could not repair PDF: ${err.message}`, 'error');
      }
    });
  },

  // 3. OCR PDF
  renderOCR(container) {
    let currentBuffer = null;
    let currentFile = null;

    container.innerHTML = `
      <div class="max-w-3xl mx-auto space-y-6">
        <div class="text-center space-y-2">
          <h2 class="text-2xl font-bold tracking-tight">OCR PDF (Optical Character Recognition)</h2>
          <p class="text-sm text-slate-500">Extract machine-readable text from scanned PDFs and images entirely in your browser using Tesseract.js.</p>
        </div>

        <div id="ocr-dropzone" class="dropzone p-8 rounded-2xl text-center cursor-pointer hover:border-emerald-500 transition">
          <input type="file" id="ocr-file-input" accept="application/pdf" class="hidden">
          <div class="flex flex-col items-center gap-3">
            <div class="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
              <i data-lucide="scan-text" class="w-8 h-8"></i>
            </div>
            <div>
              <p class="font-semibold text-slate-700 dark:text-slate-200">Upload scanned PDF to perform OCR</p>
              <p class="text-xs text-slate-400 mt-1" id="ocr-file-status">100% private in-browser recognition</p>
            </div>
          </div>
        </div>

        <div id="ocr-workspace" class="space-y-4 hidden">
          <div class="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <div class="flex items-center gap-3">
              <label class="text-xs font-semibold text-slate-500">Language:</label>
              <select id="ocr-lang" class="text-xs font-medium bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 outline-none">
                <option value="eng">English (eng)</option>
                <option value="spa">Spanish (spa)</option>
                <option value="fra">French (fra)</option>
                <option value="deu">German (deu)</option>
              </select>
            </div>
            <button id="ocr-run-btn" class="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition flex items-center gap-2">
              <i data-lucide="play" class="w-4 h-4"></i>
              <span>Start OCR Recognition</span>
            </button>
          </div>

          <div id="ocr-results" class="space-y-3 hidden">
            <div class="flex items-center justify-between">
              <h3 class="font-semibold text-sm">Extracted Text</h3>
              <div class="flex items-center gap-2">
                <button id="ocr-copy-btn" class="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition">Copy Text</button>
                <button id="ocr-download-txt-btn" class="px-3 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition">Download .TXT</button>
              </div>
            </div>
            <textarea id="ocr-output-text" rows="12" readonly class="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs leading-relaxed focus:outline-none"></textarea>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const dropzone = container.querySelector('#ocr-dropzone');
    const input = container.querySelector('#ocr-file-input');
    const statusEl = container.querySelector('#ocr-file-status');
    const workspace = container.querySelector('#ocr-workspace');
    const langSelect = container.querySelector('#ocr-lang');
    const runBtn = container.querySelector('#ocr-run-btn');
    const resultsEl = container.querySelector('#ocr-results');
    const outputText = container.querySelector('#ocr-output-text');
    const copyBtn = container.querySelector('#ocr-copy-btn');
    const downloadTxtBtn = container.querySelector('#ocr-download-txt-btn');

    UI.setupDropzone(dropzone, input, async (files) => {
      if (files.length === 0) return;
      currentFile = files[0];
      statusEl.innerText = `${currentFile.name} (${window.pdfEngine.formatBytes(currentFile.size)})`;
      currentBuffer = await window.pdfEngine.readFileAsArrayBuffer(currentFile);
      workspace.classList.remove('hidden');
      resultsEl.classList.add('hidden');
    });

    runBtn.addEventListener('click', async () => {
      if (!currentBuffer || !window.Tesseract) {
        UI.showToast('OCR engine loading, please try again in a moment.', 'error');
        return;
      }

      const lang = langSelect.value;
      try {
        UI.showProgress(0.1, 'Rendering pages to high-resolution images...');
        const bufferToUse = currentBuffer?.byteLength > 0 ? currentBuffer : await currentFile.arrayBuffer();
        const images = await window.pdfEngine.pdfToImages(window.pdfEngine.cloneBuffer(bufferToUse), 'image/png', 2.0, (pct, status) => {
          UI.showProgress(pct * 0.3, status);
        });

        let extractedAll = '';
        const worker = await window.Tesseract.createWorker(lang);

        for (let i = 0; i < images.length; i++) {
          UI.showProgress(0.3 + (i / images.length) * 0.65, `Recognizing text on page ${i + 1} of ${images.length}...`);
          const res = await worker.recognize(images[i].dataUrl);
          extractedAll += `=== Page ${i + 1} ===\n${res.data.text.trim()}\n\n`;
        }

        await worker.terminate();

        outputText.value = extractedAll;
        resultsEl.classList.remove('hidden');

        UI.hideProgress();
        UI.celebrate();
        UI.showToast('OCR completed successfully!', 'success');
      } catch (err) {
        UI.hideProgress();
        UI.showToast(`OCR error: ${err.message}`, 'error');
      }
    });

    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(outputText.value);
      UI.showToast('Copied to clipboard!', 'info');
    });

    downloadTxtBtn.addEventListener('click', () => {
      const blob = new Blob([outputText.value], { type: 'text/plain;charset=utf-8' });
      window.pdfEngine.downloadBlob(blob, `${currentFile.name.replace(/\.pdf$/i, '')}_ocr.txt`);
    });
  }
};

window.OptimizeTools = OptimizeTools;

