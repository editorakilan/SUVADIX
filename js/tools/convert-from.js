/**
 * SUVADIX - Convert From PDF Tools
 * Unified Image Hub (PNG, JPG, 16-bit TIFF, 16-bit DPX, 16-bit OpenEXR, JPEG 2000, WebP)
 * Unified Office Hub (Word .docx, Excel .xlsx/.csv, PowerPoint .pptx, HTML, Text)
 */

const ConvertFromTools = {

  // =========================================================================
  // 1. UNIFIED FLAGSHIP HUB: PDF TO IMAGE (ALL-IN-ONE IMAGE CONVERTER)
  // =========================================================================
  renderPdfToImageHub(container, defaultFormat = 'png') {
    let currentBuffer = null;
    let currentFile = null;
    let pdfDoc = null;
    let totalPages = 1;
    let selectedFormat = defaultFormat || 'png';
    let generatedImages = [];

    const IMAGE_FORMATS = {
      png: { id: 'png', label: 'PNG', mime: 'image/png', ext: 'png', desc: 'Lossless 24-bit transparent & crisp', icon: 'image', badge: 'Crisp' },
      jpeg: { id: 'jpeg', label: 'JPG / JPEG', mime: 'image/jpeg', ext: 'jpg', desc: 'Standard web photo, compact size', icon: 'image', badge: 'Standard' },
      tiff16: { id: 'tiff16', label: '16-bit TIFF', mime: 'image/tiff', ext: 'tif', desc: 'Archival & prepress 16-bit depth', icon: 'film', badge: '16-Bit' },
      exr16: { id: 'exr16', label: '16-bit OpenEXR', mime: 'image/x-exr', ext: 'exr', desc: '16-bit half-float HDR VFX lossless', icon: 'sparkles', badge: 'HDR VFX' },
      dpx16: { id: 'dpx16', label: '16-bit DPX', mime: 'image/x-dpx', ext: 'dpx', desc: 'SMPTE 268M cinema digital picture', icon: 'clapperboard', badge: 'Cinema' },
      jp2: { id: 'jp2', label: 'JPEG 2000', mime: 'image/jp2', ext: 'jp2', desc: 'Wavelet compressed ISO 15444', icon: 'layers', badge: 'JP2' },
      webp: { id: 'webp', label: 'WebP', mime: 'image/webp', ext: 'webp', desc: 'Modern high-efficiency web image', icon: 'zap', badge: 'Fast Web' }
    };

    container.innerHTML = `
      <div class="max-w-5xl mx-auto space-y-6">
        <!-- Header -->
        <div class="text-center space-y-2">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-xs">
            <i data-lucide="image-down" class="w-3.5 h-3.5 text-indigo-600"></i>
            <span>ALL-IN-ONE IMAGE CONVERTER HUB</span>
          </div>
          <h2 class="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-slate-100">PDF to IMAGE</h2>
          <p class="text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto">
            Extract PDF pages into PNG, JPG, 16-bit TIFF, 16-bit OpenEXR, 16-bit DPX, JPEG 2000, or WebP. Choose resolution, page ranges, and download individual pages or a single ZIP.
          </p>
        </div>

        <!-- Dropzone -->
        <div id="hub-img-dropzone" class="dropzone p-8 sm:p-10 rounded-3xl text-center cursor-pointer hover:border-indigo-500 transition border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
          <input type="file" id="hub-img-file-input" accept="application/pdf" class="hidden">
          <div class="flex flex-col items-center gap-3">
            <div class="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center shadow-inner">
              <i data-lucide="image-down" class="w-8 h-8"></i>
            </div>
            <div>
              <p class="font-extrabold text-base text-slate-800 dark:text-slate-100">Upload PDF to convert to Images</p>
              <p class="text-xs text-slate-400 mt-1" id="hub-img-file-status">Drag & drop or click to choose document</p>
            </div>
          </div>
        </div>

        <!-- Hub Workspace -->
        <div id="hub-img-workspace" class="space-y-6 hidden">
          
          <!-- Format Selector Grid -->
          <div class="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
            <span class="text-xs font-black text-slate-500 uppercase tracking-wider block">Choose Output Image Format:</span>
            <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5" id="hub-img-formats-grid">
              ${Object.values(IMAGE_FORMATS).map(fmt => `
                <button data-format="${fmt.id}" class="hub-fmt-card p-3 rounded-2xl border ${fmt.id === selectedFormat ? 'border-2 border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 bg-white dark:bg-slate-800'} text-left transition flex flex-col justify-between gap-1 shadow-xs group">
                  <div class="flex items-center justify-between">
                    <span class="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 group-hover:bg-indigo-100 group-hover:text-indigo-700 transition">${fmt.badge}</span>
                    <i data-lucide="${fmt.icon}" class="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition"></i>
                  </div>
                  <div>
                    <span class="font-black text-xs text-slate-900 dark:text-slate-100 block">${fmt.label}</span>
                    <span class="text-[10px] text-slate-400 leading-tight block truncate">${fmt.desc}</span>
                  </div>
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Conversion Controls Bar -->
          <div class="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <!-- Resolution / DPI Selector -->
              <div class="space-y-1.5">
                <label class="font-bold text-slate-700 dark:text-slate-300 block">Render Resolution / DPI:</label>
                <select id="hub-img-dpi" class="w-full bg-slate-50 dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold outline-none">
                  <option value="2.0">150-200 DPI (High Definition HD - Recommended)</option>
                  <option value="3.0">300 DPI (Print Grade Ultra-Sharp)</option>
                  <option value="4.0">600 DPI (Ultra Archival Master)</option>
                  <option value="1.0">72 DPI (Standard Web Screen)</option>
                  <option value="1.5">110 DPI (Balanced Compact)</option>
                </select>
              </div>

              <!-- Quality Slider (for JPG / WebP) -->
              <div id="hub-img-quality-wrap" class="space-y-1.5">
                <div class="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                  <span>Compression Quality:</span>
                  <span id="hub-img-quality-val" class="font-mono text-indigo-600">92%</span>
                </div>
                <input type="range" id="hub-img-quality" min="10" max="100" value="92" class="w-full accent-indigo-600">
              </div>

              <!-- Page Range Selector -->
              <div class="space-y-1.5">
                <label class="font-bold text-slate-700 dark:text-slate-300 block">Pages to Convert:</label>
                <div class="flex items-center gap-2">
                  <select id="hub-img-pages-mode" class="bg-slate-50 dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold outline-none">
                    <option value="all">All Pages</option>
                    <option value="range">Range</option>
                  </select>
                  <input type="text" id="hub-img-pages-range" placeholder="e.g. 1-3, 5" class="w-full bg-slate-50 dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold outline-none hidden">
                </div>
              </div>
            </div>

            <!-- Primary Action Buttons -->
            <div class="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-700">
              <div class="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <i data-lucide="shield-check" class="w-4 h-4 text-emerald-500"></i>
                <span id="hub-img-summary-text">Ready to extract images</span>
              </div>
              <div class="flex items-center gap-2">
                <button id="hub-img-run-btn" class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-600/20 transition flex items-center gap-2">
                  <i data-lucide="refresh-cw" class="w-4 h-4"></i>
                  <span id="hub-img-run-label">Convert to PNG</span>
                </button>
                <button id="hub-img-zip-btn" class="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs transition flex items-center gap-2 hidden shadow-md">
                  <i data-lucide="archive" class="w-4 h-4"></i>
                  <span>Download All as ZIP</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Converted Images Grid -->
          <div id="hub-img-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"></div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // DOM Elements
    const dropzone = container.querySelector('#hub-img-dropzone');
    const input = container.querySelector('#hub-img-file-input');
    const statusEl = container.querySelector('#hub-img-file-status');
    const workspace = container.querySelector('#hub-img-workspace');
    const dpiSelect = container.querySelector('#hub-img-dpi');
    const qualityInput = container.querySelector('#hub-img-quality');
    const qualityVal = container.querySelector('#hub-img-quality-val');
    const qualityWrap = container.querySelector('#hub-img-quality-wrap');
    const pagesMode = container.querySelector('#hub-img-pages-mode');
    const pagesRange = container.querySelector('#hub-img-pages-range');
    const runBtn = container.querySelector('#hub-img-run-btn');
    const runLabel = container.querySelector('#hub-img-run-label');
    const zipBtn = container.querySelector('#hub-img-zip-btn');
    const grid = container.querySelector('#hub-img-grid');
    const summaryText = container.querySelector('#hub-img-summary-text');

    const updateFormatUI = (fmtId) => {
      selectedFormat = fmtId;
      const fmt = IMAGE_FORMATS[fmtId];
      if (!fmt) return;

      container.querySelectorAll('.hub-fmt-card').forEach(card => {
        const isMatch = card.dataset.format === fmtId;
        card.className = `hub-fmt-card p-3 rounded-2xl border ${isMatch ? 'border-2 border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 bg-white dark:bg-slate-800'} text-left transition flex flex-col justify-between gap-1 shadow-xs group`;
      });

      runLabel.innerText = `Convert to ${fmt.label}`;
      qualityWrap.classList.toggle('hidden', fmtId !== 'jpeg' && fmtId !== 'webp');
    };

    container.querySelectorAll('.hub-fmt-card').forEach(card => {
      card.addEventListener('click', () => {
        updateFormatUI(card.dataset.format);
      });
    });

    qualityInput.addEventListener('input', (e) => {
      qualityVal.innerText = `${e.target.value}%`;
    });

    pagesMode.addEventListener('change', () => {
      pagesRange.classList.toggle('hidden', pagesMode.value !== 'range');
    });

    updateFormatUI(selectedFormat);

    UI.setupDropzone(dropzone, input, async (files) => {
      if (files.length === 0) return;
      currentFile = files[0];
      statusEl.innerText = `${currentFile.name} (${window.pdfEngine.formatBytes(currentFile.size)})`;
      currentBuffer = await window.pdfEngine.readFileAsArrayBuffer(currentFile);
      workspace.classList.remove('hidden');
      grid.innerHTML = '';
      zipBtn.classList.add('hidden');

      try {
        pdfDoc = await window.pdfEngine.getPdfJsDoc(window.pdfEngine.cloneBuffer(currentBuffer));
        totalPages = pdfDoc.numPages;
        summaryText.innerText = `${currentFile.name} has ${totalPages} page(s). Ready to export.`;
      } catch (err) {
        summaryText.innerText = `Error loading PDF: ${err.message}`;
      }
    });

    runBtn.addEventListener('click', async () => {
      if (!currentBuffer && !currentFile) return;
      const fmt = IMAGE_FORMATS[selectedFormat] || IMAGE_FORMATS.png;
      const scale = parseFloat(dpiSelect.value) || 2.0;
      const quality = parseInt(qualityInput.value, 10) / 100;

      try {
        UI.showProgress(0.05, `Converting PDF to ${fmt.label}...`);
        const bufferToUse = currentBuffer?.byteLength > 0 ? currentBuffer : await currentFile.arrayBuffer();

        let allImages = await window.pdfEngine.pdfToImages(
          window.pdfEngine.cloneBuffer(bufferToUse),
          fmt.mime,
          scale,
          (pct, status) => UI.showProgress(pct, status),
          quality
        );

        // Filter page range if requested
        if (pagesMode.value === 'range' && pagesRange.value.trim()) {
          const allowedPages = window.pdfEngine.parsePageRanges(pagesRange.value.trim(), totalPages);
          allImages = allImages.filter(img => allowedPages.includes(img.pageNum));
        }

        generatedImages = allImages;

        grid.innerHTML = generatedImages.map((img, idx) => `
          <div class="bg-white dark:bg-slate-800 rounded-2xl p-3 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col items-center gap-2 group hover:shadow-md transition">
            <div class="w-full aspect-[3/4] overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center border border-slate-100 dark:border-slate-800 relative">
              <img src="${img.dataUrl}" alt="Page ${img.pageNum}" class="max-w-full max-h-full object-contain">
              <span class="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/80 text-white text-[10px] font-bold">P. ${img.pageNum}</span>
            </div>
            <div class="w-full flex items-center justify-between text-xs pt-1">
              <span class="font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px]">${fmt.label}</span>
              <button class="hub-single-dl px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 font-extrabold hover:bg-indigo-100 transition flex items-center gap-1" data-idx="${idx}">
                <i data-lucide="download" class="w-3 h-3"></i>
                <span>Save</span>
              </button>
            </div>
          </div>
        `).join('');

        if (window.lucide) window.lucide.createIcons();

        grid.querySelectorAll('.hub-single-dl').forEach(btn => {
          btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.idx, 10);
            window.pdfEngine.downloadBlob(generatedImages[idx].blob, generatedImages[idx].name);
          });
        });

        zipBtn.classList.remove('hidden');
        UI.hideProgress();
        UI.celebrate();
        UI.showToast(`Successfully extracted ${generatedImages.length} ${fmt.label} image(s)!`, 'success');
      } catch (err) {
        UI.hideProgress();
        UI.showToast(`Error: ${err.message}`, 'error');
      }
    });

    zipBtn.addEventListener('click', async () => {
      if (generatedImages.length === 0) return;
      const fmt = IMAGE_FORMATS[selectedFormat] || IMAGE_FORMATS.png;
      try {
        UI.showProgress(0.2, `Archiving ${generatedImages.length} images into ZIP...`);
        const zipBlob = await window.pdfEngine.createZip(generatedImages, (pct, status) => {
          UI.showProgress(pct, status);
        });
        UI.hideProgress();
        UI.celebrate();
        UI.showToast('Images packaged into ZIP archive!', 'success');
        UI.showResultPreview({
          title: 'ZIP Archive Ready',
          subtitle: `${generatedImages.length} ${fmt.label} image(s) packaged into ZIP archive`,
          blob: zipBlob,
          filename: `${currentFile.name.replace(/\.pdf$/i, '')}_${fmt.ext}_images.zip`
        });
      } catch (err) {
        UI.hideProgress();
        UI.showToast(`Error creating ZIP: ${err.message}`, 'error');
      }
    });
  },

  // =========================================================================
  // 2. UNIFIED FLAGSHIP HUB: PDF TO OFFICE (WORD, EXCEL, PPT, HTML, TEXT)
  // =========================================================================
  renderPdfToOfficeHub(container, defaultFormat = 'word') {
    let currentBuffer = null;
    let currentFile = null;
    let selectedFormat = defaultFormat || 'word';

    const OFFICE_FORMATS = {
      word: {
        id: 'word',
        label: 'Microsoft Word (.docx)',
        short: 'Word',
        ext: 'docx',
        icon: 'file-text',
        color: 'blue',
        badge: 'Editable DOCX',
        desc: 'Converts PDF text & headings into editable Microsoft Word (.docx) paragraphs.'
      },
      excel: {
        id: 'excel',
        label: 'Excel Spreadsheet (.csv / .xlsx)',
        short: 'Excel',
        ext: 'csv',
        icon: 'sheet',
        color: 'emerald',
        badge: 'Data Tables',
        desc: 'Extracts data tables, rows, numbers, and financial statements into spreadsheet.'
      },
      ppt: {
        id: 'ppt',
        label: 'PowerPoint Presentation (.pptx)',
        short: 'PowerPoint',
        ext: 'pptx',
        icon: 'presentation',
        color: 'orange',
        badge: 'Slide Deck',
        desc: 'Transforms each PDF page into a presentation slide in PowerPoint.'
      },
      html: {
        id: 'html',
        label: 'HTML Webpage (.html)',
        short: 'HTML',
        ext: 'html',
        icon: 'code-2',
        color: 'teal',
        badge: 'Web Page',
        desc: 'Generates responsive, cleanly formatted HTML markup from document content.'
      },
      text: {
        id: 'text',
        label: 'Plain Text (.txt)',
        short: 'Text',
        ext: 'txt',
        icon: 'file-text',
        color: 'indigo',
        badge: 'Raw Text',
        desc: 'Extracts clean textual streams from all pages with zero layout noise.'
      }
    };

    container.innerHTML = `
      <div class="max-w-4xl mx-auto space-y-6">
        <!-- Header -->
        <div class="text-center space-y-2">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-xs">
            <i data-lucide="layers" class="w-3.5 h-3.5 text-blue-600"></i>
            <span>ALL-IN-ONE OFFICE EXPORT HUB</span>
          </div>
          <h2 class="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-slate-100">PDF to OFFICE</h2>
          <p class="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            Convert PDF documents into editable Word (.docx), Excel spreadsheets (.csv), PowerPoint presentations (.pptx), HTML, or clean text.
          </p>
        </div>

        <!-- Dropzone -->
        <div id="hub-off-dropzone" class="dropzone p-8 sm:p-10 rounded-3xl text-center cursor-pointer hover:border-blue-500 transition border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
          <input type="file" id="hub-off-file-input" accept="application/pdf" class="hidden">
          <div class="flex flex-col items-center gap-3">
            <div class="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center shadow-inner">
              <i data-lucide="file-output" class="w-8 h-8"></i>
            </div>
            <div>
              <p class="font-extrabold text-base text-slate-800 dark:text-slate-100">Upload PDF to convert to Office</p>
              <p class="text-xs text-slate-400 mt-1" id="hub-off-file-status">Drag & drop or click to choose document</p>
            </div>
          </div>
        </div>

        <!-- Workspace -->
        <div id="hub-off-workspace" class="space-y-6 hidden">
          <!-- Office Format Cards -->
          <div class="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
            <span class="text-xs font-black text-slate-500 uppercase tracking-wider block">Choose Office Target Format:</span>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" id="hub-off-formats-grid">
              ${Object.values(OFFICE_FORMATS).map(fmt => `
                <button data-format="${fmt.id}" class="hub-off-card p-4 rounded-2xl border ${fmt.id === selectedFormat ? 'border-2 border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 ring-1 ring-blue-500' : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 bg-white dark:bg-slate-800'} text-left transition flex items-start gap-3 shadow-xs group">
                  <div class="w-10 h-10 rounded-xl bg-${fmt.color}-50 dark:bg-${fmt.color}-950/40 text-${fmt.color}-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <i data-lucide="${fmt.icon}" class="w-5 h-5"></i>
                  </div>
                  <div class="space-y-0.5">
                    <div class="flex items-center gap-2">
                      <span class="font-black text-xs text-slate-900 dark:text-slate-100">${fmt.label}</span>
                    </div>
                    <p class="text-[11px] text-slate-500 leading-tight">${fmt.desc}</p>
                  </div>
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Document Action Card -->
          <div class="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-200" id="hub-off-icon-box">
                <i data-lucide="file-text" class="w-6 h-6"></i>
              </div>
              <div>
                <h3 class="font-extrabold text-sm text-slate-900 dark:text-slate-100" id="hub-off-filename">document.pdf</h3>
                <p class="text-xs text-slate-400" id="hub-off-filesize">0 KB</p>
              </div>
            </div>

            <button id="hub-off-run-btn" class="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]">
              <i data-lucide="download" class="w-4 h-4"></i>
              <span id="hub-off-run-label">Convert to Microsoft Word</span>
            </button>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const dropzone = container.querySelector('#hub-off-dropzone');
    const input = container.querySelector('#hub-off-file-input');
    const statusEl = container.querySelector('#hub-off-file-status');
    const workspace = container.querySelector('#hub-off-workspace');
    const filenameEl = container.querySelector('#hub-off-filename');
    const filesizeEl = container.querySelector('#hub-off-filesize');
    const runBtn = container.querySelector('#hub-off-run-btn');
    const runLabel = container.querySelector('#hub-off-run-label');
    const iconBox = container.querySelector('#hub-off-icon-box');

    const updateOfficeUI = (fmtId) => {
      selectedFormat = fmtId;
      const fmt = OFFICE_FORMATS[fmtId];
      if (!fmt) return;

      container.querySelectorAll('.hub-off-card').forEach(card => {
        const isMatch = card.dataset.format === fmtId;
        card.className = `hub-off-card p-4 rounded-2xl border ${isMatch ? 'border-2 border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 ring-1 ring-blue-500' : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 bg-white dark:bg-slate-800'} text-left transition flex items-start gap-3 shadow-xs group`;
      });

      runLabel.innerText = `Convert & Download ${fmt.short}`;
      iconBox.className = `w-12 h-12 rounded-2xl bg-${fmt.color}-50 dark:bg-${fmt.color}-950/40 text-${fmt.color}-600 flex items-center justify-center flex-shrink-0`;
      iconBox.innerHTML = `<i data-lucide="${fmt.icon}" class="w-6 h-6"></i>`;
      if (window.lucide) window.lucide.createIcons();
    };

    container.querySelectorAll('.hub-off-card').forEach(card => {
      card.addEventListener('click', () => {
        updateOfficeUI(card.dataset.format);
      });
    });

    updateOfficeUI(selectedFormat);

    UI.setupDropzone(dropzone, input, async (files) => {
      if (files.length === 0) return;
      currentFile = files[0];
      statusEl.innerText = `${currentFile.name} (${window.pdfEngine.formatBytes(currentFile.size)})`;
      filenameEl.innerText = currentFile.name;
      filesizeEl.innerText = window.pdfEngine.formatBytes(currentFile.size);
      currentBuffer = await window.pdfEngine.readFileAsArrayBuffer(currentFile);
      workspace.classList.remove('hidden');
    });

    runBtn.addEventListener('click', async () => {
      if (!currentBuffer && !currentFile) return;
      const fmt = OFFICE_FORMATS[selectedFormat] || OFFICE_FORMATS.word;

      try {
        UI.showProgress(0.15, `Converting PDF to ${fmt.label}...`);
        const bufferToUse = currentBuffer?.byteLength > 0 ? currentBuffer : await currentFile.arrayBuffer();
        let res;

        if (selectedFormat === 'word') {
          res = await window.PDFEngine['pdf-to-word']([currentFile], {}, (p, s) => UI.showProgress(p, s));
        } else if (selectedFormat === 'excel') {
          res = await window.PDFEngine['pdf-to-excel']([currentFile], {}, (p, s) => UI.showProgress(p, s));
        } else if (selectedFormat === 'ppt') {
          res = await window.PDFEngine['pdf-to-ppt']([currentFile], {}, (p, s) => UI.showProgress(p, s));
        } else if (selectedFormat === 'html') {
          const text = await window.pdfEngine.extractText(window.pdfEngine.cloneBuffer(bufferToUse));
          const htmlContent = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${currentFile.name}</title><style>body{font-family:system-ui,-apple-system,sans-serif;max-width:850px;margin:40px auto;padding:24px;line-height:1.6;color:#1e293b;}h1{border-bottom:2px solid #e2e8f0;padding-bottom:12px;}</style></head><body><h1>${currentFile.name}</h1><pre style="white-space:pre-wrap;font-family:inherit;">${text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</pre></body></html>`;
          const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
          res = { files: [{ name: `${currentFile.name.replace(/\.pdf$/i, '')}.html`, blob }] };
        } else if (selectedFormat === 'text') {
          const text = await window.pdfEngine.extractText(window.pdfEngine.cloneBuffer(bufferToUse));
          const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
          res = { files: [{ name: `${currentFile.name.replace(/\.pdf$/i, '')}.txt`, blob }] };
        }

        UI.hideProgress();
        UI.celebrate();
        UI.showToast(`Converted to ${fmt.label} successfully!`, 'success');

        if (res && res.files && res.files.length) {
          const dlFile = res.files[0];
          window.pdfEngine.downloadBlob(dlFile.blob, dlFile.name);
          UI.showResultPreview({
            title: `${fmt.label} Ready`,
            subtitle: `Converted privately on your device. Downloaded: ${dlFile.name}`,
            blob: dlFile.blob,
            filename: dlFile.name
          });
        }
      } catch (err) {
        UI.hideProgress();
        UI.showToast(`Error: ${err.message}`, 'error');
      }
    });
  },

  // =========================================================================
  // BACKWARD-COMPATIBLE WRAPPERS (Route directly into the Hubs)
  // =========================================================================
  renderPdfToJpg(container) { this.renderPdfToImageHub(container, 'jpeg'); },
  renderPdfToPng(container) { this.renderPdfToImageHub(container, 'png'); },
  renderPdfToTiff16(container) { this.renderPdfToImageHub(container, 'tiff16'); },
  renderPdfToDpx16(container) { this.renderPdfToImageHub(container, 'dpx16'); },
  renderPdfToExr16(container) { this.renderPdfToImageHub(container, 'exr16'); },
  renderPdfToJp2(container) { this.renderPdfToImageHub(container, 'jp2'); },

  renderPdfToWord(container) { this.renderPdfToOfficeHub(container, 'word'); },
  renderPdfToExcel(container) { this.renderPdfToOfficeHub(container, 'excel'); },
  renderPdfToPpt(container) { this.renderPdfToOfficeHub(container, 'ppt'); },
  renderPdfToHtml(container) { this.renderPdfToOfficeHub(container, 'html'); },
  renderPdfToText(container) { this.renderPdfToOfficeHub(container, 'text'); }
};

window.ConvertFromTools = ConvertFromTools;
