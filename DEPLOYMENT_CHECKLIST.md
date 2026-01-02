# Vercel Deployment Checklist

## Before Deploying

- [ ] Code pushed to GitHub: https://github.com/ARJUNAA-RIT/resume-JD-shortlsiter
- [ ] All files committed and pushed

## Step-by-Step Deployment

### 1. Go to Vercel Dashboard
- Visit: https://vercel.com/dashboard
- Sign in with GitHub account

### 2. Import Project
- Click "Add New..." → "Project"
- Select repository: `resume-JD-shortlsiter`
- Click "Import"

### 3. Configure Project
In the "Configure Project" screen:
- **Root Directory**: Leave as default (.) ← IMPORTANT
- **Build Command**: `cd frontend && npm install && npm run build`
- **Output Directory**: `frontend/build`
- **Install Command**: `npm install`

### 4. Set Environment Variables
- Click "Environment Variables"
- Add variable:
  ```
  Name:  REACT_APP_API_URL
  Value: https://your-vercel-project.vercel.app
  ```
  (Replace `your-vercel-project` with your actual Vercel project name)

### 5. Deploy
- Click "Deploy"
- Wait for build to complete (3-5 minutes)

## After Deployment

### 6. Get Your URL
- Vercel gives you a URL like: `https://your-vercel-project.vercel.app`
- This is your **working application link**

### 7. Update Environment Variable
- Go to Project Settings → Environment Variables
- Update `REACT_APP_API_URL` with the actual Vercel URL
- **Redeploy** from the Deployments tab

### 8. Test Application
- Visit your Vercel URL
- Upload a job description
- Upload resumes
- Click "Match Resumes"
- Verify it works!

## Troubleshooting

### Error: "react api is not exist"
**Solution:**
- Go to Vercel Project Settings
- Check Environment Variables section
- Make sure `REACT_APP_API_URL` is set correctly
- Redeploy

### Error: "Cannot POST /jd"
**Solution:**
- The environment variable must have the correct URL
- Format should be: `https://your-vercel-project.vercel.app`
- No `/api` suffix needed

### Error: "Module not found" during build
**Solution:**
- Check that Root Directory is set to `.` (current directory)
- Ensure `package.json` files exist in both `frontend/` and `backend/`

### Slow first request (5-10 seconds)
**This is normal** - the ML model loads on first request. Subsequent requests are faster.

## Important Notes

⚠️ **Data Persistence:**
- Vercel is stateless - data resets when server restarts
- This is fine for testing/demo purposes
- For production, add a database (MongoDB, PostgreSQL, etc.)

⚠️ **Free Tier Limitations:**
- 6MB function size limit
- 60-second function timeout
- Memory: 1024MB

## Support

If deployment fails:
1. Check Vercel Logs: Project → Deployments → Click deployment → View Logs
2. Look for error messages
3. Common issues:
   - Missing `REACT_APP_API_URL` environment variable
   - Wrong Root Directory setting
   - npm packages not installed

---

**Your Project:**
- GitHub: https://github.com/ARJUNAA-RIT/resume-JD-shortlsiter
- Vercel: https://your-vercel-project.vercel.app (after deployment)
