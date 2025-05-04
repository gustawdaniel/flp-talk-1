import { z } from 'zod';

export const serverVariables = z.object({
    // DATABASE_URL: z.string(),
    // JWT_SECRET: z.string(),

    NODE_ENV: z
        .enum(['development', 'production', 'test'])
        .default('development'),

    PORT: z.coerce.number().int().default(4747),
});

export const config = serverVariables.parse(process.env);