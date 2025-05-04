import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTranscript } from '../api';
import { useAppContext } from '../AppContext';

const TranscriptionScreen: React.FC = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setTranscript } = useAppContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const text = await getTranscript(url);
      setTranscript(text);
      navigate('/translation');
    } catch (err) {
      setError('Failed to get transcript. Please check the URL and try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Step 1: Video Transcription</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="youtube-url">YouTube URL:</label>
          <input
            id="youtube-url"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            disabled={loading}
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Summarize'}
        </button>
      </form>
    </div>
  );
};

export default TranscriptionScreen;
