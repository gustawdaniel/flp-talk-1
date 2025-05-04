# API Documentation

## Transcription API

### Get Transcript
**Endpoint:** `GET /transcript`

**Parameters:**
- `url` (required): URL of the content to transcribe

**Response:**
```json
{
  "text": "Transcribed content in UTF-8"
}
```

## Translation API

### Translate Text
**Endpoint:** `POST /translate`

**Parameters:**
- `lang` (required): Target language code (e.g., "es" for Spanish)

**Request Body:**
```
{
  "text": <utf-8>
}
```

**Response:**
```
Translated text content
```

## Question Generation API

### Generate Questions
**Endpoint:** `POST /build_questions`

**Parameters:**
- `count` (required): Number of questions to generate

**Request Body:**
```
Text content to generate questions from
```

**Response:**
```json
{
  "questions": [
    {
      "question": "Generated question text",
      "answer": "Expected answer text"
    },
    ...
  ]
}
```

## Answer Verification API

### Check Answer
**Endpoint:** `POST /check_answers`

**Request Body:**
```
{
  "question": "string",
  "correctAnswer": "string",
  "userAnswer": "string"
}
```

**Response:**
```json
{
  "result": true/false,
  "message": "Explanation of why the answer is correct/incorrect"
}
```
