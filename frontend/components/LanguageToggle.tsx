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
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <svg
          className="w-5 h-5 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
          />
        </svg>
        <span className="font-medium text-gray-700">{selectedLang.nativeName}</span>
        <svg
          className={`w-4 h-4 text-gray-600 transition-transform ${
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
          <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-96 overflow-y-auto">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  onLanguageChange(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                  lang.code === selectedLanguage ? "bg-blue-50 text-blue-700" : "text-gray-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{lang.nativeName}</span>
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

