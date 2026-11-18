# SUVADIX — All Your Documents. One Smart Place.

<p align="center">
  <img src="assets/suvadix-logo.png" alt="SUVADIX Logo" width="520">
</p>

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages-success.svg)](https://editorakilan.github.io/SUVADIX/)
[![Zero Server](https://img.shields.io/badge/Privacy-100%25%20In--Browser-emerald.svg)](#privacy-guarantee)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-purple.svg)](manifest.json)
[![Tools](https://img.shields.io/badge/Tools-42%2B%20Complete%20Suite-indigo.svg)](#complete-feature-matrix-42-tools)

> **A high-performance, private, 100% client-side document & PDF suite.**  
> Featuring **42+ complete tools** plus an **All-In-One Studio** running entirely inside your browser via WebAssembly and JavaScript (`pdf-lib`, `pdf.js`, `tesseract.js`, `jszip`). Zero files are ever uploaded to external servers — ensuring complete privacy, zero latency queues, and unlimited free use.

🌐 **Live Website:** [https://editorakilan.github.io/SUVADIX/](https://editorakilan.github.io/SUVADIX/)

---

## 🌟 Flagship Highlight: All-In-One Studio

Located prominently on the dashboard and at `tool.html?t=all-in-one`, the **SUVADIX All-In-One Studio** allows you to perform every operation in a continuous workspace:
- **Organize & Instant Swap:** Visual page thumbnails, drag-and-drop reordering, and instant **Page A ⇄ Page B** swapping.
- **Dr. Vijayapriya Aki Digital Signatures:** Authentic cursive font signatures, freehand pen drawing, or transparent PNG image upload with draggable and resizable placement boxes.
- **Zero-Drift High-DPI Zoom Scaler:** Zoom in or out up to **250%** without losing resolution or misaligning signatures and watermarks (powered by normalized relative vector coordinates).
- **Text & Image Watermarking:** Configurable angle, opacity, font size, and 9-position anchor alignment.
- **Sentence Editing & Whiteouts:** Seamlessly redact, whiteout, or replace text across any document page.
- **Smart Target File Size Compressor:** Compress directly to your desired file size in `GB`, `MB`, `KB`, or `Bytes` with live reduction feedback.
- **AES-256 Encryption:** Protect sensitive documents with custom password protection.

---

## Complete Feature Matrix (38+ Tools)

### 1. Organize
| Tool | Dedicated URL | Description |
|---|---|---|
| **Merge PDF** | `tool.html?t=merge` | Combine multiple PDFs into a single file with custom ordering |
| **Split PDF** | `tool.html?t=split` | Split by custom ranges (`1-3, 4-6`) or one file per page |
| **Organize PDF** | `tool.html?t=organize` | Sort, reorder, rotate, delete pages with Instant Page Swap (`Page A ⇄ Page B`) |
| **Extract Pages** | `tool.html?t=extract` | Pull specific page intervals into a new document |
| **Remove Pages** | `tool.html?t=remove` | Delete selected pages permanently |
| **Rotate PDF** | `tool.html?t=rotate` | Rotate individual or all pages (90°, 180°, 270°) |
| **Crop PDF** | `tool.html?t=crop` | Trim margins or crop pages with custom margin bounds |
| **Flatten PDF** | `tool.html?t=flatten` | Lock interactive form fields and annotations into static document layers |

### 2. Optimize & Repair
| Tool | Dedicated URL | Description |
|---|---|---|
| **Compress PDF** | `tool.html?t=compress` | 3 quality presets + Target File Size mode (`GB`, `MB`, `KB`, `Bytes`) |
| **OCR PDF** | `tool.html?t=ocr` | Client-side Optical Character Recognition via Tesseract.js |
| **Repair PDF** | `tool.html?t=repair` | Reconstruct broken cross-reference tables and recover corrupted pages |

### 3. Convert to PDF
| Tool | Dedicated URL | Description |
|---|---|---|
| **JPG to PDF** | `tool.html?t=jpg-to-pdf` | Convert images to PDF with A4, Letter, Fit, margins & orientation controls |
| **PNG to PDF** | `tool.html?t=png-to-pdf` | Convert PNGs with alpha transparency support to PDF |
| **Word to PDF** | `tool.html?t=word-to-pdf` | Typeset `.docx` documents into clean, paginated PDFs |
| **Excel to PDF** | `tool.html?t=excel-to-pdf` | Convert `.xlsx` and `.csv` sheets into formatted PDF tables |
| **PowerPoint to PDF** | `tool.html?t=ppt-to-pdf` | Transform `.pptx` slides into 16:9 presentation PDFs |
| **Text to PDF** | `tool.html?t=text-to-pdf` | Convert raw notes and code into formatted PDF documents |
| **HTML to PDF** | `tool.html?t=html-to-pdf` | Render HTML snippets and documents into clean PDF pages |
| **Scan to PDF** | `tool.html?t=scan-to-pdf` | In-browser webcam/phone camera scanner with multi-page capture |

### 4. Convert from PDF
| Tool | Dedicated URL | Description |
|---|---|---|
| **PDF to JPG** | `tool.html?t=pdf-to-jpg` | Convert PDF pages into high-resolution JPG images (+ ZIP archive) |
| **PDF to PNG** | `tool.html?t=pdf-to-png` | Export lossless PNG images at 150 or 300 DPI with transparency |
| **PDF to TIFF 16bit** | `tool.html?t=pdf-to-tiff-16` | Mastering & archival 16-bit uncompressed RGB TIFF export |
| **PDF to DPX 16bit** | `tool.html?t=pdf-to-dpx-16` | SMPTE 268M standard 16-bit cinema film rasterization |
| **PDF to EXR 16bit** | `tool.html?t=pdf-to-exr-16` | Academy / ILM 16-bit half-float OpenEXR lossless VFX export |
| **PDF to Jpeg2000** | `tool.html?t=pdf-to-jp2` | ISO/IEC 15444-1 JP2 / JPEG 2000 container export |
| **PDF to Word** | `tool.html?t=pdf-to-word` | Extract structured paragraphs and headings into editable `.docx` files |
| **PDF to Excel** | `tool.html?t=pdf-to-excel` | Automatically detect and extract tabular data into `.csv` spreadsheets |
| **PDF to PowerPoint** | `tool.html?t=pdf-to-ppt` | Export presentation slides into `.pptx` presentations |
| **PDF to HTML** | `tool.html?t=pdf-to-html` | Convert PDF layout and text into clean, responsive HTML webpages |
| **PDF to Text** | `tool.html?t=pdf-to-text` | Extract all selectable text into a clean `.txt` document |
| **PDF to PDF/A** | `tool.html?t=pdf-to-pdfa` | Embed ISO 19005-1 archival standard metadata and color profiles |

### 5. Edit & Security
| Tool | Dedicated URL | Description |
|---|---|---|
| **All-In-One Studio** | `tool.html?t=all-in-one` | Complete multi-step studio (organize, sign, watermark, edit, compress, protect) |
| **Edit PDF** | `tool.html?t=edit` | Add text, highlights, shapes, and annotations onto PDF pages |
| **Sign PDF** | `tool.html?t=sign` | Digital eSignatures: draw with pen, type cursive script, or upload signature |
| **Watermark PDF** | `tool.html?t=watermark` | Add customized text or image watermarks with opacity, angle, and size controls |
| **Page Numbers** | `tool.html?t=page-numbers` | Insert customizable page numbers (header/footer, left/center/right) |
| **Redact PDF** | `tool.html?t=redact` | Permanently black-out sensitive areas, numbers, and private data |
| **Protect PDF** | `tool.html?t=protect` | Password-protect and encrypt documents from unauthorized access |
| **Unlock PDF** | `tool.html?t=unlock` | Remove passwords and permissions from secured PDF documents |
| **PDF Metadata** | `tool.html?t=metadata` | View and edit Title, Author, Subject, and Keywords tags |
| **Compare PDF** | `tool.html?t=compare` | Side-by-side comparison highlighting differences between two document revisions |
| **PDF Reader** | `tool.html?t=reader` | Distraction-free in-browser PDF reader with zoom and navigation |
| **AI PDF Summarizer** | `tool.html?t=ai-summarize` | Instant executive summaries, key takeaways, and reading metrics |

---

## 🔒 Privacy Guarantee
- **Zero Server Uploads:** 100% of document processing happens locally in your browser's WebAssembly sandbox.
- **Works Offline:** Once loaded, you can disconnect from the internet and continue processing files.
- **PWA Installation:** Install SUVADIX on Android, iOS, Windows, or macOS directly from your browser.
