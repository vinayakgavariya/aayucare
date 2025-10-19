"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  type: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  language: string;
  onDoctorsFound: (data: any) => void;
}

export default function ChatInterface({
  language,
  onDoctorsFound,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "system",
      content: "नमस्ते! 🙏 Welcome to AayuCare. I'm here to help you find the right doctor.\n\nPlease tell me:\n✓ Your symptoms (e.g., fever, headache)\n✓ Your location with state (e.g., Nagpur, Maharashtra)",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Float32Array>(new Float32Array(0));

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Convert Float32 to Int16
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
      addMessage("system", "Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = async () => {
    if (!isRecording) return;

    setIsRecording(false);

    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
    }

    if (audioContextRef.current) {
      await audioContextRef.current.close();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    await processAudio();
  };

  const processAudio = async () => {
    setIsProcessing(true);

    try {
      const int16Data = float32ToInt16(audioChunksRef.current);
      const uint8Data = new Uint8Array(int16Data.buffer as ArrayBuffer);
      const blob = new Blob([uint8Data], { type: "audio/wav" });
      const reader = new FileReader();
      reader.readAsDataURL(blob);

      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(",")[1];

        // Map UI language to Sarvam language code
        const languageMap: Record<string, string> = {
          english: "en-IN",
          hindi: "hi-IN",
          tamil: "ta-IN",
          telugu: "te-IN",
          marathi: "mr-IN",
          bengali: "bn-IN",
          gujarati: "gu-IN",
          kannada: "kn-IN",
          malayalam: "ml-IN",
          punjabi: "pa-IN",
          odia: "or-IN",
        };

        const sarvamLangCode = languageMap[language.toLowerCase()] || "en-IN";

        // Transcribe
        const transcribeResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/transcribe`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              audio_base64: base64Audio,
              encoding: "audio/wav",
              sample_rate: 16000,
              language: sarvamLangCode,
            }),
          }
        );

        if (!transcribeResponse.ok) {
          throw new Error("Transcription failed");
        }

        const transcribeData = await transcribeResponse.json();
        const transcription = transcribeData.transcription || "";

        if (!transcription) {
          addMessage("system", "Could not understand. Please try again.");
          setIsProcessing(false);
          return;
        }

        // Add user message
        addMessage("user", transcription);

        // Process with backend
        await processUserMessage(transcription);
      };
    } catch (error) {
      console.error("Error processing audio:", error);
      addMessage("system", "Failed to process audio. Please try again.");
      setIsProcessing(false);
    }
  };

  const addMessage = (type: "user" | "assistant" | "system", content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const processUserMessage = async (text: string) => {
    setIsProcessing(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/find-doctors`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            symptom_text: text,
            language: language,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to find doctors");
      }

      const data = await response.json();
      
      // Add assistant response
      addMessage("assistant", data.recommendation);

      // Show doctors
      if (data.doctors && data.doctors.length > 0) {
        onDoctorsFound({
          ...data,
          symptom_text: text,
        });
      } else {
        addMessage("system", "No doctors found nearby. Try including your state/city.");
      }
    } catch (error) {
      console.error("Error:", error);
      addMessage("system", "Something went wrong. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isProcessing) return;

    const userMessage = inputText.trim();
    setInputText("");
    addMessage("user", userMessage);
    await processUserMessage(userMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-gradient-to-b from-orange-50 to-green-50 rounded-2xl shadow-2xl border-4 border-orange-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 via-white to-green-500 p-4 rounded-t-xl border-b-4 border-orange-300">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
            <span className="text-2xl">🏥</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">AayuCare Assistant</h2>
            <p className="text-sm text-gray-600">आपकी सेहत, हमारी जिम्मेदारी</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl p-4 shadow-md ${
                message.type === "user"
                  ? "bg-gradient-to-r from-orange-500 to-orange-400 text-white rounded-br-none"
                  : message.type === "assistant"
                  ? "bg-white text-gray-800 rounded-bl-none border-2 border-green-200"
                  : "bg-gradient-to-r from-blue-100 to-blue-50 text-gray-700 rounded-lg border-2 border-blue-200"
              }`}
            >
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
              <p className="text-xs mt-2 opacity-70">
                {message.timestamp.toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl p-4 shadow-md border-2 border-green-200">
              <div className="flex gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" />
                <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce delay-100" />
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t-4 border-orange-200 rounded-b-xl">
        <div className="flex gap-2">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg ${
              isRecording
                ? "bg-red-500 animate-pulse"
                : "bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <span className="text-2xl">{isRecording ? "⏹️" : "🎤"}</span>
          </button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your symptoms and location..."
            disabled={isProcessing || isRecording}
            className="flex-1 px-4 py-3 border-2 border-orange-200 rounded-full focus:outline-none focus:border-orange-400 disabled:bg-gray-100"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isProcessing || isRecording}
            className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-green-500 to-green-400 hover:from-green-600 hover:to-green-500 rounded-full flex items-center justify-center transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-2xl">📤</span>
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Example: "मुझे बुखार है, Nagpur, Maharashtra" or "Headache in Delhi"
        </p>
      </div>
    </div>
  );
}

