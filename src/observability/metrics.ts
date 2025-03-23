import client from 'prom-client';

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const jobFailures = new client.Counter({
    name: 'queue_job_failures_total',
    help: 'Total jobs that failed',
    labelNames: ['queue', 'job_type'],
});

register.registerMetric(jobFailures);

export { jobFailures,register }