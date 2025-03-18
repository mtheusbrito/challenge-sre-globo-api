import fastifyCors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import { fastify } from 'fastify'
import path from 'path'

import { jsonSchemaTransform, serializerCompiler, validatorCompiler, ZodTypeProvider } from "fastify-type-provider-zod";
import { errorHandler } from "./error_handler";
import { register } from './routes/account/register'
import { authenticate } from './routes/auth/authenticate'

const app = fastify();
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
        app.register(fastifyJwt, { secret: 'weeee' })

        app.register(fastifySwaggerUi, {
            routePrefix: '/docs',
            baseDir: process.env.NODE_ENV === 'production' ? pathFiles : undefined,
        })

        app.register(fastifyCors)
        app.register(register, {prefix: '/account'})
        app.register(authenticate, {prefix: '/auth'})

        done();
    },
    { prefix: '/api' }
)

app.listen({ port: 3001 }).then(() => {
    console.log(`HTTP server running...`)
});