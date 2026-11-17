/**
 * PDF Suite - Main Application Controller
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
    desc: 'Sort, rotate, and delete pages visually on an interactive page canvas.',
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

  // 3. CONVERT TO PDF
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
    id: 'word-to-pdf',
    name: 'WORD to PDF',
    category: 'convert-to',
    categoryLabel: 'CONVERT TO PDF',
    desc: 'Parse Word (.docx) documents and export to clean printable PDF format.',
    icon: 'file-type-2',
    color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900',
    handler: (c) => ConvertToTools.renderWordToPdf(c)
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
    id: 'pdf-to-jpg',
    name: 'PDF to JPG',
    category: 'convert-from',
    categoryLabel: 'CONVERT FROM PDF',
    desc: 'Convert all pages of a PDF into high-res JPG images and download as ZIP.',
    icon: 'image-down',
    color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900',
    handler: (c) => ConvertFromTools.renderPdfToJpg(c)
  },
  {
    id: 'pdf-to-png',
    name: 'PDF to PNG',
    category: 'convert-from',
    categoryLabel: 'CONVERT FROM PDF',
    desc: 'Extract transparent, crisp PNG graphics from each PDF page.',
    icon: 'file-image',
    color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900',
    handler: (c) => ConvertFromTools.renderPdfToPng(c)
  },
  {
    id: 'pdf-to-text',
    name: 'PDF to Text',
    category: 'convert-from',
    categoryLabel: 'CONVERT FROM PDF',
    desc: 'Extract all textual content from PDF pages into plain text (.txt).',
    icon: 'file-text',
    color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900',
    handler: (c) => ConvertFromTools.renderPdfToText(c)
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
    this.renderDashboard();
    this.bindEvents();
    window.pdfEngine.initPdfJs();
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

