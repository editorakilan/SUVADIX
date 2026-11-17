/**
 * PDF Suite - Convert To PDF Tools
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

        <div id="jpg-options" class="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4 hidden">
          <h3 class="font-semibold text-sm">Page Formatting</h3>
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
        UI.showProgress(0.3, 'Converting images into PDF pages...');
        const pageSize = pageSizeSelect.value;
        const orientation = orientSelect.value;
        const margin = parseInt(marginSelect.value, 10);

        const pdfBlob = await window.pdfEngine.imagesToPDF(imageFiles, { pageSize, orientation, margin });
        UI.hideProgress();
        UI.celebrate();
        UI.showToast('Images converted to PDF successfully!', 'success');
        UI.showResultPreview({
          title: 'Converted PDF Ready',
          subtitle: `${imageFiles.length} image(s) combined into high-resolution PDF`,
          blob: pdfBlob,
          filename: 'converted_images.pdf'
        });
      } catch (err) {
        UI.hideProgress();
        UI.showToast(`Error: ${err.message}`, 'error');
      }
    });
  },

  // 2. WORD TO PDF (.docx)
  renderWordToPdf(container) {
    let docxFile = null;

    container.innerHTML = `
      <div class="max-w-3xl mx-auto space-y-6">
        <div class="text-center space-y-2">
          <h2 class="text-2xl font-bold tracking-tight">Convert Word (.docx) to PDF</h2>
          <p class="text-sm text-slate-500">Convert Microsoft Word documents directly in your browser with privacy preservation.</p>
        </div>

        <div id="word-dropzone" class="dropzone p-8 rounded-2xl text-center cursor-pointer hover:border-blue-500 transition">
          <input type="file" id="word-file-input" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" class="hidden">
          <div class="flex flex-col items-center gap-3">
            <div class="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
              <i data-lucide="file-type-2" class="w-8 h-8"></i>
            </div>
            <div>
              <p class="font-semibold text-slate-700 dark:text-slate-200">Upload Word (.docx) file</p>
              <p class="text-xs text-slate-400 mt-1" id="word-file-status">Fast client-side document parser</p>
            </div>
          </div>
        </div>

        <div id="word-preview-card" class="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4 hidden">
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-sm">Document Preview</h3>
            <button id="word-run-btn" class="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition flex items-center gap-2">
              <i data-lucide="download" class="w-4 h-4"></i>
              <span>Export as PDF</span>
            </button>
          </div>
          <div id="word-html-content" class="p-6 bg-slate-50 dark:bg-slate-900 rounded-xl max-h-96 overflow-y-auto border border-slate-100 dark:border-slate-800 prose dark:prose-invert text-xs leading-normal"></div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const dropzone = container.querySelector('#word-dropzone');
    const input = container.querySelector('#word-file-input');
    const statusEl = container.querySelector('#word-file-status');
    const previewCard = container.querySelector('#word-preview-card');
    const htmlContent = container.querySelector('#word-html-content');
    const runBtn = container.querySelector('#word-run-btn');

    UI.setupDropzone(dropzone, input, async (files) => {
      if (files.length === 0) return;
      docxFile = files[0];
      statusEl.innerText = `${docxFile.name} (${window.pdfEngine.formatBytes(docxFile.size)})`;

      if (window.mammoth) {
        UI.showProgress(0.3, 'Parsing Word document structure...');
        const arrayBuffer = await window.pdfEngine.readFileAsArrayBuffer(docxFile);
        const result = await window.mammoth.convertToHtml({ arrayBuffer });
        htmlContent.innerHTML = result.value;
        previewCard.classList.remove('hidden');
        UI.hideProgress();
      }
    });

    runBtn.addEventListener('click', async () => {
      if (!docxFile) return;
      try {
        UI.showProgress(0.5, 'Rendering formatted document to PDF...');
        // Print window or html canvas rendering
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>${docxFile.name.replace(/\.docx$/i, '')}</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #111; line-height: 1.6; }
              h1, h2, h3 { color: #111; }
              table { border-collapse: collapse; width: 100%; margin: 16px 0; }
              th, td { border: 1px solid #ccc; padding: 8px; }
            </style>
          </head>
          <body>
            ${htmlContent.innerHTML}
          </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 500);

        UI.hideProgress();
        UI.showToast('Ready to save/print as PDF!', 'success');
      } catch (err) {
        UI.hideProgress();
        UI.showToast(`Error: ${err.message}`, 'error');
      }
    });
  },

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

