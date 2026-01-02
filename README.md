# Resume-JD Shortlister

An AI-powered Resume ATS (Applicant Tracking System) matcher that uses machine learning to match job descriptions with resumes.

## Features

✨ **Smart Resume Matching**
- AI-powered semantic similarity analysis
- TF-IDF keyword matching
- Skill extraction and weighting
- Education level matching
- Experience level matching

📄 **File Support**
- PDF resume parsing
- DOCX resume parsing
- Plain text support
- Batch upload multiple resumes

🎯 **Scoring System**
- Comprehensive matching algorithm
- Customizable threshold filtering
- Detailed scoring breakdown
- Resume ranking by match score

## Tech Stack

**Frontend:**
- React 18
- Axios for API calls
- CSS3

**Backend:**
- Node.js / Express
- Sentence Transformers (ML embeddings)
- TF-IDF algorithm
- PDF/DOCX parsing

## Getting Started

### Prerequisites
- Node.js 14+
- npm or yarn

### Local Development

1. **Install dependencies:**
```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

2. **Run backend (Terminal 1):**
```bash
cd backend
npm run dev
```
Server runs on `http://localhost:8000`

3. **Run frontend (Terminal 2):**
```bash
cd frontend
npm start
```
App opens at `http://localhost:3000`

4. **Test the application:**
   - Upload a job description (text or file)
   - Upload one or more resumes
   - Set matching threshold
   - Click "Match Resumes"

## Deployment

### Deploy to Vercel

See [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) for complete deployment guide.

**Quick steps:**
1. Push to GitHub
2. Connect repository to Vercel
3. Add environment variable: `REACT_APP_API_URL=https://your-vercel-url/api`
4. Deploy!

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| POST | `/jd` | Upload job description |
| POST | `/resumes` | Upload resumes |
| GET | `/match?threshold=60` | Get matching resumes |
| GET | `/download/:fileName` | Download resume |

## Project Structure

```
resume-JD-shortlister/
├── backend/
│   ├── server.js
│   ├── fileUtils.js
│   ├── scoring.js
│   ├── embeddings.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   ├── api.js
│   │   └── ...
│   ├── package.json
│   └── .env.production
├── package.json
├── vercel.json
└── VERCEL_DEPLOYMENT.md
```

## How It Works

1. **Job Description Processing:**
   - Extract text from JD (file or text input)
   - Normalize and preprocess text
   - Generate embeddings using AI model

2. **Resume Matching:**
   - Extract text from each resume
   - Generate embeddings
   - Calculate multiple scoring metrics:
     - Semantic similarity (35%)
     - TF-IDF keyword matching (20%)
     - Skill matching (25%)
     - Education level (12%)
     - Experience level (8%)

3. **Results:**
   - Filter by threshold
   - Sort by match score
   - Download matched resumes

## Performance Notes

- First embedding generation may take 5-10 seconds (model loading)
- Subsequent requests are faster
- Large file uploads may take longer
- Vercel free tier has 6MB function limit

## License

MIT

## Support

For issues or questions, check:
- [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) for deployment help
- Browser console (F12) for frontend errors
- Backend logs for server errors

---

**Happy Resume Matching! 🚀**
