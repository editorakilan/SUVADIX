/**
 * SUVADIX - Organize Tools
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
          <div class="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-full text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            <svg class="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            <span>100% Vector & Digital Text Preserved (No OCR or downsampling)</span>
          </div>
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
        UI.showResultPreview({
          title: 'PDF Files Merged Successfully',
          subtitle: `${files.length} documents combined with 100% vector & digital text preserved`,
          blob: mergedBlob,
          filename: 'merged_document.pdf'
        });
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
        const bufferToUse = currentBuffer.byteLength > 0 ? currentBuffer : await currentFile.arrayBuffer();
        const results = await window.pdfEngine.splitPDF(window.pdfEngine.cloneBuffer(bufferToUse), rangeStr, (pct, status) => {
          UI.showProgress(pct, status);
        });

        UI.hideProgress();
        UI.celebrate();
        UI.showToast(`Successfully generated ${results.length} split PDF(s)!`, 'success');

        if (results.length === 1) {
          UI.showResultPreview({
            title: 'Split Page Ready',
            subtitle: 'Extracted page is ready for inspection before download',
            blob: results[0].blob,
            filename: results[0].name
          });
        } else if (results.length > 1) {
          UI.showProgress(0.9, 'Packaging split files into ZIP archive...');
          const zipBlob = await window.pdfEngine.createZip(results);
          UI.hideProgress();
          UI.showResultPreview({
            title: 'Split Documents Ready',
            subtitle: `${results.length} split PDF files packaged in ZIP archive`,
            blob: zipBlob,
            filename: `${currentFile.name.replace(/\.pdf$/i, '')}_split.zip`
          });
        }
      } catch (err) {
        UI.hideProgress();
        UI.showToast(`Error: ${err.message}`, 'error');
      }
    });
  },

  // 3. REMOVE PAGES
  renderRemovePages(container) {
    let currentBuffer = null;
    let currentFile = null;
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
          <div class="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <span id="remove-summary" class="text-sm font-medium text-slate-700">Click on pages below to mark them for removal</span>
            <div class="flex items-center gap-3">
              <div class="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1">
                <span>Zoom:</span>
                <button id="remove-scale-down" class="p-1 hover:text-red-600 font-bold" title="Smaller Thumbnails">A-</button>
                <button id="remove-scale-up" class="p-1 hover:text-red-600 font-bold" title="Larger Thumbnails">A+</button>
              </div>
              <button id="remove-close-btn" class="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-sm font-medium transition flex items-center gap-1.5" title="Close Preview & choose another file">
                <i data-lucide="x" class="w-4 h-4 text-slate-500"></i>
                <span>Close Preview</span>
              </button>
              <button id="remove-run-btn" class="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-sm shadow transition flex items-center gap-2">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
                <span>Remove Selected Pages</span>
              </button>
            </div>
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
    const removeCloseBtn = container.querySelector('#remove-close-btn');
    const scaleUp = container.querySelector('#remove-scale-up');
    const scaleDown = container.querySelector('#remove-scale-down');

    if (scaleUp && scaleDown) {
      scaleUp.addEventListener('click', () => {
        grid.className = 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6';
      });
      scaleDown.addEventListener('click', () => {
        grid.className = 'grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3';
      });
    }

    if (removeCloseBtn) {
      removeCloseBtn.addEventListener('click', () => {
        currentBuffer = null;
        currentFile = null;
        pageStates = [];
        workspace.classList.add('hidden');
        dropzone.classList.remove('hidden');
        grid.innerHTML = '';
        input.value = '';
      });
    }

    UI.setupDropzone(dropzone, input, async (files) => {
      if (files.length === 0) return;
      currentFile = files[0];
      currentBuffer = await window.pdfEngine.readFileAsArrayBuffer(currentFile);
      workspace.classList.remove('hidden');
      pageStates = await UI.renderPdfThumbnails(window.pdfEngine.cloneBuffer(currentBuffer), grid, {
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
        const bufferToUse = currentBuffer.byteLength > 0 ? currentBuffer : await currentFile.arrayBuffer();
        const resultBlob = await window.pdfEngine.removePages(window.pdfEngine.cloneBuffer(bufferToUse), toRemove);
        UI.hideProgress();
        UI.celebrate();
        UI.showToast('Pages removed successfully!', 'success');
        UI.showResultPreview({
          title: 'Pages Removed Successfully',
          subtitle: `Removed ${toRemove.length} page(s). Inspect remaining pages before saving`,
          blob: resultBlob,
          filename: `${currentFile ? currentFile.name.replace(/\.pdf$/i, '') : 'document'}_cleaned.pdf`
        });
      } catch (err) {
        UI.hideProgress();
        UI.showToast(err.message, 'error');
      }
    });
  },

  // 4. EXTRACT PAGES
  renderExtractPages(container) {
    let currentBuffer = null;
    let currentFile = null;
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
          <div class="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <span id="extract-summary" class="text-sm font-medium text-slate-700">Click on pages to select for extraction</span>
            <div class="flex items-center gap-3">
              <div class="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1">
                <span>Zoom:</span>
                <button id="extract-scale-down" class="p-1 hover:text-red-600 font-bold" title="Smaller Thumbnails">A-</button>
                <button id="extract-scale-up" class="p-1 hover:text-red-600 font-bold" title="Larger Thumbnails">A+</button>
              </div>
              <button id="extract-close-btn" class="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-sm font-medium transition flex items-center gap-1.5" title="Close Preview & choose another file">
                <i data-lucide="x" class="w-4 h-4 text-slate-500"></i>
                <span>Close Preview</span>
              </button>
              <button id="extract-run-btn" class="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-sm shadow transition flex items-center gap-2">
                <i data-lucide="download" class="w-4 h-4"></i>
                <span>Extract Selected Pages</span>
              </button>
            </div>
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
    const extractCloseBtn = container.querySelector('#extract-close-btn');
    const scaleUp = container.querySelector('#extract-scale-up');
    const scaleDown = container.querySelector('#extract-scale-down');

    if (scaleUp && scaleDown) {
      scaleUp.addEventListener('click', () => {
        grid.className = 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6';
      });
      scaleDown.addEventListener('click', () => {
        grid.className = 'grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3';
      });
    }

    if (extractCloseBtn) {
      extractCloseBtn.addEventListener('click', () => {
        currentBuffer = null;
        currentFile = null;
        pageStates = [];
        workspace.classList.add('hidden');
        dropzone.classList.remove('hidden');
        grid.innerHTML = '';
        input.value = '';
      });
    }

    UI.setupDropzone(dropzone, input, async (files) => {
      if (files.length === 0) return;
      currentFile = files[0];
      currentBuffer = await window.pdfEngine.readFileAsArrayBuffer(currentFile);
      workspace.classList.remove('hidden');
      pageStates = await UI.renderPdfThumbnails(window.pdfEngine.cloneBuffer(currentBuffer), grid, {
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
        const bufferToUse = currentBuffer.byteLength > 0 ? currentBuffer : await currentFile.arrayBuffer();
        const resultBlob = await window.pdfEngine.extractPages(window.pdfEngine.cloneBuffer(bufferToUse), toExtract);
        UI.hideProgress();
        UI.celebrate();
        UI.showToast('Pages extracted successfully!', 'success');
        UI.showResultPreview({
          title: 'Pages Extracted Successfully',
          subtitle: `${toExtract.length} page(s) extracted into new document`,
          blob: resultBlob,
          filename: `${currentFile ? currentFile.name.replace(/\.pdf$/i, '') : 'document'}_extracted.pdf`
        });
      } catch (err) {
        UI.hideProgress();
        UI.showToast(err.message, 'error');
      }
    });
  },

  // 5. ORGANIZE PDF (Swap, Reorder, Rotate & Remove Pages)
  renderOrganize(container) {
    let currentBuffer = null;
    let currentFile = null;
    let pageItems = []; // Array of { originalIndex, originalPageNumber, rotation, deleted, canvasEl }

    container.innerHTML = `
      <div class="max-w-5xl mx-auto space-y-6">
        <div class="text-center space-y-2">
          <h2 class="text-2xl font-bold tracking-tight">Organize PDF & Swap Pages</h2>
          <p class="text-sm text-slate-500">Swap, drag & drop to reorder, rotate, or delete pages in your PDF document.</p>
        </div>

        <div id="org-dropzone" class="dropzone p-8 rounded-2xl text-center cursor-pointer hover:border-orange-500 transition">
          <input type="file" id="org-file-input" accept="application/pdf" class="hidden">
          <div class="flex flex-col items-center gap-3">
            <div class="w-16 h-16 rounded-full bg-orange-50 dark:bg-orange-950/40 text-orange-600 flex items-center justify-center">
              <i data-lucide="layout-grid" class="w-8 h-8"></i>
            </div>
            <div>
              <p class="font-semibold text-slate-700 dark:text-slate-200">Upload PDF to reorganize or swap pages</p>
              <p class="text-xs text-slate-400 mt-1" id="org-file-status">Drag & drop or select a PDF</p>
            </div>
          </div>
        </div>

        <div id="org-workspace" class="space-y-4 hidden">
          <!-- Main Action & Swap Toolbar -->
          <div class="flex flex-wrap items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm gap-4">
            
            <!-- Quick Page Swapper Bar -->
            <div class="flex items-center gap-2 p-2 bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-xl">
              <span class="text-xs font-bold text-orange-800 dark:text-orange-300 flex items-center gap-1.5 whitespace-nowrap">
                <i data-lucide="arrow-left-right" class="w-4 h-4 text-orange-600"></i>
                Swap:
              </span>
              <select id="org-swap-from" class="text-xs font-bold p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none">
              </select>
              <span class="text-xs font-bold text-orange-600">⇄</span>
              <select id="org-swap-to" class="text-xs font-bold p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none">
              </select>
              <button id="org-swap-btn" class="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1">
                <span>Swap</span>
              </button>
            </div>

            <!-- Page Quick Actions -->
            <div class="flex items-center gap-2">
              <button id="org-reverse-btn" class="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5" title="Reverse the entire page order">
                <i data-lucide="refresh-cw" class="w-3.5 h-3.5 text-slate-500"></i>
                <span>Reverse Order</span>
              </button>
              <button id="org-reset-btn" class="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5" title="Reset back to original order">
                <i data-lucide="rotate-ccw" class="w-3.5 h-3.5 text-slate-500"></i>
                <span>Reset Order</span>
              </button>
            </div>

            <!-- Zoom & Controls -->
            <div class="flex items-center gap-2.5">
              <div class="flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1">
                <span>Zoom:</span>
                <button id="org-scale-down" class="p-1 hover:text-orange-600 font-bold" title="Smaller Thumbnails">A-</button>
                <button id="org-scale-up" class="p-1 hover:text-orange-600 font-bold" title="Larger Thumbnails">A+</button>
              </div>
              <button id="org-close-btn" class="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 hover:bg-slate-100 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1" title="Close Preview">
                <i data-lucide="x" class="w-3.5 h-3.5 text-slate-500"></i>
                <span>Close</span>
              </button>
              <button id="org-run-btn" class="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md shadow-orange-600/20 transition flex items-center gap-2">
                <i data-lucide="save" class="w-4 h-4"></i>
                <span>Save PDF</span>
              </button>
            </div>
          </div>

          <!-- Instructions Hint -->
          <div class="flex items-center justify-between text-xs text-slate-500 px-1">
            <span class="flex items-center gap-1.5">
              <i data-lucide="info" class="w-3.5 h-3.5 text-orange-500"></i>
              Drag any card to reorder, or use the <strong>← / →</strong> buttons on cards to swap with adjacent pages.
            </span>
            <span id="org-page-count-badge" class="font-bold text-slate-700 dark:text-slate-300">0 Pages</span>
          </div>

          <!-- Interactive Thumbnails Grid -->
          <div id="org-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"></div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const dropzone = container.querySelector('#org-dropzone');
    const input = container.querySelector('#org-file-input');
    const statusEl = container.querySelector('#org-file-status');
    const workspace = container.querySelector('#org-workspace');
    const grid = container.querySelector('#org-grid');
    const runBtn = container.querySelector('#org-run-btn');
    const orgCloseBtn = container.querySelector('#org-close-btn');
    const scaleUp = container.querySelector('#org-scale-up');
    const scaleDown = container.querySelector('#org-scale-down');
    const swapFrom = container.querySelector('#org-swap-from');
    const swapTo = container.querySelector('#org-swap-to');
    const swapBtn = container.querySelector('#org-swap-btn');
    const reverseBtn = container.querySelector('#org-reverse-btn');
    const resetBtn = container.querySelector('#org-reset-btn');
    const countBadge = container.querySelector('#org-page-count-badge');

    if (scaleUp && scaleDown) {
      scaleUp.addEventListener('click', () => {
        grid.className = 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6';
      });
      scaleDown.addEventListener('click', () => {
        grid.className = 'grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3';
      });
    }

    if (orgCloseBtn) {
      orgCloseBtn.addEventListener('click', () => {
        currentBuffer = null;
        currentFile = null;
        pageItems = [];
        workspace.classList.add('hidden');
        dropzone.classList.remove('hidden');
        grid.innerHTML = '';
        input.value = '';
      });
    }

    // Update Swap Dropdowns
    const updateSwapDropdowns = () => {
      const activePages = pageItems.map((item, idx) => ({ idx, pos: idx + 1, orig: item.originalPageNumber, deleted: item.deleted }));
      swapFrom.innerHTML = '';
      swapTo.innerHTML = '';

      activePages.forEach(({ idx, pos, orig, deleted }) => {
        if (deleted) return;
        const optFrom = document.createElement('option');
        optFrom.value = idx;
        optFrom.innerText = `Page ${pos} (Orig #${orig})`;
        swapFrom.appendChild(optFrom);

        const optTo = document.createElement('option');
        optTo.value = idx;
        optTo.innerText = `Page ${pos} (Orig #${orig})`;
        swapTo.appendChild(optTo);
      });

      // Default second dropdown to second page if available
      if (swapTo.options.length > 1) {
        swapTo.selectedIndex = 1;
      }
    };

    // Render Grid Cards with Full Drag-and-Drop & Arrow Swapping
    const renderGrid = () => {
      grid.innerHTML = '';
      const totalActive = pageItems.filter(p => !p.deleted).length;
      countBadge.innerText = `${totalActive} Active Pages (${pageItems.length} Total)`;

      let dragSourceIdx = null;

      pageItems.forEach((item, index) => {
        const card = document.createElement('div');
        card.draggable = !item.deleted;
        card.dataset.index = index;
        card.className = `page-thumb-card group relative bg-white dark:bg-slate-800 rounded-xl p-3 shadow-sm border ${
          item.deleted ? 'border-red-300 dark:border-red-900 opacity-40 bg-red-50/20' : 'border-slate-200 dark:border-slate-700 hover:border-orange-400 hover:shadow-md'
        } flex flex-col items-center transition-all duration-150`;

        // Card Header: Badge & Move Controls
        const header = document.createElement('div');
        header.className = 'w-full flex items-center justify-between mb-2 text-xs font-bold text-slate-700 dark:text-slate-300';
        
        const isMoved = item.originalIndex !== index;
        header.innerHTML = `
          <div class="flex items-center gap-1.5 cursor-grab active:cursor-grabbing" title="Drag to reorder/swap">
            <span class="w-5 h-5 rounded-md bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 flex items-center justify-center text-[11px] font-extrabold">
              ${index + 1}
            </span>
            ${isMoved ? `<span class="text-[10px] text-slate-400 font-medium">(#${item.originalPageNumber})</span>` : ''}
          </div>
          <div class="flex items-center gap-0.5">
            <button class="move-left-btn p-1 hover:bg-orange-50 text-slate-400 hover:text-orange-600 rounded transition ${index === 0 ? 'opacity-25 pointer-events-none' : ''}" title="Swap with previous page (←)">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/></svg>
            </button>
            <button class="move-right-btn p-1 hover:bg-orange-50 text-slate-400 hover:text-orange-600 rounded transition ${index === pageItems.length - 1 ? 'opacity-25 pointer-events-none' : ''}" title="Swap with next page (→)">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>
        `;

        card.appendChild(header);

        // Canvas container
        const canvasWrapper = document.createElement('div');
        canvasWrapper.className = 'w-full flex items-center justify-center overflow-hidden rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-1 min-h-[160px] cursor-grab';
        
        if (item.canvasEl) {
          item.canvasEl.style.transform = `rotate(${item.rotation}deg)`;
          canvasWrapper.appendChild(item.canvasEl);
        }
        card.appendChild(canvasWrapper);

        // Card Footer: Rotate & Delete Actions
        const footer = document.createElement('div');
        footer.className = 'w-full flex items-center justify-between mt-2 pt-1 border-t border-slate-100 dark:border-slate-700/60 text-xs';
        footer.innerHTML = `
          <button class="rot-btn p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded transition flex items-center gap-1" title="Rotate 90° Clockwise">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            <span class="text-[10px] font-semibold">${item.rotation > 0 ? `${item.rotation}°` : 'Rotate'}</span>
          </button>
          <button class="del-btn p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition flex items-center gap-1" title="${item.deleted ? 'Restore Page' : 'Remove Page'}">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            <span class="text-[10px] font-semibold">${item.deleted ? 'Restore' : 'Delete'}</span>
          </button>
        `;

        card.appendChild(footer);

        // Move Left Click
        card.querySelector('.move-left-btn').addEventListener('click', (e) => {
          e.stopPropagation();
          if (index > 0) {
            const temp = pageItems[index];
            pageItems[index] = pageItems[index - 1];
            pageItems[index - 1] = temp;
            renderGrid();
            updateSwapDropdowns();
            UI.showToast(`Swapped Page ${index + 1} with Page ${index}`, 'info');
          }
        });

        // Move Right Click
        card.querySelector('.move-right-btn').addEventListener('click', (e) => {
          e.stopPropagation();
          if (index < pageItems.length - 1) {
            const temp = pageItems[index];
            pageItems[index] = pageItems[index + 1];
            pageItems[index + 1] = temp;
            renderGrid();
            updateSwapDropdowns();
            UI.showToast(`Swapped Page ${index + 1} with Page ${index + 2}`, 'info');
          }
        });

        // Rotate Click
        card.querySelector('.rot-btn').addEventListener('click', (e) => {
          e.stopPropagation();
          item.rotation = (item.rotation + 90) % 360;
          if (item.canvasEl) {
            item.canvasEl.style.transform = `rotate(${item.rotation}deg)`;
          }
          renderGrid();
        });

        // Delete / Restore Click
        card.querySelector('.del-btn').addEventListener('click', (e) => {
          e.stopPropagation();
          item.deleted = !item.deleted;
          renderGrid();
          updateSwapDropdowns();
        });

        // HTML5 Drag and Drop Events
        card.addEventListener('dragstart', (e) => {
          dragSourceIdx = index;
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', index);
          card.classList.add('opacity-40', 'scale-95');
        });

        card.addEventListener('dragend', () => {
          card.classList.remove('opacity-40', 'scale-95');
          dragSourceIdx = null;
        });

        card.addEventListener('dragover', (e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          card.classList.add('border-orange-500', 'ring-2', 'ring-orange-400');
        });

        card.addEventListener('dragleave', () => {
          card.classList.remove('border-orange-500', 'ring-2', 'ring-orange-400');
        });

        card.addEventListener('drop', (e) => {
          e.preventDefault();
          card.classList.remove('border-orange-500', 'ring-2', 'ring-orange-400');
          const fromIdx = dragSourceIdx !== null ? dragSourceIdx : parseInt(e.dataTransfer.getData('text/plain'), 10);
          const toIdx = index;

          if (fromIdx !== null && !isNaN(fromIdx) && fromIdx !== toIdx) {
            // Move item to new position
            const moved = pageItems.splice(fromIdx, 1)[0];
            pageItems.splice(toIdx, 0, moved);
            renderGrid();
            updateSwapDropdowns();
            UI.showToast(`Moved Page ${fromIdx + 1} to position ${toIdx + 1}`, 'info');
          }
        });

        grid.appendChild(card);
      });
    };

    // Swap Two Chosen Pages via Toolbar
    swapBtn.addEventListener('click', () => {
      const fromIdx = parseInt(swapFrom.value, 10);
      const toIdx = parseInt(swapTo.value, 10);

      if (isNaN(fromIdx) || isNaN(toIdx)) return;
      if (fromIdx === toIdx) {
        UI.showToast('Please select two different pages to swap.', 'warning');
        return;
      }

      const temp = pageItems[fromIdx];
      pageItems[fromIdx] = pageItems[toIdx];
      pageItems[toIdx] = temp;

      renderGrid();
      updateSwapDropdowns();
      UI.celebrate();
      UI.showToast(`Swapped Page ${fromIdx + 1} with Page ${toIdx + 1}!`, 'success');
    });

    // Reverse Order
    reverseBtn.addEventListener('click', () => {
      pageItems.reverse();
      renderGrid();
      updateSwapDropdowns();
      UI.showToast('Reversed all page positions!', 'info');
    });

    // Reset Order
    resetBtn.addEventListener('click', () => {
      pageItems.sort((a, b) => a.originalIndex - b.originalIndex);
      pageItems.forEach(p => { p.rotation = 0; p.deleted = false; });
      renderGrid();
      updateSwapDropdowns();
      UI.showToast('Reset back to original page order.', 'info');
    });

    // File Upload Handler
    UI.setupDropzone(dropzone, input, async (files) => {
      if (files.length === 0) return;
      currentFile = files[0];
      statusEl.innerText = `${currentFile.name} (${window.pdfEngine.formatBytes(currentFile.size)})`;
      currentBuffer = await window.pdfEngine.readFileAsArrayBuffer(currentFile);
      workspace.classList.remove('hidden');

      grid.innerHTML = `
        <div class="col-span-full flex items-center justify-center py-12 text-slate-400">
          <svg class="animate-spin -ml-1 mr-3 h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          <span class="text-sm font-semibold">Generating high-fidelity page previews...</span>
        </div>
      `;

      try {
        const pdfDoc = await window.pdfEngine.getPdfJsDoc(window.pdfEngine.cloneBuffer(currentBuffer));
        const totalPages = pdfDoc.numPages;
        pageItems = [];

        for (let i = 1; i <= totalPages; i++) {
          const canvas = document.createElement('canvas');
          canvas.className = 'max-w-full h-auto transition-transform duration-200 pointer-events-none';
          
          pageItems.push({
            originalIndex: i - 1,
            originalPageNumber: i,
            rotation: 0,
            deleted: false,
            canvasEl: canvas
          });

          // Render canvas in background with HiDPI clarity
          window.pdfEngine.renderPageToCanvas(pdfDoc, i, canvas, 200);
        }

        renderGrid();
        updateSwapDropdowns();
      } catch (err) {
        grid.innerHTML = `<div class="col-span-full p-6 text-center text-red-500 font-semibold">Failed to load PDF pages: ${err.message}</div>`;
      }
    });

    // Save Organized PDF
    runBtn.addEventListener('click', async () => {
      const activeConfigs = pageItems.filter(s => !s.deleted);
      if (activeConfigs.length === 0) {
        UI.showToast('You cannot delete all pages.', 'error');
        return;
      }

      try {
        UI.showProgress(0.3, 'Saving reorganized & swapped pages...');
        const bufferToUse = currentBuffer?.byteLength > 0 ? currentBuffer : await currentFile.arrayBuffer();
        const resultBlob = await window.pdfEngine.organizePages(window.pdfEngine.cloneBuffer(bufferToUse), activeConfigs);
        
        UI.hideProgress();
        UI.celebrate();
        UI.showToast('Organized PDF ready!', 'success');
        
        UI.showResultPreview({
          title: 'Organized PDF Ready',
          subtitle: `Saved ${activeConfigs.length} pages in your custom order. Inspect preview before downloading:`,
          blob: resultBlob,
          filename: `${currentFile ? currentFile.name.replace(/\.pdf$/i, '') : 'document'}_organized.pdf`
        });
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
        UI.showResultPreview({
          title: 'Scanned Document Ready',
          subtitle: `${capturedImages.length} scanned pages compiled into PDF`,
          blob: pdfBlob,
          filename: 'scanned_document.pdf'
        });
      } catch (err) {
        UI.hideProgress();
        UI.showToast(err.message, 'error');
      }
    });
  }
};

window.OrganizeTools = OrganizeTools;

