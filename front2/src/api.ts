import { json } from "react-router-dom";

// const API_URL = "https://localhost:3001"; // Change this to your actual API URL
const API_URL = "https://42f8-185-181-209-142.ngrok-free.app";
const isTesting = false;
export interface Question {
  question: string;
  answer: string;
}

export interface CheckAnswerResult {
  result: boolean;
  message: string;
}

// Mock data for testing
const mockTranscript = `This is a mock transcript for testing purposes.
It contains multiple lines of text that can be used for generating questions.
The quick brown fox jumps over the lazy dog.
Machine learning is a method of data analysis that automates analytical model building.`;

const mockQuestions: Question[] = [
  {
    question: "What is the color of the fox in the mock transcript?",
    answer: "Brown",
  },
  {
    question: "What jumps over the lazy dog?",
    answer: "The quick brown fox",
  },
  {
    question: "What is machine learning described as in the transcript?",
    answer:
      "A method of data analysis that automates analytical model building",
  },
];

// Fetches transcript from a YouTube URL
export async function getTranscript(youtubeUrl: string): Promise<string> {
  if (isTesting) {
    return mockTranscript;
  }

  const response = await fetch(
    `${API_URL}/transcript?url=${encodeURIComponent(youtubeUrl)}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch transcript");
  }
  const data = await response.json();
  const text = data.text;

  return text;
}

// Translates text to target language
export async function translateText(
  text: string,
  targetLanguage: string
): Promise<string> {
  if (isTesting) {
    // Simple mock that just adds a prefix to simulate translation
    return `[${targetLanguage} translation] ${text}`;
  }

  const response = await fetch(
    `${API_URL}/translate?lang=${encodeURIComponent(targetLanguage)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: text }),
    }
  );
  if (!response.ok) {
    throw new Error("Failed to translate text");
  }
  const data = await response.json();
  return data.text;
}

// Generates questions from text
export async function generateQuestions(
  text: string,
  count: number
): Promise<Question[]> {
  if (isTesting) {
    // Return a subset of mock questions based on count
    return mockQuestions.slice(0, Math.min(count, mockQuestions.length));
  }

  const response = await fetch(`${API_URL}/build_questions?count=${count}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text: text }),
  });
  if (!response.ok) {
    throw new Error("Failed to generate questions");
  }
  const data = await response.json();
  return data.questions;
}

// Checks user's answer against correct answer
export async function checkAnswer(
  question: string,
  correctAnswer: string,
  userAnswer: string
): Promise<CheckAnswerResult> {
  if (isTesting) {
    // Simple mock implementation that checks if answers contain same words
    const normalizedCorrect = correctAnswer.toLowerCase().trim();
    const normalizedUser = userAnswer.toLowerCase().trim();

    const isCorrect =
      normalizedUser.includes(normalizedCorrect) ||
      normalizedCorrect.includes(normalizedUser);

    return {
      result: isCorrect,
      message: isCorrect
        ? "Your answer is correct!"
        : "Mock message why the answer is incorrect",
    };
  }

  const response = await fetch(`${API_URL}/check_answer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      question,
      correctAnswer,
      userAnswer,
    }),
  });
  if (!response.ok) {
    throw new Error("Failed to check answer");
  }
  return await response.json();
}
