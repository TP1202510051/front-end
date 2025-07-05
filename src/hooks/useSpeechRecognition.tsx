// src/hooks/useSpeechRecognition.ts
import { useEffect, useRef, useState } from 'react';

interface UseSpeechRecognitionOptions {
  lang?: string;
  interimResults?: boolean;
  continuous?: boolean;
}

export const useSpeechRecognition = ({
  lang = 'es-PE',
  interimResults = false,
  continuous = false,
}: UseSpeechRecognitionOptions = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognitionConstructor =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionConstructor) {
      console.error('SpeechRecognition API not supported in this browser.');
      return;
    }

    const recognition: SpeechRecognition = new SpeechRecognitionConstructor();
    recognition.lang = lang;
    recognition.interimResults = interimResults;
    recognition.continuous = continuous;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        finalTranscript += event.results[i][0].transcript;
      }
      setTranscript(finalTranscript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, [lang, interimResults, continuous]);

  const startListening = () => {
    recognitionRef.current?.start();
    setIsListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
  };

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
  };
};
