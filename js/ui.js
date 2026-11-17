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
  }
};

window.UI = UI;

