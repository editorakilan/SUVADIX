/**
 * SUVADIX - Organize Tools
 * Merge, Split, Remove Pages, Extract Pages, Organize, Scan to PDF
 */

const OrganizeTools = {
  // 1. MERGE PDF (Visual Document Cards with Page 1 Previews, Reordering, Rotation & Add More)
  renderMerge(container) {
    let files = []; // Array of { id, file, buffer, numPages, rotation, canvasEl }
    let viewMode = 'grid'; // 'grid' | 'list'
    let gridColsClass = 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5';

    container.innerHTML = `
      <div class="max-w-6xl mx-auto space-y-6">
        <div class="text-center space-y-2">
          <h2 class="text-2xl font-bold tracking-tight">Merge PDF Files</h2>
          <p class="text-sm text-slate-500">Combine multiple PDF files into a single document in any order with live cover page previews.</p>
          <div class="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-full text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            <svg class="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            <span>100% Vector & Digital Text Preserved (Zero Quality Loss)</span>
          </div>
        </div>

        <!-- Initial Upload Dropzone -->
        <div id="merge-dropzone" class="dropzone p-8 rounded-2xl text-center cursor-pointer hover:border-red-500 transition">
          <input type="file" id="merge-file-input" multiple accept="application/pdf" class="hidden">
          <div class="flex flex-col items-center gap-3">
            <div class="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center">
              <i data-lucide="files" class="w-8 h-8"></i>
            </div>
            <div>
              <p class="font-semibold text-slate-700 dark:text-slate-200">Click to upload or drag & drop PDFs</p>
              <p class="text-xs text-slate-400 mt-1">Select 2 or more PDF documents to merge</p>
            </div>
          </div>
        </div>

        <!-- Hidden input for adding more files in workspace -->
        <input type="file" id="merge-add-more-input" multiple accept="application/pdf" class="hidden">

        <!-- Interactive Workspace -->
        <div id="merge-workspace" class="space-y-4 hidden">
          <!-- Main Action & Ordering Toolbar -->
          <div class="flex flex-wrap items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm gap-3">
            <!-- Summary Info -->
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center">
                <i data-lucide="layers" class="w-5 h-5"></i>
              </div>
              <div>
                <span id="merge-summary-text" class="text-sm font-bold text-slate-800 dark:text-slate-100 block">0 Documents</span>
                <span id="merge-summary-sub" class="text-xs text-slate-400 font-medium">Drag cards or use arrows to reorder</span>
              </div>
            </div>

            <!-- Ordering & Sorting Tools -->
            <div class="flex items-center gap-1.5">
              <button id="merge-sort-az" class="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 transition flex items-center gap-1" title="Sort files alphabetically (A-Z)">
                <i data-lucide="arrow-down-a-z" class="w-3.5 h-3.5"></i>
                <span>A-Z</span>
              </button>
              <button id="merge-sort-za" class="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 transition flex items-center gap-1" title="Sort files reverse alphabetically (Z-A)">
                <i data-lucide="arrow-up-z-a" class="w-3.5 h-3.5"></i>
                <span>Z-A</span>
              </button>
              <button id="merge-reverse-btn" class="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 transition flex items-center gap-1" title="Reverse document order">
                <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i>
                <span>Reverse</span>
              </button>
            </div>

            <!-- View, Zoom & Action Controls -->
            <div class="flex items-center gap-2">
              <!-- View Toggle (Cards vs List) -->
              <div class="flex items-center bg-slate-100 dark:bg-slate-900 rounded-xl p-0.5 border border-slate-200 dark:border-slate-700 text-xs">
                <button id="merge-view-grid-btn" class="px-2.5 py-1 rounded-lg font-bold bg-white dark:bg-slate-800 text-red-600 shadow-xs flex items-center gap-1">
                  <i data-lucide="layout-grid" class="w-3.5 h-3.5"></i>
                  <span>Cards</span>
                </button>
                <button id="merge-view-list-btn" class="px-2.5 py-1 rounded-lg font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1">
                  <i data-lucide="list" class="w-3.5 h-3.5"></i>
                  <span>List</span>
                </button>
              </div>

              <!-- Zoom Controls (for Cards view) -->
              <div id="merge-zoom-wrap" class="flex items-center gap-1 text-xs font-semibold text-slate-500 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1">
                <span>Zoom:</span>
                <button id="merge-scale-down" class="p-0.5 hover:text-red-600 font-bold" title="Smaller Thumbnails">A-</button>
                <button id="merge-scale-up" class="p-0.5 hover:text-red-600 font-bold" title="Larger Thumbnails">A+</button>
              </div>

              <!-- Add Files Button -->
              <button id="merge-add-more-btn" class="px-3 py-1.5 rounded-xl border border-dashed border-red-300 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 text-xs font-bold transition flex items-center gap-1" title="Add more PDF documents">
                <i data-lucide="plus" class="w-3.5 h-3.5"></i>
                <span>Add Files</span>
              </button>

              <!-- Clear All Button -->
              <button id="merge-clear-btn" class="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold transition">
                Clear
              </button>

              <!-- Merge PDF Button -->
              <button id="merge-run-btn" class="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-lg shadow-red-600/20 transition flex items-center gap-1.5">
                <i data-lucide="merge" class="w-4 h-4"></i>
                <span>Merge PDF</span>
              </button>
            </div>
          </div>

          <!-- Visual Grid Cards View -->
          <div id="merge-grid-container" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"></div>

          <!-- Compact List View -->
          <div id="merge-list-container" class="space-y-2 hidden"></div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const dropzone = container.querySelector('#merge-dropzone');
    const input = container.querySelector('#merge-file-input');
    const addMoreInput = container.querySelector('#merge-add-more-input');
    const addMoreBtn = container.querySelector('#merge-add-more-btn');
    const workspace = container.querySelector('#merge-workspace');
    const gridContainer = container.querySelector('#merge-grid-container');
    const listContainer = container.querySelector('#merge-list-container');
    const summaryText = container.querySelector('#merge-summary-text');
    const summarySub = container.querySelector('#merge-summary-sub');
    const runBtn = container.querySelector('#merge-run-btn');
    const clearBtn = container.querySelector('#merge-clear-btn');
    const sortAzBtn = container.querySelector('#merge-sort-az');
    const sortZaBtn = container.querySelector('#merge-sort-za');
    const reverseBtn = container.querySelector('#merge-reverse-btn');
    const viewGridBtn = container.querySelector('#merge-view-grid-btn');
    const viewListBtn = container.querySelector('#merge-view-list-btn');
    const scaleUp = container.querySelector('#merge-scale-up');
    const scaleDown = container.querySelector('#merge-scale-down');
    const zoomWrap = container.querySelector('#merge-zoom-wrap');

    // Scale thumbnails
    if (scaleUp && scaleDown) {
      scaleUp.addEventListener('click', () => {
        gridColsClass = 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6';
        gridContainer.className = `grid ${gridColsClass}`;
      });
      scaleDown.addEventListener('click', () => {
        gridColsClass = 'grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3';
        gridContainer.className = `grid ${gridColsClass}`;
      });
    }

    // Toggle view modes
    const setViewMode = (mode) => {
      viewMode = mode;
      if (mode === 'grid') {
        gridContainer.classList.remove('hidden');
        listContainer.classList.add('hidden');
        zoomWrap.classList.remove('hidden');
        viewGridBtn.className = 'px-2.5 py-1 rounded-lg font-bold bg-white dark:bg-slate-800 text-red-600 shadow-xs flex items-center gap-1';
        viewListBtn.className = 'px-2.5 py-1 rounded-lg font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1';
      } else {
        gridContainer.classList.add('hidden');
        listContainer.classList.remove('hidden');
        zoomWrap.classList.add('hidden');
        viewListBtn.className = 'px-2.5 py-1 rounded-lg font-bold bg-white dark:bg-slate-800 text-red-600 shadow-xs flex items-center gap-1';
        viewGridBtn.className = 'px-2.5 py-1 rounded-lg font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1';
      }
      renderView();
    };

    viewGridBtn.addEventListener('click', () => setViewMode('grid'));
    viewListBtn.addEventListener('click', () => setViewMode('list'));

    // Trigger file uploads
    addMoreBtn.addEventListener('click', () => addMoreInput.click());

    // Update summary text
    const updateSummary = () => {
      const totalDocs = files.length;
      const totalPages = files.reduce((acc, f) => acc + (f.numPages || 1), 0);
      const totalBytes = files.reduce((acc, f) => acc + (f.file.size || 0), 0);
      summaryText.innerText = `${totalDocs} Documents (${totalPages} Total Pages)`;
      summarySub.innerText = `Total Size: ${window.pdfEngine.formatBytes(totalBytes)} • Ready to merge`;
    };

    // Render the active view
    const renderView = () => {
      updateSummary();
      if (files.length === 0) {
        workspace.classList.add('hidden');
        dropzone.classList.remove('hidden');
        return;
      }
      workspace.classList.remove('hidden');
      dropzone.classList.add('hidden');

      if (viewMode === 'grid') {
        renderGridView();
      } else {
        renderListView();
      }
    };

    // Render Visual Document Grid Cards
    const renderGridView = () => {
      gridContainer.innerHTML = '';
      gridContainer.className = `grid ${gridColsClass}`;

      let dragSourceIdx = null;

      files.forEach((item, index) => {
        const card = document.createElement('div');
        card.draggable = true;
        card.dataset.index = index;
        card.className = 'page-thumb-card group relative bg-white dark:bg-slate-800 rounded-2xl p-3 shadow-sm border border-slate-200 dark:border-slate-700 hover:border-red-400 hover:shadow-md flex flex-col items-center transition-all select-none cursor-grab active:cursor-grabbing';

        // Header
        const header = document.createElement('div');
        header.className = 'w-full flex items-center justify-between mb-2 text-xs font-bold text-slate-700 dark:text-slate-300 gap-1.5';
        header.innerHTML = `
          <div class="flex items-center gap-1.5 min-w-0">
            <span class="w-6 h-6 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 flex items-center justify-center text-xs font-extrabold shrink-0">
              ${index + 1}
            </span>
            <span class="truncate font-semibold text-xs text-slate-800 dark:text-slate-200" title="${item.file.name}">
              ${item.file.name}
            </span>
          </div>
          <div class="flex items-center gap-0.5 shrink-0">
            <button class="btn-left p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition ${index === 0 ? 'opacity-25 pointer-events-none' : ''}" title="Move left">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/></svg>
            </button>
            <button class="btn-right p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition ${index === files.length - 1 ? 'opacity-25 pointer-events-none' : ''}" title="Move right">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/></svg>
            </button>
            <button class="btn-remove p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition" title="Remove file">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </div>
        `;
        card.appendChild(header);

        // Canvas Thumbnail Container
        const canvasWrapper = document.createElement('div');
        canvasWrapper.className = 'w-full flex-1 flex items-center justify-center overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-2 min-h-[170px] relative';
        
        // Page Count Badge
        const pageBadge = document.createElement('span');
        pageBadge.className = 'absolute bottom-2 left-2 bg-slate-900/85 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs pointer-events-none z-10 flex items-center gap-1';
        pageBadge.innerHTML = `<svg class="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg><span>${item.numPages} ${item.numPages === 1 ? 'Page' : 'Pages'}</span>`;
        canvasWrapper.appendChild(pageBadge);

        // File Size Badge
        const sizeBadge = document.createElement('span');
        sizeBadge.className = 'absolute bottom-2 right-2 bg-slate-900/85 backdrop-blur-xs text-slate-200 text-[10px] font-mono px-1.5 py-0.5 rounded-md shadow-xs pointer-events-none z-10';
        sizeBadge.innerText = window.pdfEngine.formatBytes(item.file.size);
        canvasWrapper.appendChild(sizeBadge);

        if (item.canvasEl) {
          item.canvasEl.style.transform = `rotate(${item.rotation}deg)`;
          canvasWrapper.appendChild(item.canvasEl);
        }
        card.appendChild(canvasWrapper);

        // Footer: Rotate & details
        const footer = document.createElement('div');
        footer.className = 'w-full flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-700/60 text-xs';
        footer.innerHTML = `
          <button class="btn-rotate p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded transition flex items-center gap-1 text-[11px] font-semibold" title="Rotate document 90° Clockwise">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            <span class="rot-label">${item.rotation > 0 ? `${item.rotation}°` : 'Rotate'}</span>
          </button>
          <span class="text-[10px] text-slate-400 font-medium">Page 1 Cover</span>
        `;
        card.appendChild(footer);

        // Handlers
        card.querySelector('.btn-left').addEventListener('click', (e) => {
          e.stopPropagation();
          if (index > 0) {
            const temp = files[index];
            files[index] = files[index - 1];
            files[index - 1] = temp;
            renderView();
          }
        });

        card.querySelector('.btn-right').addEventListener('click', (e) => {
          e.stopPropagation();
          if (index < files.length - 1) {
            const temp = files[index];
            files[index] = files[index + 1];
            files[index + 1] = temp;
            renderView();
          }
        });

        card.querySelector('.btn-remove').addEventListener('click', (e) => {
          e.stopPropagation();
          files.splice(index, 1);
          renderView();
        });

        card.querySelector('.btn-rotate').addEventListener('click', (e) => {
          e.stopPropagation();
          item.rotation = (item.rotation + 90) % 360;
          if (item.canvasEl) {
            item.canvasEl.style.transform = `rotate(${item.rotation}deg)`;
          }
          const rotLabel = card.querySelector('.rot-label');
          if (rotLabel) rotLabel.innerText = item.rotation > 0 ? `${item.rotation}°` : 'Rotate';
        });

        // Drag and drop reordering
        card.addEventListener('dragstart', (e) => {
          dragSourceIdx = index;
          e.dataTransfer.setData('text/plain', `${index}`);
          card.classList.add('opacity-50');
        });

        card.addEventListener('dragend', () => {
          card.classList.remove('opacity-50');
        });

        card.addEventListener('dragover', (e) => {
          e.preventDefault();
          card.classList.add('ring-2', 'ring-red-500');
        });

        card.addEventListener('dragleave', () => {
          card.classList.remove('ring-2', 'ring-red-500');
        });

        card.addEventListener('drop', (e) => {
          e.preventDefault();
          card.classList.remove('ring-2', 'ring-red-500');
          if (dragSourceIdx !== null && dragSourceIdx !== index) {
            const moved = files.splice(dragSourceIdx, 1)[0];
            files.splice(index, 0, moved);
            renderView();
          }
        });

        gridContainer.appendChild(card);
      });

      // + Add More PDFs Card
      const addCard = document.createElement('div');
      addCard.id = 'merge-add-card';
      addCard.className = 'rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-red-500 dark:hover:border-red-500 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-red-50/20 transition-all p-6 flex flex-col items-center justify-center text-center cursor-pointer min-h-[220px] group';
      addCard.innerHTML = `
        <div class="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/60 text-red-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
        </div>
        <span class="font-bold text-xs text-slate-700 dark:text-slate-300 group-hover:text-red-600">Add More PDFs</span>
        <span class="text-[10px] text-slate-400 mt-0.5">Click or drop files</span>
      `;
      addCard.addEventListener('click', () => addMoreInput.click());
      addCard.addEventListener('dragover', (e) => {
        e.preventDefault();
        addCard.classList.add('border-red-500', 'bg-red-50/30');
      });
      addCard.addEventListener('dragleave', () => {
        addCard.classList.remove('border-red-500', 'bg-red-50/30');
      });
      addCard.addEventListener('drop', (e) => {
        e.preventDefault();
        addCard.classList.remove('border-red-500', 'bg-red-50/30');
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          ingestFiles(e.dataTransfer.files);
        }
      });
      gridContainer.appendChild(addCard);
    };

    // Render Compact List View
    const renderListView = () => {
      listContainer.innerHTML = files.map((item, index) => `
        <div class="flex items-center justify-between p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm gap-3" data-index="${index}">
          <div class="flex items-center gap-3 truncate min-w-0">
            <span class="w-6 h-6 rounded-full bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 flex items-center justify-center text-xs font-bold shrink-0">${index + 1}</span>
            <div class="w-10 h-13 rounded border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-900 shrink-0 list-canvas-placeholder flex items-center justify-center">
            </div>
            <div class="truncate">
              <span class="font-semibold text-sm truncate block text-slate-800 dark:text-slate-200" title="${item.file.name}">${item.file.name}</span>
              <span class="text-xs text-slate-400 font-medium">${item.numPages} Pages • ${window.pdfEngine.formatBytes(item.file.size)} ${item.rotation > 0 ? `• Rotated ${item.rotation}°` : ''}</span>
            </div>
          </div>
          <div class="flex items-center gap-1 shrink-0">
            <button class="list-btn-rot p-1.5 hover:text-blue-500 rounded text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700" title="Rotate document 90° Clockwise">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            </button>
            <button class="list-btn-up p-1.5 hover:text-red-500 rounded text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700" title="Move Up" ${index === 0 ? 'disabled style="opacity:0.3"' : ''}>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/></svg>
            </button>
            <button class="list-btn-down p-1.5 hover:text-red-500 rounded text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700" title="Move Down" ${index === files.length - 1 ? 'disabled style="opacity:0.3"' : ''}>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            </button>
            <button class="list-btn-remove p-1.5 hover:text-red-500 rounded text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700" title="Remove">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </div>
        </div>
      `).join('');

      // Mount cloned mini-previews into list items
      listContainer.querySelectorAll('.list-canvas-placeholder').forEach((ph, i) => {
        if (files[i] && files[i].canvasEl) {
          const mini = document.createElement('canvas');
          mini.width = 40;
          mini.height = 52;
          const ctx = mini.getContext('2d');
          ctx.drawImage(files[i].canvasEl, 0, 0, 40, 52);
          ph.appendChild(mini);
        }
      });

      // Handlers in List View
      listContainer.querySelectorAll('.list-btn-up').forEach((b, idx) => {
        b.addEventListener('click', () => {
          if (idx > 0) {
            const temp = files[idx];
            files[idx] = files[idx - 1];
            files[idx - 1] = temp;
            renderView();
          }
        });
      });

      listContainer.querySelectorAll('.list-btn-down').forEach((b, idx) => {
        b.addEventListener('click', () => {
          if (idx < files.length - 1) {
            const temp = files[idx];
            files[idx] = files[idx + 1];
            files[idx + 1] = temp;
            renderView();
          }
        });
      });

      listContainer.querySelectorAll('.list-btn-rot').forEach((b, idx) => {
        b.addEventListener('click', () => {
          files[idx].rotation = (files[idx].rotation + 90) % 360;
          if (files[idx].canvasEl) {
            files[idx].canvasEl.style.transform = `rotate(${files[idx].rotation}deg)`;
          }
          renderView();
        });
      });

      listContainer.querySelectorAll('.list-btn-remove').forEach((b, idx) => {
        b.addEventListener('click', () => {
          files.splice(idx, 1);
          renderView();
        });
      });
    };

    // Sort Handlers
    sortAzBtn.addEventListener('click', () => {
      files.sort((a, b) => a.file.name.localeCompare(b.file.name));
      renderView();
      UI.showToast('Sorted files alphabetically (A to Z)', 'info');
    });

    sortZaBtn.addEventListener('click', () => {
      files.sort((a, b) => b.file.name.localeCompare(a.file.name));
      renderView();
      UI.showToast('Sorted files reverse alphabetically (Z to A)', 'info');
    });

    reverseBtn.addEventListener('click', () => {
      files.reverse();
      renderView();
      UI.showToast('Reversed document order', 'info');
    });

    clearBtn.addEventListener('click', () => {
      files = [];
      renderView();
    });

    // Helper: Ingest uploaded PDF files and generate high-fidelity cover canvas previews
    const ingestFiles = async (newRawFiles) => {
      const pdfs = Array.from(newRawFiles).filter(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
      if (pdfs.length === 0) return;

      UI.showProgress(0.1, `Loading ${pdfs.length} PDF documents...`);

      for (let i = 0; i < pdfs.length; i++) {
        const f = pdfs[i];
        UI.showProgress(0.1 + (i / pdfs.length) * 0.8, `Generating cover preview for ${f.name}...`);
        try {
          const buf = await window.pdfEngine.readFileAsArrayBuffer(f);
          const pdfDoc = await window.pdfEngine.getPdfJsDoc(window.pdfEngine.cloneBuffer(buf));
          const numPages = pdfDoc.numPages;

          const canvas = document.createElement('canvas');
          await window.pdfEngine.renderPageToCanvas(pdfDoc, 1, canvas, 240);

          files.push({
            id: Date.now() + Math.random(),
            file: f,
            buffer: buf,
            numPages: numPages,
            rotation: 0,
            canvasEl: canvas
          });
        } catch (err) {
          console.error('Error loading PDF file:', f.name, err);
          UI.showToast(`Failed to parse ${f.name}: ${err.message}`, 'error');
        }
      }

      UI.hideProgress();
      renderView();
    };

    // Dropzone setup
    UI.setupDropzone(dropzone, input, (newFiles) => {
      ingestFiles(newFiles);
    });

    // Add more input listener
    addMoreInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        ingestFiles(e.target.files);
        addMoreInput.value = '';
      }
    });

    // Run Merge
    runBtn.addEventListener('click', async () => {
      if (files.length < 2) {
        UI.showToast('Please select at least 2 PDF files to merge.', 'error');
        return;
      }

      try {
        UI.showProgress(0.1, 'Combining PDF streams...');
        const mergePayload = files.map(f => ({
          buffer: window.pdfEngine.cloneBuffer(f.buffer),
          rotation: f.rotation
        }));

        const mergedBlob = await window.pdfEngine.mergePDFs(mergePayload, (pct, status) => {
          UI.showProgress(pct, status);
        });

        UI.hideProgress();
        UI.celebrate();
        UI.showToast('PDF files merged successfully!', 'success');

        const totalPages = files.reduce((acc, f) => acc + f.numPages, 0);
        UI.showResultPreview({
          title: 'PDF Files Merged Successfully',
          subtitle: `${files.length} documents combined into ${totalPages} pages with 100% digital vector preservation`,
          blob: mergedBlob,
          filename: `merged_${files[0].file.name.replace(/\.pdf$/i, '')}_plus_${files.length - 1}_files.pdf`
        });
      } catch (err) {
        UI.hideProgress();
        UI.showToast(`Merge failed: ${err.message}`, 'error');
      }
    });
  },

  // 2. SPLIT PDF (High-Fidelity Page Preview Grid, Custom Ranges, Extract All & Selection)
  renderSplit(container) {
    let currentBuffer = null;
    let currentFile = null;
    let pdfDoc = null;
    let totalPages = 0;
    let pageItems = []; // Array of { pageNum, canvasEl, selected: true }
    let splitMode = 'ranges'; // 'ranges' | 'all' | 'selected' | 'fixed'
    let fixedBatchSize = 2;
    let gridColsClass = 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6';

    container.innerHTML = `
      <div class="max-w-6xl mx-auto space-y-6">
        <div class="text-center space-y-2">
          <h2 class="text-2xl font-bold tracking-tight">Split PDF Pages</h2>
          <p class="text-sm text-slate-500">Visually preview and extract pages, split by custom ranges, or separate every page into individual files.</p>
        </div>

        <div id="split-dropzone" class="dropzone p-8 rounded-2xl text-center cursor-pointer hover:border-red-500 transition">
          <input type="file" id="split-file-input" accept="application/pdf" class="hidden">
          <div class="flex flex-col items-center gap-3">
            <div class="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center">
              <i data-lucide="scissors" class="w-8 h-8"></i>
            </div>
            <div>
              <p class="font-semibold text-slate-700 dark:text-slate-200">Click to upload or drag & drop a PDF</p>
              <p class="text-xs text-slate-400 mt-1" id="split-file-status">Select 1 PDF document to preview and split</p>
            </div>
          </div>
        </div>

        <div id="split-workspace" class="space-y-4 hidden">
          <!-- Main Toolbar -->
          <div class="flex flex-wrap items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm gap-4">
            
            <!-- Mode Switcher -->
            <div class="flex flex-wrap items-center bg-slate-100 dark:bg-slate-900 rounded-xl p-1 border border-slate-200 dark:border-slate-700 text-xs gap-1">
              <button id="split-tab-ranges" class="px-3 py-1.5 rounded-lg font-bold bg-white dark:bg-slate-800 text-red-600 shadow-xs transition flex items-center gap-1.5">
                <i data-lucide="git-commit" class="w-3.5 h-3.5"></i>
                <span>Custom Ranges</span>
              </button>
              <button id="split-tab-all" class="px-3 py-1.5 rounded-lg font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition flex items-center gap-1.5">
                <i data-lucide="files" class="w-3.5 h-3.5"></i>
                <span>Extract All Pages</span>
              </button>
              <button id="split-tab-selected" class="px-3 py-1.5 rounded-lg font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition flex items-center gap-1.5">
                <i data-lucide="check-square" class="w-3.5 h-3.5"></i>
                <span>Extract Selected</span>
              </button>
              <button id="split-tab-fixed" class="px-3 py-1.5 rounded-lg font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition flex items-center gap-1.5">
                <i data-lucide="layers" class="w-3.5 h-3.5"></i>
                <span>Every N Pages</span>
              </button>
            </div>

            <!-- Page Selection Quick Actions -->
            <div class="flex items-center gap-1.5">
              <button id="split-select-all" class="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 transition" title="Select all pages">
                Select All
              </button>
              <button id="split-deselect-all" class="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 transition" title="Clear selection">
                Clear
              </button>
              <button id="split-invert" class="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 transition" title="Invert selection">
                Invert
              </button>
            </div>

            <!-- Zoom & Action Buttons -->
            <div class="flex items-center gap-2.5">
              <div class="flex items-center gap-1 text-xs font-semibold text-slate-500 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1">
                <span>Zoom:</span>
                <button id="split-scale-down" class="p-0.5 hover:text-red-600 font-bold" title="Smaller Thumbnails">A-</button>
                <button id="split-scale-up" class="p-0.5 hover:text-red-600 font-bold" title="Larger Thumbnails">A+</button>
              </div>
              <button id="split-close-btn" class="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold transition flex items-center gap-1" title="Close Preview">
                <i data-lucide="x" class="w-3.5 h-3.5 text-slate-500"></i>
                <span>Close</span>
              </button>
              <button id="split-run-btn" class="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-lg shadow-red-600/20 transition flex items-center gap-2">
                <i data-lucide="scissors" class="w-4 h-4"></i>
                <span id="split-run-label">Split PDF</span>
              </button>
            </div>
          </div>

          <!-- Secondary Toolbar: Range Input Panel -->
          <div id="split-range-panel" class="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center gap-2 flex-1 min-w-[280px]">
              <label class="text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0 flex items-center gap-1.5">
                <i data-lucide="split" class="w-3.5 h-3.5 text-red-500"></i>
                <span>Page Ranges:</span>
              </label>
              <input type="text" id="split-range-input" class="flex-1 px-3 py-1.5 text-xs font-mono font-bold rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-red-500 outline-none" placeholder="e.g. 1-2, 3-5, 6">
            </div>
            <div id="split-range-chips" class="flex items-center gap-1.5 flex-wrap text-xs"></div>
          </div>

          <!-- Secondary Toolbar: Fixed Batch Size Panel -->
          <div id="split-fixed-panel" class="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3 hidden">
            <span class="text-xs font-bold text-slate-700 dark:text-slate-300">Split into batches of:</span>
            <input type="number" id="split-fixed-num" min="1" max="100" value="2" class="w-16 px-2.5 py-1 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 outline-none text-center">
            <span class="text-xs text-slate-500">pages per document</span>
          </div>

          <!-- Hint & Count Summary -->
          <div class="flex items-center justify-between text-xs text-slate-500 px-1">
            <span id="split-instructions-hint" class="flex items-center gap-1.5">
              <i data-lucide="info" class="w-3.5 h-3.5 text-red-500"></i>
              <span>Click on any page card below to toggle selection or define ranges.</span>
            </span>
            <span id="split-count-badge" class="font-bold text-slate-700 dark:text-slate-300">0 Pages</span>
          </div>

          <!-- High-Fidelity Page Preview Grid -->
          <div id="split-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"></div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const dropzone = container.querySelector('#split-dropzone');
    const input = container.querySelector('#split-file-input');
    const statusEl = container.querySelector('#split-file-status');
    const workspace = container.querySelector('#split-workspace');
    const grid = container.querySelector('#split-grid');
    const runBtn = container.querySelector('#split-run-btn');
    const runLabel = container.querySelector('#split-run-label');
    const closeBtn = container.querySelector('#split-close-btn');
    const countBadge = container.querySelector('#split-count-badge');
    const rangePanel = container.querySelector('#split-range-panel');
    const rangeInput = container.querySelector('#split-range-input');
    const rangeChips = container.querySelector('#split-range-chips');
    const fixedPanel = container.querySelector('#split-fixed-panel');
    const fixedNumInput = container.querySelector('#split-fixed-num');
    const tabRanges = container.querySelector('#split-tab-ranges');
    const tabAll = container.querySelector('#split-tab-all');
    const tabSelected = container.querySelector('#split-tab-selected');
    const tabFixed = container.querySelector('#split-tab-fixed');
    const selectAllBtn = container.querySelector('#split-select-all');
    const deselectAllBtn = container.querySelector('#split-deselect-all');
    const invertBtn = container.querySelector('#split-invert');
    const scaleUp = container.querySelector('#split-scale-up');
    const scaleDown = container.querySelector('#split-scale-down');
    const hintSpan = container.querySelector('#split-instructions-hint');

    // Scale thumbnails
    if (scaleUp && scaleDown) {
      scaleUp.addEventListener('click', () => {
        gridColsClass = 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6';
        grid.className = `grid ${gridColsClass}`;
      });
      scaleDown.addEventListener('click', () => {
        gridColsClass = 'grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3';
        grid.className = `grid ${gridColsClass}`;
      });
    }

    // Close preview
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        currentBuffer = null;
        currentFile = null;
        pdfDoc = null;
        pageItems = [];
        workspace.classList.add('hidden');
        dropzone.classList.remove('hidden');
        grid.innerHTML = '';
        input.value = '';
      });
    }

    // Switch mode
    const setSplitMode = (mode) => {
      splitMode = mode;
      const allTabs = [
        { el: tabRanges, id: 'ranges' },
        { el: tabAll, id: 'all' },
        { el: tabSelected, id: 'selected' },
        { el: tabFixed, id: 'fixed' }
      ];

      allTabs.forEach(t => {
        if (t.id === mode) {
          t.el.className = 'px-3 py-1.5 rounded-lg font-bold bg-white dark:bg-slate-800 text-red-600 shadow-xs transition flex items-center gap-1.5';
        } else {
          t.el.className = 'px-3 py-1.5 rounded-lg font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition flex items-center gap-1.5';
        }
      });

      rangePanel.classList.toggle('hidden', mode !== 'ranges');
      fixedPanel.classList.toggle('hidden', mode !== 'fixed');

      if (mode === 'all') {
        runLabel.innerText = `Extract All (${totalPages} Files)`;
        hintSpan.innerHTML = `<svg class="w-3.5 h-3.5 text-red-500 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> Every page will be saved as an individual PDF in a ZIP bundle.`;
      } else if (mode === 'selected') {
        const count = pageItems.filter(p => p.selected).length;
        runLabel.innerText = `Extract Selected (${count} Pages)`;
        hintSpan.innerHTML = `<svg class="w-3.5 h-3.5 text-red-500 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> Click pages below to choose which ones to export into a new PDF.`;
      } else if (mode === 'fixed') {
        const n = parseInt(fixedNumInput.value, 10) || 2;
        const totalBatches = Math.ceil(totalPages / n);
        runLabel.innerText = `Split into ${totalBatches} Parts`;
        hintSpan.innerHTML = `<svg class="w-3.5 h-3.5 text-red-500 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> Document will be partitioned every ${n} pages.`;
      } else {
        runLabel.innerText = 'Split by Ranges';
        hintSpan.innerHTML = `<svg class="w-3.5 h-3.5 text-red-500 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> Type ranges (e.g. 1-2, 3-5) or click pages below to toggle ranges.`;
      }

      updatePageCardsStyling();
    };

    tabRanges.addEventListener('click', () => setSplitMode('ranges'));
    tabAll.addEventListener('click', () => setSplitMode('all'));
    tabSelected.addEventListener('click', () => setSplitMode('selected'));
    tabFixed.addEventListener('click', () => setSplitMode('fixed'));

    fixedNumInput.addEventListener('input', () => {
      fixedBatchSize = Math.max(1, parseInt(fixedNumInput.value, 10) || 1);
      setSplitMode('fixed');
    });

    // Parse current range string into page-to-range mapping
    const getRangeMap = () => {
      const map = new Map(); // pageNum -> { rangeIndex, rangeStr }
      const str = rangeInput.value.trim();
      if (!str) return map;

      const parts = str.split(',').map(s => s.trim()).filter(Boolean);
      parts.forEach((part, rIdx) => {
        if (part.includes('-')) {
          const [s, e] = part.split('-').map(n => parseInt(n.trim(), 10));
          if (!isNaN(s) && !isNaN(e)) {
            for (let p = Math.min(s, e); p <= Math.max(s, e); p++) {
              if (p >= 1 && p <= totalPages) {
                map.set(p, { rangeIndex: rIdx + 1, rangeStr: part });
              }
            }
          }
        } else {
          const p = parseInt(part, 10);
          if (!isNaN(p) && p >= 1 && p <= totalPages) {
            map.set(p, { rangeIndex: rIdx + 1, rangeStr: `${p}` });
          }
        }
      });
      return map;
    };

    // Update range chips preview
    const updateRangeChips = () => {
      const str = rangeInput.value.trim();
      const parts = str.split(',').map(s => s.trim()).filter(Boolean);
      rangeChips.innerHTML = parts.map((part, i) => `
        <span class="px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 font-bold font-mono text-[11px] flex items-center gap-1">
          <span>Part ${i + 1}: ${part}</span>
        </span>
      `).join('');
    };

    rangeInput.addEventListener('input', () => {
      updateRangeChips();
      updatePageCardsStyling();
    });

    // Update styling and badges on all page cards based on active mode
    const updatePageCardsStyling = () => {
      const rangeMap = getRangeMap();
      const n = parseInt(fixedNumInput.value, 10) || 2;

      pageItems.forEach((item) => {
        const card = item.cardEl;
        if (!card) return;

        const badge = card.querySelector('.page-split-badge');
        const checkIcon = card.querySelector('.check-indicator');

        if (splitMode === 'all') {
          card.classList.remove('opacity-40', 'ring-2', 'ring-red-500');
          if (badge) {
            badge.innerText = `Part ${item.pageNum}`;
            badge.className = 'page-split-badge text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800';
          }
          if (checkIcon) checkIcon.classList.remove('hidden');
        } else if (splitMode === 'selected') {
          card.classList.toggle('opacity-40', !item.selected);
          card.classList.toggle('ring-2', item.selected);
          card.classList.toggle('ring-red-500', item.selected);
          if (badge) {
            badge.innerText = item.selected ? 'Selected' : 'Skipped';
            badge.className = `page-split-badge text-[10px] font-bold px-1.5 py-0.5 rounded ${
              item.selected 
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200' 
                : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
            }`;
          }
          if (checkIcon) checkIcon.classList.toggle('hidden', !item.selected);
        } else if (splitMode === 'fixed') {
          const batchIdx = Math.floor((item.pageNum - 1) / n) + 1;
          card.classList.remove('opacity-40', 'ring-2', 'ring-red-500');
          if (badge) {
            badge.innerText = `Part ${batchIdx}`;
            const colors = [
              'bg-purple-50 text-purple-700 border-purple-200',
              'bg-indigo-50 text-indigo-700 border-indigo-200',
              'bg-amber-50 text-amber-700 border-amber-200',
              'bg-emerald-50 text-emerald-700 border-emerald-200'
            ];
            const col = colors[(batchIdx - 1) % colors.length];
            badge.className = `page-split-badge text-[10px] font-bold px-1.5 py-0.5 rounded border ${col}`;
          }
          if (checkIcon) checkIcon.classList.remove('hidden');
        } else {
          // Custom Ranges Mode
          const rInfo = rangeMap.get(item.pageNum);
          const inRange = !!rInfo;
          card.classList.toggle('opacity-40', !inRange);
          card.classList.toggle('ring-2', inRange);
          card.classList.toggle('ring-red-500', inRange);
          if (badge) {
            badge.innerText = inRange ? `Part ${rInfo.rangeIndex}` : 'Unassigned';
            badge.className = `page-split-badge text-[10px] font-bold px-1.5 py-0.5 rounded ${
              inRange 
                ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200' 
                : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
            }`;
          }
          if (checkIcon) checkIcon.classList.toggle('hidden', !inRange);
        }
      });
    };

    // Selection Shortcuts
    selectAllBtn.addEventListener('click', () => {
      pageItems.forEach(p => p.selected = true);
      rangeInput.value = `1-${totalPages}`;
      updateRangeChips();
      updatePageCardsStyling();
      if (splitMode === 'selected') setSplitMode('selected');
    });

    deselectAllBtn.addEventListener('click', () => {
      pageItems.forEach(p => p.selected = false);
      rangeInput.value = '';
      updateRangeChips();
      updatePageCardsStyling();
      if (splitMode === 'selected') setSplitMode('selected');
    });

    invertBtn.addEventListener('click', () => {
      pageItems.forEach(p => p.selected = !p.selected);
      // Rebuild range string from inverted selection
      const selPages = pageItems.filter(p => p.selected).map(p => p.pageNum);
      rangeInput.value = selPages.join(', ');
      updateRangeChips();
      updatePageCardsStyling();
      if (splitMode === 'selected') setSplitMode('selected');
    });

    // Helper: Ingest uploaded PDF file and render all page preview thumbnails
    const loadPdfDocument = async (file) => {
      currentFile = file;
      statusEl.innerText = `${file.name} (${window.pdfEngine.formatBytes(file.size)})`;
      UI.showProgress(0.1, 'Loading document structure...');

      try {
        currentBuffer = await window.pdfEngine.readFileAsArrayBuffer(file);
        pdfDoc = await window.pdfEngine.getPdfJsDoc(window.pdfEngine.cloneBuffer(currentBuffer));
        totalPages = pdfDoc.numPages;
        countBadge.innerText = `${totalPages} Pages`;

        // Pre-fill range input with intuitive initial range
        rangeInput.value = totalPages <= 4 ? Array.from({length: totalPages}, (_, i) => i + 1).join(', ') : `1-2, 3-${totalPages}`;
        updateRangeChips();

        workspace.classList.remove('hidden');
        dropzone.classList.add('hidden');
        grid.innerHTML = '';
        pageItems = [];

        UI.showProgress(0.2, `Generating page previews (1 of ${totalPages})...`);

        for (let i = 1; i <= totalPages; i++) {
          UI.showProgress(0.2 + (i / totalPages) * 0.75, `Rendering page ${i} of ${totalPages}...`);
          const canvas = document.createElement('canvas');
          await window.pdfEngine.renderPageToCanvas(pdfDoc, i, canvas, 200);

          const card = document.createElement('div');
          card.className = 'page-thumb-card group relative bg-white dark:bg-slate-800 rounded-2xl p-2.5 shadow-sm border border-slate-200 dark:border-slate-700 hover:border-red-400 hover:shadow-md flex flex-col items-center transition-all select-none cursor-pointer';
          card.dataset.pageNum = i;

          // Header
          const header = document.createElement('div');
          header.className = 'w-full flex items-center justify-between mb-1.5 text-xs font-bold text-slate-700 dark:text-slate-300';
          header.innerHTML = `
            <div class="flex items-center gap-1.5">
              <span class="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center text-[11px] font-extrabold check-indicator">
                <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
              </span>
              <span class="text-xs font-bold">Page ${i}</span>
            </div>
            <span class="page-split-badge text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">Part 1</span>
          `;
          card.appendChild(header);

          // Canvas Container
          const canvasWrapper = document.createElement('div');
          canvasWrapper.className = 'w-full flex-1 flex items-center justify-center overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-1 min-h-[160px]';
          canvasWrapper.appendChild(canvas);
          card.appendChild(canvasWrapper);

          // Card Click Action (Toggles page in range or selection)
          card.addEventListener('click', () => {
            const item = pageItems[i - 1];
            item.selected = !item.selected;

            if (splitMode === 'ranges') {
              // Add or remove page from range string
              const curStr = rangeInput.value.trim();
              const rangeMap = getRangeMap();
              if (rangeMap.has(i)) {
                // remove page
                const parts = curStr.split(',').map(s => s.trim()).filter(Boolean);
                const newParts = parts.filter(p => p !== `${i}` && !p.startsWith(`${i}-`) && !p.endsWith(`-${i}`));
                rangeInput.value = newParts.join(', ');
              } else {
                // add page
                rangeInput.value = curStr ? `${curStr}, ${i}` : `${i}`;
              }
              updateRangeChips();
            } else if (splitMode === 'selected') {
              const count = pageItems.filter(p => p.selected).length;
              runLabel.innerText = `Extract Selected (${count} Pages)`;
            }

            updatePageCardsStyling();
          });

          grid.appendChild(card);
          pageItems.push({
            pageNum: i,
            canvasEl: canvas,
            cardEl: card,
            selected: true
          });
        }

        UI.hideProgress();
        setSplitMode('ranges');
      } catch (err) {
        console.error('Error loading PDF for split:', err);
        UI.hideProgress();
        UI.showToast(`Failed to parse PDF: ${err.message}`, 'error');
      }
    };

    // Dropzone setup
    UI.setupDropzone(dropzone, input, (files) => {
      if (files.length > 0) loadPdfDocument(files[0]);
    });

    // Execute Split
    runBtn.addEventListener('click', async () => {
      if (!currentBuffer || !pdfDoc) {
        UI.showToast('Please upload a PDF document first.', 'error');
        return;
      }

      try {
        let results = [];

        if (splitMode === 'all') {
          UI.showProgress(0.1, `Extracting all ${totalPages} pages into individual PDFs...`);
          results = await window.pdfEngine.splitPDF(window.pdfEngine.cloneBuffer(currentBuffer), 'all', (pct, status) => {
            UI.showProgress(pct, status);
          });
        } else if (splitMode === 'selected') {
          const selectedIndices = pageItems.filter(p => p.selected).map(p => p.pageNum - 1);
          if (selectedIndices.length === 0) {
            UI.showToast('Please select at least one page to extract.', 'error');
            return;
          }
          UI.showProgress(0.2, `Extracting ${selectedIndices.length} selected pages...`);
          const singleBlob = await window.pdfEngine.extractPages(window.pdfEngine.cloneBuffer(currentBuffer), selectedIndices);
          UI.hideProgress();
          UI.celebrate();
          UI.showToast('Selected pages extracted successfully!', 'success');
          UI.showResultPreview({
            title: 'Pages Extracted Successfully',
            subtitle: `${selectedIndices.length} page(s) combined into unified clean PDF`,
            blob: singleBlob,
            filename: `${currentFile.name.replace(/\.pdf$/i, '')}_extracted.pdf`
          });
          return;
        } else if (splitMode === 'fixed') {
          const n = parseInt(fixedNumInput.value, 10) || 2;
          const rangeParts = [];
          for (let start = 1; start <= totalPages; start += n) {
            const end = Math.min(start + n - 1, totalPages);
            rangeParts.push(start === end ? `${start}` : `${start}-${end}`);
          }
          const fixedRangeStr = rangeParts.join(', ');
          UI.showProgress(0.1, `Splitting into ${rangeParts.length} parts...`);
          results = await window.pdfEngine.splitPDF(window.pdfEngine.cloneBuffer(currentBuffer), fixedRangeStr, (pct, status) => {
            UI.showProgress(pct, status);
          });
        } else {
          // Custom Ranges Mode
          const rStr = rangeInput.value.trim();
          if (!rStr) {
            UI.showToast('Please specify valid page ranges (e.g. 1-2, 3-5).', 'error');
            return;
          }
          UI.showProgress(0.1, `Splitting PDF according to ranges (${rStr})...`);
          results = await window.pdfEngine.splitPDF(window.pdfEngine.cloneBuffer(currentBuffer), rStr, (pct, status) => {
            UI.showProgress(pct, status);
          });
        }

        UI.hideProgress();

        if (!results || results.length === 0) {
          UI.showToast('No pages matched the specified ranges.', 'warning');
          return;
        }

        UI.celebrate();
        UI.showToast(`Successfully generated ${results.length} split PDF file(s)!`, 'success');

        if (results.length === 1) {
          UI.showResultPreview({
            title: 'Split Document Ready',
            subtitle: 'Single split document ready for inspection before download',
            blob: results[0].blob,
            filename: results[0].name
          });
        } else {
          UI.showProgress(0.9, 'Packaging split files into ZIP archive...');
          const zipBlob = await window.pdfEngine.createZip(results);
          UI.hideProgress();
          UI.showResultPreview({
            title: 'Split PDF Archive Ready',
            subtitle: `${results.length} separate documents bundled into ZIP archive`,
            blob: zipBlob,
            filename: `${currentFile.name.replace(/\.pdf$/i, '')}_split_bundle.zip`
          });
        }
      } catch (err) {
        UI.hideProgress();
        console.error('Split error:', err);
        UI.showToast(`Split failed: ${err.message}`, 'error');
      }
    });
  },

  // 3. REMOVE PAGES
  renderRemovePages(container) {
    let currentBuffer = null;
    let currentFile = null;
    let pageStates = [];

    container.innerHTML = `
      <div class="max-w-4xl mx-auto space-y-6">
        <div class="text-center space-y-2">
          <h2 class="text-2xl font-bold tracking-tight">Remove PDF Pages</h2>
          <p class="text-sm text-slate-500">Select the pages you wish to delete from your PDF document.</p>
        </div>

        <div id="remove-dropzone" class="dropzone p-8 rounded-2xl text-center cursor-pointer hover:border-red-500 transition">
          <input type="file" id="remove-file-input" accept="application/pdf" class="hidden">
          <div class="flex flex-col items-center gap-3">
            <div class="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center">
              <i data-lucide="trash" class="w-8 h-8"></i>
            </div>
            <p class="font-semibold text-slate-700 dark:text-slate-200">Upload PDF to select pages to remove</p>
          </div>
        </div>

        <div id="remove-workspace" class="space-y-4 hidden">
          <div class="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <span id="remove-summary" class="text-sm font-medium text-slate-700">Click on pages below to mark them for removal</span>
            <div class="flex items-center gap-3">
              <div class="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1">
                <span>Zoom:</span>
                <button id="remove-scale-down" class="p-1 hover:text-red-600 font-bold" title="Smaller Thumbnails">A-</button>
                <button id="remove-scale-up" class="p-1 hover:text-red-600 font-bold" title="Larger Thumbnails">A+</button>
              </div>
              <button id="remove-close-btn" class="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-sm font-medium transition flex items-center gap-1.5" title="Close Preview & choose another file">
                <i data-lucide="x" class="w-4 h-4 text-slate-500"></i>
                <span>Close Preview</span>
              </button>
              <button id="remove-run-btn" class="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-sm shadow transition flex items-center gap-2">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
                <span>Remove Selected Pages</span>
              </button>
            </div>
          </div>
          <div id="remove-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"></div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const dropzone = container.querySelector('#remove-dropzone');
    const input = container.querySelector('#remove-file-input');
    const workspace = container.querySelector('#remove-workspace');
    const grid = container.querySelector('#remove-grid');
    const summary = container.querySelector('#remove-summary');
    const runBtn = container.querySelector('#remove-run-btn');
    const removeCloseBtn = container.querySelector('#remove-close-btn');
    const scaleUp = container.querySelector('#remove-scale-up');
    const scaleDown = container.querySelector('#remove-scale-down');

    if (scaleUp && scaleDown) {
      scaleUp.addEventListener('click', () => {
        grid.className = 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6';
      });
      scaleDown.addEventListener('click', () => {
        grid.className = 'grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3';
      });
    }

    if (removeCloseBtn) {
      removeCloseBtn.addEventListener('click', () => {
        currentBuffer = null;
        currentFile = null;
        pageStates = [];
        workspace.classList.add('hidden');
        dropzone.classList.remove('hidden');
        grid.innerHTML = '';
        input.value = '';
      });
    }

    UI.setupDropzone(dropzone, input, async (files) => {
      if (files.length === 0) return;
      currentFile = files[0];
      currentBuffer = await window.pdfEngine.readFileAsArrayBuffer(currentFile);
      workspace.classList.remove('hidden');
      pageStates = await UI.renderPdfThumbnails(window.pdfEngine.cloneBuffer(currentBuffer), grid, {
        selectable: true,
        onSelectionChange: (states) => {
          pageStates = states;
          const count = states.filter(s => s.selected).length;
          summary.innerText = count > 0 ? `${count} page(s) marked for removal` : 'Click on pages below to mark for removal';
        }
      });
    });

    runBtn.addEventListener('click', async () => {
      const toRemove = pageStates.filter(s => s.selected).map(s => s.originalIndex);
      if (toRemove.length === 0) {
        UI.showToast('Please select at least one page to remove.', 'error');
        return;
      }

      try {
        UI.showProgress(0.3, 'Removing pages...');
        const bufferToUse = currentBuffer.byteLength > 0 ? currentBuffer : await currentFile.arrayBuffer();
        const resultBlob = await window.pdfEngine.removePages(window.pdfEngine.cloneBuffer(bufferToUse), toRemove);
        UI.hideProgress();
        UI.celebrate();
        UI.showToast('Pages removed successfully!', 'success');
        UI.showResultPreview({
          title: 'Pages Removed Successfully',
          subtitle: `Removed ${toRemove.length} page(s). Inspect remaining pages before saving`,
          blob: resultBlob,
          filename: `${currentFile ? currentFile.name.replace(/\.pdf$/i, '') : 'document'}_cleaned.pdf`
        });
      } catch (err) {
        UI.hideProgress();
        UI.showToast(err.message, 'error');
      }
    });
  },

  // 4. EXTRACT PAGES
  renderExtractPages(container) {
    let currentBuffer = null;
    let currentFile = null;
    let pageStates = [];

    container.innerHTML = `
      <div class="max-w-4xl mx-auto space-y-6">
        <div class="text-center space-y-2">
          <h2 class="text-2xl font-bold tracking-tight">Extract PDF Pages</h2>
          <p class="text-sm text-slate-500">Pick and choose the exact pages you want to keep and export into a new document.</p>
        </div>

        <div id="extract-dropzone" class="dropzone p-8 rounded-2xl text-center cursor-pointer hover:border-red-500 transition">
          <input type="file" id="extract-file-input" accept="application/pdf" class="hidden">
          <div class="flex flex-col items-center gap-3">
            <div class="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center">
              <i data-lucide="folder-output" class="w-8 h-8"></i>
            </div>
            <p class="font-semibold text-slate-700 dark:text-slate-200">Upload PDF to select pages to extract</p>
          </div>
        </div>

        <div id="extract-workspace" class="space-y-4 hidden">
          <div class="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <span id="extract-summary" class="text-sm font-medium text-slate-700">Click on pages to select for extraction</span>
            <div class="flex items-center gap-3">
              <div class="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1">
                <span>Zoom:</span>
                <button id="extract-scale-down" class="p-1 hover:text-red-600 font-bold" title="Smaller Thumbnails">A-</button>
                <button id="extract-scale-up" class="p-1 hover:text-red-600 font-bold" title="Larger Thumbnails">A+</button>
              </div>
              <button id="extract-close-btn" class="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-sm font-medium transition flex items-center gap-1.5" title="Close Preview & choose another file">
                <i data-lucide="x" class="w-4 h-4 text-slate-500"></i>
                <span>Close Preview</span>
              </button>
              <button id="extract-run-btn" class="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-sm shadow transition flex items-center gap-2">
                <i data-lucide="download" class="w-4 h-4"></i>
                <span>Extract Selected Pages</span>
              </button>
            </div>
          </div>
          <div id="extract-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"></div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const dropzone = container.querySelector('#extract-dropzone');
    const input = container.querySelector('#extract-file-input');
    const workspace = container.querySelector('#extract-workspace');
    const grid = container.querySelector('#extract-grid');
    const summary = container.querySelector('#extract-summary');
    const runBtn = container.querySelector('#extract-run-btn');
    const extractCloseBtn = container.querySelector('#extract-close-btn');
    const scaleUp = container.querySelector('#extract-scale-up');
    const scaleDown = container.querySelector('#extract-scale-down');

    if (scaleUp && scaleDown) {
      scaleUp.addEventListener('click', () => {
        grid.className = 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6';
      });
      scaleDown.addEventListener('click', () => {
        grid.className = 'grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3';
      });
    }

    if (extractCloseBtn) {
      extractCloseBtn.addEventListener('click', () => {
        currentBuffer = null;
        currentFile = null;
        pageStates = [];
        workspace.classList.add('hidden');
        dropzone.classList.remove('hidden');
        grid.innerHTML = '';
        input.value = '';
      });
    }

    UI.setupDropzone(dropzone, input, async (files) => {
      if (files.length === 0) return;
      currentFile = files[0];
      currentBuffer = await window.pdfEngine.readFileAsArrayBuffer(currentFile);
      workspace.classList.remove('hidden');
      pageStates = await UI.renderPdfThumbnails(window.pdfEngine.cloneBuffer(currentBuffer), grid, {
        selectable: true,
        onSelectionChange: (states) => {
          pageStates = states;
          const count = states.filter(s => s.selected).length;
          summary.innerText = count > 0 ? `${count} page(s) selected for extraction` : 'Click on pages to select for extraction';
        }
      });
    });

    runBtn.addEventListener('click', async () => {
      const toExtract = pageStates.filter(s => s.selected).map(s => s.originalIndex);
      if (toExtract.length === 0) {
        UI.showToast('Please select at least one page to extract.', 'error');
        return;
      }

      try {
        UI.showProgress(0.3, 'Extracting selected pages...');
        const bufferToUse = currentBuffer.byteLength > 0 ? currentBuffer : await currentFile.arrayBuffer();
        const resultBlob = await window.pdfEngine.extractPages(window.pdfEngine.cloneBuffer(bufferToUse), toExtract);
        UI.hideProgress();
        UI.celebrate();
        UI.showToast('Pages extracted successfully!', 'success');
        UI.showResultPreview({
          title: 'Pages Extracted Successfully',
          subtitle: `${toExtract.length} page(s) extracted into new document`,
          blob: resultBlob,
          filename: `${currentFile ? currentFile.name.replace(/\.pdf$/i, '') : 'document'}_extracted.pdf`
        });
      } catch (err) {
        UI.hideProgress();
        UI.showToast(err.message, 'error');
      }
    });
  },

  // 5. ORGANIZE PDF (Swap, Reorder, Rotate & Remove Pages)
  renderOrganize(container) {
    let currentBuffer = null;
    let currentFile = null;
    let pageItems = []; // Array of { originalIndex, originalPageNumber, rotation, deleted, canvasEl }

    container.innerHTML = `
      <div class="max-w-5xl mx-auto space-y-6">
        <div class="text-center space-y-2">
          <h2 class="text-2xl font-bold tracking-tight">Organize PDF & Swap Pages</h2>
          <p class="text-sm text-slate-500">Swap, drag & drop to reorder, rotate, or delete pages in your PDF document.</p>
        </div>

        <div id="org-dropzone" class="dropzone p-8 rounded-2xl text-center cursor-pointer hover:border-orange-500 transition">
          <input type="file" id="org-file-input" accept="application/pdf" class="hidden">
          <div class="flex flex-col items-center gap-3">
            <div class="w-16 h-16 rounded-full bg-orange-50 dark:bg-orange-950/40 text-orange-600 flex items-center justify-center">
              <i data-lucide="layout-grid" class="w-8 h-8"></i>
            </div>
            <div>
              <p class="font-semibold text-slate-700 dark:text-slate-200">Upload PDF to reorganize or swap pages</p>
              <p class="text-xs text-slate-400 mt-1" id="org-file-status">Drag & drop or select a PDF</p>
            </div>
          </div>
        </div>

        <div id="org-workspace" class="space-y-4 hidden">
          <!-- Main Action & Swap Toolbar -->
          <div class="flex flex-wrap items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm gap-4">
            
            <!-- Quick Page Swapper Bar -->
            <div class="flex items-center gap-2 p-2 bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-xl">
              <span class="text-xs font-bold text-orange-800 dark:text-orange-300 flex items-center gap-1.5 whitespace-nowrap">
                <i data-lucide="arrow-left-right" class="w-4 h-4 text-orange-600"></i>
                Swap:
              </span>
              <select id="org-swap-from" class="text-xs font-bold p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none">
              </select>
              <span class="text-xs font-bold text-orange-600">⇄</span>
              <select id="org-swap-to" class="text-xs font-bold p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none">
              </select>
              <button id="org-swap-btn" class="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1">
                <span>Swap</span>
              </button>
            </div>

            <!-- Page Quick Actions -->
            <div class="flex items-center gap-2">
              <button id="org-reverse-btn" class="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5" title="Reverse the entire page order">
                <i data-lucide="refresh-cw" class="w-3.5 h-3.5 text-slate-500"></i>
                <span>Reverse Order</span>
              </button>
              <button id="org-reset-btn" class="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5" title="Reset back to original order">
                <i data-lucide="rotate-ccw" class="w-3.5 h-3.5 text-slate-500"></i>
                <span>Reset Order</span>
              </button>
            </div>

            <!-- Zoom & Controls -->
            <div class="flex items-center gap-2.5">
              <div class="flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1">
                <span>Zoom:</span>
                <button id="org-scale-down" class="p-1 hover:text-orange-600 font-bold" title="Smaller Thumbnails">A-</button>
                <button id="org-scale-up" class="p-1 hover:text-orange-600 font-bold" title="Larger Thumbnails">A+</button>
              </div>
              <button id="org-close-btn" class="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 hover:bg-slate-100 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1" title="Close Preview">
                <i data-lucide="x" class="w-3.5 h-3.5 text-slate-500"></i>
                <span>Close</span>
              </button>
              <button id="org-run-btn" class="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md shadow-orange-600/20 transition flex items-center gap-2">
                <i data-lucide="save" class="w-4 h-4"></i>
                <span>Save PDF</span>
              </button>
            </div>
          </div>

          <!-- Instructions Hint -->
          <div class="flex items-center justify-between text-xs text-slate-500 px-1">
            <span class="flex items-center gap-1.5">
              <i data-lucide="info" class="w-3.5 h-3.5 text-orange-500"></i>
              Drag any card to reorder, or use the <strong>← / →</strong> buttons on cards to swap with adjacent pages.
            </span>
            <span id="org-page-count-badge" class="font-bold text-slate-700 dark:text-slate-300">0 Pages</span>
          </div>

          <!-- Interactive Thumbnails Grid -->
          <div id="org-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"></div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const dropzone = container.querySelector('#org-dropzone');
    const input = container.querySelector('#org-file-input');
    const statusEl = container.querySelector('#org-file-status');
    const workspace = container.querySelector('#org-workspace');
    const grid = container.querySelector('#org-grid');
    const runBtn = container.querySelector('#org-run-btn');
    const orgCloseBtn = container.querySelector('#org-close-btn');
    const scaleUp = container.querySelector('#org-scale-up');
    const scaleDown = container.querySelector('#org-scale-down');
    const swapFrom = container.querySelector('#org-swap-from');
    const swapTo = container.querySelector('#org-swap-to');
    const swapBtn = container.querySelector('#org-swap-btn');
    const reverseBtn = container.querySelector('#org-reverse-btn');
    const resetBtn = container.querySelector('#org-reset-btn');
    const countBadge = container.querySelector('#org-page-count-badge');

    if (scaleUp && scaleDown) {
      scaleUp.addEventListener('click', () => {
        grid.className = 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6';
      });
      scaleDown.addEventListener('click', () => {
        grid.className = 'grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3';
      });
    }

    if (orgCloseBtn) {
      orgCloseBtn.addEventListener('click', () => {
        currentBuffer = null;
        currentFile = null;
        pageItems = [];
        workspace.classList.add('hidden');
        dropzone.classList.remove('hidden');
        grid.innerHTML = '';
        input.value = '';
      });
    }

    // Update Swap Dropdowns
    const updateSwapDropdowns = () => {
      const activePages = pageItems.map((item, idx) => ({ idx, pos: idx + 1, orig: item.originalPageNumber, deleted: item.deleted }));
      swapFrom.innerHTML = '';
      swapTo.innerHTML = '';

      activePages.forEach(({ idx, pos, orig, deleted }) => {
        if (deleted) return;
        const optFrom = document.createElement('option');
        optFrom.value = idx;
        optFrom.innerText = `Page ${pos} (Orig #${orig})`;
        swapFrom.appendChild(optFrom);

        const optTo = document.createElement('option');
        optTo.value = idx;
        optTo.innerText = `Page ${pos} (Orig #${orig})`;
        swapTo.appendChild(optTo);
      });

      // Default second dropdown to second page if available
      if (swapTo.options.length > 1) {
        swapTo.selectedIndex = 1;
      }
    };

    // Render Grid Cards with Full Drag-and-Drop & Arrow Swapping
    const renderGrid = () => {
      grid.innerHTML = '';
      const totalActive = pageItems.filter(p => !p.deleted).length;
      countBadge.innerText = `${totalActive} Active Pages (${pageItems.length} Total)`;

      let dragSourceIdx = null;

      pageItems.forEach((item, index) => {
        const card = document.createElement('div');
        card.draggable = !item.deleted;
        card.dataset.index = index;
        card.className = `page-thumb-card group relative bg-white dark:bg-slate-800 rounded-xl p-3 shadow-sm border ${
          item.deleted ? 'border-red-300 dark:border-red-900 opacity-40 bg-red-50/20' : 'border-slate-200 dark:border-slate-700 hover:border-orange-400 hover:shadow-md'
        } flex flex-col items-center transition-all duration-150`;

        // Card Header: Badge & Move Controls
        const header = document.createElement('div');
        header.className = 'w-full flex items-center justify-between mb-2 text-xs font-bold text-slate-700 dark:text-slate-300';
        
        const isMoved = item.originalIndex !== index;
        header.innerHTML = `
          <div class="flex items-center gap-1.5 cursor-grab active:cursor-grabbing" title="Drag to reorder/swap">
            <span class="w-5 h-5 rounded-md bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 flex items-center justify-center text-[11px] font-extrabold">
              ${index + 1}
            </span>
            ${isMoved ? `<span class="text-[10px] text-slate-400 font-medium">(#${item.originalPageNumber})</span>` : ''}
          </div>
          <div class="flex items-center gap-0.5">
            <button class="move-left-btn p-1 hover:bg-orange-50 text-slate-400 hover:text-orange-600 rounded transition ${index === 0 ? 'opacity-25 pointer-events-none' : ''}" title="Swap with previous page (←)">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/></svg>
            </button>
            <button class="move-right-btn p-1 hover:bg-orange-50 text-slate-400 hover:text-orange-600 rounded transition ${index === pageItems.length - 1 ? 'opacity-25 pointer-events-none' : ''}" title="Swap with next page (→)">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>
        `;

        card.appendChild(header);

        // Canvas container
        const canvasWrapper = document.createElement('div');
        canvasWrapper.className = 'w-full flex items-center justify-center overflow-hidden rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-1 min-h-[160px] cursor-grab';
        
        if (item.canvasEl) {
          item.canvasEl.style.transform = `rotate(${item.rotation}deg)`;
          canvasWrapper.appendChild(item.canvasEl);
        }
        card.appendChild(canvasWrapper);

        // Card Footer: Rotate & Delete Actions
        const footer = document.createElement('div');
        footer.className = 'w-full flex items-center justify-between mt-2 pt-1 border-t border-slate-100 dark:border-slate-700/60 text-xs';
        footer.innerHTML = `
          <button class="rot-btn p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded transition flex items-center gap-1" title="Rotate 90° Clockwise">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            <span class="text-[10px] font-semibold">${item.rotation > 0 ? `${item.rotation}°` : 'Rotate'}</span>
          </button>
          <button class="del-btn p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition flex items-center gap-1" title="${item.deleted ? 'Restore Page' : 'Remove Page'}">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            <span class="text-[10px] font-semibold">${item.deleted ? 'Restore' : 'Delete'}</span>
          </button>
        `;

        card.appendChild(footer);

        // Move Left Click
        card.querySelector('.move-left-btn').addEventListener('click', (e) => {
          e.stopPropagation();
          if (index > 0) {
            const temp = pageItems[index];
            pageItems[index] = pageItems[index - 1];
            pageItems[index - 1] = temp;
            renderGrid();
            updateSwapDropdowns();
            UI.showToast(`Swapped Page ${index + 1} with Page ${index}`, 'info');
          }
        });

        // Move Right Click
        card.querySelector('.move-right-btn').addEventListener('click', (e) => {
          e.stopPropagation();
          if (index < pageItems.length - 1) {
            const temp = pageItems[index];
            pageItems[index] = pageItems[index + 1];
            pageItems[index + 1] = temp;
            renderGrid();
            updateSwapDropdowns();
            UI.showToast(`Swapped Page ${index + 1} with Page ${index + 2}`, 'info');
          }
        });

        // Rotate Click
        card.querySelector('.rot-btn').addEventListener('click', (e) => {
          e.stopPropagation();
          item.rotation = (item.rotation + 90) % 360;
          if (item.canvasEl) {
            item.canvasEl.style.transform = `rotate(${item.rotation}deg)`;
          }
          renderGrid();
        });

        // Delete / Restore Click
        card.querySelector('.del-btn').addEventListener('click', (e) => {
          e.stopPropagation();
          item.deleted = !item.deleted;
          renderGrid();
          updateSwapDropdowns();
        });

        // HTML5 Drag and Drop Events
        card.addEventListener('dragstart', (e) => {
          dragSourceIdx = index;
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', index);
          card.classList.add('opacity-40', 'scale-95');
        });

        card.addEventListener('dragend', () => {
          card.classList.remove('opacity-40', 'scale-95');
          dragSourceIdx = null;
        });

        card.addEventListener('dragover', (e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          card.classList.add('border-orange-500', 'ring-2', 'ring-orange-400');
        });

        card.addEventListener('dragleave', () => {
          card.classList.remove('border-orange-500', 'ring-2', 'ring-orange-400');
        });

        card.addEventListener('drop', (e) => {
          e.preventDefault();
          card.classList.remove('border-orange-500', 'ring-2', 'ring-orange-400');
          const fromIdx = dragSourceIdx !== null ? dragSourceIdx : parseInt(e.dataTransfer.getData('text/plain'), 10);
          const toIdx = index;

          if (fromIdx !== null && !isNaN(fromIdx) && fromIdx !== toIdx) {
            // Move item to new position
            const moved = pageItems.splice(fromIdx, 1)[0];
            pageItems.splice(toIdx, 0, moved);
            renderGrid();
            updateSwapDropdowns();
            UI.showToast(`Moved Page ${fromIdx + 1} to position ${toIdx + 1}`, 'info');
          }
        });

        grid.appendChild(card);
      });
    };

    // Swap Two Chosen Pages via Toolbar
    swapBtn.addEventListener('click', () => {
      const fromIdx = parseInt(swapFrom.value, 10);
      const toIdx = parseInt(swapTo.value, 10);

      if (isNaN(fromIdx) || isNaN(toIdx)) return;
      if (fromIdx === toIdx) {
        UI.showToast('Please select two different pages to swap.', 'warning');
        return;
      }

      const temp = pageItems[fromIdx];
      pageItems[fromIdx] = pageItems[toIdx];
      pageItems[toIdx] = temp;

      renderGrid();
      updateSwapDropdowns();
      UI.celebrate();
      UI.showToast(`Swapped Page ${fromIdx + 1} with Page ${toIdx + 1}!`, 'success');
    });

    // Reverse Order
    reverseBtn.addEventListener('click', () => {
      pageItems.reverse();
      renderGrid();
      updateSwapDropdowns();
      UI.showToast('Reversed all page positions!', 'info');
    });

    // Reset Order
    resetBtn.addEventListener('click', () => {
      pageItems.sort((a, b) => a.originalIndex - b.originalIndex);
      pageItems.forEach(p => { p.rotation = 0; p.deleted = false; });
      renderGrid();
      updateSwapDropdowns();
      UI.showToast('Reset back to original page order.', 'info');
    });

    // File Upload Handler
    UI.setupDropzone(dropzone, input, async (files) => {
      if (files.length === 0) return;
      currentFile = files[0];
      statusEl.innerText = `${currentFile.name} (${window.pdfEngine.formatBytes(currentFile.size)})`;
      currentBuffer = await window.pdfEngine.readFileAsArrayBuffer(currentFile);
      workspace.classList.remove('hidden');

      grid.innerHTML = `
        <div class="col-span-full flex items-center justify-center py-12 text-slate-400">
          <svg class="animate-spin -ml-1 mr-3 h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          <span class="text-sm font-semibold">Generating high-fidelity page previews...</span>
        </div>
      `;

      try {
        const pdfDoc = await window.pdfEngine.getPdfJsDoc(window.pdfEngine.cloneBuffer(currentBuffer));
        const totalPages = pdfDoc.numPages;
        pageItems = [];

        for (let i = 1; i <= totalPages; i++) {
          const canvas = document.createElement('canvas');
          canvas.className = 'max-w-full h-auto transition-transform duration-200 pointer-events-none';
          
          pageItems.push({
            originalIndex: i - 1,
            originalPageNumber: i,
            rotation: 0,
            deleted: false,
            canvasEl: canvas
          });

          // Render canvas in background with HiDPI clarity
          window.pdfEngine.renderPageToCanvas(pdfDoc, i, canvas, 200);
        }

        renderGrid();
        updateSwapDropdowns();
      } catch (err) {
        grid.innerHTML = `<div class="col-span-full p-6 text-center text-red-500 font-semibold">Failed to load PDF pages: ${err.message}</div>`;
      }
    });

    // Save Organized PDF
    runBtn.addEventListener('click', async () => {
      const activeConfigs = pageItems.filter(s => !s.deleted);
      if (activeConfigs.length === 0) {
        UI.showToast('You cannot delete all pages.', 'error');
        return;
      }

      try {
        UI.showProgress(0.3, 'Saving reorganized & swapped pages...');
        const bufferToUse = currentBuffer?.byteLength > 0 ? currentBuffer : await currentFile.arrayBuffer();
        const resultBlob = await window.pdfEngine.organizePages(window.pdfEngine.cloneBuffer(bufferToUse), activeConfigs);
        
        UI.hideProgress();
        UI.celebrate();
        UI.showToast('Organized PDF ready!', 'success');
        
        UI.showResultPreview({
          title: 'Organized PDF Ready',
          subtitle: `Saved ${activeConfigs.length} pages in your custom order. Inspect preview before downloading:`,
          blob: resultBlob,
          filename: `${currentFile ? currentFile.name.replace(/\.pdf$/i, '') : 'document'}_organized.pdf`
        });
      } catch (err) {
        UI.hideProgress();
        UI.showToast(err.message, 'error');
      }
    });
  },

  // 6. SCAN TO PDF
  renderScan(container) {
    let capturedImages = [];
    let stream = null;

    container.innerHTML = `
      <div class="max-w-3xl mx-auto space-y-6">
        <div class="text-center space-y-2">
          <h2 class="text-2xl font-bold tracking-tight">Scan to PDF</h2>
          <p class="text-sm text-slate-500">Capture pages directly using your device webcam or document camera.</p>
        </div>

        <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
          <div class="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center">
            <video id="scan-video" autoplay playsinline class="w-full h-full object-cover"></video>
            <div id="scan-placeholder" class="absolute inset-0 flex flex-col items-center justify-center text-white bg-slate-900 gap-3">
              <i data-lucide="camera" class="w-12 h-12 text-slate-400"></i>
              <button id="scan-start-cam-btn" class="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-sm transition">Start Camera</button>
            </div>
          </div>

          <div class="flex items-center justify-center gap-3">
            <button id="scan-snap-btn" class="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-sm transition flex items-center gap-2 hidden">
              <i data-lucide="aperture" class="w-4 h-4"></i>
              <span>Take Snapshot</span>
            </button>
            <button id="scan-stop-cam-btn" class="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 font-medium text-xs transition hidden">Stop Camera</button>
          </div>
        </div>

        <div id="scan-snapshots-wrap" class="space-y-3 hidden">
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-sm">Captured Pages (<span id="scan-count">0</span>)</h3>
            <button id="scan-generate-pdf-btn" class="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-sm transition flex items-center gap-2">
              <i data-lucide="file-text" class="w-4 h-4"></i>
              <span>Compile into PDF</span>
            </button>
          </div>
          <div id="scan-thumbnails" class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3"></div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const video = container.querySelector('#scan-video');
    const placeholder = container.querySelector('#scan-placeholder');
    const startCamBtn = container.querySelector('#scan-start-cam-btn');
    const stopCamBtn = container.querySelector('#scan-stop-cam-btn');
    const snapBtn = container.querySelector('#scan-snap-btn');
    const snapsWrap = container.querySelector('#scan-snapshots-wrap');
    const countEl = container.querySelector('#scan-count');
    const thumbsEl = container.querySelector('#scan-thumbnails');
    const generateBtn = container.querySelector('#scan-generate-pdf-btn');

    const updateSnaps = () => {
      countEl.innerText = capturedImages.length;
      if (capturedImages.length === 0) {
        snapsWrap.classList.add('hidden');
        return;
      }
      snapsWrap.classList.remove('hidden');
      thumbsEl.innerHTML = capturedImages.map((img, idx) => `
        <div class="relative group rounded-lg overflow-hidden border border-slate-200 shadow-sm aspect-[3/4]">
          <img src="${img.dataUrl}" class="w-full h-full object-cover">
          <button class="snap-del absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-80 hover:opacity-100 transition" data-idx="${idx}">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
      `).join('');

      thumbsEl.querySelectorAll('.snap-del').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const idx = parseInt(btn.dataset.idx, 10);
          capturedImages.splice(idx, 1);
          updateSnaps();
        });
      });
    };

    startCamBtn.addEventListener('click', async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: 1920, height: 1080 } });
        video.srcObject = stream;
        placeholder.classList.add('hidden');
        snapBtn.classList.remove('hidden');
        stopCamBtn.classList.remove('hidden');
      } catch (err) {
        UI.showToast(`Camera access denied or unavailable: ${err.message}`, 'error');
      }
    });

    const stopCamera = () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
        stream = null;
      }
      placeholder.classList.remove('hidden');
      snapBtn.classList.add('hidden');
      stopCamBtn.classList.add('hidden');
    };

    stopCamBtn.addEventListener('click', stopCamera);

    snapBtn.addEventListener('click', () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        capturedImages.push({
          blob,
          dataUrl: canvas.toDataURL('image/jpeg', 0.95),
          name: `scan_${capturedImages.length + 1}.jpg`,
          type: 'image/jpeg'
        });
        updateSnaps();
        UI.showToast(`Captured Page ${capturedImages.length}!`, 'info');
      }, 'image/jpeg', 0.95);
    });

    generateBtn.addEventListener('click', async () => {
      if (capturedImages.length === 0) return;
      try {
        UI.showProgress(0.3, 'Compiling scanned pages into PDF...');
        const fileList = capturedImages.map(img => new File([img.blob], img.name, { type: 'image/jpeg' }));
        const pdfBlob = await window.pdfEngine.imagesToPDF(fileList, { pageSize: 'A4', orientation: 'portrait' });
        UI.hideProgress();
        UI.celebrate();
        UI.showToast('Scanned PDF created!', 'success');
        UI.showResultPreview({
          title: 'Scanned Document Ready',
          subtitle: `${capturedImages.length} scanned pages compiled into PDF`,
          blob: pdfBlob,
          filename: 'scanned_document.pdf'
        });
      } catch (err) {
        UI.hideProgress();
        UI.showToast(err.message, 'error');
      }
    });
  }
};

window.OrganizeTools = OrganizeTools;

