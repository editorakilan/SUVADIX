/**
 * PDF Suite - Edit PDF Tools
 * Rotate PDF, Add Page Numbers, Add Watermark, Crop PDF, Sign PDF
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
      if (!currentBuffer) return;
      try {
        UI.showProgress(0.3, 'Rotating pages...');
        const rotatedBlob = await window.pdfEngine.rotatePages(currentBuffer, selectedAngle);
        UI.hideProgress();
        UI.celebrate();
        UI.showToast(`Rotated PDF by ${selectedAngle}°!`, 'success');
        window.pdfEngine.downloadBlob(rotatedBlob, `${currentFile.name.replace(/\.pdf$/i, '')}_rotated.pdf`);
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
      if (!currentBuffer) return;
      try {
        UI.showProgress(0.3, 'Adding page numbers...');
        const position = posSelect.value;
        const format = formatSelect.value;
        const numberedBlob = await window.pdfEngine.addPageNumbers(currentBuffer, { position, format });
        UI.hideProgress();
        UI.celebrate();
        UI.showToast('Page numbers applied!', 'success');
        window.pdfEngine.downloadBlob(numberedBlob, `${currentFile.name.replace(/\.pdf$/i, '')}_numbered.pdf`);
      } catch (err) {
        UI.hideProgress();
        UI.showToast(err.message, 'error');
      }
    });
  },

  // 3. ADD WATERMARK
  renderAddWatermark(container) {
    let currentBuffer = null;
    let currentFile = null;

    container.innerHTML = `
      <div class="max-w-3xl mx-auto space-y-6">
        <div class="text-center space-y-2">
          <h2 class="text-2xl font-bold tracking-tight">Add Watermark</h2>
          <p class="text-sm text-slate-500">Stamp confidential notices, company names, or copyright marks onto your PDF.</p>
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

        <div id="wm-workspace" class="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4 hidden">
          <h3 class="font-semibold text-sm">Watermark Settings</h3>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-500 mb-1">Watermark Text</label>
              <input type="text" id="wm-text" value="CONFIDENTIAL" class="w-full text-xs font-medium bg-slate-100 dark:bg-slate-700 p-2.5 rounded-xl border border-slate-200 dark:border-slate-600 outline-none">
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-500 mb-1">Color</label>
              <div class="flex items-center gap-2">
                <input type="color" id="wm-color" value="#EF4444" class="w-10 h-9 rounded cursor-pointer border-0 bg-transparent">
                <span class="text-xs text-slate-400">Pick color</span>
              </div>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-500 mb-1">Opacity (<span id="wm-op-val">25%</span>)</label>
              <input type="range" id="wm-opacity" min="5" max="90" value="25" class="w-full accent-purple-600">
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-500 mb-1">Pattern</label>
              <div class="flex items-center gap-4 pt-1">
                <label class="flex items-center gap-2 cursor-pointer text-xs">
                  <input type="radio" name="wm-repeat" value="false" checked class="text-purple-600">
                  <span>Centered</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer text-xs">
                  <input type="radio" name="wm-repeat" value="true" class="text-purple-600">
                  <span>Repeated Grid</span>
                </label>
              </div>
            </div>
          </div>

          <div class="flex justify-end pt-2">
            <button id="wm-run-btn" class="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm shadow transition flex items-center gap-2">
              <i data-lucide="stamp" class="w-4 h-4"></i>
              <span>Apply Watermark</span>
            </button>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const dropzone = container.querySelector('#wm-dropzone');
    const input = container.querySelector('#wm-file-input');
    const statusEl = container.querySelector('#wm-file-status');
    const workspace = container.querySelector('#wm-workspace');
    const textInput = container.querySelector('#wm-text');
    const colorInput = container.querySelector('#wm-color');
    const opacityInput = container.querySelector('#wm-opacity');
    const opVal = container.querySelector('#wm-op-val');
    const runBtn = container.querySelector('#wm-run-btn');

    opacityInput.addEventListener('input', () => {
      opVal.innerText = `${opacityInput.value}%`;
    });

    UI.setupDropzone(dropzone, input, async (files) => {
      if (files.length === 0) return;
      currentFile = files[0];
      statusEl.innerText = `${currentFile.name} (${window.pdfEngine.formatBytes(currentFile.size)})`;
      currentBuffer = await window.pdfEngine.readFileAsArrayBuffer(currentFile);
      workspace.classList.remove('hidden');
    });

    runBtn.addEventListener('click', async () => {
      if (!currentBuffer) return;
      try {
        UI.showProgress(0.3, 'Stamping watermark...');
        const text = textInput.value || 'CONFIDENTIAL';
        const colorHex = colorInput.value;
        const opacity = parseInt(opacityInput.value, 10) / 100;
        const repeat = container.querySelector('input[name="wm-repeat"]:checked').value === 'true';

        const watermarkedBlob = await window.pdfEngine.addWatermark(currentBuffer, { text, colorHex, opacity, repeat });
        UI.hideProgress();
        UI.celebrate();
        UI.showToast('Watermark added!', 'success');
        window.pdfEngine.downloadBlob(watermarkedBlob, `${currentFile.name.replace(/\.pdf$/i, '')}_watermarked.pdf`);
      } catch (err) {
        UI.hideProgress();
        UI.showToast(err.message, 'error');
      }
    });
  },

  // 4. SIGN PDF
  renderSign(container) {
    let currentBuffer = null;
    let currentFile = null;

    container.innerHTML = `
      <div class="max-w-3xl mx-auto space-y-6">
        <div class="text-center space-y-2">
          <h2 class="text-2xl font-bold tracking-tight">Sign PDF Document</h2>
          <p class="text-sm text-slate-500">Draw your digital signature on canvas and stamp it directly onto your PDF.</p>
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

        <div id="sign-workspace" class="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-5 hidden">
          <div>
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-semibold text-sm">Draw Signature</h3>
              <div class="flex items-center gap-2">
                <button id="sig-color-black" class="w-5 h-5 rounded-full bg-black border-2 border-purple-500"></button>
                <button id="sig-color-blue" class="w-5 h-5 rounded-full bg-blue-700 border-2 border-transparent"></button>
                <button id="sig-clear-btn" class="text-xs text-red-500 hover:underline ml-2">Clear</button>
              </div>
            </div>
            <div class="rounded-xl border border-slate-200 overflow-hidden shadow-inner">
              <canvas id="sig-canvas" width="600" height="200" class="w-full bg-white"></canvas>
            </div>
          </div>

          <div class="flex justify-end pt-2">
            <button id="sign-run-btn" class="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm shadow transition flex items-center gap-2">
              <i data-lucide="check-circle" class="w-4 h-4"></i>
              <span>Apply Signature & Download</span>
            </button>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const dropzone = container.querySelector('#sign-dropzone');
    const input = container.querySelector('#sign-file-input');
    const statusEl = container.querySelector('#sign-file-status');
    const workspace = container.querySelector('#sign-workspace');
    const canvas = container.querySelector('#sig-canvas');
    const clearBtn = container.querySelector('#sig-clear-btn');
    const runBtn = container.querySelector('#sign-run-btn');
    const blackBtn = container.querySelector('#sig-color-black');
    const blueBtn = container.querySelector('#sig-color-blue');

    const ctx = canvas.getContext('2d');
    let isDrawing = false;
    let strokeColor = '#000000';

    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    blackBtn.addEventListener('click', () => {
      strokeColor = '#000000';
      blackBtn.classList.add('border-purple-500');
      blueBtn.classList.remove('border-purple-500');
    });

    blueBtn.addEventListener('click', () => {
      strokeColor = '#1D4ED8';
      blueBtn.classList.add('border-purple-500');
      blackBtn.classList.remove('border-purple-500');
    });

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    };

    canvas.addEventListener('mousedown', (e) => {
      isDrawing = true;
      const pos = getPos(e);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      ctx.strokeStyle = strokeColor;
    });

    canvas.addEventListener('mousemove', (e) => {
      if (!isDrawing) return;
      const pos = getPos(e);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    });

    ['mouseup', 'mouseleave'].forEach(ev => {
      canvas.addEventListener(ev, () => { isDrawing = false; });
    });

    clearBtn.addEventListener('click', () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    UI.setupDropzone(dropzone, input, async (files) => {
      if (files.length === 0) return;
      currentFile = files[0];
      statusEl.innerText = `${currentFile.name} (${window.pdfEngine.formatBytes(currentFile.size)})`;
      currentBuffer = await window.pdfEngine.readFileAsArrayBuffer(currentFile);
      workspace.classList.remove('hidden');
    });

    runBtn.addEventListener('click', async () => {
      if (!currentBuffer) return;
      try {
        UI.showProgress(0.3, 'Embedding digital signature...');
        const signatureDataUrl = canvas.toDataURL('image/png');
        const signedBlob = await window.pdfEngine.applySignature(currentBuffer, 0, signatureDataUrl);
        UI.hideProgress();
        UI.celebrate();
        UI.showToast('Signature stamped successfully!', 'success');
        window.pdfEngine.downloadBlob(signedBlob, `${currentFile.name.replace(/\.pdf$/i, '')}_signed.pdf`);
      } catch (err) {
        UI.hideProgress();
        UI.showToast(err.message, 'error');
      }
    });
  }
};

window.EditTools = EditTools;
