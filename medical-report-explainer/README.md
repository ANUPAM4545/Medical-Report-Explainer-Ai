# Medical Report Explainer AI

Medical Report Explainer AI is a production-ready multilingual healthcare education platform that helps users understand medical reports in simple language. It supports English, Hindi, and bilingual responses while enforcing strict safety guardrails.

> This application provides educational information only and is not a substitute for professional medical advice, diagnosis, or treatment.
>
> यह एप्लिकेशन केवल शैक्षिक जानकारी प्रदान करता है और यह पेशेवर चिकित्सा सलाह, निदान या उपचार का विकल्प नहीं है।

## Problem Statement

Medical reports often contain complex terminology that patients struggle to understand, especially when reports are written in English and users prefer explanations in Hindi. This application lets users upload reports such as CBC, lipid profile, LFT, KFT, thyroid, MRI, and CT reports, then ask questions and receive simple cited explanations.

## Features

- Upload one or more PDF medical reports.
- Extract text with PyPDF and OCR fallback for scanned PDFs using Poppler, Tesseract, `pdf2image`, and `pytesseract`.
- Chunk documents page-by-page with chunk size 1000 and overlap 200.
- Generate Gemini `text-embedding-004` embeddings.
- Store chunks and metadata in ChromaDB.
- Ask questions using a LangChain LCEL RAG chain.
- Return citations with document name, page number, and chunk index.
- Explain medical terms, abnormal values, reference ranges, educational implications, common contributing factors, and doctor discussion questions.
- Support English, हिन्दी, and English + हिन्दी.
- Maintain chat history with `RunnableWithMessageHistory`.
- Export browser-generated PDF summaries from the workspace.
- Responsive React interface with dark mode and persistent disclaimers.
- Premium authentication for mobile and desktop users.
- Per-user report storage, vector retrieval, document lists, and chat history.
- Public Home, Features, and Contact pages.

## Safety Guardrails

The system never diagnoses diseases, confirms conditions, recommends treatments, suggests medications or dosages, provides emergency advice, or predicts outcomes. It uses cautious language such as “may indicate”, “can be associated with”, “might suggest”, and “could be related to”, and always directs users to qualified healthcare professionals.

## Architecture

```text
Upload Medical Report
  -> Extract Text
  -> Chunk Document Page-by-Page
  -> Generate Gemini Embeddings
  -> Store in ChromaDB
  -> Retrieve Relevant Chunks
  -> Generate Educational Explanation with Gemini 2.5 Flash
  -> Return Bilingual Response
  -> Display Citations + Disclaimer
```

## Project Structure

```text
medical-report-explainer/
├── frontend/
│   ├── src/
│   ├── public/
│   ├── Dockerfile
│   ├── vercel.json
│   └── package.json
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── rag/
│   │   ├── prompts/
│   │   ├── services/
│   │   ├── models/
│   │   └── main.py
│   ├── uploads/
│   ├── vector_store/
│   ├── render.yaml
│   ├── requirements.txt
│   └── Dockerfile
├── assets/
├── docker-compose.yml
├── .env.example
└── README.md
```

## API Documentation

### `GET /api/health`

Returns service status, configured upload/vector paths, and whether the Gemini key is present.

### `POST /api/upload`

Requires `Authorization: Bearer <token>`.

Multipart form-data:

- `files`: one or more PDF files.

Response:

```json
{
  "filenames": ["report.pdf"],
  "chunks_indexed": 12,
  "message": "Reports uploaded and indexed successfully."
}
```

### `POST /api/chat`

Requires `Authorization: Bearer <token>`.

Request:

```json
{
  "question": "Explain my report",
  "language": "both"
}
```

Valid `language` values: `en`, `hi`, `both`.

Response includes:

- `answer`
- `citations`
- `disclaimer_en`
- `disclaimer_hi`

### `GET /api/documents`

Requires `Authorization: Bearer <token>`.

Lists uploaded/indexed documents with chunk counts and pages.

### `DELETE /api/documents/{filename}`

Requires `Authorization: Bearer <token>`.

Deletes a document from ChromaDB and removes its uploaded PDF.

### `GET /api/history`

Requires `Authorization: Bearer <token>`.

Returns chat messages for the requested session. Optional query parameter: `session_id`.

### `POST /api/auth/register`

Request:

```json
{
  "name": "Premium User",
  "email": "user@example.com",
  "password": "strong-password"
}
```

Returns a bearer token and premium user profile.

### `POST /api/auth/login`

Request:

```json
{
  "email": "user@example.com",
  "password": "strong-password"
}
```

Returns a bearer token and premium user profile.

### `GET /api/auth/me`

Requires `Authorization: Bearer <token>`. Returns the current premium user.

## Local Setup

1. Copy environment variables:

```bash
cp .env.example .env
```

2. Add your Gemini API key:

```bash
GEMINI_API_KEY=your_key_here
AUTH_SECRET_KEY=replace_with_a_long_random_secret
```

3. Run with Docker:

```bash
docker-compose up --build
```

4. Open:

- Frontend: `http://localhost:5173`
- Backend API docs: `http://localhost:8000/docs`

## Manual Development

Backend:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## Deployment

### Frontend on Vercel

1. Set project root to `frontend`.
2. Set environment variable:

```text
VITE_API_BASE_URL=https://your-render-backend.onrender.com
```

3. Deploy with the included `frontend/vercel.json`.

### Backend on Render

1. Use Docker deployment.
2. Use `backend/render.yaml` as the service blueprint.
3. Set `GEMINI_API_KEY`.
4. Set `AUTH_SECRET_KEY` to a long random production secret.
5. Mount persistent disk at:

```text
/data
```

6. Store Chroma vectors at:

```text
/data/vector_store
```

The backend Dockerfile stores uploads in `/data/uploads` and premium auth data in `/data/auth.db`.

## Screenshots

Add screenshots after deployment:

- Landing page: `assets/screenshot-landing.png`
- Upload page: `assets/screenshot-upload.png`
- Chat workspace: `assets/screenshot-workspace.png`
- Citation inspector: `assets/screenshot-citations.png`

## Future Roadmap

- Payment provider integration for premium subscriptions.
- Longitudinal report comparison.
- Server-side PDF export.
- Hindi voice playback.
- Dashboard analytics for report types and usage.
- More robust OCR pipelines for low-quality scanned reports.
- Human-reviewed medical education templates for common panels.

## Important Reminder

This platform is for education only. It does not provide medical advice, diagnosis, treatment, emergency guidance, medication recommendations, or outcome prediction.
