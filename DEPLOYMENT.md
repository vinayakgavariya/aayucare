# AayuCare Deployment Guide

Complete guide for deploying AayuCare to production.

## Prerequisites

Before deploying, ensure you have:
- ✅ Sarvam AI API Key ([Get it here
](https: //www.sarvam.ai/))
- ✅ Google Gemini API Key ([Get it here
](https: //ai.google.dev/))
- ✅ Google Maps API Key (Optional - [Get it here
](https: //console.cloud.google.com/apis/credentials))
- ✅ GitHub account
- ✅ Vercel account (for frontend)
- ✅ Render/Railway/GCP account (for backend)

---

## Backend Deployment

### Option 1: Render (Recommended)

1. **Push code to GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Create Render account**: [render.com
](https: //render.com)

3. **Create new Web Service**:
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Select the `backend` directory
   - Settings:
     - **Name**: aayucare-api
     - **Environment**: Python 3
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

4. **Set Environment Variables**:
   - Go to "Environment" tab
   - Add:
     - `SARVAM_API_KEY`: your-sarvam-api-key
     - `GEMINI_API_KEY`: your-gemini-api-key

5. **Deploy**: Click "Create Web Service"

6. **Note your API URL**: e.g., `https: //aayucare-api.onrender.com`

### Option 2: Railway

1. **Create Railway account**: [railway.app
](https: //railway.app)

2. **Create new project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Select your repository
   - Railway will auto-detect Python

3. **Configure**:
   - Add environment variables (SARVAM_API_KEY, GEMINI_API_KEY)
   - Railway will automatically deploy

### Option 3: Google Cloud Run

```bash
cd backend

# Set your project ID
gcloud config set project YOUR_PROJECT_ID

# Deploy
gcloud run deploy aayucare-api \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars SARVAM_API_KEY=your-key,GEMINI_API_KEY=your-key
```

### Option 4: Docker

```bash
cd backend

# Build Docker image
docker build -t aayucare-api .

# Run locally
docker run -p 8000: 8000 \
  -e SARVAM_API_KEY=your-key \
  -e GEMINI_API_KEY=your-key \
  aayucare-api
```

---

## Frontend Deployment

### Option 1: Vercel (Recommended)

1. **Push code to GitHub** (if not done already)

2. **Create Vercel account**: [vercel.com
](https: //vercel.com)

3. **Import project**:
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

4. **Configure**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

5. **Environment Variables**:
   - Go to "Settings" → "Environment Variables"
   - Add:
     - `NEXT_PUBLIC_API_URL`: your-backend-url (e.g., https: //aayucare-api.onrender.com)
     - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: your-google-maps-key (optional)

6. **Deploy**: Click "Deploy"

7. **Custom Domain** (Optional):
   - Go to "Settings" → "Domains"
   - Add your custom domain

### Option 2: Netlify

1. **Create Netlify account**: [netlify.com
](https: //netlify.com)

2. **Import project**:
   - Click "Add new site" → "Import an existing project"
   - Connect to GitHub
   - Select your repository

3. **Configure**:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`

4. **Environment Variables**:
   - Add same variables as Vercel

5. **Deploy**

### Option 3: Self-Hosted

```bash
cd frontend

# Build
npm run build

# Start production server
npm start
```

Or use PM2:
```bash
npm install -g pm2
pm2 start npm --name "aayucare" -- start
pm2 save
```

---

## Post-Deployment Checklist

### Backend
- [] API is accessible at your backend URL
- [] Test health endpoint: `curl https: //your-backend-url/`
- [] Test transcribe endpoint with sample audio
- [] Test find-doctors endpoint
- [] Check logs for any errors
- [] Monitor API performance

### Frontend
- [] Website loads correctly
- [] Voice input works
- [] Text input works
- [] Language toggle works
- [] Results page displays correctly
- [] Maps widget loads (if Google Maps API key provided)
- [] Mobile responsive
- [] Test on different browsers
- [] Check console for errors

### Integration
- [] Frontend can connect to backend
- [] CORS is properly configured
- [] API responses are displayed correctly
- [] Error handling works
- [] Location permission works

---

## Environment Variables Reference

### Backend
```env
SARVAM_API_KEY=your_sarvam_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

### Frontend
```env
NEXT_PUBLIC_API_URL=https: //your-backend-url.com
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

---

## Monitoring & Maintenance

### Backend Monitoring
- Use Render/Railway/GCP dashboard to monitor:
  - Request count
  - Response times
  - Error rates
  - Resource usage

### Frontend Monitoring
- Use Vercel Analytics:
  - Page views
  - Performance metrics
  - Error tracking

### Logs
- **Backend**: Check platform logs (Render/Railway/GCP)
- **Frontend**: Check Vercel logs or browser console

---

## Troubleshooting

### Backend Issues

**Problem**: API not responding
- Check if service is running
- Check environment variables are set
- Check logs for errors
- Verify API keys are valid

**Problem**: CORS errors
- Update CORS settings in `main.py`
- Add your frontend URL to `allow_origins`

**Problem**: Transcription fails
- Check Sarvam AI API key
- Verify audio format is supported
- Check API rate limits

### Frontend Issues

**Problem**: Can't connect to backend
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check backend is running
- Check CORS is configured

**Problem**: Maps not showing
- Check `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set
- Verify Google Maps API is enabled
- Check browser console for errors

**Problem**: Voice input not working
- Check browser permissions
- Test on HTTPS (required for microphone)
- Check browser compatibility

---

## Security Recommendations

1. **API Keys**:
   - Never commit API keys to Git
   - Use environment variables
   - Rotate keys regularly

2. **CORS**:
   - Update `allow_origins` to specific domains in production
   - Don't use `[
    "*"
]` in production

3. **HTTPS**:
   - Always use HTTPS in production
   - Required for microphone access

4. **Rate Limiting**:
   - Implement rate limiting on backend
   - Monitor API usage

5. **Error Handling**:
   - Don't expose sensitive info in error messages
   - Log errors securely

---

## Scaling Considerations

### Backend
- Use auto-scaling on Render/GCP
- Consider caching for common queries
- Implement request queuing
- Monitor API rate limits

### Frontend
- Vercel handles scaling automatically
- Use CDN for static assets
- Implement lazy loading
- Optimize images

---

## Cost Estimation

### Free Tier (Development/Testing)
- **Backend**: Render Free ($0) or Railway Trial ($5 credit)
- **Frontend**: Vercel Free ($0)
- **Sarvam AI**: Pay per use
- **Google Gemini**: Free tier available
- **Google Maps**: $200 free credit/month

### Production (Estimated monthly)
- **Backend**: Render Starter ($7) or GCP Cloud Run (pay-per-use)
- **Frontend**: Vercel Pro ($20) if needed
- **APIs**: Based on usage

---

## Support

For deployment issues:
1. Check logs first
2. Review this guide
3. Open GitHub issue
4. Check platform-specific documentation

---

**Ready to deploy?** Follow the steps above and your AayuCare application will be live! 🚀

