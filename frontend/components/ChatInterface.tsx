"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/useLanguage";

interface Message {
  id: string;
  type: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  onDoctorsFound: (data: any) => void;
  onLanguageChange?: (language: string) => void;
}

export default function ChatInterface({
  onDoctorsFound,
  onLanguageChange,
}: ChatInterfaceProps) {
  const { currentLanguage, changeLanguage, translateText } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [pendingSymptom, setPendingSymptom] = useState<string | null>(null);
  const [detectedLanguage, setDetectedLanguage] = useState<string>("english");
  const [uiText, setUiText] = useState({
    welcome: "Welcome to AayuCare. I can help you find doctors, labs, and pharmacies near you.\n\nPlease tell me:\n• Your symptoms or health concern\n• Your location (city and state)\n\nSpeak in any Indian language - we'll automatically detect it!",
    placeholder: "Describe your symptoms and location...",
    recording: "Recording...",
    listening: "🎤 Listening...",
    processing: "Processing...",
    clickMic: "Click mic to speak • Type or voice search in any language",
    processingVoice: "Processing your voice input...",
    couldNotUnderstand: "Could not understand. Please try again.",
    somethingWrong: "Something went wrong. Please try again.",
    noDoctorsFound: "No doctors found nearby. Try including your state/city.",
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Float32Array>(new Float32Array(0));
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Translate UI text when language changes
  useEffect(() => {
    const translateUI = async () => {
      if (currentLanguage === 'english') {
        setUiText({
          welcome: "Welcome to AayuCare. I can help you find doctors, labs, and pharmacies near you.\n\nPlease tell me:\n• Your symptoms or health concern\n• Your location (city and state)\n\nSpeak in any Indian language - we'll automatically detect it!",
          placeholder: "Describe your symptoms and location...",
          recording: "Recording...",
          listening: "🎤 Listening...",
          processing: "Processing...",
          clickMic: "Click mic to speak • Type or voice search in any language",
          processingVoice: "Processing your voice input...",
          couldNotUnderstand: "Could not understand. Please try again.",
          somethingWrong: "Something went wrong. Please try again.",
          noDoctorsFound: "No doctors found nearby. Try including your state/city.",
        });
      } else {
        const welcome = await translateText("Welcome to AayuCare. I can help you find doctors, labs, and pharmacies near you.\n\nPlease tell me:\n• Your symptoms or health concern\n• Your location (city and state)\n\nSpeak in any Indian language - we'll automatically detect it!");
        const placeholder = await translateText("Describe your symptoms and location...");
        const recording = await translateText("Recording...");
        const listening = await translateText("🎤 Listening...");
        const processing = await translateText("Processing...");
        const clickMic = await translateText("Click mic to speak • Type or voice search in any language");
        const processingVoice = await translateText("Processing your voice input...");
        const couldNotUnderstand = await translateText("Could not understand. Please try again.");
        const somethingWrong = await translateText("Something went wrong. Please try again.");
        const noDoctorsFound = await translateText("No doctors found nearby. Try including your state/city.");

        setUiText({
          welcome,
          placeholder,
          recording,
          listening,
          processing,
          clickMic,
          processingVoice,
          couldNotUnderstand,
          somethingWrong,
          noDoctorsFound,
        });
      }
    };

    translateUI();
  }, [currentLanguage, translateText]);

  // Add welcome message on mount
  useEffect(() => {
    if (messages.length === 0) {
      const addWelcomeMessage = async () => {
        const welcomeContent = await translateText(
          "Welcome to AayuCare. I can help you find doctors, labs, and pharmacies near you.\n\nPlease tell me:\n• Your symptoms or health concern\n• Your location (city and state)\n\nSpeak in any Indian language - we'll automatically detect it!"
        );
        setMessages([
          {
            id: "welcome",
            type: "system",
            content: welcomeContent,
            timestamp: new Date(),
          },
        ]);
      };
      addWelcomeMessage();
    }
  }, []);

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
      // Check if we're in browser environment
      if (typeof window === 'undefined') {
        addMessage("system", "Voice input is only available in the browser.");
        return;
      }

      console.log("[Mic Debug] Current URL:", window.location.href);
      console.log("[Mic Debug] Hostname:", window.location.hostname);
      console.log("[Mic Debug] Protocol:", window.location.protocol);
      console.log("[Mic Debug] Secure Context:", window.isSecureContext);
      console.log("[Mic Debug] navigator.mediaDevices:", !!navigator?.mediaDevices);
      console.log("[Mic Debug] getUserMedia exists:", !!navigator?.mediaDevices?.getUserMedia);

      // For development: accept localhost, 127.0.0.1, or any local IP
      const isLocalDevelopment = 
        window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname.startsWith('192.168.') ||
        window.location.hostname.startsWith('10.') ||
        window.location.hostname.startsWith('172.');

      // Check if mediaDevices API exists
      if (!navigator.mediaDevices) {
        console.error("[Mic Error] navigator.mediaDevices not available");
        addMessage("system", "❌ Your browser doesn't support microphone access. Please use Chrome, Firefox, Edge, or Safari.");
        return;
      }

      // Check if getUserMedia exists
      if (!navigator.mediaDevices.getUserMedia) {
        console.error("[Mic Error] getUserMedia not available");
        
        if (!window.isSecureContext && !isLocalDevelopment) {
          addMessage("system", "⚠️ Microphone requires HTTPS or localhost. Current URL: " + window.location.href);
        } else {
          addMessage("system", "❌ Voice input not supported in your browser. Try Chrome, Firefox, or Edge.");
        }
        return;
      }

      console.log("[Mic] Requesting microphone access...");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        },
      });

      streamRef.current = stream;
      console.log("[Mic] Microphone access granted!");

      const audioContext = new AudioContext({
        sampleRate: 16000,
      });
      audioContextRef.current = audioContext;

      const inputStreamNode = audioContext.createMediaStreamSource(stream);
      const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
      scriptProcessorRef.current = scriptProcessor;

      // Create analyser for audio visualization
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      audioChunksRef.current = new Float32Array(0);

      scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
        const newAudioChunks = new Float32Array(
          audioChunksRef.current.length + inputData.length
        );
        newAudioChunks.set(audioChunksRef.current);
        newAudioChunks.set(inputData, audioChunksRef.current.length);
        audioChunksRef.current = newAudioChunks;

        // Calculate audio level for visualization
        const sum = inputData.reduce((acc, val) => acc + Math.abs(val), 0);
        const average = sum / inputData.length;
        setAudioLevel(Math.min(100, average * 1000)); // Scale to 0-100
      };

      inputStreamNode.connect(analyser);
      inputStreamNode.connect(scriptProcessor);
      scriptProcessor.connect(audioContext.destination);

      setIsRecording(true);
      setRecordingTime(0);

      // Start recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
      
      console.log("[Mic] Recording started successfully!");
    } catch (error: any) {
      console.error("[Mic Error] Error starting recording:", error);
      console.error("[Mic Error] Error name:", error?.name);
      console.error("[Mic Error] Error message:", error?.message);
      
      if (error?.name === 'NotAllowedError') {
        addMessage("system", "🚫 Microphone access denied. Please click the 🔒 icon in your browser's address bar and allow microphone access.");
      } else if (error?.name === 'NotFoundError') {
        addMessage("system", "🎤 No microphone found. Please connect a microphone and try again.");
      } else if (error?.name === 'NotSupportedError') {
        addMessage("system", "⚠️ Microphone not supported. Make sure you're accessing via http://localhost:3000");
      } else {
        addMessage("system", `❌ Could not access microphone: ${error?.message || 'Unknown error'}. Please check permissions or use text input.`);
      }
    }
  };

  const stopRecording = async () => {
    if (!isRecording) return;

    setIsRecording(false);
    setAudioLevel(0);

    // Clear recording timer
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }

    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
    }

    if (analyserRef.current) {
      analyserRef.current.disconnect();
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

        // Transcribe with automatic language detection
        const transcribeResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/transcribe`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              audio_base64: base64Audio,
              encoding: "audio/wav",
              sample_rate: 16000,
              language: "unknown", // Auto-detect language
            }),
          }
        );

        if (!transcribeResponse.ok) {
          throw new Error("Transcription failed");
        }

        const transcribeData = await transcribeResponse.json();
        const transcription = transcribeData.transcription || "";
        const language = transcribeData.detected_language || "english";

        console.log(`[Language Detected] ${language} - Transcription: ${transcription}`);

        if (!transcription) {
          addMessage("system", uiText.couldNotUnderstand);
          setIsProcessing(false);
          return;
        }

        // Store detected language and update UI language
        setDetectedLanguage(language);
        if (language !== currentLanguage) {
          changeLanguage(language);
          if (onLanguageChange) {
            onLanguageChange(language);
          }
          console.log(`[Language Changed] UI language changed to: ${language}`);
        }

        // Add user message
        addMessage("user", transcription);

        // Process with backend using detected language
        await processUserMessage(transcription, language);
      };
    } catch (error) {
      console.error("Error processing audio:", error);
      addMessage("system", uiText.somethingWrong);
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

  const processUserMessage = async (text: string, language?: string) => {
    setIsProcessing(true);

    try {
      // Use detected language or fall back to stored/default
      const langToUse = language || detectedLanguage;

      // If we have a pending symptom, combine it with the new location
      let queryText = text;
      if (pendingSymptom) {
        queryText = `${pendingSymptom} in ${text}`;
        console.log(`[Location Combined] "${pendingSymptom}" + "${text}" = "${queryText}"`);
        setPendingSymptom(null); // Clear pending symptom
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/find-doctors`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            symptom_text: queryText,
            language: langToUse,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to find doctors");
      }

      const data = await response.json();
      
      // Add assistant response
      addMessage("assistant", data.recommendation);

      // Check if location is needed
      if (data.needs_location) {
        setPendingSymptom(text); // Store the original symptom
        console.log(`[Location Needed] Stored symptom: "${text}"`);
        return; // Don't proceed further
      }

      // Show doctors
      if (data.doctors && data.doctors.length > 0) {
        onDoctorsFound({
          ...data,
          symptom_text: queryText,
        });
      } else if (!data.needs_location) {
        addMessage("system", uiText.noDoctorsFound);
      }
    } catch (error) {
      console.error("Error:", error);
      addMessage("system", uiText.somethingWrong);
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
    <div className="flex flex-col h-[600px] bg-white rounded-xl border border-gray-200 shadow-xl hover:shadow-2xl transition-shadow duration-500">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-5 rounded-t-xl border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-xl">🏥</span>
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 tracking-tight">AayuCare</h2>
            <p className="text-xs text-gray-600">Healthcare Search Assistant</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
        {messages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400 }}
              className={`max-w-[80%] rounded-xl p-4 shadow-sm ${
                message.type === "user"
                  ? "bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-br-none"
                  : message.type === "assistant"
                  ? "bg-gradient-to-br from-gray-100 to-gray-50 text-gray-900 rounded-bl-none border border-gray-200"
                  : "bg-gradient-to-br from-blue-50 to-blue-100/50 text-gray-700 border border-blue-200/50"
              }`}
            >
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
              <p className="text-xs mt-2 opacity-60">
                {message.timestamp.toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </motion.div>
          </motion.div>
        ))}
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-gradient-to-r from-gray-100 to-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex gap-2">
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
                  className="w-2 h-2 bg-gray-400 rounded-full"
                />
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
                  className="w-2 h-2 bg-gray-500 rounded-full"
                />
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                  className="w-2 h-2 bg-gray-600 rounded-full"
                />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-5 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 rounded-b-xl">
        {/* Recording Indicator */}
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-4 bg-white rounded-xl border border-red-200 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="w-3 h-3 bg-red-500 rounded-full"
                  />
                  <span className="text-sm font-medium text-gray-900">{uiText.recording}</span>
                  <span className="text-xs text-gray-500">
                    {Math.floor(recordingTime / 60)}:{String(recordingTime % 60).padStart(2, '0')}
                  </span>
                </div>
                
                {/* Audio Level Visualizer */}
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        height: audioLevel > (i * 20) ? `${Math.max(4, (audioLevel / 5))}px` : '4px',
                        backgroundColor: audioLevel > (i * 20) ? '#ef4444' : '#d1d5db',
                      }}
                      transition={{ duration: 0.1 }}
                      className="w-1 rounded-full"
                      style={{ minHeight: '4px', maxHeight: '24px' }}
                    />
                  ))}
                </div>
              </div>
              
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: audioLevel / 100 }}
                className="mt-2 h-1 bg-gradient-to-r from-red-400 to-red-600 rounded-full origin-left"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: isRecording ? 1 : 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            className={`relative flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all shadow-md ${
              isRecording
                ? "bg-red-600 shadow-red-200"
                : "bg-gradient-to-br from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 shadow-gray-200"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title={isRecording ? "Stop recording" : "Start voice input"}
          >
            {isRecording && (
              <motion.div
                className="absolute inset-0 rounded-xl bg-red-400"
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              />
            )}
            <span className="text-xl relative z-10">{isRecording ? "⏹️" : "🎤"}</span>
          </motion.button>
          <motion.div
            whileFocus={{ scale: 1.01 }}
            className="flex-1"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                isRecording 
                  ? uiText.listening
                  : isProcessing 
                  ? uiText.processing
                  : uiText.placeholder
              }
              disabled={isProcessing || isRecording}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 disabled:bg-gray-100 text-sm text-gray-900 placeholder:text-gray-400 transition-all shadow-sm hover:shadow-md ${
                isRecording ? 'border-red-300 bg-red-50/30' : 'border-gray-300 bg-white'
              }`}
            />
          </motion.div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isProcessing || isRecording}
            className="flex-shrink-0 w-11 h-11 bg-gradient-to-br from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 rounded-xl flex items-center justify-center transition-all shadow-md shadow-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-xl">📤</span>
          </motion.button>
        </div>
        {!isRecording && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xs text-gray-500 mt-3 text-center"
          >
            {isProcessing ? (
              <>{uiText.processingVoice}</>
            ) : (
              <>
                <span className="inline-block mr-1">🎤</span>
                {uiText.clickMic}
              </>
            )}
          </motion.p>
        )}
      </div>
    </div>
  );
}

