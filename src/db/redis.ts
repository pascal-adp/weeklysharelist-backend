import { createClient } from "redis";

export const redisClient = createClient({
    url: "redis://localhost:6381",  
});
redisClient.connect().catch(console.error);