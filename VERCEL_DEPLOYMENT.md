# Complete Vercel Deployment Guide - Node.js Backend

## What Changed
✅ Backend converted from Python (FastAPI) to Node.js (Express)
✅ Both frontend and backend can now run on Vercel
✅ No external hosting needed - everything in one platform

---

## Local Testing (Before Deployment)

### 1. Install Dependencies
```bash
# Install all dependencies (frontend + backend)
npm install

# Or manually:
cd backend && npm install
cd ../frontend && npm install
```

### 2. Run Backend (Terminal 1)
```bash
cd backend
npm run dev
```
Expected output: `Backend server running on port 8000`

### 3. Run Frontend (Terminal 2)
```bash
cd frontend
npm start
```
Expected output: Opens browser at `http://localhost:3000`

### 4. Test the Application
- Upload a job description
- Upload resumes
- Click "Match Resumes"
- Verify results appear

---

## Deployment to Vercel

### Step 1: Push to GitHub

```bash
# Initialize git if not done
git init

# Add files
git add .

# Commit
git commit -m "Convert backend to Node.js for Vercel deployment"

# Create repository on github.com and push
git remote add origin https://github.com/YOUR_USERNAME/sacha-resume-ats.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to https://vercel.com
2. Click "Add New..." → "Project"
3. Select your GitHub repository
4. **Root Directory**: Leave as default (.)
5. **Environment Variables**:
   - Add: `REACT_APP_API_URL = https://your-vercel-project.vercel.app/api`
6. Click "Deploy"

### Step 3: Wait for Build & Test

- Vercel will build both frontend and backend
- You'll get a URL like: `https://your-project.vercel.app`
- Test the application with the provided link

---

## File Structure

```
project/
├── backend/
│   ├── server.js              (Express server)
│   ├── fileUtils.js           (PDF/DOCX extraction)
│   ├── embeddings.js          (ML embeddings)
│   ├── scoring.js             (Resume matching logic)
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api.js             (API client)
│   │   ├── App.js
│   │   └── ...
│   ├── package.json
│   ├── .env.local
│   ├── .env.production
│   └── ...
├── package.json               (Root config)
├── vercel.json                (Vercel config)
└── .gitignore
```

---

## Backend Endpoints

All endpoints are available at your Vercel URL:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/health` | Service status |
| POST | `/jd` | Upload job description |
| POST | `/resumes` | Upload resumes (multiple files) |
| GET | `/match?threshold=60` | Get matching resumes |
| GET | `/download/:fileName` | Download a resume |
| POST | `/clear` | Clear all data |

---

## API Request Examples

### Upload Job Description
```javascript
const formData = new FormData();
formData.append('text', jobDescriptionText);
// OR
formData.append('file', jobDescriptionFile);

const response = await axios.post('/jd', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
```

### Upload Resumes
```javascript
const formData = new FormData();
formData.append('files', resumeFile1);
formData.append('files', resumeFile2);

const response = await axios.post('/resumes', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
```

### Get Matches
```javascript
const response = await axios.get('/match?threshold=60');
// Returns: { count, selected, threshold }
```

---

## Environment Variables

### Production (.env.production)
```
REACT_APP_API_URL=https://your-vercel-project.vercel.app/api
```

### Local Development (.env.local)
```
REACT_APP_API_URL=http://localhost:8000
```

---

## Troubleshooting

### Problem: "Failed to save JD"
**Solution**: 
- Check if backend is running
- Verify `REACT_APP_API_URL` is set correctly
- Check browser console for CORS errors

### Problem: "Module not found" error
**Solution**:
```bash
cd backend && npm install
cd ../frontend && npm install
```

### Problem: Large file uploads fail
**Solution**:
- Vercel has 6MB limit for serverless functions
- For large files, increase timeout in vercel.json:
```json
{
  "functions": {
    "backend/**/*.js": {
      "maxDuration": 60,
      "memory": 3008
    }
  }
}
```

### Problem: Model loading takes too long
**Solution**:
- The embeddings model loads on first request (slow)
- Subsequent requests are fast
- This is normal behavior

---

## Node.js Dependencies Used

| Package | Purpose |
|---------|---------|
| express | Web framework |
| cors | Cross-origin requests |
| multer | File uploads |
| pdfjs-dist | PDF parsing |
| mammoth | DOCX parsing |
| @xenova/transformers | ML embeddings |
| dotenv | Environment variables |

---

## Sharing Your Application

Once deployed, share this link:
```
https://your-vercel-project.vercel.app
```

Users can:
✅ Paste or upload job descriptions
✅ Upload multiple resumes
✅ Get AI-powered matching scores
✅ Download filtered resumes

---

## Advanced: Custom Domain

1. Go to Vercel Project Settings
2. Click "Domains"
3. Add your custom domain
4. Follow DNS setup instructions

---

## Support

For issues:
1. Check Vercel Logs: Project → Deployments → View Details
2. Check browser console (F12)
3. Check function logs in Vercel dashboard
