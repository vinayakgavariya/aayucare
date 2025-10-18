# How to Get API Keys for AayuCare

Step-by-step guide to obtain all required API keys.

---

## 🔑 Required API Keys

### 1. Sarvam AI API Key (Required)
**Used for**: Speech-to-Text conversion

### 2. Google Gemini API Key (Required)
**Used for**: AI-powered symptom analysis and doctor recommendations

### 3. Google Maps API Key (Optional)
**Used for**: Interactive map widget

---

## 📝 Step-by-Step Instructions

## 1. Sarvam AI API Key

### Step 1: Visit Sarvam AI Website
Go to: [https: //www.sarvam.ai/](https://www.sarvam.ai/)

### Step 2: Sign Up
1. Click "Get Started" or "Sign Up"
2. Fill in your details:
   - Full Name
   - Email Address
   - Company/Organization
   - Use Case: "Healthcare Application"
3. Submit the form

### Step 3: Verify Email
1. Check your email inbox
2. Click verification link
3. Complete verification

### Step 4: Get API Key
1. Log in to Sarvam AI dashboard
2. Navigate to "API Keys" section
3. Click "Create New API Key"
4. Copy the API key (starts with something like `sarvam_...`)
5. Save it securely

### Step 5: Configure in AayuCare
```bash
# In backend/.env
SARVAM_API_KEY=your_sarvam_api_key_here
```

---

## 2. Google Gemini API Key

### Step 1: Visit Google AI Studio
Go to: [https: //ai.google.dev/](https://ai.google.dev/)

### Step 2: Sign In
1. Click "Get API Key" or "Get Started"
2. Sign in with your Google account
3. Accept terms of service

### Step 3: Create API Key
1. Click "Get API key" button
2. Create a new project or select existing
3. Click "Create API key"
4. Copy the API key (starts with `AI...`)
5. Save it securely

### Step 4: Enable Required APIs
1. Go to [Google Cloud Console
        ](https: //console.cloud.google.com/)
2. Select your project
3. Go to "APIs & Services" → "Library"
4. Search and enable:
   - **Generative Language API** (Gemini)
   - **Places API** (for Maps grounding)

### Step 5: Configure in AayuCare
```bash
# In backend/.env
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## 3. Google Maps API Key (Optional)

### Step 1: Go to Google Cloud Console
Visit: [https: //console.cloud.google.com/](https://console.cloud.google.com/)

### Step 2: Create/Select Project
1. Click project dropdown at top
2. Click "New Project"
3. Enter project name: "AayuCare"
4. Click "Create"

### Step 3: Enable Billing
1. Go to "Billing"
2. Link a billing account
3. **Note**: Google provides $200 free credit per month
4. Maps usage below this is free

### Step 4: Enable APIs
1. Go to "APIs & Services" → "Library"
2. Search and enable these APIs:
   - **Maps JavaScript API**
   - **Maps Embed API**
   - **Places API**
   - **Geocoding API**

### Step 5: Create API Key
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API Key"
3. Copy the API key
4. (Recommended) Click "Restrict Key":
   - Application restrictions: HTTP referrers
   - Add: `localhost: 3000/*` (for development)
   - Add: `your-domain.com/*` (for production)
   - API restrictions: Select the APIs you enabled

### Step 6: Configure in AayuCare
```bash
# In frontend/.env.local
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

---

## 💰 Cost Considerations

### Sarvam AI
- **Pricing**: Pay-per-use
- **Free Tier**: Check their website for current offers
- **Typical Cost**: ₹0.50-2 per minute of audio
- **For Development**: Minimal cost with testing

### Google Gemini
- **Free Tier**: Yes! Generous limits
- **Limits**: 
  - 60 requests per minute
  - 1,500 requests per day
  - 1 million tokens per month (free)
- **Paid Tier**: Available if you need more

### Google Maps
- **Free Credit**: $200/month
- **Cost**: 
  - Maps loads: $7 per 1000 loads
  - Places API: $17 per 1000 requests
- **For Development**: Likely stays within free tier
- **Free Tier Covers**: ~28,000 map loads/month

### Estimated Monthly Cost for Low Traffic
- Sarvam AI: ₹100-500 (~$1-6)
- Gemini: ₹0 (free tier)
- Maps: ₹0 (free tier)
- **Total**: ₹100-500/month for development/testing

---

## 🔒 Security Best Practices

### DO ✅
- Store keys in `.env` files
- Add `.env` to `.gitignore`
- Use environment variables
- Restrict API keys (especially Maps)
- Rotate keys periodically
- Monitor usage

### DON'T ❌
- Commit keys to Git
- Share keys publicly
- Use same keys for dev/prod
- Leave keys unrestricted
- Ignore usage alerts

---

## 🧪 Testing Your Keys

### Test Sarvam AI Key
```bash
curl -X POST https://api.sarvam.ai/... \
  -H "api-subscription-key: YOUR_KEY" \
  -d '...'
```

### Test Gemini Key
```python
from google import genai

client = genai.Client(api_key="YOUR_KEY")
response = client.models.generate_content(
    model='gemini-2.0-flash-exp',
    contents='Hello!'
)
print(response.text)
```

### Test Maps Key
Visit in browser:
```
https://maps.googleapis.com/maps/api/js?key=YOUR_KEY
```

---

## 🚨 Troubleshooting

### "Invalid API Key"
- Check for typos
- Verify key is active
- Check key restrictions
- Ensure API is enabled

### "Quota Exceeded"
- Check usage in dashboard
- Wait for quota reset
- Upgrade plan if needed

### "API Not Enabled"
- Enable required APIs in Cloud Console
- Wait a few minutes for propagation

---

## 📞 Support

### Sarvam AI Support
- Website: [sarvam.ai](https://www.sarvam.ai/)
- Email: Check their website
- Docs: Available on their platform

### Google AI Support
- Docs: [ai.google.dev/docs](https://ai.google.dev/docs)
- Forum: [Google AI Developer Forum](https://discuss.ai.google.dev/)
- Console: [console.cloud.google.com](https://console.cloud.google.com/)

---

## ✅ Quick Checklist

Before starting development, ensure you have:

- [ ] Created Sarvam AI account
- [ ] Got Sarvam AI API key
- [ ] Created Google account
- [ ] Got Gemini API key
- [ ] Enabled Generative Language API
- [ ] (Optional) Created Google Cloud project
- [ ] (Optional) Enabled Maps APIs
- [ ] (Optional) Got Google Maps API key
- [ ] Added all keys to `.env` files
- [ ] Tested API keys work
- [ ] Secured keys (not in Git)

---

## 🎯 Quick Summary

**Minimum to Start**:
1. Sarvam AI API Key → Voice input
2. Gemini API Key → AI recommendations

**For Full Experience**:
3. Google Maps API Key → Interactive maps

---

**Ready?** Copy your keys to the `.env` files and start building! 🚀

See [QUICK_START.md](QUICK_START.md) for next steps.

