/**
 * Language management hook with automatic translation
 */

import { useState, useEffect, useCallback } from 'react';

// Supported languages
export const SUPPORTED_LANGUAGES = {
  english: 'English',
  hindi: 'हिंदी',
  bengali: 'বাংলা',
  tamil: 'தமிழ்',
  telugu: 'తెలుగు',
  marathi: 'मराठी',
  gujarati: 'ગુજરાતી',
  kannada: 'ಕನ್ನಡ',
  malayalam: 'മലയാളം',
  punjabi: 'ਪੰਜਾਬੀ',
  odia: 'ଓଡ଼ିଆ',
};

// Translation cache
const translationCache: Map<string, string> = new Map();

export function useLanguage() {
  const [currentLanguage, setCurrentLanguage] = useState<string>('english');
  const [translations, setTranslations] = useState<Map<string, string>>(new Map());

  // Translate text using backend API
  const translateText = useCallback(async (text: string, targetLanguage?: string): Promise<string> => {
    const lang = targetLanguage || currentLanguage;
    
    // Return original if English
    if (lang === 'english' || !text || text.trim() === '') {
      return text;
    }

    // Check cache
    const cacheKey = `${text}_${lang}`;
    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey)!;
    }

    try {
      const formData = new FormData();
      formData.append('text', text);
      formData.append('target_language', lang);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/translate`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        const translatedText = data.translated_text || text;
        
        // Cache the result
        translationCache.set(cacheKey, translatedText);
        
        return translatedText;
      }
    } catch (error) {
      console.error('Translation error:', error);
    }

    return text;
  }, [currentLanguage]);

  // Batch translate multiple texts
  const translateBatch = useCallback(async (
    texts: Record<string, string>,
    targetLanguage?: string
  ): Promise<Record<string, string>> => {
    const lang = targetLanguage || currentLanguage;
    
    if (lang === 'english') {
      return texts;
    }

    const translated: Record<string, string> = {};
    
    // Translate all texts in parallel
    const promises = Object.entries(texts).map(async ([key, text]) => {
      const translatedText = await translateText(text, lang);
      return { key, translatedText };
    });

    const results = await Promise.all(promises);
    
    results.forEach(({ key, translatedText }) => {
      translated[key] = translatedText;
    });

    return translated;
  }, [currentLanguage, translateText]);

  // Set language and update
  const changeLanguage = useCallback((language: string) => {
    if (language in SUPPORTED_LANGUAGES) {
      setCurrentLanguage(language);
      // Store in localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('aayucare_language', language);
      }
    }
  }, []);

  // Load language from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('aayucare_language');
      if (savedLanguage && savedLanguage in SUPPORTED_LANGUAGES) {
        setCurrentLanguage(savedLanguage);
      }
    }
  }, []);

  return {
    currentLanguage,
    changeLanguage,
    translateText,
    translateBatch,
    supportedLanguages: SUPPORTED_LANGUAGES,
  };
}

