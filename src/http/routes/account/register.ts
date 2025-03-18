import type { FastifyInstance, RouteShorthandOptions } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { BadRequestError } from '../_errors/bad-request.error'
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';

const bodySchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(6),
});

const responseCreatedSchema = z.object({})
const responseBadRequestSchema = z.object({
    message: z.string()
})
type CreateAccountBody = z.infer<typeof bodySchema>;

const options: RouteShorthandOptions = {
    schema: {
        tags: ['Account'],
        summary: 'Create a new account',
        body: bodySchema,
        response:{
            201: responseCreatedSchema,
            400: responseBadRequestSchema
        }
        
    }
}
export async function register(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().post(
        '/register',
        options,
        async (request, reply) => {
            const { name, email, password }  = request.body as CreateAccountBody; 
            
            const userWithSameEmail = await prisma.user.findUnique({where: {
                email
            }});

            if(userWithSameEmail){
                throw new BadRequestError('User with same e-mail already exists!')
            }

            const passwordHash = await hash(password, 6);

            await prisma.user.create({
                data:{
                    name,
                    email,
                    password: passwordHash
                }
            })

            return reply.status(201).send()
        },
        
    )
}
