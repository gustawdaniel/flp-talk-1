import {FastifyRequest, RouteGenericInterface} from "fastify";
import {z} from "zod";
import { getRedisClient } from "../redis";
import {type CoreMessage, generateText} from "ai";
import {openai} from "@ai-sdk/openai";

interface TranslateResults {
    text: string;
}

interface TranslateRouteGeneric extends RouteGenericInterface {
    QueryString: {
        lang: string,
    },
    Body: {
        text: string,
    }
}

const translateQuerySchema = z.object({
    lang: z.string().default('english'),
});
const translateBodySchema = z.object({
    text: z.string().default('hello world'),
});

export async function translate(req: FastifyRequest<TranslateRouteGeneric>): Promise<TranslateResults> {
    const body = translateBodySchema.parse(req.body);
    const query = translateQuerySchema.parse(req.query);

    const red = await getRedisClient();

    const key = `translate:${JSON.stringify({query,body})}`;
    const out = await red.get(key);
    if(out) {
        console.log("Cache hit")
        return JSON.parse(out);
    }

    // get translation

    let chatHistory: CoreMessage[] = [
        {
            role: "system",
            content:
                "You are a helpful translator that responding ONLY with translations without commenting, explain in format that have ONLY pure translation.",
        },
        {
            role: "user",
            content: `give me translation of following text to ${query.lang}\n\n${body.text}`,
        },
    ];

    let { text, toolCalls, toolResults } = await generateText({
        model: openai("gpt-4o"),
        messages: chatHistory,
        maxSteps: 3,
    })

    // save cache

    const res: TranslateResults = {
        text
    };

    await red.set(key, JSON.stringify(res));

    return res

}