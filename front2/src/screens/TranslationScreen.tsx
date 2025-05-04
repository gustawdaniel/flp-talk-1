import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { translateText } from '../api';
import { useAppContext } from '../AppContext';

const LANGUAGE_OPTIONS = [
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'ru', label: 'Russian' }
];

const TranslationScreen: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('es');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { transcript, setTranslatedText } = useAppContext();

  const handleTranslate = async () => {
    if (!transcript) {
      navigate('/transcription');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const translated = await translateText(transcript, selectedLanguage);
      setTranslatedText(translated);
      navigate('/questions');
    } catch (err) {
      setError('Failed to translate the text. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Step 2: Translation</h1>
      <div>
        <h2>Original Transcript:</h2>
        <div style={{
          maxHeight: '200px',
          overflowY: 'auto',
          border: '1px solid #ddd',
          padding: '10px',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {transcript || 'No transcript available. Go back to transcription step.'}
        </div>

        <label htmlFor="language-select">Select Target Language:</label>
        <select
          id="language-select"
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          disabled={loading || !transcript}
        >
          {LANGUAGE_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <div className="step-navigation">
          <button onClick={() => navigate('/transcription')}>Back</button>
          <button
            onClick={handleTranslate}
            disabled={loading || !transcript}
          >
            {loading ? 'Translating...' : 'Translate'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TranslationScreen;
