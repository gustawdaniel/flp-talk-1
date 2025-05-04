import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateQuestions } from '../api';
import { useAppContext } from '../AppContext';

const QuestionGenerationScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const navigate = useNavigate();
  const { translatedText, setQuestions } = useAppContext();

  useEffect(() => {
    if (!translatedText) {
      navigate('/translation');
    }
  }, [translatedText, navigate]);

  const handleGenerateQuestions = async () => {
    setLoading(true);
    setError('');

    try {
      const generatedQuestions = await generateQuestions(translatedText, questionCount);
      setQuestions(generatedQuestions);
      navigate('/learning');
    } catch (err) {
      setError('Failed to generate questions. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Step 3: Question Generation</h1>
      <div>
        <h2>Translated Text:</h2>
        <div style={{
          maxHeight: '200px',
          overflowY: 'auto',
          border: '1px solid #ddd',
          padding: '10px',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {translatedText || 'No translated text available. Go back to the translation step.'}
        </div>

        <label htmlFor="question-count">Number of Questions:</label>
        <input
          id="question-count"
          type="number"
          min="1"
          max="10"
          value={questionCount}
          onChange={(e) => setQuestionCount(Number(e.target.value))}
          disabled={loading || !translatedText}
        />

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <div className="step-navigation">
          <button onClick={() => navigate('/translation')}>Back</button>
          <button
            onClick={handleGenerateQuestions}
            disabled={loading || !translatedText}
          >
            {loading ? 'Generating...' : 'Generate Questions'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionGenerationScreen;
