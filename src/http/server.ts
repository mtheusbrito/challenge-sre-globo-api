import { fastify } from 'fastify'
import fastifyCors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'

import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import metricsPlugin from 'fastify-metrics'
import path from 'path'

import { jsonSchemaTransform, serializerCompiler, validatorCompiler, ZodTypeProvider } from "fastify-type-provider-zod";
import { errorHandler } from "./error_handler";
import { register } from './routes/account/register'
import { authenticate } from './routes/auth/authenticate'
import { getPoll } from './routes/polls/get-poll'
import { getPolls } from './routes/polls/get-polls'
import { createNewVote } from './routes/polls/create-new-vote'
import { getSummary } from './routes/polls/get-summary'
import { getResult } from './routes/polls/get-result'

const app = fastify();


app.register(metricsPlugin, { endpoint: '/metrics', defaultMetrics: { 
    enabled: true,
    
} });
app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)
app.withTypeProvider<ZodTypeProvider>()

const pathFiles = path.resolve(
    'dist',
    'http',
    'static',
)
app.register(
    (app, _, done) => {
        console.log(`Routes:`)
        app.addHook('onRoute', (routeOptions) => {
            if (
                routeOptions.routePath !== '' &&
                routeOptions.routePath !== '/*' &&
                routeOptions.method !== 'HEAD'
            ) {
                console.log(`${routeOptions.method} - ${routeOptions.url}`)
            }
        })

        app.setErrorHandler(errorHandler)

        app.register(fastifySwagger, {
            openapi: {
                info: {
                    title: 'Challenge SRE Globo api',
                    description: 'Challenge SRE Globo api',
                    version: '1.0.0',
                },
                components: {
                    securitySchemes: {
                        bearerAuth: {
                            type: 'http',
                            scheme: 'bearer',
                            bearerFormat: 'JWT',

                        },
                    },
                },
            },
            transform: jsonSchemaTransform,
        })
        app.register(fastifyJwt, { secret: process.env.JWT_SECRET as string })

        app.register(fastifySwaggerUi, {
            routePrefix: '/docs',
            baseDir: process.env.NODE_ENV === 'production' ? pathFiles : undefined,
        })

        app.register(fastifyCors)
        app.register(register, { prefix: '/account' })
        app.register(authenticate, { prefix: '/auth' })
        app.register(
            (app, _, done) => {
                app.register(getPolls)
                app.register(getPoll)
                app.register(createNewVote)
                app.register(getSummary)
                app.register(getResult)
          
                done();
            }, {
            prefix: '/polls'
        }
        )
        done();
    },
    { prefix: '/api' }
)

app.listen({ port: Number(process.env.HTTP_SERVER_PORT), host: '0.0.0.0' }).then(() => {
    console.log(`HTTP server running an PORT: ${process.env.HTTP_SERVER_PORT}...`)
});