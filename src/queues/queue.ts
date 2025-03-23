import 'dotenv/config';

import queue from "../lib/queue";

queue.process();
console.log('Queue started!')