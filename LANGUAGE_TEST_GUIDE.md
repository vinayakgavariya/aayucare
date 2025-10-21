# 🧪 Language Translation Testing Guide

## Quick Test - See It In Action!

### Step 1: Start the Backend
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python main.py
```
✅ Backend should be running at `http://localhost:8000`

### Step 2: Start the Frontend
```bash
cd frontend
npm run dev
```
✅ Frontend should be running at `http://localhost:3000`

### Step 3: Test Automatic Language Detection

#### 🎤 Voice Test (Recommended)

1. **Open** `http://localhost:3000`
2. **Click** the microphone button 🎤
3. **Allow** microphone access when prompted
4. **Speak in Hindi**: 
   > "मुझे बुखार और सिरदर्द है, मैं मुंबई में हूं"
   
   *(Translation: "I have fever and headache, I am in Mumbai")*

5. **Watch the magic happen**:
   - ✨ Your voice gets transcribed to Hindi text
   - 🌐 **The entire UI automatically translates to Hindi!**
   - 📋 Button labels, placeholders, messages - all in Hindi
   - 🏥 Doctor recommendations appear in Hindi
   - 🗺️ Results page shows in Hindi

#### 📝 Type Test (Alternative)

If microphone doesn't work, you can test by typing:
1. Type in the chat: "I have fever, I am in Mumbai"
2. UI stays in English (no language detected from text)
3. Backend responds in English

### Step 4: Test Different Languages

#### Try These Voice Commands:

**Tamil**:
> "எனக்கு தலைவலி இருக்கிறது, நான் சென்னையில் இருக்கிறேன்"
> 
> *(I have headache, I am in Chennai)*

**Telugu**:
> "నాకు జ్వరం ఉంది, నేను హైదరాబాద్‌లో ఉన్నాను"
> 
> *(I have fever, I am in Hyderabad)*

**Marathi**:
> "मला ताप आला आहे, मी पुण्यात आहे"
> 
> *(I have fever, I am in Pune)*

**Gujarati**:
> "મને તાવ છે, હું અમદાવાદમાં છું"
> 
> *(I have fever, I am in Ahmedabad)*

**Kannada**:
> "ನನಗೆ ಜ್ವರ ಇದೆ, ನಾನು ಬೆಂಗಳೂರಿನಲ್ಲಿದ್ದೇನೆ"
> 
> *(I have fever, I am in Bangalore)*

**Bengali**:
> "আমার জ্বর হয়েছে, আমি কলকাতায় আছি"
> 
> *(I have fever, I am in Kolkata)*

**Malayalam**:
> "എനിക്ക് പനിയുണ്ട്, ഞാൻ കൊച്ചിയിലാണ്"
> 
> *(I have fever, I am in Kochi)*

**Punjabi**:
> "ਮੈਨੂੰ ਬੁਖਾਰ ਹੈ, ਮੈਂ ਚੰਡੀਗੜ੍ਹ ਵਿੱਚ ਹਾਂ"
> 
> *(I have fever, I am in Chandigarh)*

### Step 5: Verify UI Translation

After speaking in any language, check that these elements are translated:

#### Landing Page:
- ✅ "Healthcare Search" subtitle
- ✅ "Find Healthcare" title
- ✅ "Search for doctors..." description
- ✅ "Auto Language Detection" feature text
- ✅ "Location-based" feature text
- ✅ Footer copyright text

#### Chat Interface:
- ✅ Welcome message
- ✅ Input placeholder text
- ✅ "Recording..." indicator
- ✅ "Processing..." message
- ✅ System messages
- ✅ Error messages

#### Results Page:
- ✅ "← Back to Search" button
- ✅ "Your search" label
- ✅ Tab labels (Doctors, Labs, Pharmacies)
- ✅ "Results" count
- ✅ "View on Maps" links
- ✅ "reviews" text

## 🔍 What to Look For

### ✅ Success Indicators:

1. **Transcription appears in native script**
   - Hindi text shows as: मुझे बुखार है
   - Not in Latin script: mujhe bukhar hai

2. **UI text changes immediately**
   - All buttons and labels translate
   - Placeholders update
   - Messages appear in new language

3. **Backend responds in same language**
   - Doctor recommendations in user's language
   - Addresses may stay in English (location names)

4. **Language persists**
   - Refresh page → language stays the same
   - Stored in browser localStorage

### ❌ Common Issues:

**Issue**: UI doesn't translate
- **Fix**: Check browser console for errors
- **Fix**: Verify SARVAM_API_KEY is set in backend `.env`
- **Fix**: Check `/translate` endpoint is working: 
  ```bash
  curl -X POST http://localhost:8000/translate \
    -F "text=Hello" \
    -F "target_language=hindi"
  ```

