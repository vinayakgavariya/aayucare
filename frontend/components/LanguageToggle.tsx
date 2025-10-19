"use client";

import { useState } from "react";

interface LanguageToggleProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
}

const languages = [
  { code: "english", name: "English", nativeName: "English" },
  { code: "hindi", name: "Hindi", nativeName: "हिंदी" },
  { code: "bengali", name: "Bengali", nativeName: "বাংলা" },
  { code: "tamil", name: "Tamil", nativeName: "தமிழ்" },
  { code: "telugu", name: "Telugu", nativeName: "తెలుగు" },
  { code: "gujarati", name: "Gujarati", nativeName: "ગુજરાતી" },
  { code: "kannada", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "malayalam", name: "Malayalam", nativeName: "മലയാളം" },
  { code: "marathi", name: "Marathi", nativeName: "मराठी" },
  { code: "punjabi", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ" },
  { code: "odia", name: "Odia", nativeName: "ଓଡ଼ିଆ" },
];

export default function LanguageToggle({
  selectedLanguage,
  onLanguageChange,
}: LanguageToggleProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedLang = languages.find((lang) => lang.code === selectedLanguage) || languages[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border-3 border-orange-300 rounded-xl hover:bg-orange-50 transition-all shadow-md hover:shadow-lg"
      >
        <span className="text-2xl">🌐</span>
        <span className="font-bold text-gray-800">{selectedLang.nativeName}</span>
        <svg
          className={`w-4 h-4 text-orange-600 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-64 bg-white border-4 border-orange-200 rounded-2xl shadow-2xl z-20 max-h-96 overflow-y-auto">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  onLanguageChange(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-3 hover:bg-orange-50 transition-colors first:rounded-t-xl last:rounded-b-xl border-b border-orange-100 last:border-b-0 ${
                  lang.code === selectedLanguage ? "bg-gradient-to-r from-orange-100 to-green-100 text-orange-800 font-bold" : "text-gray-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-lg">{lang.nativeName}</span>
                  <span className="text-sm text-gray-500">{lang.name}</span>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

