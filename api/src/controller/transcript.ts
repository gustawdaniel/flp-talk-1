import { z } from "zod";
import { generateText, type CoreMessage, tool } from "ai";
import { openai } from "@ai-sdk/openai";
import {YouTubeTranscriptExtractor} from "../services/yt-transcript-extractor";
import {ErrorCode, McpError} from "@modelcontextprotocol/sdk/types.js";
import {FastifyRequest, RouteGenericInterface} from "fastify";
import {getRedisClient} from "../redis";

interface TranscriptResults {
    text: string;
}

interface TranscriptRouteGeneric extends RouteGenericInterface {
    QueryString: {
        url: string,
    },
}

const transcriptParamsSchema = z.object({
    url: z.string().default('https://www.youtube.com/watch?v=0VLAoVGf_74&t=133s'),
});

export async function transcript(req: FastifyRequest<TranscriptRouteGeneric>): Promise<TranscriptResults> {
    const params = transcriptParamsSchema.parse(req.query);

    const red = await getRedisClient();

    const out = await red.get(`transcript:${JSON.stringify(req.params)}`);
    if(out) {
        console.log("Cache hit")
        return JSON.parse(out);
    }

    const extractor = new YouTubeTranscriptExtractor()

    let chatHistory: CoreMessage[] = [
        {
            role: "system",
            content:
                "You are a helpful assistant.",
        },
        {
            role: "user",
            content: `give me full transcript of ${params.url}`,
        },
    ];

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

    const res: TranscriptResults = {
        text
    };

    await red.set(`transcript:${JSON.stringify(req.params)}`, JSON.stringify(res));

    return res
}