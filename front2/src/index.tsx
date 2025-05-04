import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import screens
import TranscriptionScreen from './screens/TranscriptionScreen';
import TranslationScreen from './screens/TranslationScreen';
import QuestionGenerationScreen from './screens/QuestionGenerationScreen';
import InteractiveLearningScreen from './screens/InteractiveLearningScreen';

// Import context
import { AppProvider } from './AppContext';

// Import CSS
import './assets/styles.css';

const App = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/transcription" element={<TranscriptionScreen />} />
          <Route path="/translation" element={<TranslationScreen />} />
          <Route path="/questions" element={<QuestionGenerationScreen />} />
          <Route path="/learning" element={<InteractiveLearningScreen />} />
          <Route path="*" element={<Navigate to="/transcription" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
} else {
  console.error('Root element not found');
}
