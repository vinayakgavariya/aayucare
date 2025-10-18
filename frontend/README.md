# AayuCare Frontend

Next.js frontend for the AayuCare Rural Health Navigator.

## Features

- 🎤 Voice input in 10+ Indian languages
- ✍️ Text input with multi-language support
- 🗺️ Interactive map widget showing nearby doctors
- 📍 Location-based doctor search
- 🏥 Find labs and pharmacies
- 🌐 No login required
- 📱 Mobile-friendly, responsive design
- ⚡ Optimized for low-bandwidth connections

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Backend API running (see `../backend/README.md`)

### Installation

1. Install dependencies:

```bash
npm install
```

2. Create environment file:

```bash
cp .env.local.example .env.local
```

3. Update `.env.local` with your configuration:
   - `NEXT_PUBLIC_API_URL`: Your backend API URL (default: http: //localhost:8000)
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: (Optional) Google Maps API key for map widget

### Development

Run the development server:

```bash
npm run dev
```

Open [http: //localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
frontend/
├── app/
│   ├── page.tsx          # Main home page
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── components/
│   ├── VoiceInput.tsx    # Voice recording component
│   ├── SymptomForm.tsx   # Text input form
│   ├── LanguageToggle.tsx # Language selector
│   ├── ResultsPage.tsx   # Results display
│   └── MapWidget.tsx     # Google Maps integration
└── public/               # Static assets
```

## Supported Languages

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

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel
    ](https: //vercel.com)
3. Add environment variables:
   - `NEXT_PUBLIC_API_URL`: Your backend API URL
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: (Optional) Google Maps API key
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (Android Chrome, iOS Safari)

## Performance Optimizations

- Server-side rendering for fast initial load
- Code splitting for smaller bundle sizes
- Image optimization
- Lazy loading of components
- Minimal external dependencies

## License

MIT
