import Queue from 'bee-queue';
import { JobPayloads, JobTypes, QueueType } from './workers';
import { jobCreatedDuration, jobCreatedWitSuccess } from './observability/producer-metrics';

const queue = new Queue<QueueType>('challenge-sre-glob-queue', {
  redis: process.env.DATABASE_REDIS_URL,
  isWorker: false, 
});

export const addJob = async <T extends JobTypes>(type: T, payload: JobPayloads[T]) => {
  const end = jobCreatedDuration.startTimer({ queue: 'challenge-sre-glob-queue', job_type: type });
  try{
    await queue.createJob({ type, payload }).save();
    jobCreatedWitSuccess.inc({ queue: 'challenge-sre-glob-queue', job_type: type })
  }catch{
    jobCreatedWitSuccess.inc({ queue: 'challenge-sre-glob-queue', job_type: type })
  }finally{
    end()
  }
};

export { queue };
