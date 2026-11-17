/**
 * PDF Suite - Edit PDF Tools
 * Rotate PDF, Add Page Numbers, Advanced Watermark (Text/Image + Live Preview), Advanced Sign PDF (Custom Placement, Multi-page, Image/Draw/Type)
 */

const EditTools = {
  // 1. ROTATE PDF
  // 1. ROTATE PDF (Visual Per-Page & Bulk Rotation)
  renderRotate(container) {
    let currentBuffer = null;
    let currentFile = null;
    let pageStates = []; // array of { pageIndex, rotation, originalOrientation, canvasEl }

    container.innerHTML = `
      <div class="max-w-5xl mx-auto space-y-6">
        <div class="text-center space-y-2">
          <h2 class="text-2xl font-bold tracking-tight">Rotate PDF Pages</h2>
          <p class="text-sm text-slate-500">Rotate individual pages or the entire document. Fix landscape/portrait orientations visually.</p>
        </div>

        <div id="rotate-dropzone" class="dropzone p-8 rounded-2xl text-center cursor-pointer hover:border-purple-500 transition">
          <input type="file" id="rotate-file-input" accept="application/pdf" class="hidden">
          <div class="flex flex-col items-center gap-3">
            <div class="w-16 h-16 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
              <i data-lucide="rotate-cw" class="w-8 h-8"></i>
            </div>
            <div>
              <p class="font-semibold text-slate-700">Upload PDF to rotate pages</p>
              <p class="text-xs text-slate-400 mt-1" id="rotate-file-status">Drag & drop or click</p>
            </div>
          </div>
        </div>

        <!-- Rotate Workspace -->
        <div id="rotate-workspace" class="space-y-4 hidden">
          <!-- Toolbar with Bulk Actions & Thumbnail Scaler -->
          <div class="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center flex-wrap gap-2">
              <button id="rot-all-cw" class="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 transition flex items-center gap-1.5">
                <i data-lucide="rotate-cw" class="w-3.5 h-3.5 text-purple-600"></i>
                <span>Rotate All +90°</span>
              </button>
              <button id="rot-all-ccw" class="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 transition flex items-center gap-1.5">
                <i data-lucide="rotate-ccw" class="w-3.5 h-3.5 text-purple-600"></i>
                <span>Rotate All -90°</span>
              </button>
              <button id="rot-reset-all" class="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-500 hover:text-slate-800 transition flex items-center gap-1.5">
                <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i>
                <span>Reset</span>
              </button>
            </div>

            <!-- Thumbnail Size Scaler & Action Buttons -->
            <div class="flex items-center gap-3">
              <div class="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1">
                <span>Thumbnail Size:</span>
                <button id="rot-scale-down" class="p-1 hover:text-purple-600 font-bold" title="Smaller Thumbnails">A-</button>
                <button id="rot-scale-up" class="p-1 hover:text-purple-600 font-bold" title="Larger Thumbnails">A+</button>
              </div>

              <button id="rot-close-preview-btn" class="px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-xs font-bold text-slate-700 transition flex items-center gap-1.5" title="Close and choose another file">
                <i data-lucide="x" class="w-3.5 h-3.5 text-slate-500"></i>
                <span>Close Preview</span>
              </button>

              <button id="rotate-run-btn" class="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition flex items-center gap-2">
                <i data-lucide="save" class="w-4 h-4"></i>
                <span>Save Rotated PDF</span>
              </button>
            </div>
          </div>

          <!-- Page Thumbnails Grid -->
          <div id="rotate-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <!-- Dynamically populated page cards -->
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const dropzone = container.querySelector('#rotate-dropzone');
    const input = container.querySelector('#rotate-file-input');
    const statusEl = container.querySelector('#rotate-file-status');
    const workspace = container.querySelector('#rotate-workspace');
    const grid = container.querySelector('#rotate-grid');
    const runBtn = container.querySelector('#rotate-run-btn');
    const closeBtn = container.querySelector('#rot-close-preview-btn');
    const rotAllCw = container.querySelector('#rot-all-cw');
    const rotAllCcw = container.querySelector('#rot-all-ccw');
    const rotResetAll = container.querySelector('#rot-reset-all');
    const scaleUp = container.querySelector('#rot-scale-up');
    const scaleDown = container.querySelector('#rot-scale-down');

    let thumbWidth = 180;

    const renderThumbnails = async () => {
      grid.innerHTML = `
        <div class="col-span-full py-12 text-center text-slate-400 flex items-center justify-center gap-2">
          <svg class="animate-spin h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
          <span>Loading page previews...</span>
        </div>
      `;

      const pdfDoc = await window.pdfEngine.getPdfJsDoc(window.pdfEngine.cloneBuffer(currentBuffer));
      const totalPages = pdfDoc.numPages;
      grid.innerHTML = '';
      pageStates = [];

      for (let i = 1; i <= totalPages; i++) {
        const pageIdx = i - 1;
        const page = await pdfDoc.getPage(i);
        const vp = page.getViewport({ scale: 1.0 });
        const isLandscape = vp.width > vp.height;

        const state = {
          pageIndex: pageIdx,
          rotation: 0, // Delta rotation in degrees
          initialOrientation: isLandscape ? 'Landscape' : 'Portrait',
          cardEl: null,
          canvasEl: null,
          badgeEl: null
        };
        pageStates.push(state);

        const card = document.createElement('div');
        card.className = 'page-thumb-card bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center gap-2 transition hover:shadow-md';
        card.dataset.pageIndex = pageIdx;
        state.cardEl = card;

        // Header info
        const cardHeader = document.createElement('div');
        cardHeader.className = 'w-full flex items-center justify-between text-[11px] font-bold text-slate-500';
        cardHeader.innerHTML = `
          <span>Page ${i}</span>
          <span class="rot-badge px-1.5 py-0.5 rounded bg-slate-100 text-[10px] text-slate-600 font-mono">0°</span>
        `;
        state.badgeEl = cardHeader.querySelector('.rot-badge');
        card.appendChild(cardHeader);

        // Canvas container
        const canvasWrapper = document.createElement('div');
        canvasWrapper.className = 'w-full h-48 flex items-center justify-center overflow-hidden rounded-lg bg-slate-50 border border-slate-100 p-1';

        const canvas = document.createElement('canvas');
        canvas.className = 'max-w-full max-h-full object-contain transition-transform duration-300 shadow-sm';
        state.canvasEl = canvas;
        canvasWrapper.appendChild(canvas);
        card.appendChild(canvasWrapper);

        // Rotation control buttons for this individual page
        const ctrlBar = document.createElement('div');
        ctrlBar.className = 'w-full flex items-center justify-between pt-1 gap-1';
        ctrlBar.innerHTML = `
          <button class="btn-rot-ccw flex-1 py-1 rounded-lg border border-slate-200 hover:bg-purple-50 hover:text-purple-600 text-slate-600 text-xs font-semibold flex items-center justify-center gap-1 transition" title="Rotate Left 90°">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a5 5 0 015 5v2m-15-7l4-4m-4 4l4 4"/></svg>
            <span>-90°</span>
          </button>
          <button class="btn-rot-cw flex-1 py-1 rounded-lg border border-slate-200 hover:bg-purple-50 hover:text-purple-600 text-slate-600 text-xs font-semibold flex items-center justify-center gap-1 transition" title="Rotate Right 90°">
            <span>+90°</span>
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 10H11a5 5 0 00-5 5v2m15-7l-4-4m4 4l-4 4"/></svg>
          </button>
        `;

        ctrlBar.querySelector('.btn-rot-cw').addEventListener('click', () => {
          state.rotation = (state.rotation + 90) % 360;
          updateCardVisual(state);
        });

        ctrlBar.querySelector('.btn-rot-ccw').addEventListener('click', () => {
          state.rotation = (state.rotation - 90 + 360) % 360;
          updateCardVisual(state);
        });

        card.appendChild(ctrlBar);
        grid.appendChild(card);

        // Render page
        window.pdfEngine.renderPageToCanvas(pdfDoc, i, canvas, thumbWidth);
      }
    };

    const updateCardVisual = (state) => {
      state.canvasEl.style.transform = `rotate(${state.rotation}deg)`;
      state.badgeEl.innerText = `${state.rotation}°`;
      if (state.rotation !== 0) {
        state.badgeEl.className = 'rot-badge px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 text-[10px] font-mono font-bold';
      } else {
        state.badgeEl.className = 'rot-badge px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-mono';
      }
    };

    // Bulk rotate handlers
    rotAllCw.addEventListener('click', () => {
      pageStates.forEach(s => {
        s.rotation = (s.rotation + 90) % 360;
        updateCardVisual(s);
      });
    });

    rotAllCcw.addEventListener('click', () => {
      pageStates.forEach(s => {
        s.rotation = (s.rotation - 90 + 360) % 360;
        updateCardVisual(s);
      });
    });

    rotResetAll.addEventListener('click', () => {
      pageStates.forEach(s => {
        s.rotation = 0;
        updateCardVisual(s);
      });
    });

    // Scaler handlers
    scaleUp.addEventListener('click', () => {
      grid.className = 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6';
    });

    scaleDown.addEventListener('click', () => {
      grid.className = 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3';
    });

    // Dropzone load
    UI.setupDropzone(dropzone, input, async (files) => {
      if (files.length === 0) return;
      currentFile = files[0];
      statusEl.innerText = `${currentFile.name} (${window.pdfEngine.formatBytes(currentFile.size)})`;
      currentBuffer = await window.pdfEngine.readFileAsArrayBuffer(currentFile);
      workspace.classList.remove('hidden');
      await renderThumbnails();
    });

    // Close preview & reset
    closeBtn.addEventListener('click', () => {
      currentBuffer = null;
      currentFile = null;
      pageStates = [];
      workspace.classList.add('hidden');
      dropzone.classList.remove('hidden');
      statusEl.innerText = 'Drag & drop or click';
      input.value = '';
    });

    // Save Rotated PDF
    runBtn.addEventListener('click', async () => {
      if (!currentBuffer && !currentFile) return;
      try {
        UI.showProgress(0.3, 'Applying per-page rotations...');
        const bufferToUse = currentBuffer?.byteLength > 0 ? currentBuffer : await currentFile.arrayBuffer();
        
        // Build rotation list
        const rotationMap = pageStates.map(s => ({
          pageIndex: s.pageIndex,
          rotation: s.rotation
        }));

        const rotatedBlob = await window.pdfEngine.rotatePages(window.pdfEngine.cloneBuffer(bufferToUse), rotationMap);
        
        UI.hideProgress();
        UI.celebrate();
        UI.showToast('Rotated PDF ready for review!', 'success');
        UI.showResultPreview({
          title: 'Rotated PDF Ready',
          subtitle: 'Per-page rotations applied successfully. Inspect below before saving',
          blob: rotatedBlob,
          filename: `${currentFile.name.replace(/\.pdf$/i, '')}_rotated.pdf`
        });
      } catch (err) {
        UI.hideProgress();
        UI.showToast(err.message, 'error');
      }
    });
  },

  // 2. ADD PAGE NUMBERS
  renderAddPageNumbers(container) {
    let currentBuffer = null;
    let currentFile = null;

    container.innerHTML = `
      <div class="max-w-3xl mx-auto space-y-6">
        <div class="text-center space-y-2">
          <h2 class="text-2xl font-bold tracking-tight">Add Page Numbers</h2>
          <p class="text-sm text-slate-500">Insert custom numbered pagination across your PDF document.</p>
        </div>

        <div id="pnum-dropzone" class="dropzone p-8 rounded-2xl text-center cursor-pointer hover:border-purple-500 transition">
          <input type="file" id="pnum-file-input" accept="application/pdf" class="hidden">
          <div class="flex flex-col items-center gap-3">
            <div class="w-16 h-16 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center">
              <i data-lucide="hash" class="w-8 h-8"></i>
            </div>
            <div>
              <p class="font-semibold text-slate-700 dark:text-slate-200">Upload PDF to number</p>
              <p class="text-xs text-slate-400 mt-1" id="pnum-file-status">Drag & drop or click</p>
            </div>
          </div>
        </div>

        <div id="pnum-workspace" class="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4 hidden">
          <h3 class="font-semibold text-sm">Numbering Options</h3>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-500 mb-1">Position</label>
              <select id="pnum-pos" class="w-full text-xs font-medium bg-slate-100 dark:bg-slate-700 p-2.5 rounded-xl border border-slate-200 dark:border-slate-600 outline-none">
                <option value="bottom-center">Bottom Center</option>
                <option value="bottom-right">Bottom Right</option>
                <option value="bottom-left">Bottom Left</option>
                <option value="top-right">Top Right</option>
                <option value="top-center">Top Center</option>
                <option value="top-left">Top Left</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-500 mb-1">Format</label>
              <select id="pnum-format" class="w-full text-xs font-medium bg-slate-100 dark:bg-slate-700 p-2.5 rounded-xl border border-slate-200 dark:border-slate-600 outline-none">
                <option value="Page {n} of {total}">Page {n} of {total}</option>
                <option value="{n} / {total}">{n} / {total}</option>
                <option value="{n}">{n}</option>
              </select>
            </div>
          </div>

          <div class="flex justify-end pt-2">
            <button id="pnum-run-btn" class="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm shadow transition flex items-center gap-2">
              <i data-lucide="check" class="w-4 h-4"></i>
              <span>Add Page Numbers</span>
            </button>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const dropzone = container.querySelector('#pnum-dropzone');
    const input = container.querySelector('#pnum-file-input');
    const statusEl = container.querySelector('#pnum-file-status');
    const workspace = container.querySelector('#pnum-workspace');
    const posSelect = container.querySelector('#pnum-pos');
    const formatSelect = container.querySelector('#pnum-format');
    const runBtn = container.querySelector('#pnum-run-btn');

    UI.setupDropzone(dropzone, input, async (files) => {
      if (files.length === 0) return;
      currentFile = files[0];
      statusEl.innerText = `${currentFile.name} (${window.pdfEngine.formatBytes(currentFile.size)})`;
      currentBuffer = await window.pdfEngine.readFileAsArrayBuffer(currentFile);
      workspace.classList.remove('hidden');
    });

    runBtn.addEventListener('click', async () => {
      if (!currentBuffer && !currentFile) return;
      try {
        UI.showProgress(0.3, 'Adding page numbers...');
        const position = posSelect.value;
        const format = formatSelect.value;
        const bufferToUse = currentBuffer?.byteLength > 0 ? currentBuffer : await currentFile.arrayBuffer();
        const numberedBlob = await window.pdfEngine.addPageNumbers(window.pdfEngine.cloneBuffer(bufferToUse), { position, format });
        UI.hideProgress();
        UI.celebrate();
        UI.showToast('Page numbers applied!', 'success');
        UI.showResultPreview({
          title: 'Numbered PDF Ready',
          subtitle: 'Page numbers placed successfully. Inspect below before downloading',
          blob: numberedBlob,
          filename: `${currentFile.name.replace(/\.pdf$/i, '')}_numbered.pdf`
        });
      } catch (err) {
        UI.hideProgress();
        UI.showToast(err.message, 'error');
      }
    });
  },

  // 3. SUPERCHARGED WATERMARK TOOL (Text/Image, Lots of Alignment & Positioning, Live Preview)
  renderAddWatermark(container) {
    let currentBuffer = null;
    let currentFile = null;
    let pdfDoc = null;
    let currentPageNum = 1;
    let totalPages = 1;

    let watermarkMode = 'text'; // 'text' | 'image'
    let imageWatermarkDataUrl = null;
    let imageWatermarkBuffer = null;
    let imageWatermarkType = 'png';

    container.innerHTML = `
      <div class="max-w-6xl mx-auto space-y-6">
        <div class="text-center space-y-2">
          <h2 class="text-2xl font-bold tracking-tight">Add Watermark</h2>
          <p class="text-sm text-slate-500">Stamp customized text or image watermarks with precise alignment, angle, opacity, and live preview.</p>
        </div>

        <div id="wm-dropzone" class="dropzone p-8 rounded-2xl text-center cursor-pointer hover:border-purple-500 transition">
          <input type="file" id="wm-file-input" accept="application/pdf" class="hidden">
          <div class="flex flex-col items-center gap-3">
            <div class="w-16 h-16 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center">
              <i data-lucide="stamp" class="w-8 h-8"></i>
            </div>
            <div>
              <p class="font-semibold text-slate-700 dark:text-slate-200">Upload PDF to watermark</p>
              <p class="text-xs text-slate-400 mt-1" id="wm-file-status">Drag & drop or click</p>
            </div>
          </div>
        </div>

        <div id="wm-workspace" class="grid grid-cols-1 lg:grid-cols-12 gap-6 hidden">
          <!-- Left Controls Column -->
          <div class="lg:col-span-5 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-5">
            <!-- Mode Tabs (Text vs Image) -->
            <div class="flex rounded-xl bg-slate-100 dark:bg-slate-700/60 p-1">
              <button id="wm-tab-text" class="flex-1 py-1.5 text-xs font-bold rounded-lg bg-white dark:bg-slate-800 shadow-sm text-purple-600 dark:text-purple-400 transition">Text Watermark</button>
              <button id="wm-tab-image" class="flex-1 py-1.5 text-xs font-bold rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition">Image Watermark</button>
            </div>

            <!-- TEXT CONTROLS -->
            <div id="wm-text-panel" class="space-y-4">
              <div>
                <label class="block text-xs font-semibold text-slate-500 mb-1">Watermark Text</label>
                <input type="text" id="wm-text-input" value="CONFIDENTIAL" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-purple-500">
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-slate-500 mb-1">Font Family</label>
                  <select id="wm-font-select" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none">
                    <option value="HelveticaBold">Helvetica Bold</option>
                    <option value="TimesRomanBold">Times New Roman Bold</option>
                    <option value="CourierBold">Courier Bold</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-500 mb-1">Color</label>
                  <div class="flex items-center gap-2">
                    <input type="color" id="wm-color-picker" value="#EF4444" class="w-9 h-9 rounded cursor-pointer border-0 bg-transparent">
                    <span id="wm-color-code" class="text-xs font-mono text-slate-400">#EF4444</span>
                  </div>
                </div>
              </div>

              <div>
                <div class="flex justify-between text-xs mb-1">
                  <label class="font-semibold text-slate-500">Font Size</label>
                  <span id="wm-size-val" class="font-bold">48 pt</span>
                </div>
                <input type="range" id="wm-size-slider" min="14" max="100" value="48" class="w-full accent-purple-600">
              </div>
            </div>

            <!-- IMAGE CONTROLS -->
            <div id="wm-image-panel" class="space-y-4 hidden">
              <div>
                <label class="block text-xs font-semibold text-slate-500 mb-1">Upload Watermark Image (PNG/JPG)</label>
                <input type="file" id="wm-img-input" accept="image/png,image/jpeg,image/webp" class="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-600 hover:file:bg-purple-100">
              </div>

              <div>
                <div class="flex justify-between text-xs mb-1">
                  <label class="font-semibold text-slate-500">Image Scale</label>
                  <span id="wm-img-scale-val" class="font-bold">50%</span>
                </div>
                <input type="range" id="wm-img-scale" min="10" max="150" value="50" class="w-full accent-purple-600">
              </div>
            </div>

            <!-- COMMON ALIGNMENT & POSITIONING -->
            <div class="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-700">
              <div>
                <label class="block text-xs font-semibold text-slate-500 mb-2">Alignment & Position</label>
                <div class="grid grid-cols-3 gap-1.5 p-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                  <button type="button" class="wm-pos-btn py-1.5 text-[11px] font-medium rounded hover:bg-white dark:hover:bg-slate-800 transition" data-pos="top-left">Top-Left</button>
                  <button type="button" class="wm-pos-btn py-1.5 text-[11px] font-medium rounded hover:bg-white dark:hover:bg-slate-800 transition" data-pos="top-center">Top-Center</button>
                  <button type="button" class="wm-pos-btn py-1.5 text-[11px] font-medium rounded hover:bg-white dark:hover:bg-slate-800 transition" data-pos="top-right">Top-Right</button>
                  <button type="button" class="wm-pos-btn py-1.5 text-[11px] font-medium rounded hover:bg-white dark:hover:bg-slate-800 transition" data-pos="middle-left">Mid-Left</button>
                  <button type="button" class="wm-pos-btn py-1.5 text-[11px] font-medium rounded bg-purple-600 text-white font-bold transition" data-pos="center-diag">Center Diag</button>
                  <button type="button" class="wm-pos-btn py-1.5 text-[11px] font-medium rounded hover:bg-white dark:hover:bg-slate-800 transition" data-pos="middle-right">Mid-Right</button>
                  <button type="button" class="wm-pos-btn py-1.5 text-[11px] font-medium rounded hover:bg-white dark:hover:bg-slate-800 transition" data-pos="bottom-left">Bottom-Left</button>
                  <button type="button" class="wm-pos-btn py-1.5 text-[11px] font-medium rounded hover:bg-white dark:hover:bg-slate-800 transition" data-pos="bottom-center">Bottom-Center</button>
                  <button type="button" class="wm-pos-btn py-1.5 text-[11px] font-medium rounded hover:bg-white dark:hover:bg-slate-800 transition" data-pos="bottom-right">Bottom-Right</button>
                </div>
                <div class="mt-2 flex items-center gap-2">
                  <button type="button" class="wm-pos-btn flex-1 py-1.5 text-[11px] font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:border-purple-500 transition" data-pos="center">Center (Horizontal)</button>
                  <button type="button" class="wm-pos-btn flex-1 py-1.5 text-[11px] font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:border-purple-500 transition" data-pos="repeat">Repeated Grid</button>
                </div>
              </div>

              <!-- Opacity & Angle -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <div class="flex justify-between text-xs mb-1">
                    <label class="font-semibold text-slate-500">Opacity</label>
                    <span id="wm-opacity-val" class="font-bold">25%</span>
                  </div>
                  <input type="range" id="wm-opacity-slider" min="5" max="100" value="25" class="w-full accent-purple-600">
                </div>
                <div>
                  <div class="flex justify-between text-xs mb-1">
                    <label class="font-semibold text-slate-500">Rotation Angle</label>
                    <span id="wm-angle-val" class="font-bold">-45°</span>
                  </div>
                  <input type="range" id="wm-angle-slider" min="-180" max="180" value="-45" class="w-full accent-purple-600">
                </div>
              </div>

              <!-- Page Range -->
              <div>
                <label class="block text-xs font-semibold text-slate-500 mb-1">Apply to Pages</label>
                <select id="wm-page-range" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none">
                  <option value="all">All Pages</option>
                  <option value="first">First Page Only</option>
                  <option value="last">Last Page Only</option>
                </select>
              </div>
            </div>

            <!-- Action Button -->
            <div class="pt-3">
              <button id="wm-run-btn" class="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-lg shadow-purple-600/20 transition flex items-center justify-center gap-2">
                <i data-lucide="stamp" class="w-4 h-4"></i>
                <span>Apply Watermark & Download</span>
              </button>
            </div>
          </div>

          <!-- Right Live Preview Column -->
          <div class="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-4 shadow-sm">
            <div class="flex items-center justify-between pb-3 border-b border-slate-100">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold uppercase tracking-wider text-purple-600">Live Preview</span>
                <span class="text-xs text-slate-400 hidden sm:inline">(Updates instantly)</span>
              </div>
              <div class="flex items-center gap-2">
                <button id="wm-prev-page" class="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition" title="Previous Page">
                  <i data-lucide="chevron-left" class="w-4 h-4"></i>
                </button>
                <span id="wm-page-indicator" class="text-xs font-semibold text-slate-600">Page 1 / 1</span>
                <button id="wm-next-page" class="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition" title="Next Page">
                  <i data-lucide="chevron-right" class="w-4 h-4"></i>
                </button>
                <div class="h-4 w-px bg-slate-200 mx-1"></div>
                <!-- Zoom Scaler -->
                <div class="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-0.5">
                  <button id="wm-zoom-out" class="p-1 hover:text-purple-600 transition" title="Zoom Out">
                    <i data-lucide="zoom-out" class="w-3.5 h-3.5"></i>
                  </button>
                  <span id="wm-zoom-val" class="text-[11px] font-mono text-slate-600 font-bold">100%</span>
                  <button id="wm-zoom-in" class="p-1 hover:text-purple-600 transition" title="Zoom In">
                    <i data-lucide="zoom-in" class="w-3.5 h-3.5"></i>
                  </button>
                </div>
                <div class="h-4 w-px bg-slate-200 mx-1"></div>
                <button id="wm-close-preview-btn" class="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition" title="Close Preview & choose another file">
                  <i data-lucide="x" class="w-3.5 h-3.5 text-slate-500"></i>
                  <span>Close Preview</span>
                </button>
              </div>
            </div>

            <!-- Preview Canvas Area -->
            <div class="flex-1 min-h-[420px] flex items-center justify-center p-4 bg-slate-100 rounded-xl overflow-hidden">
              <div class="relative border border-slate-300 shadow-md bg-white">
                <canvas id="wm-pdf-canvas" class="block"></canvas>
                <canvas id="wm-overlay-canvas" class="absolute inset-0 pointer-events-none"></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const dropzone = container.querySelector('#wm-dropzone');
    const input = container.querySelector('#wm-file-input');
    const statusEl = container.querySelector('#wm-file-status');
    const workspace = container.querySelector('#wm-workspace');

    // Tabs
    const tabText = container.querySelector('#wm-tab-text');
    const tabImage = container.querySelector('#wm-tab-image');
    const panelText = container.querySelector('#wm-text-panel');
    const panelImage = container.querySelector('#wm-image-panel');

    // Text controls
    const textInput = container.querySelector('#wm-text-input');
    const fontSelect = container.querySelector('#wm-font-select');
    const colorPicker = container.querySelector('#wm-color-picker');
    const colorCode = container.querySelector('#wm-color-code');
    const sizeSlider = container.querySelector('#wm-size-slider');
    const sizeVal = container.querySelector('#wm-size-val');

    // Image controls
    const imgInput = container.querySelector('#wm-img-input');
    const imgScale = container.querySelector('#wm-img-scale');
    const imgScaleVal = container.querySelector('#wm-img-scale-val');

    // Common controls
    const opacitySlider = container.querySelector('#wm-opacity-slider');
    const opacityVal = container.querySelector('#wm-opacity-val');
    const angleSlider = container.querySelector('#wm-angle-slider');
    const angleVal = container.querySelector('#wm-angle-val');
    const posBtns = container.querySelectorAll('.wm-pos-btn');
    const pageRangeSelect = container.querySelector('#wm-page-range');
    const runBtn = container.querySelector('#wm-run-btn');

    // Preview
    const pdfCanvas = container.querySelector('#wm-pdf-canvas');
    const overlayCanvas = container.querySelector('#wm-overlay-canvas');
    const prevPageBtn = container.querySelector('#wm-prev-page');
    const nextPageBtn = container.querySelector('#wm-next-page');
    const pageIndicator = container.querySelector('#wm-page-indicator');

    let currentPosition = 'center-diag';

    // Tab switcher
    tabText.addEventListener('click', () => {
      watermarkMode = 'text';
      tabText.className = 'flex-1 py-1.5 text-xs font-bold rounded-lg bg-white dark:bg-slate-800 shadow-sm text-purple-600 dark:text-purple-400 transition';
      tabImage.className = 'flex-1 py-1.5 text-xs font-bold rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition';
      panelText.classList.remove('hidden');
      panelImage.classList.add('hidden');
      updateOverlay();
    });

    tabImage.addEventListener('click', () => {
      watermarkMode = 'image';
      tabImage.className = 'flex-1 py-1.5 text-xs font-bold rounded-lg bg-white dark:bg-slate-800 shadow-sm text-purple-600 dark:text-purple-400 transition';
      tabText.className = 'flex-1 py-1.5 text-xs font-bold rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition';
      panelImage.classList.remove('hidden');
      panelText.classList.add('hidden');
      updateOverlay();
    });

    // Alignment buttons
    posBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        posBtns.forEach(b => {
          b.classList.remove('bg-purple-600', 'text-white', 'font-bold');
        });
        btn.classList.add('bg-purple-600', 'text-white', 'font-bold');
        currentPosition = btn.dataset.pos;
        if (currentPosition === 'center-diag') {
          angleSlider.value = -45;
          angleVal.innerText = '-45°';
        } else if (currentPosition === 'center') {
          angleSlider.value = 0;
          angleVal.innerText = '0°';
        }
        updateOverlay();
      });
    });

    // Listeners for live updates
    [textInput, fontSelect].forEach(el => el.addEventListener('input', () => updateOverlay()));
    colorPicker.addEventListener('input', () => {
      colorCode.innerText = colorPicker.value;
      updateOverlay();
    });
    sizeSlider.addEventListener('input', () => {
      sizeVal.innerText = `${sizeSlider.value} pt`;
      updateOverlay();
    });
    imgScale.addEventListener('input', () => {
      imgScaleVal.innerText = `${imgScale.value}%`;
      updateOverlay();
    });
    opacitySlider.addEventListener('input', () => {
      opacityVal.innerText = `${opacitySlider.value}%`;
      updateOverlay();
    });
    angleSlider.addEventListener('input', () => {
      angleVal.innerText = `${angleSlider.value}°`;
      updateOverlay();
    });

    // Image file loader
    imgInput.addEventListener('change', async () => {
      const f = imgInput.files[0];
      if (!f) return;
      imageWatermarkType = f.type || 'image/png';
      imageWatermarkBuffer = await window.pdfEngine.readFileAsArrayBuffer(f);
      imageWatermarkDataUrl = await window.pdfEngine.readFileAsDataURL(f);
      updateOverlay();
    });

    // Page navigation
    prevPageBtn.addEventListener('click', async () => {
      if (currentPageNum > 1) {
        currentPageNum--;
        await renderPdfPagePreview();
      }
    });

    nextPageBtn.addEventListener('click', async () => {
      if (currentPageNum < totalPages) {
        currentPageNum++;
        await renderPdfPagePreview();
      }
    });

    let wmZoom = 1.0;
    const wmZoomOut = container.querySelector('#wm-zoom-out');
    const wmZoomIn = container.querySelector('#wm-zoom-in');
    const wmZoomVal = container.querySelector('#wm-zoom-val');

    if (wmZoomIn && wmZoomOut) {
      wmZoomIn.addEventListener('click', async () => {
        if (wmZoom < 2.0) {
          wmZoom = Math.min(2.0, +(wmZoom + 0.2).toFixed(1));
          wmZoomVal.innerText = `${Math.round(wmZoom * 100)}%`;
          await renderPdfPagePreview();
        }
      });
      wmZoomOut.addEventListener('click', async () => {
        if (wmZoom > 0.5) {
          wmZoom = Math.max(0.5, +(wmZoom - 0.2).toFixed(1));
          wmZoomVal.innerText = `${Math.round(wmZoom * 100)}%`;
          await renderPdfPagePreview();
        }
      });
    }

    const renderPdfPagePreview = async () => {
      if (!pdfDoc) return;
      pageIndicator.innerText = `Page ${currentPageNum} / ${totalPages}`;
      await window.pdfEngine.renderPageToCanvas(pdfDoc, currentPageNum, pdfCanvas, Math.round(420 * wmZoom));
      overlayCanvas.width = pdfCanvas.width;
      overlayCanvas.height = pdfCanvas.height;
      updateOverlay();
    };

    const updateOverlay = () => {
      if (!overlayCanvas || overlayCanvas.width === 0) return;
      const ctx = overlayCanvas.getContext('2d');
      ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

      const width = overlayCanvas.width;
      const height = overlayCanvas.height;
      const opacity = parseInt(opacitySlider.value, 10) / 100;
      const angleDeg = parseInt(angleSlider.value, 10);
      const angleRad = (angleDeg * Math.PI) / 180;

      ctx.save();
      ctx.globalAlpha = opacity;

      if (watermarkMode === 'text') {
        const text = textInput.value || 'CONFIDENTIAL';
        const fontSize = parseInt(sizeSlider.value, 10);
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.fillStyle = colorPicker.value;
        const textMetrics = ctx.measureText(text);
        const textWidth = textMetrics.width;

        if (currentPosition === 'repeat') {
          // Repeated pattern
          ctx.translate(width / 2, height / 2);
          ctx.rotate(angleRad);
          ctx.translate(-width / 2, -height / 2);

          const stepX = textWidth + 80;
          const stepY = 100;
          for (let x = -width; x < width * 2; x += stepX) {
            for (let y = -height; y < height * 2; y += stepY) {
              ctx.fillText(text, x, y);
            }
          }
        } else {
          let cx = width / 2;
          let cy = height / 2;

          if (currentPosition === 'top-left') { cx = textWidth / 2 + 20; cy = 40; }
          else if (currentPosition === 'top-center') { cx = width / 2; cy = 40; }
          else if (currentPosition === 'top-right') { cx = width - textWidth / 2 - 20; cy = 40; }
          else if (currentPosition === 'middle-left') { cx = textWidth / 2 + 20; cy = height / 2; }
          else if (currentPosition === 'middle-right') { cx = width - textWidth / 2 - 20; cy = height / 2; }
          else if (currentPosition === 'bottom-left') { cx = textWidth / 2 + 20; cy = height - 30; }
          else if (currentPosition === 'bottom-center') { cx = width / 2; cy = height - 30; }
          else if (currentPosition === 'bottom-right') { cx = width - textWidth / 2 - 20; cy = height - 30; }

          ctx.translate(cx, cy);
          ctx.rotate(angleRad);
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(text, 0, 0);
        }
      } else if (watermarkMode === 'image' && imageWatermarkDataUrl) {
        const img = new Image();
        img.onload = () => {
          const scale = (parseInt(imgScale.value, 10) / 100) * 0.5;
          const imgW = img.width * scale;
          const imgH = img.height * scale;

          let cx = width / 2;
          let cy = height / 2;

          if (currentPosition === 'top-left') { cx = imgW / 2 + 20; cy = imgH / 2 + 20; }
          else if (currentPosition === 'top-center') { cx = width / 2; cy = imgH / 2 + 20; }
          else if (currentPosition === 'top-right') { cx = width - imgW / 2 - 20; cy = imgH / 2 + 20; }
          else if (currentPosition === 'bottom-left') { cx = imgW / 2 + 20; cy = height - imgH / 2 - 20; }
          else if (currentPosition === 'bottom-center') { cx = width / 2; cy = height - imgH / 2 - 20; }
          else if (currentPosition === 'bottom-right') { cx = width - imgW / 2 - 20; cy = height - imgH / 2 - 20; }

          ctx.translate(cx, cy);
          ctx.rotate(angleRad);
          ctx.drawImage(img, -imgW / 2, -imgH / 2, imgW, imgH);
          ctx.restore();
        };
        img.src = imageWatermarkDataUrl;
        return;
      }
      ctx.restore();
    };

    // Load PDF
    UI.setupDropzone(dropzone, input, async (files) => {
      if (files.length === 0) return;
      currentFile = files[0];
      statusEl.innerText = `${currentFile.name} (${window.pdfEngine.formatBytes(currentFile.size)})`;
      currentBuffer = await window.pdfEngine.readFileAsArrayBuffer(currentFile);
      workspace.classList.remove('hidden');

      pdfDoc = await window.pdfEngine.getPdfJsDoc(window.pdfEngine.cloneBuffer(currentBuffer));
      totalPages = pdfDoc.numPages;
      currentPageNum = 1;
      await renderPdfPagePreview();
    });

    // Close preview & reset
    const wmCloseBtn = container.querySelector('#wm-close-preview-btn');
    if (wmCloseBtn) {
      wmCloseBtn.addEventListener('click', () => {
        currentBuffer = null;
        currentFile = null;
        pdfDoc = null;
        workspace.classList.add('hidden');
        dropzone.classList.remove('hidden');
        statusEl.innerText = 'Drag & drop or click';
        input.value = '';
      });
    }

    // Execute Watermark
    runBtn.addEventListener('click', async () => {
      if (!currentBuffer && !currentFile) return;
      try {
        UI.showProgress(0.3, 'Stamping watermark on document...');

        const bufferToUse = currentBuffer?.byteLength > 0 ? currentBuffer : await currentFile.arrayBuffer();

        let targetPages = null;
        if (pageRangeSelect.value === 'first') targetPages = [0];
        else if (pageRangeSelect.value === 'last') targetPages = [totalPages - 1];

        const opts = {
          type: watermarkMode,
          text: textInput.value || 'CONFIDENTIAL',
          fontFamily: fontSelect.value,
          fontSize: parseInt(sizeSlider.value, 10),
          colorHex: colorPicker.value,
          opacity: parseInt(opacitySlider.value, 10) / 100,
          angle: parseInt(angleSlider.value, 10),
          position: currentPosition,
          imageBuffer: imageWatermarkBuffer ? window.pdfEngine.cloneBuffer(imageWatermarkBuffer) : null,
          imageType: imageWatermarkType,
          imageScale: parseInt(imgScale.value, 10) / 100,
          targetPages
        };

        const watermarkedBlob = await window.pdfEngine.addWatermark(window.pdfEngine.cloneBuffer(bufferToUse), opts);
        UI.hideProgress();
        UI.celebrate();
        UI.showToast('Watermark added successfully!', 'success');
        UI.showResultPreview({
          title: 'Watermarked PDF Ready',
          subtitle: 'Watermark applied across selected pages. Inspect before saving',
          blob: watermarkedBlob,
          filename: `${currentFile.name.replace(/\.pdf$/i, '')}_watermarked.pdf`
        });
      } catch (err) {
        UI.hideProgress();
        UI.showToast(err.message, 'error');
      }
    });
  },

  // 4. SUPERCHARGED SIGN PDF (Interactive Placement, Custom Pages, Fonts, Colors, Scaler, Image & Draw)
  renderSign(container) {
    let currentBuffer = null;
    let currentFile = null;
    let pdfDoc = null;
    let currentPageNum = 1;
    let totalPages = 1;
    let sigZoom = 1.0;

    let signatureMode = 'type'; // Default to type so Dr. Vijayapriya Aki is instantly active
    let signatureDataUrl = null;

    // Draggable signature box state on preview (in preview canvas px at 1.0 zoom)
    let sigBox = {
      x: 60,
      y: 280,
      w: 180,
      h: 65
    };

    // Map of placed signatures: pageIndex (0-based) -> { xRatio, yRatio, wRatio, hRatio }
    const placedSignatures = new Map();

    container.innerHTML = `
      <div class="max-w-6xl mx-auto space-y-6">
        <div class="text-center space-y-2">
          <h2 class="text-2xl font-bold tracking-tight">Sign PDF Document</h2>
          <p class="text-sm text-slate-500">Create, customize, and place your signature on any specific page with live drag-and-drop placement.</p>
        </div>

        <div id="sign-dropzone" class="dropzone p-8 rounded-2xl text-center cursor-pointer hover:border-purple-500 transition">
          <input type="file" id="sign-file-input" accept="application/pdf" class="hidden">
          <div class="flex flex-col items-center gap-3">
            <div class="w-16 h-16 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
              <i data-lucide="pen-tool" class="w-8 h-8"></i>
            </div>
            <div>
              <p class="font-semibold text-slate-700">Upload PDF to sign</p>
              <p class="text-xs text-slate-400 mt-1" id="sign-file-status">Drag & drop or click</p>
            </div>
          </div>
        </div>

        <div id="sign-workspace" class="grid grid-cols-1 lg:grid-cols-12 gap-6 hidden">
          <!-- Left Column: Signature Creator & Settings -->
          <div class="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <!-- Mode Tabs -->
            <div class="flex rounded-xl bg-slate-100 p-1">
              <button id="sig-tab-type" class="flex-1 py-1.5 text-xs font-bold rounded-lg bg-white shadow-sm text-purple-600 transition">Type Name</button>
              <button id="sig-tab-draw" class="flex-1 py-1.5 text-xs font-bold rounded-lg text-slate-500 hover:text-slate-800 transition">Draw</button>
              <button id="sig-tab-upload" class="flex-1 py-1.5 text-xs font-bold rounded-lg text-slate-500 hover:text-slate-800 transition">Upload Image</button>
            </div>

            <!-- TYPE SIGNATURE PANEL -->
            <div id="sig-panel-type" class="space-y-4">
              <div>
                <label class="block text-xs font-semibold text-slate-500 mb-1">Enter Name or Signee Title</label>
                <input type="text" id="sig-type-input" value="Dr. Vijayapriya Aki" placeholder="e.g. Dr. Vijayapriya Aki" class="w-full text-xs font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-purple-500">
              </div>

              <!-- Font Family & Font Size -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-slate-500 mb-1">Signature Font</label>
                  <select id="sig-font-family" class="w-full text-xs font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-200 outline-none">
                    <option value="'Dancing Script', cursive">Dancing Script</option>
                    <option value="'Great Vibes', cursive">Great Vibes</option>
                    <option value="'Caveat', cursive">Caveat</option>
                    <option value="'Playfair Display', serif">Playfair Display</option>
                    <option value="'Brush Script MT', cursive">Brush Script</option>
                    <option value="sans-serif">Clean Sans</option>
                  </select>
                </div>
                <div>
                  <div class="flex justify-between text-xs mb-1">
                    <label class="font-semibold text-slate-500">Font Size</label>
                    <span id="sig-font-size-val" class="font-bold text-slate-700">40 px</span>
                  </div>
                  <input type="range" id="sig-font-size-slider" min="22" max="64" value="40" class="w-full accent-purple-600 mt-2">
                </div>
              </div>

              <!-- Ink Color Selection -->
              <div>
                <label class="block text-xs font-semibold text-slate-500 mb-1.5">Ink Color</label>
                <div class="flex items-center gap-2">
                  <button type="button" class="sig-color-btn w-6 h-6 rounded-full bg-[#1D4ED8] ring-2 ring-purple-600 ring-offset-1 transition" data-color="#1D4ED8" title="Royal Blue"></button>
                  <button type="button" class="sig-color-btn w-6 h-6 rounded-full bg-[#1E3A8A] ring-offset-1 transition hover:scale-105" data-color="#1E3A8A" title="Navy"></button>
                  <button type="button" class="sig-color-btn w-6 h-6 rounded-full bg-[#000000] ring-offset-1 transition hover:scale-105" data-color="#000000" title="Pure Black"></button>
                  <button type="button" class="sig-color-btn w-6 h-6 rounded-full bg-[#DC2626] ring-offset-1 transition hover:scale-105" data-color="#DC2626" title="Crimson"></button>
                  <div class="h-4 w-px bg-slate-200 mx-1"></div>
                  <input type="color" id="sig-type-color" value="#1D4ED8" class="w-7 h-7 rounded cursor-pointer border-0 bg-transparent" title="Custom color picker">
                </div>
              </div>

              <!-- Live Card Preview -->
              <div class="p-4 rounded-xl border border-slate-200 bg-slate-50 text-center shadow-inner min-h-[75px] flex items-center justify-center">
                <span id="sig-type-preview" class="text-2xl text-blue-700 select-none" style="font-family: 'Dancing Script', cursive;">Dr. Vijayapriya Aki</span>
              </div>
            </div>

            <!-- DRAW SIGNATURE PANEL -->
            <div id="sig-panel-draw" class="space-y-3 hidden">
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold text-slate-500">Pen Color & Thickness</span>
                <div class="flex items-center gap-2">
                  <button id="sig-col-black" class="w-5 h-5 rounded-full bg-black border-2 border-purple-500"></button>
                  <button id="sig-col-blue" class="w-5 h-5 rounded-full bg-blue-700 border-2 border-transparent"></button>
                  <button id="sig-col-red" class="w-5 h-5 rounded-full bg-red-600 border-2 border-transparent"></button>
                  <button id="sig-draw-clear" class="text-xs text-red-500 hover:underline ml-2">Clear</button>
                </div>
              </div>
              <div class="rounded-xl border border-slate-200 overflow-hidden shadow-inner bg-white">
                <canvas id="sig-pad-canvas" width="400" height="150" class="w-full cursor-crosshair"></canvas>
              </div>
            </div>

            <!-- UPLOAD IMAGE PANEL -->
            <div id="sig-panel-upload" class="space-y-3 hidden">
              <label class="block text-xs font-semibold text-slate-500">Upload Signature Image (PNG with transparency recommended)</label>
              <input type="file" id="sig-upload-input" accept="image/png,image/jpeg,image/webp" class="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-600 hover:file:bg-purple-100">
              <p class="text-[11px] text-slate-400">Scanned signatures, transparent PNG stamps, or official seals.</p>
            </div>

            <!-- SIGNATURE SIZING -->
            <div class="pt-3 border-t border-slate-100 space-y-3">
              <div class="flex justify-between text-xs">
                <label class="font-semibold text-slate-500">Box Width</label>
                <span id="sig-size-val" class="font-bold">180 px</span>
              </div>
              <input type="range" id="sig-size-slider" min="90" max="340" value="180" class="w-full accent-purple-600">
            </div>

            <!-- PAGE APPLICATION SCOPE -->
            <div class="space-y-2 pt-2 border-t border-slate-100">
              <label class="block text-xs font-semibold text-slate-500">Target Page(s) to Sign</label>
              <div class="space-y-2 text-xs">
                <label class="flex items-start gap-2 cursor-pointer p-2 rounded-lg bg-purple-50/60 border border-purple-100">
                  <input type="radio" name="sig-scope" value="custom" checked class="mt-0.5 text-purple-600">
                  <div>
                    <span class="font-bold text-slate-800">Custom Placed Pages Only</span>
                    <div class="text-[11px] text-slate-500 mt-0.5">
                      Placed on: <span id="sig-placed-summary" class="font-bold text-purple-700">Page 1</span>
                    </div>
                  </div>
                </label>
                <label class="flex items-center gap-2 cursor-pointer px-2 py-1">
                  <input type="radio" name="sig-scope" value="current" class="text-purple-600">
                  <span>Current Page Only (Page <span id="sig-target-page-num">1</span>)</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer px-2 py-1">
                  <input type="radio" name="sig-scope" value="all" class="text-purple-600">
                  <span>All Pages (1 to <span id="sig-scope-total-pages">1</span>)</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer px-2 py-1">
                  <input type="radio" name="sig-scope" value="last" class="text-purple-600">
                  <span>Last Page Only</span>
                </label>
              </div>
            </div>

            <!-- ACTION BUTTON -->
            <div class="pt-2">
              <button id="sig-run-btn" class="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-lg shadow-purple-600/20 transition flex items-center justify-center gap-2">
                <i data-lucide="check-circle" class="w-4 h-4"></i>
                <span>Sign Document & Download</span>
              </button>
            </div>
          </div>

          <!-- Right Column: Interactive PDF Page with Drag-and-Drop Placement -->
          <div class="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-4 shadow-sm">
            <!-- Viewer Toolbar -->
            <div class="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold uppercase tracking-wider text-purple-600">Document Viewer</span>
              </div>

              <div class="flex items-center flex-wrap gap-2">
                <!-- Page Navigation & Jump -->
                <div class="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-0.5">
                  <button id="sig-prev-page" class="p-1 hover:text-purple-600 transition" title="Previous Page">
                    <i data-lucide="chevron-left" class="w-3.5 h-3.5"></i>
                  </button>
                  <span class="text-[11px] text-slate-500 font-medium">Page</span>
                  <input type="number" id="sig-jump-input" min="1" max="1" value="1" class="w-10 text-center text-xs font-bold bg-white border border-slate-300 rounded px-1 py-0.5 outline-none focus:ring-1 focus:ring-purple-500">
                  <span class="text-[11px] text-slate-500 font-medium">/ <span id="sig-total-pages">1</span></span>
                  <button id="sig-jump-btn" class="px-1.5 py-0.5 bg-white border border-slate-300 hover:bg-purple-50 hover:text-purple-600 rounded text-[11px] font-bold text-slate-700 transition">Go</button>
                  <button id="sig-next-page" class="p-1 hover:text-purple-600 transition" title="Next Page">
                    <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
                  </button>
                </div>

                <!-- Zoom Scaler -->
                <div class="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-0.5">
                  <button id="sig-zoom-out" class="p-1 hover:text-purple-600 transition" title="Zoom Out">
                    <i data-lucide="zoom-out" class="w-3.5 h-3.5"></i>
                  </button>
                  <span id="sig-zoom-val" class="text-[11px] font-mono text-slate-600 font-bold">100%</span>
                  <button id="sig-zoom-in" class="p-1 hover:text-purple-600 transition" title="Zoom In">
                    <i data-lucide="zoom-in" class="w-3.5 h-3.5"></i>
                  </button>
                </div>

                <!-- Per-Page Signature Toggle Button -->
                <button id="sig-toggle-page-btn" class="px-3 py-1 rounded-lg border text-xs font-bold transition flex items-center gap-1 shadow-sm" title="Toggle signature placement on this page">
                  <i data-lucide="plus-circle" class="w-3.5 h-3.5" id="sig-toggle-icon"></i>
                  <span id="sig-toggle-page-text">+ Place Signature on Page 1</span>
                </button>

                <!-- Close Preview -->
                <button id="sig-close-preview-btn" class="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition" title="Close Preview & choose another file">
                  <i data-lucide="x" class="w-3.5 h-3.5 text-slate-500"></i>
                  <span>Close Preview</span>
                </button>
              </div>
            </div>

            <!-- Page Viewer Canvas with Draggable Signature Container -->
            <div class="flex-1 min-h-[460px] flex items-center justify-center p-4 bg-slate-100 rounded-xl overflow-auto">
              <div id="sig-page-wrapper" class="relative border border-slate-300 shadow-md bg-white select-none">
                <canvas id="sig-pdf-canvas" class="block"></canvas>
                <!-- Draggable Signature Box -->
                <div id="sig-drag-box" class="absolute cursor-move border-2 border-purple-600 bg-purple-600/10 rounded flex items-center justify-center shadow-lg transition-colors group" style="left: 60px; top: 280px; width: 180px; height: 65px;">
                  <img id="sig-box-img" class="max-w-full max-h-full object-contain pointer-events-none">
                  <span id="sig-box-placeholder" class="text-[10px] font-bold text-purple-700 uppercase tracking-wider pointer-events-none hidden">Signature Box</span>
                  <div class="absolute -top-3 -right-3 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-[10px] shadow pointer-events-none">
                    <i data-lucide="move" class="w-3 h-3"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const dropzone = container.querySelector('#sign-dropzone');
    const input = container.querySelector('#sign-file-input');
    const statusEl = container.querySelector('#sign-file-status');
    const workspace = container.querySelector('#sign-workspace');

    // Tabs
    const tabType = container.querySelector('#sig-tab-type');
    const tabDraw = container.querySelector('#sig-tab-draw');
    const tabUpload = container.querySelector('#sig-tab-upload');
    const panelType = container.querySelector('#sig-panel-type');
    const panelDraw = container.querySelector('#sig-panel-draw');
    const panelUpload = container.querySelector('#sig-panel-upload');

    // Type Elements
    const typeInput = container.querySelector('#sig-type-input');
    const fontFamilySelect = container.querySelector('#sig-font-family');
    const fontSizeSlider = container.querySelector('#sig-font-size-slider');
    const fontSizeVal = container.querySelector('#sig-font-size-val');
    const typePreview = container.querySelector('#sig-type-preview');
    const typeColorInput = container.querySelector('#sig-type-color');
    const colorBtns = container.querySelectorAll('.sig-color-btn');

    // Draw Elements
    const padCanvas = container.querySelector('#sig-pad-canvas');
    const drawClear = container.querySelector('#sig-draw-clear');
    const colBlack = container.querySelector('#sig-col-black');
    const colBlue = container.querySelector('#sig-col-blue');
    const colRed = container.querySelector('#sig-col-red');

    // Upload & Sizing
    const uploadInput = container.querySelector('#sig-upload-input');
    const sizeSlider = container.querySelector('#sig-size-slider');
    const sizeVal = container.querySelector('#sig-size-val');

    // Scopes & Summaries
    const targetPageNumSpan = container.querySelector('#sig-target-page-num');
    const scopeTotalPagesSpan = container.querySelector('#sig-scope-total-pages');
    const placedSummarySpan = container.querySelector('#sig-placed-summary');
    const runBtn = container.querySelector('#sig-run-btn');

    // Document Viewer elements
    const pdfCanvas = container.querySelector('#sig-pdf-canvas');
    const dragBox = container.querySelector('#sig-drag-box');
    const boxImg = container.querySelector('#sig-box-img');
    const boxPlaceholder = container.querySelector('#sig-box-placeholder');
    const prevPageBtn = container.querySelector('#sig-prev-page');
    const nextPageBtn = container.querySelector('#sig-next-page');
    const jumpInput = container.querySelector('#sig-jump-input');
    const jumpBtn = container.querySelector('#sig-jump-btn');
    const totalPagesSpan = container.querySelector('#sig-total-pages');
    const pageWrapper = container.querySelector('#sig-page-wrapper');
    const zoomInBtn = container.querySelector('#sig-zoom-in');
    const zoomOutBtn = container.querySelector('#sig-zoom-out');
    const zoomValSpan = container.querySelector('#sig-zoom-val');
    const togglePageBtn = container.querySelector('#sig-toggle-page-btn');
    const togglePageText = container.querySelector('#sig-toggle-page-text');

    // Typed Signature Generator
    let currentTypeColor = '#1D4ED8';
    let currentTypeFont = "'Dancing Script', cursive";
    let currentTypeSize = 40;

    const updateTypedSignature = () => {
      const name = typeInput.value.trim() || 'Dr. Vijayapriya Aki';
      typePreview.innerText = name;
      typePreview.style.fontFamily = currentTypeFont;
      typePreview.style.fontSize = `${currentTypeSize}px`;
      typePreview.style.color = currentTypeColor;

      const c = document.createElement('canvas');
      c.width = 500;
      c.height = 150;
      const ctx = c.getContext('2d');
      ctx.clearRect(0, 0, c.width, c.height);

      ctx.font = `italic ${currentTypeSize}px ${currentTypeFont}`;
      ctx.fillStyle = currentTypeColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(name, c.width / 2, c.height / 2);

      signatureDataUrl = c.toDataURL('image/png');
      boxImg.src = signatureDataUrl;
      boxPlaceholder.classList.add('hidden');
    };

    if (document.fonts) {
      document.fonts.ready.then(updateTypedSignature);
    }

    typeInput.addEventListener('input', updateTypedSignature);

    fontFamilySelect.addEventListener('change', () => {
      currentTypeFont = fontFamilySelect.value;
      updateTypedSignature();
    });

    fontSizeSlider.addEventListener('input', () => {
      currentTypeSize = parseInt(fontSizeSlider.value, 10);
      fontSizeVal.innerText = `${currentTypeSize} px`;
      updateTypedSignature();
    });

    typeColorInput.addEventListener('input', () => {
      currentTypeColor = typeColorInput.value;
      colorBtns.forEach(b => b.classList.remove('ring-2', 'ring-purple-600'));
      updateTypedSignature();
    });

    colorBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        currentTypeColor = btn.dataset.color;
        typeColorInput.value = currentTypeColor;
        colorBtns.forEach(b => b.classList.remove('ring-2', 'ring-purple-600'));
        btn.classList.add('ring-2', 'ring-purple-600');
        updateTypedSignature();
      });
    });

    // Pad drawing logic
    const padCtx = padCanvas.getContext('2d');
    let isDrawing = false;
    let strokeColor = '#000000';

    padCtx.lineWidth = 2.5;
    padCtx.lineCap = 'round';
    padCtx.lineJoin = 'round';

    colBlack.addEventListener('click', () => {
      strokeColor = '#000000';
      colBlack.classList.add('border-purple-500');
      colBlue.classList.remove('border-purple-500');
      colRed.classList.remove('border-purple-500');
    });
    colBlue.addEventListener('click', () => {
      strokeColor = '#1D4ED8';
      colBlue.classList.add('border-purple-500');
      colBlack.classList.remove('border-purple-500');
      colRed.classList.remove('border-purple-500');
    });
    colRed.addEventListener('click', () => {
      strokeColor = '#DC2626';
      colRed.classList.add('border-purple-500');
      colBlack.classList.remove('border-purple-500');
      colBlue.classList.remove('border-purple-500');
    });

    const getPadPos = (e) => {
      const rect = padCanvas.getBoundingClientRect();
      const scaleX = padCanvas.width / rect.width;
      const scaleY = padCanvas.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    };

    padCanvas.addEventListener('mousedown', (e) => {
      isDrawing = true;
      const pos = getPadPos(e);
      padCtx.beginPath();
      padCtx.moveTo(pos.x, pos.y);
      padCtx.strokeStyle = strokeColor;
    });

    padCanvas.addEventListener('mousemove', (e) => {
      if (!isDrawing) return;
      const pos = getPadPos(e);
      padCtx.lineTo(pos.x, pos.y);
      padCtx.stroke();
    });

    ['mouseup', 'mouseleave'].forEach(ev => {
      padCanvas.addEventListener(ev, () => {
        if (isDrawing) {
          isDrawing = false;
          if (signatureMode === 'draw') {
            signatureDataUrl = padCanvas.toDataURL('image/png');
            boxImg.src = signatureDataUrl;
            boxPlaceholder.classList.add('hidden');
          }
        }
      });
    });

    drawClear.addEventListener('click', () => {
      padCtx.clearRect(0, 0, padCanvas.width, padCanvas.height);
      if (signatureMode === 'draw') {
        signatureDataUrl = null;
        boxImg.src = '';
        boxPlaceholder.classList.remove('hidden');
      }
    });

    // Tab switching
    tabType.addEventListener('click', () => {
      signatureMode = 'type';
      tabType.className = 'flex-1 py-1.5 text-xs font-bold rounded-lg bg-white shadow-sm text-purple-600 transition';
      tabDraw.className = 'flex-1 py-1.5 text-xs font-bold rounded-lg text-slate-500 hover:text-slate-800 transition';
      tabUpload.className = 'flex-1 py-1.5 text-xs font-bold rounded-lg text-slate-500 hover:text-slate-800 transition';
      panelType.classList.remove('hidden');
      panelDraw.classList.add('hidden');
      panelUpload.classList.add('hidden');
      updateTypedSignature();
    });

    tabDraw.addEventListener('click', () => {
      signatureMode = 'draw';
      tabDraw.className = 'flex-1 py-1.5 text-xs font-bold rounded-lg bg-white shadow-sm text-purple-600 transition';
      tabType.className = 'flex-1 py-1.5 text-xs font-bold rounded-lg text-slate-500 hover:text-slate-800 transition';
      tabUpload.className = 'flex-1 py-1.5 text-xs font-bold rounded-lg text-slate-500 hover:text-slate-800 transition';
      panelDraw.classList.remove('hidden');
      panelType.classList.add('hidden');
      panelUpload.classList.add('hidden');
      signatureDataUrl = padCanvas.toDataURL('image/png');
      boxImg.src = signatureDataUrl;
    });

    tabUpload.addEventListener('click', () => {
      signatureMode = 'upload';
      tabUpload.className = 'flex-1 py-1.5 text-xs font-bold rounded-lg bg-white shadow-sm text-purple-600 transition';
      tabDraw.className = 'flex-1 py-1.5 text-xs font-bold rounded-lg text-slate-500 hover:text-slate-800 transition';
      tabType.className = 'flex-1 py-1.5 text-xs font-bold rounded-lg text-slate-500 hover:text-slate-800 transition';
      panelUpload.classList.remove('hidden');
      panelDraw.classList.add('hidden');
      panelType.classList.add('hidden');
    });

    // Upload signature image
    uploadInput.addEventListener('change', async () => {
      const f = uploadInput.files[0];
      if (!f) return;
      signatureDataUrl = await window.pdfEngine.readFileAsDataURL(f);
      boxImg.src = signatureDataUrl;
      boxPlaceholder.classList.add('hidden');
    });

    // Sizing slider
    sizeSlider.addEventListener('input', () => {
      const w = parseInt(sizeSlider.value, 10);
      const h = Math.round(w * 0.36);
      sigBox.w = w;
      sigBox.h = h;
      dragBox.style.width = `${w}px`;
      dragBox.style.height = `${h}px`;
      sizeVal.innerText = `${w} px`;

      // If current page is placed, update its saved normalized dimensions
      const pageIdx = currentPageNum - 1;
      if (placedSignatures.has(pageIdx) && pdfCanvas.width > 0) {
        placedSignatures.set(pageIdx, {
          xRatio: dragBox.offsetLeft / pdfCanvas.width,
          yRatio: dragBox.offsetTop / pdfCanvas.height,
          wRatio: w / pdfCanvas.width,
          hRatio: h / pdfCanvas.height
        });
      }
    });

    // Drag-and-drop box logic on the PDF canvas wrapper
    let isDraggingBox = false;
    let dragStartX = 0;
    let dragStartY = 0;

    dragBox.addEventListener('mousedown', (e) => {
      isDraggingBox = true;
      dragStartX = e.clientX - dragBox.offsetLeft;
      dragStartY = e.clientY - dragBox.offsetTop;
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDraggingBox) return;
      let newLeft = e.clientX - dragStartX;
      let newTop = e.clientY - dragStartY;

      // Bound within page preview
      newLeft = Math.max(0, Math.min(newLeft, pageWrapper.offsetWidth - dragBox.offsetWidth));
      newTop = Math.max(0, Math.min(newTop, pageWrapper.offsetHeight - dragBox.offsetHeight));

      dragBox.style.left = `${newLeft}px`;
      dragBox.style.top = `${newTop}px`;
      sigBox.x = newLeft;
      sigBox.y = newTop;

      // If current page is placed, update its saved normalized position
      const pageIdx = currentPageNum - 1;
      if (placedSignatures.has(pageIdx) && pdfCanvas.width > 0) {
        placedSignatures.set(pageIdx, {
          xRatio: newLeft / pdfCanvas.width,
          yRatio: newTop / pdfCanvas.height,
          wRatio: dragBox.offsetWidth / pdfCanvas.width,
          hRatio: dragBox.offsetHeight / pdfCanvas.height
        });
      }
    });

    window.addEventListener('mouseup', () => {
      isDraggingBox = false;
    });

    // Helper: update page placement toggle button & summary
    const updatePlacementUI = () => {
      const pageIdx = currentPageNum - 1;
      const isPlaced = placedSignatures.has(pageIdx);

      if (isPlaced) {
        togglePageBtn.className = 'px-3 py-1 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition flex items-center gap-1 shadow-sm';
        togglePageText.innerText = `✓ Signature Placed on Page ${currentPageNum} (Click to Remove)`;
        dragBox.classList.remove('opacity-40', 'border-dashed');
        dragBox.classList.add('border-purple-600', 'bg-purple-600/10');
      } else {
        togglePageBtn.className = 'px-3 py-1 rounded-lg border border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition flex items-center gap-1 shadow-sm';
        togglePageText.innerText = `+ Place Signature on Page ${currentPageNum}`;
        dragBox.classList.add('opacity-40', 'border-dashed');
        dragBox.classList.remove('border-purple-600', 'bg-purple-600/10');
      }

      // Update scope radio info & summary
      targetPageNumSpan.innerText = `${currentPageNum}`;
      scopeTotalPagesSpan.innerText = `${totalPages}`;
      const placedPages = Array.from(placedSignatures.keys()).map(k => k + 1).sort((a, b) => a - b);
      placedSummarySpan.innerText = placedPages.length > 0 ? placedPages.map(p => `Page ${p}`).join(', ') : 'None (Click Place Signature)';
      
      if (window.lucide) window.lucide.createIcons();
    };

    togglePageBtn.addEventListener('click', () => {
      const pageIdx = currentPageNum - 1;
      if (placedSignatures.has(pageIdx)) {
        placedSignatures.delete(pageIdx);
        UI.showToast(`Removed signature from Page ${currentPageNum}`, 'info');
      } else {
        if (pdfCanvas.width > 0) {
          placedSignatures.set(pageIdx, {
            xRatio: dragBox.offsetLeft / pdfCanvas.width,
            yRatio: dragBox.offsetTop / pdfCanvas.height,
            wRatio: dragBox.offsetWidth / pdfCanvas.width,
            hRatio: dragBox.offsetHeight / pdfCanvas.height
          });
        }
        UI.showToast(`Signature placed on Page ${currentPageNum}!`, 'success');
      }
      updatePlacementUI();
    });

    // Render PDF page & reposition box according to page's saved normalized coordinates
    const renderPdfPage = async () => {
      if (!pdfDoc) return;
      jumpInput.value = `${currentPageNum}`;
      jumpInput.max = `${totalPages}`;
      totalPagesSpan.innerText = `${totalPages}`;

      const baseWidth = Math.round(460 * sigZoom);
      await window.pdfEngine.renderPageToCanvas(pdfDoc, currentPageNum, pdfCanvas, baseWidth);

      // Restore position if page already placed, otherwise maintain current position
      const pageIdx = currentPageNum - 1;
      if (placedSignatures.has(pageIdx)) {
        const norm = placedSignatures.get(pageIdx);
        const newLeft = Math.round(norm.xRatio * pdfCanvas.width);
        const newTop = Math.round(norm.yRatio * pdfCanvas.height);
        const newW = Math.round(norm.wRatio * pdfCanvas.width);
        const newH = Math.round(norm.hRatio * pdfCanvas.height);

        dragBox.style.left = `${newLeft}px`;
        dragBox.style.top = `${newTop}px`;
        dragBox.style.width = `${newW}px`;
        dragBox.style.height = `${newH}px`;
        sigBox.x = newLeft;
        sigBox.y = newTop;
        sigBox.w = newW;
        sigBox.h = newH;
        sizeSlider.value = `${newW}`;
        sizeVal.innerText = `${newW} px`;
      } else {
        // Bound within canvas
        let curLeft = Math.min(dragBox.offsetLeft, Math.max(0, pdfCanvas.width - dragBox.offsetWidth));
        let curTop = Math.min(dragBox.offsetTop, Math.max(0, pdfCanvas.height - dragBox.offsetHeight));
        dragBox.style.left = `${curLeft}px`;
        dragBox.style.top = `${curTop}px`;
        sigBox.x = curLeft;
        sigBox.y = curTop;
      }

      updatePlacementUI();
    };

    // Zoom Handlers
    zoomInBtn.addEventListener('click', async () => {
      if (sigZoom < 2.0) {
        sigZoom = Math.min(2.0, +(sigZoom + 0.2).toFixed(1));
        zoomValSpan.innerText = `${Math.round(sigZoom * 100)}%`;
        await renderPdfPage();
      }
    });

    zoomOutBtn.addEventListener('click', async () => {
      if (sigZoom > 0.6) {
        sigZoom = Math.max(0.6, +(sigZoom - 0.2).toFixed(1));
        zoomValSpan.innerText = `${Math.round(sigZoom * 100)}%`;
        await renderPdfPage();
      }
    });

    // Page navigation & Jump
    prevPageBtn.addEventListener('click', async () => {
      if (currentPageNum > 1) {
        currentPageNum--;
        await renderPdfPage();
      }
    });

    nextPageBtn.addEventListener('click', async () => {
      if (currentPageNum < totalPages) {
        currentPageNum++;
        await renderPdfPage();
      }
    });

    const handleJump = async () => {
      const val = parseInt(jumpInput.value, 10);
      if (val >= 1 && val <= totalPages) {
        currentPageNum = val;
        await renderPdfPage();
      } else {
        UI.showToast(`Enter a page between 1 and ${totalPages}`, 'warning');
      }
    };

    jumpBtn.addEventListener('click', handleJump);
    jumpInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleJump();
    });

    // Upload PDF file
    UI.setupDropzone(dropzone, input, async (files) => {
      if (files.length === 0) return;
      currentFile = files[0];
      statusEl.innerText = `${currentFile.name} (${window.pdfEngine.formatBytes(currentFile.size)})`;
      currentBuffer = await window.pdfEngine.readFileAsArrayBuffer(currentFile);
      workspace.classList.remove('hidden');

      pdfDoc = await window.pdfEngine.getPdfJsDoc(window.pdfEngine.cloneBuffer(currentBuffer));
      totalPages = pdfDoc.numPages;
      currentPageNum = 1;
      placedSignatures.clear();

      // Automatically place on page 1 initially
      placedSignatures.set(0, {
        xRatio: 0.15,
        yRatio: 0.65,
        wRatio: 0.38,
        hRatio: 0.12
      });

      updateTypedSignature();
      await renderPdfPage();
    });

    // Close preview & reset
    const sigCloseBtn = container.querySelector('#sig-close-preview-btn');
    if (sigCloseBtn) {
      sigCloseBtn.addEventListener('click', () => {
        currentBuffer = null;
        currentFile = null;
        pdfDoc = null;
        signatureDataUrl = null;
        placedSignatures.clear();
        workspace.classList.add('hidden');
        dropzone.classList.remove('hidden');
        statusEl.innerText = 'Drag & drop or click';
        input.value = '';
      });
    }

    // Apply Signature
    runBtn.addEventListener('click', async () => {
      if (!currentBuffer && !currentFile) return;

      if (!signatureDataUrl) {
        UI.showToast('Please type, draw, or upload a signature first.', 'error');
        return;
      }

      try {
        UI.showProgress(0.3, 'Embedding digital signature at selected page(s)...');

        const scope = container.querySelector('input[name="sig-scope"]:checked').value;
        const targetIndices = [];

        if (scope === 'custom') {
          if (placedSignatures.size === 0) {
            // Default to current page if none explicitly placed
            targetIndices.push(currentPageNum - 1);
          } else {
            targetIndices.push(...placedSignatures.keys());
          }
        } else if (scope === 'all') {
          for (let i = 0; i < totalPages; i++) targetIndices.push(i);
        } else if (scope === 'last') {
          targetIndices.push(totalPages - 1);
        } else {
          // Current page only
          targetIndices.push(currentPageNum - 1);
        }

        const signaturesList = [];

        for (const pIdx of targetIndices) {
          const page = await pdfDoc.getPage(pIdx + 1);
          const unscaledVp = page.getViewport({ scale: 1.0 });

          // Retrieve normalized position or fall back to current dragBox
          let norm = placedSignatures.get(pIdx);
          if (!norm) {
            norm = {
              xRatio: dragBox.offsetLeft / pdfCanvas.width,
              yRatio: dragBox.offsetTop / pdfCanvas.height,
              wRatio: dragBox.offsetWidth / pdfCanvas.width,
              hRatio: dragBox.offsetHeight / pdfCanvas.height
            };
          }

          const pdfX = norm.xRatio * unscaledVp.width;
          const pdfW = norm.wRatio * unscaledVp.width;
          const pdfH = norm.hRatio * unscaledVp.height;
          // In PDF, Y origin is at the bottom of the page
          const pdfY = (1 - (norm.yRatio + norm.hRatio)) * unscaledVp.height;

          signaturesList.push({
            pageIndex: pIdx,
            signatureDataUrl,
            x: pdfX,
            y: pdfY,
            width: pdfW,
            height: pdfH
          });
        }

        const bufferToUse = currentBuffer?.byteLength > 0 ? currentBuffer : await currentFile.arrayBuffer();
        const signedBlob = await window.pdfEngine.applySignature(window.pdfEngine.cloneBuffer(bufferToUse), signaturesList);

        UI.hideProgress();
        UI.celebrate();
        UI.showToast(`Document signed successfully on ${signaturesList.length} page(s)!`, 'success');
        UI.showResultPreview({
          title: 'Signed Document Ready',
          subtitle: `Signature applied to ${signaturesList.length} page(s). Inspect before saving`,
          blob: signedBlob,
          filename: `${currentFile.name.replace(/\.pdf$/i, '')}_signed.pdf`
        });
      } catch (err) {
        UI.hideProgress();
        UI.showToast(err.message, 'error');
      }
    });
  }
};

window.EditTools = EditTools;
