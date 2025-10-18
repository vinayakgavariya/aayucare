#!/bin/bash

# AayuCare Frontend Startup Script

echo "💻 Starting AayuCare Frontend..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the frontend directory."
    exit 1
fi

# Check if .env.local file exists
if [ ! -f ".env.local" ]; then
    echo "❌ Error: .env.local file not found."
    echo "📝 Creating .env.local from .env.local.example..."
    
    if [ -f ".env.local.example" ]; then
        cp .env.local.example .env.local
        echo "✅ Created .env.local file."
        echo "⚠️  You can edit .env.local to add your Google Maps API key (optional)."
    else
        echo "⚠️  .env.local.example not found. Creating basic .env.local..."
        cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
EOF
        echo "✅ Created .env.local file."
    fi
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed."
else
    echo "✅ Dependencies already installed."
fi

# Check if backend is running
echo "🔍 Checking if backend is running..."
if curl -s http://localhost:8000/ > /dev/null; then
    echo "✅ Backend is running!"
else
    echo "⚠️  WARNING: Backend doesn't seem to be running at http://localhost:8000"
    echo "Please start the backend first (run start-backend.sh in backend directory)"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Start the development server
echo "🚀 Starting Next.js development server..."
echo "📍 Frontend will be available at: http://localhost:3000"
echo "🛑 Press Ctrl+C to stop"
echo ""

npm run dev

