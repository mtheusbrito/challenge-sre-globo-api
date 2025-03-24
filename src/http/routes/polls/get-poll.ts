import type { FastifyInstance, RouteShorthandOptions } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '@/lib/prisma';
import { NotFoundError } from '../_errors/not-found.error';

const paramsSchema = z.object({
    id: z.string().uuid()
})
const responseOkSchema = z.object({ 
    id: z.string().uuid(),
    startDate: z.date(),
    endDate: z.date(),
    participants: z.array(z.object({
        id: z.string().uuid(),
        name: z.string()
    }))
 })
const responseErrorSchema = z.object({
    message: z.string()
})

type GetPollParams = z.infer<typeof paramsSchema>;

const options: RouteShorthandOptions = {
    schema: {
        tags: ['Poll'],
        summary: 'Get details of a specific poll',
        params: paramsSchema,
        response: {
            200: responseOkSchema,
            404: responseErrorSchema,
        }
    }
}
export async function getPoll(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get(
        '/:id',
        options,
        async (request, reply) => {
            const { id } = request.params as GetPollParams;
            const poll = await prisma.poll.findUnique({
                where: {
                    id
                }, include: {
                    participants: true
                }
            })
            if (!poll)
                throw new NotFoundError('Poll not found')

            return reply.status(200).send({
                id: poll.id,
                endDate: poll.endDate,
                startDate:  poll.startDate,
                participants: poll.participants.map(p => {
                    return {
                        id: p.id,
                        name: p.name
                    }
                })
            })
        },
    )
}
