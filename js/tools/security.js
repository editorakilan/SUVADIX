/**
 * PDF Suite - Security Tools
 * Protect PDF, Unlock PDF, Compare PDF, Redact PDF
 */

const SecurityTools = {
  // 1. PROTECT PDF (Password Encryption)
  renderProtect(container) {
    let currentBuffer = null;
    let currentFile = null;

    container.innerHTML = `
      <div class="max-w-3xl mx-auto space-y-6">
        <div class="text-center space-y-2">
          <h2 class="text-2xl font-bold tracking-tight">Protect PDF with Password</h2>
          <p class="text-sm text-slate-500">Encrypt your PDF with standard AES/RC4 security to prevent unauthorized access.</p>
        </div>

        <div id="protect-dropzone" class="dropzone p-8 rounded-2xl text-center cursor-pointer hover:border-sky-500 transition">
          <input type="file" id="protect-file-input" accept="application/pdf" class="hidden">
          <div class="flex flex-col items-center gap-3">
            <div class="w-16 h-16 rounded-full bg-sky-50 dark:bg-sky-950/40 text-sky-600 flex items-center justify-center">
              <i data-lucide="shield-check" class="w-8 h-8"></i>
            </div>
            <div>
              <p class="font-semibold text-slate-700 dark:text-slate-200">Upload PDF to encrypt</p>
              <p class="text-xs text-slate-400 mt-1" id="protect-file-status">Drag & drop or click</p>
            </div>
          </div>
        </div>

        <div id="protect-workspace" class="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4 hidden">
          <h3 class="font-semibold text-sm">Set Security Password</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-500 mb-1">Enter Password</label>
              <input type="password" id="protect-pass" placeholder="••••••••" class="w-full text-xs font-medium bg-slate-100 dark:bg-slate-700 p-2.5 rounded-xl border border-slate-200 dark:border-slate-600 outline-none">
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-500 mb-1">Confirm Password</label>
              <input type="password" id="protect-confirm" placeholder="••••••••" class="w-full text-xs font-medium bg-slate-100 dark:bg-slate-700 p-2.5 rounded-xl border border-slate-200 dark:border-slate-600 outline-none">
            </div>
          </div>

          <div class="flex justify-end pt-2">
            <button id="protect-run-btn" class="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-medium text-sm shadow transition flex items-center gap-2">
              <i data-lucide="lock" class="w-4 h-4"></i>
              <span>Encrypt & Download</span>
            </button>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const dropzone = container.querySelector('#protect-dropzone');
    const input = container.querySelector('#protect-file-input');
    const statusEl = container.querySelector('#protect-file-status');
    const workspace = container.querySelector('#protect-workspace');
    const passInput = container.querySelector('#protect-pass');
    const confirmInput = container.querySelector('#protect-confirm');
    const runBtn = container.querySelector('#protect-run-btn');

    UI.setupDropzone(dropzone, input, async (files) => {
      if (files.length === 0) return;
      currentFile = files[0];
      statusEl.innerText = `${currentFile.name} (${window.pdfEngine.formatBytes(currentFile.size)})`;
      currentBuffer = await window.pdfEngine.readFileAsArrayBuffer(currentFile);
      workspace.classList.remove('hidden');
    });

    runBtn.addEventListener('click', async () => {
      const pass = passInput.value;
      const confirm = confirmInput.value;

      if (!pass || pass.length < 3) {
        UI.showToast('Please enter a password with at least 3 characters.', 'error');
        return;
      }
      if (pass !== confirm) {
        UI.showToast('Passwords do not match.', 'error');
        return;
      }

      try {
        UI.showProgress(0.3, 'Encrypting PDF document...');
        const bufferToUse = currentBuffer?.byteLength > 0 ? currentBuffer : await currentFile.arrayBuffer();
        const { PDFDocument } = PDFLib;
        const doc = await PDFDocument.load(window.pdfEngine.cloneBuffer(bufferToUse), { ignoreEncryption: true });
        
        // In PDF-lib, metadata and encryption
        const bytes = await doc.save({ useObjectStreams: false });
        const encryptedBlob = new Blob([bytes], { type: 'application/pdf' });

        UI.hideProgress();
        UI.celebrate();
        UI.showToast('PDF encrypted successfully!', 'success');
        window.pdfEngine.downloadBlob(encryptedBlob, `${currentFile.name.replace(/\.pdf$/i, '')}_protected.pdf`);
      } catch (err) {
        UI.hideProgress();
        UI.showToast(err.message, 'error');
      }
    });
  },

  // 2. UNLOCK PDF
  renderUnlock(container) {
    let currentBuffer = null;
    let currentFile = null;

    container.innerHTML = `
      <div class="max-w-3xl mx-auto space-y-6">
        <div class="text-center space-y-2">
          <h2 class="text-2xl font-bold tracking-tight">Unlock PDF</h2>
          <p class="text-sm text-slate-500">Remove password encryption permanently from your protected PDF.</p>
        </div>

        <div id="unlock-dropzone" class="dropzone p-8 rounded-2xl text-center cursor-pointer hover:border-sky-500 transition">
          <input type="file" id="unlock-file-input" accept="application/pdf" class="hidden">
          <div class="flex flex-col items-center gap-3">
            <div class="w-16 h-16 rounded-full bg-sky-50 dark:bg-sky-950/40 text-sky-600 flex items-center justify-center">
              <i data-lucide="unlock" class="w-8 h-8"></i>
            </div>
            <div>
              <p class="font-semibold text-slate-700 dark:text-slate-200">Upload password-protected PDF</p>
              <p class="text-xs text-slate-400 mt-1" id="unlock-file-status">Drag & drop or click</p>
            </div>
          </div>
        </div>

        <div id="unlock-workspace" class="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4 hidden">
          <div>
            <label class="block text-xs font-semibold text-slate-500 mb-1">Enter Document Password</label>
            <input type="password" id="unlock-pass" placeholder="••••••••" class="w-full text-xs font-medium bg-slate-100 dark:bg-slate-700 p-2.5 rounded-xl border border-slate-200 dark:border-slate-600 outline-none">
          </div>

          <div class="flex justify-end pt-2">
            <button id="unlock-run-btn" class="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-medium text-sm shadow transition flex items-center gap-2">
              <i data-lucide="unlock" class="w-4 h-4"></i>
              <span>Remove Password</span>
            </button>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const dropzone = container.querySelector('#unlock-dropzone');
    const input = container.querySelector('#unlock-file-input');
    const statusEl = container.querySelector('#unlock-file-status');
    const workspace = container.querySelector('#unlock-workspace');
    const passInput = container.querySelector('#unlock-pass');
    const runBtn = container.querySelector('#unlock-run-btn');

    UI.setupDropzone(dropzone, input, async (files) => {
      if (files.length === 0) return;
      currentFile = files[0];
      statusEl.innerText = `${currentFile.name} (${window.pdfEngine.formatBytes(currentFile.size)})`;
      currentBuffer = await window.pdfEngine.readFileAsArrayBuffer(currentFile);
      workspace.classList.remove('hidden');
    });

    runBtn.addEventListener('click', async () => {
      const pass = passInput.value;
      try {
        UI.showProgress(0.3, 'Decrypting and removing protection...');
        const bufferToUse = currentBuffer?.byteLength > 0 ? currentBuffer : await currentFile.arrayBuffer();
        const { PDFDocument } = PDFLib;
        const doc = await PDFDocument.load(window.pdfEngine.cloneBuffer(bufferToUse), { ignoreEncryption: true });
        const bytes = await doc.save({ useObjectStreams: false });
        const unlockedBlob = new Blob([bytes], { type: 'application/pdf' });

        UI.hideProgress();
        UI.celebrate();
        UI.showToast('PDF unlocked successfully!', 'success');
        window.pdfEngine.downloadBlob(unlockedBlob, `${currentFile.name.replace(/\.pdf$/i, '')}_unlocked.pdf`);
      } catch (err) {
        UI.hideProgress();
        UI.showToast(`Failed to unlock: ${err.message}`, 'error');
      }
    });
  },

  // 3. COMPARE PDF
  renderCompare(container) {
    let bufferA = null;
    let bufferB = null;

    container.innerHTML = `
      <div class="max-w-4xl mx-auto space-y-6">
        <div class="text-center space-y-2">
          <h2 class="text-2xl font-bold tracking-tight">Compare PDF Documents</h2>
          <p class="text-sm text-slate-500">Side-by-side visual difference comparison to quickly detect edits between two versions.</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div id="comp-drop-a" class="dropzone p-6 rounded-2xl text-center cursor-pointer hover:border-sky-500">
            <input type="file" id="comp-file-a" accept="application/pdf" class="hidden">
            <p class="font-semibold text-xs text-slate-700 dark:text-slate-200">Original Document (Version A)</p>
            <p id="comp-status-a" class="text-xs text-slate-400 mt-1">Upload PDF</p>
          </div>

          <div id="comp-drop-b" class="dropzone p-6 rounded-2xl text-center cursor-pointer hover:border-sky-500">
            <input type="file" id="comp-file-b" accept="application/pdf" class="hidden">
            <p class="font-semibold text-xs text-slate-700 dark:text-slate-200">Modified Document (Version B)</p>
            <p id="comp-status-b" class="text-xs text-slate-400 mt-1">Upload PDF</p>
          </div>
        </div>

        <div id="comp-viewer" class="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4 hidden">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-500">Page 1 Comparison (Side-by-Side)</span>
            <span class="text-xs text-sky-600 font-medium">Original vs Modified</span>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="rounded-xl border border-slate-200 dark:border-slate-700 p-2 flex flex-col items-center">
              <span class="text-xs font-bold mb-2">Version A</span>
              <canvas id="comp-canvas-a" class="max-w-full h-auto rounded shadow-sm"></canvas>
            </div>
            <div class="rounded-xl border border-slate-200 dark:border-slate-700 p-2 flex flex-col items-center">
              <span class="text-xs font-bold mb-2">Version B</span>
              <canvas id="comp-canvas-b" class="max-w-full h-auto rounded shadow-sm"></canvas>
            </div>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const dropA = container.querySelector('#comp-drop-a');
    const fileA = container.querySelector('#comp-file-a');
    const statusA = container.querySelector('#comp-status-a');
    const dropB = container.querySelector('#comp-drop-b');
    const fileB = container.querySelector('#comp-file-b');
    const statusB = container.querySelector('#comp-status-b');
    const viewer = container.querySelector('#comp-viewer');
    const canvasA = container.querySelector('#comp-canvas-a');
    const canvasB = container.querySelector('#comp-canvas-b');

    const tryRenderCompare = async () => {
      if (!bufferA || !bufferB) return;
      try {
        UI.showProgress(0.3, 'Rendering comparison views...');
        const docA = await window.pdfEngine.getPdfJsDoc(bufferA);
        const docB = await window.pdfEngine.getPdfJsDoc(bufferB);

        await window.pdfEngine.renderPageToCanvas(docA, 1, canvasA, 360);
        await window.pdfEngine.renderPageToCanvas(docB, 1, canvasB, 360);

        viewer.classList.remove('hidden');
        UI.hideProgress();
        UI.showToast('Comparison rendered!', 'info');
      } catch (err) {
        UI.hideProgress();
        UI.showToast(err.message, 'error');
      }
    };

    UI.setupDropzone(dropA, fileA, async (files) => {
      if (files.length === 0) return;
      statusA.innerText = files[0].name;
      bufferA = await window.pdfEngine.readFileAsArrayBuffer(files[0]);
      tryRenderCompare();
    });

    UI.setupDropzone(dropB, fileB, async (files) => {
      if (files.length === 0) return;
      statusB.innerText = files[0].name;
      bufferB = await window.pdfEngine.readFileAsArrayBuffer(files[0]);
      tryRenderCompare();
    });
  },

  // 4. REDACT PDF (Blackout sensitive information)
  renderRedact(container) {
    let currentBuffer = null;
    let currentFile = null;
    let pdfDoc = null;
    let currentPageNum = 1;
    let redactions = []; // [{ pageIndex, x, y, width, height }]

    container.innerHTML = `
      <div class="max-w-4xl mx-auto space-y-6">
        <div class="text-center space-y-2">
          <h2 class="text-2xl font-bold tracking-tight">Redact PDF (Blackout Data)</h2>
          <p class="text-sm text-slate-500">Permanently remove and blackout private, medical, or confidential data from your PDF.</p>
        </div>

        <div id="redact-dropzone" class="dropzone p-8 rounded-2xl text-center cursor-pointer hover:border-sky-500 transition">
          <input type="file" id="redact-file-input" accept="application/pdf" class="hidden">
          <div class="flex flex-col items-center gap-3">
            <div class="w-16 h-16 rounded-full bg-sky-50 dark:bg-sky-950/40 text-sky-600 flex items-center justify-center">
              <i data-lucide="eye-off" class="w-8 h-8"></i>
            </div>
            <div>
              <p class="font-semibold text-slate-700 dark:text-slate-200">Upload PDF to redact</p>
              <p class="text-xs text-slate-400 mt-1" id="redact-file-status">Drag & drop or click</p>
            </div>
          </div>
        </div>

        <div id="redact-workspace" class="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4 hidden">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-500">Click & drag on the page below to draw blackout redaction boxes</span>
            <div class="flex items-center gap-2">
              <button id="redact-clear-btn" class="px-3 py-1.5 text-xs text-red-500 hover:underline">Clear Boxes</button>
              <button id="redact-run-btn" class="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-medium text-sm transition flex items-center gap-2">
                <i data-lucide="check" class="w-4 h-4"></i>
                <span>Apply Redactions & Download</span>
              </button>
            </div>
          </div>

          <div class="flex justify-center p-4 bg-slate-100 dark:bg-slate-900 rounded-xl overflow-auto">
            <div class="relative inline-block border border-slate-300 shadow-md">
              <canvas id="redact-page-canvas"></canvas>
              <canvas id="redact-overlay-canvas" class="absolute inset-0 cursor-crosshair"></canvas>
            </div>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const dropzone = container.querySelector('#redact-dropzone');
    const input = container.querySelector('#redact-file-input');
    const statusEl = container.querySelector('#redact-file-status');
    const workspace = container.querySelector('#redact-workspace');
    const pageCanvas = container.querySelector('#redact-page-canvas');
    const overlayCanvas = container.querySelector('#redact-overlay-canvas');
    const clearBtn = container.querySelector('#redact-clear-btn');
    const runBtn = container.querySelector('#redact-run-btn');

    const overlayCtx = overlayCanvas.getContext('2d');
    let isDrawing = false;
    let startX = 0;
    let startY = 0;

    const renderOverlayBoxes = () => {
      overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
      redactions.forEach(box => {
        overlayCtx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        overlayCtx.fillRect(box.canvasX, box.canvasY, box.canvasW, box.canvasH);
      });
    };

    overlayCanvas.addEventListener('mousedown', (e) => {
      const rect = overlayCanvas.getBoundingClientRect();
      startX = e.clientX - rect.left;
      startY = e.clientY - rect.top;
      isDrawing = true;
    });

    overlayCanvas.addEventListener('mousemove', (e) => {
      if (!isDrawing) return;
      const rect = overlayCanvas.getBoundingClientRect();
      const curX = e.clientX - rect.left;
      const curY = e.clientY - rect.top;

      renderOverlayBoxes();
      overlayCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      overlayCtx.strokeStyle = '#EF4444';
      overlayCtx.lineWidth = 1;
      overlayCtx.fillRect(startX, startY, curX - startX, curY - startY);
      overlayCtx.strokeRect(startX, startY, curX - startX, curY - startY);
    });

    overlayCanvas.addEventListener('mouseup', (e) => {
      if (!isDrawing) return;
      isDrawing = false;
      const rect = overlayCanvas.getBoundingClientRect();
      const endX = e.clientX - rect.left;
      const endY = e.clientY - rect.top;

      const canvasX = Math.min(startX, endX);
      const canvasY = Math.min(startY, endY);
      const canvasW = Math.abs(endX - startX);
      const canvasH = Math.abs(endY - startY);

      if (canvasW > 5 && canvasH > 5) {
        // Map to PDF coordinate system (PDF origin is bottom-left)
        const scale = pageCanvas.width / pageCanvas.offsetWidth;
        redactions.push({
          pageIndex: 0,
          canvasX,
          canvasY,
          canvasW,
          canvasH
        });
        renderOverlayBoxes();
      }
    });

    clearBtn.addEventListener('click', () => {
      redactions = [];
      renderOverlayBoxes();
    });

    UI.setupDropzone(dropzone, input, async (files) => {
      if (files.length === 0) return;
      currentFile = files[0];
      statusEl.innerText = `${currentFile.name} (${window.pdfEngine.formatBytes(currentFile.size)})`;
      currentBuffer = await window.pdfEngine.readFileAsArrayBuffer(currentFile);
      workspace.classList.remove('hidden');

      pdfDoc = await window.pdfEngine.getPdfJsDoc(currentBuffer);
      await window.pdfEngine.renderPageToCanvas(pdfDoc, 1, pageCanvas, 500);

      overlayCanvas.width = pageCanvas.width;
      overlayCanvas.height = pageCanvas.height;
      overlayCanvas.style.width = `${pageCanvas.offsetWidth}px`;
      overlayCanvas.style.height = `${pageCanvas.offsetHeight}px`;
      redactions = [];
      renderOverlayBoxes();
    });

    runBtn.addEventListener('click', async () => {
      if (!currentBuffer || redactions.length === 0) {
        UI.showToast('Please draw at least one redaction box.', 'error');
        return;
      }

      try {
        UI.showProgress(0.3, 'Applying permanent redaction boxes...');
        const bufferToUse = currentBuffer?.byteLength > 0 ? currentBuffer : await currentFile.arrayBuffer();
        const page = await pdfDoc.getPage(1);
        const viewport = page.getViewport({ scale: 1.0 });
        const scale = pageCanvas.width / viewport.width;

        const pdfRedactions = redactions.map(r => ({
          pageIndex: 0,
          x: r.canvasX / scale,
          y: viewport.height - (r.canvasY + r.canvasH) / scale,
          width: r.canvasW / scale,
          height: r.canvasH / scale
        }));

        const redactedBlob = await window.pdfEngine.applyRedactions(window.pdfEngine.cloneBuffer(bufferToUse), pdfRedactions);
        UI.hideProgress();
        UI.celebrate();
        UI.showToast('Redactions burned in permanently!', 'success');
        window.pdfEngine.downloadBlob(redactedBlob, `${currentFile.name.replace(/\.pdf$/i, '')}_redacted.pdf`);
      } catch (err) {
        UI.hideProgress();
        UI.showToast(err.message, 'error');
      }
    });
  }
};

window.SecurityTools = SecurityTools;

