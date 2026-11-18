/**
 * SUVADIX - Convert To PDF Tools
 * JPG/PNG to PDF, Word (.docx) to PDF, HTML to PDF, Markdown to PDF
 */

const ConvertToTools = {
  // 1. JPG/PNG TO PDF
  renderJpgToPdf(container) {
    let imageFiles = [];

    container.innerHTML = `
      <div class="max-w-3xl mx-auto space-y-6">
        <div class="text-center space-y-2">
          <h2 class="text-2xl font-bold tracking-tight">Convert JPG/PNG to PDF</h2>
          <p class="text-sm text-slate-500">Transform multiple images into a beautifully formatted PDF document.</p>
        </div>

        <div id="jpg-dropzone" class="dropzone p-8 rounded-2xl text-center cursor-pointer hover:border-amber-500 transition">
          <input type="file" id="jpg-file-input" multiple accept="image/jpeg,image/png,image/webp" class="hidden">
          <div class="flex flex-col items-center gap-3">
            <div class="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
              <i data-lucide="image" class="w-8 h-8"></i>
            </div>
            <div>
              <p class="font-semibold text-slate-700 dark:text-slate-200">Upload JPG, PNG, or WebP images</p>
              <p class="text-xs text-slate-400 mt-1">Select one or more images</p>
            </div>
          </div>
        </div>

        <div id="jpg-options" class="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-5 hidden">
          <!-- Output Type Selection -->
          <div class="space-y-2">
            <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Conversion Output Type</label>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label class="flex flex-col p-3 rounded-xl border border-amber-400 bg-amber-50/70 cursor-pointer transition hover:bg-amber-50 shadow-sm" id="jpg-mode-img-card">
                <div class="flex items-center gap-2">
                  <input type="radio" name="jpg-mode" value="image" checked class="text-amber-600">
                  <span class="text-xs font-bold text-slate-800">Standard Image PDF</span>
                </div>
                <p class="text-[11px] text-slate-500 mt-1 pl-5">Preserves exact photos, graphics & scans as high-res images.</p>
              </label>

              <label class="flex flex-col p-3 rounded-xl border border-slate-200 bg-white cursor-pointer transition hover:bg-slate-50" id="jpg-mode-ocr-card">
                <div class="flex items-center gap-2">
                  <input type="radio" name="jpg-mode" value="ocr" class="text-amber-600">
                  <span class="text-xs font-bold text-slate-800">Searchable OCR PDF</span>
                </div>
                <p class="text-[11px] text-slate-500 mt-1 pl-5">Embeds photo + invisible text layer. Search (Ctrl+F), select & copy text!</p>
              </label>

              <label class="flex flex-col p-3 rounded-xl border border-slate-200 bg-white cursor-pointer transition hover:bg-slate-50" id="jpg-mode-txt-card">
                <div class="flex items-center gap-2">
                  <input type="radio" name="jpg-mode" value="text" class="text-amber-600">
                  <span class="text-xs font-bold text-slate-800">Digital Text Type</span>
                </div>
                <p class="text-[11px] text-slate-500 mt-1 pl-5">Extracts OCR text into clean vector text, preserving clinic logos & photos at the top.</p>
              </label>
            </div>
          </div>

          <!-- Digital Text Logo & Photo Preservation Options -->
          <div id="jpg-text-options" class="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-3 hidden">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <input type="checkbox" id="jpg-include-logo" checked class="text-amber-600 rounded">
                <label for="jpg-include-logo" class="text-xs font-bold text-slate-800 cursor-pointer">Place Clinic / Company Logo & Photos at Top of Page</label>
              </div>
              <span class="text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">Logo + Digital Text</span>
            </div>
            <p class="text-[11px] text-slate-500">Crops the top hospital/clinic branding banner, logo, or photo from the image and places it at the top of the PDF, while formatting all bill and report details as clean, selectable digital text below.</p>
            <div class="flex items-center gap-3 text-xs pt-1">
              <span class="text-slate-600 font-medium">Header / Logo Banner Height:</span>
              <select id="jpg-logo-ratio" class="text-xs font-medium bg-white p-1.5 rounded-lg border border-slate-200 outline-none">
                <option value="0.20">Standard Logo Area (Top 20%)</option>
                <option value="0.14">Compact Logo (Top 14%)</option>
                <option value="0.28">Large Header & Photos (Top 28%)</option>
              </select>
            </div>
          </div>

          <h3 class="font-semibold text-sm pt-2 border-t border-slate-100 dark:border-slate-700">Page Formatting</h3>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-500 mb-1">Page Size</label>
              <select id="jpg-page-size" class="w-full text-xs font-medium bg-slate-100 dark:bg-slate-700 p-2.5 rounded-xl border border-slate-200 dark:border-slate-600 outline-none">
                <option value="A4">A4 (Standard)</option>
                <option value="Letter">US Letter</option>
                <option value="Fit">Fit Image Dimensions</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-500 mb-1">Orientation</label>
              <select id="jpg-orientation" class="w-full text-xs font-medium bg-slate-100 dark:bg-slate-700 p-2.5 rounded-xl border border-slate-200 dark:border-slate-600 outline-none">
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-500 mb-1">Margins</label>
              <select id="jpg-margin" class="w-full text-xs font-medium bg-slate-100 dark:bg-slate-700 p-2.5 rounded-xl border border-slate-200 dark:border-slate-600 outline-none">
                <option value="20">Small (20pt)</option>
                <option value="0">No Margin (Full Bleed)</option>
                <option value="40">Large (40pt)</option>
              </select>
            </div>
          </div>

          <div id="jpg-thumbs" class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2"></div>

          <div class="flex justify-end pt-2">
            <button id="jpg-run-btn" class="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm shadow-lg shadow-amber-600/20 transition flex items-center gap-2">
              <i data-lucide="file-check" class="w-4 h-4"></i>
              <span>Create PDF</span>
            </button>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const dropzone = container.querySelector('#jpg-dropzone');
    const input = container.querySelector('#jpg-file-input');
    const optionsEl = container.querySelector('#jpg-options');
    const thumbsEl = container.querySelector('#jpg-thumbs');
    const runBtn = container.querySelector('#jpg-run-btn');
    const pageSizeSelect = container.querySelector('#jpg-page-size');
    const orientSelect = container.querySelector('#jpg-orientation');
    const marginSelect = container.querySelector('#jpg-margin');

    // Radio card highlight toggles
    const modeCards = {
      image: container.querySelector('#jpg-mode-img-card'),
      ocr: container.querySelector('#jpg-mode-ocr-card'),
      text: container.querySelector('#jpg-mode-txt-card')
    };
    const textOptionsEl = container.querySelector('#jpg-text-options');
    const includeLogoCheckbox = container.querySelector('#jpg-include-logo');
    const logoRatioSelect = container.querySelector('#jpg-logo-ratio');

    container.querySelectorAll('input[name="jpg-mode"]').forEach(r => {
      r.addEventListener('change', () => {
        Object.keys(modeCards).forEach(k => {
          const isSelected = r.value === k;
          modeCards[k].className = isSelected
            ? 'flex flex-col p-3 rounded-xl border border-amber-400 bg-amber-50/70 cursor-pointer transition hover:bg-amber-50 shadow-sm'
            : 'flex flex-col p-3 rounded-xl border border-slate-200 bg-white cursor-pointer transition hover:bg-slate-50';
        });

        // Show logo/photo options when Digital Text mode is selected
        if (textOptionsEl) {
          textOptionsEl.classList.toggle('hidden', r.value !== 'text');
        }
      });
    });

    const updateThumbs = () => {
      if (imageFiles.length === 0) {
        optionsEl.classList.add('hidden');
        return;
      }
      optionsEl.classList.remove('hidden');
      thumbsEl.innerHTML = '';
      imageFiles.forEach((file, idx) => {
        const url = URL.createObjectURL(file);
        const card = document.createElement('div');
        card.className = 'relative group rounded-lg overflow-hidden border border-slate-200 shadow-sm aspect-square bg-slate-100 dark:bg-slate-900';
        card.innerHTML = `
          <img src="${url}" class="w-full h-full object-cover">
          <button class="img-del absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-80 hover:opacity-100 transition">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        `;
        card.querySelector('.img-del').addEventListener('click', () => {
          imageFiles.splice(idx, 1);
          updateThumbs();
        });
        thumbsEl.appendChild(card);
      });
    };

    UI.setupDropzone(dropzone, input, (files) => {
      const valid = files.filter(f => f.type.startsWith('image/'));
      if (valid.length > 0) {
        imageFiles = [...imageFiles, ...valid];
        updateThumbs();
      }
    });

    runBtn.addEventListener('click', async () => {
      if (imageFiles.length === 0) return;
      try {
        const mode = container.querySelector('input[name="jpg-mode"]:checked').value;
        const pageSize = pageSizeSelect.value;
        const orientation = orientSelect.value;
        const margin = parseInt(marginSelect.value, 10);

        let pdfBlob = null;
        let subtitle = '';

        if (mode === 'ocr') {
          UI.showProgress(0.1, 'Initializing Tesseract OCR engine for searchable PDF...');
          pdfBlob = await window.pdfEngine.imagesToSearchablePdf(imageFiles, { pageSize, orientation, margin }, (pct, msg) => {
            UI.showProgress(pct, msg);
          });
          subtitle = `${imageFiles.length} image(s) converted to Searchable OCR PDF (Ctrl+F & select text enabled)`;
        } else if (mode === 'text') {
          const includeLogo = includeLogoCheckbox ? includeLogoCheckbox.checked : true;
          const logoRatio = logoRatioSelect ? parseFloat(logoRatioSelect.value) : 0.20;

          UI.showProgress(0.1, 'Extracting OCR text & preserving logo graphics into formatted pages...');
          pdfBlob = await window.pdfEngine.imagesToTextPdf(imageFiles, { pageSize, orientation, margin, includeLogo, logoRatio }, (pct, msg) => {
            UI.showProgress(pct, msg);
          });
          subtitle = `${imageFiles.length} image(s) digitized into digital text document with logo header preserved`;
        } else {
          UI.showProgress(0.3, 'Converting images into standard high-res PDF pages...');
          pdfBlob = await window.pdfEngine.imagesToPDF(imageFiles, { pageSize, orientation, margin });
          subtitle = `${imageFiles.length} image(s) combined into high-resolution PDF`;
        }

        UI.hideProgress();
        UI.celebrate();
        UI.showToast('PDF created successfully!', 'success');
        UI.showResultPreview({
          title: mode === 'ocr' ? 'Searchable OCR PDF Ready' : (mode === 'text' ? 'Digital Text PDF Ready' : 'Converted PDF Ready'),
          subtitle,
          blob: pdfBlob,
          filename: `converted_images_${mode}.pdf`
        });
      } catch (err) {
        UI.hideProgress();
        UI.showToast(`Error: ${err.message}`, 'error');
      }
    });
  },

  // 2. PNG TO PDF
  renderPngToPdf(container) {
    this.renderJpgToPdf(container);
    const h2 = container.querySelector('h2');
    if (h2) h2.innerText = 'Convert PNG to PDF';
    const sub = container.querySelector('p.text-sm');
    if (sub) sub.innerText = 'Convert PNG image files into clean, professional PDF documents.';
  },

  // =========================================================================
  // 3. UNIFIED FLAGSHIP HUB: OFFICE TO PDF (WORD, EXCEL, PPT, HTML, TEXT)
  // =========================================================================
  renderOfficeToPdfHub(container, defaultType = 'all') {
    let currentFile = null;

    container.innerHTML = `
      <div class="max-w-4xl mx-auto space-y-6">
        <!-- Header -->
        <div class="text-center space-y-2">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-xs">
            <i data-lucide="file-plus-2" class="w-3.5 h-3.5 text-emerald-600"></i>
            <span>ALL-IN-ONE OFFICE IMPORTER HUB</span>
          </div>
          <h2 class="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-slate-100">OFFICE to PDF</h2>
          <p class="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            Convert any Microsoft Word (.docx, .doc), Excel (.xlsx, .csv), PowerPoint (.pptx, .ppt), HTML, or Text file into a clean, professional PDF document.
          </p>
        </div>

        <!-- Supported Formats Badges -->
        <div class="flex flex-wrap items-center justify-center gap-2 text-xs font-bold">
          <span class="px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1.5 shadow-xs"><i data-lucide="file-text" class="w-3.5 h-3.5"></i>Word (.docx)</span>
          <span class="px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 shadow-xs"><i data-lucide="sheet" class="w-3.5 h-3.5"></i>Excel (.xlsx, .csv)</span>
          <span class="px-3 py-1 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 flex items-center gap-1.5 shadow-xs"><i data-lucide="presentation" class="w-3.5 h-3.5"></i>PowerPoint (.pptx)</span>
          <span class="px-3 py-1 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 flex items-center gap-1.5 shadow-xs"><i data-lucide="code-2" class="w-3.5 h-3.5"></i>HTML (.html)</span>
          <span class="px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5 shadow-xs"><i data-lucide="file-type-2" class="w-3.5 h-3.5"></i>Text (.txt)</span>
        </div>

        <!-- Dropzone -->
        <div id="hub-to-dropzone" class="dropzone p-8 sm:p-10 rounded-3xl text-center cursor-pointer hover:border-emerald-500 transition border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
          <input type="file" id="hub-to-file-input" accept=".docx,.doc,.xlsx,.xls,.csv,.pptx,.ppt,.html,.htm,.txt,.rtf,.md" class="hidden">
          <div class="flex flex-col items-center gap-3">
            <div class="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shadow-inner">
              <i data-lucide="file-up" class="w-8 h-8"></i>
            </div>
            <div>
              <p class="font-extrabold text-base text-slate-800 dark:text-slate-100">Upload Word, Excel, PowerPoint, HTML, or Text</p>
              <p class="text-xs text-slate-400 mt-1" id="hub-to-file-status">Drag & drop or click to choose document</p>
            </div>
          </div>
        </div>

        <!-- Workspace -->
        <div id="hub-to-workspace" class="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-lg space-y-5 hidden">
          <!-- File Detected Info Card -->
          <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center font-bold" id="hub-to-badge-icon">
                <i data-lucide="file-text" class="w-6 h-6"></i>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="font-black text-sm text-slate-900 dark:text-slate-100" id="hub-to-filename">document.docx</h3>
                  <span id="hub-to-type-badge" class="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase">WORD</span>
                </div>
                <p class="text-xs text-slate-400" id="hub-to-filesize">0 KB</p>
              </div>
            </div>
          </div>

          <!-- Action Bar -->
          <div class="flex justify-end pt-2">
            <button id="hub-to-run-btn" class="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm shadow-xl shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]">
              <i data-lucide="file-check" class="w-4 h-4"></i>
              <span id="hub-to-run-label">Convert to PDF</span>
            </button>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const dropzone = container.querySelector('#hub-to-dropzone');
    const input = container.querySelector('#hub-to-file-input');
    const statusEl = container.querySelector('#hub-to-file-status');
    const workspace = container.querySelector('#hub-to-workspace');
    const filenameEl = container.querySelector('#hub-to-filename');
    const filesizeEl = container.querySelector('#hub-to-filesize');
    const typeBadge = container.querySelector('#hub-to-type-badge');
    const badgeIcon = container.querySelector('#hub-to-badge-icon');
    const runBtn = container.querySelector('#hub-to-run-btn');
    const runLabel = container.querySelector('#hub-to-run-label');

    let detectedEngine = 'word-to-pdf';

    const detectFileType = (file) => {
      const name = file.name.toLowerCase();
      if (name.endsWith('.docx') || name.endsWith('.doc')) {
        detectedEngine = 'word-to-pdf';
        typeBadge.className = 'px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700';
        typeBadge.innerText = 'WORD DOCUMENT';
        badgeIcon.className = 'w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center';
        badgeIcon.innerHTML = '<i data-lucide="file-text" class="w-6 h-6"></i>';
        runLabel.innerText = 'Convert Word to PDF';
      } else if (name.endsWith('.xlsx') || name.endsWith('.xls') || name.endsWith('.csv')) {
        detectedEngine = 'excel-to-pdf';
        typeBadge.className = 'px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700';
        typeBadge.innerText = 'EXCEL SPREADSHEET';
        badgeIcon.className = 'w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center';
        badgeIcon.innerHTML = '<i data-lucide="sheet" class="w-6 h-6"></i>';
        runLabel.innerText = 'Convert Excel to PDF';
      } else if (name.endsWith('.pptx') || name.endsWith('.ppt')) {
        detectedEngine = 'ppt-to-pdf';
        typeBadge.className = 'px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-orange-100 dark:bg-orange-900/60 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-700';
        typeBadge.innerText = 'POWERPOINT PRESENTATION';
        badgeIcon.className = 'w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 flex items-center justify-center';
        badgeIcon.innerHTML = '<i data-lucide="presentation" class="w-6 h-6"></i>';
        runLabel.innerText = 'Convert PowerPoint to PDF';
      } else if (name.endsWith('.html') || name.endsWith('.htm')) {
        detectedEngine = 'html-to-pdf';
        typeBadge.className = 'px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-700';
        typeBadge.innerText = 'HTML WEBPAGE';
        badgeIcon.className = 'w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 flex items-center justify-center';
        badgeIcon.innerHTML = '<i data-lucide="code-2" class="w-6 h-6"></i>';
        runLabel.innerText = 'Convert HTML to PDF';
      } else {
        detectedEngine = 'text-to-pdf';
        typeBadge.className = 'px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700';
        typeBadge.innerText = 'TEXT DOCUMENT';
        badgeIcon.className = 'w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center';
        badgeIcon.innerHTML = '<i data-lucide="file-type-2" class="w-6 h-6"></i>';
        runLabel.innerText = 'Convert Text to PDF';
      }
      if (window.lucide) window.lucide.createIcons();
    };

    UI.setupDropzone(dropzone, input, async (files) => {
      if (files.length === 0) return;
      currentFile = files[0];
      statusEl.innerText = `${currentFile.name} (${window.pdfEngine.formatBytes(currentFile.size)})`;
      filenameEl.innerText = currentFile.name;
      filesizeEl.innerText = window.pdfEngine.formatBytes(currentFile.size);
      detectFileType(currentFile);
      workspace.classList.remove('hidden');
    });

    runBtn.addEventListener('click', async () => {
      if (!currentFile) return;
      try {
        UI.showProgress(0.2, `Converting ${currentFile.name} to PDF...`);
        const res = await window.PDFEngine[detectedEngine]([currentFile], {}, (pct, status) => {
          UI.showProgress(pct, status);
        });

        UI.hideProgress();
        UI.celebrate();
        UI.showToast('Document converted to PDF successfully!', 'success');

        if (res && res.files && res.files.length) {
          const pdfBlob = res.files[0].blob;
          const pdfName = res.files[0].name;
          window.pdfEngine.downloadBlob(pdfBlob, pdfName);
          UI.showResultPreview({
            title: 'PDF Document Ready',
            subtitle: `Converted ${currentFile.name} successfully into high-quality PDF.`,
            blob: pdfBlob,
            filename: pdfName
          });
        }
      } catch (err) {
        UI.hideProgress();
        UI.showToast(`Error: ${err.message}`, 'error');
      }
    });
  },

  // Backward-compatible individual converters delegating to Hub
  renderExcelToPdf(container) { this.renderOfficeToPdfHub(container, 'excel'); },
  renderPptToPdf(container) { this.renderOfficeToPdfHub(container, 'ppt'); },
  renderWordToPdf(container) { this.renderOfficeToPdfHub(container, 'word'); },

  // 3. HTML TO PDF
  renderHtmlToPdf(container) {
    container.innerHTML = `
      <div class="max-w-3xl mx-auto space-y-6">
        <div class="text-center space-y-2">
          <h2 class="text-2xl font-bold tracking-tight">Convert HTML to PDF</h2>
          <p class="text-sm text-slate-500">Render rich HTML and CSS markup into a clean printable PDF.</p>
        </div>

        <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
          <div class="space-y-2">
            <label class="block text-xs font-semibold text-slate-500">HTML Code</label>
            <textarea id="html-source-input" rows="10" class="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono text-xs leading-relaxed focus:ring-2 focus:ring-amber-500 outline-none"><h1>Professional Invoice</h1>
<p>Thank you for your business.</p>
<table style="width:100%; border-collapse: collapse; margin-top: 15px;">
  <thead>
    <tr style="background:#f1f5f9;">
      <th style="border:1px solid #cbd5e1; padding:8px; text-align:left;">Item</th>
      <th style="border:1px solid #cbd5e1; padding:8px; text-align:right;">Amount</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border:1px solid #cbd5e1; padding:8px;">Consulting Services</td>
      <td style="border:1px solid #cbd5e1; padding:8px; text-align:right;">$1,200.00</td>
    </tr>
  </tbody>
</table></textarea>
          </div>

          <div class="flex justify-end pt-2">
            <button id="html-run-btn" class="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm shadow transition flex items-center gap-2">
              <i data-lucide="printer" class="w-4 h-4"></i>
              <span>Render & Save as PDF</span>
            </button>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const textarea = container.querySelector('#html-source-input');
    const runBtn = container.querySelector('#html-run-btn');

    runBtn.addEventListener('click', () => {
      const content = textarea.value.trim();
      if (!content) return;

      const printWin = window.open('', '_blank');
      printWin.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Exported HTML Document</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #111; line-height: 1.5; }
          </style>
        </head>
        <body>
          ${content}
        </body>
        </html>
      `);
      printWin.document.close();
      printWin.focus();
      setTimeout(() => {
        printWin.print();
      }, 400);
      UI.showToast('Print dialog opened. Select "Save as PDF" to download.', 'info');
    });
  },

  // 4. MARKDOWN TO PDF
  renderMarkdownToPdf(container) {
    container.innerHTML = `
      <div class="max-w-4xl mx-auto space-y-6">
        <div class="text-center space-y-2">
          <h2 class="text-2xl font-bold tracking-tight">Convert Markdown to PDF</h2>
          <p class="text-sm text-slate-500">Live split-view editor for turning GitHub-flavored Markdown into a polished PDF document.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="text-xs font-semibold text-slate-500">Markdown Editor</label>
              <button id="md-load-sample" class="text-xs text-amber-600 hover:underline">Reset Sample</button>
            </div>
            <textarea id="md-input" rows="16" class="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs leading-relaxed focus:ring-2 focus:ring-amber-500 outline-none"></textarea>
          </div>

          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="text-xs font-semibold text-slate-500">Live Preview</label>
              <button id="md-run-btn" class="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs transition flex items-center gap-1.5">
                <i data-lucide="download" class="w-3.5 h-3.5"></i>
                <span>Save as PDF</span>
              </button>
            </div>
            <div id="md-preview" class="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 h-[360px] overflow-y-auto prose dark:prose-invert text-xs leading-normal"></div>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const sampleText = `# Project Specification

## 1. Overview
This is a high-level summary of the software requirements and system architecture.

### Key Milestones
- **Phase 1**: Initial Prototype & Core PDF engine
- **Phase 2**: Complete Tool Suite integration
- **Phase 3**: GitHub Pages automated deployment

> "Simplicity is prerequisite for reliability." – Edsger W. Dijkstra

### Feature Checklist
- [x] Lossless PDF Merging
- [x] Client-Side Compression
- [x] Zero-Server Privacy Guarantee
`;

    const input = container.querySelector('#md-input');
    const preview = container.querySelector('#md-preview');
    const sampleBtn = container.querySelector('#md-load-sample');
    const runBtn = container.querySelector('#md-run-btn');

    // Simple markdown renderer
    const parseMd = (text) => {
      let html = text
        .replace(/^### (.*$)/gim, '<h3 class="text-sm font-bold mt-3 mb-1">$1</h3>')
        .replace(/^## (.*$)/gim, '<h2 class="text-base font-bold mt-4 mb-2">$1</h2>')
        .replace(/^# (.*$)/gim, '<h1 class="text-xl font-bold mt-2 mb-3 pb-2 border-b border-slate-200">$1</h1>')
        .replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-amber-500 pl-3 italic text-slate-500 my-2">$1</blockquote>')
        .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/gim, '<em>$1</em>')
        .replace(/^- \[(x| )\] (.*$)/gim, (m, c, t) => `<div class="flex items-center gap-2 my-1"><input type="checkbox" ${c === 'x' ? 'checked' : ''} disabled><span>${t}</span></div>`)
        .replace(/^- (.*$)/gim, '<li class="ml-4 list-disc">$1</li>')
        .replace(/\n$/gim, '<br />');
      return html;
    };

    input.value = sampleText;
    preview.innerHTML = parseMd(sampleText);

    input.addEventListener('input', () => {
      preview.innerHTML = parseMd(input.value);
    });

    sampleBtn.addEventListener('click', () => {
      input.value = sampleText;
      preview.innerHTML = parseMd(sampleText);
    });

    runBtn.addEventListener('click', () => {
      const printWin = window.open('', '_blank');
      printWin.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Markdown Document</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #111; line-height: 1.6; }
            h1 { border-bottom: 2px solid #eaecef; padding-bottom: 8px; }
            blockquote { border-left: 4px solid #d97706; margin: 16px 0; padding-left: 16px; color: #666; font-style: italic; }
            li { margin: 4px 0; }
          </style>
        </head>
        <body>
          ${preview.innerHTML}
        </body>
        </html>
      `);
      printWin.document.close();
      printWin.focus();
      setTimeout(() => {
        printWin.print();
      }, 400);
      UI.showToast('Print dialog opened. Select "Save as PDF" to download.', 'info');
    });
  }
};

window.ConvertToTools = ConvertToTools;

