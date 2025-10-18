"use client";

import { useState } from "react";
import VoiceInput from "@/components/VoiceInput";
import SymptomForm from "@/components/SymptomForm";
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">AayuCare</h1>
          </div>
          <LanguageToggle 
            selectedLanguage={selectedLanguage} 
            onLanguageChange={setSelectedLanguage} 
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!showResults ? (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-4 py-8">
              <h2 className="text-4xl font-bold text-gray-900">
                Find the Right Doctor Near You
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Tell us your symptoms and location (e.g., "fever in Delhi") - we'll find the right specialist near you
              </p>
            </div>

            {/* Input Methods */}
            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {/* Voice Input */}
              <VoiceInput
                language={selectedLanguage}
                userLocation={userLocation}
                onSearchComplete={handleSearchComplete}
                onLocationUpdate={setUserLocation}
              />

              {/* Text Input */}
              <SymptomForm
                language={selectedLanguage}
                userLocation={userLocation}
                onSearchComplete={handleSearchComplete}
                onLocationUpdate={setUserLocation}
              />
            </div>

            {/* Features */}
            <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6 mt-16">
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">Voice Support</h3>
                <p className="text-gray-600">Speak in 10+ Indian languages including Hindi, Tamil, Telugu, and more</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">Nearby Doctors</h3>
                <p className="text-gray-600">Find verified doctors, clinics, and hospitals near your specified location</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">No Login Required</h3>
                <p className="text-gray-600">Start searching immediately without creating an account or signing in</p>
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
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-gray-600">
          <p>© 2025 AayuCare - Helping rural communities find better healthcare</p>
        </div>
      </footer>
    </div>
  );
}
