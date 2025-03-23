import './workers'
import { register } from "@/observability/metrics";
import fastify from "fastify";

const app = fastify();

app.get('/metrics', async (request, reply) => {
  reply.header('Content-Type', register.contentType);
    return register.metrics();
});

app.listen({ port: Number(process.env.WORK_SERVER_PORT), host: '0.0.0.0' }).then(() => {
    console.log(`Worker server running an PORT: ${process.env.WORK_SERVER_PORT}...`)
});