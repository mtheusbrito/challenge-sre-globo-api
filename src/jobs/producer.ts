import Queue from 'bee-queue';
import { JobPayloads, JobTypes } from './workers';

const queue = new Queue<{ type: JobTypes; payload: JobPayloads[JobTypes] }>('multiQueue', {
  redis: process.env.DATABASE_REDIS_URL,
  isWorker: false, 
});

export const addJob = async <T extends JobTypes>(type: T, payload: JobPayloads[T]) => {
  await queue.createJob({ type, payload }).save();
};

export { queue };