# Automatic Language Translation for Indian Languages

## 🌐 Overview

AayuCare now supports **automatic language detection and translation** for 10+ Indian languages using **Sarvam AI**. This feature is designed for users in rural India who may not know English.

## ✨ Key Features

### 1. **Automatic Language Detection from Voice**
- When a user speaks in their native language, Sarvam AI's Speech-to-Text automatically detects the language
- The entire UI instantly translates to match the detected language
- No manual language selection needed!

### 2. **Supported Languages**
1. **English** (en-IN)
2. **Hindi** (हिंदी) - hi-IN
3. **Bengali** (বাংলা) - bn-IN
4. **Tamil** (தமிழ்) - ta-IN
5. **Telugu** (తెలుగు) - te-IN
6. **Marathi** (मराठी) - mr-IN
7. **Gujarati** (ગુજરાતી) - gu-IN
8. **Kannada** (ಕನ್ನಡ) - kn-IN
9. **Malayalam** (മലയാളം) - ml-IN
10. **Punjabi** (ਪੰਜਾਬੀ) - pa-IN
11. **Odia** (ଓଡ଼ିଆ) - od-IN

### 3. **What Gets Translated**

#### Landing Page:
- App title and subtitle
- Hero section text
- Feature descriptions
- Footer text
- All buttons and labels

#### Chat Interface:
- Welcome message
- Input placeholders
- System messages
- Button labels
- Recording indicators
- Error messages

#### Results Page:
- Tab labels (Doctors, Labs, Pharmacies)
- Search results headers
- All UI text and buttons
- "View on Maps" links
- Review counts

### 4. **Response Translation**
- Backend (Gemini API) responds in the detected language
- Doctor recommendations appear in user's language
- Facility information translated appropriately

## 🔧 Technical Implementation

### Backend (`/backend/main.py`)

#### 1. Translation Endpoint
```python
@app.post("/translate")
async def translate_text(
    text: str = Form(...),
    target_language: str = Form("hindi"),
)
```
- Uses Sarvam AI Translation API
- Translates from English to any Indian language
- Caches translations for performance

#### 2. Voice Transcription with Auto-Detection
```python
@app.post("/transcribe")
async def transcribe_audio(request: TranscribeRequest):
    # Language auto-detection enabled
    ws_url = f"wss://api.sarvam.ai/speech-to-text/ws?language-code=unknown&model=saarika:v2.5"
```
- Uses `language-code=unknown` for auto-detection
- Returns detected language along with transcription

#### 3. Multilingual Doctor Search
```python
if request.language.lower() != "english":
    language_instruction = f"Respond in {request.language}."
```
- Gemini responds in the user's language
- Location and symptom queries work in any language

### Frontend

#### 1. Translation Hook (`/lib/useLanguage.ts`)
```typescript
export function useLanguage() {
  const [currentLanguage, setCurrentLanguage] = useState<string>('english');
  const translateText = async (text: string, targetLanguage?: string) => {
    // Calls backend /translate endpoint
  };
}
```
- Manages current language state
- Provides translation functions
- Caches translations for performance
- Persists language preference in localStorage

#### 2. Auto Language Detection Flow
```typescript
// In ChatInterface.tsx
const language = transcribeData.detected_language || "english";

if (language !== currentLanguage) {
  changeLanguage(language);  // Update UI language
  onLanguageChange(language); // Notify parent
}
```

#### 3. Component Translation Pattern
Each component:
1. Uses `useLanguage()` hook
2. Maintains `uiText` state with all strings
3. Translates on language change via `useEffect`
4. Renders translated text from `uiText`

## 🚀 User Experience Flow

### First Time User (Hindi Speaker)
1. **Opens app** → Sees English UI initially
2. **Clicks microphone** → Starts speaking in Hindi
3. **Speaks**: "मुझे बुखार और सिरदर्द है, मैं मुंबई में हूं"
4. **System detects** Hindi language automatically
5. **UI translates** → Everything switches to Hindi instantly
6. **Backend responds** in Hindi with doctor recommendations
7. **All subsequent interactions** remain in Hindi

### Language Persistence
- Language preference saved in `localStorage`
- Persists across page reloads
- User doesn't need to repeat language selection

## 📋 Setup Instructions

### Backend Setup

1. **Install dependencies**:
```bash
cd backend
pip install -r requirements.txt
```

