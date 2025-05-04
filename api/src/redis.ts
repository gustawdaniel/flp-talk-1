import { createClient } from 'redis';



const client = createClient();

client.on('error', err => console.log('Redis Client Error', err));


export async function getRedisClient() {
    if(client.isReady) {
        return client;
    }

    await client.connect();

    return client;
}