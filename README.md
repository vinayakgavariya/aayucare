# AayuCare - Rural Health Navigator

**Help rural and non-English-speaking users find the right doctors, nearby labs, and pharmacies using voice or text input without requiring login.**

![AayuCare
](https: //img.shields.io/badge/Status-Production%20Ready-green)
![License
](https: //img.shields.io/badge/License-MIT-blue)

## 🎯 Problem Statement

- People in rural areas often visit the wrong doctor due to poor awareness
- Finding reliable doctors, labs, or pharmacies nearby is difficult
- Language barriers make using apps or websites harder

## 💡 Solution

AayuCare provides:
- Voice or text input in **10+ Indian languages**
- AI-powered symptom analysis using **Google Gemini**
- Location-based search with **Google Maps grounding**
- Verified nearby doctors, labs, and pharmacies
- Results in the user's preferred language
- **No login required** - instant access

## 🏗️ Tech Stack

| Layer    | Technology                                         |
| -------- | -------------------------------------------------- |
| Frontend | Next.js 15 + TypeScript + TailwindCSS              |
| Backend  | FastAPI (Python 3.11+)                             |
| AI       | Google Gemini 2.0 Flash (with Maps Grounding)      |
| STT      | Sarvam AI - Speech-to-Text API                     |
| Maps     | Google Maps API                                    |
| Hosting  | Vercel (Frontend), Render/GCP (Backend)            |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- API Keys:
  - [Sarvam AI API Key
](https: //dashboard.sarvam.ai/)
  - [Google Gemini API Key
](https: //ai.google.dev/)
  - [Google Maps API Key
](https: //console.cloud.google.com/apis/credentials) (optional)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Add your API keys to `.env`:
```
SARVAM_API_KEY=your_sarvam_api_key
GEMINI_API_KEY=your_gemini_api_key
```

5. Run the backend:
```bash
python main.py
```

Backend will be available at `http: //localhost:8000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```bash
cp .env.local.example .env.local
```

4. Update `.env.local`:
```
NEXT_PUBLIC_API_URL=http: //localhost:8000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

5. Run the frontend:
```bash
npm run dev
```

Frontend will be available at `http: //localhost:3000`

## 📱 Features

### Core Features
- ✅ Voice input in 10+ Indian languages
- ✅ Text input with language-specific placeholders
- ✅ AI-powered doctor specialization recommendation
- ✅ Nearby doctor finder (within 10km)
- ✅ Nearby labs and pharmacies
- ✅ Interactive Google Maps widget
- ✅ Results in user's preferred language
- ✅ No login required
- ✅ Mobile-responsive design
- ✅ Low-bandwidth optimized

### Supported Languages
- English
- Hindi (हिंदी)
- Bengali (বাংলা)
- Tamil (தமிழ்)
- Telugu (తెలుగు)
- Gujarati (ગુજરાતી)
- Kannada (ಕನ್ನಡ)
- Malayalam (മലയാളം)
- Marathi (मराठी)
- Punjabi (ਪੰਜਾਬੀ)
- Odia (ଓଡ଼ିଆ)

## 🔌 API Endpoints

### `GET /`
Health check endpoint

### `POST /transcribe`
Convert voice to text using Sarvam AI STT

**Request:**
```json
{
    "audio_base64": "base64_encoded_audio",
    "encoding": "audio/wav",
    "sample_rate": 16000
}
```

### `POST /find-doctors`
Find doctors based on symptoms using Gemini + Google Maps

**Request:**
```json
{
    "symptom_text": "knee pain for 2 weeks",
    "latitude": 23.2599,
    "longitude": 77.4126,
    "language": "hindi",
    "radius_km": 10
}
```

**Response:**
```json
{
    "recommendation": "Based on your symptoms...",
    "doctors": [
        {
            "name": "Dr. Smith's Clinic",
            "address": "123 Main St, City",
            "uri": "https://maps.google.com/...",
            "place_id": "ChIJ..."
        }
    ]
}
```

### `POST /find-facilities`
Find nearby labs or pharmacies

**Form Data:**
- `facility_type`: "pharmacy",
"lab", or "hospital"
- `latitude`: float
- `longitude`: float
- `language`: string (default: "english")
- `radius_km`: int (default: 10)

## 📂 Project Structure

```
aayucare/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── requirements.txt     # Python dependencies
│   ├── .env.example         # Environment variables template
│   └── README.md            # Backend documentation
├── frontend/
│   ├── app/
│   │   ├── page.tsx         # Main home page
│   │   ├── layout.tsx       # Root layout
│   │   └── globals.css      # Global styles
│   ├── components/
│   │   ├── VoiceInput.tsx   # Voice recording
│   │   ├── SymptomForm.tsx  # Text input
│   │   ├── LanguageToggle.tsx # Language selector
│   │   ├── ResultsPage.tsx  # Results display
│   │   └── MapWidget.tsx    # Maps integration
│   ├── .env.local.example   # Environment variables
│   ├── package.json         # Dependencies
│   └── README.md            # Frontend documentation
└── README.md                # This file
```

## 🌐 Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Import project in [Vercel
](https: //vercel.com)
3. Set environment variables:
   - `NEXT_PUBLIC_API_URL`
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
4. Deploy

### Backend (Render/Railway/GCP)

#### Render
1. Connect GitHub repository
2. Create new Web Service
3. Set environment variables (SARVAM_API_KEY, GEMINI_API_KEY)
4. Deploy

#### Google Cloud Run
```bash
cd backend
gcloud run deploy aayucare-api --source .
```

## 🧪 Testing

Test the backend API:
```bash
curl http: //localhost:8000/
```

Test voice transcription:
```bash
curl -X POST http: //localhost:8000/transcribe \
  -H "Content-Type: application/json" \
  -d '{
    "audio_base64": "...",
    "encoding": "audio/wav",
    "sample_rate": 16000
}'
```

Test doctor search:
```bash
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

## 🔒 Security & Privacy

- No user authentication required
- No personal data stored
- Location data used only for search
- HTTPS encryption in production
- CORS protection enabled

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - See LICENSE file for details

## 👥 Authors

Built with ❤️ for rural healthcare access

## 🙏 Acknowledgments

- [Sarvam AI
](https: //www.sarvam.ai/) for Speech-to-Text API
- [Google Gemini
](https: //ai.google.dev/) for AI capabilities
- [Google Maps
](https: //developers.google.com/maps) for location services

## 📞 Support

For issues and questions, please open a GitHub issue.

---

**Note:** This application is designed to assist in finding healthcare providers. It is not a substitute for professional medical advice. Always consult with qualified healthcare professionals for medical concerns.

