# AayuCare Local Setup Guide

Step-by-step guide to set up AayuCare on your local machine.

## Prerequisites

### Required
- **Node.js**: Version 18 or higher ([Download
](https: //nodejs.org/))
- **Python**: Version 3.11 or higher ([Download
](https: //www.python.org/))
- **Git**: For version control ([Download
](https: //git-scm.com/))

### API Keys (Required)
1. **Sarvam AI API Key**: 
   - Visit [sarvam.ai
](https: //www.sarvam.ai/)
   - Sign up and get your API key
   
2. **Google Gemini API Key**: 
   - Visit [Google AI Studio
](https: //ai.google.dev/)
   - Sign in with Google account
   - Get your API key

3. **Google Maps API Key** (Optional but recommended):
   - Visit [Google Cloud Console
](https: //console.cloud.google.com/)
   - Create a project
   - Enable Maps JavaScript API
   - Get your API key

---

## Step 1: Clone/Download the Project

```bash
cd /Users/vinayakgavariya/aayucare
# If you haven't already cloned the repo
```

---

## Step 2: Backend Setup

### 2.1 Navigate to Backend Directory
```bash
cd backend
```

### 2.2 Create Python Virtual Environment
```bash
# Create virtual environment
python -m venv venv

# Activate it
# On macOS/Linux:
source venv/bin/activate

# On Windows:
# venv\Scripts\activate
```

### 2.3 Install Python Dependencies
```bash
pip install -r requirements.txt
```

This will install:
- FastAPI (Web framework)
- Uvicorn (ASGI server)
- Sarvam AI SDK
- Google Generative AI SDK
- Other required packages

### 2.4 Create Environment File
```bash
cp .env.example .env
```

### 2.5 Add Your API Keys
Open `.env` file and add your API keys:
```env
SARVAM_API_KEY=your_actual_sarvam_api_key
GEMINI_API_KEY=your_actual_gemini_api_key
```

### 2.6 Test Backend
```bash
python main.py
```

You should see:
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http: //0.0.0.0:8000
```

Test in browser: http: //localhost:8000
You should see: `{
    "message": "AayuCare API is running",
    "version": "1.0.0"
}`

**Keep this terminal running!**

---

## Step 3: Frontend Setup

Open a **NEW terminal window** (keep backend running).

### 3.1 Navigate to Frontend Directory
```bash
cd /Users/vinayakgavariya/aayucare/frontend
```

### 3.2 Install Node Dependencies
```bash
npm install
```

This will install:
- Next.js
- React
- TailwindCSS
- TypeScript
- Other required packages

### 3.3 Create Environment File
```bash
cp .env.local.example .env.local
```

### 3.4 Configure Environment Variables
Open `.env.local` and update:
```env
NEXT_PUBLIC_API_URL=http: //localhost:8000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

**Note**: If you don't have Google Maps API key, the app will still work but maps won't display.

### 3.5 Start Development Server
```bash
npm run dev
```

You should see:
```
▲ Next.js 15.x.x
- Local:        http: //localhost:3000
- Ready in 2.5s
```

### 3.6 Open in Browser
Visit: http: //localhost:3000

You should see the AayuCare home page! 🎉

---

## Step 4: Test the Application

### Test Text Input
1. Select a language (e.g., English or Hindi)
2. Click on "Text Input" card
3. Type symptoms like "knee pain for 2 weeks"
4. Click "Find Doctors"
5. Wait for results

### Test Voice Input
1. Click on "Voice Input" card
2. Click "Start Recording"
3. Allow microphone access when prompted
4. Speak clearly: "मुझे घुटनों में दर्द है" (or in English)
5. Click "Stop Recording"
6. Wait for transcription and results

### Test Different Languages
1. Click language dropdown in header
2. Select different languages (Hindi, Tamil, etc.)
3. Try text input with local language text
4. Verify results are in selected language

---

## Step 5: Verify Everything Works

### Backend Checklist
- [] Backend runs without errors
- [] Can access http: //localhost:8000
- [] Health check returns JSON response
- [] No error messages in terminal

### Frontend Checklist
- [] Frontend loads at http: //localhost:3000
- [] Can see the AayuCare interface
- [] Language selector works
- [] Both input methods are visible
- [] No console errors (press F12 to check)

### Integration Checklist
- [] Text input returns results
- [] Voice input records and transcribes
- [] Results page displays correctly
- [] Location permission prompt appears
- [] Doctors/clinics are listed

---

## Common Issues & Solutions

### Issue: "Module not found" (Python)
**Solution**: 
```bash
pip install -r requirements.txt
```

### Issue: "Command not found: npm"
**Solution**: Install Node.js from [nodejs.org
](https: //nodejs.org/)

### Issue: Backend won't start - "Missing API keys"
**Solution**: 
- Check `.env` file exists in `backend/` directory
- Verify API keys are correctly set
- No quotes needed around keys

### Issue: Frontend can't connect to backend
**Solution**:
- Ensure backend is running (http: //localhost:8000)
- Check `.env.local` has correct `NEXT_PUBLIC_API_URL`
- Check CORS settings in `backend/main.py`

### Issue: Voice input doesn't work
**Solution**:
- Use HTTPS in production (HTTP ok for localhost)
- Grant microphone permission in browser
- Check browser compatibility (Chrome/Edge recommended)

### Issue: Maps not showing
**Solution**:
- Add `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` to `.env.local`
- Enable Maps JavaScript API in Google Cloud Console
- App works without maps, just won't show map widget

### Issue: Port already in use
**Solution**:
```bash
# Backend (port 8000)
# On macOS/Linux:
lsof -ti: 8000 | xargs kill -9

# Frontend (port 3000)
lsof -ti: 3000 | xargs kill -9

# On Windows:
# netstat -ano | findstr : 8000
# taskkill /PID <PID> /F
```

---

## Development Tips

### Hot Reload
Both backend and frontend support hot reload:
- **Frontend**: Changes to `.tsx` files reload automatically
- **Backend**: Restart server after changes to `.py` files

### Debugging

**Backend**:
```bash
# Run with debug logs
uvicorn main:app --reload --log-level debug
```

**Frontend**:
- Open browser DevTools (F12)
- Check Console tab for errors
- Check Network tab for API calls

### Testing API Directly

```bash
# Test health check
curl http: //localhost:8000/

# Test doctor search
curl -X POST http: //localhost:8000/find-doctors \
  -H "Content-Type: application/json" \
  -d '{
    "symptom_text": "knee pain",
    "latitude": 23.2599,
    "longitude": 77.4126,
    "language": "english",
    "radius_km": 10
}'
```

---

## Next Steps

1. ✅ Local setup complete
2. 📝 Read the main [README.md
](README.md) for features
3. 🚀 Ready to deploy? See [DEPLOYMENT.md
](DEPLOYMENT.md)
4. 🐛 Found issues? Check troubleshooting above
5. 💡 Want to contribute? Submit a PR!

---

## Project Structure Overview

```
aayucare/
├── backend/
│   ├── main.py              # FastAPI app
│   ├── requirements.txt     # Python deps
│   └── .env                 # Your API keys (don't commit!)
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx         # Home page
│   │   └── layout.tsx       # Root layout
│   ├── components/          # React components
│   ├── .env.local           # Your config (don't commit!)
│   └── package.json         # Node deps
│
├── README.md                # Main documentation
├── SETUP.md                 # This file
└── DEPLOYMENT.md            # Deployment guide
```

---

## Getting Help

If you're stuck:
1. Check this guide again carefully
2. Check error messages in terminal
3. Check browser console (F12)
4. Review the [README.md
](README.md)
5. Open a GitHub issue with:
   - What you were trying to do
   - Error message (screenshot)
   - Your OS and versions

---

**Happy Coding! 🚀**

Your AayuCare application is now ready for development!

