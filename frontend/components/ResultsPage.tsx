"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, ExternalLink, ChevronLeft } from "lucide-react";
import { useLanguage } from "@/lib/useLanguage";

// Utility to strip markdown formatting
const stripMarkdown = (text: string): string => {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')  // Remove bold **text**
    .replace(/\*(.+?)\*/g, '$1')      // Remove italic *text*
    .replace(/`(.+?)`/g, '$1')        // Remove code `text`
    .replace(/#{1,6}\s/g, '')         // Remove headers
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Remove links
    .trim();
};

interface Doctor {
  name: string;
  address?: string;
  uri?: string;
  place_id?: string;
  rating?: number;
  user_ratings_total?: number;
  distance_meters?: number;
  reviews?: string[];
}

// Utility to format distance
const formatDistance = (meters?: number): string => {
  if (!meters) return "";
  if (meters < 1000) {
    return `${Math.round(meters)}m away`;
  }
  return `${(meters / 1000).toFixed(1)}km away`;
};

interface ResultsPageProps {
  results: {
    recommendation: string;
    doctors: Doctor[];
    symptom_text: string;
  };
  userLocation: { lat: number; lng: number } | null;
  onBack: () => void;
}

export default function ResultsPage({
  results,
  userLocation,
  onBack,
}: ResultsPageProps) {
  const [activeTab, setActiveTab] = useState<"doctors" | "labs" | "pharmacies">("doctors");
  const [additionalResults, setAdditionalResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { currentLanguage, translateText } = useLanguage();
  const [uiText, setUiText] = useState({
    backToSearch: "Back to Search",
    yourSearch: "Your search",
    doctors: "Doctors",
    labs: "Labs",
    pharmacies: "Pharmacies",
    results: "Results",
    nearbyLabs: "Nearby Labs",
    nearbyPharmacies: "Nearby Pharmacies",
    viewOnMaps: "Show Location",
    reviews: "reviews",
    away: "away",
    noResults: "No results found for this category",
    clickTab: "Click on Labs or Pharmacies tab to search.",
  });

  // Translate UI text when language changes
  useEffect(() => {
    const translateUI = async () => {
      if (currentLanguage === 'english') {
        setUiText({
          backToSearch: "Back to Search",
          yourSearch: "Your search",
          doctors: "Doctors",
          labs: "Labs",
          pharmacies: "Pharmacies",
          results: "Results",
          nearbyLabs: "Nearby Labs",
          nearbyPharmacies: "Nearby Pharmacies",
          viewOnMaps: "Show Location",
          reviews: "reviews",
          away: "away",
          noResults: "No results found for this category",
          clickTab: "Click on Labs or Pharmacies tab to search.",
        });
      } else {
        const backToSearch = await translateText("Back to Search");
        const yourSearch = await translateText("Your search");
        const doctors = await translateText("Doctors");
        const labs = await translateText("Labs");
        const pharmacies = await translateText("Pharmacies");
        const results = await translateText("Results");
        const nearbyLabs = await translateText("Nearby Labs");
        const nearbyPharmacies = await translateText("Nearby Pharmacies");
        const viewOnMaps = await translateText("Show Location");
        const reviews = await translateText("reviews");
        const away = await translateText("away");
        const noResults = await translateText("No results found for this category");
        const clickTab = await translateText("Click on Labs or Pharmacies tab to search.");

        setUiText({
          backToSearch,
          yourSearch,
          doctors,
          labs,
          pharmacies,
          results,
          nearbyLabs,
          nearbyPharmacies,
          viewOnMaps,
          reviews,
          away,
          noResults,
          clickTab,
        });
      }
    };

    translateUI();
  }, [currentLanguage, translateText]);

  const fetchFacilities = async (facilityType: string) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("facility_type", facilityType);
      formData.append("location", results.symptom_text); // Use the original query which contains location
      formData.append("language", "english"); // Default language

      console.log(`[Frontend] Fetching ${facilityType}s for location:`, results.symptom_text);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/find-facilities`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log(`[Frontend] Received ${facilityType}s:`, data);
        setAdditionalResults(data);
      } else {
        console.error(`[Frontend] Failed to fetch ${facilityType}s:`, response.status);
      }
    } catch (error) {
      console.error("Error fetching facilities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (tab: "doctors" | "labs" | "pharmacies") => {
    setActiveTab(tab);
    if (tab === "labs") {
      fetchFacilities("lab");
    } else if (tab === "pharmacies") {
      fetchFacilities("pharmacy");
    }
  };

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <motion.button
        whileHover={{ x: -4 }}
        whileTap={{ scale: 0.95 }}
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors group"
      >
        <motion.div
          whileHover={{ x: -2 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <ChevronLeft className="w-4 h-4 group-hover:text-gray-900" />
        </motion.div>
        <span>← {uiText.backToSearch}</span>
      </motion.button>

      {/* Symptom Display */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6 shadow-sm"
      >
        <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">{uiText.yourSearch}</p>
        <p className="text-gray-900 font-medium">{results.symptom_text}</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        <button
          onClick={() => handleTabChange("doctors")}
          className={`px-5 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "doctors"
              ? "text-gray-900 border-b-2 border-gray-900"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {uiText.doctors}
        </button>
        <button
          onClick={() => handleTabChange("labs")}
          className={`px-5 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "labs"
              ? "text-gray-900 border-b-2 border-gray-900"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {uiText.labs}
        </button>
        <button
          onClick={() => handleTabChange("pharmacies")}
          className={`px-5 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "pharmacies"
              ? "text-gray-900 border-b-2 border-gray-900"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {uiText.pharmacies}
        </button>
      </div>

      {/* Content */}
      <div className="max-w-4xl">
        {/* Recommendation & List */}
        <div className="space-y-6">
          {activeTab === "doctors" && (
            <>
              {/* Doctors List */}
              {results.doctors && results.doctors.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="p-5 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700">
                      {uiText.results} ({results.doctors.length})
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {results.doctors.map((doctor, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.4 }}
                        whileHover={{ x: 4, backgroundColor: "rgba(249, 250, 251, 1)" }}
                        className="p-6 transition-all duration-300 cursor-pointer group"
                      >
                        <div className="space-y-3">
                          <div>
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <h4 className="font-semibold text-gray-900 group-hover:text-gray-700 transition-colors flex-1">
                                {doctor.name}
                              </h4>
                              {doctor.distance_meters && (
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full whitespace-nowrap">
                                  {formatDistance(doctor.distance_meters)}
                                </span>
                              )}
                            </div>

                            {/* Rating Section */}
                             {doctor.rating && (
                               <div className="flex items-center gap-2 mb-2">
                                 <div className="flex items-center gap-1">
                                   <span className="text-yellow-500 text-sm">★</span>
                                   <span className="text-sm font-medium text-gray-900">
                                     {doctor.rating.toFixed(1)}
                                   </span>
                                 </div>
                                 {doctor.user_ratings_total && (
                                   <span className="text-xs text-gray-500">
                                     ({doctor.user_ratings_total.toLocaleString()} {uiText.reviews})
                                   </span>
                                 )}
                               </div>
                             )}

                             {/* User Reviews */}
                             {doctor.reviews && doctor.reviews.length > 0 && (
                               <div className="mb-3 space-y-2">
                                 {doctor.reviews.map((review, reviewIdx) => (
                                   <div
                                     key={reviewIdx}
                                     className="bg-gray-50 rounded-lg p-3 border border-gray-100"
                                   >
                                     <p className="text-xs text-gray-600 italic leading-relaxed">
                                       "{review}"
                                     </p>
                                   </div>
                                 ))}
                               </div>
                             )}

                             {doctor.address && (
                              <p className="text-sm text-gray-600 flex items-start gap-2">
                                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400 group-hover:text-gray-600 transition-colors" />
                                {doctor.address}
                              </p>
                            )}
                          </div>

                          {doctor.uri && (
                            <motion.a
                              whileHover={{ x: 4 }}
                              href={doctor.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                              {uiText.viewOnMaps}
                            </motion.a>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {(activeTab === "labs" || activeTab === "pharmacies") && (
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <svg
                    className="animate-spin h-8 w-8 text-blue-600"
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
                </div>
              ) : additionalResults ? (
                <>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {activeTab === "labs" ? uiText.nearbyLabs : uiText.nearbyPharmacies}
                  </h3>
                  {additionalResults.facilities && additionalResults.facilities.length > 0 ? (
                    <div className="space-y-4">
                      {additionalResults.facilities.map((facility: any, index: number) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-gray-300 transition-all"
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <h4 className="font-semibold text-gray-900 flex-1">{facility.name}</h4>
                            {facility.distance_meters && (
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full whitespace-nowrap">
                                {formatDistance(facility.distance_meters)}
                              </span>
                            )}
                          </div>

                           {/* Rating Section */}
                           {facility.rating && (
                             <div className="flex items-center gap-2 mb-2">
                               <div className="flex items-center gap-1">
                                 <span className="text-yellow-500 text-sm">★</span>
                                 <span className="text-sm font-medium text-gray-900">
                                   {facility.rating.toFixed(1)}
                                 </span>
                               </div>
                               {facility.user_ratings_total && (
                                 <span className="text-xs text-gray-500">
                                   ({facility.user_ratings_total.toLocaleString()} {uiText.reviews})
                                 </span>
                               )}
                             </div>
                           )}

                           {facility.address && (
                            <p className="text-sm text-gray-600 mb-2 flex items-start gap-2">
                              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
                              {facility.address}
                            </p>
                          )}
                          {facility.uri && (
                            <motion.a
                              whileHover={{ x: 4 }}
                              href={facility.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-gray-700 hover:text-gray-900 font-medium inline-flex items-center gap-1 transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                              {uiText.viewOnMaps}
                            </motion.a>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-sm">{uiText.noResults}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm">{uiText.clickTab}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

