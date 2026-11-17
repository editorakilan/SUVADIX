/**
 * PDFNova - All-In-One Studio
 * Complete unified workspace where all PDF operations can be performed in one place:
 * Organize & Swap pages, Edit Text, Whiteout, Sign, Watermark, Redact, Protect & Compress.
 */

const AllInOneTool = {
  render(container) {
    let currentBuffer = null;
    let currentFile = null;
    let pdfJsDoc = null;
    let currentPageNum = 1;
    let currentZoom = 1.0;

    // --- Studio Operational States ---
    let pageItems = []; // Array of { originalIndex, originalPageNumber, rotation, deleted, canvasEl }
    let signatures = []; // Array of { pageIndex, signatureDataUrl, xRatio, yRatio, wRatio, hRatio }
    let textEdits = []; // Array of { pageIndex, type, x, y, width, height, text, newText, size, font, color, bgWhiteout }
    let redactions = []; // Array of { pageIndex, xRatio, yRatio, wRatio, hRatio }
    let watermarkConfig = null; // { type, text, fontSize, color, opacity, angle, position, imageBlob, applyAll }
    let compressConfig = { enabled: false, mode: 'target', targetVal: 2, targetUnit: 'MB', level: 'recommended' };
    let securityConfig = { enabled: false, password: '' };

    // Active tool tab: 'pages' | 'sign' | 'watermark' | 'edit' | 'compress' | 'security'
    let activeTab = 'pages';

    container.innerHTML = `
      <div class="max-w-6xl mx-auto space-y-5">
        <!-- Title & Subtitle -->
        <div class="text-center space-y-1">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
            <span>All-In-One Unified PDF Studio</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">All-In-One PDF Studio</h2>
          <p class="text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto">Perform all PDF operations right here in one place: swap pages, rotate, edit text, whiteout errors, sign, watermark, redact, protect, and compress.</p>
        </div>

        <!-- Dropzone / Document Loader -->
        <div id="aio-dropzone" class="dropzone p-8 rounded-2xl text-center cursor-pointer hover:border-indigo-500 transition border-2 border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <input type="file" id="aio-file-input" accept="application/pdf" class="hidden">
          <div class="flex flex-col items-center gap-3">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <i data-lucide="layers" class="w-8 h-8"></i>
            </div>
            <div>
              <p class="font-bold text-base text-slate-800 dark:text-slate-100">Upload PDF to open All-In-One Studio</p>
              <p class="text-xs text-slate-400 mt-1" id="aio-file-status">Drag & drop or click to browse</p>
            </div>
          </div>
        </div>

        <!-- Studio Workspace (Hidden initially) -->
        <div id="aio-workspace" class="space-y-4 hidden">
          <!-- Top Studio Bar: Document Info & Export -->
          <div class="flex flex-wrap items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm gap-3">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center">
                <i data-lucide="file-text" class="w-5 h-5"></i>
              </div>
              <div>
                <p id="aio-doc-title" class="font-bold text-sm text-slate-800 dark:text-slate-100 truncate max-w-xs sm:max-w-md">document.pdf</p>
                <div class="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                  <span id="aio-doc-size">0 KB</span>
                  <span>&bull;</span>
                  <span id="aio-doc-pages">0 Pages</span>
                  <span>&bull;</span>
                  <span id="aio-changes-badge" class="font-semibold text-emerald-600">No changes pending</span>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2.5">
              <button id="aio-reset-btn" class="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold transition flex items-center gap-1.5" title="Reset all changes to original">
                <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i>
                <span class="hidden sm:inline">Reset All</span>
              </button>
              <button id="aio-close-btn" class="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 hover:bg-slate-100 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5" title="Close document">
                <i data-lucide="x" class="w-3.5 h-3.5"></i>
                <span>Close</span>
              </button>
              <button id="aio-export-btn" class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-extrabold text-xs shadow-md shadow-indigo-600/20 transition flex items-center gap-2">
                <i data-lucide="download" class="w-4 h-4"></i>
                <span>Apply & Export Final PDF</span>
              </button>
            </div>
          </div>

          <!-- Operation Modes Navigation Tabs -->
          <div class="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm overflow-x-auto scrollbar-none text-xs font-bold">
            <button class="aio-tab-btn px-4 py-2 rounded-xl text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 transition whitespace-nowrap active" data-tab="pages">
              <i data-lucide="layout-grid" class="w-3.5 h-3.5 inline mr-1"></i> 1. Organize & Swap Pages
            </button>
            <button class="aio-tab-btn px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 transition whitespace-nowrap" data-tab="sign">
              <i data-lucide="pen-tool" class="w-3.5 h-3.5 inline mr-1"></i> 2. Sign PDF
            </button>
            <button class="aio-tab-btn px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 transition whitespace-nowrap" data-tab="watermark">
              <i data-lucide="stamp" class="w-3.5 h-3.5 inline mr-1"></i> 3. Watermark
            </button>
            <button class="aio-tab-btn px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 transition whitespace-nowrap" data-tab="edit">
              <i data-lucide="edit-3" class="w-3.5 h-3.5 inline mr-1"></i> 4. Edit Text & Redact
            </button>
            <button class="aio-tab-btn px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 transition whitespace-nowrap" data-tab="compress">
              <i data-lucide="minimize-2" class="w-3.5 h-3.5 inline mr-1"></i> 5. Compress PDF
            </button>
            <button class="aio-tab-btn px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 transition whitespace-nowrap" data-tab="security">
              <i data-lucide="lock" class="w-3.5 h-3.5 inline mr-1"></i> 6. Security
            </button>
          </div>

          <!-- OPERATION PANELS CONTAINER -->
          <div id="aio-tab-panels" class="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            
            <!-- PANEL 1: ORGANIZE & SWAP PAGES -->
            <div id="panel-pages" class="aio-panel space-y-4">
              <div class="flex flex-wrap items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700 gap-3">
                <div class="flex items-center gap-2.5">
                  <span class="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                  <h3 class="font-bold text-sm text-slate-800 dark:text-slate-100">Page Swapping & Management</h3>
                </div>

                <!-- Instant Swap Bar -->
                <div class="flex items-center gap-2 p-1.5 bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-xl">
                  <span class="text-xs font-bold text-orange-800 dark:text-orange-300 flex items-center gap-1">
                    <i data-lucide="arrow-left-right" class="w-3.5 h-3.5 text-orange-600"></i>
                    Swap:
                  </span>
                  <select id="aio-swap-from" class="text-xs font-semibold p-1 rounded-lg border border-slate-200 bg-white dark:bg-slate-800 outline-none"></select>
                  <span class="text-xs font-bold text-orange-600">⇄</span>
                  <select id="aio-swap-to" class="text-xs font-semibold p-1 rounded-lg border border-slate-200 bg-white dark:bg-slate-800 outline-none"></select>
                  <button id="aio-swap-btn" class="px-2.5 py-1 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition">
                    Swap
                  </button>
                </div>

                <div class="flex items-center gap-2">
                  <button id="aio-reverse-btn" class="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-xs font-medium text-slate-700 dark:text-slate-300 transition">
                    ⇄ Reverse Order
                  </button>
                  <button id="aio-rot-curr-btn" class="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-xs font-medium text-slate-700 dark:text-slate-300 transition">
                    ↻ Rotate Current 90°
                  </button>
                  <button id="aio-rot-all-btn" class="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-xs font-medium text-slate-700 dark:text-slate-300 transition">
                    ↻ Rotate All 90°
                  </button>
                  <button id="aio-del-curr-btn" class="px-2.5 py-1.5 rounded-lg border border-red-200 dark:border-red-900 hover:bg-red-50 text-xs font-medium text-red-600 transition">
                    ✕ Remove Current Page
                  </button>
                </div>
              </div>

              <!-- Page Grid Thumbnails for Drag & Drop and Instant Click -->
              <div>
                <p class="text-xs text-slate-500 mb-2">Click any page to switch viewer, drag to reorder/swap, or use the <strong>← / →</strong> buttons on cards:</p>
                <div id="aio-thumb-strip" class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 max-h-60 overflow-y-auto p-1"></div>
              </div>
            </div>

            <!-- PANEL 2: SIGN PDF -->
            <div id="panel-sign" class="aio-panel hidden space-y-4">
              <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                  <h3 class="font-bold text-sm text-slate-800 dark:text-slate-100">Digital Signature (Dr. Vijayapriya Aki / Custom)</h3>
                </div>
                <span class="text-xs text-purple-600 font-semibold bg-purple-50 dark:bg-purple-950/40 px-2.5 py-0.5 rounded-full">Place on Any Page</span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <!-- Signature Type & Settings -->
                <div class="space-y-3">
                  <div class="flex rounded-xl bg-slate-100 dark:bg-slate-700 p-1 text-xs font-bold">
                    <button class="aio-sig-mode-btn flex-1 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-purple-700 shadow-sm" data-mode="type">Type</button>
                    <button class="aio-sig-mode-btn flex-1 py-1.5 rounded-lg text-slate-600 dark:text-slate-300" data-mode="draw">Draw</button>
                    <button class="aio-sig-mode-btn flex-1 py-1.5 rounded-lg text-slate-600 dark:text-slate-300" data-mode="upload">Upload</button>
                  </div>

                  <div id="aio-sig-type-sec" class="space-y-2">
                    <label class="text-xs font-semibold text-slate-500">Signer Name / Text:</label>
                    <input type="text" id="aio-sig-name" value="Dr. Vijayapriya Aki" class="w-full text-xs font-bold p-2 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-purple-500">
                    
                    <label class="text-xs font-semibold text-slate-500 block pt-1">Font Style:</label>
                    <select id="aio-sig-font" class="w-full text-xs font-medium p-2 rounded-xl border border-slate-200 dark:border-slate-700 outline-none">
                      <option value="'Dancing Script', cursive">Dancing Script (Classic)</option>
                      <option value="'Caveat', cursive">Caveat (Modern Casual)</option>
                      <option value="'Great Vibes', cursive">Great Vibes (Formal Calligraphy)</option>
                      <option value="'Playfair Display', serif">Playfair Display (Executive)</option>
                    </select>
                  </div>

                  <div id="aio-sig-draw-sec" class="space-y-2 hidden">
                    <div class="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white">
                      <canvas id="aio-sig-pad" width="300" height="100" class="w-full cursor-crosshair"></canvas>
                    </div>
                    <button id="aio-sig-clear-pad" class="text-[11px] font-semibold text-red-600 hover:underline">Clear Canvas</button>
                  </div>

                  <div id="aio-sig-upload-sec" class="space-y-2 hidden">
                    <input type="file" id="aio-sig-file" accept="image/png,image/jpeg" class="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:bg-purple-50 file:text-purple-700">
                  </div>

                  <div class="flex items-center justify-between pt-1">
                    <span class="text-xs font-semibold text-slate-500">Ink Color:</span>
                    <div class="flex items-center gap-1.5">
                      <button class="aio-sig-color w-6 h-6 rounded-full bg-blue-700 ring-2 ring-purple-600 ring-offset-1" data-color="#1d4ed8"></button>
                      <button class="aio-sig-color w-6 h-6 rounded-full bg-slate-900" data-color="#0f172a"></button>
                      <button class="aio-sig-color w-6 h-6 rounded-full bg-red-700" data-color="#b91c1c"></button>
                    </div>
                  </div>
                </div>

                <!-- Signature Preview Box -->
                <div class="space-y-2 md:col-span-2 flex flex-col justify-between">
                  <div>
                    <label class="text-xs font-semibold text-slate-500 block mb-1">Signature Stamp Preview:</label>
                    <div id="aio-sig-preview-box" class="h-28 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center p-3 overflow-hidden">
                      <span id="aio-sig-preview-text" style="font-family: 'Dancing Script', cursive; font-size: 32px; color: #1d4ed8;">Dr. Vijayapriya Aki</span>
                      <img id="aio-sig-preview-img" class="max-h-full object-contain hidden" alt="Signature">
                    </div>
                  </div>

                  <div class="flex flex-wrap items-center justify-between pt-2 gap-2">
                    <div class="flex items-center gap-2">
                      <span class="text-xs text-slate-500">Stamp on Page:</span>
                      <select id="aio-sig-target-page" class="text-xs font-bold p-1.5 rounded-lg border border-slate-200 outline-none"></select>
                    </div>
                    <button id="aio-add-sig-btn" class="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition flex items-center gap-1.5">
                      <i data-lucide="plus" class="w-3.5 h-3.5"></i>
                      <span>Place Signature Box on Viewer</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- PANEL 3: WATERMARK -->
            <div id="panel-watermark" class="aio-panel hidden space-y-4">
              <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                  <h3 class="font-bold text-sm text-slate-800 dark:text-slate-100">Stamp Confidential or Custom Watermark</h3>
                </div>
                <div class="flex items-center gap-2">
                  <input type="checkbox" id="aio-wm-enabled" class="rounded text-indigo-600">
                  <label for="aio-wm-enabled" class="text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer">Enable Watermark</label>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <label class="font-semibold text-slate-500 block mb-1">Watermark Text:</label>
                  <input type="text" id="aio-wm-text" value="CONFIDENTIAL" class="w-full font-bold p-2 rounded-xl border border-slate-200 dark:border-slate-700 outline-none">
                </div>
                <div>
                  <label class="font-semibold text-slate-500 block mb-1">Position:</label>
                  <select id="aio-wm-pos" class="w-full font-medium p-2 rounded-xl border border-slate-200 dark:border-slate-700 outline-none">
                    <option value="center" selected>Center (Diagonal)</option>
                    <option value="top-left">Top Left</option>
                    <option value="top-right">Top Right</option>
                    <option value="bottom-right">Bottom Right</option>
                  </select>
                </div>
                <div>
                  <label class="font-semibold text-slate-500 block mb-1">Opacity (<span id="aio-wm-op-val">25%</span>):</label>
                  <input type="range" id="aio-wm-opacity" min="0.05" max="0.9" step="0.05" value="0.25" class="w-full accent-indigo-600">
                </div>
                <div>
                  <label class="font-semibold text-slate-500 block mb-1">Color:</label>
                  <input type="color" id="aio-wm-color" value="#e11d48" class="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 p-0.5 cursor-pointer">
                </div>
              </div>
            </div>

            <!-- PANEL 4: EDIT TEXT & REDACT -->
            <div id="panel-edit" class="aio-panel hidden space-y-4">
              <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
                  <h3 class="font-bold text-sm text-slate-800 dark:text-slate-100">Edit Sentences, Whiteout Errors & Redact</h3>
                </div>
                <div class="flex items-center gap-2 text-xs">
                  <button id="aio-mode-edit-btn" class="px-3 py-1 rounded-lg bg-rose-50 text-rose-700 font-bold border border-rose-200">Sentence Replace</button>
                  <button id="aio-mode-whiteout-btn" class="px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 font-medium">Whiteout Box</button>
                  <button id="aio-mode-redact-btn" class="px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 font-medium">Blackout Redact</button>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label class="font-semibold text-slate-500 block mb-1">Sentence / Text to Correct or Replace:</label>
                  <input type="text" id="aio-edit-orig-text" placeholder="e.g. Diagnosis: Grade 1 or incorrect fee amount" class="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none">
                </div>
                <div>
                  <label class="font-semibold text-slate-500 block mb-1">New Replacement Sentence:</label>
                  <input type="text" id="aio-edit-new-text" placeholder="e.g. Diagnosis: Normal, Cleared for IVF" class="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none">
                </div>
              </div>

              <div class="flex justify-end gap-2 pt-1">
                <button id="aio-place-edit-box-btn" class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition flex items-center gap-1.5">
                  <i data-lucide="plus" class="w-3.5 h-3.5"></i>
                  <span>Place Correction Box on Active Page</span>
                </button>
              </div>
            </div>

            <!-- PANEL 5: COMPRESS PDF -->
            <div id="panel-compress" class="aio-panel hidden space-y-4">
              <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                  <h3 class="font-bold text-sm text-slate-800 dark:text-slate-100">Compress PDF by Target Limit or Presets</h3>
                </div>
                <div class="flex items-center gap-2">
                  <input type="checkbox" id="aio-comp-enabled" class="rounded text-emerald-600">
                  <label for="aio-comp-enabled" class="text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer">Compress on Export</label>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <!-- Target Limit -->
                <div class="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 space-y-2">
                  <span class="font-bold text-slate-800 dark:text-slate-200 block">Target File Size (GB/MB/KB/Bytes):</span>
                  <div class="flex items-center gap-2">
                    <input type="number" id="aio-comp-target-val" value="2" step="any" min="0.01" class="w-full p-2 rounded-xl border border-slate-200 bg-white font-bold outline-none">
                    <select id="aio-comp-target-unit" class="p-2 rounded-xl border border-slate-200 bg-white font-bold outline-none">
                      <option value="MB" selected>MB</option>
                      <option value="KB">KB</option>
                      <option value="Bytes">Bytes</option>
                      <option value="GB">GB</option>
                    </select>
                  </div>
                  <div class="flex gap-1.5 pt-1">
                    <button type="button" class="aio-comp-chip px-2 py-0.5 rounded border border-slate-200 bg-white text-[10px] font-semibold" data-val="500" data-unit="KB">500 KB</button>
                    <button type="button" class="aio-comp-chip px-2 py-0.5 rounded border border-slate-200 bg-white text-[10px] font-semibold" data-val="1" data-unit="MB">1 MB</button>
                    <button type="button" class="aio-comp-chip px-2 py-0.5 rounded border border-slate-200 bg-white text-[10px] font-semibold" data-val="2" data-unit="MB">2 MB</button>
                    <button type="button" class="aio-comp-chip px-2 py-0.5 rounded border border-slate-200 bg-white text-[10px] font-semibold" data-val="5" data-unit="MB">5 MB</button>
                  </div>
                </div>

                <!-- Downsampling Presets -->
                <div class="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 space-y-2">
                  <span class="font-bold text-slate-800 dark:text-slate-200 block">Preset Downsampling:</span>
                  <div class="grid grid-cols-3 gap-2 text-center">
                    <button type="button" class="aio-preset-btn p-2 rounded-lg border border-slate-200 bg-white text-[11px] font-bold" data-level="extreme">Extreme (~75%)</button>
                    <button type="button" class="aio-preset-btn p-2 rounded-lg border-2 border-emerald-500 bg-emerald-50 text-emerald-800 text-[11px] font-bold" data-level="recommended">Recommended</button>
                    <button type="button" class="aio-preset-btn p-2 rounded-lg border border-slate-200 bg-white text-[11px] font-bold" data-level="less">Less (~25%)</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- PANEL 6: SECURITY -->
            <div id="panel-security" class="aio-panel hidden space-y-4">
              <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-sky-600"></span>
                  <h3 class="font-bold text-sm text-slate-800 dark:text-slate-100">Password Encryption (AES-256)</h3>
                </div>
                <div class="flex items-center gap-2">
                  <input type="checkbox" id="aio-sec-enabled" class="rounded text-sky-600">
                  <label for="aio-sec-enabled" class="text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer">Protect with Password</label>
                </div>
              </div>

              <div class="max-w-md space-y-2 text-xs">
                <label class="font-semibold text-slate-500 block">Document Password:</label>
                <input type="password" id="aio-sec-password" placeholder="Enter password to encrypt PDF" class="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none">
                <p class="text-[11px] text-slate-400">Recipient must enter this password to view the exported PDF.</p>
              </div>
            </div>

          </div>

          <!-- CENTRAL LIVE DOCUMENT VIEWER -->
          <div class="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
            <!-- Viewer Toolbar -->
            <div class="flex flex-wrap items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700 gap-3">
              <div class="flex items-center gap-2">
                <button id="aio-prev-page" class="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 disabled:opacity-30" title="Previous Page">
                  <i data-lucide="chevron-left" class="w-4 h-4"></i>
                </button>
                <span class="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Page <span id="aio-viewer-curr-page">1</span> of <span id="aio-viewer-total-pages">1</span>
                </span>
                <button id="aio-next-page" class="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 disabled:opacity-30" title="Next Page">
                  <i data-lucide="chevron-right" class="w-4 h-4"></i>
                </button>
              </div>

              <!-- Zoom Controls -->
              <div class="flex items-center gap-2 text-xs">
                <span class="text-slate-400 font-semibold">Zoom:</span>
                <button id="aio-zoom-out" class="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 font-bold" title="Zoom Out">-</button>
                <span id="aio-zoom-level" class="font-bold min-w-[45px] text-center">100%</span>
                <button id="aio-zoom-in" class="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 font-bold" title="Zoom In">+</button>
                <button id="aio-zoom-fit" class="px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 font-bold text-[11px]">Fit</button>
              </div>
            </div>

            <!-- Page Viewer Viewport with Interactive Overlays -->
            <div class="relative w-full flex items-center justify-center p-4 bg-slate-100 dark:bg-slate-900/60 rounded-xl overflow-auto min-h-[460px]">
              <div id="aio-canvas-container" class="relative shadow-xl rounded overflow-visible bg-white">
                <canvas id="aio-main-canvas" class="block max-w-none"></canvas>
                <!-- Interactive Overlays Layer for Draggable Signature, Edit Boxes, and Redactions -->
                <div id="aio-overlays-layer" class="absolute inset-0 pointer-events-none"></div>
              </div>
            </div>
          </div>

        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // DOM References
    const dropzone = container.querySelector('#aio-dropzone');
    const input = container.querySelector('#aio-file-input');
    const statusEl = container.querySelector('#aio-file-status');
    const workspace = container.querySelector('#aio-workspace');
    const docTitleEl = container.querySelector('#aio-doc-title');
    const docSizeEl = container.querySelector('#aio-doc-size');
    const docPagesEl = container.querySelector('#aio-doc-pages');
    const changesBadge = container.querySelector('#aio-changes-badge');
    const resetBtn = container.querySelector('#aio-reset-btn');
    const closeBtn = container.querySelector('#aio-close-btn');
    const exportBtn = container.querySelector('#aio-export-btn');

    // Tabs
    const tabBtns = container.querySelectorAll('.aio-tab-btn');
    const panels = container.querySelectorAll('.aio-panel');

    // Viewer
    const mainCanvas = container.querySelector('#aio-main-canvas');
    const canvasContainer = container.querySelector('#aio-canvas-container');
    const overlaysLayer = container.querySelector('#aio-overlays-layer');
    const viewerCurrPage = container.querySelector('#aio-viewer-curr-page');
    const viewerTotalPages = container.querySelector('#aio-viewer-total-pages');
    const prevPageBtn = container.querySelector('#aio-prev-page');
    const nextPageBtn = container.querySelector('#aio-next-page');
    const zoomInBtn = container.querySelector('#aio-zoom-in');
    const zoomOutBtn = container.querySelector('#aio-zoom-out');
    const zoomFitBtn = container.querySelector('#aio-zoom-fit');
    const zoomLevelEl = container.querySelector('#aio-zoom-level');
    const thumbStrip = container.querySelector('#aio-thumb-strip');

    // Operations Elements
    const swapFrom = container.querySelector('#aio-swap-from');
    const swapTo = container.querySelector('#aio-swap-to');
    const swapBtn = container.querySelector('#aio-swap-btn');
    const reverseBtn = container.querySelector('#aio-reverse-btn');
    const rotCurrBtn = container.querySelector('#aio-rot-curr-btn');
    const rotAllBtn = container.querySelector('#aio-rot-all-btn');
    const delCurrBtn = container.querySelector('#aio-del-curr-btn');

    // Sign Elements
    const sigNameInput = container.querySelector('#aio-sig-name');
    const sigFontSelect = container.querySelector('#aio-sig-font');
    const sigPreviewText = container.querySelector('#aio-sig-preview-text');
    const sigPreviewImg = container.querySelector('#aio-sig-preview-img');
    const sigPadCanvas = container.querySelector('#aio-sig-pad');
    const sigClearPadBtn = container.querySelector('#aio-sig-clear-pad');
    const sigFileInput = container.querySelector('#aio-sig-file');
    const sigTargetPage = container.querySelector('#aio-sig-target-page');
    const addSigBtn = container.querySelector('#aio-add-sig-btn');

    // Watermark Elements
    const wmEnabled = container.querySelector('#aio-wm-enabled');
    const wmText = container.querySelector('#aio-wm-text');
    const wmPos = container.querySelector('#aio-wm-pos');
    const wmOpacity = container.querySelector('#aio-wm-opacity');
    const wmOpVal = container.querySelector('#aio-wm-op-val');
    const wmColor = container.querySelector('#aio-wm-color');

    // Edit Elements
    const editOrigText = container.querySelector('#aio-edit-orig-text');
    const editNewText = container.querySelector('#aio-edit-new-text');
    const placeEditBoxBtn = container.querySelector('#aio-place-edit-box-btn');

    // Compress Elements
    const compEnabled = container.querySelector('#aio-comp-enabled');
    const compTargetVal = container.querySelector('#aio-comp-target-val');
    const compTargetUnit = container.querySelector('#aio-comp-target-unit');

    // Security Elements
    const secEnabled = container.querySelector('#aio-sec-enabled');
    const secPassword = container.querySelector('#aio-sec-password');

    // Signature Pad Drawing State
    let sigPadCtx = sigPadCanvas ? sigPadCanvas.getContext('2d') : null;
    let isDrawingSig = false;
    let sigColor = '#1d4ed8';
    let currentSigMode = 'type'; // 'type' | 'draw' | 'upload'

    // Update Pending Changes Badge
    const updateChangesBadge = () => {
      let count = 0;
      if (pageItems.some((p, i) => p.originalIndex !== i || p.rotation !== 0 || p.deleted)) count++;
      if (signatures.length > 0) count += signatures.length;
      if (textEdits.length > 0) count += textEdits.length;
      if (redactions.length > 0) count += redactions.length;
      if (wmEnabled.checked) count++;
      if (compEnabled.checked) count++;
      if (secEnabled.checked && secPassword.value) count++;

      if (count === 0) {
        changesBadge.innerText = 'No changes pending';
        changesBadge.className = 'font-semibold text-slate-400';
      } else {
        changesBadge.innerText = `${count} operation(s) staged`;
        changesBadge.className = 'font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full';
      }
    };

    // Tab Switching
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        activeTab = tab;

        tabBtns.forEach(b => {
          const isMatch = b.dataset.tab === tab;
          b.className = isMatch
            ? 'aio-tab-btn px-4 py-2 rounded-xl text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 transition whitespace-nowrap active'
            : 'aio-tab-btn px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 transition whitespace-nowrap';
        });

        panels.forEach(p => {
          p.classList.toggle('hidden', p.id !== `panel-${tab}`);
        });

        if (window.lucide) window.lucide.createIcons();
      });
    });

    // Render Current Active Page on Main Viewer
    const renderActivePage = async () => {
      if (!pdfJsDoc || pageItems.length === 0) return;
      
      const activeItem = pageItems[currentPageNum - 1];
      if (!activeItem) return;

      viewerCurrPage.innerText = currentPageNum;
      viewerTotalPages.innerText = pageItems.length;
      prevPageBtn.disabled = currentPageNum <= 1;
      nextPageBtn.disabled = currentPageNum >= pageItems.length;

      // Render via PDFEngine with HiDPI supersampling
      const baseWidth = 550 * currentZoom;
      await window.pdfEngine.renderPageToCanvas(pdfJsDoc, activeItem.originalPageNumber, mainCanvas, baseWidth);
      
      // Apply active page rotation
      mainCanvas.style.transform = `rotate(${activeItem.rotation}deg)`;

      // Match overlays layer dimensions
      overlaysLayer.style.width = mainCanvas.style.width;
      overlaysLayer.style.height = mainCanvas.style.height;

      renderOverlays();
      updateThumbStripHighlight();
    };

    // Render Overlays for Current Page (Signatures, Edits, Redactions)
    const renderOverlays = () => {
      overlaysLayer.innerHTML = '';
      const pageIdx = currentPageNum - 1;

      // 1. Render Signatures on this page
      signatures.filter(s => s.pageIndex === pageIdx).forEach((sig, sIdx) => {
        const box = document.createElement('div');
        box.className = 'absolute border-2 border-purple-600 bg-purple-500/10 rounded cursor-move pointer-events-auto flex items-center justify-center group';
        box.style.left = `${sig.xRatio * 100}%`;
        box.style.top = `${sig.yRatio * 100}%`;
        box.style.width = `${sig.wRatio * 100}%`;
        box.style.height = `${sig.hRatio * 100}%`;

        box.innerHTML = `
          <img src="${sig.signatureDataUrl}" class="max-w-full max-h-full object-contain pointer-events-none">
          <button class="aio-del-sig absolute -top-2 -right-2 w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow">
            &times;
          </button>
        `;

        // Enable drag on viewer canvas
        makeDraggable(box, (newXRatio, newYRatio) => {
          sig.xRatio = newXRatio;
          sig.yRatio = newYRatio;
        });

        box.querySelector('.aio-del-sig').addEventListener('click', (e) => {
          e.stopPropagation();
          signatures.splice(sIdx, 1);
          renderOverlays();
          updateChangesBadge();
        });

        overlaysLayer.appendChild(box);
      });

      // 2. Render Text Edits & Whiteouts on this page
      textEdits.filter(t => t.pageIndex === pageIdx).forEach((edit, eIdx) => {
        const box = document.createElement('div');
        box.className = 'absolute border border-dashed border-rose-500 bg-white/90 rounded pointer-events-auto flex items-center justify-center px-1 text-slate-800 text-xs font-semibold group';
        box.style.left = `${edit.xRatio * 100}%`;
        box.style.top = `${edit.yRatio * 100}%`;
        box.style.width = `${edit.wRatio * 100}%`;
        box.style.height = `${edit.hRatio * 100}%`;

        box.innerHTML = `
          <span class="truncate pointer-events-none">${edit.newText || edit.text || 'Whiteout'}</span>
          <button class="aio-del-edit absolute -top-2 -right-2 w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow">
            &times;
          </button>
        `;

        makeDraggable(box, (newXRatio, newYRatio) => {
          edit.xRatio = newXRatio;
          edit.yRatio = newYRatio;
        });

        box.querySelector('.aio-del-edit').addEventListener('click', (e) => {
          e.stopPropagation();
          textEdits.splice(eIdx, 1);
          renderOverlays();
          updateChangesBadge();
        });

        overlaysLayer.appendChild(box);
      });
    };

    // Helper: Make an overlay element draggable with normalized ratios (0.0 to 1.0)
    const makeDraggable = (el, onMove) => {
      let isDragging = false;
      let startX, startY, origLeft, origTop;

      el.addEventListener('mousedown', (e) => {
        if (e.target.tagName.toLowerCase() === 'button') return;
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        origLeft = el.offsetLeft;
        origTop = el.offsetTop;
        e.preventDefault();
      });

      window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        const parentW = overlaysLayer.clientWidth;
        const parentH = overlaysLayer.clientHeight;

        let newX = Math.max(0, Math.min(parentW - el.offsetWidth, origLeft + dx));
        let newY = Math.max(0, Math.min(parentH - el.offsetHeight, origTop + dy));

        el.style.left = `${newX}px`;
        el.style.top = `${newY}px`;

        if (onMove) {
          onMove(newX / parentW, newY / parentH);
        }
      });

      window.addEventListener('mouseup', () => {
        isDragging = false;
      });
    };

    // Render Bottom Thumbnails Strip
    const renderThumbStrip = () => {
      thumbStrip.innerHTML = '';
      pageItems.forEach((item, idx) => {
        const card = document.createElement('div');
        card.draggable = !item.deleted;
        card.className = `p-1.5 rounded-xl border ${
          idx === currentPageNum - 1 ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500' : 'border-slate-200 bg-white hover:border-slate-300'
        } ${item.deleted ? 'opacity-30 border-red-300' : ''} flex flex-col items-center cursor-pointer transition`;

        card.innerHTML = `
          <div class="w-full flex items-center justify-between text-[10px] font-bold mb-1">
            <span class="text-slate-700">${idx + 1}</span>
            <div class="flex items-center gap-0.5">
              <button class="aio-m-left p-0.5 hover:text-orange-600 ${idx === 0 ? 'opacity-20 pointer-events-none' : ''}">‹</button>
              <button class="aio-m-right p-0.5 hover:text-orange-600 ${idx === pageItems.length - 1 ? 'opacity-20 pointer-events-none' : ''}">›</button>
            </div>
          </div>
          <div class="thumb-canvas-box w-full flex items-center justify-center bg-slate-50 rounded border border-slate-100 overflow-hidden min-h-[60px]"></div>
        `;

        if (item.canvasEl) {
          card.querySelector('.thumb-canvas-box').appendChild(item.canvasEl);
        }

        // Click to view page
        card.addEventListener('click', () => {
          currentPageNum = idx + 1;
          renderActivePage();
        });

        // Swap with Left Page
        card.querySelector('.aio-m-left').addEventListener('click', (e) => {
          e.stopPropagation();
          if (idx > 0) {
            const temp = pageItems[idx];
            pageItems[idx] = pageItems[idx - 1];
            pageItems[idx - 1] = temp;
            currentPageNum = idx;
            renderThumbStrip();
            renderActivePage();
            updateSwapDropdowns();
            updateChangesBadge();
            UI.showToast(`Swapped Page ${idx + 1} with Page ${idx}`, 'info');
          }
        });

        // Swap with Right Page
        card.querySelector('.aio-m-right').addEventListener('click', (e) => {
          e.stopPropagation();
          if (idx < pageItems.length - 1) {
            const temp = pageItems[idx];
            pageItems[idx] = pageItems[idx + 1];
            pageItems[idx + 1] = temp;
            currentPageNum = idx + 2;
            renderThumbStrip();
            renderActivePage();
            updateSwapDropdowns();
            updateChangesBadge();
            UI.showToast(`Swapped Page ${idx + 1} with Page ${idx + 2}`, 'info');
          }
        });

        // HTML5 Drag and Drop for Reordering
        card.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('text/plain', idx);
          card.classList.add('opacity-40');
        });
        card.addEventListener('dragend', () => card.classList.remove('opacity-40'));
        card.addEventListener('dragover', (e) => {
          e.preventDefault();
          card.classList.add('border-indigo-500', 'ring-2');
        });
        card.addEventListener('dragleave', () => card.classList.remove('border-indigo-500', 'ring-2'));
        card.addEventListener('drop', (e) => {
          e.preventDefault();
          card.classList.remove('border-indigo-500', 'ring-2');
          const fromIdx = parseInt(e.dataTransfer.getData('text/plain'), 10);
          const toIdx = idx;
          if (!isNaN(fromIdx) && fromIdx !== toIdx) {
            const moved = pageItems.splice(fromIdx, 1)[0];
            pageItems.splice(toIdx, 0, moved);
            currentPageNum = toIdx + 1;
            renderThumbStrip();
            renderActivePage();
            updateSwapDropdowns();
            updateChangesBadge();
            UI.showToast(`Moved Page ${fromIdx + 1} to position ${toIdx + 1}`, 'info');
          }
        });

        thumbStrip.appendChild(card);
      });
    };

    const updateThumbStripHighlight = () => {
      const cards = thumbStrip.querySelectorAll('.page-thumb-card, div');
      cards.forEach((card, idx) => {
        if (card.classList) {
          card.classList.toggle('ring-2', idx === currentPageNum - 1);
          card.classList.toggle('ring-indigo-500', idx === currentPageNum - 1);
        }
      });
    };

    // Update Swap Dropdowns
    const updateSwapDropdowns = () => {
      swapFrom.innerHTML = '';
      swapTo.innerHTML = '';
      sigTargetPage.innerHTML = '';

      pageItems.forEach((p, idx) => {
        if (p.deleted) return;
        const label = `Page ${idx + 1} (Orig #${p.originalPageNumber})`;
        
        const optA = document.createElement('option');
        optA.value = idx;
        optA.innerText = label;
        swapFrom.appendChild(optA);

        const optB = document.createElement('option');
        optB.value = idx;
        optB.innerText = label;
        swapTo.appendChild(optB);

        const optSig = document.createElement('option');
        optSig.value = idx;
        optSig.innerText = `Page ${idx + 1}`;
        sigTargetPage.appendChild(optSig);
      });

      if (swapTo.options.length > 1) swapTo.selectedIndex = 1;
      sigTargetPage.value = currentPageNum - 1;
    };

    // --- Page Operations Event Handlers ---
    swapBtn.addEventListener('click', () => {
      const a = parseInt(swapFrom.value, 10);
      const b = parseInt(swapTo.value, 10);
      if (isNaN(a) || isNaN(b) || a === b) {
        UI.showToast('Select two different pages to swap.', 'warning');
        return;
      }
      const temp = pageItems[a];
      pageItems[a] = pageItems[b];
      pageItems[b] = temp;
      renderThumbStrip();
      renderActivePage();
      updateSwapDropdowns();
      updateChangesBadge();
      UI.showToast(`Swapped Page ${a + 1} with Page ${b + 1}!`, 'success');
    });

    reverseBtn.addEventListener('click', () => {
      pageItems.reverse();
      renderThumbStrip();
      renderActivePage();
      updateSwapDropdowns();
      updateChangesBadge();
      UI.showToast('Reversed all page positions!', 'info');
    });

    rotCurrBtn.addEventListener('click', () => {
      const item = pageItems[currentPageNum - 1];
      if (item) {
        item.rotation = (item.rotation + 90) % 360;
        renderActivePage();
        updateChangesBadge();
      }
    });

    rotAllBtn.addEventListener('click', () => {
      pageItems.forEach(p => p.rotation = (p.rotation + 90) % 360);
      renderActivePage();
      updateChangesBadge();
      UI.showToast('Rotated all pages 90° Clockwise', 'info');
    });

    delCurrBtn.addEventListener('click', () => {
      const item = pageItems[currentPageNum - 1];
      if (item) {
        item.deleted = !item.deleted;
        renderThumbStrip();
        renderActivePage();
        updateSwapDropdowns();
        updateChangesBadge();
        UI.showToast(`Page ${currentPageNum} marked as ${item.deleted ? 'removed' : 'active'}.`, 'info');
      }
    });

    // --- Signature Generator ---
    const updateSigPreview = () => {
      if (currentSigMode === 'type') {
        sigPreviewText.classList.remove('hidden');
        sigPreviewImg.classList.add('hidden');
        sigPreviewText.innerText = sigNameInput.value || 'Signature';
        sigPreviewText.style.fontFamily = sigFontSelect.value;
        sigPreviewText.style.color = sigColor;
      } else if (currentSigMode === 'draw') {
        sigPreviewText.classList.add('hidden');
        sigPreviewImg.classList.remove('hidden');
        sigPreviewImg.src = sigPadCanvas.toDataURL('image/png');
      }
    };

    sigNameInput.addEventListener('input', updateSigPreview);
    sigFontSelect.addEventListener('change', updateSigPreview);

    container.querySelectorAll('.aio-sig-mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        currentSigMode = btn.dataset.mode;
        container.querySelectorAll('.aio-sig-mode-btn').forEach(b => {
          b.className = b === btn
            ? 'aio-sig-mode-btn flex-1 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-purple-700 shadow-sm'
            : 'aio-sig-mode-btn flex-1 py-1.5 rounded-lg text-slate-600 dark:text-slate-300';
        });

        container.querySelector('#aio-sig-type-sec').classList.toggle('hidden', currentSigMode !== 'type');
        container.querySelector('#aio-sig-draw-sec').classList.toggle('hidden', currentSigMode !== 'draw');
        container.querySelector('#aio-sig-upload-sec').classList.toggle('hidden', currentSigMode !== 'upload');

        updateSigPreview();
      });
    });

    container.querySelectorAll('.aio-sig-color').forEach(btn => {
      btn.addEventListener('click', () => {
        sigColor = btn.dataset.color;
        container.querySelectorAll('.aio-sig-color').forEach(b => b.classList.remove('ring-2', 'ring-purple-600', 'ring-offset-1'));
        btn.classList.add('ring-2', 'ring-purple-600', 'ring-offset-1');
        updateSigPreview();
      });
    });

    // Signature Pad drawing events
    if (sigPadCanvas && sigPadCtx) {
      sigPadCtx.lineWidth = 2.5;
      sigPadCtx.lineCap = 'round';
      sigPadCtx.lineJoin = 'round';

      sigPadCanvas.addEventListener('mousedown', (e) => {
        isDrawingSig = true;
        sigPadCtx.strokeStyle = sigColor;
        const rect = sigPadCanvas.getBoundingClientRect();
        sigPadCtx.beginPath();
        sigPadCtx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
      });

      sigPadCanvas.addEventListener('mousemove', (e) => {
        if (!isDrawingSig) return;
        const rect = sigPadCanvas.getBoundingClientRect();
        sigPadCtx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        sigPadCtx.stroke();
      });

      window.addEventListener('mouseup', () => {
        if (isDrawingSig) {
          isDrawingSig = false;
          updateSigPreview();
        }
      });

      sigClearPadBtn.addEventListener('click', () => {
        sigPadCtx.clearRect(0, 0, sigPadCanvas.width, sigPadCanvas.height);
        updateSigPreview();
      });
    }

    // Place Signature on Viewer
    addSigBtn.addEventListener('click', () => {
      const targetP = parseInt(sigTargetPage.value, 10);
      let dataUrl = '';

      if (currentSigMode === 'type') {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 400;
        tempCanvas.height = 120;
        const ctx = tempCanvas.getContext('2d');
        ctx.font = `48px ${sigFontSelect.value}`;
        ctx.fillStyle = sigColor;
        ctx.textBaseline = 'middle';
        ctx.fillText(sigNameInput.value || 'Dr. Vijayapriya Aki', 20, 60);
        dataUrl = tempCanvas.toDataURL('image/png');
      } else if (currentSigMode === 'draw') {
        dataUrl = sigPadCanvas.toDataURL('image/png');
      } else if (sigPreviewImg.src) {
        dataUrl = sigPreviewImg.src;
      }

      if (!dataUrl) return;

      signatures.push({
        pageIndex: targetP,
        signatureDataUrl: dataUrl,
        xRatio: 0.15,
        yRatio: 0.75,
        wRatio: 0.35,
        hRatio: 0.12
      });

      currentPageNum = targetP + 1;
      renderActivePage();
      updateChangesBadge();
      UI.showToast(`Placed draggable signature box on Page ${targetP + 1}! Drag to position.`, 'success');
    });

    // Place Correction / Whiteout Box on Viewer
    placeEditBoxBtn.addEventListener('click', () => {
      const pageIdx = currentPageNum - 1;
      textEdits.push({
        pageIndex: pageIdx,
        type: 'replace',
        origText: editOrigText.value || '',
        newText: editNewText.value || editOrigText.value || 'Correction',
        xRatio: 0.15,
        yRatio: 0.35,
        wRatio: 0.45,
        hRatio: 0.05
      });

      renderActivePage();
      updateChangesBadge();
      UI.showToast(`Placed correction box on Page ${currentPageNum}! Drag to position.`, 'info');
    });

    // Navigation & Zoom
    prevPageBtn.addEventListener('click', () => {
      if (currentPageNum > 1) {
        currentPageNum--;
        renderActivePage();
      }
    });

    nextPageBtn.addEventListener('click', () => {
      if (currentPageNum < pageItems.length) {
        currentPageNum++;
        renderActivePage();
      }
    });

    zoomInBtn.addEventListener('click', () => {
      currentZoom = Math.min(2.5, currentZoom + 0.15);
      zoomLevelEl.innerText = `${Math.round(currentZoom * 100)}%`;
      renderActivePage();
    });

    zoomOutBtn.addEventListener('click', () => {
      currentZoom = Math.max(0.6, currentZoom - 0.15);
      zoomLevelEl.innerText = `${Math.round(currentZoom * 100)}%`;
      renderActivePage();
    });

    zoomFitBtn.addEventListener('click', () => {
      currentZoom = 1.0;
      zoomLevelEl.innerText = '100%';
      renderActivePage();
    });

    wmOpacity.addEventListener('input', () => {
      wmOpVal.innerText = `${Math.round(wmOpacity.value * 100)}%`;
      updateChangesBadge();
    });
    wmEnabled.addEventListener('change', updateChangesBadge);
    compEnabled.addEventListener('change', updateChangesBadge);
    secEnabled.addEventListener('change', updateChangesBadge);

    // Preset Chip Buttons for Compression
    container.querySelectorAll('.aio-comp-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        compTargetVal.value = chip.dataset.val;
        compTargetUnit.value = chip.dataset.unit;
        compEnabled.checked = true;
        updateChangesBadge();
      });
    });

    // Dropzone File Loader
    UI.setupDropzone(dropzone, input, async (files) => {
      if (files.length === 0) return;
      currentFile = files[0];
      statusEl.innerText = `${currentFile.name} (${window.pdfEngine.formatBytes(currentFile.size)})`;
      currentBuffer = await window.pdfEngine.readFileAsArrayBuffer(currentFile);

      docTitleEl.innerText = currentFile.name;
      docSizeEl.innerText = window.pdfEngine.formatBytes(currentFile.size);

      try {
        UI.showProgress(0.2, 'Loading PDF structure into All-In-One Studio...');
        pdfJsDoc = await window.pdfEngine.getPdfJsDoc(window.pdfEngine.cloneBuffer(currentBuffer));
        const totalPages = pdfJsDoc.numPages;
        docPagesEl.innerText = `${totalPages} Pages`;

        pageItems = [];
        for (let i = 1; i <= totalPages; i++) {
          const thumbCanvas = document.createElement('canvas');
          thumbCanvas.className = 'max-w-full h-auto pointer-events-none';
          
          pageItems.push({
            originalIndex: i - 1,
            originalPageNumber: i,
            rotation: 0,
            deleted: false,
            canvasEl: thumbCanvas
          });

          // Pre-render small thumbnail
          window.pdfEngine.renderPageToCanvas(pdfJsDoc, i, thumbCanvas, 120);
        }

        currentPageNum = 1;
        workspace.classList.remove('hidden');
        renderThumbStrip();
        await renderActivePage();
        updateSwapDropdowns();
        updateChangesBadge();
        UI.hideProgress();
        UI.showToast('All-In-One Studio ready!', 'success');
      } catch (err) {
        UI.hideProgress();
        UI.showToast(`Failed to open PDF: ${err.message}`, 'error');
      }
    });

    closeBtn.addEventListener('click', () => {
      currentBuffer = null;
      currentFile = null;
      pdfJsDoc = null;
      pageItems = [];
      signatures = [];
      textEdits = [];
      redactions = [];
      workspace.classList.add('hidden');
      dropzone.classList.remove('hidden');
      input.value = '';
    });

    resetBtn.addEventListener('click', () => {
      if (!pdfJsDoc) return;
      pageItems.sort((a, b) => a.originalIndex - b.originalIndex);
      pageItems.forEach(p => { p.rotation = 0; p.deleted = false; });
      signatures = [];
      textEdits = [];
      redactions = [];
      wmEnabled.checked = false;
      compEnabled.checked = false;
      secEnabled.checked = false;
      renderThumbStrip();
      renderActivePage();
      updateSwapDropdowns();
      updateChangesBadge();
      UI.showToast('Reset all changes to original document.', 'info');
    });

    // --- MASTER EXPORT PIPELINE ---
    exportBtn.addEventListener('click', async () => {
      if (!currentBuffer || pageItems.length === 0) return;
      const activePages = pageItems.filter(p => !p.deleted);
      if (activePages.length === 0) {
        UI.showToast('Cannot export empty document. Restore at least one page.', 'error');
        return;
      }

      try {
        UI.showProgress(0.1, 'Step 1/6: Organizing & swapping pages...');
        const bufferToUse = currentBuffer?.byteLength > 0 ? currentBuffer : await currentFile.arrayBuffer();
        
        // 1. Organize, reorder, swap, and rotate pages
        let workingBlob = await window.pdfEngine.organizePages(window.pdfEngine.cloneBuffer(bufferToUse), activePages);
        let workingBuffer = await workingBlob.arrayBuffer();

        // 2. Apply Text Edits & Corrections if present
        if (textEdits.length > 0) {
          UI.showProgress(0.3, 'Step 2/6: Applying text replacements & corrections...');
          const formattedEdits = textEdits.map(t => ({
            page: t.pageIndex + 1,
            type: 'replace',
            origText: t.origText,
            newText: t.newText,
            font: 'Helvetica',
            size: 11,
            color: '#000000',
            bgWhiteout: true,
            // Convert ratios to PDF coordinates approximately
            x: Math.round(t.xRatio * 595),
            y: Math.round((1 - t.yRatio - t.hRatio) * 842),
            width: Math.round(t.wRatio * 595),
            height: Math.max(14, Math.round(t.hRatio * 842))
          }));

          workingBlob = await window.pdfEngine.applyEdits(workingBuffer, formattedEdits);
          workingBuffer = await workingBlob.arrayBuffer();
        }

        // 3. Apply Digital Signatures
        if (signatures.length > 0) {
          UI.showProgress(0.5, 'Step 3/6: Stamping digital signatures...');
          const sigList = signatures.map(s => ({
            pageIndex: s.pageIndex,
            signatureDataUrl: s.signatureDataUrl,
            x: s.xRatio,
            y: s.yRatio,
            width: s.wRatio,
            height: s.hRatio
          }));

          workingBlob = await window.pdfEngine.applySignature(workingBuffer, sigList);
          workingBuffer = await workingBlob.arrayBuffer();
        }

        // 4. Apply Watermark
        if (wmEnabled.checked && wmText.value.trim()) {
          UI.showProgress(0.7, 'Step 4/6: Stamping watermark...');
          workingBlob = await window.pdfEngine.addWatermark(workingBuffer, {
            type: 'text',
            text: wmText.value.trim(),
            opacity: parseFloat(wmOpacity.value) || 0.25,
            position: wmPos.value,
            color: wmColor.value || '#e11d48'
          });
          workingBuffer = await workingBlob.arrayBuffer();
        }

        // 5. Apply Compression if requested
        if (compEnabled.checked) {
          UI.showProgress(0.85, 'Step 5/6: Compressing document to target size...');
          const val = parseFloat(compTargetVal.value) || 2;
          const unit = compTargetUnit.value;
          const multipliers = { 'Bytes': 1, 'KB': 1024, 'MB': 1024 * 1024, 'GB': 1024 * 1024 * 1024 };
          const targetBytes = Math.max(1024, Math.round(val * (multipliers[unit] || 1024 * 1024)));

          workingBlob = await window.pdfEngine.compressPdfToTarget(workingBuffer, targetBytes, (pct, status) => {
            UI.showProgress(0.85 + pct * 0.10, status);
          });
          workingBuffer = await workingBlob.arrayBuffer();
        }

        // 6. Apply Security Encryption if requested
        if (secEnabled.checked && secPassword.value) {
          UI.showProgress(0.95, 'Step 6/6: Encrypting with AES-256 password protection...');
          workingBlob = await window.pdfEngine.protectPdf(workingBuffer, secPassword.value, secPassword.value);
        }

        UI.hideProgress();
        UI.celebrate();
        UI.showToast('All operations applied successfully!', 'success');

        UI.showResultPreview({
          title: 'All-In-One Document Ready',
          subtitle: `All operations completed seamlessly (${window.pdfEngine.formatBytes(workingBlob.size)}). Inspect visual quality below before saving:`,
          blob: workingBlob,
          filename: `${currentFile ? currentFile.name.replace(/\.pdf$/i, '') : 'document'}_all_in_one.pdf`,
          originalSize: currentFile ? currentFile.size : null
        });

      } catch (err) {
        UI.hideProgress();
        UI.showToast(`Error during export pipeline: ${err.message}`, 'error');
      }
    });

  }
};
