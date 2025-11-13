# 🚀 Deploying Voice Generator to Vercel

This guide will help you deploy your Voice Generator application to Vercel.

## 📋 Prerequisites

1. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
2. **GitHub/GitLab/Bitbucket Account** - Your code should be in a Git repository

## 🎯 Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Import Project to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Git Repository"
   - Select your repository
   - Click "Import"

3. **Configure Project Settings**
   - **Framework Preset:** Create React App
   - **Root Directory:** `frontend` (or leave as root if deploying from root)
   - **Build Command:** `cd frontend && npm install && npm run build`
   - **Output Directory:** `frontend/build`
   - **Install Command:** `npm install`

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Your app will be live! 🎉

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## ⚙️ Project Structure for Vercel

```
voice-generator/
├── api/                    # Vercel Serverless Functions (optional)
│   └── health.js
├── frontend/               # React App
│   ├── src/
│   ├── public/
│   └── package.json
├── vercel.json            # Vercel Configuration
└── package.json           # Root package.json
```

## 🔧 Configuration Files

### vercel.json
This file configures:
- Build settings for frontend
- Rewrites for React Router (if needed)

## 📝 Important Notes

1. **Frontend Only**: This app uses browser's built-in Web Speech API, so no backend API is needed
   - The app works entirely in the browser
   - No API keys or external services required

2. **Frontend**: The React app is served from the root URL
   - All routes are handled by React Router (if you add routing later)

3. **No Environment Variables Needed**: Since we're using browser TTS, no API keys are required

## 🧪 Testing After Deployment

1. **Test the App**
   - Visit your Vercel URL
   - Try generating speech with different voices
   - Test download functionality
   - Verify all controls work correctly

## 🐛 Troubleshooting

### Build Fails

**Error: "Build command failed"**
- Check that `frontend/package.json` has correct build script
- Verify all dependencies are in `package.json`
- Check build logs in Vercel dashboard

**Solution:**
```bash
cd frontend
npm install
npm run build
# Fix any errors locally first
```

### API Routes Return 404

**Error: "Cannot GET /api/..."**
- Check that `api/` folder exists in root
- Verify `vercel.json` has correct routes
- Check function files are named correctly

**Solution:**
- Ensure `api/` folder is in the root directory
- Check file names match route paths exactly


### CORS Errors

**Error: "CORS policy blocked"**
- Vercel serverless functions handle CORS automatically
- If issues persist, check function response headers

## 🔄 Updating Your Deployment

1. **Make changes to your code**
2. **Commit and push to Git**
   ```bash
   git add .
   git commit -m "Update app"
   git push
   ```
3. **Vercel automatically deploys** (if auto-deploy is enabled)
4. **Or manually deploy:**
   ```bash
   vercel --prod
   ```

## 📊 Monitoring

- **Deployments**: View all deployments in Vercel Dashboard
- **Analytics**: Enable Vercel Analytics for usage stats

## 🔐 Security Best Practices

1. **Never commit `.env` files** - Already in `.gitignore`
2. **Enable Vercel Authentication** - Optional, for private deployments

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)
- [Environment Variables](https://vercel.com/docs/environment-variables)
- [Deployment Guide](https://vercel.com/docs/deployments)

## ✅ Deployment Checklist

- [ ] Code pushed to Git repository
- [ ] Vercel account created
- [ ] Project imported to Vercel
- [ ] Build settings configured
- [ ] Deployment successful
- [ ] Frontend loads correctly
- [ ] Text-to-speech working
- [ ] Voice selection working
- [ ] Download functionality working

---

**Need Help?** Check Vercel's [documentation](https://vercel.com/docs) or [community](https://github.com/vercel/vercel/discussions)

