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

  // 4. REDACT PDF (Blackout sensitive information with interactive drag & resize)
  renderRedact(container) {
    let currentBuffer = null;
    let currentFile = null;
    let pdfDoc = null;
    let currentPageNum = 1;
    let totalPages = 1;
    let redactions = []; // [{ id, pageIndex, xRatio, yRatio, wRatio, hRatio, color, text }]
    let selectedBoxId = null;
    let activeMode = 'black'; // 'black' | 'white' | 'text'

    container.innerHTML = `
      <div class="max-w-5xl mx-auto space-y-6">
        <div class="text-center space-y-2">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
            <i data-lucide="shield-alert" class="w-3.5 h-3.5"></i>
            <span>Interactive Visual Redaction</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Redact PDF (Blackout & Sanitization)</h2>
          <p class="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">Permanently blackout confidential data, SSNs, medical records, or whiteout unwanted text. Fully client-side with adjustable, draggable, and resizable redaction boxes.</p>
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
          <!-- Control Toolbar -->
          <div class="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-700">
            <!-- Mode Selector -->
            <div class="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl text-xs font-bold">
              <button id="redact-mode-black" class="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm flex items-center gap-1.5 transition">
                <span class="w-2.5 h-2.5 rounded-full bg-black"></span>
                <span>Solid Blackout</span>
              </button>
              <button id="redact-mode-white" class="px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 flex items-center gap-1.5 transition">
                <span class="w-2.5 h-2.5 rounded-full bg-white border border-slate-400"></span>
                <span>Whiteout</span>
              </button>
              <button id="redact-mode-text" class="px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 flex items-center gap-1.5 transition">
                <span class="w-2.5 h-2.5 rounded-full bg-red-600"></span>
                <span>REDACTED Stamp</span>
              </button>
            </div>

            <!-- Page Navigation -->
            <div class="flex items-center gap-2 text-xs font-bold bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-xl">
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

            <!-- Box Action Buttons -->
            <div class="flex items-center gap-2">
              <button id="redact-add-box-btn" class="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-100 font-bold text-xs transition flex items-center gap-1.5 shadow-sm">
                <i data-lucide="plus-circle" class="w-4 h-4 text-sky-600"></i>
                <span>+ Add Redaction Box</span>
              </button>
              <button id="redact-clear-page-btn" class="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition">
                Clear Page
              </button>
              <button id="redact-run-btn" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-sky-600/20 transition flex items-center gap-2">
                <i data-lucide="download" class="w-4 h-4"></i>
                <span>Apply Redactions & Save</span>
              </button>
            </div>
          </div>

          <!-- Instructions & HUD banner -->
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-500 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 gap-2">
            <div class="flex items-center gap-2">
              <i data-lucide="info" class="w-4 h-4 text-sky-500 flex-shrink-0"></i>
              <span><strong>Click & drag</strong> on the document to draw a redaction box, or click <strong>+ Add Redaction Box</strong>. Drag center to move, drag any corner handle to resize. Press <strong>Delete / Backspace</strong> or click <strong>&times;</strong> to remove.</span>
            </div>
            <div class="whitespace-nowrap font-bold text-slate-700 dark:text-slate-300">
              <span id="redact-page-count-badge">0</span> box(es) on this page (<span id="redact-total-count-badge">0</span> total)
            </div>
          </div>

          <!-- Viewer & Overlay Wrapper -->
          <div class="flex justify-center p-3 sm:p-6 bg-slate-100 dark:bg-slate-900 rounded-2xl overflow-auto max-h-[75vh]">
            <div id="redact-canvas-wrapper" class="relative inline-block border border-slate-300 dark:border-slate-700 shadow-2xl select-none bg-white" style="user-select: none;">
              <!-- Document Page Canvas -->
              <canvas id="redact-page-canvas" class="block"></canvas>
              
              <!-- Placed Redaction Boxes Container -->
              <div id="redact-boxes-container" class="absolute inset-0 pointer-events-none"></div>

              <!-- Interactive Drawing Surface for new boxes -->
              <div id="redact-draw-surface" class="absolute inset-0 cursor-crosshair pointer-events-auto">
                <div id="redact-draw-preview" class="absolute hidden border-2 border-dashed border-red-500 bg-red-500/25 pointer-events-none"></div>
              </div>
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
    const canvasWrapper = container.querySelector('#redact-canvas-wrapper');
    const pageCanvas = container.querySelector('#redact-page-canvas');
    const boxesContainer = container.querySelector('#redact-boxes-container');
    const drawSurface = container.querySelector('#redact-draw-surface');
    const drawPreview = container.querySelector('#redact-draw-preview');

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

    // Render active page
    const renderPage = async (pageIdx) => {
      if (!pdfDoc) return;
      currentPageNum = pageIdx;
      pageNumEl.innerText = currentPageNum;
      pageTotalEl.innerText = totalPages;
      prevPageBtn.disabled = currentPageNum <= 1;
      nextPageBtn.disabled = currentPageNum >= totalPages;

      // Render PDF page to canvas with optimal target width (750px max on desktop, fits mobile)
      const targetWidth = Math.min(800, Math.max(480, window.innerWidth - 80));
      await window.pdfEngine.renderPageToCanvas(pdfDoc, currentPageNum, pageCanvas, targetWidth);

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
        box.className = `absolute pointer-events-auto select-none group transition-shadow ${
          isSelected ? 'ring-2 ring-red-500 shadow-2xl z-30' : 'z-20 hover:ring-1 hover:ring-sky-400'
        }`;
        box.style.left = `${red.xRatio * 100}%`;
        box.style.top = `${red.yRatio * 100}%`;
        box.style.width = `${red.wRatio * 100}%`;
        box.style.height = `${red.hRatio * 100}%`;
        box.style.cursor = 'move';

        const isWhite = red.color === 'white';
        const hasText = !!red.text;

        box.innerHTML = `
          <!-- Blackout / Whiteout Body -->
          <div class="w-full h-full flex items-center justify-center overflow-hidden ${
            isWhite 
              ? 'bg-white border-2 border-dashed border-slate-400 shadow-sm' 
              : 'bg-black text-white shadow-md'
          }">
            ${hasText ? `<span class="text-[10px] font-black tracking-wider px-1.5 py-0.5 rounded ${isWhite ? 'bg-slate-200 text-slate-900 border border-slate-300' : 'bg-red-600/90 text-white uppercase'} pointer-events-none select-none">${red.text}</span>` : ''}
          </div>

          <!-- Delete Button (Top-Right) -->
          <button class="redact-box-del absolute -top-3 -right-3 w-6 h-6 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-black flex items-center justify-center shadow-lg transition-transform hover:scale-110 z-40 cursor-pointer pointer-events-auto" title="Delete Redaction Box">
            &times;
          </button>

          <!-- 8 Interactive Resize Handles (Visible when selected or hovered) -->
          <div class="redact-resize-handle handle-nw absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-red-600 rounded-sm cursor-nwse-resize z-40 shadow ${isSelected ? 'block' : 'hidden group-hover:block'}"></div>
          <div class="redact-resize-handle handle-ne absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-red-600 rounded-sm cursor-nesw-resize z-40 shadow ${isSelected ? 'block' : 'hidden group-hover:block'}"></div>
          <div class="redact-resize-handle handle-sw absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-red-600 rounded-sm cursor-nesw-resize z-40 shadow ${isSelected ? 'block' : 'hidden group-hover:block'}"></div>
          <div class="redact-resize-handle handle-se absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-red-600 rounded-sm cursor-nwse-resize z-40 shadow ${isSelected ? 'block' : 'hidden group-hover:block'}"></div>

          <div class="redact-resize-handle handle-n absolute -top-1.5 left-1/2 -translate-x-1/2 w-4 h-2.5 bg-white border-2 border-red-600 rounded-sm cursor-ns-resize z-40 shadow ${isSelected ? 'block' : 'hidden group-hover:block'}"></div>
          <div class="redact-resize-handle handle-s absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-2.5 bg-white border-2 border-red-600 rounded-sm cursor-ns-resize z-40 shadow ${isSelected ? 'block' : 'hidden group-hover:block'}"></div>
          <div class="redact-resize-handle handle-w absolute top-1/2 -left-1.5 -translate-y-1/2 w-2.5 h-4 bg-white border-2 border-red-600 rounded-sm cursor-ew-resize z-40 shadow ${isSelected ? 'block' : 'hidden group-hover:block'}"></div>
          <div class="redact-resize-handle handle-e absolute top-1/2 -right-1.5 -translate-y-1/2 w-2.5 h-4 bg-white border-2 border-red-600 rounded-sm cursor-ew-resize z-40 shadow ${isSelected ? 'block' : 'hidden group-hover:block'}"></div>
        `;

        // Click to select
        box.addEventListener('mousedown', (e) => {
          if (e.target.closest('.redact-box-del') || e.target.classList.contains('redact-resize-handle')) return;
          selectedBoxId = red.id;
          renderBoxes();
          initDragMove(e, box, red);
        });

        // Delete button
        box.querySelector('.redact-box-del').addEventListener('click', (e) => {
          e.stopPropagation();
          redactions = redactions.filter(r => r.id !== red.id);
          if (selectedBoxId === red.id) selectedBoxId = null;
          renderBoxes();
        });

        // Resize handles
        box.querySelectorAll('.redact-resize-handle').forEach(handle => {
          handle.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            e.preventDefault();
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
          });
        });

        boxesContainer.appendChild(box);
      });
    };

    // Move drag implementation
    const initDragMove = (e, boxEl, redObj) => {
      e.stopPropagation();
      e.preventDefault();
      const parentW = canvasWrapper.clientWidth;
      const parentH = canvasWrapper.clientHeight;
      if (parentW === 0 || parentH === 0) return;

      const startX = e.clientX;
      const startY = e.clientY;
      const origLeft = boxEl.offsetLeft;
      const origTop = boxEl.offsetTop;
      const boxW = boxEl.offsetWidth;
      const boxH = boxEl.offsetHeight;

      const onMouseMove = (ev) => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;

        const maxL = parentW - boxW;
        const maxT = parentH - boxH;

        const newL = Math.max(0, Math.min(maxL, origLeft + dx));
        const newT = Math.max(0, Math.min(maxT, origTop + dy));

        boxEl.style.left = `${newL}px`;
        boxEl.style.top = `${newT}px`;
      };

      const onMouseUp = (ev) => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);

        // Commit updated ratios
        redObj.xRatio = boxEl.offsetLeft / parentW;
        redObj.yRatio = boxEl.offsetTop / parentH;
        renderBoxes();
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    };

    // Resize implementation for all 8 handles
    const initResize = (e, boxEl, redObj, dir) => {
      const parentW = canvasWrapper.clientWidth;
      const parentH = canvasWrapper.clientHeight;
      if (parentW === 0 || parentH === 0) return;

      const startX = e.clientX;
      const startY = e.clientY;
      const origL = boxEl.offsetLeft;
      const origT = boxEl.offsetTop;
      const origW = boxEl.offsetWidth;
      const origH = boxEl.offsetHeight;
      const minSize = 15;

      const onMouseMove = (ev) => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;

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

      const onMouseUp = () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);

        redObj.xRatio = boxEl.offsetLeft / parentW;
        redObj.yRatio = boxEl.offsetTop / parentH;
        redObj.wRatio = boxEl.offsetWidth / parentW;
        redObj.hRatio = boxEl.offsetHeight / parentH;
        renderBoxes();
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    };

    // Drawing a new box directly on the surface
    let isDrawing = false;
    let drawStartX = 0;
    let drawStartY = 0;

    drawSurface.addEventListener('mousedown', (e) => {
      // If clicked on an existing box, ignore draw
      if (e.target.closest('[data-red-id]')) return;

      const rect = canvasWrapper.getBoundingClientRect();
      drawStartX = e.clientX - rect.left;
      drawStartY = e.clientY - rect.top;
      isDrawing = true;

      drawPreview.style.left = `${drawStartX}px`;
      drawPreview.style.top = `${drawStartY}px`;
      drawPreview.style.width = '0px';
      drawPreview.style.height = '0px';
      drawPreview.classList.remove('hidden');

      selectedBoxId = null;
      renderBoxes();
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDrawing) return;
      const rect = canvasWrapper.getBoundingClientRect();
      const curX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
      const curY = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

      const boxL = Math.min(drawStartX, curX);
      const boxT = Math.min(drawStartY, curY);
      const boxW = Math.abs(curX - drawStartX);
      const boxH = Math.abs(curY - drawStartY);

      drawPreview.style.left = `${boxL}px`;
      drawPreview.style.top = `${boxT}px`;
      drawPreview.style.width = `${boxW}px`;
      drawPreview.style.height = `${boxH}px`;
    });

    window.addEventListener('mouseup', (e) => {
      if (!isDrawing) return;
      isDrawing = false;
      drawPreview.classList.add('hidden');

      const rect = canvasWrapper.getBoundingClientRect();
      const curX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
      const curY = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

      const boxL = Math.min(drawStartX, curX);
      const boxT = Math.min(drawStartY, curY);
      const boxW = Math.abs(curX - drawStartX);
      const boxH = Math.abs(curY - drawStartY);

      // Only create if box has meaningful size (> 12px)
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
    });

    // Delete selected box on keydown
    const onKeyDown = (e) => {
      if (!selectedBoxId) return;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const activeEl = document.activeElement;
        if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) return;
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
        const bufferToUse = currentBuffer?.byteLength > 0 ? currentBuffer : await currentFile.arrayBuffer();

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

