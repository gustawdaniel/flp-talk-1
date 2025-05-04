import {FastifyRequest, RouteGenericInterface} from "fastify";
import {z} from "zod";
import { getRedisClient } from "../redis";
import {type CoreMessage, generateText} from "ai";
import {openai} from "@ai-sdk/openai";
import {normalizeLLMToJson} from "../services/textNormalizer";

type BuildQuestionsResults =
    {
        "question": string
        "answer": string
    }[]

interface BuildFinalQuestionsResults {
    questions: BuildQuestionsResults
}

interface BuildQuestionsRouteGeneric extends RouteGenericInterface {
    QueryString: {
        lang: string,
    },
    Body: {
        text: string,
    }
}

const buildQuestionsQuerySchema = z.object({
    count: z.coerce.number().default(3),
});
const buildQuestionsBodySchema = z.object({
    text: z.string().default('hello world'),
});

export async function buildQuestions(req: FastifyRequest<BuildQuestionsRouteGeneric>): Promise<BuildFinalQuestionsResults> {
    const body = buildQuestionsBodySchema.parse(req.body);
    const query = buildQuestionsQuerySchema.parse(req.query);

    const red = await getRedisClient();

    const key = `buildQuestions:${JSON.stringify({query,body})}`;
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
                "You are a helpful assistant that respond in JSON only. No generate any explanations, but only JSON according to asked schema.",
        },
        {
            role: "user",
            content: `give me ${query.count} questions and answers that checking if reader understand presented text. Respond in format: [{
 question: "",
 answer: ""
}, {
 question: "",
 answer: ""
}, ...] of following text\n\n${body.text}`,
        },
    ];

    let { text, toolCalls, toolResults } = await generateText({
        model: openai("gpt-4o"),
        messages: chatHistory,
        maxSteps: 3,
    })

    // save cache
const json = normalizeLLMToJson(text)

    const res = {questions: JSON.parse(json) as unknown as BuildQuestionsResults } as BuildFinalQuestionsResults;

    await red.set(key, JSON.stringify(res));

    return res

}