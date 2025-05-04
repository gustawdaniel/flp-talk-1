import fastify, {
    FastifyInstance, FastifyPluginOptions,
    FastifyReply,
    FastifyRequest, RouteShorthandOptions,
} from 'fastify';
import {config} from "./config";
import cors from '@fastify/cors';
import fastifySensible from '@fastify/sensible';
import {FastifyRouteConfig} from "fastify/types/route";
import jwt from 'jsonwebtoken';
import pJson from '../package.json';
import {transcript} from "./controller/transcript";
import {translate} from "./controller/translate";
import * as fs from "node:fs";
import {buildQuestions} from "./controller/build_questions";
import {checkAnswer} from "./controller/check_answers";

interface TokenPayload {
    id: number,
    iat: number,
    exp: number
}

interface UserProjection {
    id: number
}

declare module 'fastify' {
    interface FastifyRequest {
        user: UserProjection | null;
    }
}

// export function verifyToken(token: string):  UserProjection {
//     const payload = jwt.verify(token, config.JWT_SECRET) as TokenPayload;
//
//     return {
//         id: payload.id,
//     }
// }

function isProtected(config: FastifyRouteConfig): boolean {
    return (
        Boolean('isProtected' in config && config.isProtected)
    );
}

function getErrorMessage(error: unknown): string {
    if(error instanceof Error) {
        return error.message;
    }
    return 'Unknown error';
}


function version(_req: FastifyRequest, res: FastifyReply): void {
    const readme = fs.readFileSync('./README.md', 'utf8')
    //
    // res.code(200).send({
    //     name: pJson.name,
    //     version: pJson.version,
    // });

    return readme;

};


// const PROTECTED: RouteShorthandOptions = { config: { isProtected: true } };
const PUBLIC: RouteShorthandOptions = { config: { isProtected: false } };

function router(
    server: FastifyInstance,
    _options: FastifyPluginOptions,
    next: () => void,
) {
    server.get('/', PUBLIC, version);
    server.get('/transcript', PUBLIC, transcript);
    server.post('/translate', PUBLIC, translate);
    server.post('/build_questions', PUBLIC, buildQuestions);
    server.post('/check_answer', PUBLIC, checkAnswer);


    next();
}

export function getFastifyInstance(): FastifyInstance {
    const app = fastify({
        logger: config.NODE_ENV === 'development',
        bodyLimit: 100 * 1048576,
    });

    app.register(cors, {});
    app.register(fastifySensible);

    app.addHook(
        'onRequest',
        async (
            request: FastifyRequest<{ Headers: { authorization?: string } }>,
            reply: FastifyReply,
        ) => {
            // If the route is not private we ignore this hook
            if (isProtected(request.routeOptions.config)) {
                const authHeader = request.headers.authorization;
                if (typeof authHeader !== 'string') {
                    reply.unauthorized('No Authorization header');
                    return;
                }
                const token: string = String(authHeader)
                    .replace(/^Bearer\s+/, '')
                    .trim();
                if (!token) {
                    reply.unauthorized('Token is empty');
                    return;
                }

                try {
                    request.user = verifyToken(token);
                } catch (error) {
                    return reply.unauthorized(getErrorMessage(error));
                }
            }
        },
    );

    app.register(router);

    return app;
}