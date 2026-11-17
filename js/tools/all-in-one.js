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
    // Page items: { originalIndex, originalPageNumber, rotation, deleted, canvasEl }
    let pageItems = [];

    // Signatures: array of { id, pageIndex, signatureDataUrl, xRatio, yRatio, wRatio, hRatio }
    let signatures = [];

    // Watermark Configuration: { enabled, type: 'text'|'image', text, fontSize, colorHex, opacity, angle, position, imageBuffer, imageType, imageScale, imageDataUrl }
    let watermarkConfig = {
      enabled: false,
      type: 'text',
      text: 'CONFIDENTIAL',
      fontSize: 48,
      colorHex: '#e11d48',
      opacity: 0.25,
      angle: -45,
      position: 'center-diag',
      imageBuffer: null,
      imageType: 'image/png',
      imageScale: 50,
      imageDataUrl: null
    };

    // Text Edits & Whiteouts: array of { id, pageIndex, type: 'replace'|'whiteout', origText, newText, fontSize, fontColor, xRatio, yRatio, wRatio, hRatio }
    let textEdits = [];

    // Redactions: array of { id, pageIndex, xRatio, yRatio, wRatio, hRatio }
    let redactions = [];

    // Compression settings: { enabled, mode: 'target'|'raster', targetVal, targetUnit, level }
    let compressConfig = {
      enabled: false,
      mode: 'target',
      targetVal: 2,
      targetUnit: 'MB',
      level: 'recommended'
    };

    // Security settings: { enabled, password }
    let securityConfig = {
      enabled: false,
      password: ''
    };

    // Active tool tab: 'pages' | 'sign' | 'watermark' | 'edit' | 'compress' | 'security'
    let activeTab = 'pages';

    // Signature Pad & Generator State
    let currentSigMode = 'type'; // 'type' | 'draw' | 'upload'
    let sigColor = '#1d4ed8';
    let isDrawingSig = false;

    // Edit tool mode: 'replace' | 'whiteout'
    let currentEditMode = 'replace';

    container.innerHTML = `
      <div class="max-w-6xl mx-auto space-y-5">
        <!-- Title & Subtitle -->
        <div class="text-center space-y-1">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
            <span>All-In-One Unified PDF Studio</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">All-In-One PDF Studio</h2>
          <p class="text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto">Perform all operations in one place with full individual tool capabilities: pinpoint signature placement, text & image watermarks, live zoom scaler, sentence editing, page swapping, compression & security.</p>
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
              <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center border border-indigo-200 dark:border-indigo-900">
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
              <i data-lucide="layout-grid" class="w-3.5 h-3.5 inline mr-1"></i> 1. Organize & Swap
            </button>
            <button class="aio-tab-btn px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 transition whitespace-nowrap" data-tab="sign">
              <i data-lucide="pen-tool" class="w-3.5 h-3.5 inline mr-1"></i> 2. Sign PDF
            </button>
            <button class="aio-tab-btn px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 transition whitespace-nowrap" data-tab="watermark">
              <i data-lucide="stamp" class="w-3.5 h-3.5 inline mr-1"></i> 3. Watermark (Text/Image)
            </button>
            <button class="aio-tab-btn px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 transition whitespace-nowrap" data-tab="edit">
              <i data-lucide="edit-3" class="w-3.5 h-3.5 inline mr-1"></i> 4. Edit Text & Whiteout
            </button>
            <button class="aio-tab-btn px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 transition whitespace-nowrap" data-tab="compress">
              <i data-lucide="minimize-2" class="w-3.5 h-3.5 inline mr-1"></i> 5. Compress PDF
            </button>
            <button class="aio-tab-btn px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 transition whitespace-nowrap" data-tab="security">
              <i data-lucide="lock" class="w-3.5 h-3.5 inline mr-1"></i> 6. Security & Password
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
                <span class="text-xs text-purple-600 font-semibold bg-purple-50 dark:bg-purple-950/40 px-2.5 py-0.5 rounded-full">Pinpoint Draggable Placement</span>
              </div>

              <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <!-- Signature Controls -->
                <div class="lg:col-span-5 space-y-3">
                  <div class="flex rounded-xl bg-slate-100 dark:bg-slate-700 p-1 text-xs font-bold">
                    <button class="aio-sig-mode-btn flex-1 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-purple-700 shadow-sm" data-mode="type">Type Name</button>
                    <button class="aio-sig-mode-btn flex-1 py-1.5 rounded-lg text-slate-600 dark:text-slate-300" data-mode="draw">Draw</button>
                    <button class="aio-sig-mode-btn flex-1 py-1.5 rounded-lg text-slate-600 dark:text-slate-300" data-mode="upload">Upload Image</button>
                  </div>

                  <!-- Type Name -->
                  <div id="aio-sig-type-sec" class="space-y-2">
                    <div>
                      <label class="text-xs font-semibold text-slate-500 block mb-1">Signer Name / Title:</label>
                      <input type="text" id="aio-sig-name" value="Dr. Vijayapriya Aki" class="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-purple-500">
                    </div>
                    <div>
                      <label class="text-xs font-semibold text-slate-500 block mb-1">Font Style:</label>
                      <select id="aio-sig-font" class="w-full text-xs font-medium p-2 rounded-xl border border-slate-200 dark:border-slate-700 outline-none">
                        <option value="'Dancing Script', cursive">Dancing Script (Classic Cursive)</option>
                        <option value="'Caveat', cursive">Caveat (Modern Casual)</option>
                        <option value="'Great Vibes', cursive">Great Vibes (Formal Calligraphy)</option>
                        <option value="'Playfair Display', serif">Playfair Display (Executive Serif)</option>
                      </select>
                    </div>
                    <div>
                      <div class="flex justify-between text-xs font-semibold text-slate-500 mb-1">
                        <span>Font Size:</span>
                        <span id="aio-sig-size-val">36 pt</span>
                      </div>
                      <input type="range" id="aio-sig-size-slider" min="20" max="72" value="36" class="w-full accent-purple-600">
                    </div>
                  </div>

                  <!-- Draw Canvas -->
                  <div id="aio-sig-draw-sec" class="space-y-2 hidden">
                    <div class="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white shadow-inner">
                      <canvas id="aio-sig-pad" width="360" height="120" class="w-full cursor-crosshair"></canvas>
                    </div>
                    <div class="flex items-center justify-between text-xs">
                      <button id="aio-sig-clear-pad" class="text-red-600 font-semibold hover:underline">Clear Canvas</button>
                      <span class="text-slate-400">Draw with mouse or touchscreen</span>
                    </div>
                  </div>

                  <!-- Upload Image -->
                  <div id="aio-sig-upload-sec" class="space-y-2 hidden">
                    <label class="text-xs font-semibold text-slate-500 block mb-1">Upload Signature Stamp (PNG / JPG):</label>
                    <input type="file" id="aio-sig-file" accept="image/png,image/jpeg" class="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:bg-purple-50 file:text-purple-700">
                  </div>

                  <!-- Color Selection -->
                  <div class="flex items-center justify-between pt-1">
                    <span class="text-xs font-semibold text-slate-500">Ink Color:</span>
                    <div class="flex items-center gap-2">
                      <button class="aio-sig-color w-7 h-7 rounded-full bg-blue-700 ring-2 ring-purple-600 ring-offset-2 transition" data-color="#1d4ed8" title="Royal Blue"></button>
                      <button class="aio-sig-color w-7 h-7 rounded-full bg-slate-900 transition" data-color="#0f172a" title="Dark Navy"></button>
                      <button class="aio-sig-color w-7 h-7 rounded-full bg-red-700 transition" data-color="#b91c1c" title="Crimson Red"></button>
                    </div>
                  </div>
                </div>

                <!-- Preview & Placement Target -->
                <div class="lg:col-span-7 flex flex-col justify-between space-y-3">
                  <div>
                    <label class="text-xs font-semibold text-slate-500 block mb-1">Signature Stamp Preview:</label>
                    <div id="aio-sig-preview-box" class="h-32 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center p-3 overflow-hidden shadow-inner">
                      <span id="aio-sig-preview-text" style="font-family: 'Dancing Script', cursive; font-size: 36px; color: #1d4ed8;">Dr. Vijayapriya Aki</span>
                      <img id="aio-sig-preview-img" class="max-h-full object-contain hidden" alt="Signature">
                    </div>
                  </div>

                  <div class="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-700">
                    <div class="flex items-center gap-2 text-xs">
                      <span class="font-semibold text-slate-600 dark:text-slate-300">Place on:</span>
                      <select id="aio-sig-target-page" class="font-bold p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"></select>
                    </div>

                    <button id="aio-add-sig-btn" class="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition flex items-center gap-2">
                      <i data-lucide="plus-circle" class="w-4 h-4"></i>
                      <span>Place Draggable Signature on Page</span>
                    </button>
                  </div>

                  <p class="text-[11px] text-slate-400">Once placed on the viewer canvas below, drag the box to position it precisely and drag the corner handle to resize it.</p>
                </div>
              </div>
            </div>

            <!-- PANEL 3: WATERMARK (TEXT & IMAGE OPTIONS) -->
            <div id="panel-watermark" class="aio-panel hidden space-y-4">
              <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                  <h3 class="font-bold text-sm text-slate-800 dark:text-slate-100">Stamp Text or Image Watermark</h3>
                </div>
                <div class="flex items-center gap-3">
                  <div class="flex items-center gap-2">
                    <input type="checkbox" id="aio-wm-enabled" class="rounded text-indigo-600">
                    <label for="aio-wm-enabled" class="text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer">Enable Watermark</label>
                  </div>
                  <div class="flex rounded-lg bg-slate-100 p-0.5 text-xs font-bold">
                    <button id="aio-wm-tab-text" class="px-3 py-1 rounded-md bg-white text-indigo-700 shadow-sm">Text Watermark</button>
                    <button id="aio-wm-tab-img" class="px-3 py-1 rounded-md text-slate-500 hover:text-slate-800">Image Watermark</button>
                  </div>
                </div>
              </div>

              <!-- TEXT WATERMARK OPTIONS -->
              <div id="aio-wm-sec-text" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <label class="font-semibold text-slate-500 block mb-1">Watermark Text:</label>
                  <input type="text" id="aio-wm-text" value="CONFIDENTIAL" class="w-full font-bold p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none">
                </div>
                <div>
                  <label class="font-semibold text-slate-500 block mb-1">Font Family:</label>
                  <select id="aio-wm-font" class="w-full font-medium p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none">
                    <option value="Helvetica">Helvetica (Standard Sans)</option>
                    <option value="Times">Times New Roman (Serif)</option>
                    <option value="Courier">Courier (Monospace)</option>
                  </select>
                </div>
                <div>
                  <div class="flex justify-between font-semibold text-slate-500 mb-1">
                    <span>Font Size:</span>
                    <span id="aio-wm-size-val">48 pt</span>
                  </div>
                  <input type="range" id="aio-wm-size" min="16" max="100" value="48" class="w-full accent-indigo-600">
                </div>
                <div>
                  <label class="font-semibold text-slate-500 block mb-1">Color:</label>
                  <div class="flex items-center gap-2">
                    <input type="color" id="aio-wm-color" value="#e11d48" class="w-10 h-9 rounded-xl border border-slate-200 p-0.5 cursor-pointer">
                    <span id="aio-wm-color-hex" class="text-xs font-mono text-slate-500">#E11D48</span>
                  </div>
                </div>
              </div>

              <!-- IMAGE WATERMARK OPTIONS -->
              <div id="aio-wm-sec-img" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs hidden">
                <div>
                  <label class="font-semibold text-slate-500 block mb-1">Upload Logo / Image (PNG / JPG):</label>
                  <input type="file" id="aio-wm-img-input" accept="image/png,image/jpeg" class="w-full file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-indigo-50 file:text-indigo-700 font-medium">
                </div>
                <div>
                  <div class="flex justify-between font-semibold text-slate-500 mb-1">
                    <span>Image Scale / Size:</span>
                    <span id="aio-wm-scale-val">50%</span>
                  </div>
                  <input type="range" id="aio-wm-scale" min="10" max="100" value="50" class="w-full accent-indigo-600">
                </div>
                <div class="flex items-center gap-3">
                  <div id="aio-wm-img-thumb" class="w-14 h-14 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
                    <span class="text-[10px] text-slate-400">No Image</span>
                  </div>
                  <span class="text-[11px] text-slate-400">Uploaded logo will be stamped cleanly across pages.</span>
                </div>
              </div>

              <!-- COMMON POSITION, ANGLE & OPACITY -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100 dark:border-slate-700 text-xs">
                <div>
                  <label class="font-semibold text-slate-500 block mb-1">Position & Alignment:</label>
                  <select id="aio-wm-pos" class="w-full font-medium p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none">
                    <option value="center-diag" selected>Center (Diagonal)</option>
                    <option value="center">Center (Horizontal)</option>
                    <option value="top-left">Top Left</option>
                    <option value="top-center">Top Center</option>
                    <option value="top-right">Top Right</option>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="bottom-center">Bottom Center</option>
                    <option value="bottom-right">Bottom Right</option>
                  </select>
                </div>

                <div>
                  <div class="flex justify-between font-semibold text-slate-500 mb-1">
                    <span>Opacity:</span>
                    <span id="aio-wm-op-val">25%</span>
                  </div>
                  <input type="range" id="aio-wm-opacity" min="0.05" max="0.95" step="0.05" value="0.25" class="w-full accent-indigo-600">
                </div>

                <div>
                  <div class="flex justify-between font-semibold text-slate-500 mb-1">
                    <span>Rotation Angle:</span>
                    <span id="aio-wm-ang-val">-45°</span>
                  </div>
                  <input type="range" id="aio-wm-angle" min="-180" max="180" step="5" value="-45" class="w-full accent-indigo-600">
                </div>
              </div>
            </div>

            <!-- PANEL 4: EDIT TEXT & WHITEOUT -->
            <div id="panel-edit" class="aio-panel hidden space-y-4">
              <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
                  <h3 class="font-bold text-sm text-slate-800 dark:text-slate-100">Edit Sentences, Whiteout Errors & Text Fixes</h3>
                </div>
                <div class="flex rounded-lg bg-slate-100 p-0.5 text-xs font-bold">
                  <button id="aio-edit-tab-replace" class="px-3 py-1 rounded-md bg-white text-rose-700 shadow-sm">Replace Sentence</button>
                  <button id="aio-edit-tab-whiteout" class="px-3 py-1 rounded-md text-slate-500 hover:text-slate-800">Whiteout Block</button>
                </div>
              </div>

              <!-- REPLACE SENTENCE SECTION -->
              <div id="aio-edit-sec-replace" class="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                <div class="md:col-span-5 space-y-1">
                  <label class="font-semibold text-slate-500 block">Original Sentence / Text to Correct:</label>
                  <input type="text" id="aio-edit-orig-text" placeholder="e.g. Total Amount: $450 or Patient: John Doe" class="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none">
                </div>
                <div class="md:col-span-5 space-y-1">
                  <label class="font-semibold text-slate-500 block">New Replacement Sentence:</label>
                  <input type="text" id="aio-edit-new-text" placeholder="e.g. Total Amount: $350 or Patient: Dr. Vijayapriya Aki" class="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none">
                </div>
                <div class="md:col-span-2 flex items-end">
                  <button id="aio-place-edit-box-btn" class="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-rose-600/20">
                    <i data-lucide="plus" class="w-3.5 h-3.5"></i>
                    <span>Place Box</span>
                  </button>
                </div>
              </div>

              <!-- WHITEOUT BLOCK SECTION -->
              <div id="aio-edit-sec-whiteout" class="space-y-3 text-xs hidden">
                <p class="text-slate-500">Places a clean, opaque whiteout block on the active page to erase unwanted text, typos, or stamps without altering the document structure.</p>
                <button id="aio-place-whiteout-box-btn" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition flex items-center gap-2">
                  <i data-lucide="square" class="w-3.5 h-3.5"></i>
                  <span>Place Whiteout Block on Active Page</span>
                </button>
              </div>

              <p class="text-[11px] text-slate-400">Position the placed box over the text on the viewer canvas below. It cleanly whites out the old text and draws the replacement in scalable typography.</p>
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
                <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 space-y-2.5">
                  <span class="font-bold text-slate-800 dark:text-slate-200 block">Target File Size Limit:</span>
                  <div class="flex items-center gap-2">
                    <input type="number" id="aio-comp-target-val" value="2" step="any" min="0.01" class="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-bold outline-none">
                    <select id="aio-comp-target-unit" class="p-2.5 rounded-xl border border-slate-200 bg-white font-bold outline-none">
                      <option value="MB" selected>MB</option>
                      <option value="KB">KB</option>
                      <option value="Bytes">Bytes</option>
                      <option value="GB">GB</option>
                    </select>
                  </div>
                  <div class="flex flex-wrap gap-1.5 pt-1">
                    <button type="button" class="aio-comp-chip px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs font-medium hover:border-emerald-500" data-val="500" data-unit="KB">500 KB</button>
                    <button type="button" class="aio-comp-chip px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs font-medium hover:border-emerald-500" data-val="1" data-unit="MB">1 MB</button>
                    <button type="button" class="aio-comp-chip px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs font-medium hover:border-emerald-500" data-val="2" data-unit="MB">2 MB</button>
                    <button type="button" class="aio-comp-chip px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs font-medium hover:border-emerald-500" data-val="5" data-unit="MB">5 MB</button>
                  </div>
                </div>

                <!-- Downsampling Presets -->
                <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 space-y-2.5">
                  <span class="font-bold text-slate-800 dark:text-slate-200 block">Compression Presets:</span>
                  <div class="grid grid-cols-3 gap-2 text-center">
                    <button type="button" class="aio-preset-btn p-3 rounded-xl border border-slate-200 bg-white text-xs font-bold hover:border-emerald-500" data-level="extreme">Extreme (~75%)</button>
                    <button type="button" class="aio-preset-btn p-3 rounded-xl border-2 border-emerald-500 bg-emerald-50 text-emerald-800 text-xs font-bold" data-level="recommended">Recommended (~50%)</button>
                    <button type="button" class="aio-preset-btn p-3 rounded-xl border border-slate-200 bg-white text-xs font-bold hover:border-emerald-500" data-level="less">Less (~25%)</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- PANEL 6: SECURITY & PASSWORD -->
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
                <div class="relative">
                  <input type="password" id="aio-sec-password" placeholder="Enter password to encrypt PDF" class="w-full p-2.5 pr-10 rounded-xl border border-slate-200 dark:border-slate-700 outline-none">
                  <button type="button" id="aio-sec-toggle-pwd" class="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600">
                    <i data-lucide="eye" class="w-4 h-4"></i>
                  </button>
                </div>
                <p class="text-[11px] text-slate-400">Recipient must enter this password to view or print the exported PDF.</p>
              </div>
            </div>

          </div>

          <!-- CENTRAL LIVE DOCUMENT VIEWER WITH ZOOM SCALER -->
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

              <!-- High-Fidelity Zoom Controls (Zero Quality Loss) -->
              <div class="flex items-center gap-2 text-xs">
                <span class="text-slate-400 font-semibold">Scaler:</span>
                <button id="aio-zoom-out" class="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 font-bold" title="Zoom Out (-)">-</button>
                <span id="aio-zoom-level" class="font-bold min-w-[50px] text-center text-slate-800 dark:text-slate-200">100%</span>
                <button id="aio-zoom-in" class="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 font-bold" title="Zoom In (+)">+</button>
                <button id="aio-zoom-fit" class="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 font-bold text-[11px]">Fit</button>
              </div>
            </div>

            <!-- Page Viewer Viewport with Interactive Overlays & Watermark Canvas -->
            <div class="relative w-full flex items-center justify-center p-4 bg-slate-100 dark:bg-slate-900/60 rounded-xl overflow-auto min-h-[480px]">
              <div id="aio-canvas-container" class="relative shadow-xl rounded overflow-visible bg-white">
                <!-- Base PDF Page Canvas -->
                <canvas id="aio-main-canvas" class="block max-w-none"></canvas>
                
                <!-- Live Watermark Preview Canvas -->
                <canvas id="aio-watermark-canvas" class="absolute inset-0 pointer-events-none"></canvas>
                
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
    const watermarkCanvas = container.querySelector('#aio-watermark-canvas');
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

    // Organize Elements
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
    const sigSizeSlider = container.querySelector('#aio-sig-size-slider');
    const sigSizeVal = container.querySelector('#aio-sig-size-val');
    const sigPreviewText = container.querySelector('#aio-sig-preview-text');
    const sigPreviewImg = container.querySelector('#aio-sig-preview-img');
    const sigPadCanvas = container.querySelector('#aio-sig-pad');
    const sigClearPadBtn = container.querySelector('#aio-sig-clear-pad');
    const sigFileInput = container.querySelector('#aio-sig-file');
    const sigTargetPage = container.querySelector('#aio-sig-target-page');
    const addSigBtn = container.querySelector('#aio-add-sig-btn');

    // Watermark Elements
    const wmEnabled = container.querySelector('#aio-wm-enabled');
    const wmTabText = container.querySelector('#aio-wm-tab-text');
    const wmTabImg = container.querySelector('#aio-wm-tab-img');
    const wmSecText = container.querySelector('#aio-wm-sec-text');
    const wmSecImg = container.querySelector('#aio-wm-sec-img');
    const wmText = container.querySelector('#aio-wm-text');
    const wmFont = container.querySelector('#aio-wm-font');
    const wmSize = container.querySelector('#aio-wm-size');
    const wmSizeVal = container.querySelector('#aio-wm-size-val');
    const wmColor = container.querySelector('#aio-wm-color');
    const wmColorHex = container.querySelector('#aio-wm-color-hex');
    const wmImgInput = container.querySelector('#aio-wm-img-input');
    const wmScale = container.querySelector('#aio-wm-scale');
    const wmScaleVal = container.querySelector('#aio-wm-scale-val');
    const wmImgThumb = container.querySelector('#aio-wm-img-thumb');
    const wmPos = container.querySelector('#aio-wm-pos');
    const wmOpacity = container.querySelector('#aio-wm-opacity');
    const wmOpVal = container.querySelector('#aio-wm-op-val');
    const wmAngle = container.querySelector('#aio-wm-angle');
    const wmAngVal = container.querySelector('#aio-wm-ang-val');

    // Edit Elements
    const editTabReplace = container.querySelector('#aio-edit-tab-replace');
    const editTabWhiteout = container.querySelector('#aio-edit-tab-whiteout');
    const editSecReplace = container.querySelector('#aio-edit-sec-replace');
    const editSecWhiteout = container.querySelector('#aio-edit-sec-whiteout');
    const editOrigText = container.querySelector('#aio-edit-orig-text');
    const editNewText = container.querySelector('#aio-edit-new-text');
    const placeEditBoxBtn = container.querySelector('#aio-place-edit-box-btn');
    const placeWhiteoutBoxBtn = container.querySelector('#aio-place-whiteout-box-btn');

    // Compress Elements
    const compEnabled = container.querySelector('#aio-comp-enabled');
    const compTargetVal = container.querySelector('#aio-comp-target-val');
    const compTargetUnit = container.querySelector('#aio-comp-target-unit');

    // Security Elements
    const secEnabled = container.querySelector('#aio-sec-enabled');
    const secPassword = container.querySelector('#aio-sec-password');
    const secTogglePwd = container.querySelector('#aio-sec-toggle-pwd');

    let sigPadCtx = sigPadCanvas ? sigPadCanvas.getContext('2d') : null;

    // --- Update Pending Changes Badge ---
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

    // --- Tab Switching ---
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

    // --- Render Current Active Page on Main Viewer ---
    const renderActivePage = async () => {
      if (!pdfJsDoc || pageItems.length === 0) return;
      
      const activeItem = pageItems[currentPageNum - 1];
      if (!activeItem) return;

      viewerCurrPage.innerText = currentPageNum;
      viewerTotalPages.innerText = pageItems.length;
      prevPageBtn.disabled = currentPageNum <= 1;
      nextPageBtn.disabled = currentPageNum >= pageItems.length;

      // Render via PDFEngine with HiDPI supersampling
      const baseWidth = Math.round(620 * currentZoom);
      await window.pdfEngine.renderPageToCanvas(pdfJsDoc, activeItem.originalPageNumber, mainCanvas, baseWidth);
      
      // Apply active page rotation
      mainCanvas.style.transform = `rotate(${activeItem.rotation}deg)`;

      // Match canvas dimensions exactly for watermark & overlays
      watermarkCanvas.width = mainCanvas.width;
      watermarkCanvas.height = mainCanvas.height;
      watermarkCanvas.style.width = mainCanvas.style.width;
      watermarkCanvas.style.height = mainCanvas.style.height;

      overlaysLayer.style.width = mainCanvas.style.width;
      overlaysLayer.style.height = mainCanvas.style.height;

      renderWatermarkPreview();
      renderOverlays();
      updateThumbStripHighlight();
    };

    // --- Live Watermark Preview on Viewer ---
    const renderWatermarkPreview = () => {
      if (!watermarkCanvas || watermarkCanvas.width === 0) return;
      const ctx = watermarkCanvas.getContext('2d');
      ctx.clearRect(0, 0, watermarkCanvas.width, watermarkCanvas.height);

      if (!wmEnabled.checked) return;

      const width = watermarkCanvas.width;
      const height = watermarkCanvas.height;
      const opacity = parseFloat(wmOpacity.value) || 0.25;
      const angleDeg = parseInt(wmAngle.value, 10) || 0;
      const angleRad = (angleDeg * Math.PI) / 180;
      const pos = wmPos.value;

      ctx.save();
      ctx.globalAlpha = opacity;

      if (watermarkConfig.type === 'text') {
        const text = wmText.value.trim() || 'CONFIDENTIAL';
        const fontSize = (parseInt(wmSize.value, 10) || 48) * (width / 595);
        ctx.font = `bold ${fontSize}px ${wmFont.value || 'Helvetica'}, sans-serif`;
        ctx.fillStyle = wmColor.value || '#e11d48';

        let cx = width / 2;
        let cy = height / 2;

        if (pos === 'top-left') { cx = width * 0.2; cy = height * 0.15; }
        else if (pos === 'top-center') { cx = width * 0.5; cy = height * 0.15; }
        else if (pos === 'top-right') { cx = width * 0.8; cy = height * 0.15; }
        else if (pos === 'bottom-left') { cx = width * 0.2; cy = height * 0.85; }
        else if (pos === 'bottom-center') { cx = width * 0.5; cy = height * 0.85; }
        else if (pos === 'bottom-right') { cx = width * 0.8; cy = height * 0.85; }

        ctx.translate(cx, cy);
        ctx.rotate(angleRad);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 0, 0);

      } else if (watermarkConfig.type === 'image' && watermarkConfig.imageDataUrl) {
        const img = new Image();
        img.onload = () => {
          ctx.save();
          ctx.globalAlpha = opacity;
          const scalePct = (parseInt(wmScale.value, 10) || 50) / 100;
          const imgW = (width * 0.6) * scalePct;
          const imgH = imgW * (img.height / img.width);

          let cx = width / 2;
          let cy = height / 2;

          if (pos === 'top-left') { cx = imgW / 2 + 20; cy = imgH / 2 + 20; }
          else if (pos === 'top-center') { cx = width / 2; cy = imgH / 2 + 20; }
          else if (pos === 'top-right') { cx = width - imgW / 2 - 20; cy = imgH / 2 + 20; }
          else if (pos === 'bottom-left') { cx = imgW / 2 + 20; cy = height - imgH / 2 - 20; }
          else if (pos === 'bottom-center') { cx = width / 2; cy = height - imgH / 2 - 20; }
          else if (pos === 'bottom-right') { cx = width - imgW / 2 - 20; cy = height - imgH / 2 - 20; }

          ctx.translate(cx, cy);
          ctx.rotate(angleRad);
          ctx.drawImage(img, -imgW / 2, -imgH / 2, imgW, imgH);
          ctx.restore();
        };
        img.src = watermarkConfig.imageDataUrl;
      }

      ctx.restore();
    };

    // --- Render Overlays for Current Page (Signatures, Edits, Whiteouts) ---
    const renderOverlays = () => {
      overlaysLayer.innerHTML = '';
      const pageIdx = currentPageNum - 1;

      // 1. Render Signatures on this page
      signatures.filter(s => s.pageIndex === pageIdx).forEach((sig, sIdx) => {
        const box = document.createElement('div');
        box.className = 'absolute border-2 border-purple-600 bg-purple-500/10 rounded cursor-move pointer-events-auto flex items-center justify-center group shadow-md';
        box.style.left = `${sig.xRatio * 100}%`;
        box.style.top = `${sig.yRatio * 100}%`;
        box.style.width = `${sig.wRatio * 100}%`;
        box.style.height = `${sig.hRatio * 100}%`;

        box.innerHTML = `
          <img src="${sig.signatureDataUrl}" class="max-w-full max-h-full object-contain pointer-events-none select-none">
          <div class="aio-resize-handle absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-purple-600 rounded-full cursor-se-resize border-2 border-white shadow opacity-0 group-hover:opacity-100 transition"></div>
          <button class="aio-del-sig absolute -top-2.5 -right-2.5 w-5 h-5 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow">
            &times;
          </button>
        `;

        // Enable Dragging & Resizing
        attachDragAndResize(box, sig, () => updateChangesBadge());

        box.querySelector('.aio-del-sig').addEventListener('click', (e) => {
          e.stopPropagation();
          const realIdx = signatures.indexOf(sig);
          if (realIdx !== -1) signatures.splice(realIdx, 1);
          renderOverlays();
          updateChangesBadge();
        });

        overlaysLayer.appendChild(box);
      });

      // 2. Render Text Edits & Whiteouts on this page
      textEdits.filter(t => t.pageIndex === pageIdx).forEach((edit, eIdx) => {
        const box = document.createElement('div');
        const isWhiteout = edit.type === 'whiteout';
        box.className = `absolute border-2 border-dashed ${isWhiteout ? 'border-slate-500 bg-white' : 'border-rose-500 bg-white/95'} rounded pointer-events-auto flex items-center justify-center px-1 text-slate-800 text-xs font-semibold group shadow-md`;
        box.style.left = `${edit.xRatio * 100}%`;
        box.style.top = `${edit.yRatio * 100}%`;
        box.style.width = `${edit.wRatio * 100}%`;
        box.style.height = `${edit.hRatio * 100}%`;

        box.innerHTML = `
          <span class="truncate pointer-events-none select-none text-[11px]">${edit.newText || edit.origText || (isWhiteout ? 'Whiteout' : 'Correction')}</span>
          <div class="aio-resize-handle absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 ${isWhiteout ? 'bg-slate-700' : 'bg-rose-600'} rounded-full cursor-se-resize border-2 border-white shadow opacity-0 group-hover:opacity-100 transition"></div>
          <button class="aio-del-edit absolute -top-2.5 -right-2.5 w-5 h-5 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow">
            &times;
          </button>
        `;

        attachDragAndResize(box, edit, () => updateChangesBadge());

        box.querySelector('.aio-del-edit').addEventListener('click', (e) => {
          e.stopPropagation();
          const realIdx = textEdits.indexOf(edit);
          if (realIdx !== -1) textEdits.splice(realIdx, 1);
          renderOverlays();
          updateChangesBadge();
        });

        overlaysLayer.appendChild(box);
      });
    };

    // --- Helper: Attach Draggable and Resizable Handlers with Relative Ratio Tracking ---
    const attachDragAndResize = (el, stateItem, onUpdate) => {
      let isDragging = false;
      let isResizing = false;
      let startX, startY, origLeft, origTop, origWidth, origHeight;

      const resizeHandle = el.querySelector('.aio-resize-handle');

      // Drag
      el.addEventListener('mousedown', (e) => {
        if (e.target.tagName.toLowerCase() === 'button' || e.target === resizeHandle) return;
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        origLeft = el.offsetLeft;
        origTop = el.offsetTop;
        e.preventDefault();
      });

      // Resize
      if (resizeHandle) {
        resizeHandle.addEventListener('mousedown', (e) => {
          isResizing = true;
          startX = e.clientX;
          startY = e.clientY;
          origWidth = el.offsetWidth;
          origHeight = el.offsetHeight;
          e.stopPropagation();
          e.preventDefault();
        });
      }

      window.addEventListener('mousemove', (e) => {
        const parentW = overlaysLayer.clientWidth;
        const parentH = overlaysLayer.clientHeight;
        if (parentW === 0 || parentH === 0) return;

        if (isDragging) {
          const dx = e.clientX - startX;
          const dy = e.clientY - startY;

          let newX = Math.max(0, Math.min(parentW - el.offsetWidth, origLeft + dx));
          let newY = Math.max(0, Math.min(parentH - el.offsetHeight, origTop + dy));

          el.style.left = `${newX}px`;
          el.style.top = `${newY}px`;

          stateItem.xRatio = newX / parentW;
          stateItem.yRatio = newY / parentH;
        } else if (isResizing) {
          const dx = e.clientX - startX;
          const dy = e.clientY - startY;

          let newW = Math.max(40, Math.min(parentW - el.offsetLeft, origWidth + dx));
          let newH = Math.max(20, Math.min(parentH - el.offsetTop, origHeight + dy));

          el.style.width = `${newW}px`;
          el.style.height = `${newH}px`;

          stateItem.wRatio = newW / parentW;
          stateItem.hRatio = newH / parentH;
        }
      });

      window.addEventListener('mouseup', () => {
        if (isDragging || isResizing) {
          isDragging = false;
          isResizing = false;
          if (onUpdate) onUpdate();
        }
      });
    };

    // --- Render Bottom Thumbnails Strip ---
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

    // --- Update Swap Dropdowns ---
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
        sigPreviewText.style.fontSize = `${sigSizeSlider.value}px`;
        sigPreviewText.style.color = sigColor;
      } else if (currentSigMode === 'draw') {
        sigPreviewText.classList.add('hidden');
        sigPreviewImg.classList.remove('hidden');
        sigPreviewImg.src = sigPadCanvas.toDataURL('image/png');
      }
    };

    sigNameInput.addEventListener('input', updateSigPreview);
    sigFontSelect.addEventListener('change', updateSigPreview);
    sigSizeSlider.addEventListener('input', () => {
      sigSizeVal.innerText = `${sigSizeSlider.value} pt`;
      updateSigPreview();
    });

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
        container.querySelectorAll('.aio-sig-color').forEach(b => b.classList.remove('ring-2', 'ring-purple-600', 'ring-offset-2'));
        btn.classList.add('ring-2', 'ring-purple-600', 'ring-offset-2');
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

    // Signature File Upload
    sigFileInput.addEventListener('change', async () => {
      const f = sigFileInput.files[0];
      if (!f) return;
      const dataUrl = await window.pdfEngine.readFileAsDataURL(f);
      sigPreviewImg.src = dataUrl;
      sigPreviewText.classList.add('hidden');
      sigPreviewImg.classList.remove('hidden');
    });

    // Place Signature on Viewer
    addSigBtn.addEventListener('click', () => {
      const targetP = parseInt(sigTargetPage.value, 10);
      let dataUrl = '';

      if (currentSigMode === 'type') {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 450;
        tempCanvas.height = 130;
        const ctx = tempCanvas.getContext('2d');
        ctx.font = `${sigSizeSlider.value * 1.3}px ${sigFontSelect.value}`;
        ctx.fillStyle = sigColor;
        ctx.textBaseline = 'middle';
        ctx.fillText(sigNameInput.value || 'Dr. Vijayapriya Aki', 20, 65);
        dataUrl = tempCanvas.toDataURL('image/png');
      } else if (currentSigMode === 'draw') {
        dataUrl = sigPadCanvas.toDataURL('image/png');
      } else if (sigPreviewImg.src) {
        dataUrl = sigPreviewImg.src;
      }

      if (!dataUrl) return;

      signatures.push({
        id: `sig_${Date.now()}`,
        pageIndex: targetP,
        signatureDataUrl: dataUrl,
        xRatio: 0.15,
        yRatio: 0.72,
        wRatio: 0.35,
        hRatio: 0.12
      });

      currentPageNum = targetP + 1;
      renderActivePage();
      updateChangesBadge();
      UI.celebrate();
      UI.showToast(`Placed draggable signature on Page ${targetP + 1}! Drag anywhere or use bottom-right handle to resize.`, 'success');
    });

    // --- Watermark Handlers (Text & Image) ---
    wmTabText.addEventListener('click', () => {
      watermarkConfig.type = 'text';
      wmTabText.className = 'px-3 py-1 rounded-md bg-white text-indigo-700 shadow-sm font-bold';
      wmTabImg.className = 'px-3 py-1 rounded-md text-slate-500 hover:text-slate-800 font-bold';
      wmSecText.classList.remove('hidden');
      wmSecImg.classList.add('hidden');
      renderWatermarkPreview();
    });

    wmTabImg.addEventListener('click', () => {
      watermarkConfig.type = 'image';
      wmTabImg.className = 'px-3 py-1 rounded-md bg-white text-indigo-700 shadow-sm font-bold';
      wmTabText.className = 'px-3 py-1 rounded-md text-slate-500 hover:text-slate-800 font-bold';
      wmSecImg.classList.remove('hidden');
      wmSecText.classList.add('hidden');
      renderWatermarkPreview();
    });

    wmColor.addEventListener('input', () => {
      wmColorHex.innerText = wmColor.value.toUpperCase();
      renderWatermarkPreview();
    });

    wmSize.addEventListener('input', () => {
      wmSizeVal.innerText = `${wmSize.value} pt`;
      renderWatermarkPreview();
    });

    wmOpacity.addEventListener('input', () => {
      wmOpVal.innerText = `${Math.round(wmOpacity.value * 100)}%`;
      renderWatermarkPreview();
    });

    wmAngle.addEventListener('input', () => {
      wmAngVal.innerText = `${wmAngle.value}°`;
      renderWatermarkPreview();
    });

    wmScale.addEventListener('input', () => {
      wmScaleVal.innerText = `${wmScale.value}%`;
      renderWatermarkPreview();
    });

    [wmText, wmFont, wmPos, wmEnabled].forEach(el => {
      el.addEventListener('input', () => {
        renderWatermarkPreview();
        updateChangesBadge();
      });
      el.addEventListener('change', () => {
        renderWatermarkPreview();
        updateChangesBadge();
      });
    });

    // Watermark Image file loader
    wmImgInput.addEventListener('change', async () => {
      const f = wmImgInput.files[0];
      if (!f) return;
      watermarkConfig.imageType = f.type || 'image/png';
      watermarkConfig.imageBuffer = await window.pdfEngine.readFileAsArrayBuffer(f);
      watermarkConfig.imageDataUrl = await window.pdfEngine.readFileAsDataURL(f);
      wmImgThumb.innerHTML = `<img src="${watermarkConfig.imageDataUrl}" class="max-w-full max-h-full object-contain">`;
      renderWatermarkPreview();
      updateChangesBadge();
    });

    // --- Edit Handlers ---
    editTabReplace.addEventListener('click', () => {
      currentEditMode = 'replace';
      editTabReplace.className = 'px-3 py-1 rounded-md bg-white text-rose-700 shadow-sm font-bold';
      editTabWhiteout.className = 'px-3 py-1 rounded-md text-slate-500 hover:text-slate-800 font-bold';
      editSecReplace.classList.remove('hidden');
      editSecWhiteout.classList.add('hidden');
    });

    editTabWhiteout.addEventListener('click', () => {
      currentEditMode = 'whiteout';
      editTabWhiteout.className = 'px-3 py-1 rounded-md bg-white text-rose-700 shadow-sm font-bold';
      editTabReplace.className = 'px-3 py-1 rounded-md text-slate-500 hover:text-slate-800 font-bold';
      editSecWhiteout.classList.remove('hidden');
      editSecReplace.classList.add('hidden');
    });

    placeEditBoxBtn.addEventListener('click', () => {
      const pageIdx = currentPageNum - 1;
      textEdits.push({
        id: `edit_${Date.now()}`,
        pageIndex: pageIdx,
        type: 'replace',
        origText: editOrigText.value || '',
        newText: editNewText.value || editOrigText.value || 'Correction',
        fontSize: 11,
        fontColor: '#000000',
        xRatio: 0.15,
        yRatio: 0.35,
        wRatio: 0.45,
        hRatio: 0.05
      });

      renderActivePage();
      updateChangesBadge();
      UI.showToast(`Placed correction box on Page ${currentPageNum}! Drag over text to replace.`, 'info');
    });

    placeWhiteoutBoxBtn.addEventListener('click', () => {
      const pageIdx = currentPageNum - 1;
      textEdits.push({
        id: `edit_${Date.now()}`,
        pageIndex: pageIdx,
        type: 'whiteout',
        origText: '',
        newText: '',
        xRatio: 0.20,
        yRatio: 0.40,
        wRatio: 0.35,
        hRatio: 0.06
      });

      renderActivePage();
      updateChangesBadge();
      UI.showToast(`Placed whiteout block on Page ${currentPageNum}! Drag to cover errors.`, 'info');
    });

    // --- Compress Handlers ---
    compEnabled.addEventListener('change', updateChangesBadge);
    container.querySelectorAll('.aio-comp-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        compTargetVal.value = chip.dataset.val;
        compTargetUnit.value = chip.dataset.unit;
        compEnabled.checked = true;
        updateChangesBadge();
      });
    });

    container.querySelectorAll('.aio-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        compressConfig.level = btn.dataset.level;
        compEnabled.checked = true;
        container.querySelectorAll('.aio-preset-btn').forEach(b => {
          b.className = b === btn
            ? 'aio-preset-btn p-3 rounded-xl border-2 border-emerald-500 bg-emerald-50 text-emerald-800 text-xs font-bold'
            : 'aio-preset-btn p-3 rounded-xl border border-slate-200 bg-white text-xs font-bold hover:border-emerald-500';
        });
        updateChangesBadge();
      });
    });

    // --- Security Handlers ---
    secEnabled.addEventListener('change', updateChangesBadge);
    secPassword.addEventListener('input', updateChangesBadge);
    secTogglePwd.addEventListener('click', () => {
      secPassword.type = secPassword.type === 'password' ? 'text' : 'password';
    });

    // --- Navigation & High-DPI Scaler ---
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
      currentZoom = Math.min(2.5, +(currentZoom + 0.2).toFixed(1));
      zoomLevelEl.innerText = `${Math.round(currentZoom * 100)}%`;
      renderActivePage();
    });

    zoomOutBtn.addEventListener('click', () => {
      currentZoom = Math.max(0.5, +(currentZoom - 0.2).toFixed(1));
      zoomLevelEl.innerText = `${Math.round(currentZoom * 100)}%`;
      renderActivePage();
    });

    zoomFitBtn.addEventListener('click', () => {
      currentZoom = 1.0;
      zoomLevelEl.innerText = '100%';
      renderActivePage();
    });

    // --- File Dropzone Loader ---
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
          window.pdfEngine.renderPageToCanvas(pdfJsDoc, i, thumbCanvas, 140);
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
          UI.showProgress(0.3, 'Step 2/6: Applying text replacements & whiteouts...');
          const formattedEdits = textEdits.map(t => ({
            page: t.pageIndex + 1,
            type: t.type === 'whiteout' ? 'whiteout' : 'replace',
            origText: t.origText,
            newText: t.newText,
            font: 'Helvetica',
            size: t.fontSize || 11,
            color: t.fontColor || '#000000',
            bgWhiteout: true,
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
          UI.showProgress(0.5, 'Step 3/6: Stamping digital signatures on exact coordinates...');
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

        // 4. Apply Watermark (Text or Image)
        if (wmEnabled.checked) {
          UI.showProgress(0.7, 'Step 4/6: Stamping watermark...');
          const opts = {
            type: watermarkConfig.type,
            text: wmText.value.trim() || 'CONFIDENTIAL',
            fontFamily: wmFont.value || 'Helvetica',
            fontSize: parseInt(wmSize.value, 10) || 48,
            colorHex: wmColor.value || '#e11d48',
            opacity: parseFloat(wmOpacity.value) || 0.25,
            angle: parseInt(wmAngle.value, 10) || -45,
            position: wmPos.value || 'center-diag',
            imageBuffer: watermarkConfig.imageBuffer ? window.pdfEngine.cloneBuffer(watermarkConfig.imageBuffer) : null,
            imageType: watermarkConfig.imageType,
            imageScale: (parseInt(wmScale.value, 10) || 50) / 100
          };

          workingBlob = await window.pdfEngine.addWatermark(workingBuffer, opts);
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
