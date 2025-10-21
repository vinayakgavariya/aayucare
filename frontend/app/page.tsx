"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ChatInterface from "@/components/ChatInterface";
import ResultsPage from "@/components/ResultsPage";
import { useLanguage } from "@/lib/useLanguage";

export default function Home() {
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const { currentLanguage, translateText } = useLanguage();
  const [uiText, setUiText] = useState({
    appTitle: "AayuCare",
    appSubtitle: "Healthcare Search",
    autoDetect: "Speak in any Indian language",
    heroTitle: "Find Healthcare",
    heroDescription1: "Search for doctors, labs, and pharmacies near you.",
    heroDescription2: "Speak in any Indian language - we'll automatically detect it!",
    feature1Title: "Auto Language Detection",
    feature1Desc: "Speak in any of 11+ Indian languages - automatically detected",
    feature2Title: "Location-based",
    feature2Desc: "Find nearby healthcare providers",
    feature3Title: "Simple Search",
    feature3Desc: "No complicated forms needed",
    footerText: "© 2025 AayuCare. Healthcare search for everyone.",
  });

  // Translate UI text when language changes
  useEffect(() => {
    const translateUI = async () => {
      if (currentLanguage === 'english') {
        setUiText({
          appTitle: "AayuCare",
          appSubtitle: "Healthcare Search",
          autoDetect: "Speak in any Indian language",
          heroTitle: "Find Healthcare",
          heroDescription1: "Search for doctors, labs, and pharmacies near you.",
          heroDescription2: "Speak in any Indian language - we'll automatically detect it!",
          feature1Title: "Auto Language Detection",
          feature1Desc: "Speak in any of 11+ Indian languages - automatically detected",
          feature2Title: "Location-based",
          feature2Desc: "Find nearby healthcare providers",
          feature3Title: "Simple Search",
          feature3Desc: "No complicated forms needed",
          footerText: "© 2025 AayuCare. Healthcare search for everyone.",
        });
      } else {
        const appSubtitle = await translateText("Healthcare Search");
        const autoDetect = await translateText("Speak in any Indian language");
        const heroTitle = await translateText("Find Healthcare");
        const heroDescription1 = await translateText("Search for doctors, labs, and pharmacies near you.");
        const heroDescription2 = await translateText("Speak in any Indian language - we'll automatically detect it!");
        const feature1Title = await translateText("Auto Language Detection");
        const feature1Desc = await translateText("Speak in any of 11+ Indian languages - automatically detected");
        const feature2Title = await translateText("Location-based");
        const feature2Desc = await translateText("Find nearby healthcare providers");
        const feature3Title = await translateText("Simple Search");
        const feature3Desc = await translateText("No complicated forms needed");
        const footerText = await translateText("© 2025 AayuCare. Healthcare search for everyone.");

        setUiText({
          appTitle: "AayuCare",
          appSubtitle,
          autoDetect,
          heroTitle,
          heroDescription1,
          heroDescription2,
          feature1Title,
          feature1Desc,
          feature2Title,
          feature2Desc,
          feature3Title,
          feature3Desc,
          footerText,
        });
      }
    };

    translateUI();
  }, [currentLanguage, translateText]);

  const handleSearchComplete = (data: any) => {
    setResults(data);
    setShowResults(true);
  };

  const handleBack = () => {
    setShowResults(false);
    setResults(null);
  };

  const handleLanguageChange = (language: string) => {
    console.log(`[App] Language changed to: ${language}`);
  };

  return (
    <div className="min-h-screen bg-white">

      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="border-b border-gray-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center cursor-pointer"
                onClick={() => window.location.reload()}
              >
                <span className="text-xl">🏥</span>
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {uiText.appTitle}
                </h1>
                <p className="text-xs text-gray-500">{uiText.appSubtitle}</p>
              </div>
            </div>

            {/* Info Badge */}
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
              <span>🌐</span>
              <span className="hidden sm:inline">{uiText.autoDetect}</span>
              <span className="sm:hidden">{uiText.autoDetect}</span>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!showResults ? (
          <div className="space-y-8">
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center space-y-6 py-16"
            >
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-5xl md:text-6xl font-light text-gray-900 tracking-tight"
              >
                {uiText.heroTitle}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
              >
                {uiText.heroDescription1}
                <br />
                <span className="text-gray-500">{uiText.heroDescription2}</span>
              </motion.p>
            </motion.div>

            {/* Chat Interface */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="max-w-4xl mx-auto"
            >
              <ChatInterface
                onDoctorsFound={handleSearchComplete}
                onLanguageChange={handleLanguageChange}
              />
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 mt-20"
            >
              {[
                { icon: "🎤", title: uiText.feature1Title, desc: uiText.feature1Desc },
                { icon: "📍", title: uiText.feature2Title, desc: uiText.feature2Desc },
                { icon: "💬", title: uiText.feature3Title, desc: uiText.feature3Desc }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  className="group text-center space-y-4 p-8 rounded-xl bg-white border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300 cursor-pointer"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="w-16 h-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center mx-auto group-hover:from-gray-100 group-hover:to-gray-200 transition-all duration-300"
                  >
                    <span className="text-3xl">{feature.icon}</span>
                  </motion.div>
                  <h3 className="font-semibold text-gray-900 text-lg">{feature.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        ) : (
          <ResultsPage
            results={results}
            userLocation={userLocation}
            onBack={handleBack}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-sm text-gray-500">
            {uiText.footerText}
          </p>
        </div>
      </footer>
    </div>
  );
}
