# Language Learning Application

This application is designed to help users learn languages by transcribing videos, translating them, and practicing with auto-generated questions.

## Features

- Video transcription from YouTube URLs
- Translation to multiple target languages
- Automatic question generation from translated content
- Interactive learning mode with feedback on answers
- Score tracking

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed on your machine

### Installation

1. Clone the repository
2. Navigate to the project directory:
```
cd front2
```
3. Install dependencies:
```
bun install
```

### Running the Application

To start the development server:
```
bun run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### Building for Production

To build the application for production:
```
bun run build
```

## Application Flow

1. **Transcription**: Provide a YouTube URL to get a transcript
2. **Translation**: Select a target language to translate the transcript
3. **Question Generation**: Generate questions based on the translated text
4. **Interactive Learning**: Answer questions and receive immediate feedback

## Technologies Used

- React.js
- TypeScript
- Webpack
- Bun (as the JavaScript runtime)
