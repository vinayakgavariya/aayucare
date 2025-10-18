# AayuCare API Documentation

Complete API reference for AayuCare backend.

## Base URL

**Local Development**: `http: //localhost:8000`
**Production**: `https: //your-backend-url.com`

## Authentication

No authentication required. All endpoints are publicly accessible.

---

## Endpoints

### 1. Health Check

Check if the API is running.

**Endpoint**: `GET /`

**Response**:
```json
{
    "message": "AayuCare API is running",
    "version": "1.0.0"
}
```

**Example**:
```bash
curl http: //localhost:8000/
```

---

### 2. Transcribe Audio

Convert voice to text using Sarvam AI Speech-to-Text API.

**Endpoint**: `POST /transcribe`

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
    "audio_base64": "string", // Base64 encoded audio data
    "encoding": "audio/wav", // Audio encoding format
    "sample_rate": 16000 // Sample rate in Hz
}
```

**Supported Audio Formats**:
- `audio/wav`
- `audio/webm`
- `audio/mp3`

**Supported Sample Rates**:
- 8000 Hz
- 16000 Hz
- 48000 Hz

**Response**:
```json
{
    "success": true,
    "transcription": "मुझे घुटनों में दर्द है",
    "full_response": "..."
}
```

**Error Response**:
```json
{
    "detail": "Transcription failed: error message"
}
```

**Example**:
```bash
curl -X POST http: //localhost:8000/transcribe \
  -H "Content-Type: application/json" \
  -d '{
    "audio_base64": "UklGRiQAAABXQVZFZm10...",
    "encoding": "audio/wav",
    "sample_rate": 16000
}'
```

**Supported Languages**:
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

---

### 3. Find Doctors

Find doctors based on symptoms using Gemini AI with Google Maps grounding.

**Endpoint**: `POST /find-doctors`

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
    "symptom_text": "string", // User's symptom description
    "latitude": 23.2599, // User's latitude
    "longitude": 77.4126, // User's longitude
    "language": "english", // Response language
    "radius_km": 10 // Search radius in km
}
```

**Parameters**:
- `symptom_text` (required): Description of symptoms
- `latitude` (required): User location latitude (-90 to 90)
- `longitude` (required): User location longitude (-180 to 180)
- `language` (optional): Language for response (default: "english")
- `radius_km` (optional): Search radius in kilometers (default: 10)

**Response**:
```json
{
    "recommendation": "Based on your symptoms of knee pain for 2 weeks, you should consult an Orthopedic specialist. Here are some doctors near you...",
    "doctors": [
        {
            "name": "Dr. Smith's Orthopedic Clinic",
            "address": "123 Main Street, Bhopal, MP 462001",
            "uri": "https://maps.google.com/?cid=12345",
            "place_id": "ChIJN1t_tDeuEmsRUsoyG83frY4"
        },
        {
            "name": "City Hospital Orthopedics",
            "address": "456 Hospital Road, Bhopal, MP 462002",
            "uri": "https://maps.google.com/?cid=67890",
            "place_id": "ChIJN1t_tDeuEmsRUsoyG83frY5"
        }
    ],
    "specialization": null
}
```

**Error Response**:
```json
{
    "detail": "Doctor search failed: error message"
}
```

**Example**:
```bash
curl -X POST http: //localhost:8000/find-doctors \
  -H "Content-Type: application/json" \
  -d '{
    "symptom_text": "knee pain for 2 weeks",
    "latitude": 23.2599,
    "longitude": 77.4126,
    "language": "english",
    "radius_km": 10
}'
```

**Example with Hindi**:
```bash
curl -X POST http: //localhost:8000/find-doctors \
  -H "Content-Type: application/json" \
  -d '{
    "symptom_text": "घुटनों में दर्द है",
    "latitude": 23.2599,
    "longitude": 77.4126,
    "language": "hindi",
    "radius_km": 10
}'
```

---

### 4. Find Facilities

Find nearby labs, pharmacies, or hospitals.

**Endpoint**: `POST /find-facilities`

**Headers**:
```
Content-Type: multipart/form-data
```

**Form Data**:
- `facility_type` (required): Type of facility ("pharmacy",
"lab",
"hospital")
- `latitude` (required): User location latitude
- `longitude` (required): User location longitude
- `language` (optional): Response language (default: "english")
- `radius_km` (optional): Search radius in km (default: 10)

