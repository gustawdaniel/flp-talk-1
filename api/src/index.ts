import {getFastifyInstance} from './fastify';
import { config } from './config';

const app = getFastifyInstance();

app.listen(
    { port: config.PORT, host: '0.0.0.0' },
    (err: Error | null, host: string) => {
        if (err) {
            throw err;
        }
        console.info(`server listening on ${host}`);
    },
);