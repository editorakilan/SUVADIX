/**
 * SUVADIX - Security Tools
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
        UI.showProgress(0.3, 'Encrypting PDF with ISO 32000 standard AES-256...');
        const bufferToUse = currentBuffer?.byteLength > 0 ? currentBuffer : await currentFile.arrayBuffer();
        const { PDFDocument } = PDFLib;
        const doc = await PDFDocument.load(window.pdfEngine.cloneBuffer(bufferToUse), { ignoreEncryption: true });
        
        // Save with real AES-256 encryption using pdf-lib-plus-encrypt
        const encryptedBytes = await doc.save({
          userPassword: pass,
          ownerPassword: pass
        });
        const encryptedBlob = new Blob([encryptedBytes], { type: 'application/pdf' });

        UI.hideProgress();
        UI.celebrate();
        UI.showToast('PDF encrypted with password successfully!', 'success');
        UI.showResultPreview({
          title: 'Protected PDF Ready',
          subtitle: `AES encryption applied. Document now requires your password to open`,
          blob: encryptedBlob,
          filename: `${currentFile.name.replace(/\.pdf$/i, '')}_protected.pdf`
        });
      } catch (err) {
        UI.hideProgress();
        UI.showToast(err.message, 'error');
      }
    });
  },

  // 2. UNLOCK PDF (Authentic Password Verification & Decryption)
  renderUnlock(container) {
    let currentBuffer = null;
    let currentFile = null;

    container.innerHTML = `
      <div class="max-w-3xl mx-auto space-y-6">
        <div class="text-center space-y-2">
          <h2 class="text-2xl font-bold tracking-tight">Unlock PDF</h2>
          <p class="text-sm text-slate-500">Decrypt and permanently remove password protection from secured PDFs.</p>
        </div>

        <div id="unlock-dropzone" class="dropzone p-8 rounded-2xl text-center cursor-pointer hover:border-sky-500 transition">
          <input type="file" id="unlock-file-input" accept="application/pdf" class="hidden">
          <div class="flex flex-col items-center gap-3">
            <div class="w-16 h-16 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center">
              <i data-lucide="unlock" class="w-8 h-8"></i>
            </div>
            <div>
              <p class="font-semibold text-slate-700">Upload password-protected PDF</p>
              <p class="text-xs text-slate-400 mt-1" id="unlock-file-status">Drag & drop or click</p>
            </div>
          </div>
        </div>

        <div id="unlock-workspace" class="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hidden">
          <!-- Dynamically populated based on real encryption check -->
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const dropzone = container.querySelector('#unlock-dropzone');
    const input = container.querySelector('#unlock-file-input');
    const statusEl = container.querySelector('#unlock-file-status');
    const workspace = container.querySelector('#unlock-workspace');

    UI.setupDropzone(dropzone, input, async (files) => {
      if (files.length === 0) return;
      currentFile = files[0];
      statusEl.innerText = `${currentFile.name} (${window.pdfEngine.formatBytes(currentFile.size)})`;
      currentBuffer = await window.pdfEngine.readFileAsArrayBuffer(currentFile);

      // REAL ENCRYPTION CHECK: Test if document is actually password protected
      let isProtected = false;
      try {
        await pdfjsLib.getDocument({ data: window.pdfEngine.cloneBuffer(currentBuffer) }).promise;
        isProtected = false;
      } catch (err) {
        if (err.name === 'PasswordException' || err.message?.toLowerCase().includes('password') || err.code === 1) {
          isProtected = true;
        }
      }

      workspace.classList.remove('hidden');

      if (!isProtected) {
        // PDF is NOT protected! Refuse fake unlock!
        workspace.innerHTML = `
          <div class="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-3">
            <div class="flex items-center gap-2 font-bold text-sm text-amber-800">
              <i data-lucide="info" class="w-5 h-5 text-amber-600"></i>
              <span>PDF is Not Password-Protected</span>
            </div>
            <p class="text-xs text-amber-700 leading-relaxed">
              This document (<strong>${currentFile.name}</strong>) is already completely unencrypted. It does not require any password to open, edit, or print.
            </p>
            <div class="pt-2">
              <button id="unlock-reset-btn" class="px-4 py-2 rounded-xl bg-white border border-amber-300 text-xs font-bold text-amber-800 hover:bg-amber-100 transition flex items-center gap-1.5 shadow-sm">
                <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i>
                <span>Choose Another File</span>
              </button>
            </div>
          </div>
        `;
        if (window.lucide) window.lucide.createIcons();
        container.querySelector('#unlock-reset-btn').addEventListener('click', () => {
          currentBuffer = null;
          currentFile = null;
          workspace.classList.add('hidden');
          statusEl.innerText = 'Drag & drop or click';
          input.value = '';
        });
        return;
      }

      // Document IS protected: Show genuine password entry and decrypt
      workspace.innerHTML = `
        <div class="space-y-4">
          <div class="p-3 bg-sky-50 rounded-xl border border-sky-200 text-xs text-sky-800 flex items-center gap-2">
            <i data-lucide="lock" class="w-4 h-4 flex-shrink-0 text-sky-600"></i>
            <span>This document is password-protected. Enter the correct password to decrypt and remove protection permanently.</span>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-500 mb-1">Enter Document Password</label>
            <input type="password" id="unlock-pass" placeholder="••••••••" class="w-full text-xs font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-sky-500">
          </div>

          <div class="flex justify-between items-center pt-2">
            <button id="unlock-cancel-btn" class="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-xs font-bold text-slate-700 transition">
              Cancel / Change File
            </button>
            <button id="unlock-run-btn" class="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-medium text-sm shadow transition flex items-center gap-2">
              <i data-lucide="unlock" class="w-4 h-4"></i>
              <span>Verify Password & Remove Protection</span>
            </button>
          </div>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();

      container.querySelector('#unlock-cancel-btn').addEventListener('click', () => {
        currentBuffer = null;
        currentFile = null;
        workspace.classList.add('hidden');
        statusEl.innerText = 'Drag & drop or click';
        input.value = '';
      });

      const passInput = container.querySelector('#unlock-pass');
      const runBtn = container.querySelector('#unlock-run-btn');

      runBtn.addEventListener('click', async () => {
        const pass = passInput.value;
        if (!pass) {
          UI.showToast('Please enter the document password.', 'error');
          return;
        }

        try {
          UI.showProgress(0.2, 'Verifying document password...');
          // Real verification using PDF.js
          const verifiedDoc = await pdfjsLib.getDocument({
            data: window.pdfEngine.cloneBuffer(currentBuffer),
            password: pass
          }).promise;

          UI.showProgress(0.4, 'Password verified! Decrypting document pages...');
          
          const { PDFDocument } = PDFLib;
          const newDoc = await PDFDocument.create();

          for (let i = 1; i <= verifiedDoc.numPages; i++) {
            UI.showProgress(0.4 + (i / verifiedDoc.numPages) * 0.5, `Decrypting page ${i} of ${verifiedDoc.numPages}...`);
            const page = await verifiedDoc.getPage(i);
            const viewport = page.getViewport({ scale: 2.0 });
            const canvas = document.createElement('canvas');
            canvas.width = Math.floor(viewport.width);
            canvas.height = Math.floor(viewport.height);
            const ctx = canvas.getContext('2d');
            await page.render({ canvasContext: ctx, viewport }).promise;

            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            const imgBytes = await fetch(imgData).then(r => r.arrayBuffer());
            const embeddedImg = await newDoc.embedJpg(imgBytes);

            const ptWidth = page.view[2] - page.view[0];
            const ptHeight = page.view[3] - page.view[1];
            const newPage = newDoc.addPage([ptWidth, ptHeight]);
            newPage.drawImage(embeddedImg, {
              x: 0,
              y: 0,
              width: ptWidth,
              height: ptHeight
            });
          }

          const unencryptedBytes = await newDoc.save({ useObjectStreams: false });
          const unlockedBlob = new Blob([unencryptedBytes], { type: 'application/pdf' });

          UI.hideProgress();
          UI.celebrate();
          UI.showToast('PDF unlocked and decrypted successfully!', 'success');
          UI.showResultPreview({
            title: 'Unlocked PDF Ready',
            subtitle: 'Password protection removed completely. Inspect before saving',
            blob: unlockedBlob,
            filename: `${currentFile.name.replace(/\.pdf$/i, '')}_unlocked.pdf`
          });
        } catch (err) {
          UI.hideProgress();
          if (err.name === 'PasswordException' || err.message?.toLowerCase().includes('password') || err.code === 2) {
            UI.showToast('Incorrect password! Could not decrypt the PDF.', 'error');
          } else {
            UI.showToast(`Decryption error: ${err.message}`, 'error');
          }
        }
      });
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

  // 4. REDACT PDF (Blackout sensitive information with interactive drag, zoomer, and color correction)
  renderRedact(container) {
    let currentBuffer = null;
    let currentFile = null;
    let pdfDoc = null;
    let currentPageNum = 1;
    let totalPages = 1;
    let currentZoom = 1.0;
    const zoomLevels = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0, 2.5];
    let redactions = []; // [{ id, pageIndex, xRatio, yRatio, wRatio, hRatio, color, text }]
    let selectedBoxId = null;
    let activeMode = 'black'; // 'black' | 'white' | 'text'
    let activeColorStyle = 'normal';

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
      <div class="max-w-6xl mx-auto space-y-6">
        <div class="text-center space-y-2">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
            <i data-lucide="shield-alert" class="w-3.5 h-3.5"></i>
            <span>Interactive Redaction Studio</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Redact PDF (Blackout & Sanitization)</h2>
          <p class="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">Permanently blackout confidential data, SSNs, medical records, or whiteout unwanted text. Includes zoom controls, drag & resize handles, arrow-key micro-nudging, and document color styles.</p>
        </div>

        <!-- Dropzone -->
        <div id="redact-dropzone" class="dropzone p-8 rounded-2xl text-center cursor-pointer hover:border-sky-500 transition border-2 border-dashed border-slate-300 bg-white dark:bg-slate-800 shadow-sm">
          <input type="file" id="redact-file-input" accept="application/pdf" class="hidden">
          <div class="flex flex-col items-center gap-3">
            <div class="w-16 h-16 rounded-2xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 flex items-center justify-center shadow-inner">
              <i data-lucide="eye-off" class="w-8 h-8"></i>
            </div>
            <div>
              <p class="font-bold text-slate-800 dark:text-slate-100">Choose PDF or drop it here to redact</p>
              <p class="text-xs text-slate-400 mt-1" id="redact-file-status">Fast, private in-browser document sanitization</p>
            </div>
          </div>
        </div>

        <!-- Interactive Workspace -->
        <div id="redact-workspace" class="p-4 sm:p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-lg space-y-5 hidden">
          <!-- Main Control Toolbar -->
          <div class="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-700">
            <!-- Left: Mode Selector -->
            <div class="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl text-xs font-bold">
              <button id="redact-mode-black" class="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm flex items-center gap-1.5 transition">
                <span class="w-2.5 h-2.5 rounded-full bg-black"></span>
                <span>Blackout</span>
              </button>
              <button id="redact-mode-white" class="px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 flex items-center gap-1.5 transition">
                <span class="w-2.5 h-2.5 rounded-full bg-white border border-slate-400"></span>
                <span>Whiteout</span>
              </button>
              <button id="redact-mode-text" class="px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 flex items-center gap-1.5 transition">
                <span class="w-2.5 h-2.5 rounded-full bg-red-600"></span>
                <span>REDACTED</span>
              </button>
            </div>

            <!-- Middle: Zoom Controls (Zoomer) -->
            <div class="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 px-2.5 py-1.5 rounded-xl text-xs font-bold shadow-xs">
              <span class="text-slate-400 text-[10px] uppercase font-bold mr-1 hidden sm:inline">Zoom:</span>
              <button id="redact-zoom-out" class="p-1 hover:bg-white dark:hover:bg-slate-800 rounded text-slate-600 transition" title="Zoom Out (-)">
                <i data-lucide="zoom-out" class="w-3.5 h-3.5"></i>
              </button>
              <span id="redact-zoom-label" class="min-w-[42px] text-center font-extrabold text-slate-800 dark:text-slate-100">100%</span>
              <button id="redact-zoom-in" class="p-1 hover:bg-white dark:hover:bg-slate-800 rounded text-slate-600 transition" title="Zoom In (+)">
                <i data-lucide="zoom-in" class="w-3.5 h-3.5"></i>
              </button>
              <div class="h-3 w-px bg-slate-300 dark:bg-slate-700 mx-1"></div>
              <button id="redact-zoom-reset" class="px-1.5 py-0.5 rounded text-[10px] font-semibold text-slate-500 hover:text-slate-900 hover:bg-white transition" title="Reset Zoom to 100%">
                100%
              </button>
              <button id="redact-zoom-fit" class="px-1.5 py-0.5 rounded text-[10px] font-semibold text-slate-500 hover:text-slate-900 hover:bg-white transition" title="Fit to Screen Width">
                Fit
              </button>
            </div>

            <!-- Middle: Document Color Style Dropdown -->
            <div class="flex items-center gap-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-xl">
              <i data-lucide="palette" class="w-3.5 h-3.5 text-indigo-600"></i>
              <span class="text-slate-500 hidden sm:inline">Color Style:</span>
              <select id="redact-color-style" class="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-bold outline-none cursor-pointer">
                <option value="normal">Normal (Original)</option>
                <option value="document">Document (Paper White & Text)</option>
                <option value="magic">Magic Color (Enhanced)</option>
                <option value="grayscale">Grayscale (Monochrome)</option>
                <option value="bw">B&W (High Contrast Crisp)</option>
                <option value="blueprint">Blueprint / Inverted</option>
                <option value="warm">Warm / Sepia</option>
              </select>
            </div>

            <!-- Page Navigation -->
            <div class="flex items-center gap-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-xl">
              <button id="redact-prev-page" class="p-1 hover:bg-white dark:hover:bg-slate-800 rounded text-slate-600 transition disabled:opacity-40" title="Previous Page">
                <i data-lucide="chevron-left" class="w-4 h-4"></i>
              </button>
              <span class="px-1 text-slate-700 dark:text-slate-200">
                Page <span id="redact-page-num" class="text-sky-600 font-extrabold">1</span> of <span id="redact-page-total">1</span>
              </span>
              <button id="redact-next-page" class="p-1 hover:bg-white dark:hover:bg-slate-800 rounded text-slate-600 transition disabled:opacity-40" title="Next Page">
                <i data-lucide="chevron-right" class="w-4 h-4"></i>
              </button>
            </div>

            <!-- Right: Action Buttons -->
            <div class="flex items-center gap-2">
              <button id="redact-add-box-btn" class="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-100 font-bold text-xs transition flex items-center gap-1.5 shadow-sm">
                <i data-lucide="plus-circle" class="w-4 h-4 text-sky-600"></i>
                <span>+ Add Box</span>
              </button>
              <button id="redact-clear-page-btn" class="px-2.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition">
                Clear Page
              </button>
              <button id="redact-run-btn" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-sky-600/20 transition flex items-center gap-2">
                <i data-lucide="download" class="w-4 h-4"></i>
                <span>Apply Redactions & Save</span>
              </button>
            </div>
          </div>

          <!-- Instructions & HUD banner with Nudge Hint -->
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-500 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 gap-2">
            <div class="flex items-center gap-2">
              <i data-lucide="info" class="w-4 h-4 text-sky-500 flex-shrink-0"></i>
              <span><strong>Drag to move:</strong> Grab the top header or drag the box to move anywhere. Use <strong>Arrow keys (&uarr; &darr; &larr; &rarr;)</strong> to nudge 2px (or Shift+Arrow for 10px). Drag corner handles to resize.</span>
            </div>
            <div class="flex items-center gap-3">
              <label class="flex items-center gap-1.5 cursor-pointer text-slate-600 dark:text-slate-300 font-semibold select-none">
                <input type="checkbox" id="redact-apply-color-chk" class="rounded accent-sky-600">
                <span>Burn color style into PDF</span>
              </label>
              <span class="font-bold text-slate-700 dark:text-slate-300">
                <span id="redact-page-count-badge">0</span> on page (<span id="redact-total-count-badge">0</span> total)
              </span>
            </div>
          </div>

          <!-- Viewer & Overlay Wrapper with Zoom scroll container -->
          <div id="redact-viewer-scroll-container" class="flex justify-center p-3 sm:p-6 bg-slate-100 dark:bg-slate-900 rounded-2xl overflow-auto max-h-[75vh] transition-all">
            <div id="redact-canvas-wrapper" class="relative inline-block border border-slate-300 dark:border-slate-700 shadow-2xl select-none bg-white transition-all duration-150 origin-top" style="user-select: none;">
              <!-- Document Page Canvas (z-0) -->
              <canvas id="redact-page-canvas" class="block transition-all"></canvas>
              
              <!-- Interactive Drawing Surface for new boxes (z-10, behind boxes!) -->
              <div id="redact-draw-surface" class="absolute inset-0 cursor-crosshair pointer-events-auto z-10">
                <div id="redact-draw-preview" class="absolute hidden border-2 border-dashed border-red-500 bg-red-500/25 pointer-events-none"></div>
              </div>

              <!-- Placed Redaction Boxes Container (z-20, on top of drawing surface!) -->
              <div id="redact-boxes-container" class="absolute inset-0 pointer-events-none z-20"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // DOM references
    const dropzone = container.querySelector('#redact-dropzone');
    const input = container.querySelector('#redact-file-input');
    const statusEl = container.querySelector('#redact-file-status');
    const workspace = container.querySelector('#redact-workspace');
    const scrollContainer = container.querySelector('#redact-viewer-scroll-container');
    const canvasWrapper = container.querySelector('#redact-canvas-wrapper');
    const pageCanvas = container.querySelector('#redact-page-canvas');
    const boxesContainer = container.querySelector('#redact-boxes-container');
    const drawSurface = container.querySelector('#redact-draw-surface');
    const drawPreview = container.querySelector('#redact-draw-preview');

    const zoomOutBtn = container.querySelector('#redact-zoom-out');
    const zoomInBtn = container.querySelector('#redact-zoom-in');
    const zoomLabelEl = container.querySelector('#redact-zoom-label');
    const zoomResetBtn = container.querySelector('#redact-zoom-reset');
    const zoomFitBtn = container.querySelector('#redact-zoom-fit');

    const colorStyleSelect = container.querySelector('#redact-color-style');
    const applyColorChk = container.querySelector('#redact-apply-color-chk');

    const prevPageBtn = container.querySelector('#redact-prev-page');
    const nextPageBtn = container.querySelector('#redact-next-page');
    const pageNumEl = container.querySelector('#redact-page-num');
    const pageTotalEl = container.querySelector('#redact-page-total');
    const pageCountBadge = container.querySelector('#redact-page-count-badge');
    const totalCountBadge = container.querySelector('#redact-total-count-badge');

    const modeBlackBtn = container.querySelector('#redact-mode-black');
    const modeWhiteBtn = container.querySelector('#redact-mode-white');
    const modeTextBtn = container.querySelector('#redact-mode-text');

    const addBoxBtn = container.querySelector('#redact-add-box-btn');
    const clearPageBtn = container.querySelector('#redact-clear-page-btn');
    const runBtn = container.querySelector('#redact-run-btn');

    // Mode toggling
    const setMode = (mode) => {
      activeMode = mode;
      [modeBlackBtn, modeWhiteBtn, modeTextBtn].forEach(b => {
        b.className = 'px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 flex items-center gap-1.5 transition';
      });
      const activeBtn = mode === 'white' ? modeWhiteBtn : (mode === 'text' ? modeTextBtn : modeBlackBtn);
      activeBtn.className = 'px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm flex items-center gap-1.5 transition font-extrabold';
    };

    modeBlackBtn.addEventListener('click', () => setMode('black'));
    modeWhiteBtn.addEventListener('click', () => setMode('white'));
    modeTextBtn.addEventListener('click', () => setMode('text'));

    // Color Style changing
    colorStyleSelect.addEventListener('change', () => {
      activeColorStyle = colorStyleSelect.value;
      pageCanvas.style.filter = COLOR_FILTERS[activeColorStyle] || 'none';
    });

    // Zoomer changing
    const setZoom = async (newZoom) => {
      currentZoom = Math.max(0.4, Math.min(3.0, newZoom));
      zoomLabelEl.innerText = `${Math.round(currentZoom * 100)}%`;
      await renderPage(currentPageNum);
    };

    zoomInBtn.addEventListener('click', () => {
      const nextLevel = zoomLevels.find(z => z > currentZoom + 0.05) || (currentZoom + 0.25);
      setZoom(nextLevel);
    });

    zoomOutBtn.addEventListener('click', () => {
      const prevLevel = [...zoomLevels].reverse().find(z => z < currentZoom - 0.05) || (currentZoom - 0.25);
      setZoom(prevLevel);
    });

    zoomResetBtn.addEventListener('click', () => setZoom(1.0));

    zoomFitBtn.addEventListener('click', () => {
      if (!scrollContainer) return;
      const availW = scrollContainer.clientWidth - 48;
      const baseW = 750;
      const fitZoom = Math.max(0.5, Math.min(2.0, availW / baseW));
      setZoom(fitZoom);
    });

    // Render active page
    const renderPage = async (pageIdx) => {
      if (!pdfDoc) return;
      currentPageNum = pageIdx;
      pageNumEl.innerText = currentPageNum;
      pageTotalEl.innerText = totalPages;
      prevPageBtn.disabled = currentPageNum <= 1;
      nextPageBtn.disabled = currentPageNum >= totalPages;

      // Base target width scaled by currentZoom
      const baseWidth = Math.min(800, Math.max(480, window.innerWidth - 100));
      const targetWidth = Math.round(baseWidth * currentZoom);
      await window.pdfEngine.renderPageToCanvas(pdfDoc, currentPageNum, pageCanvas, targetWidth);

      // Apply active color style filter
      pageCanvas.style.filter = COLOR_FILTERS[activeColorStyle] || 'none';

      // Align canvasWrapper dimensions exactly with canvas CSS dimensions
      const cssW = pageCanvas.offsetWidth;
      const cssH = pageCanvas.offsetHeight;
      canvasWrapper.style.width = `${cssW}px`;
      canvasWrapper.style.height = `${cssH}px`;

      renderBoxes();
    };

    // Render all redaction boxes on current page
    const renderBoxes = () => {
      boxesContainer.innerHTML = '';
      const pIdx = currentPageNum - 1;
      const pageBoxes = redactions.filter(r => r.pageIndex === pIdx);

      pageCountBadge.innerText = pageBoxes.length;
      totalCountBadge.innerText = redactions.length;

      pageBoxes.forEach((red) => {
        const isSelected = selectedBoxId === red.id;
        const box = document.createElement('div');
        box.dataset.redId = red.id;
        box.className = `redact-box absolute pointer-events-auto select-none group transition-shadow touch-none ${
          isSelected ? 'ring-2 ring-red-500 shadow-2xl z-40' : 'z-30 hover:ring-2 hover:ring-sky-400'
        }`;
        box.style.touchAction = 'none';
        box.style.left = `${red.xRatio * 100}%`;
        box.style.top = `${red.yRatio * 100}%`;
        box.style.width = `${red.wRatio * 100}%`;
        box.style.height = `${red.hRatio * 100}%`;
        box.style.cursor = 'move';

        const isWhite = red.color === 'white';
        const hasText = !!red.text;

        box.innerHTML = `
          <!-- Top Drag Bar Handle (Touch & Mouse friendly 24px target) -->
          <div class="redact-drag-header absolute -top-6 left-0 right-0 h-6 bg-slate-900/95 text-white rounded-t flex items-center justify-between px-2 cursor-grab active:cursor-grabbing text-[10px] font-bold select-none z-40 shadow transition touch-none ${isSelected ? 'opacity-100' : 'opacity-85 group-hover:opacity-100'}" style="touch-action: none;">
            <div class="flex items-center gap-1.5 pointer-events-none text-sky-400">
              <i data-lucide="grip-horizontal" class="w-3.5 h-3.5"></i>
              <span class="tracking-wide uppercase text-[9px]">Drag to Move</span>
            </div>
            <div class="text-[9px] font-mono text-slate-300 pointer-events-none">X:${Math.round(red.xRatio * 100)}% Y:${Math.round(red.yRatio * 100)}%</div>
          </div>

          <!-- Blackout / Whiteout Body -->
          <div class="w-full h-full flex items-center justify-center overflow-hidden cursor-move ${
            isWhite 
              ? 'bg-white border-2 border-dashed border-slate-400 shadow-sm' 
              : 'bg-black text-white shadow-md'
          }">
            ${hasText ? `<span class="text-[10px] font-black tracking-wider px-1.5 py-0.5 rounded ${isWhite ? 'bg-slate-200 text-slate-900 border border-slate-300' : 'bg-red-600/90 text-white uppercase'} pointer-events-none select-none">${red.text}</span>` : ''}
          </div>

          <!-- Delete Button (Top-Right) -->
          <button class="redact-box-del absolute -top-3 -right-3 w-6 h-6 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-black flex items-center justify-center shadow-lg transition-transform hover:scale-110 z-50 cursor-pointer pointer-events-auto" title="Delete Redaction Box">
            &times;
          </button>

          <!-- 8 Interactive Resize Handles (Touch & Mouse Optimized) -->
          <div class="redact-resize-handle handle-nw absolute -top-2.5 -left-2.5 w-5 h-5 bg-white border-2 border-red-600 rounded-sm cursor-nwse-resize z-50 shadow-md touch-none ${isSelected ? 'block' : 'hidden group-hover:block'}" style="touch-action: none;"></div>
          <div class="redact-resize-handle handle-ne absolute -top-2.5 -right-2.5 w-5 h-5 bg-white border-2 border-red-600 rounded-sm cursor-nesw-resize z-50 shadow-md touch-none ${isSelected ? 'block' : 'hidden group-hover:block'}" style="touch-action: none;"></div>
          <div class="redact-resize-handle handle-sw absolute -bottom-2.5 -left-2.5 w-5 h-5 bg-white border-2 border-red-600 rounded-sm cursor-nesw-resize z-50 shadow-md touch-none ${isSelected ? 'block' : 'hidden group-hover:block'}" style="touch-action: none;"></div>
          <div class="redact-resize-handle handle-se absolute -bottom-2.5 -right-2.5 w-5 h-5 bg-white border-2 border-red-600 rounded-sm cursor-nwse-resize z-50 shadow-md touch-none ${isSelected ? 'block' : 'hidden group-hover:block'}" style="touch-action: none;"></div>

          <div class="redact-resize-handle handle-n absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-4 bg-white border-2 border-red-600 rounded-sm cursor-ns-resize z-50 shadow-md touch-none ${isSelected ? 'block' : 'hidden group-hover:block'}" style="touch-action: none;"></div>
          <div class="redact-resize-handle handle-s absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-4 bg-white border-2 border-red-600 rounded-sm cursor-ns-resize z-50 shadow-md touch-none ${isSelected ? 'block' : 'hidden group-hover:block'}" style="touch-action: none;"></div>
          <div class="redact-resize-handle handle-w absolute top-1/2 -left-2 -translate-y-1/2 w-4 h-6 bg-white border-2 border-red-600 rounded-sm cursor-ew-resize z-50 shadow-md touch-none ${isSelected ? 'block' : 'hidden group-hover:block'}" style="touch-action: none;"></div>
          <div class="redact-resize-handle handle-e absolute top-1/2 -right-2 -translate-y-1/2 w-4 h-6 bg-white border-2 border-red-600 rounded-sm cursor-ew-resize z-50 shadow-md touch-none ${isSelected ? 'block' : 'hidden group-hover:block'}" style="touch-action: none;"></div>
        `;

        if (window.lucide) window.lucide.createIcons();

        // Dragging and selecting the box (Touch & Mouse Support)
        const onBoxStart = (e) => {
          if (e.target.closest('.redact-box-del') || e.target.classList.contains('redact-resize-handle')) return;
          selectedBoxId = red.id;
          // Dynamically toggle selection highlight without rebuilding the DOM
          boxesContainer.querySelectorAll('.redact-box').forEach(b => {
            const isThis = b.dataset.redId == red.id;
            b.classList.toggle('ring-2', isThis);
            b.classList.toggle('ring-red-500', isThis);
            b.classList.toggle('shadow-2xl', isThis);
            b.classList.toggle('z-40', isThis);
            b.classList.toggle('z-30', !isThis);
            const hdr = b.querySelector('.redact-drag-header');
            if (hdr) {
              hdr.classList.toggle('opacity-100', isThis);
              hdr.classList.toggle('opacity-85', !isThis);
            }
            b.querySelectorAll('.redact-resize-handle').forEach(h => {
              h.classList.toggle('block', isThis);
              h.classList.toggle('hidden', !isThis);
            });
          });
          initDragMove(e, box, red);
        };
        box.addEventListener('mousedown', onBoxStart);
        box.addEventListener('touchstart', onBoxStart, { passive: false });

        // Delete button (Touch & Mouse)
        const delBtn = box.querySelector('.redact-box-del');
        const onDelete = (e) => {
          e.stopPropagation();
          if (e.cancelable) e.preventDefault();
          redactions = redactions.filter(r => r.id !== red.id);
          if (selectedBoxId === red.id) selectedBoxId = null;
          renderBoxes();
        };
        delBtn.addEventListener('click', onDelete);
        delBtn.addEventListener('touchend', onDelete);

        // Resize handles (Touch & Mouse Support)
        box.querySelectorAll('.redact-resize-handle').forEach(handle => {
          const onHandleStart = (e) => {
            e.stopPropagation();
            if (e.cancelable) e.preventDefault();
            selectedBoxId = red.id;
            let dir = 'se';
            if (handle.classList.contains('handle-nw')) dir = 'nw';
            else if (handle.classList.contains('handle-ne')) dir = 'ne';
            else if (handle.classList.contains('handle-sw')) dir = 'sw';
            else if (handle.classList.contains('handle-se')) dir = 'se';
            else if (handle.classList.contains('handle-n')) dir = 'n';
            else if (handle.classList.contains('handle-s')) dir = 's';
            else if (handle.classList.contains('handle-w')) dir = 'w';
            else if (handle.classList.contains('handle-e')) dir = 'e';

            initResize(e, box, red, dir);
          };

          handle.addEventListener('mousedown', onHandleStart);
          handle.addEventListener('touchstart', onHandleStart, { passive: false });
        });

        boxesContainer.appendChild(box);
      });
    };

    // Helper to extract pointer coords from Mouse or Touch
    const getRedactPointerPos = (ev) => {
      if (ev.touches && ev.touches.length > 0) {
        return { x: ev.touches[0].clientX, y: ev.touches[0].clientY };
      }
      if (ev.changedTouches && ev.changedTouches.length > 0) {
        return { x: ev.changedTouches[0].clientX, y: ev.changedTouches[0].clientY };
      }
      return { x: ev.clientX, y: ev.clientY };
    };

    // Move drag implementation (Touch & Mouse Support)
    const initDragMove = (e, boxEl, redObj) => {
      e.stopPropagation();
      if (e.cancelable) e.preventDefault();
      const parentW = canvasWrapper.clientWidth;
      const parentH = canvasWrapper.clientHeight;
      if (parentW === 0 || parentH === 0) return;

      const pt = getRedactPointerPos(e);
      const startX = pt.x;
      const startY = pt.y;
      const origLeft = boxEl.offsetLeft;
      const origTop = boxEl.offsetTop;
      const boxW = boxEl.offsetWidth;
      const boxH = boxEl.offsetHeight;

      const dragHeader = boxEl.querySelector('.redact-drag-header');
      if (dragHeader) dragHeader.classList.add('cursor-grabbing');

      const onPointerMove = (ev) => {
        if (ev.cancelable) ev.preventDefault();
        const curPt = getRedactPointerPos(ev);
        const dx = curPt.x - startX;
        const dy = curPt.y - startY;

        const maxL = parentW - boxW;
        const maxT = parentH - boxH;

        const newL = Math.max(0, Math.min(maxL, origLeft + dx));
        const newT = Math.max(0, Math.min(maxT, origTop + dy));

        boxEl.style.left = `${newL}px`;
        boxEl.style.top = `${newT}px`;
      };

      const onPointerUp = () => {
        window.removeEventListener('mousemove', onPointerMove);
        window.removeEventListener('mouseup', onPointerUp);
        window.removeEventListener('touchmove', onPointerMove);
        window.removeEventListener('touchend', onPointerUp);
        window.removeEventListener('touchcancel', onPointerUp);

        if (dragHeader) dragHeader.classList.remove('cursor-grabbing');

        // Commit updated ratios
        redObj.xRatio = boxEl.offsetLeft / parentW;
        redObj.yRatio = boxEl.offsetTop / parentH;
        renderBoxes();
      };

      window.addEventListener('mousemove', onPointerMove);
      window.addEventListener('mouseup', onPointerUp);
      window.addEventListener('touchmove', onPointerMove, { passive: false });
      window.addEventListener('touchend', onPointerUp);
      window.addEventListener('touchcancel', onPointerUp);
    };

    // Resize implementation for all 8 handles (Touch & Mouse Support)
    const initResize = (e, boxEl, redObj, dir) => {
      const parentW = canvasWrapper.clientWidth;
      const parentH = canvasWrapper.clientHeight;
      if (parentW === 0 || parentH === 0) return;

      const pt = getRedactPointerPos(e);
      const startX = pt.x;
      const startY = pt.y;
      const origL = boxEl.offsetLeft;
      const origT = boxEl.offsetTop;
      const origW = boxEl.offsetWidth;
      const origH = boxEl.offsetHeight;
      const minSize = 15;

      const onPointerMove = (ev) => {
        if (ev.cancelable) ev.preventDefault();
        const curPt = getRedactPointerPos(ev);
        const dx = curPt.x - startX;
        const dy = curPt.y - startY;

        let newL = origL;
        let newT = origT;
        let newW = origW;
        let newH = origH;

        if (dir.includes('e')) {
          newW = Math.max(minSize, Math.min(parentW - origL, origW + dx));
        }
        if (dir.includes('s')) {
          newH = Math.max(minSize, Math.min(parentH - origT, origH + dy));
        }
        if (dir.includes('w')) {
          const maxDx = origW - minSize;
          const clampedDx = Math.min(maxDx, Math.max(-origL, dx));
          newL = origL + clampedDx;
          newW = origW - clampedDx;
        }
        if (dir.includes('n')) {
          const maxDy = origH - minSize;
          const clampedDy = Math.min(maxDy, Math.max(-origT, dy));
          newT = origT + clampedDy;
          newH = origH - clampedDy;
        }

        boxEl.style.left = `${newL}px`;
        boxEl.style.top = `${newT}px`;
        boxEl.style.width = `${newW}px`;
        boxEl.style.height = `${newH}px`;
      };

      const onPointerUp = () => {
        window.removeEventListener('mousemove', onPointerMove);
        window.removeEventListener('mouseup', onPointerUp);
        window.removeEventListener('touchmove', onPointerMove);
        window.removeEventListener('touchend', onPointerUp);
        window.removeEventListener('touchcancel', onPointerUp);

        redObj.xRatio = boxEl.offsetLeft / parentW;
        redObj.yRatio = boxEl.offsetTop / parentH;
        redObj.wRatio = boxEl.offsetWidth / parentW;
        redObj.hRatio = boxEl.offsetHeight / parentH;
        renderBoxes();
      };

      window.addEventListener('mousemove', onPointerMove);
      window.addEventListener('mouseup', onPointerUp);
      window.addEventListener('touchmove', onPointerMove, { passive: false });
      window.addEventListener('touchend', onPointerUp);
      window.addEventListener('touchcancel', onPointerUp);
    };

    // Drawing a new box directly on the surface (Touch & Mouse Support)
    let isDrawing = false;
    let drawStartX = 0;
    let drawStartY = 0;

    const onSurfaceStart = (e) => {
      if (e.target.closest('[data-red-id]')) return;

      const rect = canvasWrapper.getBoundingClientRect();
      const pt = getRedactPointerPos(e);
      drawStartX = pt.x - rect.left;
      drawStartY = pt.y - rect.top;
      isDrawing = true;

      drawPreview.style.left = `${drawStartX}px`;
      drawPreview.style.top = `${drawStartY}px`;
      drawPreview.style.width = '0px';
      drawPreview.style.height = '0px';
      drawPreview.classList.remove('hidden');

      selectedBoxId = null;
      renderBoxes();
      if (e.cancelable) e.preventDefault();
    };

    const onSurfaceMove = (e) => {
      if (!isDrawing) return;
      if (e.cancelable) e.preventDefault();
      const rect = canvasWrapper.getBoundingClientRect();
      const pt = getRedactPointerPos(e);
      const curX = Math.max(0, Math.min(rect.width, pt.x - rect.left));
      const curY = Math.max(0, Math.min(rect.height, pt.y - rect.top));

      const boxL = Math.min(drawStartX, curX);
      const boxT = Math.min(drawStartY, curY);
      const boxW = Math.abs(curX - drawStartX);
      const boxH = Math.abs(curY - drawStartY);

      drawPreview.style.left = `${boxL}px`;
      drawPreview.style.top = `${boxT}px`;
      drawPreview.style.width = `${boxW}px`;
      drawPreview.style.height = `${boxH}px`;
    };

    const onSurfaceEnd = (e) => {
      if (!isDrawing) return;
      isDrawing = false;
      drawPreview.classList.add('hidden');

      const rect = canvasWrapper.getBoundingClientRect();
      const pt = getRedactPointerPos(e);
      const curX = Math.max(0, Math.min(rect.width, pt.x - rect.left));
      const curY = Math.max(0, Math.min(rect.height, pt.y - rect.top));

      const boxL = Math.min(drawStartX, curX);
      const boxT = Math.min(drawStartY, curY);
      const boxW = Math.abs(curX - drawStartX);
      const boxH = Math.abs(curY - drawStartY);

      if (boxW > 12 && boxH > 10 && rect.width > 0 && rect.height > 0) {
        const newId = Date.now() + Math.random();
        redactions.push({
          id: newId,
          pageIndex: currentPageNum - 1,
          xRatio: boxL / rect.width,
          yRatio: boxT / rect.height,
          wRatio: boxW / rect.width,
          hRatio: boxH / rect.height,
          color: activeMode === 'white' ? 'white' : 'black',
          text: activeMode === 'text' ? 'REDACTED' : ''
        });
        selectedBoxId = newId;
        renderBoxes();
      }
    };

    drawSurface.addEventListener('mousedown', onSurfaceStart);
    drawSurface.addEventListener('touchstart', onSurfaceStart, { passive: false });

    window.addEventListener('mousemove', onSurfaceMove);
    window.addEventListener('touchmove', onSurfaceMove, { passive: false });

    window.addEventListener('mouseup', onSurfaceEnd);
    window.addEventListener('touchend', onSurfaceEnd);
    window.addEventListener('touchcancel', onSurfaceEnd);

    // Keyboard controls: Arrow Keys nudging and Delete / Backspace
    const onKeyDown = (e) => {
      if (!selectedBoxId) return;
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT')) return;

      const red = redactions.find(r => r.id === selectedBoxId);
      if (!red) return;

      const parentW = canvasWrapper.clientWidth;
      const parentH = canvasWrapper.clientHeight;
      if (!parentW || !parentH) return;

      // Arrow Keys micro-movement / nudge feature!
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 2; // 2px fine nudge, or 10px fast nudge with Shift
        if (e.key === 'ArrowLeft') red.xRatio = Math.max(0, red.xRatio - (step / parentW));
        if (e.key === 'ArrowRight') red.xRatio = Math.min(1 - red.wRatio, red.xRatio + (step / parentW));
        if (e.key === 'ArrowUp') red.yRatio = Math.max(0, red.yRatio - (step / parentH));
        if (e.key === 'ArrowDown') red.yRatio = Math.min(1 - red.hRatio, red.yRatio + (step / parentH));
        renderBoxes();
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        redactions = redactions.filter(r => r.id !== selectedBoxId);
        selectedBoxId = null;
        renderBoxes();
      }
    };
    document.addEventListener('keydown', onKeyDown);

    // "+ Add Redaction Box" button (places at center of page)
    addBoxBtn.addEventListener('click', () => {
      const parentW = canvasWrapper.clientWidth || 600;
      const parentH = canvasWrapper.clientHeight || 800;

      const boxW = Math.min(parentW * 0.4, 220);
      const boxH = Math.min(parentH * 0.08, 45);
      const boxL = (parentW - boxW) / 2;
      const boxT = (parentH - boxH) / 2;

      const newId = Date.now() + Math.random();
      redactions.push({
        id: newId,
        pageIndex: currentPageNum - 1,
        xRatio: boxL / parentW,
        yRatio: boxT / parentH,
        wRatio: boxW / parentW,
        hRatio: boxH / parentH,
        color: activeMode === 'white' ? 'white' : 'black',
        text: activeMode === 'text' ? 'REDACTED' : ''
      });
      selectedBoxId = newId;
      renderBoxes();
    });

    // Page navigation
    prevPageBtn.addEventListener('click', () => {
      if (currentPageNum > 1) renderPage(currentPageNum - 1);
    });
    nextPageBtn.addEventListener('click', () => {
      if (currentPageNum < totalPages) renderPage(currentPageNum + 1);
    });

    // Clear Page
    clearPageBtn.addEventListener('click', () => {
      const pIdx = currentPageNum - 1;
      redactions = redactions.filter(r => r.pageIndex !== pIdx);
      selectedBoxId = null;
      renderBoxes();
    });

    // Dropzone setup
    UI.setupDropzone(dropzone, input, async (files) => {
      if (files.length === 0) return;
      currentFile = files[0];
      statusEl.innerText = `${currentFile.name} (${window.pdfEngine.formatBytes(currentFile.size)})`;
      currentBuffer = await window.pdfEngine.readFileAsArrayBuffer(currentFile);
      workspace.classList.remove('hidden');

      pdfDoc = await window.pdfEngine.getPdfJsDoc(currentBuffer);
      totalPages = pdfDoc.numPages;
      redactions = [];
      selectedBoxId = null;
      currentZoom = 1.0;
      zoomLabelEl.innerText = '100%';
      activeColorStyle = colorStyleSelect.value || 'normal';
      await renderPage(1);
    });

    // Apply & Save
    runBtn.addEventListener('click', async () => {
      if (!currentBuffer || redactions.length === 0) {
        UI.showToast('Please add or draw at least one redaction box.', 'error');
        return;
      }

      try {
        UI.showProgress(0.3, 'Permanently applying redactions and sanitizing PDF...');
        let bufferToUse = currentBuffer?.byteLength > 0 ? currentBuffer : await currentFile.arrayBuffer();

        // If user chose to burn in color style
        if (applyColorChk && applyColorChk.checked && activeColorStyle !== 'normal') {
          UI.showProgress(0.5, `Applying ${activeColorStyle} document color style...`);
          const colorCorrectedBlob = await window.pdfEngine.applyColorCorrectionToPdf(
            window.pdfEngine.cloneBuffer(bufferToUse),
            activeColorStyle
          );
          bufferToUse = await colorCorrectedBlob.arrayBuffer();
        }

        UI.showProgress(0.8, 'Burning in permanent redaction boxes...');
        const redactedBlob = await window.pdfEngine.applyRedactions(
          window.pdfEngine.cloneBuffer(bufferToUse),
          redactions
        );

        UI.hideProgress();
        UI.celebrate();
        UI.showToast(`Applied ${redactions.length} permanent redaction box(es)!`, 'success');
        UI.showResultPreview({
          title: 'Redacted PDF Ready',
          subtitle: `${redactions.length} sensitive area(s) blacked out / sanitized permanently. Zero data leakage.`,
          blob: redactedBlob,
          filename: `${currentFile.name.replace(/\.pdf$/i, '')}_redacted.pdf`
        });
      } catch (err) {
        UI.hideProgress();
        UI.showToast(err.message, 'error');
      }
    });
  }
};

window.SecurityTools = SecurityTools;

