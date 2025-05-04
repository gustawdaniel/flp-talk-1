import {it, expect} from "vitest";

import {getFastifyInstance} from "../src/fastify";

it('should return version', async () => {
    const app = getFastifyInstance();

    const response = await app.inject({
        method: 'GET',
        url: '/',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
        name: 'api',
        version: '1.0.0',
    });
})