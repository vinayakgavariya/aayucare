"use client";

import { useEffect, useRef } from "react";

interface MapWidgetProps {
  doctors: Array<{
    name: string;
    address?: string;
    uri?: string;
    place_id?: string;
  }>;
  userLocation: { lat: number; lng: number } | null;
}

export default function MapWidget({ doctors, userLocation }: MapWidgetProps) {
  const mapRef = useRef<HTMLIFrameElement>(null);

  // Generate Google Maps embed URL
  const getMapUrl = () => {
    const location = userLocation || { lat: 23.2599, lng: 77.4126 };
    
    // If we have doctors/facilities, create a map with markers
    if (doctors && doctors.length > 0) {
      const firstDoctor = doctors[0];
      
      // Use place_id if available, otherwise use search query
      if (firstDoctor.place_id) {
        return `https://www.google.com/maps/embed/v1/place?key=${
          process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
        }&q=place_id:${firstDoctor.place_id}&center=${location.lat},${location.lng}`;
      } else {
        // Search for the doctor/facility name near the location
        const query = encodeURIComponent(firstDoctor.name);
        return `https://www.google.com/maps/embed/v1/search?key=${
          process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
        }&q=${query}&center=${location.lat},${location.lng}&zoom=13`;
      }
    }

    // Default: show user location
    return `https://www.google.com/maps/embed/v1/view?key=${
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
    }&center=${location.lat},${location.lng}&zoom=13`;
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <svg
          className="w-6 h-6 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
          />
        </svg>
        Map View
      </h3>

      <div className="relative w-full h-96 rounded-lg overflow-hidden border border-gray-200">
        {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
          <iframe
            ref={mapRef}
            src={getMapUrl()}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center p-6">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
              <p className="text-gray-600 mb-2">Map view unavailable</p>
              <p className="text-sm text-gray-500">
                Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to enable maps
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Location List */}
      {doctors && doctors.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium text-gray-700">
            {doctors.length} location{doctors.length !== 1 ? "s" : ""} found
          </p>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {doctors.map((doctor, index) => (
              <div
                key={index}
                className="text-sm text-gray-600 flex items-center gap-2 p-2 hover:bg-gray-50 rounded"
              >
                <div className="w-6 h-6 flex-shrink-0 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-semibold">
                  {index + 1}
                </div>
                <span className="truncate">{doctor.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

