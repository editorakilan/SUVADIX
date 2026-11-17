/**
 * PDF Suite - Organize Tools
 * Merge, Split, Remove Pages, Extract Pages, Organize, Scan to PDF
 */

const OrganizeTools = {
  // 1. MERGE PDF
  renderMerge(container) {
    let files = [];

    container.innerHTML = `
      <div class="max-w-3xl mx-auto space-y-6">
        <div class="text-center space-y-2">
          <h2 class="text-2xl font-bold tracking-tight">Merge PDF Files</h2>
          <p class="text-sm text-slate-500">Combine multiple PDF files into a single document in any order with zero quality loss.</p>
        </div>

        <div id="merge-dropzone" class="dropzone p-8 rounded-2xl text-center cursor-pointer hover:border-red-500 transition">
          <input type="file" id="merge-file-input" multiple accept="application/pdf" class="hidden">
          <div class="flex flex-col items-center gap-3">
            <div class="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center">
              <i data-lucide="files" class="w-8 h-8"></i>
            </div>
            <div>
              <p class="font-semibold text-slate-700 dark:text-slate-200">Click to upload or drag & drop PDFs</p>
              <p class="text-xs text-slate-400 mt-1">Select 2 or more PDF documents</p>
            </div>
          </div>
        </div>

        <div id="merge-file-list" class="space-y-2 hidden"></div>

        <div id="merge-actions" class="flex justify-end gap-3 hidden">
          <button id="merge-clear-btn" class="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-medium text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition">Clear All</button>
          <button id="merge-run-btn" class="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-sm shadow-lg shadow-red-600/20 transition flex items-center gap-2">
            <i data-lucide="merge" class="w-4 h-4"></i>
            <span>Merge PDF</span>
          </button>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const dropzone = container.querySelector('#merge-dropzone');
    const input = container.querySelector('#merge-file-input');
    const listEl = container.querySelector('#merge-file-list');
    const actionsEl = container.querySelector('#merge-actions');
    const runBtn = container.querySelector('#merge-run-btn');
    const clearBtn = container.querySelector('#merge-clear-btn');

    const updateList = () => {
      if (files.length === 0) {
        listEl.classList.add('hidden');
        actionsEl.classList.add('hidden');
        return;
      }
      listEl.classList.remove('hidden');
      actionsEl.classList.remove('hidden');
      listEl.innerHTML = files.map((f, i) => `
        <div class="flex items-center justify-between p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm" data-index="${i}">
          <div class="flex items-center gap-3 truncate">
            <span class="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-500">${i + 1}</span>
            <span class="font-medium text-sm truncate">${f.name}</span>
            <span class="text-xs text-slate-400">${window.pdfEngine.formatBytes(f.size)}</span>
          </div>
          <div class="flex items-center gap-1">
            <button class="btn-up p-1.5 hover:text-red-500 rounded text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700" title="Move Up" ${i === 0 ? 'disabled style="opacity:0.3"' : ''}>
              <i data-lucide="arrow-up" class="w-4 h-4"></i>
            </button>
            <button class="btn-down p-1.5 hover:text-red-500 rounded text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700" title="Move Down" ${i === files.length - 1 ? 'disabled style="opacity:0.3"' : ''}>
              <i data-lucide="arrow-down" class="w-4 h-4"></i>
            </button>
            <button class="btn-remove p-1.5 hover:text-red-500 rounded text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700" title="Remove">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        </div>
      `).join('');

      if (window.lucide) window.lucide.createIcons();

      // Attach handlers
      listEl.querySelectorAll('.btn-up').forEach((b, idx) => {
        b.addEventListener('click', () => {
          if (idx > 0) {
            const temp = files[idx];
            files[idx] = files[idx - 1];
            files[idx - 1] = temp;
            updateList();
          }
        });
      });

      listEl.querySelectorAll('.btn-down').forEach((b, idx) => {
        b.addEventListener('click', () => {
          if (idx < files.length - 1) {
            const temp = files[idx];
            files[idx] = files[idx + 1];
            files[idx + 1] = temp;
            updateList();
          }
        });
      });

      listEl.querySelectorAll('.btn-remove').forEach((b, idx) => {
        b.addEventListener('click', () => {
          files.splice(idx, 1);
          updateList();
        });
      });
    };

    UI.setupDropzone(dropzone, input, (newFiles) => {
      files = [...files, ...newFiles.filter(f => f.type === 'application/pdf' || f.name.endsWith('.pdf'))];
      updateList();
    });

    clearBtn.addEventListener('click', () => {
      files = [];
      updateList();
    });

    runBtn.addEventListener('click', async () => {
      if (files.length < 2) {
        UI.showToast('Please select at least 2 PDF files to merge.', 'error');
        return;
      }

      try {
        UI.showProgress(0.1, 'Reading files...');
        const buffers = [];
        for (let i = 0; i < files.length; i++) {
          buffers.push(await window.pdfEngine.readFileAsArrayBuffer(files[i]));
        }

        const mergedBlob = await window.pdfEngine.mergePDFs(buffers, (pct, status) => {
          UI.showProgress(pct, status);
        });

        UI.hideProgress();
        UI.celebrate();
        UI.showToast('PDF files merged successfully!', 'success');
        window.pdfEngine.downloadBlob(mergedBlob, 'merged_document.pdf');
      } catch (err) {
        UI.hideProgress();
        UI.showToast(`Error merging PDFs: ${err.message}`, 'error');
      }
    });
  },

  // 2. SPLIT PDF
  renderSplit(container) {
    let currentBuffer = null;
    let currentFile = null;

    container.innerHTML = `
      <div class="max-w-3xl mx-auto space-y-6">
        <div class="text-center space-y-2">
          <h2 class="text-2xl font-bold tracking-tight">Split PDF</h2>
          <p class="text-sm text-slate-500">Extract pages or split your PDF document into multiple separate files.</p>
        </div>

        <div id="split-dropzone" class="dropzone p-8 rounded-2xl text-center cursor-pointer hover:border-red-500 transition">
          <input type="file" id="split-file-input" accept="application/pdf" class="hidden">
          <div class="flex flex-col items-center gap-3">
            <div class="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center">
              <i data-lucide="split" class="w-8 h-8"></i>
            </div>
            <div>
              <p class="font-semibold text-slate-700 dark:text-slate-200">Click to upload or drag & drop a PDF</p>
              <p class="text-xs text-slate-400 mt-1" id="split-file-status">Select 1 PDF document to split</p>
            </div>
          </div>
        </div>

        <div id="split-options" class="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4 hidden">
          <h3 class="font-semibold text-sm">Split Settings</h3>
          
          <div class="space-y-3">
            <label class="flex items-center gap-3 cursor-pointer">
              <input type="radio" name="split-mode" value="all" checked class="text-red-600 focus:ring-red-500">
              <span class="text-sm">Extract every page into individual single-page PDFs (ZIP bundle)</span>
            </label>
            <label class="flex items-center gap-3 cursor-pointer">
              <input type="radio" name="split-mode" value="range" class="text-red-600 focus:ring-red-500">
              <span class="text-sm">Split by custom page ranges (e.g. <code class="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-xs">1-3, 5, 7-10</code>)</span>
            </label>
          </div>

          <div id="split-range-input-wrap" class="hidden pt-2">
            <input type="text" id="split-range-input" placeholder="e.g. 1-2, 3-5" class="w-full px-4 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent focus:ring-2 focus:ring-red-500 outline-none">
          </div>

          <div class="flex justify-end pt-2">
            <button id="split-run-btn" class="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-sm shadow-lg shadow-red-600/20 transition flex items-center gap-2">
              <i data-lucide="scissors" class="w-4 h-4"></i>
              <span>Split PDF</span>
            </button>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const dropzone = container.querySelector('#split-dropzone');
    const input = container.querySelector('#split-file-input');
    const optionsEl = container.querySelector('#split-options');
    const statusEl = container.querySelector('#split-file-status');
    const rangeRadio = container.querySelector('input[value="range"]');
    const allRadio = container.querySelector('input[value="all"]');
    const rangeWrap = container.querySelector('#split-range-input-wrap');
    const rangeInput = container.querySelector('#split-range-input');
    const runBtn = container.querySelector('#split-run-btn');

    [allRadio, rangeRadio].forEach(r => {
      r.addEventListener('change', () => {
        rangeWrap.classList.toggle('hidden', !rangeRadio.checked);
      });
    });

    UI.setupDropzone(dropzone, input, async (files) => {
      if (files.length === 0) return;
      currentFile = files[0];
      statusEl.innerText = `${currentFile.name} (${window.pdfEngine.formatBytes(currentFile.size)})`;
      currentBuffer = await window.pdfEngine.readFileAsArrayBuffer(currentFile);
      optionsEl.classList.remove('hidden');
    });

    runBtn.addEventListener('click', async () => {
      if (!currentBuffer) return;
      const isRange = rangeRadio.checked;
      const rangeStr = isRange ? rangeInput.value.trim() : 'all';

      if (isRange && !rangeStr) {
        UI.showToast('Please specify the page range (e.g. 1-3, 5).', 'error');
        return;
      }

      try {
        UI.showProgress(0.1, 'Splitting PDF pages...');
        const results = await window.pdfEngine.splitPDF(currentBuffer, rangeStr, (pct, status) => {
          UI.showProgress(pct, status);
        });

        if (results.length === 1) {
          window.pdfEngine.downloadBlob(results[0].blob, results[0].name);
        } else if (results.length > 1) {
          UI.showProgress(0.9, 'Packaging split files into ZIP archive...');
          const zipBlob = await window.pdfEngine.createZip(results);
          window.pdfEngine.downloadBlob(zipBlob, `${currentFile.name.replace(/\.pdf$/i, '')}_split.zip`);
        }

        UI.hideProgress();
        UI.celebrate();
        UI.showToast(`Successfully generated ${results.length} split PDF(s)!`, 'success');
      } catch (err) {
        UI.hideProgress();
        UI.showToast(`Error: ${err.message}`, 'error');
      }
    });
  },

  // 3. REMOVE PAGES
  renderRemovePages(container) {
    let currentBuffer = null;
    let pageStates = [];

    container.innerHTML = `
      <div class="max-w-4xl mx-auto space-y-6">
        <div class="text-center space-y-2">
          <h2 class="text-2xl font-bold tracking-tight">Remove PDF Pages</h2>
          <p class="text-sm text-slate-500">Select the pages you wish to delete from your PDF document.</p>
        </div>

        <div id="remove-dropzone" class="dropzone p-8 rounded-2xl text-center cursor-pointer hover:border-red-500 transition">
          <input type="file" id="remove-file-input" accept="application/pdf" class="hidden">
          <div class="flex flex-col items-center gap-3">
            <div class="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center">
              <i data-lucide="trash" class="w-8 h-8"></i>
            </div>
            <p class="font-semibold text-slate-700 dark:text-slate-200">Upload PDF to select pages to remove</p>
          </div>
        </div>

        <div id="remove-workspace" class="space-y-4 hidden">
          <div class="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <span id="remove-summary" class="text-sm font-medium">Click on pages below to mark them for removal</span>
            <button id="remove-run-btn" class="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-sm shadow transition flex items-center gap-2">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
              <span>Remove Selected Pages</span>
            </button>
          </div>
          <div id="remove-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"></div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const dropzone = container.querySelector('#remove-dropzone');
    const input = container.querySelector('#remove-file-input');
    const workspace = container.querySelector('#remove-workspace');
    const grid = container.querySelector('#remove-grid');
    const summary = container.querySelector('#remove-summary');
    const runBtn = container.querySelector('#remove-run-btn');

    UI.setupDropzone(dropzone, input, async (files) => {
      if (files.length === 0) return;
      currentBuffer = await window.pdfEngine.readFileAsArrayBuffer(files[0]);
      workspace.classList.remove('hidden');
      pageStates = await UI.renderPdfThumbnails(currentBuffer, grid, {
        selectable: true,
        onSelectionChange: (states) => {
          pageStates = states;
          const count = states.filter(s => s.selected).length;
          summary.innerText = count > 0 ? `${count} page(s) marked for removal` : 'Click on pages below to mark for removal';
        }
      });
    });

    runBtn.addEventListener('click', async () => {
      const toRemove = pageStates.filter(s => s.selected).map(s => s.originalIndex);
      if (toRemove.length === 0) {
        UI.showToast('Please select at least one page to remove.', 'error');
        return;
      }

      try {
        UI.showProgress(0.3, 'Removing pages...');
        const resultBlob = await window.pdfEngine.removePages(currentBuffer, toRemove);
        UI.hideProgress();
        UI.celebrate();
        UI.showToast('Pages removed successfully!', 'success');
        window.pdfEngine.downloadBlob(resultBlob, 'cleaned_document.pdf');
      } catch (err) {
        UI.hideProgress();
        UI.showToast(err.message, 'error');
      }
    });
  },

  // 4. EXTRACT PAGES
  renderExtractPages(container) {
    let currentBuffer = null;
    let pageStates = [];

    container.innerHTML = `
      <div class="max-w-4xl mx-auto space-y-6">
        <div class="text-center space-y-2">
          <h2 class="text-2xl font-bold tracking-tight">Extract PDF Pages</h2>
          <p class="text-sm text-slate-500">Pick and choose the exact pages you want to keep and export into a new document.</p>
        </div>

        <div id="extract-dropzone" class="dropzone p-8 rounded-2xl text-center cursor-pointer hover:border-red-500 transition">
          <input type="file" id="extract-file-input" accept="application/pdf" class="hidden">
          <div class="flex flex-col items-center gap-3">
            <div class="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center">
              <i data-lucide="folder-output" class="w-8 h-8"></i>
            </div>
            <p class="font-semibold text-slate-700 dark:text-slate-200">Upload PDF to select pages to extract</p>
          </div>
        </div>

        <div id="extract-workspace" class="space-y-4 hidden">
          <div class="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <span id="extract-summary" class="text-sm font-medium">Click on pages to select for extraction</span>
            <button id="extract-run-btn" class="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-sm shadow transition flex items-center gap-2">
              <i data-lucide="download" class="w-4 h-4"></i>
              <span>Extract Selected Pages</span>
            </button>
          </div>
          <div id="extract-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"></div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const dropzone = container.querySelector('#extract-dropzone');
    const input = container.querySelector('#extract-file-input');
    const workspace = container.querySelector('#extract-workspace');
    const grid = container.querySelector('#extract-grid');
    const summary = container.querySelector('#extract-summary');
    const runBtn = container.querySelector('#extract-run-btn');

    UI.setupDropzone(dropzone, input, async (files) => {
      if (files.length === 0) return;
      currentBuffer = await window.pdfEngine.readFileAsArrayBuffer(files[0]);
      workspace.classList.remove('hidden');
      pageStates = await UI.renderPdfThumbnails(currentBuffer, grid, {
        selectable: true,
        onSelectionChange: (states) => {
          pageStates = states;
          const count = states.filter(s => s.selected).length;
          summary.innerText = count > 0 ? `${count} page(s) selected for extraction` : 'Click on pages to select for extraction';
        }
      });
    });

    runBtn.addEventListener('click', async () => {
      const toExtract = pageStates.filter(s => s.selected).map(s => s.originalIndex);
      if (toExtract.length === 0) {
        UI.showToast('Please select at least one page to extract.', 'error');
        return;
      }

      try {
        UI.showProgress(0.3, 'Extracting selected pages...');
        const resultBlob = await window.pdfEngine.extractPages(currentBuffer, toExtract);
        UI.hideProgress();
        UI.celebrate();
        UI.showToast('Pages extracted successfully!', 'success');
        window.pdfEngine.downloadBlob(resultBlob, 'extracted_pages.pdf');
      } catch (err) {
        UI.hideProgress();
        UI.showToast(err.message, 'error');
      }
    });
  },

  // 5. ORGANIZE PDF
  renderOrganize(container) {
    let currentBuffer = null;
    let pageStates = [];

    container.innerHTML = `
      <div class="max-w-4xl mx-auto space-y-6">
        <div class="text-center space-y-2">
          <h2 class="text-2xl font-bold tracking-tight">Organize PDF Pages</h2>
          <p class="text-sm text-slate-500">Rotate, delete, and re-order pages in your PDF document.</p>
        </div>

        <div id="org-dropzone" class="dropzone p-8 rounded-2xl text-center cursor-pointer hover:border-red-500 transition">
          <input type="file" id="org-file-input" accept="application/pdf" class="hidden">
          <div class="flex flex-col items-center gap-3">
            <div class="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center">
              <i data-lucide="layout-grid" class="w-8 h-8"></i>
            </div>
            <p class="font-semibold text-slate-700 dark:text-slate-200">Upload PDF to reorganize</p>
          </div>
        </div>

        <div id="org-workspace" class="space-y-4 hidden">
          <div class="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <span class="text-sm font-medium">Use the controls on each card to rotate or delete</span>
            <button id="org-run-btn" class="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-sm shadow transition flex items-center gap-2">
              <i data-lucide="save" class="w-4 h-4"></i>
              <span>Save Organized PDF</span>
            </button>
          </div>
          <div id="org-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"></div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const dropzone = container.querySelector('#org-dropzone');
    const input = container.querySelector('#org-file-input');
    const workspace = container.querySelector('#org-workspace');
    const grid = container.querySelector('#org-grid');
    const runBtn = container.querySelector('#org-run-btn');

    UI.setupDropzone(dropzone, input, async (files) => {
      if (files.length === 0) return;
      currentBuffer = await window.pdfEngine.readFileAsArrayBuffer(files[0]);
      workspace.classList.remove('hidden');
      pageStates = await UI.renderPdfThumbnails(currentBuffer, grid, {
        rotatable: true,
        deletable: true,
        onSelectionChange: (states) => {
          pageStates = states;
        }
      });
    });

    runBtn.addEventListener('click', async () => {
      const activeConfigs = pageStates.filter(s => !s.deleted);
      if (activeConfigs.length === 0) {
        UI.showToast('You cannot delete all pages.', 'error');
        return;
      }

      try {
        UI.showProgress(0.3, 'Saving reorganized PDF...');
        const resultBlob = await window.pdfEngine.organizePages(currentBuffer, activeConfigs);
        UI.hideProgress();
        UI.celebrate();
        UI.showToast('Organized PDF ready!', 'success');
        window.pdfEngine.downloadBlob(resultBlob, 'organized_document.pdf');
      } catch (err) {
        UI.hideProgress();
        UI.showToast(err.message, 'error');
      }
    });
  },

  // 6. SCAN TO PDF
  renderScan(container) {
    let capturedImages = [];
    let stream = null;

    container.innerHTML = `
      <div class="max-w-3xl mx-auto space-y-6">
        <div class="text-center space-y-2">
          <h2 class="text-2xl font-bold tracking-tight">Scan to PDF</h2>
          <p class="text-sm text-slate-500">Capture pages directly using your device webcam or document camera.</p>
        </div>

        <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
          <div class="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center">
            <video id="scan-video" autoplay playsinline class="w-full h-full object-cover"></video>
            <div id="scan-placeholder" class="absolute inset-0 flex flex-col items-center justify-center text-white bg-slate-900 gap-3">
              <i data-lucide="camera" class="w-12 h-12 text-slate-400"></i>
              <button id="scan-start-cam-btn" class="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-sm transition">Start Camera</button>
            </div>
          </div>

          <div class="flex items-center justify-center gap-3">
            <button id="scan-snap-btn" class="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-sm transition flex items-center gap-2 hidden">
              <i data-lucide="aperture" class="w-4 h-4"></i>
              <span>Take Snapshot</span>
            </button>
            <button id="scan-stop-cam-btn" class="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 font-medium text-xs transition hidden">Stop Camera</button>
          </div>
        </div>

        <div id="scan-snapshots-wrap" class="space-y-3 hidden">
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-sm">Captured Pages (<span id="scan-count">0</span>)</h3>
            <button id="scan-generate-pdf-btn" class="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-sm transition flex items-center gap-2">
              <i data-lucide="file-text" class="w-4 h-4"></i>
              <span>Compile into PDF</span>
            </button>
          </div>
          <div id="scan-thumbnails" class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3"></div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const video = container.querySelector('#scan-video');
    const placeholder = container.querySelector('#scan-placeholder');
    const startCamBtn = container.querySelector('#scan-start-cam-btn');
    const stopCamBtn = container.querySelector('#scan-stop-cam-btn');
    const snapBtn = container.querySelector('#scan-snap-btn');
    const snapsWrap = container.querySelector('#scan-snapshots-wrap');
    const countEl = container.querySelector('#scan-count');
    const thumbsEl = container.querySelector('#scan-thumbnails');
    const generateBtn = container.querySelector('#scan-generate-pdf-btn');

    const updateSnaps = () => {
      countEl.innerText = capturedImages.length;
      if (capturedImages.length === 0) {
        snapsWrap.classList.add('hidden');
        return;
      }
      snapsWrap.classList.remove('hidden');
      thumbsEl.innerHTML = capturedImages.map((img, idx) => `
        <div class="relative group rounded-lg overflow-hidden border border-slate-200 shadow-sm aspect-[3/4]">
          <img src="${img.dataUrl}" class="w-full h-full object-cover">
          <button class="snap-del absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-80 hover:opacity-100 transition" data-idx="${idx}">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
      `).join('');

      thumbsEl.querySelectorAll('.snap-del').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const idx = parseInt(btn.dataset.idx, 10);
          capturedImages.splice(idx, 1);
          updateSnaps();
        });
      });
    };

    startCamBtn.addEventListener('click', async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: 1920, height: 1080 } });
        video.srcObject = stream;
        placeholder.classList.add('hidden');
        snapBtn.classList.remove('hidden');
        stopCamBtn.classList.remove('hidden');
      } catch (err) {
        UI.showToast(`Camera access denied or unavailable: ${err.message}`, 'error');
      }
    });

    const stopCamera = () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
        stream = null;
      }
      placeholder.classList.remove('hidden');
      snapBtn.classList.add('hidden');
      stopCamBtn.classList.add('hidden');
    };

    stopCamBtn.addEventListener('click', stopCamera);

    snapBtn.addEventListener('click', () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        capturedImages.push({
          blob,
          dataUrl: canvas.toDataURL('image/jpeg', 0.95),
          name: `scan_${capturedImages.length + 1}.jpg`,
          type: 'image/jpeg'
        });
        updateSnaps();
        UI.showToast(`Captured Page ${capturedImages.length}!`, 'info');
      }, 'image/jpeg', 0.95);
    });

    generateBtn.addEventListener('click', async () => {
      if (capturedImages.length === 0) return;
      try {
        UI.showProgress(0.3, 'Compiling scanned pages into PDF...');
        const fileList = capturedImages.map(img => new File([img.blob], img.name, { type: 'image/jpeg' }));
        const pdfBlob = await window.pdfEngine.imagesToPDF(fileList, { pageSize: 'A4', orientation: 'portrait' });
        UI.hideProgress();
        UI.celebrate();
        UI.showToast('Scanned PDF created!', 'success');
        window.pdfEngine.downloadBlob(pdfBlob, 'scanned_document.pdf');
      } catch (err) {
        UI.hideProgress();
        UI.showToast(err.message, 'error');
      }
    });
  }
};

window.OrganizeTools = OrganizeTools;
