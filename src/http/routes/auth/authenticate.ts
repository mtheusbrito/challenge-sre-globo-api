import type { FastifyInstance, RouteShorthandOptions } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { BadRequestError } from '../_errors/bad-request.error'
import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';

const bodySchema = z.object({

    email: z.string().email(),
    password: z.string().min(6),
});
const responseCreatedSchema = z.object({accessToken: z.string()})
const responseBadRequestSchema = z.object({
    message: z.string()
})

type AuthenticateBody = z.infer<typeof bodySchema>;


const options: RouteShorthandOptions = {
    schema: {
        tags: ['Auth'],
        summary: 'Authenticate users',
        body: bodySchema,
        response:{
            201: responseCreatedSchema,
            400: responseBadRequestSchema
        }
    }
}
export async function authenticate(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().post(
        '/login',
        options,
        async (request, reply) => {
            const { email, password } = request.body as AuthenticateBody;
            const user = await prisma.user.findUnique({ where: { email } })

            if (!user)
                throw new BadRequestError('Invalid credentials.')

            const isPasswordIsValid = await compare(password, user.password)

            if (!isPasswordIsValid)
                throw new BadRequestError('Invalid credentials.')

            const accessToken = await reply.jwtSign({
                sub: user.id
            }, {
                sign: {
                    expiresIn: '7d'
                }
            })
            return reply.status(201).send({
                accessToken
            })
        },
    )
}
