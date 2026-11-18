/**
 * SUVADIX - Main Application Controller
 * Handles dashboard grid, category navigation, real-time search, theme toggle, and tool dispatching.
 */

const TOOLS_CONFIG = [
  // 1. ORGANIZE PDF
  {
    id: 'merge',
    name: 'Merge PDF',
    category: 'organize',
    categoryLabel: 'ORGANIZE PDF',
    desc: 'Combine multiple PDFs into one unified document with zero quality loss.',
    icon: 'merge',
    color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-900',
    handler: (c) => OrganizeTools.renderMerge(c)
  },
  {
    id: 'split',
    name: 'Split PDF',
    category: 'organize',
    categoryLabel: 'ORGANIZE PDF',
    desc: 'Extract ranges or separate every page into individual single-page documents.',
    icon: 'split',
    color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-900',
    handler: (c) => OrganizeTools.renderSplit(c)
  },
  {
    id: 'remove-pages',
    name: 'Remove pages',
    category: 'organize',
    categoryLabel: 'ORGANIZE PDF',
    desc: 'Visually select and delete unwanted pages from your document.',
    icon: 'trash-2',
    color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-900',
    handler: (c) => OrganizeTools.renderRemovePages(c)
  },
  {
    id: 'extract-pages',
    name: 'Extract pages',
    category: 'organize',
    categoryLabel: 'ORGANIZE PDF',
    desc: 'Choose specific pages from a PDF and save them as a new PDF file.',
    icon: 'folder-output',
    color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-900',
    handler: (c) => OrganizeTools.renderExtractPages(c)
  },
  {
    id: 'organize',
    name: 'Organize PDF',
    category: 'organize',
    categoryLabel: 'ORGANIZE PDF',
    desc: 'Swap, reorder, sort, rotate, and delete pages visually with drag & drop or instant page swap.',
    icon: 'layout-grid',
    color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-900',
    handler: (c) => OrganizeTools.renderOrganize(c)
  },
  {
    id: 'scan',
    name: 'Scan to PDF',
    category: 'organize',
    categoryLabel: 'ORGANIZE PDF',
    desc: 'Capture document photos using your webcam and compile them into a PDF.',
    icon: 'camera',
    color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-900',
    handler: (c) => OrganizeTools.renderScan(c)
  },

  // 2. OPTIMIZE PDF
  {
    id: 'compress',
    name: 'Compress PDF',
    category: 'optimize',
    categoryLabel: 'OPTIMIZE PDF',
    desc: 'Reduce PDF file size while preserving high visual quality.',
    icon: 'minimize-2',
    color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900',
    handler: (c) => OptimizeTools.renderCompress(c)
  },
  {
    id: 'repair',
    name: 'Repair PDF',
    category: 'optimize',
    categoryLabel: 'OPTIMIZE PDF',
    desc: 'Fix damaged, corrupt, or unreadable PDF files and rebuild xref tables.',
    icon: 'wrench',
    color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900',
    handler: (c) => OptimizeTools.renderRepair(c)
  },
  {
    id: 'ocr',
    name: 'OCR PDF',
    category: 'optimize',
    categoryLabel: 'OPTIMIZE PDF',
    desc: 'Optical character recognition to extract text from scanned documents in-browser.',
    icon: 'scan-text',
    color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900',
    handler: (c) => OptimizeTools.renderOCR(c)
  },
  {
    id: 'color-correction',
    name: 'Enhance & Restore PDF',
    category: 'optimize',
    categoryLabel: 'OPTIMIZE PDF',
    desc: 'Fix dull, grey & faded PDFs. Sharpen, deblur, upscale, remove grey backgrounds, yellow tint & shadows with Before/After comparison.',
    icon: 'sparkles',
    color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900',
    handler: (c) => OptimizeTools.renderColorCorrection(c)
  },

  // 3. CONVERT TO PDF
  {
    id: 'office-to-pdf',
    name: 'OFFICE to PDF',
    category: 'convert-to',
    categoryLabel: 'CONVERT TO PDF',
    desc: 'All-in-one Office importer: Convert Word (.docx), Excel (.xlsx/.csv), PowerPoint (.pptx), HTML, or Text into PDF.',
    icon: 'file-plus-2',
    color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900',
    handler: (c) => ConvertToTools.renderOfficeToPdfHub(c)
  },
  {
    id: 'jpg-to-pdf',
    name: 'JPG to PDF',
    category: 'convert-to',
    categoryLabel: 'CONVERT TO PDF',
    desc: 'Convert JPG, PNG, and WebP images into a single PDF with custom margins.',
    icon: 'image',
    color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900',
    handler: (c) => ConvertToTools.renderJpgToPdf(c)
  },
  {
    id: 'png-to-pdf',
    name: 'PNG to PDF',
    category: 'convert-to',
    categoryLabel: 'CONVERT TO PDF',
    desc: 'Convert transparent PNG images and graphics into high-resolution PDF pages.',
    icon: 'file-image',
    color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900',
    handler: (c) => ConvertToTools.renderPngToPdf(c)
  },
  {
    id: 'word-to-pdf',
    name: 'Word to PDF',
    category: 'convert-to',
    categoryLabel: 'CONVERT TO PDF',
    desc: 'Parse Word (.docx) documents and export to clean printable PDF format.',
    icon: 'file-type-2',
    color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900',
    handler: (c) => ConvertToTools.renderOfficeToPdfHub(c, 'word')
  },
  {
    id: 'excel-to-pdf',
    name: 'Excel to PDF',
    category: 'convert-to',
    categoryLabel: 'CONVERT TO PDF',
    desc: 'Convert Excel spreadsheets (.xlsx, .csv) into clean tabular PDF documents.',
    icon: 'sheet',
    color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900',
    handler: (c) => ConvertToTools.renderOfficeToPdfHub(c, 'excel')
  },
  {
    id: 'ppt-to-pdf',
    name: 'PPT to PDF',
    category: 'convert-to',
    categoryLabel: 'CONVERT TO PDF',
    desc: 'Render PowerPoint (.pptx) slides into crisp 16:9 widescreen presentation PDFs.',
    icon: 'presentation',
    color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-900',
    handler: (c) => ConvertToTools.renderOfficeToPdfHub(c, 'ppt')
  },
  {
    id: 'html-to-pdf',
    name: 'HTML to PDF',
    category: 'convert-to',
    categoryLabel: 'CONVERT TO PDF',
    desc: 'Render rich HTML markup, invoices, and web components into PDF.',
    icon: 'code',
    color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900',
    handler: (c) => ConvertToTools.renderHtmlToPdf(c)
  },
  {
    id: 'md-to-pdf',
    name: 'Markdown to PDF',
    category: 'convert-to',
    categoryLabel: 'CONVERT TO PDF',
    desc: 'Live split-view editor to generate formatted PDFs from Markdown.',
    icon: 'file-code',
    color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900',
    handler: (c) => ConvertToTools.renderMarkdownToPdf(c)
  },

  // 4. CONVERT FROM PDF
  {
    id: 'pdf-to-img',
    name: 'PDF to IMAGE',
    category: 'convert-from',
    categoryLabel: 'CONVERT FROM PDF',
    desc: 'All-in-one Image hub: Extract pages into PNG, JPG, 16-bit TIFF, 16-bit DPX, 16-bit OpenEXR, JPEG 2000, or WebP.',
    icon: 'image-down',
    color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900',
    handler: (c) => ConvertFromTools.renderPdfToImageHub(c, 'png')
  },
  {
    id: 'pdf-to-office',
    name: 'PDF to OFFICE',
    category: 'convert-from',
    categoryLabel: 'CONVERT FROM PDF',
    desc: 'All-in-one Office export hub: Convert PDF into editable Word (.docx), Excel spreadsheets (.csv), PowerPoint (.pptx), HTML, or Text.',
    icon: 'layers',
    color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900',
    handler: (c) => ConvertFromTools.renderPdfToOfficeHub(c, 'word')
  },
  {
    id: 'pdf-to-jpg',
    name: 'PDF to JPG',
    category: 'convert-from',
    categoryLabel: 'CONVERT FROM PDF',
    desc: 'Convert all pages of a PDF into high-res JPG images and download as ZIP.',
    icon: 'image-down',
    color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900',
    handler: (c) => ConvertFromTools.renderPdfToImageHub(c, 'jpeg')
  },
  {
    id: 'pdf-to-png',
    name: 'PDF to PNG',
    category: 'convert-from',
    categoryLabel: 'CONVERT FROM PDF',
    desc: 'Extract transparent, crisp PNG graphics from each PDF page.',
    icon: 'file-image',
    color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-900',
    handler: (c) => ConvertFromTools.renderPdfToImageHub(c, 'png')
  },
  {
    id: 'pdf-to-tiff-16',
    name: 'PDF to TIFF 16bit',
    category: 'convert-from',
    categoryLabel: 'CONVERT FROM PDF',
    desc: 'Mastering & archival grade 16-bit uncompressed RGB TIFF export per page.',
    icon: 'layers',
    color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900',
    handler: (c) => ConvertFromTools.renderPdfToImageHub(c, 'tiff16')
  },
  {
    id: 'pdf-to-dpx-16',
    name: 'PDF to DPX 16bit',
    category: 'convert-from',
    categoryLabel: 'CONVERT FROM PDF',
    desc: 'SMPTE 268M standard 16-bit digital film and cinema VFX mastering rasterization.',
    icon: 'film',
    color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900',
    handler: (c) => ConvertFromTools.renderPdfToImageHub(c, 'dpx16')
  },
  {
    id: 'pdf-to-exr-16',
    name: 'PDF to EXR 16bit lossless',
    category: 'convert-from',
    categoryLabel: 'CONVERT FROM PDF',
    desc: 'Academy / ILM standard 16-bit half-float OpenEXR lossless VFX rasterization.',
    icon: 'sparkles',
    color: 'text-violet-600 bg-violet-50 dark:bg-violet-950/40 border-violet-200 dark:border-violet-900',
    handler: (c) => ConvertFromTools.renderPdfToImageHub(c, 'exr16')
  },
  {
    id: 'pdf-to-jp2',
    name: 'PDF to Jpeg2000',
    category: 'convert-from',
    categoryLabel: 'CONVERT FROM PDF',
    desc: 'ISO/IEC 15444-1 compliant high-compression JP2 / JPEG 2000 container export.',
    icon: 'image',
    color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900',
    handler: (c) => ConvertFromTools.renderPdfToImageHub(c, 'jp2')
  },
  {
    id: 'pdf-to-word',
    name: 'PDF to Word',
    category: 'convert-from',
    categoryLabel: 'CONVERT FROM PDF',
    desc: 'Convert PDF paragraphs and content into an editable Microsoft Word (.docx) document.',
    icon: 'file-text',
    color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900',
    handler: (c) => ConvertFromTools.renderPdfToOfficeHub(c, 'word')
  },
  {
    id: 'pdf-to-excel',
    name: 'PDF to EXCEL',
    category: 'convert-from',
    categoryLabel: 'CONVERT FROM PDF',
    desc: 'Extract tables, rows, and financial data from PDF into Excel / CSV format.',
    icon: 'sheet',
    color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900',
    handler: (c) => ConvertFromTools.renderPdfToOfficeHub(c, 'excel')
  },
  {
    id: 'pdf-to-ppt',
    name: 'PDF to PPT',
    category: 'convert-from',
    categoryLabel: 'CONVERT FROM PDF',
    desc: 'Transform PDF pages into a presentation slide deck for PowerPoint (.pptx).',
    icon: 'presentation',
    color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-900',
    handler: (c) => ConvertFromTools.renderPdfToOfficeHub(c, 'ppt')
  },
  {
    id: 'pdf-to-html',
    name: 'PDF to HTML',
    category: 'convert-from',
    categoryLabel: 'CONVERT FROM PDF',
    desc: 'Convert PDF layout and text into a responsive HTML webpage with clean styling.',
    icon: 'code-2',
    color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-900',
    handler: (c) => ConvertFromTools.renderPdfToOfficeHub(c, 'html')
  },
  {
    id: 'pdf-to-text',
    name: 'PDF to Text',
    category: 'convert-from',
    categoryLabel: 'CONVERT FROM PDF',
    desc: 'Extract all textual content from PDF pages into plain text (.txt).',
    icon: 'file-text',
    color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900',
    handler: (c) => ConvertFromTools.renderPdfToOfficeHub(c, 'text')
  },

  // 5. EDIT PDF
  {
    id: 'rotate',
    name: 'Rotate PDF',
    category: 'edit',
    categoryLabel: 'EDIT PDF',
    desc: 'Rotate pages 90°, 180°, or 270° clockwise or counter-clockwise permanently.',
    icon: 'rotate-cw',
    color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900',
    handler: (c) => EditTools.renderRotate(c)
  },
  {
    id: 'crop',
    name: 'Crop PDF',
    category: 'edit',
    categoryLabel: 'EDIT PDF',
    desc: 'Crop margins, trim white borders, and adjust page boundary boxes with live preview.',
    icon: 'crop',
    color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900',
    handler: (c) => EditTools.renderCrop(c)
  },
  {
    id: 'page-numbers',
    name: 'Add page numbers',
    category: 'edit',
    categoryLabel: 'EDIT PDF',
    desc: 'Add clean numbered pagination in any corner, center, or header/footer.',
    icon: 'hash',
    color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900',
    handler: (c) => EditTools.renderAddPageNumbers(c)
  },
  {
    id: 'watermark',
    name: 'Add watermark',
    category: 'edit',
    categoryLabel: 'EDIT PDF',
    desc: 'Stamp custom text or confidential marks with custom angle and opacity.',
    icon: 'stamp',
    color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900',
    handler: (c) => EditTools.renderAddWatermark(c)
  },
  {
    id: 'sign',
    name: 'Sign PDF',
    category: 'edit',
    categoryLabel: 'EDIT PDF',
    desc: 'Draw your digital signature with smooth curves and stamp it onto your PDF.',
    icon: 'pen-tool',
    color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900',
    handler: (c) => EditTools.renderSign(c)
  },
  {
    id: 'edit-pdf',
    name: 'Edit PDF',
    category: 'edit',
    categoryLabel: 'EDIT PDF',
    desc: 'Edit sentences, replace text, correct typos, whiteout errors, and replace images.',
    icon: 'edit-3',
    color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900',
    handler: (c) => EditTools.renderEditPdf(c)
  },

  // 6. PDF SECURITY
  {
    id: 'protect',
    name: 'Protect PDF',
    category: 'security',
    categoryLabel: 'PDF SECURITY',
    desc: 'Add password encryption to keep your confidential documents secure.',
    icon: 'lock',
    color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-900',
    handler: (c) => SecurityTools.renderProtect(c)
  },
  {
    id: 'unlock',
    name: 'Unlock PDF',
    category: 'security',
    categoryLabel: 'PDF SECURITY',
    desc: 'Remove password restrictions permanently from protected PDF files.',
    icon: 'unlock',
    color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-900',
    handler: (c) => SecurityTools.renderUnlock(c)
  },
  {
    id: 'compare',
    name: 'Compare PDF',
    category: 'security',
    categoryLabel: 'PDF SECURITY',
    desc: 'Side-by-side visual difference tool to detect modifications between two versions.',
    icon: 'columns',
    color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-900',
    handler: (c) => SecurityTools.renderCompare(c)
  },
  {
    id: 'redact',
    name: 'Redact PDF',
    category: 'security',
    categoryLabel: 'PDF SECURITY',
    desc: 'Draw blackout boxes over confidential or medical data to remove it permanently.',
    icon: 'eye-off',
    color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-900',
    handler: (c) => SecurityTools.renderRedact(c)
  },

  // 7. PDF INTELLIGENCE
  {
    id: 'ai-summarizer',
    name: 'AI Summarizer',
    category: 'intelligence',
    categoryLabel: 'PDF INTELLIGENCE',
    desc: 'Generate executive summaries and key bullet points from lengthy documents.',
    icon: 'sparkles',
    color: 'text-violet-600 bg-violet-50 dark:bg-violet-950/40 border-violet-200 dark:border-violet-900',
    handler: (c) => IntelligenceTools.renderSummarizer(c)
  },
  {
    id: 'translate',
    name: 'Translate PDF',
    category: 'intelligence',
    categoryLabel: 'PDF INTELLIGENCE',
    desc: 'Translate PDF text into Spanish, French, German, Hindi, Tamil, and more.',
    icon: 'languages',
    color: 'text-violet-600 bg-violet-50 dark:bg-violet-950/40 border-violet-200 dark:border-violet-900',
    handler: (c) => IntelligenceTools.renderTranslate(c)
  },
  {
    id: 'pdf-to-markdown',
    name: 'PDF to Markdown',
    category: 'intelligence',
    categoryLabel: 'PDF INTELLIGENCE',
    desc: 'Extract document structure into clean GitHub-Flavored Markdown format.',
    icon: 'file-code',
    color: 'text-violet-600 bg-violet-50 dark:bg-violet-950/40 border-violet-200 dark:border-violet-900',
    handler: (c) => IntelligenceTools.renderPdfToMarkdown(c)
  },
  {
    id: 'ocr-answer',
    name: 'OCR Answer Tool',
    category: 'intelligence',
    categoryLabel: 'PDF INTELLIGENCE',
    desc: 'Extract questions from image or PDF via OCR and generate step-by-step answers & solutions.',
    icon: 'help-circle',
    color: 'text-violet-600 bg-violet-50 dark:bg-violet-950/40 border-violet-200 dark:border-violet-900',
    handler: (c) => IntelligenceTools.renderOcrAnswer(c)
  },

  // 8. ALL-IN-ONE
  {
    id: 'all-in-one',
    name: 'All-In-One',
    category: 'all-in-one',
    categoryLabel: 'ALL-IN-ONE',
    desc: 'The complete PDF studio: swap pages, rotate, edit text, whiteout, sign, watermark, redact, protect & compress all in one place.',
    icon: 'layers',
    color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900',
    handler: (c) => AllInOneTool.render(c)
  }
];

