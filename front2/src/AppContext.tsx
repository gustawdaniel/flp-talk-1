import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Question } from './api';

interface AppContextType {
  transcript: string;
  setTranscript: (transcript: string) => void;
  translatedText: string;
  setTranslatedText: (translatedText: string) => void;
  questions: Question[];
  setQuestions: (questions: Question[]) => void;
  score: number;
  setScore: (score: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [transcript, setTranscript] = useState<string>('');
  const [translatedText, setTranslatedText] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [score, setScore] = useState<number>(0);

  return (
    <AppContext.Provider
      value={{
        transcript,
        setTranscript,
        translatedText,
        setTranslatedText,
        questions,
        setQuestions,
        score,
        setScore
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
