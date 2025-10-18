#!/bin/bash

# AayuCare Backend Startup Script

echo "🏥 Starting AayuCare Backend..."

# Check if we're in the right directory
if [ ! -f "main.py" ]; then
    echo "❌ Error: main.py not found. Please run this script from the backend directory."
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found."
    echo "📝 Creating .env from .env.example..."
    
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ Created .env file."
        echo "⚠️  Please edit .env and add your API keys before running again!"
        exit 1
    else
        echo "❌ .env.example not found. Please create .env manually."
        exit 1
    fi
fi

# Check for virtual environment
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
    echo "✅ Virtual environment created."
fi

# Activate virtual environment
echo "🔌 Activating virtual environment..."
source venv/bin/activate

# Check if requirements are installed
echo "📚 Checking dependencies..."
pip install -q -r requirements.txt

# Check if API keys are set
if grep -q "your_sarvam_api_key_here" .env || grep -q "your_gemini_api_key_here" .env; then
    echo "⚠️  WARNING: It looks like you haven't set your API keys in .env"
    echo "Please edit .env and add your actual API keys."
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Start the server
echo "🚀 Starting FastAPI server..."
echo "📍 Backend will be available at: http://localhost:8000"
echo "🛑 Press Ctrl+C to stop"
echo ""

python main.py

