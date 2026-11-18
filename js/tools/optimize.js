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

  // 4. SUVADIX PDF ENHANCE & RESTORATION STUDIO (CATEGORIES A, B, C, D, E, F)
  renderColorCorrection(container) {
    let currentFile = null;
    let currentBuffer = null;
    let pdfDoc = null;
    let currentPageNum = 1;
    let totalPages = 1;
    let currentZoom = 1.0;
    let activePreset = 'auto';
    let isSplitDragging = false;
    let splitPercent = 50;
    let renderDebounceTimer = null;

    // Comprehensive Adjustment State (Categories A, B, C, E)
    let state = {
      preset: 'auto',
      brightness: 0,
      contrast: 20,
      exposure: 0,
      gamma: 1.0,
      highlights: 0,
      shadows: 0,
      blackPoint: 0,
      whitePoint: 255,
      saturation: 0,
      vibrance: 15,
      temperature: 0,
      tint: 0,
      sharpness: 22,
      deblur: 0,
      denoise: 0,
      upscale2x: false,
      removeGreyBg: true,
      removeYellowTint: false,
      removePaperShadows: false,
      removeBleedThrough: false,
      adaptiveThreshold: false
    };

    container.innerHTML = `
      <div class="max-w-6xl mx-auto space-y-6">
        <!-- Studio Header -->
        <div class="text-center space-y-2">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 shadow-xs">
            <i data-lucide="sparkles" class="w-3.5 h-3.5 text-emerald-600"></i>
            <span>SUVADIX PDF ENHANCE & RESTORATION STUDIO</span>
          </div>
          <h2 class="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-slate-100">
            PDF Enhance & Restoration Studio
          </h2>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            Fix dull, grey & faded PDFs. Professional color restoration, sharpening, deblur, background cleanup, and scan enhancement with real-time Before / After split comparison.
          </p>
        </div>

        <!-- Dropzone -->
        <div id="es-dropzone" class="dropzone p-8 sm:p-10 rounded-3xl text-center cursor-pointer hover:border-emerald-500 transition-all border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-md">
          <input type="file" id="es-file-input" accept="application/pdf" class="hidden">
          <div class="flex flex-col items-center gap-3">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 text-emerald-600 flex items-center justify-center shadow-inner">
              <i data-lucide="wand-2" class="w-8 h-8"></i>
            </div>
            <div>
              <p class="font-extrabold text-base text-slate-800 dark:text-slate-100">Choose PDF or drop it here to open Enhance Studio</p>
              <p class="text-xs text-slate-400 mt-1" id="es-file-status">100% private in-browser restoration with zero file size limits</p>
            </div>
          </div>
        </div>

        <!-- Studio Workspace -->
        <div id="es-workspace" class="space-y-6 hidden">
          
          <!-- Category F & D: Professional 1-Click Presets -->
          <div class="p-4 sm:p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <i data-lucide="zap" class="w-4 h-4 text-emerald-600"></i>
                <span class="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Professional 1-Click Presets:</span>
              </div>
              <button id="es-btn-reset-all" class="text-xs font-bold text-slate-400 hover:text-red-500 flex items-center gap-1 transition">
                <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i>
                <span>Reset Adjustments</span>
              </button>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5" id="es-presets-grid">
              <button data-preset="auto" class="es-preset-card p-3 rounded-2xl border-2 border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-left transition flex flex-col gap-1 active shadow-xs">
                <div class="flex items-center justify-between">
                  <i data-lucide="sparkles" class="w-4 h-4 text-emerald-600"></i>
                  <span class="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">Smart</span>
                </div>
                <span class="font-extrabold text-xs text-slate-900 dark:text-slate-100">Auto Enhance</span>
                <span class="text-[10px] text-slate-500 leading-tight">Auto levels, contrast & clarity</span>
              </button>

              <button data-preset="text-clarity" class="es-preset-card p-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-emerald-400 bg-white dark:bg-slate-800 text-left transition flex flex-col gap-1">
                <div class="flex items-center justify-between">
                  <i data-lucide="type" class="w-4 h-4 text-blue-600"></i>
                </div>
                <span class="font-extrabold text-xs text-slate-900 dark:text-slate-100">Text Clarity</span>
                <span class="text-[10px] text-slate-500 leading-tight">Deep black text, paper whitening</span>
              </button>

              <button data-preset="color-restore" class="es-preset-card p-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-emerald-400 bg-white dark:bg-slate-800 text-left transition flex flex-col gap-1">
                <div class="flex items-center justify-between">
                  <i data-lucide="palette" class="w-4 h-4 text-purple-600"></i>
                </div>
                <span class="font-extrabold text-xs text-slate-900 dark:text-slate-100">Color Restore</span>
                <span class="text-[10px] text-slate-500 leading-tight">Revive faded colors & photos</span>
              </button>

              <button data-preset="scan-cleanup" class="es-preset-card p-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-emerald-400 bg-white dark:bg-slate-800 text-left transition flex flex-col gap-1">
                <div class="flex items-center justify-between">
                  <i data-lucide="file-check" class="w-4 h-4 text-teal-600"></i>
                </div>
                <span class="font-extrabold text-xs text-slate-900 dark:text-slate-100">Scan Cleanup</span>
                <span class="text-[10px] text-slate-500 leading-tight">Remove grey bg & bleed-through</span>
              </button>

              <button data-preset="sharpen-deblur" class="es-preset-card p-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-emerald-400 bg-white dark:bg-slate-800 text-left transition flex flex-col gap-1">
                <div class="flex items-center justify-between">
                  <i data-lucide="crosshair" class="w-4 h-4 text-amber-600"></i>
                </div>
                <span class="font-extrabold text-xs text-slate-900 dark:text-slate-100">Sharpen & Deblur</span>
                <span class="text-[10px] text-slate-500 leading-tight">Reverse blur & crisp edges</span>
              </button>

              <button data-preset="ai-upscale" class="es-preset-card p-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-emerald-400 bg-white dark:bg-slate-800 text-left transition flex flex-col gap-1">
                <div class="flex items-center justify-between">
                  <i data-lucide="arrow-up-right" class="w-4 h-4 text-indigo-600"></i>
                  <span class="text-[9px] font-bold px-1 py-0.5 rounded bg-indigo-50 text-indigo-600">2.5x</span>
                </div>
                <span class="font-extrabold text-xs text-slate-900 dark:text-slate-100">AI Upscale</span>
                <span class="text-[10px] text-slate-500 leading-tight">Super-resolution sampling</span>
              </button>

              <button data-preset="old-document" class="es-preset-card p-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-emerald-400 bg-white dark:bg-slate-800 text-left transition flex flex-col gap-1">
                <div class="flex items-center justify-between">
                  <i data-lucide="history" class="w-4 h-4 text-rose-600"></i>
                </div>
                <span class="font-extrabold text-xs text-slate-900 dark:text-slate-100">Old Document</span>
                <span class="text-[10px] text-slate-500 leading-tight">Remove yellow tint & aging</span>
              </button>
            </div>
          </div>

          <!-- Category E: Interactive Draggable Before / After Comparison Split View -->
          <div class="p-4 sm:p-6 bg-slate-900 text-white rounded-3xl shadow-xl space-y-4">
            
            <!-- Workbench Control Bar -->
            <div class="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800">
              <!-- Comparison Mode Pills -->
              <div class="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold">
                <button id="es-mode-split" class="px-3 py-1.5 rounded-lg bg-indigo-600 text-white transition flex items-center gap-1.5">
                  <i data-lucide="split" class="w-3.5 h-3.5"></i>
                  <span>Split Comparison (50%)</span>
                </button>
                <button id="es-mode-after" class="px-3 py-1.5 rounded-lg hover:bg-slate-700 text-slate-300 transition">
                  Enhanced Only
                </button>
                <button id="es-mode-before" class="px-3 py-1.5 rounded-lg hover:bg-slate-700 text-slate-300 transition">
                  Original Only
                </button>
              </div>

              <!-- Zoomer Controls -->
              <div class="flex items-center gap-1 bg-slate-800 px-2.5 py-1.5 rounded-xl text-xs font-bold border border-slate-700">
                <button id="es-zoom-out" class="p-1 hover:bg-slate-700 rounded text-slate-300 transition" title="Zoom Out">
                  <i data-lucide="zoom-out" class="w-3.5 h-3.5"></i>
                </button>
                <span id="es-zoom-val" class="min-w-[42px] text-center font-extrabold text-white">100%</span>
                <button id="es-zoom-in" class="p-1 hover:bg-slate-700 rounded text-slate-300 transition" title="Zoom In">
                  <i data-lucide="zoom-in" class="w-3.5 h-3.5"></i>
                </button>
                <button id="es-zoom-reset" class="px-1.5 py-0.5 rounded text-[10px] font-semibold text-slate-400 hover:text-white hover:bg-slate-700 transition">Reset</button>
              </div>

              <!-- Page Navigation -->
              <div class="flex items-center gap-2 text-xs font-bold bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
                <button id="es-prev-page" class="p-1 hover:bg-slate-700 rounded text-slate-300 transition disabled:opacity-40">
                  <i data-lucide="chevron-left" class="w-4 h-4"></i>
                </button>
                <span>Page <strong id="es-page-num" class="text-emerald-400">1</strong> of <strong id="es-page-total">1</strong></span>
                <button id="es-next-page" class="p-1 hover:bg-slate-700 rounded text-slate-300 transition disabled:opacity-40">
                  <i data-lucide="chevron-right" class="w-4 h-4"></i>
                </button>
              </div>
            </div>

            <!-- Canvas Viewport with Draggable Split Divider -->
            <div class="flex justify-center items-center overflow-auto max-h-[65vh] p-2 bg-slate-950/70 rounded-2xl">
              <div id="es-split-wrapper" class="relative inline-block select-none overflow-hidden rounded-xl border border-slate-700 shadow-2xl cursor-ew-resize">
                
                <!-- Original Canvas (Base) -->
                <canvas id="es-canvas-orig" class="block pointer-events-none"></canvas>

                <!-- Enhanced Canvas (Overlay with Clip-Path) -->
                <div id="es-enhanced-wrap" class="absolute inset-0 overflow-hidden pointer-events-none" style="clip-path: inset(0 0 0 50%);">
                  <canvas id="es-canvas-enh" class="block pointer-events-none"></canvas>
                </div>

                <!-- Draggable Divider Line -->
                <div id="es-split-divider" class="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)] cursor-ew-resize flex items-center justify-center z-10 pointer-events-auto" style="left: 50%;">
                  <div class="w-9 h-9 rounded-full bg-white text-indigo-900 shadow-xl border-2 border-indigo-600 flex items-center justify-center font-black text-xs select-none hover:scale-110 active:scale-95 transition-transform">
                    <i data-lucide="split" class="w-4 h-4 text-indigo-600"></i>
                  </div>
                </div>

                <!-- Badges -->
                <div class="absolute top-3 left-3 px-3 py-1 rounded-md bg-slate-950/80 text-white text-[10px] font-black tracking-wider uppercase pointer-events-none backdrop-blur-md border border-slate-700 shadow">
                  Before (Original)
                </div>
                <div class="absolute top-3 right-3 px-3 py-1 rounded-md bg-emerald-600/90 text-white text-[10px] font-black tracking-wider uppercase pointer-events-none backdrop-blur-md border border-emerald-400/40 shadow">
                  After (Enhanced)
                </div>

                <!-- Instruction Hint -->
                <div class="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-slate-900/80 text-slate-300 text-[10px] font-medium pointer-events-none backdrop-blur-md border border-slate-700">
                  Drag divider or click anywhere to compare Before & After
                </div>
              </div>
            </div>
          </div>

          <!-- Categories A, B, C, E: Fine-Tuning Adjustment Controls -->
          <div class="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
            
            <!-- Category Tabs Header -->
            <div class="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-3 overflow-x-auto scrollbar-none">
              <button data-tab="tone" class="es-tab-btn px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                <i data-lucide="sliders" class="w-4 h-4"></i>
                <span>Color & Tone (Category A)</span>
              </button>

              <button data-tab="balance" class="es-tab-btn px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
                <i data-lucide="thermometer" class="w-4 h-4"></i>
                <span>Balance & Temp (Category A)</span>
              </button>

              <button data-tab="detail" class="es-tab-btn px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
                <i data-lucide="sparkle" class="w-4 h-4"></i>
                <span>Quality & Detail (Category B)</span>
              </button>

              <button data-tab="restore" class="es-tab-btn px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
                <i data-lucide="file-check-2" class="w-4 h-4"></i>
                <span>Doc Restoration (Category C)</span>
              </button>
            </div>

            <!-- Tab 1: Color & Tone (Category A & E) -->
            <div id="tab-pane-tone" class="es-tab-pane space-y-5">
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                
                <div class="space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div class="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                    <span>Brightness (-100 to +100)</span>
                    <span id="es-val-brightness" class="font-mono text-emerald-600">0</span>
                  </div>
                  <input type="range" id="es-inp-brightness" min="-100" max="100" value="0" class="w-full accent-emerald-600">
                </div>

                <div class="space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div class="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                    <span>Contrast (-100 to +100)</span>
                    <span id="es-val-contrast" class="font-mono text-emerald-600">+20</span>
                  </div>
                  <input type="range" id="es-inp-contrast" min="-100" max="100" value="20" class="w-full accent-emerald-600">
                </div>

                <div class="space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div class="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                    <span>Exposure (-3 to +3 EV)</span>
                    <span id="es-val-exposure" class="font-mono text-emerald-600">0.0</span>
                  </div>
                  <input type="range" id="es-inp-exposure" min="-3" max="3" step="0.1" value="0" class="w-full accent-emerald-600">
                </div>

                <div class="space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div class="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                    <span>Gamma Correction (0.1 - 3.0)</span>
                    <span id="es-val-gamma" class="font-mono text-emerald-600">1.00</span>
                  </div>
                  <input type="range" id="es-inp-gamma" min="0.1" max="3.0" step="0.05" value="1.0" class="w-full accent-emerald-600">
                </div>

                <div class="space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div class="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                    <span>Highlights (-100 to +100)</span>
                    <span id="es-val-highlights" class="font-mono text-emerald-600">0</span>
                  </div>
                  <input type="range" id="es-inp-highlights" min="-100" max="100" value="0" class="w-full accent-emerald-600">
                </div>

                <div class="space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div class="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                    <span>Shadows (-100 to +100)</span>
                    <span id="es-val-shadows" class="font-mono text-emerald-600">0</span>
                  </div>
                  <input type="range" id="es-inp-shadows" min="-100" max="100" value="0" class="w-full accent-emerald-600">
                </div>

                <div class="space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div class="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                    <span>Black Point (Deepen Blacks)</span>
                    <span id="es-val-blackPoint" class="font-mono text-emerald-600">0</span>
                  </div>
                  <input type="range" id="es-inp-blackPoint" min="0" max="100" value="0" class="w-full accent-emerald-600">
                </div>

                <div class="space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div class="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                    <span>White Point (Paper Clean)</span>
                    <span id="es-val-whitePoint" class="font-mono text-emerald-600">255</span>
                  </div>
                  <input type="range" id="es-inp-whitePoint" min="150" max="255" value="255" class="w-full accent-emerald-600">
                </div>
              </div>
            </div>

            <!-- Tab 2: Balance & Temp (Category A & E) -->
            <div id="tab-pane-balance" class="es-tab-pane space-y-5 hidden">
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                
                <div class="space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div class="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                    <span>Saturation (-100 to +100)</span>
                    <span id="es-val-saturation" class="font-mono text-emerald-600">0</span>
                  </div>
                  <input type="range" id="es-inp-saturation" min="-100" max="100" value="0" class="w-full accent-emerald-600">
                </div>

                <div class="space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div class="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                    <span>Vibrance (-100 to +100)</span>
                    <span id="es-val-vibrance" class="font-mono text-emerald-600">+15</span>
                  </div>
                  <input type="range" id="es-inp-vibrance" min="-100" max="100" value="15" class="w-full accent-emerald-600">
                </div>

                <div class="space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div class="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                    <span>Color Temperature (Cool ↔ Warm)</span>
                    <span id="es-val-temperature" class="font-mono text-emerald-600">0</span>
                  </div>
                  <input type="range" id="es-inp-temperature" min="-100" max="100" value="0" class="w-full accent-emerald-600">
                </div>

                <div class="space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div class="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                    <span>Tint Correction (Green ↔ Magenta)</span>
                    <span id="es-val-tint" class="font-mono text-emerald-600">0</span>
                  </div>
                  <input type="range" id="es-inp-tint" min="-100" max="100" value="0" class="w-full accent-emerald-600">
                </div>
              </div>
            </div>

            <!-- Tab 3: Quality & Detail (Category B & E) -->
            <div id="tab-pane-detail" class="es-tab-pane space-y-5 hidden">
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                
                <div class="space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div class="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                    <span>Image Sharpening (0 to 100)</span>
                    <span id="es-val-sharpness" class="font-mono text-emerald-600">22</span>
                  </div>
                  <input type="range" id="es-inp-sharpness" min="0" max="100" value="22" class="w-full accent-emerald-600">
                </div>

                <div class="space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div class="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                    <span>Deblur (Laplacian Filter)</span>
                    <span id="es-val-deblur" class="font-mono text-emerald-600">0</span>
                  </div>
                  <input type="range" id="es-inp-deblur" min="0" max="100" value="0" class="w-full accent-emerald-600">
                </div>

                <div class="space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div class="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                    <span>Denoise & Despeckle</span>
                    <span id="es-val-denoise" class="font-mono text-emerald-600">0</span>
                  </div>
                  <input type="range" id="es-inp-denoise" min="0" max="100" value="0" class="w-full accent-emerald-600">
                </div>

                <div class="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer">
                  <input type="checkbox" id="es-chk-upscale" class="w-4 h-4 text-indigo-600 rounded accent-indigo-600">
                  <div>
                    <label for="es-chk-upscale" class="font-bold text-slate-800 dark:text-slate-200 cursor-pointer">AI 2.5x Super-Resolution</label>
                    <p class="text-[10px] text-slate-400">2.5x high-DPI supersampling on export</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tab 4: Doc Restoration (Category C) -->
            <div id="tab-pane-restore" class="es-tab-pane space-y-4 hidden">
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                
                <label class="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-emerald-400 transition">
                  <input type="checkbox" id="es-chk-removeGreyBg" checked class="w-4 h-4 text-emerald-600 rounded accent-emerald-600 mt-0.5">
                  <div>
                    <span class="font-extrabold text-slate-800 dark:text-slate-100 block">Remove Grey Background</span>
                    <span class="text-[10px] text-slate-500">Converts dirty grey paper into clean bright paper</span>
                  </div>
                </label>

                <label class="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-emerald-400 transition">
                  <input type="checkbox" id="es-chk-removeYellowTint" class="w-4 h-4 text-emerald-600 rounded accent-emerald-600 mt-0.5">
                  <div>
                    <span class="font-extrabold text-slate-800 dark:text-slate-100 block">Remove Yellow Tint</span>
                    <span class="text-[10px] text-slate-500">Neutralizes yellow discoloration in aged scanned pages</span>
                  </div>
                </label>

                <label class="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-emerald-400 transition">
                  <input type="checkbox" id="es-chk-removePaperShadows" class="w-4 h-4 text-emerald-600 rounded accent-emerald-600 mt-0.5">
                  <div>
                    <span class="font-extrabold text-slate-800 dark:text-slate-100 block">Remove Paper Shadows</span>
                    <span class="text-[10px] text-slate-500">Compensates scanner gutter shadows and corner fall-off</span>
                  </div>
                </label>

                <label class="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-emerald-400 transition">
                  <input type="checkbox" id="es-chk-removeBleedThrough" class="w-4 h-4 text-emerald-600 rounded accent-emerald-600 mt-0.5">
                  <div>
                    <span class="font-extrabold text-slate-800 dark:text-slate-100 block">Remove Bleed-Through</span>
                    <span class="text-[10px] text-slate-500">Suppresses reverse-side ghosted text and drawings</span>
                  </div>
                </label>

                <label class="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-emerald-400 transition">
                  <input type="checkbox" id="es-chk-adaptiveThreshold" class="w-4 h-4 text-emerald-600 rounded accent-emerald-600 mt-0.5">
                  <div>
                    <span class="font-extrabold text-slate-800 dark:text-slate-100 block">Adaptive Threshold (Binarize)</span>
                    <span class="text-[10px] text-slate-500">Crisp high-contrast B&W conversion for difficult scans</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <!-- Category E: Page Scope & Batch Export Action Bar -->
          <div class="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
            
            <!-- Page Scope Selector -->
            <div class="space-y-1.5 w-full md:w-auto">
              <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Page Enhancement Scope:</span>
              <div class="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <label class="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="es-page-scope" value="all" checked class="text-emerald-600 accent-emerald-600">
                  <span>All Pages (<strong id="es-scope-all-count">1</strong>)</span>
                </label>
                <label class="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="es-page-scope" value="current" class="text-emerald-600 accent-emerald-600">
                  <span>Current Page Only (<span id="es-scope-cur-num">Page 1</span>)</span>
                </label>
                <label class="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="es-page-scope" value="range" class="text-emerald-600 accent-emerald-600">
                  <span>Range:</span>
                </label>
                <input type="text" id="es-scope-range-input" placeholder="e.g. 1-3, 5" class="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-600 text-xs w-28 bg-white dark:bg-slate-900 outline-none">
              </div>
            </div>

            <!-- Primary Action Button -->
            <button id="es-export-btn" class="w-full md:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 text-white font-black text-sm shadow-xl shadow-emerald-600/25 transition-all flex items-center justify-center gap-2.5 hover:scale-[1.02] active:scale-[0.98]">
              <i data-lucide="sparkles" class="w-5 h-5 text-emerald-200"></i>
              <span>Enhance & Download PDF</span>
            </button>
          </div>

        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // DOM Elements
    const dropzone = container.querySelector('#es-dropzone');
    const fileInput = container.querySelector('#es-file-input');
    const statusEl = container.querySelector('#es-file-status');
    const workspace = container.querySelector('#es-workspace');
    const resetAllBtn = container.querySelector('#es-btn-reset-all');

    const splitWrapper = container.querySelector('#es-split-wrapper');
    const canvasOrig = container.querySelector('#es-canvas-orig');
    const canvasEnh = container.querySelector('#es-canvas-enh');
    const enhancedWrap = container.querySelector('#es-enhanced-wrap');
    const splitDivider = container.querySelector('#es-split-divider');

    const modeSplitBtn = container.querySelector('#es-mode-split');
    const modeAfterBtn = container.querySelector('#es-mode-after');
    const modeBeforeBtn = container.querySelector('#es-mode-before');

    const zoomOutBtn = container.querySelector('#es-zoom-out');
    const zoomInBtn = container.querySelector('#es-zoom-in');
    const zoomVal = container.querySelector('#es-zoom-val');
    const zoomResetBtn = container.querySelector('#es-zoom-reset');

    const prevPageBtn = container.querySelector('#es-prev-page');
    const nextPageBtn = container.querySelector('#es-next-page');
    const pageNumEl = container.querySelector('#es-page-num');
    const pageTotalEl = container.querySelector('#es-page-total');
    const scopeAllCount = container.querySelector('#es-scope-all-count');
    const scopeCurNum = container.querySelector('#es-scope-cur-num');
    const scopeRangeInput = container.querySelector('#es-scope-range-input');
    const exportBtn = container.querySelector('#es-export-btn');

    // Controls mapping
    const sliders = [
      'brightness', 'contrast', 'exposure', 'gamma', 'highlights', 'shadows',
      'blackPoint', 'whitePoint', 'saturation', 'vibrance', 'temperature', 'tint',
      'sharpness', 'deblur', 'denoise'
    ];
    const checkboxes = [
      'removeGreyBg', 'removeYellowTint', 'removePaperShadows', 'removeBleedThrough',
      'adaptiveThreshold'
    ];

    // Synchronize UI inputs to state
    const syncInputsFromState = () => {
      sliders.forEach(key => {
        const inp = container.querySelector(`#es-inp-${key}`);
        const valEl = container.querySelector(`#es-val-${key}`);
        if (inp) inp.value = state[key];
        if (valEl) {
          const val = state[key];
          if (key === 'exposure') valEl.innerText = `${val > 0 ? '+' : ''}${val.toFixed(1)} EV`;
          else if (key === 'gamma') valEl.innerText = val.toFixed(2);
          else valEl.innerText = `${val > 0 ? '+' : ''}${val}`;
        }
      });

      checkboxes.forEach(key => {
        const chk = container.querySelector(`#es-chk-${key}`);
        if (chk) chk.checked = !!state[key];
      });

      const upscaleChk = container.querySelector('#es-chk-upscale');
      if (upscaleChk) upscaleChk.checked = !!state.upscale2x;
    };

    // Apply live enhancement to preview canvas
    const updateEnhancedCanvas = () => {
      if (!canvasOrig || canvasOrig.width === 0) return;
      const ctxEnh = canvasEnh.getContext('2d');
      ctxEnh.clearRect(0, 0, canvasEnh.width, canvasEnh.height);
      ctxEnh.drawImage(canvasOrig, 0, 0);

      window.pdfEngine.applyAdvancedEnhanceToCanvas(canvasEnh, state);
    };

    const scheduleUpdate = () => {
      if (renderDebounceTimer) clearTimeout(renderDebounceTimer);
      renderDebounceTimer = setTimeout(updateEnhancedCanvas, 20);
    };

    // Bind slider and checkbox input events
    sliders.forEach(key => {
      const inp = container.querySelector(`#es-inp-${key}`);
      const valEl = container.querySelector(`#es-val-${key}`);
      if (inp) {
        inp.addEventListener('input', (e) => {
          state[key] = parseFloat(e.target.value);
          if (valEl) {
            const val = state[key];
            if (key === 'exposure') valEl.innerText = `${val > 0 ? '+' : ''}${val.toFixed(1)} EV`;
            else if (key === 'gamma') valEl.innerText = val.toFixed(2);
            else valEl.innerText = `${val > 0 ? '+' : ''}${val}`;
          }
          scheduleUpdate();
        });
      }
    });

    checkboxes.forEach(key => {
      const chk = container.querySelector(`#es-chk-${key}`);
      if (chk) {
        chk.addEventListener('change', (e) => {
          state[key] = e.target.checked;
          scheduleUpdate();
        });
      }
    });

    const upscaleChk = container.querySelector('#es-chk-upscale');
    if (upscaleChk) {
      upscaleChk.addEventListener('change', (e) => {
        state.upscale2x = e.target.checked;
      });
    }

    // Category Tabs Switching
    const tabBtns = container.querySelectorAll('.es-tab-btn');
    const tabPanes = container.querySelectorAll('.es-tab-pane');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.dataset.tab;
        tabBtns.forEach(b => {
          b.className = 'es-tab-btn px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700';
        });
        btn.className = 'es-tab-btn px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700';

        tabPanes.forEach(pane => {
          pane.classList.toggle('hidden', pane.id !== `tab-pane-${targetTab}`);
        });
      });
    });

    // Preset Switching Logic (Categories F & D)
    const applyPreset = (presetName) => {
      activePreset = presetName;
      state.preset = presetName;

      // Update preset cards UI
      container.querySelectorAll('.es-preset-card').forEach(card => {
        const isMatch = card.dataset.preset === presetName;
        if (isMatch) {
          card.className = 'es-preset-card p-3 rounded-2xl border-2 border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-left transition flex flex-col gap-1 active shadow-xs';
        } else {
          card.className = 'es-preset-card p-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-emerald-400 bg-white dark:bg-slate-800 text-left transition flex flex-col gap-1';
        }
      });

      // Default baseline values
      state.brightness = 0;
      state.contrast = 0;
      state.exposure = 0;
      state.gamma = 1.0;
      state.highlights = 0;
      state.shadows = 0;
      state.blackPoint = 0;
      state.whitePoint = 255;
      state.saturation = 0;
      state.vibrance = 0;
      state.temperature = 0;
      state.tint = 0;
      state.sharpness = 0;
      state.deblur = 0;
      state.denoise = 0;
      state.removeGreyBg = false;
      state.removeYellowTint = false;
      state.removePaperShadows = false;
      state.removeBleedThrough = false;
      state.adaptiveThreshold = false;

      if (presetName === 'auto') {
        state.contrast = 20;
        state.vibrance = 15;
        state.sharpness = 22;
        state.removeGreyBg = true;
      } else if (presetName === 'text-clarity') {
        state.removeGreyBg = true;
        state.contrast = 45;
        state.blackPoint = 35;
        state.whitePoint = 210;
        state.sharpness = 35;
        state.brightness = 5;
      } else if (presetName === 'color-restore') {
        state.contrast = 25;
        state.saturation = 35;
        state.vibrance = 30;
        state.removeYellowTint = true;
        state.whitePoint = 235;
        state.sharpness = 20;
      } else if (presetName === 'scan-cleanup') {
        state.removeGreyBg = true;
        state.removeYellowTint = true;
        state.removePaperShadows = true;
        state.removeBleedThrough = true;
        state.contrast = 35;
        state.whitePoint = 205;
        state.blackPoint = 25;
        state.sharpness = 25;
      } else if (presetName === 'sharpen-deblur') {
        state.sharpness = 55;
        state.deblur = 40;
        state.contrast = 15;
      } else if (presetName === 'ai-upscale') {
        state.sharpness = 40;
        state.contrast = 12;
        state.denoise = 15;
        state.upscale2x = true;
      } else if (presetName === 'old-document') {
        state.removeYellowTint = true;
        state.removeGreyBg = true;
        state.removePaperShadows = true;
        state.removeBleedThrough = true;
        state.contrast = 30;
        state.whitePoint = 220;
        state.blackPoint = 20;
        state.sharpness = 30;
      }

      syncInputsFromState();
      updateEnhancedCanvas();
    };

    container.querySelectorAll('.es-preset-card').forEach(card => {
      card.addEventListener('click', () => {
        applyPreset(card.dataset.preset);
      });
    });

    // Reset All Adjustments
    resetAllBtn.addEventListener('click', () => {
      state.preset = 'custom';
      sliders.forEach(k => {
        if (k === 'gamma') state[k] = 1.0;
        else if (k === 'whitePoint') state[k] = 255;
        else state[k] = 0;
      });
      checkboxes.forEach(k => { state[k] = false; });
      state.upscale2x = false;

      container.querySelectorAll('.es-preset-card').forEach(card => {
        card.className = 'es-preset-card p-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-emerald-400 bg-white dark:bg-slate-800 text-left transition flex flex-col gap-1';
      });

      syncInputsFromState();
      updateEnhancedCanvas();
      UI.showToast('Adjustments reset to default', 'info');
    });

    // Draggable Split Divider Comparison Logic (Category E)
    const setSplitPosition = (clientX) => {
      if (!splitWrapper) return;
      const rect = splitWrapper.getBoundingClientRect();
      if (rect.width === 0) return;
      let pct = ((clientX - rect.left) / rect.width) * 100;
      pct = Math.max(0, Math.min(100, pct));
      splitPercent = pct;
      splitDivider.style.left = `${pct}%`;
      enhancedWrap.style.clipPath = `inset(0 0 0 ${pct}%)`;
    };

    splitDivider.addEventListener('mousedown', (e) => {
      isSplitDragging = true;
      e.preventDefault();
    });

    splitWrapper.addEventListener('mousedown', (e) => {
      isSplitDragging = true;
      setSplitPosition(e.clientX);
    });

    window.addEventListener('mousemove', (e) => {
      if (!isSplitDragging) return;
      setSplitPosition(e.clientX);
    });

    window.addEventListener('mouseup', () => {
      isSplitDragging = false;
    });

    // Touch support for mobile / touchpads
    splitDivider.addEventListener('touchstart', () => { isSplitDragging = true; }, { passive: true });
    splitWrapper.addEventListener('touchstart', (e) => {
      isSplitDragging = true;
      if (e.touches && e.touches[0]) setSplitPosition(e.touches[0].clientX);
    }, { passive: true });
    window.addEventListener('touchmove', (e) => {
      if (!isSplitDragging || !e.touches || !e.touches[0]) return;
      setSplitPosition(e.touches[0].clientX);
    }, { passive: true });
    window.addEventListener('touchend', () => { isSplitDragging = false; });

    // Mode Buttons: Split, After Only, Before Only
    modeSplitBtn.addEventListener('click', () => {
      setSplitPosition(splitWrapper.getBoundingClientRect().left + splitWrapper.getBoundingClientRect().width * 0.5);
      splitDivider.classList.remove('hidden');
    });

    modeAfterBtn.addEventListener('click', () => {
      setSplitPosition(splitWrapper.getBoundingClientRect().left);
      splitDivider.classList.add('hidden');
    });

    modeBeforeBtn.addEventListener('click', () => {
      setSplitPosition(splitWrapper.getBoundingClientRect().left + splitWrapper.getBoundingClientRect().width);
      splitDivider.classList.add('hidden');
    });

    // Document Page Rendering at Current Zoom
    const renderPage = async (pageIdx) => {
      if (!pdfDoc) return;
      currentPageNum = pageIdx;
      pageNumEl.innerText = currentPageNum;
      pageTotalEl.innerText = totalPages;
      if (scopeCurNum) scopeCurNum.innerText = `Page ${currentPageNum}`;
      prevPageBtn.disabled = currentPageNum <= 1;
      nextPageBtn.disabled = currentPageNum >= totalPages;

      const baseWidth = Math.min(840, Math.max(500, window.innerWidth - 120));
      const targetWidth = Math.round(baseWidth * currentZoom);

      await window.pdfEngine.renderPageToCanvas(pdfDoc, currentPageNum, canvasOrig, targetWidth);
      canvasEnh.width = canvasOrig.width;
      canvasEnh.height = canvasOrig.height;

      updateEnhancedCanvas();
      setSplitPosition(splitWrapper.getBoundingClientRect().left + splitWrapper.getBoundingClientRect().width * (splitPercent / 100));
    };

    // Zoom Controls
    zoomInBtn.addEventListener('click', () => {
      currentZoom = Math.min(2.5, Math.round((currentZoom + 0.25) * 100) / 100);
      zoomVal.innerText = `${Math.round(currentZoom * 100)}%`;
      renderPage(currentPageNum);
    });

    zoomOutBtn.addEventListener('click', () => {
      currentZoom = Math.max(0.5, Math.round((currentZoom - 0.25) * 100) / 100);
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

    // Dropzone & File Loading
    UI.setupDropzone(dropzone, fileInput, async (files) => {
      if (files.length === 0) return;
      currentFile = files[0];
      statusEl.innerText = `${currentFile.name} (${window.pdfEngine.formatBytes(currentFile.size)})`;
      currentBuffer = await window.pdfEngine.readFileAsArrayBuffer(currentFile);
      workspace.classList.remove('hidden');

      pdfDoc = await window.pdfEngine.getPdfJsDoc(currentBuffer);
      totalPages = pdfDoc.numPages;
      scopeAllCount.innerText = totalPages;
      currentZoom = 1.0;
      zoomVal.innerText = '100%';

      applyPreset('auto');
      await renderPage(1);
    });

    // Export & Batch Process (Category E)
    exportBtn.addEventListener('click', async () => {
      if (!currentBuffer && !currentFile) return;

      const scopeEl = container.querySelector('input[name="es-page-scope"]:checked');
      const scopeVal = scopeEl ? scopeEl.value : 'all';

      let pageSelection = 'all';
      if (scopeVal === 'current') {
        pageSelection = [currentPageNum];
      } else if (scopeVal === 'range') {
        const rangeText = scopeRangeInput.value.trim();
        if (!rangeText) {
          UI.showToast('Please specify a page range (e.g. 1-3, 5)', 'warning');
          return;
        }
        pageSelection = rangeText;
      }

      try {
        UI.showProgress(0.05, `Enhancing ${currentFile.name} with ${activePreset.toUpperCase()} preset...`);
        const bufferToUse = currentBuffer?.byteLength > 0 ? currentBuffer : await currentFile.arrayBuffer();

        const enhancedBlob = await window.pdfEngine.enhancePdfDocument(
          window.pdfEngine.cloneBuffer(bufferToUse),
          state,
          pageSelection,
          (pct, status) => UI.showProgress(pct, status)
        );

        UI.hideProgress();
        UI.celebrate();
        UI.showToast('Document enhanced and restored successfully!', 'success');
        UI.showResultPreview({
          title: 'Enhanced Document Ready',
          subtitle: `Preset: ${activePreset.toUpperCase()} | Sharpen: ${state.sharpness} | Contrast: ${state.contrast}`,
          blob: enhancedBlob,
          filename: `${currentFile.name.replace(/\.pdf$/i, '')}_enhanced.pdf`
        });
      } catch (err) {
        UI.hideProgress();
        UI.showToast(`Error enhancing document: ${err.message}`, 'error');
      }
    });
  }
};

window.OptimizeTools = OptimizeTools;