**Issue**: Voice not detected
- **Fix**: Check microphone permissions in browser
- **Fix**: Must use HTTPS or localhost (not IP address)
- **Fix**: Speak clearly for 3-5 seconds

**Issue**: Language detected but UI still English
- **Fix**: Check browser console for translation errors
- **Fix**: Verify Sarvam API key has translation permissions
- **Fix**: Check API rate limits

## 🧪 API Testing

### Test Translation Endpoint Directly

```bash
# Test Hindi translation
curl -X POST http://localhost:8000/translate \
  -F "text=Welcome to AayuCare" \
  -F "target_language=hindi"

# Expected response:
# {"translated_text":"आयुकेयर में आपका स्वागत है"}
```

### Test Transcription with Auto-Detection

```bash
# This requires audio data, so test via frontend
# Check backend logs for detection:
# [Language Detected] hindi - Transcription: मुझे बुखार है
```

## 📊 Visual Verification

### Before Speaking (English UI):
```
┌─────────────────────────────────┐
│  AayuCare                       │
│  Healthcare Search              │
├─────────────────────────────────┤
│  Find Healthcare                │
│  Search for doctors, labs...    │
├─────────────────────────────────┤
│  🎤 Click mic to speak          │
└─────────────────────────────────┘
```

### After Speaking in Hindi:
```
┌─────────────────────────────────┐
│  AayuCare                       │
│  स्वास्थ्य सेवा खोज            │
├─────────────────────────────────┤
│  स्वास्थ्य सेवा खोजें          │
│  डॉक्टर, प्रयोगशालाएं खोजें... │
├─────────────────────────────────┤
│  🎤 बोलने के लिए माइक क्लिक करें│
└─────────────────────────────────┘
```

## 🎯 Real-World Test Scenario

**Persona**: Ramesh, a farmer from a village near Mumbai who only speaks Hindi

1. **Opens app** → Sees English (doesn't understand)
2. **Sees microphone** → Clicks it (universal symbol)
3. **Speaks naturally**: "मुझे पेट में दर्द है, मैं नासिक में हूं"
4. **UI switches to Hindi** → Now he can read everything!
5. **Sees recommendations** in Hindi:
   ```
   आपके लक्षणों के लिए, मैं नासिक में एक सामान्य चिकित्सक से मिलने की सलाह देता हूं।
   
   डॉक्टर पटेल क्लिनिक
   ⭐ 4.5 (156 समीक्षाएं)
   📍 नासिक रोड, नासिक
   ```
6. **Clicks "मानचित्र पर देखें"** → Opens Google Maps
7. **Success!** Ramesh found a doctor without knowing any English

## 🎉 Expected Behavior Summary

| Action | Expected Result |
|--------|----------------|
| Speak in Hindi | UI translates to Hindi, responses in Hindi |
| Speak in Tamil | UI translates to Tamil, responses in Tamil |
| Type in English | UI stays English, responses in English |
| Refresh page | Language persists from localStorage |
| Switch language by speaking | UI updates immediately |
| View results | All tabs and buttons in selected language |

## 🐛 Debug Mode

Add this to your browser console to see translation activity:
```javascript
// See current language
localStorage.getItem('aayucare_language')

// Reset language to English
localStorage.setItem('aayucare_language', 'english')
location.reload()

// Monitor translation calls
// Check Network tab for /translate requests
```

## 📝 Test Checklist

- [ ] Backend running with Sarvam API key
- [ ] Frontend running on localhost:3000
- [ ] Microphone permissions granted
- [ ] Can speak and see transcription
- [ ] Language detected correctly
- [ ] UI translates automatically
- [ ] Welcome message in correct language
- [ ] Input placeholder translated
- [ ] System messages translated
- [ ] Backend responds in correct language
- [ ] Results page tabs translated
- [ ] "View on Maps" links translated
- [ ] Language persists on refresh
- [ ] Can test multiple languages
- [ ] No console errors

## 🚀 Next Steps After Testing

Once everything works:
1. ✅ Deploy backend to production (Render/Railway)
2. ✅ Deploy frontend to Vercel
3. ✅ Update production `.env` with API keys
4. ✅ Test on mobile devices
5. ✅ Share with rural users for feedback

---

**Happy Testing!** 🎉

If you encounter any issues, check:
1. Backend logs for errors
2. Browser console for frontend errors
3. Network tab for failed API calls
4. Sarvam AI dashboard for API usage/limits

