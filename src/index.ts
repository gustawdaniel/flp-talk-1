import { z } from "zod";
import { generateText, type CoreMessage, tool } from "ai";
import { openai } from "@ai-sdk/openai";
import { trackDown, whack } from "./tools";
import {YouTubeTranscriptExtractor} from "./yt-transcript-extractor.ts";
import {ErrorCode, McpError} from "@modelcontextprotocol/sdk/types.js";

let chatHistory: CoreMessage[] = [
    {
        role: "system",
        content:
            "You are a helpful assistant.",
    },
    {
        role: "user",
        content: "give me full transcript of https://www.youtube.com/watch?v=0VLAoVGf_74&t=133s",
    },
];

const extractor = new YouTubeTranscriptExtractor()

let { text, toolCalls, toolResults } = await generateText({
    model: openai("gpt-4o"),
    messages: chatHistory,
    maxSteps: 3,
    tools: {
        getTranscript: tool({
            description:
                "Extract transcript from a YouTube video URL or ID",
            parameters: z.object({
                url: z.string()
                    .describe("YouTube video URL or ID"),
                lang: z.string()
                    .describe("Language code for transcript (e.g., 'ko', 'en')")
                    .default('en')
            }),
            execute: async (arg) => {


                const { url: input, lang = "en" } = arg;

                if (!input || typeof input !== 'string') {
                    throw new McpError(
                        ErrorCode.InvalidParams,
                        'URL parameter is required and must be a string'
                    );
                }

                if (lang && typeof lang !== 'string') {
                    throw new McpError(
                        ErrorCode.InvalidParams,
                        'Language code must be a string'
                    );
                }

                try {
                    const videoId = extractor.extractYoutubeId(input);
                    console.error(`Processing transcript for video: ${videoId}`);

                    const transcript = await extractor.getTranscript(videoId, lang);
                    console.error(`Successfully extracted transcript (${transcript.length} chars)`);

                    return {
                        toolResult: {
                            content: [{
                                type: "text",
                                text: transcript,
                                metadata: {
                                    videoId,
                                    language: lang,
                                    timestamp: new Date().toISOString(),
                                    charCount: transcript.length
                                }
                            }],
                            isError: false
                        }
                    };
                } catch (error) {
                    console.error('Transcript extraction failed:', error);

                    if (error instanceof McpError) {
                        throw error;
                    }

                    throw new McpError(
                        ErrorCode.InternalError,
                        `Failed to process transcript: ${(error as Error).message}`
                    );
                }


            },
        })
    },
});

console.log(text);
