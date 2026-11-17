/**
 * SUVADIX - Convert From PDF Tools
 * PDF to JPG, PDF to PNG, PDF to Text
 */

const ConvertFromTools = {
  // 1. PDF TO JPG
  renderPdfToJpg(container) {
    this._renderImageConverter(container, 'image/jpeg', 'JPG', 'indigo');
  },

  // 2. PDF TO PNG
  renderPdfToPng(container) {
    this._renderImageConverter(container, 'image/png', 'PNG', 'cyan');
  },

  _renderImageConverter(container, mimeType, formatLabel, colorScheme) {
    let currentBuffer = null;
    let currentFile = null;
    let generatedImages = [];

    container.innerHTML = `
      <div class="max-w-4xl mx-auto space-y-6">
        <div class="text-center space-y-2">
          <h2 class="text-2xl font-bold tracking-tight">Convert PDF to ${formatLabel}</h2>
          <p class="text-sm text-slate-500">Extract high-resolution ${formatLabel} image files from each page of your PDF.</p>
        </div>

        <div id="img-conv-dropzone" class="dropzone p-8 rounded-2xl text-center cursor-pointer hover:border-${colorScheme}-500 transition">
          <input type="file" id="img-conv-file-input" accept="application/pdf" class="hidden">
          <div class="flex flex-col items-center gap-3">
            <div class="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center">
              <i data-lucide="image-down" class="w-8 h-8"></i>
            </div>
            <div>
              <p class="font-semibold text-slate-700 dark:text-slate-200">Upload PDF to convert to ${formatLabel}</p>
              <p class="text-xs text-slate-400 mt-1" id="img-conv-file-status">Drag & drop or click to browse</p>
            </div>
          </div>
        </div>

        <div id="img-conv-workspace" class="space-y-4 hidden">
          <div class="flex flex-wrap items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 gap-3">
            <div class="flex items-center gap-3">
              <label class="text-xs font-semibold text-slate-500">Render Quality:</label>
              <select id="img-conv-quality" class="text-xs font-medium bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 outline-none">
                <option value="2.0">Standard High (150-200 DPI)</option>
                <option value="3.0">Ultra High (300 DPI)</option>
                <option value="1.0">Medium Web (72 DPI)</option>
              </select>
            </div>
            <div class="flex items-center gap-2">
              <button id="img-conv-run-btn" class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition flex items-center gap-2">
                <i data-lucide="refresh-cw" class="w-4 h-4"></i>
                <span>Convert to ${formatLabel}</span>
              </button>
              <button id="img-conv-zip-btn" class="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm transition flex items-center gap-2 hidden">
                <i data-lucide="archive" class="w-4 h-4"></i>
                <span>Download All (ZIP)</span>
              </button>
            </div>
          </div>

          <div id="img-conv-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"></div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const dropzone = container.querySelector('#img-conv-dropzone');
    const input = container.querySelector('#img-conv-file-input');
    const statusEl = container.querySelector('#img-conv-file-status');
    const workspace = container.querySelector('#img-conv-workspace');
    const qualitySelect = container.querySelector('#img-conv-quality');
    const runBtn = container.querySelector('#img-conv-run-btn');
    const zipBtn = container.querySelector('#img-conv-zip-btn');
    const grid = container.querySelector('#img-conv-grid');

    UI.setupDropzone(dropzone, input, async (files) => {
      if (files.length === 0) return;
      currentFile = files[0];
      statusEl.innerText = `${currentFile.name} (${window.pdfEngine.formatBytes(currentFile.size)})`;
      currentBuffer = await window.pdfEngine.readFileAsArrayBuffer(currentFile);
      workspace.classList.remove('hidden');
      grid.innerHTML = '';
      zipBtn.classList.add('hidden');
    });

    runBtn.addEventListener('click', async () => {
      if (!currentBuffer && !currentFile) return;
      const scale = parseFloat(qualitySelect.value);

      try {
        UI.showProgress(0.1, `Converting PDF to ${formatLabel}...`);
        const bufferToUse = currentBuffer?.byteLength > 0 ? currentBuffer : await currentFile.arrayBuffer();
        generatedImages = await window.pdfEngine.pdfToImages(window.pdfEngine.cloneBuffer(bufferToUse), mimeType, scale, (pct, status) => {
          UI.showProgress(pct, status);
        });

        grid.innerHTML = generatedImages.map((img, idx) => `
          <div class="bg-white dark:bg-slate-800 rounded-xl p-3 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col items-center">
            <div class="w-full aspect-[3/4] overflow-hidden rounded bg-slate-50 dark:bg-slate-900 flex items-center justify-center border border-slate-100 dark:border-slate-800">
              <img src="${img.dataUrl}" class="max-w-full max-h-full object-contain">
            </div>
            <div class="w-full flex items-center justify-between mt-3 text-xs">
              <span class="font-medium text-slate-500">Page ${img.pageNum}</span>
              <button class="single-dl px-2.5 py-1 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 font-semibold hover:bg-indigo-100 transition" data-idx="${idx}">Download</button>
            </div>
          </div>
        `).join('');

        grid.querySelectorAll('.single-dl').forEach(btn => {
          btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.idx, 10);
            window.pdfEngine.downloadBlob(generatedImages[idx].blob, generatedImages[idx].name);
          });
        });

        zipBtn.classList.remove('hidden');
        UI.hideProgress();
        UI.celebrate();
        UI.showToast(`Converted ${generatedImages.length} page(s) successfully!`, 'success');
      } catch (err) {
        UI.hideProgress();
        UI.showToast(`Error: ${err.message}`, 'error');
      }
    });

    zipBtn.addEventListener('click', async () => {
      if (generatedImages.length === 0) return;
      try {
        UI.showProgress(0.2, 'Compressing images into ZIP...');
        const zipBlob = await window.pdfEngine.createZip(generatedImages, (pct, status) => {
          UI.showProgress(pct, status);
        });
        UI.hideProgress();
        UI.celebrate();
        UI.showToast('Images packaged into ZIP!', 'success');
        UI.showResultPreview({
          title: 'ZIP Archive Ready',
          subtitle: `${generatedImages.length} extracted images archived into ZIP`,
          blob: zipBlob,
          filename: `${currentFile.name.replace(/\.pdf$/i, '')}_images.zip`
        });
      } catch (err) {
        UI.hideProgress();
        UI.showToast(err.message, 'error');
      }
    });
  },

  // 3. PDF TO TEXT
  renderPdfToText(container) {
    let currentBuffer = null;
    let currentFile = null;

    container.innerHTML = `
      <div class="max-w-3xl mx-auto space-y-6">
        <div class="text-center space-y-2">
          <h2 class="text-2xl font-bold tracking-tight">Extract Text from PDF</h2>
          <p class="text-sm text-slate-500">Instantly extract clean, formatted plain text from all pages of your PDF document.</p>
        </div>

        <div id="txt-dropzone" class="dropzone p-8 rounded-2xl text-center cursor-pointer hover:border-indigo-500 transition">
          <input type="file" id="txt-file-input" accept="application/pdf" class="hidden">
          <div class="flex flex-col items-center gap-3">
            <div class="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center">
              <i data-lucide="file-text" class="w-8 h-8"></i>
            </div>
            <div>
              <p class="font-semibold text-slate-700 dark:text-slate-200">Upload PDF to extract text</p>
              <p class="text-xs text-slate-400 mt-1" id="txt-file-status">Drag & drop or click</p>
            </div>
          </div>
        </div>

        <div id="txt-workspace" class="space-y-4 hidden">
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-sm">Extracted Content</h3>
            <div class="flex items-center gap-2">
              <button id="txt-copy-btn" class="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition">Copy</button>
              <button id="txt-download-btn" class="px-4 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition">Download .TXT</button>
            </div>
          </div>
          <textarea id="txt-output" rows="14" readonly class="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs leading-relaxed focus:outline-none"></textarea>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const dropzone = container.querySelector('#txt-dropzone');
    const input = container.querySelector('#txt-file-input');
    const statusEl = container.querySelector('#txt-file-status');
    const workspace = container.querySelector('#txt-workspace');
    const output = container.querySelector('#txt-output');
    const copyBtn = container.querySelector('#txt-copy-btn');
    const downloadBtn = container.querySelector('#txt-download-btn');

    UI.setupDropzone(dropzone, input, async (files) => {
      if (files.length === 0) return;
      currentFile = files[0];
      statusEl.innerText = `${currentFile.name} (${window.pdfEngine.formatBytes(currentFile.size)})`;
      currentBuffer = await window.pdfEngine.readFileAsArrayBuffer(currentFile);

      try {
        UI.showProgress(0.2, 'Extracting text streams...');
        const bufferToUse = currentBuffer?.byteLength > 0 ? currentBuffer : await currentFile.arrayBuffer();
        const text = await window.pdfEngine.extractText(window.pdfEngine.cloneBuffer(bufferToUse), (pct, status) => {
          UI.showProgress(pct, status);
        });
        output.value = text;
        workspace.classList.remove('hidden');
        UI.hideProgress();
        UI.showToast('Text extracted!', 'success');
      } catch (err) {
        UI.hideProgress();
        UI.showToast(`Error: ${err.message}`, 'error');
      }
    });

    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(output.value);
      UI.showToast('Copied to clipboard!', 'info');
    });

    downloadBtn.addEventListener('click', () => {
      const blob = new Blob([output.value], { type: 'text/plain;charset=utf-8' });
      window.pdfEngine.downloadBlob(blob, `${currentFile.name.replace(/\.pdf$/i, '')}_extracted.txt`);
    });
  }
};

window.ConvertFromTools = ConvertFromTools;

