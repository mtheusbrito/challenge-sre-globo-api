import client from 'prom-client';

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const jobCreatedWithFailures = new client.Counter({
    name: 'queue_job_created_whit_failures_total',
    help: 'Total jobs created that failed',
    labelNames: ['queue', 'job_type'],
});

const jobCreatedWitSuccess = new client.Counter({
    name: 'queue_job_created_with_success_total',
    help: 'Total jobs created with success',
    labelNames: ['queue', 'job_type'],
});

const jobCreatedDuration = new client.Histogram({
    name: 'queue_job_created_duration_seconds',
    help: 'Duration of creation at jobs in seconds',
    labelNames: ['queue', 'job_type'],
    buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
});

register.registerMetric(jobCreatedWithFailures);
register.registerMetric(jobCreatedWitSuccess);
register.registerMetric(jobCreatedDuration)

export { jobCreatedWithFailures, jobCreatedWitSuccess, jobCreatedDuration,register }