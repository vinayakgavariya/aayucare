# AayuCare Testing Guide

Comprehensive guide for testing the AayuCare application.

## Table of Contents

1. [Manual Testing
](#manual-testing)
2. [API Testing
](#api-testing)
3. [Component Testing
](#component-testing)
4. [End-to-End Testing
](#end-to-end-testing)
5. [Performance Testing
](#performance-testing)
6. [Accessibility Testing
](#accessibility-testing)
7. [Browser Compatibility
](#browser-compatibility)

---

## Manual Testing

### Prerequisites
- Backend running at http: //localhost:8000
- Frontend running at http: //localhost:3000
- Valid API keys configured

### Test Cases

#### 1. Homepage Load
**Steps**:
1. Open http: //localhost:3000
2. Wait for page to load

**Expected**:
- ✅ Page loads without errors
- ✅ AayuCare logo visible
- ✅ Language selector visible
- ✅ Two input cards visible (Voice & Text)
- ✅ Three feature cards visible
- ✅ No console errors

#### 2. Language Selection
**Steps**:
1. Click language dropdown
2. Select different languages

**Expected**:
- ✅ Dropdown opens
- ✅ 11 languages listed
- ✅ Selected language highlighted
- ✅ Dropdown closes on selection
- ✅ Placeholders update in selected language

**Languages to Test**:
- English
- Hindi (हिंदी)
- Bengali (বাংলা)
- Tamil (தமிழ்)
- Telugu (తెలుగు)

#### 3. Text Input - English
**Steps**:
1. Select English language
2. Type "knee pain for 2 weeks" in text input
3. Click "Find Doctors"

**Expected**:
- ✅ Button shows "Searching..." while processing
- ✅ Results page loads
- ✅ Symptom displayed at top
- ✅ AI recommendation shown
- ✅ List of doctors displayed
- ✅ Map widget loads (if Maps API key present)
- ✅ Back button works

#### 4. Text Input - Hindi
**Steps**:
1. Select Hindi language
2. Type "घुटनों में दर्द है" in text input
3. Click "Find Doctors"

**Expected**:
- ✅ Processing works
- ✅ Results in Hindi
- ✅ Doctors list shown
- ✅ Map widget works

#### 5. Voice Input - Permission
**Steps**:
1. Click "Voice Input" card
2. Click "Start Recording"

**Expected**:
- ✅ Browser asks for microphone permission
- ✅ After allowing, recording starts
- ✅ Button shows "Stop Recording"
- ✅ Button is red and pulsing

#### 6. Voice Input - Recording
**Steps**:
1. Start recording
2. Say "I have a headache"
3. Click "Stop Recording"

**Expected**:
- ✅ Shows "Processing..." indicator
- ✅ Transcription appears
- ✅ Automatic search starts
- ✅ Results page loads with doctors

#### 7. Voice Input - Hindi
**Steps**:
1. Select Hindi language
2. Start recording
3. Say "मुझे बुखार है"
4. Stop recording

**Expected**:
- ✅ Transcription shows Hindi text
- ✅ Results in Hindi
- ✅ Correct specialist recommended

#### 8. Location Services
**Steps**:
1. Fresh page load
2. Browser asks for location

**Expected**:
- ✅ Location permission requested
- ✅ If allowed, uses actual location
- ✅ If denied, falls back to default location
- ✅ Search still works

#### 9. Results Page - Tabs
**Steps**:
1. Perform a search
2. Click "Labs" tab
3. Click "Pharmacies" tab
4. Click "Doctors" tab

**Expected**:
- ✅ Each tab loads content
- ✅ Loading indicator shown
- ✅ Results displayed
- ✅ Map updates
- ✅ Tab switching is smooth

#### 10. Map Widget
**Steps**:
1. Perform a search
2. View map widget

**Expected**:
- ✅ Map loads (if API key present)
- ✅ Location markers shown
- ✅ Map is interactive
- ✅ Can click markers
- ✅ Links to Google Maps work

#### 11. Doctor Links
**Steps**:
1. Perform a search
2. Click "View on Google Maps" link

**Expected**:
- ✅ Opens Google Maps in new tab
- ✅ Correct location shown
- ✅ Original tab remains open

#### 12. Back Navigation
**Steps**:
1. View results page
2. Click "Back to Search"

**Expected**:
- ✅ Returns to homepage
- ✅ Input fields cleared
- ✅ Can perform new search

#### 13. Error Handling - No Text
**Steps**:
1. Leave text input empty
2. Click "Find Doctors"

**Expected**:
- ✅ Error message shown
- ✅ Button stays enabled
- ✅ No API call made

#### 14. Error Handling - Backend Down
**Steps**:
1. Stop backend
2. Try to search

**Expected**:
- ✅ Error message shown
- ✅ User-friendly message
- ✅ No application crash

#### 15. Mobile Responsive
**Steps**:
1. Open DevTools
2. Toggle device toolbar
3. Test on different screen sizes

**Expected**:
- ✅ Layout adapts to screen
- ✅ All features accessible
- ✅ Text readable
- ✅ Buttons easily tappable
- ✅ No horizontal scroll

---

## API Testing

### Using cURL

#### Health Check
```bash
curl http: //localhost:8000/
```

**Expected Response**:
```json
{
    "message": "AayuCare API is running",
    "version": "1.0.0"
}
```

#### Find Doctors
```bash
curl -X POST http: //localhost:8000/find-doctors \
  -H "Content-Type: application/json" \
  -d '{
    "symptom_text": "fever and cough",
    "latitude": 23.2599,
    "longitude": 77.4126,
    "language": "english",
    "radius_km": 10
}'
```

**Expected Response**:
- Status: 200
- JSON with recommendation and doctors array

#### Find Facilities
```bash
curl -X POST http: //localhost:8000/find-facilities \
  -F "facility_type=pharmacy" \
  -F "latitude=23.2599" \
  -F "longitude=77.4126" \
  -F "language=english" \
  -F "radius_km=10"
```

**Expected Response**:
- Status: 200
- JSON with facilities array

### Using Postman

1. Import collection:
   - Create new request
   - Method: POST
   - URL: http: //localhost:8000/find-doctors
   - Headers: Content-Type: application/json
   - Body: Raw JSON

2. Test different scenarios:
   - Valid request
   - Missing parameters
   - Invalid coordinates
   - Different languages

---

## Component Testing

### VoiceInput Component

**Test Cases**:
- ✅ Renders correctly
- ✅ Start recording button works
- ✅ Stop recording button works
- ✅ Handles microphone permission denial
- ✅ Shows transcribed text
- ✅ Shows error messages
- ✅ Disabled during processing

### SymptomForm Component

**Test Cases**:
- ✅ Renders correctly
- ✅ Accepts text input
- ✅ Placeholder changes with language
- ✅ Submit button disabled when empty
- ✅ Shows loading state
- ✅ Handles errors

### LanguageToggle Component

**Test Cases**:
- ✅ Renders correctly
- ✅ Dropdown opens/closes
- ✅ All languages listed
- ✅ Selection updates state
- ✅ Highlights selected language

### ResultsPage Component

**Test Cases**:
- ✅ Renders with results
- ✅ Displays recommendation
- ✅ Lists doctors correctly
- ✅ Tab switching works
- ✅ Back button works
- ✅ Handles empty results

### MapWidget Component

**Test Cases**:
- ✅ Renders map (with API key)
- ✅ Shows fallback (without API key)
- ✅ Displays markers
- ✅ Shows location count
- ✅ Interactive

---

## End-to-End Testing

### User Journey 1: New User - Text Input
1. Open application
2. See homepage
3. Select language
4. Enter symptoms
5. View results
6. Check doctor details
7. Open Google Maps
8. Return and search again

### User Journey 2: New User - Voice Input
1. Open application
2. Grant location permission
3. Grant microphone permission
4. Start recording
5. Speak symptoms
6. Stop recording
7. View transcription
8. View results
9. Switch to Labs tab
10. View lab results

### User Journey 3: Multi-language User
1. Open application
2. Select Hindi
3. Enter Hindi symptoms
4. View Hindi results
5. Switch to English
6. Enter English symptoms
7. View English results

---

## Performance Testing

### Load Time
**Metrics to Check**:
- First Contentful Paint < 1.5s
- Largest Contentful Paint < 2.5s
- Time to Interactive < 3.5s
- Cumulative Layout Shift < 0.1

**Tools**:
- Chrome DevTools Lighthouse
- Google PageSpeed Insights
- WebPageTest

### API Response Time
**Expected**:
- Health check: < 100ms
- Find doctors: < 3s
- Transcribe: < 5s

### Network Throttling
**Test Scenarios**:
- Fast 3G
- Slow 3G
- Offline

---

## Accessibility Testing

### Keyboard Navigation
- ✅ Tab through all interactive elements
- ✅ Enter key activates buttons
- ✅ Escape closes dropdowns
- ✅ Focus visible

### Screen Reader
**Test with**:
- VoiceOver (macOS)
- NVDA (Windows)
- TalkBack (Android)

**Check**:
- ✅ All text read correctly
- ✅ Buttons labeled properly
- ✅ Form inputs have labels
- ✅ Error messages announced

### Visual
- ✅ Color contrast ratio > 4.5: 1
- ✅ Text resizable to 200%
- ✅ No information by color alone

---

## Browser Compatibility

### Desktop Browsers
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Mobile Browsers
- ✅ Chrome Android
- ✅ Safari iOS
- ✅ Samsung Internet

### Features to Test
- Voice input
- Location services
- Responsive layout
- Map widget
- Form submission

---

## Test Checklist

### Before Release
- [] All manual test cases pass
- [] API endpoints tested
- [] All components render correctly
- [] Error handling works
- [] Loading states work
- [] Mobile responsive
- [] Cross-browser compatible
- [] Performance metrics acceptable
- [] Accessibility compliant
- [] Security headers set
- [] Environment variables not exposed
- [] No console errors
- [] No memory leaks

### Regression Testing
Run these tests after any code change:
- [] Basic search flow (text)
- [] Voice input flow
- [] Language switching
- [] Results display
- [] Map widget
- [] Error scenarios

---

## Bug Reporting Template

When reporting bugs, include:

**Title**: Brief description

**Environment**:
- OS: 
- Browser: 
- Version: 

**Steps to Reproduce**:
1. 
2. 
3. 

**Expected Behavior**:


**Actual Behavior**:


**Screenshots**:


**Console Errors**:


**Additional Info**:


---

## Automated Testing (Future)

### Frontend Tests
```bash
cd frontend
npm test
```

### Backend Tests
```bash
cd backend
pytest
```

### E2E Tests
```bash
npm run test:e2e
```

---

## Continuous Testing

### Pre-commit
- Lint checks
- Type checks
- Unit tests

### Pre-push
- Integration tests
- Build verification

### CI/CD
- All tests
- Performance tests
- Security scans

---

**Testing Checklist Complete? Deploy with confidence! 🚀**

