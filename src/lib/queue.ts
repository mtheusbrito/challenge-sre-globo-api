import redisConfig from '../config/bull'
import Queue from 'bull';

import * as jobs from '../jobs';

const queues = Object.values(jobs).map(job => ({
  bull: new Queue(job.key, redisConfig ),
  name: job.key,
  handle: job.handle,
}))

export default {
  queues,
  add(name: string, data: any) {
    const queue = this.queues.find(queue => queue.name === name);
    
    return queue?.bull.add(data, queue);
  },
  process() {
    return this.queues.forEach(queue => {
      queue.bull.process(1, async(job) => {
        await queue.handle(job);
      });

      queue.bull.on('failed', (job, err) => {
        console.log('Job failed', queue.name, job.data);
        console.log(err);

        //sentry
      });
    })
  }
};