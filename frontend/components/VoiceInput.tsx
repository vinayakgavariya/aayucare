"use client";

import { useState, useRef, useEffect } from "react";

interface VoiceInputProps {
  language: string;
  userLocation: { lat: number; lng: number } | null;
  onSearchComplete: (data: any) => void;
  onLocationUpdate: (location: { lat: number; lng: number }) => void;
}

export default function VoiceInput({
  language,
  userLocation,
  onSearchComplete,
  onLocationUpdate,
}: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [transcribedText, setTranscribedText] = useState("");
  const audioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Float32Array>(new Float32Array(0));

  // No automatic geolocation - user provides location in query

  // Convert Float32 to Int16 (as required by Sarvam)
  const float32ToInt16 = (float32Array: Float32Array): Int16Array => {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return int16Array;
  };

  const startRecording = async () => {
    try {
      setErrorMessage("");
      setTranscribedText("");

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        },
      });

      streamRef.current = stream;

      const audioContext = new AudioContext({
        sampleRate: 16000,
      });
      audioContextRef.current = audioContext;

      const inputStreamNode = audioContext.createMediaStreamSource(stream);
      const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
      scriptProcessorRef.current = scriptProcessor;

      audioChunksRef.current = new Float32Array(0);

      scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
        
        // Accumulate audio data
        const newAudioChunks = new Float32Array(
          audioChunksRef.current.length + inputData.length
        );
        newAudioChunks.set(audioChunksRef.current);
        newAudioChunks.set(inputData, audioChunksRef.current.length);
        audioChunksRef.current = newAudioChunks;
      };

      inputStreamNode.connect(scriptProcessor);
      scriptProcessor.connect(audioContext.destination);

      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      setErrorMessage("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = async () => {
    if (!isRecording) return;

    setIsRecording(false);

    // Stop the script processor
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
    }

    // Close audio context
    if (audioContextRef.current) {
      await audioContextRef.current.close();
    }

    // Stop media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    // Process the accumulated audio
    await processAudio();
  };

  const processAudio = async () => {
    setIsProcessing(true);

    try {
      // Convert Float32 to Int16
      const int16Data = float32ToInt16(audioChunksRef.current);
      
      // Convert Int16Array to Uint8Array for Blob compatibility
      const uint8Data = new Uint8Array(int16Data.buffer as ArrayBuffer);
      const blob = new Blob([uint8Data], { type: "audio/wav" });
      const reader = new FileReader();
      reader.readAsDataURL(blob);

      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(",")[1];
        console.log("[Frontend] Audio length:", base64Audio.length, "chars");
        console.log("[Frontend] Audio samples:", audioChunksRef.current.length);

        // Step 1: Transcribe audio using Sarvam AI
        const transcribeResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/transcribe`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              audio_base64: base64Audio,
              encoding: "audio/wav",
              sample_rate: 16000,
            }),
          }
        );

        console.log("[Frontend] Transcribe response status:", transcribeResponse.status);

        if (!transcribeResponse.ok) {
          const errorText = await transcribeResponse.text();
          console.error("[Frontend] Transcribe error:", errorText);
          throw new Error("Transcription failed");
        }

        const transcribeData = await transcribeResponse.json();
        console.log("[Frontend] Transcribe data:", transcribeData);
        const transcription = transcribeData.transcription || "";
        console.log("[Frontend] Extracted transcription:", transcription);
        setTranscribedText(transcription);

        if (!transcription) {
          setErrorMessage("Could not transcribe audio. Please try again.");
          setIsProcessing(false);
          return;
        }

        // Step 2: Find doctors using transcribed text
        const doctorsResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/find-doctors`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              symptom_text: transcription,
              language: language,
            }),
          }
        );

        if (!doctorsResponse.ok) {
          throw new Error("Doctor search failed");
        }

        const doctorsData = await doctorsResponse.json();
        onSearchComplete({
          ...doctorsData,
          symptom_text: transcription,
        });
      };
    } catch (error) {
      console.error("Error processing audio:", error);
      setErrorMessage("Failed to process audio. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
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
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Voice Input</h3>
          <p className="text-sm text-gray-500">Speak in your language</p>
        </div>
      </div>

      <div className="space-y-4">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className={`w-full py-6 rounded-lg font-semibold text-lg transition-all ${
            isRecording
              ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          } disabled:bg-gray-300 disabled:cursor-not-allowed`}
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
              Processing...
            </span>
          ) : isRecording ? (
            "🔴 Stop Recording"
          ) : (
            "🎤 Start Recording"
          )}
        </button>

        {transcribedText && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-1">Transcribed:</p>
            <p className="text-gray-700">{transcribedText}</p>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{errorMessage}</p>
          </div>
        )}

        <p className="text-xs text-gray-500 text-center">
          Mention your symptoms and location (e.g., "headache in Mumbai")
        </p>
      </div>
    </div>
  );
}

