# Separate Deployment Checklist

## Frontend on Vercel + Backend on Render (EASIEST)

See detailed guide: [SEPARATE_DEPLOYMENT.md](SEPARATE_DEPLOYMENT.md)

---

## Quick Checklist

### Backend Deployment (Render.com)
- [ ] Account created on render.com
- [ ] Repository connected with GitHub
- [ ] Web Service created with:
  - Root Directory: `backend`
  - Build Command: `npm install`
  - Start Command: `npm start`
- [ ] Backend deployed and running
- [ ] Backend URL copied: `https://your-backend.onrender.com`
- [ ] Health check passing: `GET https://your-backend.onrender.com/`

### Frontend Deployment (Vercel)
- [ ] Account created on vercel.com
- [ ] Repository imported from GitHub
- [ ] Root Directory set to: `frontend`
- [ ] Environment Variable added:
  ```
  REACT_APP_API_URL = https://your-backend.onrender.com
  ```
- [ ] Frontend deployed successfully
- [ ] Frontend URL obtained: `https://your-project.vercel.app`

### Testing
- [ ] Visit frontend URL
- [ ] Upload job description
- [ ] Upload resumes
- [ ] Match resumes
- [ ] Results appear successfully

---

## Step-by-Step

### 1. Deploy Backend to Render (5 minutes)

```
1. Go to render.com → New+ → Web Service
2. Select your GitHub repo
3. Set Root Directory: backend
4. Build: npm install
5. Start: npm start
6. Click Deploy
7. Copy the URL when done
```

### 2. Deploy Frontend to Vercel (5 minutes)

```
1. Go to vercel.com → Add Project
2. Select your GitHub repo
3. Set Root Directory: frontend
4. Add Environment Variable:
   REACT_APP_API_URL = [paste backend URL from step 1]
5. Click Deploy
6. Wait for build to complete
```

### 3. Test & Share

```
1. Visit your Vercel URL
2. Test the application
3. Share Vercel URL with users
```

---

## Advantages of Separate Deployment

✅ **Simpler setup** - Each platform does one thing  
✅ **Better scaling** - Scale frontend and backend independently  
✅ **Clearer debugging** - Easier to find issues  
✅ **Free tier friendly** - Both platforms have good free tiers  
✅ **Production ready** - Standard industry practice  

---

## Common Issues

| Issue | Solution |
|-------|----------|
| "Cannot POST /jd" | Check environment variable and backend URL |
| Slow first request | Normal - backend model loads on first use |
| Backend appears offline | Render free tier sleeps after 15 min inactivity |
| "Module not found" | Ensure Root Directory is correct in settings |

---

## Your URLs After Deployment

**Frontend:** https://your-project.vercel.app  
**Backend:** https://your-backend.onrender.com  
**GitHub:** https://github.com/ARJUNAA-RIT/resume-JD-shortlsiter

**Share only the Frontend URL** with others!

