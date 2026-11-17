# PDF Suite — Professional Client-Side PDF Toolkit

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages-success.svg)](.github/workflows/deploy.yml)
[![Zero Server](https://img.shields.io/badge/Privacy-100%25%20In--Browser-red.svg)](#privacy-guarantee)
[![Zero Backend](https://img.shields.io/badge/Backend-Zero%20Required-brightgreen.svg)](#architecture)

> **A modern, privacy-first, 100% client-side web application suite for all your PDF workflows.**  
> Inspired by iLovePDF and Stirling-PDF, but designed to run completely inside the browser with **zero backend server required**, zero hosting costs, and automated deployment on **GitHub Pages**.

---

## Highlights

- **100% Client-Side Privacy**: Medical reports, legal contracts, and financial statements **never leave your computer**. All processing happens directly in browser WebAssembly & memory.
- **Deploy to GitHub Pages with 1 Click**: Includes a built-in GitHub Actions workflow (`.github/workflows/deploy.yml`) that builds and deploys your site automatically upon push.
- **Zero Hosting Costs**: Host for free on GitHub Pages, Cloudflare Pages, Netlify, or Vercel.
- **Modern Responsive Design**: Light & Dark mode support, drag-and-drop zones, live page previews, signature drawing canvas, and real-time search.

---

## Included PDF Tools & Features

### 1. Organize PDF
* **Merge PDF**: Combine multiple PDFs into a single document in any order with zero quality loss.
* **Split PDF**: Extract page ranges or split each page into individual single-page documents bundled in a ZIP.
* **Remove Pages**: Interactive visual page thumbnail grid to click and delete unwanted pages.
* **Extract Pages**: Visually select specific pages and export them into a newly compiled document.
* **Organize PDF**: Drag-and-drop page reorganization, individual page rotation (90° increments), and selective page deletion.
* **Scan to PDF**: Access device camera or webcam to take snapshots of physical documents and instantly compile them into an A4 PDF.

### 2. Optimize PDF
* **Compress PDF**: Reduce file sizes with customizable compression presets (Extreme, Recommended, Less).
* **Repair PDF**: Fix damaged cross-reference (xref) tables and reconstruct broken page structures.
* **OCR PDF**: Optical Character Recognition powered by **Tesseract.js** running in-browser to extract text from scanned documents.

### 3. Convert to PDF
* **JPG / PNG / WebP to PDF**: Batch convert images to PDF with custom margins (Full bleed, Small, Large) and page sizing (A4, Letter, Fit Image).
* **Word (.docx) to PDF**: Parse formatted Microsoft Word documents client-side using Mammoth.js.
* **HTML to PDF**: Convert rich HTML/CSS templates and tables into printable PDF files.
* **Markdown to PDF**: Live split-view editor to turn GitHub-Flavored Markdown into formatted documents.

### 4. Convert from PDF
* **PDF to JPG**: Render high-resolution JPG images (up to 300 DPI) for each page; download individually or as a single ZIP.
* **PDF to PNG**: Extract crisp PNG images preserving alpha channel and transparency.
* **PDF to Text**: Extract all readable text streams across all pages into `.txt`.

### 5. Edit PDF
* **Rotate PDF**: Rotate all pages 90°, 180°, or 270° clockwise or counter-clockwise permanently.
* **Add Page Numbers**: Add custom pagination (`Page {n} of {total}`) in headers, footers, or corners.
* **Add Watermark**: Stamp confidential notices, company names, or copyright marks with adjustable opacity, angle, and repeat patterns.
* **Crop PDF**: Adjust page crop-box margins in points.
* **Sign PDF**: Interactive digital signature pad with smooth curves and color selection to stamp signatures directly on documents.

### 6. PDF Security
* **Protect PDF**: Apply standard password encryption to secure confidential documents.
* **Unlock PDF**: Decrypt password-protected PDFs and remove security restrictions permanently.
* **Compare PDF**: Side-by-side visual difference comparison to quickly spot edits between two versions.
* **Redact PDF**: Click and drag to draw blackout redaction boxes over sensitive personal or financial information.

### 7. PDF Intelligence
* **AI Summarizer**: Client-side extractive NLP summarizer that scores sentence frequency and generates executive summaries without external API keys.
* **Translate PDF**: Extract text and translate content across multiple languages (Spanish, French, German, Hindi, Tamil, etc.).
* **PDF to Markdown**: Formats extracted text into structured Markdown with headings, bullet lists, and paragraphs.

---

## Quick Start (Run Locally)

You can run this project locally right away using Python's built-in web server:

```bash
# Clone your repository
git clone https://github.com/<your-username>/pdf-suite.git
cd pdf-suite

# Launch the local development server
python serve.py
```

The application will automatically open in your default browser at `http://localhost:8080`.

---

## Deploy to GitHub Pages in 2 Minutes

1. **Create a new repository** on [GitHub](https://github.com/new) named `pdf-suite` (or any name you like).
2. **Push this code to your repository**:
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit of PDF Suite"
   git branch -M main
   git remote add origin https://github.com/<your-username>/pdf-suite.git
   git push -u origin main
   ```
3. **Enable GitHub Pages**:
   - Go to your repository on GitHub.
   - Click **Settings** → **Pages** (under "Code and automation" in the left sidebar).
   - Under **Build and deployment** → **Source**, select **GitHub Actions**.
4. GitHub Actions will run the included workflow (`.github/workflows/deploy.yml`) and deploy your site to:
   ```
   https://<your-username>.github.io/pdf-suite/
   ```

---

## Privacy Guarantee

Unlike commercial online PDF converters, **PDF Suite does not upload your files to any remote server**. 

```
[Your Computer] ──(In-Memory ArrayBuffer)──> [PDF-Lib / WebAssembly] ──(Blob)──> [Your Computer]
      │
      └─── NO CLOUD SERVER ─── NO DATA LOGGING ─── 100% PRIVATE ───┘
```

Everything runs inside your browser sandbox via:
- [PDF-Lib](https://pdf-lib.js.org/) for object-level PDF manipulation.
- [PDF.js](https://mozilla.github.io/pdf.js/) (by Mozilla) for canvas rendering and rasterization.
- [Tesseract.js](https://tesseract.projectnaptha.com/) for in-browser OCR processing.
- [JSZip](https://stuk.github.io/jszip/) for client-side archive packaging.

---

## License

This project is open-source under the [MIT License](LICENSE).