class App {
  constructor() {
    this.currentCategory = 'all';
    this.searchQuery = '';
    this.activeTool = null;
  }

  init() {
    this.initTheme();
    this.populateHeaderMegaMenu();
    this.renderDashboard();
    this.bindEvents();
    window.pdfEngine.initPdfJs();
  }

  populateHeaderMegaMenu() {
    const menu = document.getElementById('header-mega-menu');
    if (!menu) return;

    const categories = [
      {
        title: 'ORGANIZE & OPTIMIZE',
        color: 'text-orange-600',
        tools: TOOLS_CONFIG.filter(t => t.category === 'organize' || t.category === 'optimize')
      },
      {
        title: 'CONVERT TO PDF',
        color: 'text-amber-600',
        tools: TOOLS_CONFIG.filter(t => t.category === 'convert-to')
      },
      {
        title: 'CONVERT FROM PDF',
        color: 'text-indigo-600',
        tools: TOOLS_CONFIG.filter(t => t.category === 'convert-from')
      },
      {
        title: 'EDIT, SECURITY & AI',
        color: 'text-purple-600',
        tools: TOOLS_CONFIG.filter(t => t.category === 'edit' || t.category === 'security' || t.category === 'intelligence')
      }
    ];

    menu.innerHTML = categories.map(cat => `
      <div class="space-y-3">
        <h4 class="text-[10px] font-extrabold uppercase tracking-wider ${cat.color} pb-1 border-b border-slate-100 dark:border-slate-800">${cat.title} (${cat.tools.length})</h4>
        <div class="space-y-1">
          ${cat.tools.map(t => `
            <button class="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-semibold flex items-center gap-2 transition group" onclick="window.app && window.app.openTool('${t.id}')">
              <i data-lucide="${t.icon}" class="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors flex-shrink-0"></i>
              <span class="truncate">${t.name}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `).join('') + `
      <div class="col-span-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div class="flex items-center gap-2 text-xs text-slate-500">
          <i data-lucide="shield-check" class="w-4 h-4 text-emerald-500"></i>
          <span>All 46 tools run 100% locally in browser memory with zero server uploads</span>
        </div>
        <button class="px-4 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-xs shadow-sm hover:shadow transition flex items-center gap-1.5" onclick="window.app && window.app.openTool('all-in-one')">
          <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
          <span>Launch All-In-One Studio</span>
        </button>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  }

  initTheme() {
    const saved = localStorage.getItem('pdf_suite_theme');
    const isDark = saved === 'dark'; // Default to clean, modern, professional light theme
    document.documentElement.classList.toggle('dark', isDark);

    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const nextDark = !document.documentElement.classList.contains('dark');
        document.documentElement.classList.toggle('dark', nextDark);
        localStorage.setItem('pdf_suite_theme', nextDark ? 'dark' : 'light');
      });
    }
  }

  bindEvents() {
    // Search bar
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderDashboard();
      });
    }

    // Category tabs
    const categoryBtns = document.querySelectorAll('.cat-filter-btn');
    categoryBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        categoryBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        this.currentCategory = btn.dataset.category;
        this.renderDashboard();
      });
    });

    // Keyboard ESC to close modal or workspace
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const previewModal = document.getElementById('result-preview-modal');
        if (previewModal && !previewModal.classList.contains('hidden')) {
          previewModal.classList.add('hidden');
          previewModal.classList.remove('flex');
        } else if (this.activeTool) {
          this.closeToolWorkspace();
        }
      }
    });

    // Back to dashboard
    const backBtn = document.getElementById('tool-back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        this.closeToolWorkspace();
      });
    }

    // Reset filter button
    const resetFilterBtn = document.getElementById('grid-reset-filter');
    if (resetFilterBtn) {
      resetFilterBtn.addEventListener('click', () => {
        this.currentCategory = 'all';
        this.searchQuery = '';
        if (searchInput) searchInput.value = '';
        categoryBtns.forEach(b => {
          b.classList.toggle('active', b.dataset.category === 'all');
        });
        this.renderDashboard();
      });
    }
  }

  renderDashboard() {
    const grid = document.getElementById('tools-grid');
    if (!grid) return;

    let filtered = TOOLS_CONFIG;

    if (this.currentCategory !== 'all') {
      filtered = filtered.filter(t => t.category === this.currentCategory);
    }

    if (this.searchQuery) {
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(this.searchQuery) ||
        t.desc.toLowerCase().includes(this.searchQuery) ||
        t.categoryLabel.toLowerCase().includes(this.searchQuery)
      );
    }

    // Update live counter bar
    const countCurrentEl = document.getElementById('grid-count-current');
    const filterLabelEl = document.getElementById('grid-filter-label');
    const resetBtn = document.getElementById('grid-reset-filter');

    if (countCurrentEl) countCurrentEl.innerText = filtered.length;

    const isFiltered = this.currentCategory !== 'all' || this.searchQuery;
    if (filterLabelEl) {
      if (isFiltered) {
        let label = '';
        if (this.currentCategory !== 'all') {
          const catMap = {
            'organize': 'Category: Organize',
            'optimize': 'Category: Optimize',
            'convert-to': 'Category: Convert To',
            'convert-from': 'Category: Convert From',
            'edit': 'Category: Edit PDF',
            'security': 'Category: Security',
            'intelligence': 'Category: Intelligence',
            'all-in-one': 'Category: All-In-One'
          };
          label += catMap[this.currentCategory] || this.currentCategory;
        }
        if (this.searchQuery) {
          label += (label ? ' • ' : '') + `Keyword: "${this.searchQuery}"`;
        }
        filterLabelEl.innerText = label;
        filterLabelEl.classList.remove('hidden');
      } else {
        filterLabelEl.classList.add('hidden');
      }
    }

    if (resetBtn) {
      resetBtn.classList.toggle('hidden', !isFiltered);
    }

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full text-center py-16 text-slate-400">
          <i data-lucide="search-x" class="w-12 h-12 mx-auto mb-3 opacity-40"></i>
          <p class="text-base font-semibold">No tools found matching "${this.searchQuery}"</p>
          <p class="text-xs mt-1">Try another keyword or select All Tools.</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    grid.innerHTML = filtered.map(t => `
      <div class="tool-card rounded-2xl p-5 cursor-pointer group flex flex-col justify-between" data-tool-id="${t.id}">
        <div>
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center border ${t.color} transition-transform group-hover:scale-105">
              <i data-lucide="${t.icon}" class="w-6 h-6"></i>
            </div>
            <span class="text-[10px] font-bold tracking-wider uppercase text-slate-400 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">${t.categoryLabel.split(' ')[0]}</span>
          </div>
          <h3 class="font-bold text-base text-slate-800 dark:text-slate-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">${t.name}</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">${t.desc}</p>
        </div>
        <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-red-600 transition-colors">
          <span>Open Tool</span>
          <i data-lucide="arrow-right" class="w-4 h-4 transform group-hover:translate-x-1 transition-transform"></i>
        </div>
      </div>
    `).join('');

    if (window.lucide) window.lucide.createIcons();

    // Attach click handlers
    grid.querySelectorAll('.tool-card').forEach(card => {
      card.addEventListener('click', () => {
        const toolId = card.dataset.toolId;
        this.openToolWorkspace(toolId);
      });
    });
  }

  openTool(toolId) {
    return this.openToolWorkspace(toolId);
  }

  openToolWorkspace(toolId) {
    const tool = TOOLS_CONFIG.find(t => t.id === toolId);
    if (!tool) return;

    this.activeTool = tool;

    const dashboard = document.getElementById('dashboard-view');
    const workspace = document.getElementById('tool-workspace-view');
    const container = document.getElementById('tool-content-container');
    const titleEl = document.getElementById('workspace-tool-title');
    const categoryEl = document.getElementById('workspace-tool-category');

    if (titleEl) titleEl.innerText = tool.name;
    if (categoryEl) categoryEl.innerText = tool.categoryLabel;

    dashboard.classList.add('hidden');
    workspace.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Render tool view
    container.innerHTML = '';
    tool.handler(container);
  }

  closeToolWorkspace() {
    this.activeTool = null;
    const dashboard = document.getElementById('dashboard-view');
    const workspace = document.getElementById('tool-workspace-view');
    const container = document.getElementById('tool-content-container');

    container.innerHTML = '';
    workspace.classList.add('hidden');
    dashboard.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
  window.app.init();
});

