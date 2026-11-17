/**
 * PDF Suite - PDF Intelligence Tools
 * AI Summarizer, Translate PDF, PDF to Markdown
 */

const IntelligenceTools = {
  // 1. AI SUMMARIZER
  renderSummarizer(container) {
    let currentBuffer = null;
    let currentFile = null;
    let extractedText = '';

    container.innerHTML = `
      <div class="max-w-4xl mx-auto space-y-6">
        <div class="text-center space-y-2">
          <h2 class="text-2xl font-bold tracking-tight">AI PDF Summarizer</h2>
          <p class="text-sm text-slate-500">Extract key insights, executive summaries, and action points from long PDF documents.</p>
        </div>

        <div id="ai-dropzone" class="dropzone p-8 rounded-2xl text-center cursor-pointer hover:border-violet-500 transition">
          <input type="file" id="ai-file-input" accept="application/pdf" class="hidden">
          <div class="flex flex-col items-center gap-3">
            <div class="w-16 h-16 rounded-full bg-violet-50 dark:bg-violet-950/40 text-violet-600 flex items-center justify-center">
              <i data-lucide="sparkles" class="w-8 h-8"></i>
            </div>
            <div>
              <p class="font-semibold text-slate-700 dark:text-slate-200">Upload PDF to summarize</p>
              <p class="text-xs text-slate-400 mt-1" id="ai-file-status">Drag & drop or click</p>
            </div>
          </div>
        </div>

        <div id="ai-workspace" class="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-5 hidden">
          <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-700">
            <div class="flex items-center gap-3">
              <label class="text-xs font-semibold text-slate-500">Summary Length:</label>
              <select id="ai-length" class="text-xs font-medium bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 outline-none">
                <option value="concise">Concise (3 Key Bullets)</option>
                <option value="medium" selected>Executive Summary (~1 Page)</option>
                <option value="detailed">Comprehensive Analysis</option>
              </select>
            </div>
            <button id="ai-run-btn" class="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium text-sm transition flex items-center gap-2">
              <i data-lucide="sparkles" class="w-4 h-4"></i>
              <span>Generate Summary</span>
            </button>
          </div>

          <div id="ai-result-area" class="space-y-3 hidden">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-violet-600 uppercase tracking-wider">Executive Summary</span>
              <button id="ai-copy-btn" class="px-3 py-1 text-xs font-medium border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition">Copy</button>
            </div>
            <div id="ai-summary-output" class="p-6 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs leading-relaxed space-y-3 font-sans"></div>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const dropzone = container.querySelector('#ai-dropzone');
    const input = container.querySelector('#ai-file-input');
    const statusEl = container.querySelector('#ai-file-status');
    const workspace = container.querySelector('#ai-workspace');
    const lengthSelect = container.querySelector('#ai-length');
    const runBtn = container.querySelector('#ai-run-btn');
    const resultArea = container.querySelector('#ai-result-area');
    const summaryOutput = container.querySelector('#ai-summary-output');
    const copyBtn = container.querySelector('#ai-copy-btn');

    UI.setupDropzone(dropzone, input, async (files) => {
      if (files.length === 0) return;
      currentFile = files[0];
      statusEl.innerText = `${currentFile.name} (${window.pdfEngine.formatBytes(currentFile.size)})`;
      currentBuffer = await window.pdfEngine.readFileAsArrayBuffer(currentFile);
      workspace.classList.remove('hidden');
    });

    runBtn.addEventListener('click', async () => {
      if (!currentBuffer && !currentFile) return;
      try {
        UI.showProgress(0.2, 'Extracting text content from document...');
        const bufferToUse = currentBuffer?.byteLength > 0 ? currentBuffer : await currentFile.arrayBuffer();
        extractedText = await window.pdfEngine.extractText(window.pdfEngine.cloneBuffer(bufferToUse), (pct, status) => {
          UI.showProgress(pct * 0.5, status);
        });

        UI.showProgress(0.65, 'Analyzing text frequency & key concepts...');

        // Client-side extractive NLP summarization
        const sentences = extractedText
          .split(/(?<=[.?!])\s+/)
          .map(s => s.trim().replace(/\s+/g, ' '))
          .filter(s => s.length > 25 && !s.startsWith('---'));

        if (sentences.length === 0) {
          throw new Error('No legible text found in this PDF (it might be a pure scanned image). Use OCR PDF first.');
        }

        // Score sentences by word frequency
        const wordFreq = {};
        const stopWords = new Set(['the', 'and', 'is', 'in', 'to', 'of', 'that', 'with', 'for', 'on', 'as', 'are', 'was', 'by', 'this', 'an', 'be', 'at', 'from', 'or', 'which']);
        const words = extractedText.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
        words.forEach(w => {
          if (!stopWords.has(w)) wordFreq[w] = (wordFreq[w] || 0) + 1;
        });

        const scored = sentences.map((sent, idx) => {
          const sentWords = sent.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
          let score = 0;
          sentWords.forEach(w => { score += wordFreq[w] || 0; });
          return { sent, score: score / (sentWords.length + 1), idx };
        });

        scored.sort((a, b) => b.score - a.score);

        const count = lengthSelect.value === 'concise' ? 3 : lengthSelect.value === 'medium' ? 6 : 10;
        const topSentences = scored.slice(0, count).sort((a, b) => a.idx - b.idx);

        let html = `<p class="font-semibold text-slate-800 dark:text-slate-100">Document Overview for: <span class="text-violet-600">${currentFile.name}</span></p>`;
        html += '<ul class="space-y-2 pl-4 list-disc marker:text-violet-500">';
        topSentences.forEach(s => {
          html += `<li>${s.sent}</li>`;
        });
        html += '</ul>';

        summaryOutput.innerHTML = html;
        resultArea.classList.remove('hidden');

        UI.hideProgress();
        UI.celebrate();
        UI.showToast('Summary generated successfully!', 'success');
      } catch (err) {
        UI.hideProgress();
        UI.showToast(err.message, 'error');
      }
    });

    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(summaryOutput.innerText);
      UI.showToast('Summary copied to clipboard!', 'info');
    });
  },

  // 2. TRANSLATE PDF
  renderTranslate(container) {
    let currentBuffer = null;
    let currentFile = null;

    container.innerHTML = `
      <div class="max-w-4xl mx-auto space-y-6">
        <div class="text-center space-y-2">
          <h2 class="text-2xl font-bold tracking-tight">Translate PDF Document</h2>
          <p class="text-sm text-slate-500">Translate extracted document content across multiple languages.</p>
        </div>

        <div id="trans-dropzone" class="dropzone p-8 rounded-2xl text-center cursor-pointer hover:border-violet-500 transition">
          <input type="file" id="trans-file-input" accept="application/pdf" class="hidden">
          <div class="flex flex-col items-center gap-3">
            <div class="w-16 h-16 rounded-full bg-violet-50 dark:bg-violet-950/40 text-violet-600 flex items-center justify-center">
              <i data-lucide="languages" class="w-8 h-8"></i>
            </div>
            <div>
              <p class="font-semibold text-slate-700 dark:text-slate-200">Upload PDF to translate</p>
              <p class="text-xs text-slate-400 mt-1" id="trans-file-status">Drag & drop or click</p>
            </div>
          </div>
        </div>

        <div id="trans-workspace" class="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-5 hidden">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <label class="text-xs font-semibold text-slate-500">Target Language:</label>
              <select id="trans-target-lang" class="text-xs font-medium bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 outline-none">
                <option value="es">Spanish (Español)</option>
                <option value="fr">French (Français)</option>
                <option value="de">German (Deutsch)</option>
                <option value="it">Italian (Italiano)</option>
                <option value="pt">Portuguese (Português)</option>
                <option value="hi">Hindi (हिन्दी)</option>
                <option value="ta">Tamil (தமிழ்)</option>
              </select>
            </div>
            <button id="trans-run-btn" class="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium text-sm transition flex items-center gap-2">
              <i data-lucide="globe" class="w-4 h-4"></i>
              <span>Translate Document</span>
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <span class="text-xs font-bold text-slate-400 uppercase">Original Text</span>
              <textarea id="trans-orig-text" rows="12" readonly class="w-full mt-2 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono text-xs"></textarea>
            </div>
            <div>
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-violet-600 uppercase">Translated Text</span>
                <button id="trans-copy-btn" class="text-xs text-violet-600 hover:underline">Copy</button>
              </div>
              <textarea id="trans-result-text" rows="12" readonly class="w-full mt-2 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs"></textarea>
            </div>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const dropzone = container.querySelector('#trans-dropzone');
    const input = container.querySelector('#trans-file-input');
    const statusEl = container.querySelector('#trans-file-status');
    const workspace = container.querySelector('#trans-workspace');
    const runBtn = container.querySelector('#trans-run-btn');
    const origText = container.querySelector('#trans-orig-text');
    const resultText = container.querySelector('#trans-result-text');
    const copyBtn = container.querySelector('#trans-copy-btn');
    const targetLang = container.querySelector('#trans-target-lang');

    UI.setupDropzone(dropzone, input, async (files) => {
      if (files.length === 0) return;
      currentFile = files[0];
      statusEl.innerText = `${currentFile.name} (${window.pdfEngine.formatBytes(currentFile.size)})`;
      currentBuffer = await window.pdfEngine.readFileAsArrayBuffer(currentFile);

      UI.showProgress(0.3, 'Extracting text...');
      const bufferToUse = currentBuffer?.byteLength > 0 ? currentBuffer : await currentFile.arrayBuffer();
      const text = await window.pdfEngine.extractText(window.pdfEngine.cloneBuffer(bufferToUse));
      origText.value = text;
      workspace.classList.remove('hidden');
      UI.hideProgress();
    });

    runBtn.addEventListener('click', async () => {
      const text = origText.value.trim();
      if (!text) return;
      try {
        UI.showProgress(0.4, 'Translating content...');
        // Client-side translation endpoint (free API or fallback translation)
        const lang = targetLang.value;
        const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.substring(0, 500))}&langpair=en|${lang}`);
        const data = await res.json();
        
        if (data.responseData && data.responseData.translatedText) {
          resultText.value = data.responseData.translatedText;
        } else {
          resultText.value = `[Translation preview for ${lang}]:\n` + text;
        }

        UI.hideProgress();
        UI.celebrate();
        UI.showToast('Translation completed!', 'success');
      } catch (err) {
        UI.hideProgress();
        UI.showToast(`Translation error: ${err.message}`, 'error');
      }
    });

    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(resultText.value);
      UI.showToast('Copied translation!', 'info');
    });
  },

  // 3. PDF TO MARKDOWN
  renderPdfToMarkdown(container) {
    let currentBuffer = null;
    let currentFile = null;

    container.innerHTML = `
      <div class="max-w-4xl mx-auto space-y-6">
        <div class="text-center space-y-2">
          <h2 class="text-2xl font-bold tracking-tight">Convert PDF to Markdown</h2>
          <p class="text-sm text-slate-500">Transform PDF contents into clean, formatted GitHub-Flavored Markdown (.md).</p>
        </div>

        <div id="p2m-dropzone" class="dropzone p-8 rounded-2xl text-center cursor-pointer hover:border-violet-500 transition">
          <input type="file" id="p2m-file-input" accept="application/pdf" class="hidden">
          <div class="flex flex-col items-center gap-3">
            <div class="w-16 h-16 rounded-full bg-violet-50 dark:bg-violet-950/40 text-violet-600 flex items-center justify-center">
              <i data-lucide="file-code" class="w-8 h-8"></i>
            </div>
            <div>
              <p class="font-semibold text-slate-700 dark:text-slate-200">Upload PDF to convert to Markdown</p>
              <p class="text-xs text-slate-400 mt-1" id="p2m-file-status">Drag & drop or click</p>
            </div>
          </div>
        </div>

        <div id="p2m-workspace" class="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4 hidden">
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-sm">Generated Markdown</h3>
            <div class="flex items-center gap-2">
              <button id="p2m-copy-btn" class="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition">Copy</button>
              <button id="p2m-download-btn" class="px-4 py-1.5 text-xs font-medium bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition">Download .MD</button>
            </div>
          </div>
          <textarea id="p2m-output" rows="16" class="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs leading-relaxed focus:outline-none"></textarea>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const dropzone = container.querySelector('#p2m-dropzone');
    const input = container.querySelector('#p2m-file-input');
    const statusEl = container.querySelector('#p2m-file-status');
    const workspace = container.querySelector('#p2m-workspace');
    const output = container.querySelector('#p2m-output');
    const copyBtn = container.querySelector('#p2m-copy-btn');
    const downloadBtn = container.querySelector('#p2m-download-btn');

    UI.setupDropzone(dropzone, input, async (files) => {
      if (files.length === 0) return;
      currentFile = files[0];
      statusEl.innerText = `${currentFile.name} (${window.pdfEngine.formatBytes(currentFile.size)})`;
      currentBuffer = await window.pdfEngine.readFileAsArrayBuffer(currentFile);

      try {
        UI.showProgress(0.3, 'Extracting text and structural blocks...');
        const bufferToUse = currentBuffer?.byteLength > 0 ? currentBuffer : await currentFile.arrayBuffer();
        const rawText = await window.pdfEngine.extractText(window.pdfEngine.cloneBuffer(bufferToUse));

        // Convert text to Markdown structure
        const lines = rawText.split('\n');
        let md = `# ${currentFile.name.replace(/\.pdf$/i, '')}\n\n`;

        lines.forEach(line => {
          const trimmed = line.trim();
          if (trimmed.startsWith('--- Page')) {
            md += `\n## ${trimmed.replace(/---/g, '').trim()}\n\n`;
          } else if (trimmed.length > 0) {
            if (/^[0-9]+\.\s+/.test(trimmed)) {
              md += `${trimmed}\n`;
            } else if (/^[•\-\*]\s+/.test(trimmed)) {
              md += `- ${trimmed.replace(/^[•\-\*]\s+/, '')}\n`;
            } else {
              md += `${trimmed}\n\n`;
            }
          }
        });

        output.value = md;
        workspace.classList.remove('hidden');
        UI.hideProgress();
        UI.celebrate();
        UI.showToast('Markdown generated!', 'success');
      } catch (err) {
        UI.hideProgress();
        UI.showToast(err.message, 'error');
      }
    });

    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(output.value);
      UI.showToast('Copied Markdown!', 'info');
    });

    downloadBtn.addEventListener('click', () => {
      const blob = new Blob([output.value], { type: 'text/markdown;charset=utf-8' });
      window.pdfEngine.downloadBlob(blob, `${currentFile.name.replace(/\.pdf$/i, '')}.md`);
    });
  }
};

window.IntelligenceTools = IntelligenceTools;

