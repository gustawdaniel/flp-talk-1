import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkAnswer } from '../api';
import { useAppContext } from '../AppContext';

const InteractiveLearningScreen: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ message: string; isCorrect: boolean } | null>(null);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [lastQuestionFeedback, setLastQuestionFeedback] = useState<{ message: string; isCorrect: boolean; answer: string } | null>(null);
  const navigate = useNavigate();
  const { questions, score, setScore } = useAppContext();

  useEffect(() => {
    if (questions.length === 0) {
      navigate('/questions');
    }
  }, [questions, navigate]);

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) {
      return;
    }

    setLoading(true);

    try {
      const currentQuestion = questions[currentQuestionIndex];
      const result = await checkAnswer(
        currentQuestion.question,
        currentQuestion.answer,
        userAnswer
      );

      if (result.result) {
        setScore(score + 1);
      }

      const newFeedback = {
        message: result.message,
        isCorrect: result.result
      };

      setFeedback(newFeedback);

      if (currentQuestionIndex >= questions.length - 1) {
        setLastQuestionFeedback({
          ...newFeedback,
          answer: currentQuestion.answer
        });
        setCompleted(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setUserAnswer('');
      setFeedback(null);
    }
  };

  const handleRestart = () => {
    setScore(0);
    navigate('/transcription');
  };

  if (questions.length === 0) {
    return (
      <div className="container">
        <h1>No questions available</h1>
        <p>Please generate questions first.</p>
        <button onClick={() => navigate('/questions')}>Go to Questions Generation</button>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="container">
        <h1>Learning Completed!</h1>
        <p>Your final score: {score} out of {questions.length}</p>

        {lastQuestionFeedback && (
          <div className="last-question-feedback">
            <h3>Feedback for the last question:</h3>
            <div className={`feedback ${lastQuestionFeedback.isCorrect ? 'correct' : 'incorrect'}`}>
              {lastQuestionFeedback.message}
              {!lastQuestionFeedback.isCorrect && (
                <p>Correct answer: {lastQuestionFeedback.answer}</p>
              )}
            </div>
          </div>
        )}

        <button onClick={handleRestart}>Start Over</button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="container">
      <h1>Step 4: Interactive Learning</h1>
      <div>
        <h2>Question {currentQuestionIndex + 1} of {questions.length}</h2>
        <div className="question-item">
          <p>{currentQuestion.question}</p>
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Type your answer here"
            disabled={loading || feedback !== null}
          />

          {feedback && (
            <div className={`feedback ${feedback.isCorrect ? 'correct' : 'incorrect'}`}>
              {feedback.message}
              {!feedback.isCorrect && (
                <p>Correct answer: {currentQuestion.answer}</p>
              )}
            </div>
          )}

          {feedback === null ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={loading || !userAnswer.trim()}
            >
              {loading ? 'Checking...' : 'Submit Answer'}
            </button>
          ) : currentQuestionIndex < questions.length - 1 ? (
            <button onClick={handleNextQuestion}>Next Question</button>
          ) : (
            <button onClick={() => setCompleted(true)}>See Results</button>
          )}
        </div>

        <div className="step-navigation">
          <button onClick={() => navigate('/questions')}>Back to Questions</button>
          <div>Score: {score} / {questions.length}</div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveLearningScreen;
