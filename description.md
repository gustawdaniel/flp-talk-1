# Language Learning Application Flow

## Step 1: Video Transcription
- User provides a YouTube URL via input field
- User clicks the "Summarize" button
- Application sends request to `/transcript` endpoint
- Application receives text transcript

## Step 2: Translation
- User selects target language from dropdown menu
- User clicks the "Translate" button
- Application sends request to `/translate` endpoint with selected language
- Application displays translated text

## Step 3: Question Generation
- Application automatically generates questions about the translated content
- Application sends request to `/build_questions` endpoint
- Questions are prepared for user interaction

## Step 4: Interactive Learning
- Questions are presented to the user one-by-one
- User submits answers through input field
- Application validates answers via `/check_answers` endpoint
- For incorrect answers, feedback is displayed to the user
- Application tracks progress and calculates scores throughout the session
