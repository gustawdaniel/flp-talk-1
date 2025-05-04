import {FastifyRequest, RouteGenericInterface} from "fastify";
import {z} from "zod";
import { getRedisClient } from "../redis";
import {type CoreMessage, generateText} from "ai";
import {openai} from "@ai-sdk/openai";
import {normalizeLLMToJson} from "../services/textNormalizer";

// **Request Body:**
// ```
// {
//   "question": "string",
//   "correctAnswer": "string",
//   "userAnswer": "string"
// }
// ```
//
// **Response:**
// ```json
// {
//   "result": true/false,
//   "message": "Explanation of why the answer is correct/incorrect"
// }
// ```

interface CheckAnswerResults {
    result: boolean;
    message: string;
}

interface CheckAnswerRouteGeneric extends RouteGenericInterface {
    Body: {
        question: string
        correctAnswer: string
        userAnswer: string
    }
}

const checkAnswerBodySchema = z.object({
    question: z.string().default('how old are you?'),
    correctAnswer: z.string().default('5 years old'),
    userAnswer: z.string().default('3'),
});

export async function checkAnswer(req: FastifyRequest<CheckAnswerRouteGeneric>): Promise<CheckAnswerResults> {
    const body = checkAnswerBodySchema.parse(req.body);

    const red = await getRedisClient();

    const key = `checkAnswer:${JSON.stringify({body})}`;
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
                "You are a helpful assistant that grading answers correctness. No generate any explanations, but only JSON according to asked schema.",
        },
        //
        // {
        //     "result": true/false,
        //     "message": "Explanation of why the answer is correct/incorrect"
        // }

        {
            role: "user",
            content: `I have the following question:\n\n${body.question}\n\nCorrect answer for this question is\n\n${body.correctAnswer}\n\nUser gave answer\n\n${body.userAnswer}. I need your opinion if this answer can be clasified as correct or no. Additionally i need you comment that explain your decision. Please formulate answer in json format:\n\n{"result": true, "message": "Explanation of why the answer is correct/incorrect"}`,
        },
    ];

    let { text, toolCalls, toolResults } = await generateText({
        model: openai("gpt-4o"),
        messages: chatHistory,
        maxSteps: 3,
    })

    // save cache
    const json = normalizeLLMToJson(text)

    const res = JSON.parse(json) as unknown as CheckAnswerResults;

    await red.set(key, JSON.stringify(res));

    return res

}