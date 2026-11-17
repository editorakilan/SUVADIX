/**
 * PDF Suite - Edit PDF Tools
 * Rotate PDF, Add Page Numbers, Advanced Watermark (Text/Image + Live Preview), Advanced Sign PDF (Custom Placement, Multi-page, Image/Draw/Type)
 */

const EditTools = {
  // 1. ROTATE PDF
  renderRotate(container) {
    let currentBuffer = null;
    let currentFile = null;

    container.innerHTML = `
      <div class="max-w-3xl mx-auto space-y-6">
        <div class="text-center space-y-2">
          <h2 class="text-2xl font-bold tracking-tight">Rotate PDF</h2>
          <p class="text-sm text-slate-500">Rotate all pages in your PDF document permanently.</p>
        </div>

        <div id="rotate-dropzone" class="dropzone p-8 rounded-2xl text-center cursor-pointer hover:border-purple-500 transition">
          <input type="file" id="rotate-file-input" accept="application/pdf" class="hidden">
          <div class="flex flex-col items-center gap-3">
            <div class="w-16 h-16 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center">
              <i data-lucide="rotate-cw" class="w-8 h-8"></i>
            </div>
            <div>
              <p class="font-semibold text-slate-700 dark:text-slate-200">Upload PDF to rotate</p>
              <p class="text-xs text-slate-400 mt-1" id="rotate-file-status">Drag & drop or click</p>
            </div>
          </div>
        </div>

        <div id="rotate-workspace" class="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-5 hidden">
          <h3 class="font-semibold text-sm">Choose Rotation Angle</h3>
          
          <div class="grid grid-cols-3 gap-3">
            <button class="rot-angle-btn p-4 rounded-xl border-2 border-purple-500 bg-purple-50/20 dark:bg-purple-950/20 text-purple-600 font-bold text-sm flex flex-col items-center gap-2" data-angle="90">
              <i data-lucide="rotate-cw" class="w-6 h-6"></i>
              <span>90° Clockwise</span>
            </button>
            <button class="rot-angle-btn p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-purple-500 font-bold text-sm flex flex-col items-center gap-2" data-angle="180">
              <i data-lucide="refresh-cw" class="w-6 h-6"></i>
              <span>180° Flip</span>
            </button>
            <button class="rot-angle-btn p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-purple-500 font-bold text-sm flex flex-col items-center gap-2" data-angle="270">
              <i data-lucide="rotate-ccw" class="w-6 h-6"></i>
              <span>270° Counter-CW</span>
            </button>
          </div>

          <div class="flex justify-end pt-2">
            <button id="rotate-run-btn" class="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm shadow transition flex items-center gap-2">
              <i data-lucide="save" class="w-4 h-4"></i>
              <span>Apply Rotation</span>
            </button>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const dropzone = container.querySelector('#rotate-dropzone');
    const input = container.querySelector('#rotate-file-input');
    const statusEl = container.querySelector('#rotate-file-status');
    const workspace = container.querySelector('#rotate-workspace');
    const runBtn = container.querySelector('#rotate-run-btn');
    const angleBtns = container.querySelectorAll('.rot-angle-btn');

    let selectedAngle = 90;

    angleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        angleBtns.forEach(b => {
          b.className = 'rot-angle-btn p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-purple-500 font-bold text-sm flex flex-col items-center gap-2';
        });
        btn.className = 'rot-angle-btn p-4 rounded-xl border-2 border-purple-500 bg-purple-50/20 dark:bg-purple-950/20 text-purple-600 font-bold text-sm flex flex-col items-center gap-2';
        selectedAngle = parseInt(btn.dataset.angle, 10);
      });
    });

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
        UI.showProgress(0.3, 'Rotating pages...');
        const bufferToUse = currentBuffer?.byteLength > 0 ? currentBuffer : await currentFile.arrayBuffer();
        const rotatedBlob = await window.pdfEngine.rotatePages(window.pdfEngine.cloneBuffer(bufferToUse), selectedAngle);
        UI.hideProgress();
        UI.celebrate();
        UI.showToast(`Rotated PDF by ${selectedAngle}°!`, 'success');
        UI.showResultPreview({
          title: 'Rotated PDF Ready',
          subtitle: `Pages rotated by ${selectedAngle}°. Preview below before downloading`,
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

    const renderPdfPagePreview = async () => {
      if (!pdfDoc) return;
      pageIndicator.innerText = `Page ${currentPageNum} / ${totalPages}`;
      await window.pdfEngine.renderPageToCanvas(pdfDoc, currentPageNum, pdfCanvas, 420);
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

  // 4. SUPERCHARGED SIGN PDF (Interactive Placement, Custom Pages, Image & Draw Support)
  renderSign(container) {
    let currentBuffer = null;
    let currentFile = null;
    let pdfDoc = null;
    let currentPageNum = 1;
    let totalPages = 1;

    let signatureMode = 'draw'; // 'draw' | 'upload' | 'type'
    let signatureDataUrl = null;

    // Draggable signature box state on preview (in preview canvas px)
    let sigBox = {
      x: 100,
      y: 200,
      w: 160,
      h: 60
    };

    container.innerHTML = `
      <div class="max-w-6xl mx-auto space-y-6">
        <div class="text-center space-y-2">
          <h2 class="text-2xl font-bold tracking-tight">Sign PDF Document</h2>
          <p class="text-sm text-slate-500">Create your signature and place it anywhere with custom interactive drag-and-drop positioning on any page.</p>
        </div>

        <div id="sign-dropzone" class="dropzone p-8 rounded-2xl text-center cursor-pointer hover:border-purple-500 transition">
          <input type="file" id="sign-file-input" accept="application/pdf" class="hidden">
          <div class="flex flex-col items-center gap-3">
            <div class="w-16 h-16 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center">
              <i data-lucide="pen-tool" class="w-8 h-8"></i>
            </div>
            <div>
              <p class="font-semibold text-slate-700 dark:text-slate-200">Upload PDF to sign</p>
              <p class="text-xs text-slate-400 mt-1" id="sign-file-status">Drag & drop or click</p>
            </div>
          </div>
        </div>

        <div id="sign-workspace" class="grid grid-cols-1 lg:grid-cols-12 gap-6 hidden">
          <!-- Left Column: Signature Creator & Settings -->
          <div class="lg:col-span-5 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-5">
            <!-- Mode Tabs -->
            <div class="flex rounded-xl bg-slate-100 dark:bg-slate-700/60 p-1">
              <button id="sig-tab-draw" class="flex-1 py-1.5 text-xs font-bold rounded-lg bg-white dark:bg-slate-800 shadow-sm text-purple-600 dark:text-purple-400 transition">Draw</button>
              <button id="sig-tab-upload" class="flex-1 py-1.5 text-xs font-bold rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition">Upload Image</button>
              <button id="sig-tab-type" class="flex-1 py-1.5 text-xs font-bold rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition">Type</button>
            </div>

            <!-- DRAW SIGNATURE PANEL -->
            <div id="sig-panel-draw" class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold text-slate-500">Pen Color & Thickness</span>
                <div class="flex items-center gap-2">
                  <button id="sig-col-black" class="w-5 h-5 rounded-full bg-black border-2 border-purple-500"></button>
                  <button id="sig-col-blue" class="w-5 h-5 rounded-full bg-blue-700 border-2 border-transparent"></button>
                  <button id="sig-col-red" class="w-5 h-5 rounded-full bg-red-600 border-2 border-transparent"></button>
                  <button id="sig-draw-clear" class="text-xs text-red-500 hover:underline ml-2">Clear</button>
                </div>
              </div>
              <div class="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-inner bg-white">
                <canvas id="sig-pad-canvas" width="400" height="150" class="w-full cursor-crosshair"></canvas>
              </div>
            </div>

            <!-- UPLOAD IMAGE PANEL -->
            <div id="sig-panel-upload" class="space-y-3 hidden">
              <label class="block text-xs font-semibold text-slate-500">Upload Signature Image (PNG with transparency recommended)</label>
              <input type="file" id="sig-upload-input" accept="image/png,image/jpeg,image/webp" class="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-600 hover:file:bg-purple-100">
              <p class="text-[11px] text-slate-400">Scanned signatures, transparent PNG stamps, or corporate seals.</p>
            </div>

            <!-- TYPE SIGNATURE PANEL -->
            <div id="sig-panel-type" class="space-y-3 hidden">
              <label class="block text-xs font-semibold text-slate-500">Enter Your Full Name</label>
              <input type="text" id="sig-type-input" placeholder="e.g. Dr. Sarah Jenkins" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none">
              <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-center">
                <span id="sig-type-preview" class="font-serif italic text-2xl text-slate-800 dark:text-slate-100">Signature Preview</span>
              </div>
            </div>

            <!-- SIGNATURE SIZING -->
            <div class="pt-3 border-t border-slate-100 dark:border-slate-700 space-y-3">
              <div class="flex justify-between text-xs">
                <label class="font-semibold text-slate-500">Signature Size</label>
                <span id="sig-size-val" class="font-bold">160 px</span>
              </div>
              <input type="range" id="sig-size-slider" min="80" max="320" value="160" class="w-full accent-purple-600">
            </div>

            <!-- PAGE APPLICATION SCOPE -->
            <div class="space-y-2">
              <label class="block text-xs font-semibold text-slate-500">Target Page(s)</label>
              <div class="space-y-1.5 text-xs">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="sig-scope" value="current" checked class="text-purple-600">
                  <span>Current Page Only (Page <span id="sig-target-page-num">1</span>)</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="sig-scope" value="all" class="text-purple-600">
                  <span>All Pages</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="sig-scope" value="last" class="text-purple-600">
                  <span>Last Page Only</span>
                </label>
              </div>
            </div>

            <!-- INSTRUCTIONS & ACTION -->
            <div class="pt-2">
              <div class="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-800 text-xs text-purple-700 dark:text-purple-300 mb-3 flex items-center gap-2">
                <i data-lucide="move" class="w-4 h-4 flex-shrink-0"></i>
                <span>Drag the red signature box on the preview to position it exactly where needed.</span>
              </div>

              <button id="sig-run-btn" class="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-lg shadow-purple-600/20 transition flex items-center justify-center gap-2">
                <i data-lucide="check-circle" class="w-4 h-4"></i>
                <span>Sign Document & Download</span>
              </button>
            </div>
          </div>

          <!-- Right Column: Interactive PDF Page with Drag-and-Drop Placement -->
          <div class="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-4 shadow-sm">
            <div class="flex items-center justify-between pb-3 border-b border-slate-100">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold uppercase tracking-wider text-purple-600">Document Viewer</span>
              </div>
              <div class="flex items-center gap-2">
                <button id="sig-prev-page" class="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition" title="Previous Page">
                  <i data-lucide="chevron-left" class="w-4 h-4"></i>
                </button>
                <span id="sig-page-indicator" class="text-xs font-semibold text-slate-600">Page 1 / 1</span>
                <button id="sig-next-page" class="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition" title="Next Page">
                  <i data-lucide="chevron-right" class="w-4 h-4"></i>
                </button>
                <div class="h-4 w-px bg-slate-200 mx-1"></div>
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
                <div id="sig-drag-box" class="absolute cursor-move border-2 border-red-500 bg-red-500/10 rounded flex items-center justify-center shadow-lg transition-colors group" style="left: 60px; top: 120px; width: 160px; height: 60px;">
                  <img id="sig-box-img" class="max-w-full max-h-full object-contain pointer-events-none">
                  <span id="sig-box-placeholder" class="text-[10px] font-bold text-red-600 uppercase tracking-wider pointer-events-none">Drag Signature Here</span>
                  <div class="absolute -top-3 -right-3 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-[10px] shadow pointer-events-none">
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
    const tabDraw = container.querySelector('#sig-tab-draw');
    const tabUpload = container.querySelector('#sig-tab-upload');
    const tabType = container.querySelector('#sig-tab-type');
    const panelDraw = container.querySelector('#sig-panel-draw');
    const panelUpload = container.querySelector('#sig-panel-upload');
    const panelType = container.querySelector('#sig-panel-type');

    // Draw elements
    const padCanvas = container.querySelector('#sig-pad-canvas');
    const drawClear = container.querySelector('#sig-draw-clear');
    const colBlack = container.querySelector('#sig-col-black');
    const colBlue = container.querySelector('#sig-col-blue');
    const colRed = container.querySelector('#sig-col-red');

    // Upload & Type elements
    const uploadInput = container.querySelector('#sig-upload-input');
    const typeInput = container.querySelector('#sig-type-input');
    const typePreview = container.querySelector('#sig-type-preview');

    // Sizing & Scope
    const sizeSlider = container.querySelector('#sig-size-slider');
    const sizeVal = container.querySelector('#sig-size-val');
    const targetPageNumSpan = container.querySelector('#sig-target-page-num');
    const runBtn = container.querySelector('#sig-run-btn');

    // Preview Viewer & Draggable element
    const pdfCanvas = container.querySelector('#sig-pdf-canvas');
    const dragBox = container.querySelector('#sig-drag-box');
    const boxImg = container.querySelector('#sig-box-img');
    const boxPlaceholder = container.querySelector('#sig-box-placeholder');
    const prevPageBtn = container.querySelector('#sig-prev-page');
    const nextPageBtn = container.querySelector('#sig-next-page');
    const pageIndicator = container.querySelector('#sig-page-indicator');
    const pageWrapper = container.querySelector('#sig-page-wrapper');

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
          updateSignatureDataUrl();
        }
      });
    });

    drawClear.addEventListener('click', () => {
      padCtx.clearRect(0, 0, padCanvas.width, padCanvas.height);
      signatureDataUrl = null;
      boxImg.src = '';
      boxPlaceholder.classList.remove('hidden');
    });

    // Tab switching
    tabDraw.addEventListener('click', () => {
      signatureMode = 'draw';
      tabDraw.className = 'flex-1 py-1.5 text-xs font-bold rounded-lg bg-white dark:bg-slate-800 shadow-sm text-purple-600 dark:text-purple-400 transition';
      tabUpload.className = 'flex-1 py-1.5 text-xs font-bold rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition';
      tabType.className = 'flex-1 py-1.5 text-xs font-bold rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition';
      panelDraw.classList.remove('hidden');
      panelUpload.classList.add('hidden');
      panelType.classList.add('hidden');
      updateSignatureDataUrl();
    });

    tabUpload.addEventListener('click', () => {
      signatureMode = 'upload';
      tabUpload.className = 'flex-1 py-1.5 text-xs font-bold rounded-lg bg-white dark:bg-slate-800 shadow-sm text-purple-600 dark:text-purple-400 transition';
      tabDraw.className = 'flex-1 py-1.5 text-xs font-bold rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition';
      tabType.className = 'flex-1 py-1.5 text-xs font-bold rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition';
      panelUpload.classList.remove('hidden');
      panelDraw.classList.add('hidden');
      panelType.classList.add('hidden');
    });

    tabType.addEventListener('click', () => {
      signatureMode = 'type';
      tabType.className = 'flex-1 py-1.5 text-xs font-bold rounded-lg bg-white dark:bg-slate-800 shadow-sm text-purple-600 dark:text-purple-400 transition';
      tabDraw.className = 'flex-1 py-1.5 text-xs font-bold rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition';
      tabUpload.className = 'flex-1 py-1.5 text-xs font-bold rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition';
      panelType.classList.remove('hidden');
      panelDraw.classList.add('hidden');
      panelUpload.classList.add('hidden');
      updateTypedSignature();
    });

    // Upload signature image
    uploadInput.addEventListener('change', async () => {
      const f = uploadInput.files[0];
      if (!f) return;
      signatureDataUrl = await window.pdfEngine.readFileAsDataURL(f);
      boxImg.src = signatureDataUrl;
      boxPlaceholder.classList.add('hidden');
    });

    // Typed signature generator
    const updateTypedSignature = () => {
      const name = typeInput.value.trim() || 'Your Name';
      typePreview.innerText = name;

      const c = document.createElement('canvas');
      c.width = 400;
      c.height = 120;
      const ctx = c.getContext('2d');
      ctx.font = 'italic 42px "Brush Script MT", "Segoe Script", cursive, serif';
      ctx.fillStyle = '#1D4ED8';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(name, c.width / 2, c.height / 2);

      signatureDataUrl = c.toDataURL('image/png');
      boxImg.src = signatureDataUrl;
      boxPlaceholder.classList.add('hidden');
    };

    typeInput.addEventListener('input', updateTypedSignature);

    const updateSignatureDataUrl = () => {
      if (signatureMode === 'draw') {
        signatureDataUrl = padCanvas.toDataURL('image/png');
        boxImg.src = signatureDataUrl;
        boxPlaceholder.classList.add('hidden');
      }
    };

    // Sizing slider
    sizeSlider.addEventListener('input', () => {
      const w = parseInt(sizeSlider.value, 10);
      const h = Math.round(w * 0.38);
      sigBox.w = w;
      sigBox.h = h;
      dragBox.style.width = `${w}px`;
      dragBox.style.height = `${h}px`;
      sizeVal.innerText = `${w} px`;
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
      const wrapRect = pageWrapper.getBoundingClientRect();
      let newLeft = e.clientX - dragStartX;
      let newTop = e.clientY - dragStartY;

      // Bound within page preview
      newLeft = Math.max(0, Math.min(newLeft, pageWrapper.offsetWidth - dragBox.offsetWidth));
      newTop = Math.max(0, Math.min(newTop, pageWrapper.offsetHeight - dragBox.offsetHeight));

      dragBox.style.left = `${newLeft}px`;
      dragBox.style.top = `${newTop}px`;
      sigBox.x = newLeft;
      sigBox.y = newTop;
    });

    window.addEventListener('mouseup', () => {
      isDraggingBox = false;
    });

    // Page navigation
    const renderPdfPage = async () => {
      if (!pdfDoc) return;
      pageIndicator.innerText = `Page ${currentPageNum} / ${totalPages}`;
      targetPageNumSpan.innerText = `${currentPageNum}`;
      await window.pdfEngine.renderPageToCanvas(pdfDoc, currentPageNum, pdfCanvas, 460);
    };

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
        UI.showToast('Please draw, upload, or type a signature first.', 'error');
        return;
      }

      try {
        UI.showProgress(0.3, 'Embedding digital signature at selected position...');

        const page = await pdfDoc.getPage(currentPageNum);
        const unscaledViewport = page.getViewport({ scale: 1.0 });
        const scale = pdfCanvas.width / unscaledViewport.width;

        // Map canvas coordinates to PDF point coordinates (PDF origin is bottom-left)
        const pdfX = sigBox.x / scale;
        const pdfY = (pdfCanvas.height - (sigBox.y + sigBox.h)) / scale;
        const pdfW = sigBox.w / scale;
        const pdfH = sigBox.h / scale;

        const scope = container.querySelector('input[name="sig-scope"]:checked').value;
        const signaturesList = [];

        if (scope === 'all') {
          for (let i = 0; i < totalPages; i++) {
            signaturesList.push({
              pageIndex: i,
              signatureDataUrl,
              x: pdfX,
              y: pdfY,
              width: pdfW,
              height: pdfH
            });
          }
        } else if (scope === 'last') {
          signaturesList.push({
            pageIndex: totalPages - 1,
            signatureDataUrl,
            x: pdfX,
            y: pdfY,
            width: pdfW,
            height: pdfH
          });
        } else {
          // Current page
          signaturesList.push({
            pageIndex: currentPageNum - 1,
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
        UI.showToast('Document signed successfully!', 'success');
        UI.showResultPreview({
          title: 'Signed Document Ready',
          subtitle: 'Signature embedded with exact coordinate positioning. Inspect before saving',
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
