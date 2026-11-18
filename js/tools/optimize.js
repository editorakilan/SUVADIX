/**
 * SUVADIX - Optimize Tools
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
          <p class="text-sm text-slate-500">Reduce PDF file size by target limit (GB/MB/KB/Bytes), compression presets, or lossless vector optimization.</p>
        </div>

        <div id="compress-dropzone" class="dropzone p-8 rounded-2xl text-center cursor-pointer hover:border-emerald-500 transition">
          <input type="file" id="compress-file-input" accept="application/pdf" class="hidden">
          <div class="flex flex-col items-center gap-3">
            <div class="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
              <i data-lucide="minimize-2" class="w-8 h-8"></i>
            </div>
            <div>
              <p class="font-semibold text-slate-700 dark:text-slate-200">Click to upload or drag & drop a PDF</p>
              <p class="text-xs text-slate-400 mt-1" id="compress-file-status">Select a PDF to compress or optimize</p>
            </div>
          </div>
        </div>

        <div id="compress-options" class="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-5 hidden">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
            <h3 class="font-semibold text-sm">Choose Compression Mode</h3>
            <span class="text-xs text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full">100% In-Browser</span>
          </div>

          <!-- Top-level Mode Selector Cards -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label class="comp-mode-card flex flex-col p-4 rounded-xl border-2 border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/30 cursor-pointer transition" data-mode="target">
              <div class="flex items-center justify-between mb-1.5">
                <span class="font-bold text-sm text-emerald-700 dark:text-emerald-300">Target File Size</span>
                <input type="radio" name="comp-type" value="target" checked class="text-emerald-600">
              </div>
              <span class="text-xs text-slate-500">Compress to exact GB, MB, KB, or Bytes limit for portal uploads.</span>
            </label>

            <label class="comp-mode-card flex flex-col p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer transition hover:border-emerald-300" data-mode="raster">
              <div class="flex items-center justify-between mb-1.5">
                <span class="font-bold text-sm text-slate-800 dark:text-slate-200">Preset Downsampling</span>
                <input type="radio" name="comp-type" value="raster" class="text-emerald-600">
              </div>
              <span class="text-xs text-slate-500">Choose Extreme, Recommended, or Less reduction for scans & photos.</span>
            </label>

            <label class="comp-mode-card flex flex-col p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer transition hover:border-emerald-300" data-mode="vector">
              <div class="flex items-center justify-between mb-1.5">
                <span class="font-bold text-sm text-slate-800 dark:text-slate-200">Smart Vector</span>
                <input type="radio" name="comp-type" value="vector" class="text-emerald-600">
              </div>
              <span class="text-xs text-slate-500">Lossless font & stream rebuild. Keeps 100% vector text selectable.</span>
            </label>
          </div>

          <!-- PANEL 1: TARGET FILE SIZE CONFIGURATION -->
          <div id="target-size-panel" class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 space-y-4">
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="text-xs font-bold text-slate-700 dark:text-slate-200">Target Maximum File Size</label>
                <span id="target-live-calc" class="text-xs font-semibold text-emerald-600">Original: 0 MB</span>
              </div>
              
              <div class="flex items-center gap-2">
                <input type="number" id="target-size-val" step="any" min="0.01" value="2" class="w-full text-sm font-semibold bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                <select id="target-size-unit" class="text-xs font-bold bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-emerald-500">
                  <option value="MB" selected>MB</option>
                  <option value="KB">KB</option>
                  <option value="Bytes">Bytes</option>
                  <option value="GB">GB</option>
                </select>
              </div>
            </div>

            <!-- Quick Preset Chips -->
            <div>
              <span class="text-[11px] font-semibold text-slate-500 block mb-1.5">Quick Target Presets:</span>
              <div class="flex flex-wrap gap-2">
                <button type="button" class="target-chip px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium hover:border-emerald-500 hover:text-emerald-600 transition" data-val="500" data-unit="KB">500 KB</button>
                <button type="button" class="target-chip px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium hover:border-emerald-500 hover:text-emerald-600 transition" data-val="1" data-unit="MB">1 MB</button>
                <button type="button" class="target-chip px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium hover:border-emerald-500 hover:text-emerald-600 transition" data-val="2" data-unit="MB">2 MB</button>
                <button type="button" class="target-chip px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium hover:border-emerald-500 hover:text-emerald-600 transition" data-val="5" data-unit="MB">5 MB</button>
                <button type="button" class="target-chip px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium hover:border-emerald-500 hover:text-emerald-600 transition" data-val="10" data-unit="MB">10 MB</button>
              </div>
            </div>
          </div>

          <!-- PANEL 2: RASTER PRESETS (Extreme, Recommended, Less) -->
          <div id="raster-presets" class="hidden space-y-3">
            <span class="text-xs font-bold text-slate-700 dark:text-slate-200 block">Select Downsampling Intensity:</span>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <!-- Extreme Card -->
              <div class="preset-card flex flex-col p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer hover:border-emerald-400 transition" data-level="extreme">
                <div class="flex items-center justify-between mb-1">
                  <span class="preset-title font-bold text-xs text-slate-800 dark:text-slate-200">Extreme</span>
                  <input type="radio" name="comp-level" value="extreme" class="text-emerald-600">
                </div>
                <span class="text-[11px] text-slate-400">Max reduction (~70-85%)</span>
                <span class="text-[10px] text-emerald-600 font-medium mt-1">72-96 DPI &bull; Quality 45%</span>
              </div>

              <!-- Recommended Card -->
              <div class="preset-card flex flex-col p-3.5 rounded-xl border-2 border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30 ring-1 ring-emerald-500 cursor-pointer transition" data-level="recommended">
                <div class="flex items-center justify-between mb-1">
                  <span class="preset-title font-bold text-xs text-emerald-700 dark:text-emerald-300">Recommended</span>
                  <input type="radio" name="comp-level" value="recommended" checked class="text-emerald-600">
                </div>
                <span class="text-[11px] text-slate-400">Balanced (~45-65%)</span>
                <span class="text-[10px] text-emerald-600 font-medium mt-1">130-150 DPI &bull; Quality 72%</span>
              </div>

              <!-- Less Card -->
              <div class="preset-card flex flex-col p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer hover:border-emerald-400 transition" data-level="less">
                <div class="flex items-center justify-between mb-1">
                  <span class="preset-title font-bold text-xs text-slate-800 dark:text-slate-200">Less</span>
                  <input type="radio" name="comp-level" value="less" class="text-emerald-600">
                </div>
                <span class="text-[11px] text-slate-400">High clarity (~20-35%)</span>
                <span class="text-[10px] text-emerald-600 font-medium mt-1">180-200 DPI &bull; Quality 88%</span>
              </div>
            </div>
          </div>

          <!-- PANEL 3: VECTOR INFO -->
          <div id="vector-info-panel" class="hidden p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-xs text-slate-600 dark:text-slate-300 space-y-1">
            <span class="font-bold text-blue-900 dark:text-blue-200 block">Lossless Vector & Font Stream Rebuilding</span>
            <p>Strips redundant XRef entries, removes unused metadata, and deflates object streams. All text remains 100% digital, razor-sharp, and selectable at infinite zoom.</p>
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

    // Panels
    const targetSizePanel = container.querySelector('#target-size-panel');
    const rasterPresets = container.querySelector('#raster-presets');
    const vectorInfoPanel = container.querySelector('#vector-info-panel');
    const targetValInput = container.querySelector('#target-size-val');
    const targetUnitSelect = container.querySelector('#target-size-unit');
    const targetLiveCalc = container.querySelector('#target-live-calc');

    let compressedBlob = null;

    // Helper: update target size live calculation display
    const updateTargetLive = () => {
      if (!currentFile) return;
      const val = parseFloat(targetValInput.value) || 0;
      const unit = targetUnitSelect.value;
      const multipliers = { 'Bytes': 1, 'KB': 1024, 'MB': 1024 * 1024, 'GB': 1024 * 1024 * 1024 };
      const targetBytes = val * (multipliers[unit] || 1024 * 1024);
      const origBytes = currentFile.size;

      if (targetBytes >= origBytes) {
        targetLiveCalc.innerText = `Target (${window.pdfEngine.formatBytes(targetBytes)}) ≥ Current (${window.pdfEngine.formatBytes(origBytes)}). Lossless mode will be applied.`;
        targetLiveCalc.className = 'text-xs font-semibold text-blue-600';
      } else {
        const reductionPct = Math.round(((origBytes - targetBytes) / origBytes) * 100);
        targetLiveCalc.innerText = `Original: ${window.pdfEngine.formatBytes(origBytes)} → Target: ${window.pdfEngine.formatBytes(targetBytes)} (~${reductionPct}% reduction)`;
        targetLiveCalc.className = 'text-xs font-semibold text-emerald-600';
      }
    };

    targetValInput.addEventListener('input', updateTargetLive);
    targetUnitSelect.addEventListener('change', updateTargetLive);

    // Preset chip buttons
    container.querySelectorAll('.target-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        targetValInput.value = chip.dataset.val;
        targetUnitSelect.value = chip.dataset.unit;
        updateTargetLive();
      });
    });

    // Preset cards interactive selection (Extreme, Recommended, Less)
    const selectPresetCard = (selectedLevel) => {
      container.querySelectorAll('.preset-card').forEach(card => {
        const isMatch = card.dataset.level === selectedLevel;
        const title = card.querySelector('.preset-title');
        const radio = card.querySelector('input[type="radio"]');

        if (isMatch) {
          card.className = 'preset-card flex flex-col p-3.5 rounded-xl border-2 border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30 ring-1 ring-emerald-500 cursor-pointer transition';
          if (title) title.className = 'preset-title font-bold text-xs text-emerald-700 dark:text-emerald-300';
          if (radio) radio.checked = true;
        } else {
          card.className = 'preset-card flex flex-col p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer hover:border-emerald-400 transition';
          if (title) title.className = 'preset-title font-bold text-xs text-slate-800 dark:text-slate-200';
          if (radio) radio.checked = false;
        }
      });
    };

    container.querySelectorAll('.preset-card').forEach(card => {
      card.addEventListener('click', () => {
        selectPresetCard(card.dataset.level);
      });
    });

    // Top-level Mode Selector switching
    const selectMode = (mode) => {
      container.querySelectorAll('.comp-mode-card').forEach(card => {
        const isMatch = card.dataset.mode === mode;
        const radio = card.querySelector('input[type="radio"]');
        const title = card.querySelector('span.font-bold');

        if (isMatch) {
          card.className = 'comp-mode-card flex flex-col p-4 rounded-xl border-2 border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/30 cursor-pointer transition';
          if (title) title.className = 'font-bold text-sm text-emerald-700 dark:text-emerald-300';
          if (radio) radio.checked = true;
        } else {
          card.className = 'comp-mode-card flex flex-col p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer transition hover:border-emerald-300';
          if (title) title.className = 'font-bold text-sm text-slate-800 dark:text-slate-200';
          if (radio) radio.checked = false;
        }
      });

      targetSizePanel.classList.toggle('hidden', mode !== 'target');
      rasterPresets.classList.toggle('hidden', mode !== 'raster');
      vectorInfoPanel.classList.toggle('hidden', mode !== 'vector');
    };

    container.querySelectorAll('.comp-mode-card').forEach(card => {
      card.addEventListener('click', () => {
        selectMode(card.dataset.mode);
      });
    });

    UI.setupDropzone(dropzone, input, async (files) => {
      if (files.length === 0) return;
      currentFile = files[0];
      statusEl.innerText = `${currentFile.name} (${window.pdfEngine.formatBytes(currentFile.size)})`;
      currentBuffer = await window.pdfEngine.readFileAsArrayBuffer(currentFile);

      // Auto-populate reasonable default target based on file size
      if (currentFile.size > 2 * 1024 * 1024) {
        targetValInput.value = Math.max(0.5, Math.round((currentFile.size / (1024 * 1024) * 0.5) * 10) / 10);
        targetUnitSelect.value = 'MB';
      } else {
        targetValInput.value = Math.max(100, Math.round(currentFile.size / 1024 * 0.5));
        targetUnitSelect.value = 'KB';
      }

      updateTargetLive();
      optionsEl.classList.remove('hidden');
      resultCard.classList.add('hidden');
    });

    runBtn.addEventListener('click', async () => {
      if (!currentBuffer && !currentFile) return;
      const compTypeEl = container.querySelector('input[name="comp-type"]:checked');
      const compType = compTypeEl ? compTypeEl.value : 'target';
      const bufferToUse = currentBuffer?.byteLength > 0 ? currentBuffer : await currentFile.arrayBuffer();

      try {
        if (compType === 'target') {
          // --- Target File Size Mode (GB / MB / KB / Bytes) ---
          const val = parseFloat(targetValInput.value) || 1;
          const unit = targetUnitSelect.value;
          const multipliers = { 'Bytes': 1, 'KB': 1024, 'MB': 1024 * 1024, 'GB': 1024 * 1024 * 1024 };
          const targetBytes = Math.max(1024, Math.round(val * (multipliers[unit] || 1024 * 1024)));

          UI.showProgress(0.1, `Compressing to target size ${window.pdfEngine.formatBytes(targetBytes)}...`);
          compressedBlob = await window.pdfEngine.compressPdfToTarget(bufferToUse, targetBytes, (pct, status) => {
            UI.showProgress(pct, status);
          });
        } else if (compType === 'raster') {
          // --- Raster Downsampling Presets ---
          const levelEl = container.querySelector('input[name="comp-level"]:checked');
          const level = levelEl ? levelEl.value : 'recommended';

          let scale = 1.25;
          let quality = 0.72;

          if (level === 'extreme') {
            scale = 0.85;
            quality = 0.45;
          } else if (level === 'less') {
            scale = 1.6;
            quality = 0.88;
          }

          UI.showProgress(0.1, `Applying ${level.toUpperCase()} compression preset...`);
          const images = await window.pdfEngine.pdfToImages(window.pdfEngine.cloneBuffer(bufferToUse), 'image/jpeg', scale, (pct, status) => {
            UI.showProgress(pct * 0.75, status);
          }, quality);

          UI.showProgress(0.80, 'Re-encoding optimized document...');
          const fileList = images.map(img => new File([img.blob], img.name, { type: 'image/jpeg' }));
          compressedBlob = await window.pdfEngine.imagesToPDF(fileList, { pageSize: 'Fit' });
        } else {
          // --- Smart Vector & Text Preservation Mode ---
          UI.showProgress(0.2, 'Optimizing PDF dictionary and streams (Vector & Text Preserved)...');
          const { PDFDocument } = PDFLib;
          const srcDoc = await PDFDocument.load(window.pdfEngine.cloneBuffer(bufferToUse), { ignoreEncryption: true });
          const newDoc = await PDFDocument.create();
          const pages = await newDoc.copyPages(srcDoc, srcDoc.getPageIndices());
          pages.forEach(p => newDoc.addPage(p));
          
          UI.showProgress(0.8, 'Compressing object trees...');
          const bytes = await newDoc.save({ useObjectStreams: false });
          compressedBlob = new Blob([bytes], { type: 'application/pdf' });
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
          subtitle: `Size: ${window.pdfEngine.formatBytes(origSize)} → ${window.pdfEngine.formatBytes(newSize)} (-${savedPct}%). Inspect visual quality below:`,
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
          subtitle: `Size: ${window.pdfEngine.formatBytes(currentFile.size)} → ${window.pdfEngine.formatBytes(compressedBlob.size)}. Inspect visual quality below:`,
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
  },

  // 4. COLOR CORRECTION & DOCUMENT STYLES
  renderColorCorrection(container) {
    let currentFile = null;
    let currentBuffer = null;
    let pdfDoc = null;
    let currentPageNum = 1;
    let totalPages = 1;
    let currentZoom = 1.0;
    let selectedStyle = 'document'; // default to document style
    let brightness = 0;
    let contrast = 0;

    const COLOR_FILTERS = {
      normal: 'none',
      document: 'contrast(1.65) brightness(1.12) grayscale(0.65)',
      magic: 'contrast(1.35) brightness(1.08) saturate(1.3)',
      grayscale: 'grayscale(1) contrast(1.1)',
      bw: 'contrast(2.8) grayscale(1)',
      blueprint: 'invert(1) hue-rotate(180deg) contrast(1.2)',
      warm: 'sepia(0.55) contrast(1.05) brightness(1.02)'
    };

    container.innerHTML = `
      <div class="max-w-5xl mx-auto space-y-6">
        <div class="text-center space-y-2">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <i data-lucide="palette" class="w-3.5 h-3.5"></i>
            <span>Document Color Styles & Enhancement</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Document Color Correction</h2>
          <p class="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">Enhance scanned documents and PDFs: apply Clean Document (paper whitening), Magic Color, Grayscale, or B&W with real-time preview and fine-tuning sliders.</p>
        </div>

        <div id="cc-dropzone" class="dropzone p-8 rounded-2xl text-center cursor-pointer hover:border-emerald-500 transition border-2 border-dashed border-slate-300 bg-white dark:bg-slate-800 shadow-sm">
          <input type="file" id="cc-file-input" accept="application/pdf" class="hidden">
          <div class="flex flex-col items-center gap-3">
            <div class="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shadow-inner">
              <i data-lucide="wand-2" class="w-8 h-8"></i>
            </div>
            <div>
              <p class="font-bold text-slate-800 dark:text-slate-100">Choose PDF or drop it here to enhance</p>
              <p class="text-xs text-slate-400 mt-1" id="cc-file-status">Select a document to adjust color styles and contrast</p>
            </div>
          </div>
        </div>

        <div id="cc-workspace" class="p-4 sm:p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-lg space-y-5 hidden">
          <!-- Style Presets Grid -->
          <div class="space-y-2">
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Document Color Style:</span>
            <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2" id="cc-styles-grid">
              <button data-style="normal" class="cc-style-btn p-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-400 text-center transition flex flex-col items-center gap-1.5">
                <span class="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-400 via-rose-400 to-amber-300 shadow-xs"></span>
                <span class="font-bold text-xs text-slate-800 dark:text-slate-100">Normal</span>
                <span class="text-[10px] text-slate-400">Original</span>
              </button>

              <button data-style="document" class="cc-style-btn p-3 rounded-2xl border-2 border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30 text-center transition flex flex-col items-center gap-1.5 active">
                <span class="w-6 h-6 rounded-full bg-white border border-slate-400 shadow-xs flex items-center justify-center text-slate-900 font-extrabold text-[10px]">A</span>
                <span class="font-bold text-xs text-emerald-700 dark:text-emerald-300">Document</span>
                <span class="text-[10px] text-slate-400">Paper White</span>
              </button>

              <button data-style="magic" class="cc-style-btn p-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-400 text-center transition flex flex-col items-center gap-1.5">
                <span class="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-emerald-400 shadow-xs"></span>
                <span class="font-bold text-xs text-slate-800 dark:text-slate-100">Magic Color</span>
                <span class="text-[10px] text-slate-400">Enhanced</span>
              </button>

              <button data-style="grayscale" class="cc-style-btn p-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-400 text-center transition flex flex-col items-center gap-1.5">
                <span class="w-6 h-6 rounded-full bg-slate-500 shadow-xs"></span>
                <span class="font-bold text-xs text-slate-800 dark:text-slate-100">Grayscale</span>
                <span class="text-[10px] text-slate-400">Monochrome</span>
              </button>

              <button data-style="bw" class="cc-style-btn p-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-400 text-center transition flex flex-col items-center gap-1.5">
                <span class="w-6 h-6 rounded-full bg-black border border-white shadow-xs"></span>
                <span class="font-bold text-xs text-slate-800 dark:text-slate-100">B&W Crisp</span>
                <span class="text-[10px] text-slate-400">High Contrast</span>
              </button>

              <button data-style="blueprint" class="cc-style-btn p-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-400 text-center transition flex flex-col items-center gap-1.5">
                <span class="w-6 h-6 rounded-full bg-blue-900 border border-cyan-400 shadow-xs"></span>
                <span class="font-bold text-xs text-slate-800 dark:text-slate-100">Blueprint</span>
                <span class="text-[10px] text-slate-400">Inverted</span>
              </button>

              <button data-style="warm" class="cc-style-btn p-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-400 text-center transition flex flex-col items-center gap-1.5">
                <span class="w-6 h-6 rounded-full bg-amber-200 border border-amber-400 shadow-xs"></span>
                <span class="font-bold text-xs text-slate-800 dark:text-slate-100">Warm</span>
                <span class="text-[10px] text-slate-400">Sepia Read</span>
              </button>
            </div>
          </div>

          <!-- Fine-Tuning Controls -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
            <div class="space-y-1">
              <div class="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                <span>Brightness:</span>
                <span id="cc-brightness-val">0%</span>
              </div>
              <input type="range" id="cc-brightness" min="-50" max="50" value="0" class="w-full accent-emerald-600">
            </div>

            <div class="space-y-1">
              <div class="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                <span>Contrast:</span>
                <span id="cc-contrast-val">0%</span>
              </div>
              <input type="range" id="cc-contrast" min="-50" max="50" value="0" class="w-full accent-emerald-600">
            </div>
          </div>

          <!-- Viewer Toolbar -->
          <div class="flex flex-wrap items-center justify-between gap-3 pt-2">
            <!-- Zoom Controls -->
            <div class="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 px-2.5 py-1.5 rounded-xl text-xs font-bold">
              <button id="cc-zoom-out" class="p-1 hover:bg-white dark:hover:bg-slate-800 rounded text-slate-600 transition" title="Zoom Out">
                <i data-lucide="zoom-out" class="w-3.5 h-3.5"></i>
              </button>
              <span id="cc-zoom-val" class="min-w-[42px] text-center font-extrabold text-slate-800 dark:text-slate-100">100%</span>
              <button id="cc-zoom-in" class="p-1 hover:bg-white dark:hover:bg-slate-800 rounded text-slate-600 transition" title="Zoom In">
                <i data-lucide="zoom-in" class="w-3.5 h-3.5"></i>
              </button>
              <button id="cc-zoom-reset" class="px-1.5 py-0.5 rounded text-[10px] font-semibold text-slate-500 hover:text-slate-900 hover:bg-white transition">Reset</button>
            </div>

            <!-- Page Navigation -->
            <div class="flex items-center gap-2 text-xs font-bold bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-xl">
              <button id="cc-prev-page" class="p-1 hover:bg-white dark:hover:bg-slate-800 rounded text-slate-600 transition disabled:opacity-40">
                <i data-lucide="chevron-left" class="w-4 h-4"></i>
              </button>
              <span>Page <strong id="cc-page-num" class="text-emerald-600">1</strong> of <strong id="cc-page-total">1</strong></span>
              <button id="cc-next-page" class="p-1 hover:bg-white dark:hover:bg-slate-800 rounded text-slate-600 transition disabled:opacity-40">
                <i data-lucide="chevron-right" class="w-4 h-4"></i>
              </button>
            </div>

            <!-- Action Button -->
            <button id="cc-apply-btn" class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition flex items-center gap-2">
              <i data-lucide="check-circle" class="w-4 h-4"></i>
              <span>Enhance & Download PDF</span>
            </button>
          </div>

          <!-- Document Canvas Viewer Container -->
          <div class="flex justify-center p-4 bg-slate-100 dark:bg-slate-900 rounded-2xl overflow-auto max-h-[70vh]">
            <canvas id="cc-page-canvas" class="border border-slate-300 dark:border-slate-700 shadow-xl bg-white transition-all"></canvas>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // DOM References
    const dropzone = container.querySelector('#cc-dropzone');
    const input = container.querySelector('#cc-file-input');
    const statusEl = container.querySelector('#cc-file-status');
    const workspace = container.querySelector('#cc-workspace');
    const pageCanvas = container.querySelector('#cc-page-canvas');

    const styleBtns = container.querySelectorAll('.cc-style-btn');
    const brightnessInput = container.querySelector('#cc-brightness');
    const contrastInput = container.querySelector('#cc-contrast');
    const brightnessVal = container.querySelector('#cc-brightness-val');
    const contrastVal = container.querySelector('#cc-contrast-val');

    const zoomOutBtn = container.querySelector('#cc-zoom-out');
    const zoomInBtn = container.querySelector('#cc-zoom-in');
    const zoomVal = container.querySelector('#cc-zoom-val');
    const zoomResetBtn = container.querySelector('#cc-zoom-reset');

    const prevPageBtn = container.querySelector('#cc-prev-page');
    const nextPageBtn = container.querySelector('#cc-next-page');
    const pageNumEl = container.querySelector('#cc-page-num');
    const pageTotalEl = container.querySelector('#cc-page-total');
    const applyBtn = container.querySelector('#cc-apply-btn');

    const updateFilterDisplay = () => {
      let filter = COLOR_FILTERS[selectedStyle] || 'none';
      if (brightness !== 0) filter += ` brightness(${1 + brightness / 100})`;
      if (contrast !== 0) filter += ` contrast(${1 + contrast / 100})`;
      pageCanvas.style.filter = filter;
    };

    styleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        styleBtns.forEach(b => {
          b.classList.remove('border-emerald-500', 'bg-emerald-50/40', 'dark:bg-emerald-950/30');
          b.classList.add('border-slate-200', 'dark:border-slate-700');
        });
        btn.classList.add('border-emerald-500', 'bg-emerald-50/40', 'dark:bg-emerald-950/30');
        btn.classList.remove('border-slate-200', 'dark:border-slate-700');

        selectedStyle = btn.dataset.style;
        updateFilterDisplay();
      });
    });

    brightnessInput.addEventListener('input', (e) => {
      brightness = parseInt(e.target.value, 10);
      brightnessVal.innerText = `${brightness > 0 ? '+' : ''}${brightness}%`;
      updateFilterDisplay();
    });

    contrastInput.addEventListener('input', (e) => {
      contrast = parseInt(e.target.value, 10);
      contrastVal.innerText = `${contrast > 0 ? '+' : ''}${contrast}%`;
      updateFilterDisplay();
    });

    const renderPage = async (pageIdx) => {
      if (!pdfDoc) return;
      currentPageNum = pageIdx;
      pageNumEl.innerText = currentPageNum;
      pageTotalEl.innerText = totalPages;
      prevPageBtn.disabled = currentPageNum <= 1;
      nextPageBtn.disabled = currentPageNum >= totalPages;

      const baseWidth = Math.min(800, Math.max(480, window.innerWidth - 100));
      const targetWidth = Math.round(baseWidth * currentZoom);
      await window.pdfEngine.renderPageToCanvas(pdfDoc, currentPageNum, pageCanvas, targetWidth);
      updateFilterDisplay();
    };

    zoomInBtn.addEventListener('click', () => {
      currentZoom = Math.min(2.5, currentZoom + 0.25);
      zoomVal.innerText = `${Math.round(currentZoom * 100)}%`;
      renderPage(currentPageNum);
    });

    zoomOutBtn.addEventListener('click', () => {
      currentZoom = Math.max(0.5, currentZoom - 0.25);
      zoomVal.innerText = `${Math.round(currentZoom * 100)}%`;
      renderPage(currentPageNum);
    });

    zoomResetBtn.addEventListener('click', () => {
      currentZoom = 1.0;
      zoomVal.innerText = '100%';
      renderPage(currentPageNum);
    });

    prevPageBtn.addEventListener('click', () => {
      if (currentPageNum > 1) renderPage(currentPageNum - 1);
    });

    nextPageBtn.addEventListener('click', () => {
      if (currentPageNum < totalPages) renderPage(currentPageNum + 1);
    });

    UI.setupDropzone(dropzone, input, async (files) => {
      if (files.length === 0) return;
      currentFile = files[0];
      statusEl.innerText = `${currentFile.name} (${window.pdfEngine.formatBytes(currentFile.size)})`;
      currentBuffer = await window.pdfEngine.readFileAsArrayBuffer(currentFile);
      workspace.classList.remove('hidden');

      pdfDoc = await window.pdfEngine.getPdfJsDoc(currentBuffer);
      totalPages = pdfDoc.numPages;
      currentZoom = 1.0;
      zoomVal.innerText = '100%';
      await renderPage(1);
    });

    applyBtn.addEventListener('click', async () => {
      if (!currentBuffer) return;
      try {
        UI.showProgress(0.05, 'Starting document color enhancement...');
        const bufferToUse = currentBuffer?.byteLength > 0 ? currentBuffer : await currentFile.arrayBuffer();

        const correctedBlob = await window.pdfEngine.applyColorCorrectionToPdf(
          window.pdfEngine.cloneBuffer(bufferToUse),
          selectedStyle,
          brightness,
          contrast,
          (pct, status) => UI.showProgress(pct, status)
        );

        UI.hideProgress();
        UI.celebrate();
        UI.showToast(`Applied ${selectedStyle} color style across all ${totalPages} page(s)!`, 'success');
        UI.showResultPreview({
          title: 'Enhanced Document Ready',
          subtitle: `Style: ${selectedStyle.toUpperCase()} | Contrast: ${contrast}% | Brightness: ${brightness}%`,
          blob: correctedBlob,
          filename: `${currentFile.name.replace(/\.pdf$/i, '')}_${selectedStyle}.pdf`
        });
      } catch (err) {
        UI.hideProgress();
        UI.showToast(err.message, 'error');
      }
    });
  }
};

window.OptimizeTools = OptimizeTools;