2. **Set environment variables** (`.env`):
```env
SARVAM_API_KEY=your_sarvam_api_key
GEMINI_API_KEY=your_gemini_api_key
```

3. **Start the server**:
```bash
python main.py
# or
uvicorn main:app --reload
```

### Frontend Setup

1. **Install dependencies**:
```bash
cd frontend
npm install
```

2. **Set environment variables** (`.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

3. **Start the development server**:
```bash
npm run dev
```

## 🧪 Testing the Translation Feature

### Test Automatic Detection

1. **Open the app** at `http://localhost:3000`
2. **Click the microphone** button
3. **Speak in Hindi**: "मुझे पेट में दर्द है, मैं दिल्ली में हूं"
4. **Observe**:
   - Voice transcribed to Hindi text
   - UI automatically translates to Hindi
   - Response comes back in Hindi

### Test Different Languages

Try speaking in:
- **Tamil**: "எனக்கு தலைவலி, நான் சென்னையில் இருக்கிறேன்"
- **Telugu**: "నాకు జ్వరం ఉంది, నేను హైదరాబాద్‌లో ఉన్నాను"
- **Marathi**: "मला ताप आला आहे, मी पुण्यात आहे"

### Test Manual Text Input
- Type in English or any Indian language
- System will detect and process accordingly

## 🎯 Key Benefits

### For Rural Users
✅ **No English required** - Everything in their native language  
✅ **Automatic detection** - No manual language selection needed  
✅ **Natural interaction** - Speak naturally in their language  
✅ **Familiar script** - See text in their native script  

### For Healthcare Access
✅ **Better symptom description** - Users express themselves clearly  
✅ **Accurate location info** - Can say city names in their language  
✅ **Trusted recommendations** - Understand doctor suggestions fully  
✅ **No language barrier** - Healthcare information accessible to all  

## 🔍 Translation Quality

### Sarvam AI Translation API
- **Model**: Mayura v1
- **Mode**: Formal (appropriate for healthcare)
- **Quality**: High accuracy for Indian languages
- **Context preservation**: Maintains meaning across languages

### Optimization
- **Caching**: Translations cached to avoid repeated API calls
- **Batch processing**: Multiple texts translated efficiently
- **Rate limiting**: Handles API rate limits gracefully
- **Fallback**: Shows original text if translation fails

## 📊 API Usage

### Translation Endpoint
```bash
POST /translate
Content-Type: multipart/form-data

text=Hello&target_language=hindi
```

**Response**:
```json
{
  "translated_text": "नमस्ते"
}
```

### Transcription with Auto-Detection
```bash
POST /transcribe
Content-Type: application/json

{
  "audio_base64": "...",
  "encoding": "audio/wav",
  "sample_rate": 16000,
  "language": "unknown"
}
```

**Response**:
```json
{
  "success": true,
  "transcription": "मुझे बुखार है",
  "detected_language": "hindi",
  "detected_language_code": "hi-IN"
}
```

## 🛠️ Troubleshooting

### Translation Not Working
1. Check `SARVAM_API_KEY` is set correctly
2. Verify backend is running
3. Check browser console for errors
4. Ensure API key has translation permissions

### Language Not Detected
1. Speak clearly into microphone
2. Ensure microphone permissions granted
3. Check audio quality
4. Verify Sarvam API is responding

### UI Not Translating
1. Check frontend is using `useLanguage()` hook
2. Verify translation endpoint is accessible
3. Check for JavaScript errors in console
4. Clear cache and localStorage

## 📝 Development Notes

### Adding New UI Text
1. Add English text to component's `uiText` state
2. Add translation in `translateUI()` function
3. Use `{uiText.yourKey}` in JSX

### Supporting New Languages
1. Add language code to `language_map` in backend
2. Add to `SUPPORTED_LANGUAGES` in `useLanguage.ts`
3. Test transcription and translation

## 🎉 Success Metrics

With this implementation:
- ✅ **Zero manual language selection** required
- ✅ **100% UI coverage** - Every string translatable
- ✅ **Instant language switching** - Real-time detection
- ✅ **Persistent preference** - Saved across sessions
- ✅ **Native script support** - Proper rendering for all languages

## 🚀 Next Steps

Future enhancements:
1. Add voice output (Text-to-Speech) in native language
2. Support for more regional dialects
3. Offline translation fallback
4. Language-specific health content

---

**Built with ❤️ for rural India** 🇮🇳

Making healthcare accessible in every Indian language!

