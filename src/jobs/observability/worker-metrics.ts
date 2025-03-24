import client from 'prom-client';

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const jobFailures = new client.Counter({
    name: 'queue_job_failures_total',
    help: 'Total jobs that failed',
    labelNames: ['queue', 'job_type'],
});

const jobSuccess = new client.Counter({
    name: 'queue_job_success_total',
    help: 'Total jobs whit success',
    labelNames: ['queue', 'job_type'],
});

const jobDuration = new client.Histogram({
    name: 'queue_job_duration_seconds',
    help: 'Duration of jobs in seconds',
    labelNames: ['queue', 'job_type'],
    buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
});

register.registerMetric(jobFailures);
register.registerMetric(jobSuccess);
register.registerMetric(jobDuration)

export { jobFailures,jobSuccess ,jobDuration,register }