**Response**:
```json
{
    "success": true,
    "facility_type": "pharmacy",
    "recommendation": "Here are verified pharmacies within 10km of your location...",
    "facilities": [
        {
            "name": "Apollo Pharmacy",
            "address": "789 Market Street, Bhopal",
            "uri": "https://maps.google.com/?cid=11111",
            "place_id": "ChIJN1t_tDeuEmsRUsoyG83frY6"
        },
        {
            "name": "MedPlus Pharmacy",
            "address": "321 Shopping Complex, Bhopal",
            "uri": "https://maps.google.com/?cid=22222",
            "place_id": "ChIJN1t_tDeuEmsRUsoyG83frY7"
        }
    ]
}
```

**Error Response**:
```json
{
    "detail": "Facility search failed: error message"
}
```

**Example - Find Pharmacies**:
```bash
curl -X POST http: //localhost:8000/find-facilities \
  -F "facility_type=pharmacy" \
  -F "latitude=23.2599" \
  -F "longitude=77.4126" \
  -F "language=english" \
  -F "radius_km=10"
```

**Example - Find Labs**:
```bash
curl -X POST http: //localhost:8000/find-facilities \
  -F "facility_type=lab" \
  -F "latitude=23.2599" \
  -F "longitude=77.4126" \
  -F "language=hindi" \
  -F "radius_km=5"
```

**Supported Facility Types**:
- `pharmacy`: Medical pharmacies and drug stores
- `lab`: Diagnostic labs and pathology centers
- `hospital`: Hospitals and medical centers

---

## Error Handling

### HTTP Status Codes

- `200`: Success
- `400`: Bad Request (invalid parameters)
- `500`: Internal Server Error (API failure)

### Error Response Format

```json
{
    "detail": "Error message describing what went wrong"
}
```

### Common Errors

**Invalid Audio Format**:
```json
{
    "detail": "Transcription failed: Unsupported audio format"
}
```

**Missing API Keys**:
```json
{
    "detail": "Missing API keys. Please set SARVAM_API_KEY and GEMINI_API_KEY"
}
```

**Invalid Location**:
```json
{
    "detail": "Invalid latitude or longitude"
}
```

**Rate Limit Exceeded**:
```json
{
    "detail": "Rate limit exceeded. Please try again later."
}
```

---

## Rate Limits

Rate limits depend on your API key plans:

**Sarvam AI**: Check your plan at [sarvam.ai
](https: //www.sarvam.ai/)
**Google Gemini**: Check quotas at [Google AI Studio
](https: //ai.google.dev/)

---

## Best Practices

### 1. Audio Quality
- Use clear audio recordings
- Minimize background noise
- Recommended sample rate: 16000 Hz
- Speak clearly and at moderate pace

### 2. Location Accuracy
- Request user permission for location
- Provide fallback coordinates
- Validate latitude/longitude ranges

### 3. Error Handling
- Always handle API errors gracefully
- Show user-friendly error messages
- Implement retry logic for network failures

### 4. Performance
- Cache results when appropriate
- Implement request debouncing
- Use loading states in UI

### 5. Privacy
- Don't log sensitive health information
- Use HTTPS in production
- Follow data protection regulations

---

## Integration Examples

### JavaScript/TypeScript

```typescript
// Transcribe audio
async function transcribeAudio(audioBase64: string) {
  const response = await fetch('http: //localhost:8000/transcribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      audio_base64: audioBase64,
      encoding: 'audio/wav',
      sample_rate: 16000,
    }),
});
  
  if (!response.ok) {
    throw new Error('Transcription failed');
}
  
  return await response.json();
}
// Find doctors
async function findDoctors(symptomText: string, lat: number, lng: number) {
  const response = await fetch('http: //localhost:8000/find-doctors', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
},
    body: JSON.stringify({
      symptom_text: symptomText,
      latitude: lat,
      longitude: lng,
      language: 'english',
      radius_km: 10,
}),
});
  
  if (!response.ok) {
    throw new Error('Doctor search failed');
}
  
  return await response.json();
}
```

### Python

```python
import requests
import base64

# Transcribe audio
def transcribe_audio(audio_file_path):
    with open(audio_file_path, 'rb') as f:
        audio_data = base64.b64encode(f.read()).decode('utf-8')
    
    response = requests.post(
        'http: //localhost:8000/transcribe',
        json={
            'audio_base64': audio_data,
            'encoding': 'audio/wav',
            'sample_rate': 16000,
}
    )
    
    return response.json()

# Find doctors
def find_doctors(symptom_text, lat, lng):
    response = requests.post(
        'http: //localhost:8000/find-doctors',
        json={
            'symptom_text': symptom_text,
            'latitude': lat,
            'longitude': lng,
            'language': 'english',
            'radius_km': 10,
}
    )
    
    return response.json()
```

---

## Support

For API issues:
- Check your API keys
- Verify request format
- Check error messages
- Review this documentation
- Open a GitHub issue

---

**API Version**: 1.0.0  
**Last Updated**: 2025-01-18