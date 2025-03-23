import { QueueOptions } from "bull";

export default { 
    redis: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
        maxRetriesPerRequest: null,
    }
} as QueueOptions