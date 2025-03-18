import type { FastifyInstance, RouteShorthandOptions } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '@/lib/prisma';

const responseOkSchema = z.object({
    polls: z.array(z.object({
        id: z.string().uuid(),
        startDate: z.date(),
        endDate: z.date(),
        participants: z.array(z.object({
            id: z.string().uuid(),
            name: z.string()
        }))
    }))
})

const responseErrorSchema = z.object({
    message: z.string()
})

const options: RouteShorthandOptions = {
    schema: {
        tags: ['Poll'],
        summary: 'Get polls',
        response: {
            200: responseOkSchema,
        }
    }
}
export async function getPolls(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get(
        '',
        options,
        async (_, reply) => {
            
            const polls = await prisma.poll.findMany({
                include: {
                    participants: true
                }
            })
            return reply.status(200).send({
                polls: polls.map(poll => {
                    return {
                        id: poll.id,
                        startDate: poll.startDate,
                        endDate: poll.endDate, 
                        participants: poll.participants.map(participant => {
                            return {
                                id: participant.id,
                                name: participant.name
                            }
                        })
                    }
                })
            })
        },
    )
}
