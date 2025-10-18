# AayuCare Backend API

FastAPI backend for the AayuCare Rural Health Navigator.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Add your API keys to `.env`:
   - Get Sarvam AI key from: https: //www.sarvam.ai/
   - Get Gemini API key from: https: //ai.google.dev/

4. Run the server:
```bash
python main.py
```

Or with uvicorn:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

### GET /
Health check endpoint

### POST /transcribe
Convert voice to text using Sarvam AI STT

**Request Body:**
```json
{
    "audio_base64": "base64_encoded_audio",
    "encoding": "audio/wav",
    "sample_rate": 16000
}
```

### POST /find-doctors
Find doctors based on symptoms using Gemini + Google Maps

**Request Body:**
```json
{
    "symptom_text": "knee pain",
    "latitude": 23.2599,
    "longitude": 77.4126,
    "language": "hindi",
    "radius_km": 10
}
```

### POST /find-facilities
Find nearby pharmacies, labs, or hospitals

**Form Data:**
- facility_type: "pharmacy",
"lab", or "hospital"
- latitude: float
- longitude: float
- language: string (default: "english")
- radius_km: int (default: 10)

## Deployment

### Render / Railway
1. Connect your GitHub repository
2. Set environment variables (SARVAM_API_KEY, GEMINI_API_KEY)
3. Deploy

### Google Cloud Run
```bash
gcloud run deploy aayucare-api --source .
```

