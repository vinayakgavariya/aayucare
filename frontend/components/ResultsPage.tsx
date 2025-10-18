"use client";

import { useState } from "react";
import MapWidget from "./MapWidget";

interface Doctor {
  name: string;
  address?: string;
  uri?: string;
  place_id?: string;
}

interface ResultsPageProps {
  results: {
    recommendation: string;
    doctors: Doctor[];
    symptom_text: string;
  };
  language: string;
  userLocation: { lat: number; lng: number } | null;
  onBack: () => void;
}

export default function ResultsPage({
  results,
  language,
  userLocation,
  onBack,
}: ResultsPageProps) {
  const [activeTab, setActiveTab] = useState<"doctors" | "labs" | "pharmacies">("doctors");
  const [additionalResults, setAdditionalResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchFacilities = async (facilityType: string) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("facility_type", facilityType);
      formData.append("location", results.symptom_text); // Use the original query which contains location
      formData.append("language", language);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/find-facilities`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAdditionalResults(data);
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
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Search
      </button>

      {/* Symptom Display */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">Your Symptoms:</h3>
        <p className="text-gray-700">{results.symptom_text}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => handleTabChange("doctors")}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === "doctors"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Doctors
        </button>
        <button
          onClick={() => handleTabChange("labs")}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === "labs"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Labs
        </button>
        <button
          onClick={() => handleTabChange("pharmacies")}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === "pharmacies"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Pharmacies
        </button>
      </div>

      {/* Content */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recommendation & List */}
        <div className="space-y-6">
          {activeTab === "doctors" && (
            <>
              {/* AI Recommendation */}
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Recommendation
                </h3>
                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                  {results.recommendation}
                </div>
              </div>

              {/* Doctors List */}
              {results.doctors && results.doctors.length > 0 && (
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Nearby Doctors & Clinics
                  </h3>
                  <div className="space-y-4">
                    {results.doctors.map((doctor, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <h4 className="font-semibold text-gray-900 mb-2">{doctor.name}</h4>
                        {doctor.address && (
                          <p className="text-sm text-gray-600 mb-2 flex items-start gap-2">
                            <svg
                              className="w-4 h-4 mt-0.5 flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            {doctor.address}
                          </p>
                        )}
                        {doctor.uri && (
                          <a
                            href={doctor.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
                          >
                            View on Google Maps
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              />
                            </svg>
                          </a>
                        )}
                      </div>
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
                    Nearby {activeTab === "labs" ? "Labs" : "Pharmacies"}
                  </h3>
                  {additionalResults.recommendation && (
                    <div className="mb-6 prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                      {additionalResults.recommendation}
                    </div>
                  )}
                  {additionalResults.facilities && additionalResults.facilities.length > 0 && (
                    <div className="space-y-4">
                      {additionalResults.facilities.map((facility: any, index: number) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <h4 className="font-semibold text-gray-900 mb-2">{facility.name}</h4>
                          {facility.address && (
                            <p className="text-sm text-gray-600 mb-2 flex items-start gap-2">
                              <svg
                                className="w-4 h-4 mt-0.5 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                />
                              </svg>
                              {facility.address}
                            </p>
                          )}
                          {facility.uri && (
                            <a
                              href={facility.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
                            >
                              View on Google Maps
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                              </svg>
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : null}
            </div>
          )}
        </div>

        {/* Map Widget */}
        <div className="sticky top-4">
          <MapWidget
            doctors={
              activeTab === "doctors"
                ? results.doctors
                : additionalResults?.facilities || []
            }
            userLocation={userLocation}
          />
        </div>
      </div>
    </div>
  );
}

