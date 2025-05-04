const API_URL = "http://127.0.0.1:4747"; // Change this to your actual API URL
// const API_URL = "https://42f8-185-181-209-142.ngrok-free.app";
import { Api } from "./generated/api-client";
import type { components } from "./generated/api-types";

const isTesting = true;

export type Question = components["schemas"]["Question"];

// Initialize API client
const apiClient = new Api({
  baseUrl: API_URL,
  baseApiParams: {
    headers: {
      "Content-Type": "application/json",
    },
  },
});

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


export async function getTranscript(youtubeUrl: string): Promise<string> {
  if (isTesting) {
    return mockTranscript;
  }

  const response = await apiClient.transcript.transcriptList({
    url: youtubeUrl,
  });
  return response.text || ""; // TODO: remove ""
}

export async function translateText(
  text: string,
  targetLanguage: string
): Promise<string> {
  if (isTesting) {
    return `[${targetLanguage} translation] ${text}`;
  }

  const response = await apiClient.translate.translateCreate(
    {
      lang: targetLanguage,
    },
    {
      text,
    }
  );
  return response;
}

export async function generateQuestions(text: string, count: number): Promise<Question[]> {
  if (isTesting) {
    return mockQuestions.slice(0, Math.min(count, mockQuestions.length));
  }

  const response = await apiClient.buildQuestions.buildQuestionsCreate(
    {
      count,
    },
    {
      text,
    }
  );
  return response.questions || [];
}


export async function checkAnswer(
  question: string,
  correctAnswer: string,
  userAnswer: string
): Promise<{ result: boolean; message: string }> {
  if (isTesting) {
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

  return await apiClient.checkAnswer.checkAnswerCreate({
    question,
    correctAnswer,
    userAnswer,
  });
}
