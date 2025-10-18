"use client";

import { useState, useEffect } from "react";

interface SymptomFormProps {
  language: string;
  userLocation: { lat: number; lng: number } | null;
  onSearchComplete: (data: any) => void;
  onLocationUpdate: (location: { lat: number; lng: number }) => void;
}

export default function SymptomForm({
  language,
  userLocation,
  onSearchComplete,
  onLocationUpdate,
}: SymptomFormProps) {
  const [symptomText, setSymptomText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // No automatic geolocation - user provides location in query

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!symptomText.trim()) {
      setErrorMessage("Please enter your symptoms");
      return;
    }

    setIsProcessing(true);
    setErrorMessage("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/find-doctors`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            symptom_text: symptomText,
            language: language,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to find doctors");
      }

      const data = await response.json();
      onSearchComplete({
        ...data,
        symptom_text: symptomText,
      });
    } catch (error) {
      console.error("Error finding doctors:", error);
      setErrorMessage("Failed to find doctors. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const placeholders: Record<string, string> = {
    english: "e.g., Knee pain for 2 weeks in Mumbai",
    hindi: "जैसे, मुंबई में घुटनों में दर्द 2 हफ्तों से",
    tamil: "உதாரணமாக, சென்னையில் முழங்கால் வலி 2 வாரங்கள்",
    telugu: "ఉదాహరణకు, హైదరాబాద్‌లో మోకాళ్ళ నొప్పి 2 వారాలుగా",
    bengali: "যেমন, কলকাতায় হাঁটুতে ব্যথা 2 সপ্তাহ ধরে",
    gujarati: "જેમ કે, અમદાવાદમાં ઘૂંટણમાં દુખાવો 2 અઠવાડિયાથી",
    kannada: "ಉದಾಹರಣೆಗೆ, ಬೆಂಗಳೂರಿನಲ್ಲಿ ಮೊಣಕಾಲು ನೋವು 2 ವಾರಗಳಿಂದ",
    malayalam: "ഉദാഹരണം, കൊച്ചിയിൽ മുട്ടുവേദന 2 ആഴ്ച",
    marathi: "उदाहरणार्थ, पुण्यात गुडघ्यात दुखणे 2 आठवड्यांपासून",
    punjabi: "ਜਿਵੇਂ ਕਿ, ਅੰਮ੍ਰਿਤਸਰ ਵਿੱਚ ਗੋਡਿਆਂ ਵਿੱਚ ਦਰਦ 2 ਹਫ਼ਤਿਆਂ ਤੋਂ",
    odia: "ଯେପରି, ଭୁବନେଶ୍ୱରରେ ଆଣ୍ଠୁରେ ଯନ୍ତ୍ରଣା 2 ସପ୍ତାହରୁ",
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
          <svg
            className="w-6 h-6 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Text Input</h3>
          <p className="text-sm text-gray-500">Type your symptoms</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={symptomText}
          onChange={(e) => setSymptomText(e.target.value)}
          placeholder={placeholders[language] || placeholders.english}
          rows={5}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
          disabled={isProcessing}
        />

        <button
          type="submit"
          disabled={isProcessing || !symptomText.trim()}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Searching...
            </span>
          ) : (
            "Find Doctors"
          )}
        </button>

        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{errorMessage}</p>
          </div>
        )}

        <p className="text-xs text-gray-500 text-center">
          Include your city/location for nearby doctors (e.g., "fever in Delhi")
        </p>
      </form>
    </div>
  );
}

