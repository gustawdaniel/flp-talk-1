
import { getSubtitles } from 'youtube-captions-scraper';
import {ErrorCode, McpError} from "@modelcontextprotocol/sdk/types.js";

interface TranscriptLine {
    text: string;
    start: number;
    dur: number;
}

export class YouTubeTranscriptExtractor {
    /**
     * Extracts YouTube video ID from various URL formats or direct ID input
     */
    extractYoutubeId(input: string): string {
        if (!input) {
            throw new McpError(
                ErrorCode.InvalidParams,
                'YouTube URL or ID is required'
            );
        }

        // Handle URL formats
        try {
            const url = new URL(input);
            if (url.hostname === 'youtu.be') {
                return url.pathname.slice(1);
            } else if (url.hostname.includes('youtube.com')) {
                const videoId = url.searchParams.get('v');
                if (!videoId) {
                    throw new McpError(
                        ErrorCode.InvalidParams,
                        `Invalid YouTube URL: ${input}`
                    );
                }
                return videoId;
            }
        } catch (error) {
            // Not a URL, check if it's a direct video ID
            if (!/^[a-zA-Z0-9_-]{11}$/.test(input)) {
                throw new McpError(
                    ErrorCode.InvalidParams,
                    `Invalid YouTube video ID: ${input}`
                );
            }
            return input;
        }

        throw new McpError(
            ErrorCode.InvalidParams,
            `Could not extract video ID from: ${input}`
        );
    }

    /**
     * Retrieves transcript for a given video ID and language
     */
    async getTranscript(videoId: string, lang: string): Promise<string> {
        try {
            const transcript = await getSubtitles({
                videoID: videoId,
                lang: lang,
            });

            return this.formatTranscript(transcript);
        } catch (error) {
            console.error('Failed to fetch transcript:', error);
            throw new McpError(
                ErrorCode.InternalError,
                `Failed to retrieve transcript: ${(error as Error).message}`
            );
        }
    }

    /**
     * Formats transcript lines into readable text
     */
    private formatTranscript(transcript: TranscriptLine[]): string {
        return transcript
            .map(line => line.text.trim())
            .filter(text => text.length > 0)
            .join(' ');
    }
}