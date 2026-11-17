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
        UI.showResultPreview({
          title: 'Redacted PDF Ready',
          subtitle: `${redactions.length} blacked-out area(s) burned in permanently. Inspect before saving`,
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

