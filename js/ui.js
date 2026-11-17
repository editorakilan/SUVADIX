/**
 * PDF Suite - UI Helpers & Interaction Components
 */

const UI = {
  // --- Toast Notifications ---
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-msg flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all duration-300 max-w-md ${
      type === 'success' 
        ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/80 dark:border-emerald-800 dark:text-emerald-200' 
        : type === 'error'
        ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/80 dark:border-red-800 dark:text-red-200'
        : 'bg-slate-900 border-slate-800 text-white dark:bg-slate-800 dark:border-slate-700'
    }`;

    const iconSvg = type === 'success'
      ? `<svg class="w-5 h-5 flex-shrink-0 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`
      : type === 'error'
      ? `<svg class="w-5 h-5 flex-shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>`
      : `<svg class="w-5 h-5 flex-shrink-0 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;

    toast.innerHTML = `${iconSvg}<span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px) scale(0.95)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  },

  // --- Confetti Celebration ---
  celebrate() {
    if (window.confetti) {
      window.confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  },

  // --- Progress Modal ---
  showProgress(percentage, text = 'Processing...') {
    const modal = document.getElementById('progress-modal');
    const bar = document.getElementById('progress-bar');
    const textEl = document.getElementById('progress-text');
    const pctEl = document.getElementById('progress-percentage');
    if (!modal) return;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    const pct = Math.round(percentage * 100);
    if (bar) bar.style.width = `${pct}%`;
    if (pctEl) pctEl.innerText = `${pct}%`;
    if (textEl) textEl.innerText = text;
  },

  hideProgress() {
    const modal = document.getElementById('progress-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  },

  // --- Multi-file Drag & Drop List Helper ---
  setupDropzone(zoneEl, inputEl, onFilesSelected) {
    if (!zoneEl || !inputEl) return;

    ['dragenter', 'dragover'].forEach(name => {
      zoneEl.addEventListener(name, (e) => {
        e.preventDefault();
        zoneEl.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(name => {
      zoneEl.addEventListener(name, (e) => {
        e.preventDefault();
        zoneEl.classList.remove('dragover');
      });
    });

    zoneEl.addEventListener('drop', (e) => {
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0 && onFilesSelected) onFilesSelected(files);
    });

    zoneEl.addEventListener('click', () => inputEl.click());

    inputEl.addEventListener('change', () => {
      const files = Array.from(inputEl.files);
      if (files.length > 0 && onFilesSelected) onFilesSelected(files);
      inputEl.value = ''; // Reset input to re-trigger same file selection
    });
  },

  // --- Render Page Thumbnails in Grid ---
  async renderPdfThumbnails(arrayBuffer, containerEl, options = {}) {
    const {
      selectable = false,
      onSelectionChange = null,
      deletable = false,
      rotatable = false,
      thumbWidth = 180
    } = options;

    containerEl.innerHTML = `
      <div class="col-span-full flex items-center justify-center py-12 text-slate-400">
        <svg class="animate-spin -ml-1 mr-3 h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
        <span>Generating high-fidelity page previews...</span>
      </div>
    `;

    try {
      const pdfDoc = await window.pdfEngine.getPdfJsDoc(arrayBuffer);
      const totalPages = pdfDoc.numPages;
      containerEl.innerHTML = '';

      const pageStates = [];

      for (let i = 1; i <= totalPages; i++) {
        const pageIdx = i - 1;
        const pageState = {
          originalIndex: pageIdx,
          selected: false,
          deleted: false,
          rotation: 0
        };
        pageStates.push(pageState);

        const card = document.createElement('div');
        card.className = 'page-thumb-card bg-white dark:bg-slate-800 rounded-xl p-2.5 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col items-center cursor-pointer';
        card.dataset.pageIndex = pageIdx;

        const canvasWrapper = document.createElement('div');
        canvasWrapper.className = 'w-full flex items-center justify-center overflow-hidden rounded bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800';

        const canvas = document.createElement('canvas');
        canvas.className = 'max-w-full h-auto transition-transform duration-200';
        canvasWrapper.appendChild(canvas);
        card.appendChild(canvasWrapper);

        // Footer / controls
        const footer = document.createElement('div');
        footer.className = 'w-full flex items-center justify-between mt-2 pt-1 text-xs text-slate-500 font-medium px-1';
        footer.innerHTML = `<span>Page ${i}</span>`;

        if (rotatable) {
          const rotBtn = document.createElement('button');
          rotBtn.className = 'p-1 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition';
          rotBtn.title = 'Rotate 90° Clockwise';
          rotBtn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>`;
          rotBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            pageState.rotation = (pageState.rotation + 90) % 360;
            canvas.style.transform = `rotate(${pageState.rotation}deg)`;
            if (onSelectionChange) onSelectionChange(pageStates);
          });
          footer.appendChild(rotBtn);
        }

        if (deletable) {
          const delBtn = document.createElement('button');
          delBtn.className = 'p-1 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition';
          delBtn.title = 'Remove page';
          delBtn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>`;
          delBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            pageState.deleted = !pageState.deleted;
            card.classList.toggle('marked-delete', pageState.deleted);
            if (onSelectionChange) onSelectionChange(pageStates);
          });
          footer.appendChild(delBtn);
        }

        card.appendChild(footer);

        if (selectable) {
          card.addEventListener('click', () => {
            pageState.selected = !pageState.selected;
            card.classList.toggle('selected', pageState.selected);
            if (onSelectionChange) onSelectionChange(pageStates);
          });
        }

        containerEl.appendChild(card);

        // Render in background
        window.pdfEngine.renderPageToCanvas(pdfDoc, i, canvas, thumbWidth);
      }

      return pageStates;
    } catch (err) {
      containerEl.innerHTML = `<div class="col-span-full p-6 text-center text-red-500">Failed to render thumbnails: ${err.message}</div>`;
      throw err;
    }
  },

  // --- High-Fidelity Result Preview Modal (Inspect Before Download) ---
  async showResultPreview({
    title = 'Document Ready',
    subtitle = 'Review your pages below before saving',
    blob,
    filename = 'document.pdf',
    originalSize = null,
    onDownload = null
  }) {
    const modal = document.getElementById('result-preview-modal');
    if (!modal) {
      window.pdfEngine.downloadBlob(blob, filename);
      return;
    }

    const titleEl = document.getElementById('res-modal-title');
    const subtitleEl = document.getElementById('res-modal-subtitle');
    const closeBtn = document.getElementById('res-modal-close');
    const prevBtn = document.getElementById('res-prev-page');
    const nextBtn = document.getElementById('res-next-page');
    const pageInfoEl = document.getElementById('res-page-info');
    const zoomInBtn = document.getElementById('res-zoom-in');
    const zoomOutBtn = document.getElementById('res-zoom-out');
    const zoomValEl = document.getElementById('res-zoom-val');
    const canvas = document.getElementById('res-preview-canvas');
    const fileBadge = document.getElementById('res-file-badge');
    const savingsBadge = document.getElementById('res-savings-badge');
    const openTabBtn = document.getElementById('res-open-tab-btn');
    const downloadBtn = document.getElementById('res-download-btn');
    const downloadLabel = document.getElementById('res-download-label');

    if (titleEl) titleEl.textContent = title;
    if (subtitleEl) subtitleEl.textContent = subtitle;
    if (fileBadge) fileBadge.textContent = window.pdfEngine.formatBytes(blob.size || 0);

    if (savingsBadge) {
      if (originalSize && originalSize > blob.size) {
        const savedPct = Math.round(((originalSize - blob.size) / originalSize) * 100);
        savingsBadge.textContent = `Saved ${savedPct}%`;
        savingsBadge.classList.remove('hidden');
      } else {
        savingsBadge.classList.add('hidden');
      }
    }

    if (downloadLabel) {
      const ext = filename.split('.').pop().toUpperCase();
      downloadLabel.textContent = `Download ${ext || 'File'}`;
    }

    const blobUrl = URL.createObjectURL(blob);

    if (openTabBtn) {
      openTabBtn.onclick = () => {
        window.open(blobUrl, '_blank');
      };
    }

    if (downloadBtn) {
      downloadBtn.onclick = () => {
        if (onDownload) {
          onDownload();
        } else {
          window.pdfEngine.downloadBlob(blob, filename);
        }
        UI.celebrate();
        UI.showToast(`Saved ${filename}!`, 'success');
      };
    }

    const closeModal = () => {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
    };

    if (closeBtn) closeBtn.onclick = closeModal;
    const footerCloseBtn = document.getElementById('res-footer-close-btn');
    if (footerCloseBtn) footerCloseBtn.onclick = closeModal;

    modal.onclick = (e) => {
      if (e.target === modal) closeModal();
    };

    let pdfDoc = null;
    let currentPage = 1;
    let totalPages = 1;
    let zoomLevel = 1.0;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    if (window.lucide) window.lucide.createIcons();

    const isPdf = (blob.type === 'application/pdf' || filename.toLowerCase().endsWith('.pdf'));

    if (isPdf && canvas) {
      canvas.style.display = 'block';
      const navBar = prevBtn?.parentElement;
      if (navBar) navBar.style.display = 'flex';

      try {
        const buffer = await blob.arrayBuffer();
        pdfDoc = await window.pdfEngine.getPdfJsDoc(buffer);
        totalPages = pdfDoc.numPages;
        currentPage = 1;

        const renderPage = async () => {
          if (!pdfDoc || !canvas) return;
          const page = await pdfDoc.getPage(currentPage);
          const baseViewport = page.getViewport({ scale: 1.0 });
          const targetWidth = Math.round(Math.max(650, baseViewport.width) * zoomLevel);
          const scale = targetWidth / baseViewport.width;
          const viewport = page.getViewport({ scale });

          // Crystal clear 2x HiDPI super-sampling so zooming in never blurs
          const outputScale = Math.max(2.0, window.devicePixelRatio || 1);
          canvas.width = Math.floor(viewport.width * outputScale);
          canvas.height = Math.floor(viewport.height * outputScale);
          canvas.style.width = Math.floor(viewport.width) + 'px';
          canvas.style.height = Math.floor(viewport.height) + 'px';

          const ctx = canvas.getContext('2d');
          ctx.setTransform(outputScale, 0, 0, outputScale, 0, 0);

          await page.render({
            canvasContext: ctx,
            viewport: viewport
          }).promise;

          if (pageInfoEl) pageInfoEl.textContent = `Page ${currentPage} of ${totalPages}`;
          if (prevBtn) prevBtn.disabled = currentPage <= 1;
          if (nextBtn) nextBtn.disabled = currentPage >= totalPages;
          if (zoomValEl) zoomValEl.textContent = `${Math.round(zoomLevel * 100)}%`;
        };

        if (prevBtn) {
          prevBtn.onclick = () => {
            if (currentPage > 1) {
              currentPage--;
              renderPage();
            }
          };
        }

        if (nextBtn) {
          nextBtn.onclick = () => {
            if (currentPage < totalPages) {
              currentPage++;
              renderPage();
            }
          };
        }

        if (zoomInBtn) {
          zoomInBtn.onclick = () => {
            if (zoomLevel < 2.0) {
              zoomLevel = Math.min(2.0, +(zoomLevel + 0.2).toFixed(1));
              renderPage();
            }
          };
        }

        if (zoomOutBtn) {
          zoomOutBtn.onclick = () => {
            if (zoomLevel > 0.6) {
              zoomLevel = Math.max(0.6, +(zoomLevel - 0.2).toFixed(1));
              renderPage();
            }
          };
        }

        await renderPage();
      } catch (err) {
        console.error('Result preview render error:', err);
        if (canvas) {
          const ctx = canvas.getContext('2d');
          canvas.width = 400;
          canvas.height = 200;
          canvas.style.width = '400px';
          canvas.style.height = '200px';
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(0, 0, 400, 200);
          ctx.fillStyle = '#94a3b8';
          ctx.font = '14px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('Ready to download (' + filename + ')', 200, 105);
        }
      }
    } else {
      const navBar = prevBtn?.parentElement;
      if (navBar) navBar.style.display = 'none';
      if (canvas) {
        canvas.style.display = 'block';
        const ctx = canvas.getContext('2d');
        canvas.width = 480;
        canvas.height = 220;
        canvas.style.width = '480px';
        canvas.style.height = '220px';
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, 480, 220);
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(filename, 240, 95);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '13px sans-serif';
        ctx.fillText('Ready for export (' + window.pdfEngine.formatBytes(blob.size || 0) + ')', 240, 125);
        ctx.fillText('Click Download button below to save', 240, 150);
      }
    }
  }
};

window.UI = UI;

