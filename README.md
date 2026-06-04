# Full Stack PDF Analyzer Web Application (Express + Vite + React + Gemini AI)

A production-ready full stack web application where users can analyze publicly accessible PDF documents and receive highly accurate, AI-generated structured analysis summaries, key takeaways, page counts, and characters extracted, powered natively by the Gemini 3.5 API and Node-equivalent PDFBox standards.

---

## 🎨 Project Overview

This application provides an elegant, modern, responsive interface for document analysis. Users provide a direct, publicly accessible PDF URL (e.g., from scientific archives or journals). The backend downloads the document, extracts raw textual material, processes and truncates content responsibly, requests high-quality structured AI classification and synthesis from Google Gemini, and maps everything cleanly onto a responsive bento-grid dashboard layout.

### Live Demo Suggested URLs:
* **Attention Is All You Need:** `https://arxiv.org/pdf/1706.03762`
* **Swin Transformer:** `https://arxiv.org/pdf/2103.14030`

---

## 🏗️ Architecture

The app is built using clean architecture and modern full-stack development patterns:

```
                            ┌────────────────────────┐
                            │      React (Vite)      │
                            │   Frontend Dashboard   │
                            └───────────┬────────────┘
                                        │ (POST /api/analyze with pdfUrl)
                                        ▼
                            ┌────────────────────────┐
                            │   Express API Server   │
                            │    (server.ts / CJS)   │
                            └───────────┬────────────┘
                                        │
             ┌──────────────────────────┼──────────────────────────┐
             ▼                          ▼                          ▼
   ┌───────────────────┐      ┌───────────────────┐      ┌───────────────────┐
   │ PdfDownloadServ   │      │ PdfExtractionServ │      │   GeminiService   │
   │ Downloads bytes   │      │ Extracts text /   │      │ Formulates prompt │
   │ and checks headers│      │ page counts       │      │ & parses JSON     │
   └───────────────────┘      └───────────────────┘      └───────────────────┘
```

1. **Frontend (SPA SPA):** Designed desktop-first with elegant mobile compatibility. It initiates calls to the backend API (`Axios`) with validation limits pre-guarded against blank requests.
2. **Backend (Express Routing):** Serves API endpoints first, integrating Vite development middlewares dynamically.
3. **Data Segregations (DTOs):** Holds clear Request and Response boundaries (`/server/dto/`).
4. **Service Class Isolation:**
   - `PdfDownloadService`: Handles remote file fetching securely with Custom Axios configs, user-agents, and content-type verification.
   - `PdfExtractionService`: Extracts text contents and page details using `pdf-parse` (Apache PDFBox parity).
   - `GeminiService`: Utilizes the modern, server-side `@google/genai` client SDK to format templates, sanitize token windows, and guarantee strict JSON returns.
   - `AnalysisService`: Orchestrates the flow in a modular, transactional, and clean manager format.

---

## 💻 Tech Stack

* **Frontend:** React, Tailwind CSS (v4), Axios, Lucide Icons, Google Font pairings (Inter, Space Grotesk).
* **Backend:** Node.js, Express, TypeScript (`tsx`), `pdf-parse`, `esbuild` for CJS bundling.
* **AI Engine:** Google Gemini Developer SDK (`@google/genai` on `gemini-3.5-flash`).

---

## 📁 Folder Structure

```
├── README.md               # User documentation
├── metadata.json           # Applet configurations
├── server.ts               # Core full-stack Express router
├── package.json            # Deployment scripts and dependencies
├── src/                    # Frontend source 
│   ├── App.tsx             # Main view layout
│   ├── main.tsx            # React entry
│   ├── index.css           # Tailwind custom theme configuration
│   ├── types.ts            # Frontend shared Typescript Interfaces
│   ├── services/
│   │   └── api.ts          # Axios wrapper
│   └── components/
│       ├── PdfAnalyzerForm.tsx  # Dynamic form with suggestions
│       ├── AnalysisDisplay.tsx  # Bento summary dashboard
│       └── ErrorAlert.tsx       # Standard failure recovery alert
└── server/                 # Backend source
    ├── controller/
    │   └── analysis.controller.ts  # Express response mapper
    ├── service/
    │   ├── pdfDownload.service.ts   # Asset downloader
    │   ├── pdfExtraction.service.ts # Document text extractor
    │   ├── gemini.service.ts        # @google/genai integration
    │   └── analysis.service.ts      # Orchestrations manager
    ├── dto/
    │   └── analysis.dto.ts          # Request & Response contracts
    ├── config/
    │   └── app.config.ts            # Server configs
    └── exception/
        └── custom.exception.ts      # Structured failure definitions
```

---

## ⚙️ Environment Variables

Add these to `.env` or your cloud deployment configuration:

```env
# Server settings
PORT=3000
NODE_ENV=production

# Google Gemini API key (REQUIRED server-side only)
GEMINI_API_KEY="YOUR_ACTUAL_API_KEY_HERE"
```

*Note: Never expose `.env` keys in client-side codes or code bundles.*

---

## 🚀 Local Setup

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Run in Development:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` to preview. Development has Hot Module Replacement disabled standard with AI Studio tracking, optimizing compilation.

3. **Build & Bundle Application:**
   ```bash
   npm run build
   ```
   This generates production assets in `dist/` and compiles the backend into `dist/server.cjs` cleanly for ultimate execution speed.

4. **Run Production Server:**
   ```bash
   npm run start
   ```

---

## 📝 API Documentation

### `POST /api/analyze`

Analyze remote PDF documents.

* **Request Body:**
  ```json
  {
    "pdfUrl": "https://arxiv.org/pdf/1706.03762"
  }
  ```

* **Success Response (200 OK):**
  ```json
  {
    "documentType": "Research Paper",
    "title": "Attention Is All You Need",
    "authors": "Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N. Gomez, Lukasz Kaiser, Illia Polosukhin",
    "summary": "This seminal paper introduces the Transformer model, a novel sequence transduction architecture based entirely on attention mechanisms...",
    "keyTakeaway": "Self-attention layers can completely replace recurrent and convolutional architectures, achieving superior distillation quality in fraction of training times.",
    "pages": 15,
    "charactersExtracted": 42084,
    "timestamp": "2026-06-04T08:00:21.000Z"
  }
  ```

* **Error Response (400 Bad Request):**
  ```json
  {
    "success": false,
    "error": "Bad Request",
    "message": "The 'pdfUrl' must be a valid URL string."
  }
  ```

* **Error Response (502 Bad Gateway / Parse Error):**
  ```json
  {
    "success": false,
    "error": "Analysis Failed",
    "message": "Failed to extract text from the PDF file: Invalid PDF structure."
  }
  ```
