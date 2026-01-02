# Deployment Guide

## Frontend Deployment (Vercel)

### Steps:
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Sign in with GitHub account
4. Click "Add New..." → "Project"
5. Select your repository
6. In Environment Variables, add:
   - **Key**: `REACT_APP_API_URL`
   - **Value**: Your backend API URL (e.g., `https://your-api-domain.com`)
7. Click "Deploy"

The `vercel.json` file is already configured to build the frontend folder.

---

## Backend Deployment (Must be done separately)

⚠️ **Important**: Vercel only hosts frontend applications. Your FastAPI backend needs a separate hosting service.

### Recommended Backend Hosting Options:

#### 1. **Render.com** (Recommended - Free tier available)
- Supports Python/FastAPI
- Easy deployment from GitHub
- Steps:
  1. Go to [render.com](https://render.com)
  2. Sign up with GitHub
  3. Create new "Web Service"
  4. Connect your GitHub repository
  5. Set Root Directory: `backend`
  6. Build Command: `pip install -r requirements.txt`
  7. Start Command: `uvicorn main:app --host 0.0.0.0 --port 8000`
  8. Deploy and copy the service URL

#### 2. **Railway.app** (Simple and free)
- Go to [railway.app](https://railway.app)
- Connect GitHub repo
- Railway auto-detects Python project
- Copy deployed URL

#### 3. **Heroku** (Paid, but simple)
- Create account at [heroku.com](https://heroku.com)
- Install Heroku CLI
- Run commands from backend folder

---

## After Backend Deployment

1. Copy your backend URL (e.g., `https://your-backend-12345.onrender.com`)
2. Go to Vercel project settings
3. Update `REACT_APP_API_URL` environment variable with your backend URL
4. Vercel will automatically redeploy

---

## Backend Production Ready Checklist

- ✅ CORS enabled (already configured)
- ✅ Environment variables support ready
- Add these to your backend deployment:
  - Create `.env` file in backend folder with any sensitive keys
  - Update `requirements.txt` if you added new packages

---

## Testing After Deployment

1. Visit your Vercel URL
2. Upload a job description
3. Upload resumes
4. Check if results load properly
5. If errors occur, check:
   - Browser Console (F12) for frontend errors
   - Backend logs in Render/Railway dashboard
   - Ensure `REACT_APP_API_URL` is correct in Vercel

---

## Troubleshooting

**"Failed to save JD" error?**
- Check if `REACT_APP_API_URL` is set correctly in Vercel
- Verify backend is running and accessible
- Check CORS settings if getting "blocked by CORS" error

**Backend not responding?**
- Verify backend is deployed and running
- Check if free tier of hosting service is still active
- Restart the service in hosting dashboard
