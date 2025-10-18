# ⚡ AayuCare Quick Start

Get AayuCare running in 5 minutes!

## 📋 What You Need

- Node.js 18+ ([Download
](https: //nodejs.org/))
- Python 3.11+ ([Download
](https: //www.python.org/))
- [Sarvam AI API Key
](https: //www.sarvam.ai/)
- [Google Gemini API Key
](https: //ai.google.dev/)

---

## 🚀 5-Minute Setup

### Step 1: Backend (2 minutes)

Open Terminal and run:

```bash
# Go to backend folder
cd /Users/vinayakgavariya/aayucare/backend

# Create virtual environment
python -m venv venv

# Activate it (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
SARVAM_API_KEY=your_sarvam_key_here
GEMINI_API_KEY=your_gemini_key_here
EOF
```

**Important**: Edit `.env` and replace with your actual API keys!

```bash
# Start backend
python main.py
```

✅ Backend running at http: //localhost:8000

---

### Step 2: Frontend (2 minutes)

Open a **NEW Terminal** window and run:

```bash
# Go to frontend folder
cd /Users/vinayakgavariya/aayucare/frontend

# Install dependencies
npm install

# Create .env.local file
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http: //localhost:8000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
EOF
```

```bash
# Start frontend
npm run dev
```

✅ Frontend running at http: //localhost:3000

---

### Step 3: Test It! (1 minute)

1. Open browser: http: //localhost:3000
2. Select a language (English/Hindi/etc.)
3. Type symptoms in the text box: "knee pain for 2 weeks"
4. Click "Find Doctors"
5. See results! 🎉

---

## ✨ Quick Test Commands

### Test Backend Health
```bash
curl http: //localhost:8000/
```

Should return:
```json
{
    "message": "AayuCare API is running",
    "version": "1.0.0"
}
```

### Test Doctor Search
```bash
curl -X POST http: //localhost:8000/find-doctors \
  -H "Content-Type: application/json" \
  -d '{
    "symptom_text": "headache",
    "latitude": 23.2599,
    "longitude": 77.4126,
    "language": "english",
    "radius_km": 10
}'
```

---

## 🎯 What to Try

### Voice Input
1. Click "Voice Input" card
2. Click "Start Recording"
3. Allow microphone access
4. Say: "I have knee pain"
5. Click "Stop Recording"
6. Wait for results

### Different Languages
1. Click language dropdown (top right)
2. Select Hindi (हिंदी)
3. Type: "मुझे बुखार है"
4. Click "Find Doctors"
5. Results in Hindi!

### Find Labs/Pharmacies
1. Enter symptoms and search
2. View results
3. Click "Labs" or "Pharmacies" tab
4. See nearby facilities

---

## 🔧 Quick Troubleshooting

### Backend won't start?
```bash
# Check Python version (should be 3.11+)
python --version

# Reinstall dependencies
pip install -r requirements.txt

# Check .env file exists and has API keys
cat .env
```

### Frontend won't start?
```bash
# Check Node version (should be 18+)
node --version

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Can't connect to backend?
- Make sure backend is running (check Terminal)
- Visit http: //localhost:8000 - should show API message
- Check `.env.local` has correct API URL

### Voice input not working?
- Allow microphone permission
- Use Chrome/Edge browser
- Check console (F12) for errors

---

## 📚 Next Steps

- ✅ Setup complete? Read [SETUP.md
](SETUP.md) for details
- 🚀 Ready to deploy? See [DEPLOYMENT.md
](DEPLOYMENT.md)
- 🐛 Found issues? Check [README.md
](README.md) troubleshooting
- 💡 Want to contribute? Read [CONTRIBUTING.md
](CONTRIBUTING.md)
- 📖 Need API details? See [API_DOCUMENTATION.md
](API_DOCUMENTATION.md)

---

## 🆘 Still Stuck?

1. Check error messages carefully
2. Verify API keys are correct
3. Make sure both terminals are running
4. Try restarting both backend and frontend
5. Open a GitHub issue with error details

---

**That's it! You're ready to go! 🎉**

Happy coding with AayuCare!

