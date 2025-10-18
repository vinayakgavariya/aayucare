# AayuCare Troubleshooting Guide

Common issues and their solutions.

## Table of Contents

1. [Backend Issues
](#backend-issues)
2. [Frontend Issues
](#frontend-issues)
3. [API Key Issues
](#api-key-issues)
4. [Voice Input Issues
](#voice-input-issues)
5. [Map Widget Issues
](#map-widget-issues)
6. [Network Issues
](#network-issues)
7. [Deployment Issues
](#deployment-issues)

---

## Backend Issues

### Issue: "Module not found" Error

**Error Message**:
```
ModuleNotFoundError: No module named 'fastapi'
```

**Solution**:
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

---

### Issue: "Missing API keys"

**Error Message**:
```
ValueError: Missing API keys. Please set SARVAM_API_KEY and GEMINI_API_KEY
```

**Solution**:
1. Check `.env` file exists in `backend/` directory
2. Verify it contains:
   ```
   SARVAM_API_KEY=your_actual_key
   GEMINI_API_KEY=your_actual_key
   ```
3. Replace placeholders with actual keys
4. No quotes needed around keys
5. Restart backend

---

### Issue: Port 8000 Already in Use

**Error Message**:
```
ERROR: [Errno 48
] Address already in use
```

**Solution**:

**macOS/Linux**:
```bash
# Find process using port 8000
lsof -ti: 8000

# Kill it
lsof -ti: 8000 | xargs kill -9

# Or use specific port
uvicorn main:app --port 8001
```

**Windows**:
```cmd
netstat -ano | findstr : 8000
taskkill /PID <PID> /F
```

---

### Issue: Python Version Too Old

**Error Message**:
```
Python 3.11 or higher required
```

**Solution**:
1. Download Python 3.11+ from [python.org
](https: //www.python.org/)
2. Install it
3. Create new virtual environment:
   ```bash
   python3.11 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

---

### Issue: Import Errors with Sarvam/Gemini

**Error Message**:
```
ImportError: cannot import name 'AsyncSarvamAI'
```

**Solution**:
```bash
pip install --upgrade sarvamai
pip install --upgrade google-genai
```

---

## Frontend Issues

### Issue: "npm: command not found"

**Solution**:
1. Install Node.js from [nodejs.org
](https: //nodejs.org/)
2. Verify installation:
   ```bash
   node --version
   npm --version
   ```
3. Should show v18 or higher

---

### Issue: Port 3000 Already in Use

**Error Message**:
```
Port 3000 is already in use
```

**Solution**:

**macOS/Linux**:
```bash
lsof -ti: 3000 | xargs kill -9
```

**Windows**:
```cmd
netstat -ano | findstr : 3000
taskkill /PID <PID> /F
```

**Or use different port**:
```bash
PORT=3001 npm run dev
```

---

### Issue: "Module not found" in Next.js

**Error Message**:
```
Module not found: Can't resolve '@/components/...'
```

**Solution**:
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

### Issue: Build Fails

**Error Message**:
```
Type error: ...
```

**Solution**:
1. Check TypeScript errors:
   ```bash
   npm run build
   ```
2. Fix type errors shown
3. Common fixes:
   - Add missing type definitions
   - Check import paths
   - Verify component props

---

### Issue: Can't Connect to Backend

**Symptoms**:
- Searches don't work
- Network errors in console
- "Failed to fetch" errors

**Solution**:
1. **Check backend is running**:
   ```bash
   curl http: //localhost:8000/
   ```
   
2. **Check .env.local**:
   ```
   NEXT_PUBLIC_API_URL=http: //localhost:8000
   ```

3. **Check CORS settings**:
   - Open `backend/main.py`
   - Verify CORS middleware allows frontend origin

4. **Restart both services**

---

## API Key Issues

### Issue: Sarvam AI API Key Invalid

**Error Message**:
```
401 Unauthorized: Invalid API key
```

**Solution**:
1. Verify key from [sarvam.ai
](https: //www.sarvam.ai/)
2. Check for extra spaces in `.env`
3. Key format should be plain text (no quotes)
4. Restart backend after changing

---

### Issue: Gemini API Key Invalid

**Error Message**:
```
403 Forbidden: API key not valid
```

**Solution**:
1. Get new key from [ai.google.dev
](https: //ai.google.dev/)
2. Ensure key has access to:
   - Gemini API
   - Maps API (for grounding)
3. Check quota limits

---

### Issue: API Rate Limit Exceeded

**Error Message**:
```
429 Too Many Requests
```

**Solution**:
1. Wait a few minutes
2. Check API usage dashboard
3. Upgrade API plan if needed
4. Implement caching in application

---

## Voice Input Issues

### Issue: Microphone Permission Denied

**Symptoms**:
- Recording doesn't start
- Permission popup doesn't appear

**Solution**:

**Chrome/Edge**:
1. Click lock icon in address bar
2. Set Microphone to "Allow"
3. Refresh page

**Firefox**:
1. Click shield icon
2. Enable microphone permission
3. Refresh page

**Safari**:
1. Safari → Settings → Websites → Microphone
2. Allow for localhost

---

### Issue: Voice Input Not Working on HTTP

**Error Message**:
```
NotAllowedError: Permission denied
```

**Solution**:
- Microphone requires HTTPS in production
- HTTP only works on localhost
- In production, always use HTTPS

---

### Issue: Recording but No Transcription

**Symptoms**:
- Recording works
- Processing indicator shows
- No transcription appears

**Solution**:
1. **Check audio format**:
   - Browser might use different format
   - Check console for errors

2. **Check Sarvam API**:
   - Verify API key
   - Check API status

3. **Check network**:
   - Open DevTools → Network tab
   - Look for failed requests

4. **Try text input instead**:
   - Use text input to verify backend works

---

### Issue: Poor Transcription Quality

**Solution**:
1. Speak clearly and slowly
2. Reduce background noise
3. Use good quality microphone
4. Check microphone settings
5. Try different browser

---

## Map Widget Issues

### Issue: Map Not Showing

**Symptoms**:
- Gray box instead of map
- "Map view unavailable" message

**Solution**:
1. **Add Google Maps API Key**:
   ```bash
   # In frontend/.env.local
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key
   ```

2. **Enable Maps JavaScript API**:
   - Go to [Google Cloud Console
](https: //console.cloud.google.com/)
   - Enable "Maps JavaScript API"
   - Enable "Maps Embed API"

3. **Check API restrictions**:
   - Remove HTTP referrer restrictions for testing
   - Add your domain for production

4. **Restart frontend** after adding key

---

### Issue: Map Shows Error

**Error in Console**:
```
Google Maps JavaScript API error: InvalidKeyMapError
```

**Solution**:
1. Verify key is correct
2. Check key hasn't been restricted
3. Ensure billing is enabled (Google requires it)
4. Wait a few minutes after creating key

---

## Network Issues

### Issue: Slow Response Times

**Solution**:
1. **Check internet connection**
2. **Check API status**:
   - Sarvam AI status
   - Google Gemini status
3. **Optimize requests**:
   - Reduce search radius
   - Implement caching
4. **Use production deployment**:
   - Production servers are faster

---

### Issue: CORS Errors

**Error Message**:
```
Access to fetch at 'http: //localhost:8000' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```

**Solution**:
1. **Check backend CORS settings** in `main.py`:
   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=[
    "http://localhost:3000"
],  # Add your frontend URL
       allow_credentials=True,
       allow_methods=[
    "*"
],
       allow_headers=[
    "*"
],
   )
   ```

2. **Restart backend** after changes

---

### Issue: Timeout Errors

**Error Message**:
```
Request timeout
```

**Solution**:
1. Increase timeout in frontend
2. Check backend logs
3. Verify API responses
4. Check network connection

---

## Deployment Issues

### Issue: Vercel Deployment Fails

**Error**:
```
Build failed
```

**Solution**:
1. Check build locally first:
   ```bash
   npm run build
   ```
2. Fix any TypeScript errors
3. Verify environment variables in Vercel
4. Check build logs for specific errors

---

### Issue: Render Backend Not Starting

**Error**:
```
Service failed to start
```

**Solution**:
1. **Check environment variables**:
   - SARVAM_API_KEY set
   - GEMINI_API_KEY set

2. **Check logs** in Render dashboard

3. **Verify requirements.txt** is present

4. **Check Python version** in Render settings

---

### Issue: Frontend Can't Connect to Deployed Backend

**Solution**:
1. **Update .env in Vercel**:
   ```
   NEXT_PUBLIC_API_URL=https: //your-backend.onrender.com
   ```

2. **Update CORS in backend**:
   ```python
   allow_origins=[
    "https://your-frontend.vercel.app"
]
   ```

3. **Redeploy both** services

---

## Location Issues

### Issue: Location Permission Denied

**Solution**:
1. Browser will ask for permission
2. If denied, app uses default location (Bhopal, India)
3. To reset permission:
   - Click lock/info icon in address bar
   - Reset location permission
   - Refresh page

---

### Issue: Inaccurate Location

**Solution**:
- Browser location can be approximate
- For better accuracy, use mobile device
- Location is used for nearby search radius

---

## General Debugging

### Check Browser Console

**Open DevTools**:
- Chrome/Edge: F12 or Cmd+Option+I (Mac)
- Firefox: F12 or Cmd+Option+I (Mac)
- Safari: Cmd+Option+I (Mac)

**Look for**:
- Error messages (red)
- Network failures
- Console warnings

---

### Check Backend Logs

**Terminal where backend is running**:
- Look for error stack traces
- Check API call logs
- Verify requests are received

---

### Check Network Tab

**In DevTools → Network**:
1. Perform action that fails
2. Look for failed requests (red)
3. Click request to see:
   - Request payload
   - Response
   - Headers
   - Status code

---

### Test API Directly

```bash
# Test health
curl http: //localhost:8000/

# Test with verbose
curl -v http: //localhost:8000/

# Test POST request
curl -X POST http: //localhost:8000/find-doctors \
  -H "Content-Type: application/json" \
  -d '{
    "symptom_text": "test",
    "latitude": 23.2599,
    "longitude": 77.4126,
    "language": "english",
    "radius_km": 10
}'
```

---

## Still Having Issues?

If none of these solutions work:

1. **Check all documentation**:
   - README.md
   - SETUP.md
   - DEPLOYMENT.md

2. **Try clean install**:
   ```bash
   # Backend
   cd backend
   rm -rf venv
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   
   # Frontend
   cd frontend
   rm -rf node_modules .next
   npm install
   ```

3. **Check versions**:
   ```bash
   python --version  # Should be 3.11+
   node --version    # Should be 18+
   npm --version
   ```

4. **Open GitHub Issue**:
   - Describe the problem
   - Include error messages
   - Share relevant logs
   - Mention your environment (OS, browser, versions)

---

## Quick Checklist

When something doesn't work:

- [] Backend running?
- [] Frontend running?
- [] API keys set?
- [] .env files present?
- [] Dependencies installed?
- [] Correct Node/Python version?
- [] Console errors?
- [] Network errors?
- [] Tried restarting?
- [] Checked documentation?

---

**Most issues can be solved by checking these basics! 🔍**

