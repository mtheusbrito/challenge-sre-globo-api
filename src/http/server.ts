import fastify from "fastify";

const app = fastify({logger: true})

app.listen({ port: 3001 }).then(() => {
    console.log(`HTTP server running...`)
});
