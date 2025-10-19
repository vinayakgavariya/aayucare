"use client";

import { useState } from "react";
import ChatInterface from "@/components/ChatInterface";
import ResultsPage from "@/components/ResultsPage";
import LanguageToggle from "@/components/LanguageToggle";

export default function Home() {
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const handleSearchComplete = (data: any) => {
    setResults(data);
    setShowResults(true);
  };

  const handleBack = () => {
    setShowResults(false);
    setResults(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-green-50">
      {/* Indian Pattern Background */}
      <div className="fixed inset-0 opacity-5 pointer-events-none" style={{
        backgroundImage: `repeating-linear-gradient(45deg, #ff9933 0, #ff9933 1px, transparent 0, transparent 50%), repeating-linear-gradient(-45deg, #138808 0, #138808 1px, transparent 0, transparent 50%)`,
        backgroundSize: '20px 20px'
      }} />

      {/* Header */}
      <header className="relative bg-gradient-to-r from-orange-500 via-white to-green-500 shadow-lg border-b-4 border-orange-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-orange-300">
              <span className="text-3xl">🏥</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">
                AayuCare
              </h1>
              <p className="text-sm text-gray-700 font-medium">आपकी सेहत, हमारी जिम्मेदारी</p>
            </div>
          </div>
          <LanguageToggle 
            selectedLanguage={selectedLanguage} 
            onLanguageChange={setSelectedLanguage} 
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!showResults ? (
          <div className="space-y-6">
            {/* Hero Section */}
            <div className="text-center space-y-3 py-6">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800">
                सही डॉक्टर खोजें 🏥
              </h2>
              <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
                <span className="font-semibold text-orange-600">Chat with us</span> in your language.
                <br />
                Tell us your <span className="font-semibold text-green-600">symptoms</span> and <span className="font-semibold text-blue-600">location with state</span>.
              </p>
            </div>

            {/* Chat Interface */}
            <div className="max-w-4xl mx-auto">
              <ChatInterface
                language={selectedLanguage}
                onDoctorsFound={handleSearchComplete}
              />
            </div>

            {/* Features */}
            <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6 mt-12">
              <div className="bg-white p-6 rounded-2xl shadow-lg border-4 border-orange-200 hover:shadow-xl transition-shadow">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
                  <span className="text-3xl">🎤</span>
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">बोलें अपनी भाषा में</h3>
                <p className="text-gray-600">Hindi, English, Tamil, Telugu, and 7+ Indian languages</p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg border-4 border-green-200 hover:shadow-xl transition-shadow">
                <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
                  <span className="text-3xl">📍</span>
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">पास के डॉक्टर</h3>
                <p className="text-gray-600">Find verified doctors, clinics near your village/city</p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg border-4 border-blue-200 hover:shadow-xl transition-shadow">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
                  <span className="text-3xl">💬</span>
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">आसान Chat</h3>
                <p className="text-gray-600">Simple conversation - no forms or complicated steps</p>
              </div>
            </div>
          </div>
        ) : (
          <ResultsPage
            results={results}
            language={selectedLanguage}
            userLocation={userLocation}
            onBack={handleBack}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="relative bg-gradient-to-r from-orange-100 via-white to-green-100 border-t-4 border-orange-300 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <p className="text-gray-700 font-medium">
            🇮🇳 © 2025 AayuCare - भारत के गांवों के लिए स्वास्थ्य सेवा
          </p>
          <p className="text-sm text-gray-600 mt-2">Serving Rural India with Pride</p>
        </div>
      </footer>
    </div>
  );
}
