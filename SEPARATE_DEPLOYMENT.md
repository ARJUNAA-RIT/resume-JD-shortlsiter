# Separate Deployment Guide (Frontend + Backend)

This guide covers deploying **Frontend on Vercel** and **Backend on Render.com** separately.

---

## Part 1: Deploy Backend to Render.com

### Step 1: Create Render Account
- Go to https://render.com
- Sign up with GitHub account
- Authorize Render to access your repositories

### Step 2: Create Web Service
- Click "New+" → "Web Service"
- Select your GitHub repository: `resume-JD-shortlsiter`
- Click "Connect"

### Step 3: Configure Backend Service

Fill in the configuration:

| Field | Value |
|-------|-------|
| **Name** | `resume-ats-backend` |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Plan** | Free |

### Step 4: Deploy
- Click "Create Web Service"
- Wait for deployment (2-3 minutes)
- You'll get a URL like: `https://resume-ats-backend.onrender.com`
- **Save this URL** - you'll need it for frontend

### Step 5: Test Backend
- Visit `https://resume-ats-backend.onrender.com/`
- Should see: `{"status": "Backend is running", ...}`

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Create Vercel Account
- Go to https://vercel.com
- Sign in with GitHub account

### Step 2: Import Project
- Click "Add New..." → "Project"
- Select repository: `resume-JD-shortlsiter`
- Click "Import"

### Step 3: Configure Frontend

**Root Directory**: `frontend` ← **IMPORTANT**

Other settings:
- **Build Command**: `npm run build`
- **Output Directory**: `build`
- **Install Command**: `npm install`

### Step 4: Set Environment Variables

Click "Environment Variables" and add:

```
Name:  REACT_APP_API_URL
Value: https://resume-ats-backend.onrender.com
```
(Replace with your actual Render URL from Part 1)

### Step 5: Deploy
- Click "Deploy"
- Wait for build (2-3 minutes)
- You'll get a URL like: `https://resume-ats-frontend.vercel.app`

### Step 6: Test
- Visit your Vercel URL
- Upload a job description
- Upload resumes
- Click "Match Resumes"
- Results should appear!

---

## Troubleshooting

### Error: "Cannot POST /jd"
**Solution:**
1. Check Render backend is running: `https://your-render-url/`
2. Verify Vercel environment variable: Go to Settings → Environment Variables
3. Make sure `REACT_APP_API_URL` matches your Render URL exactly
4. Redeploy Vercel after updating variable

### Error: "Failed to connect to backend"
**Solution:**
- Backend on Render might be "sleeping" (free tier)
- Visit backend URL to wake it up
- Then try frontend again

### Slow first request
**This is normal** - backend models load on first use (5-10 seconds)

---

## Final URLs

After deployment, you'll have:

```
Frontend (Vercel):  https://your-project.vercel.app
Backend (Render):   https://your-backend.onrender.com
```

**Share the Vercel frontend URL** with users!

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│              User's Browser                              │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  Vercel (Frontend React)      │
        │  - Upload JD/Resumes UI       │
        │  - Display results            │
        └────────────────┬──────────────┘
                         │
         ┌───────────────▼───────────────┐
         │   REACT_APP_API_URL           │
         │ (Render backend URL)          │
         └───────────────┬───────────────┘
                         │
                         ▼
        ┌────────────────────────────────┐
        │  Render (Backend Node.js)      │
        │  - Process files               │
        │  - ML scoring                  │
        │  - Return results              │
        └────────────────────────────────┘
```

---

## Next Steps

1. ✅ Deploy backend to Render first
2. ✅ Get backend URL
3. ✅ Deploy frontend to Vercel
4. ✅ Add backend URL as environment variable
5. ✅ Test the application
6. ✅ Share Vercel URL with others

---

## Important Notes

### Render Free Tier
- Services spin down after 15 minutes of inactivity
- First request after idle takes 5-10 seconds to "wake up"
- For production, upgrade to paid plan

### Vercel Free Tier
- Unlimited deployments
- Good performance for frontend
- 10GB bandwidth per month

### Keep Backend Running (Optional)
- Add a monitoring service to ping backend every 5 minutes
- Use services like Koyeb's free cron jobs
- Prevents cold start delays
