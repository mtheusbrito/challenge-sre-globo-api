import type { FastifyInstance, RouteShorthandOptions } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '@/lib/prisma';
import { NotFoundError } from '../_errors/not-found.error';

const paramsSchema = z.object({
    id: z.string().uuid()
})
const responseOkSchema = z.object({
    summary: z.object({
        pollId: z.string().uuid(),
        participants: z.array(z.object({
            id: z.string().uuid(),
            name: z.string(),
            percentage: z.number(),
        }))
    })
})
const responseErrorSchema = z.object({
    message: z.string()
})

type GetSummaryParams = z.infer<typeof paramsSchema>;

const options: RouteShorthandOptions = {
    schema: {
        tags: ['Poll'],
        summary: 'Get a summary of the poll results.',
        params: paramsSchema,
        response: {
            200: responseOkSchema,
            404: responseErrorSchema,
        }
    }
}


export async function getSummary(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get(
        '/:id/summary',
        options,
        async (request, reply) => {
            const { id } = request.params as GetSummaryParams;
            const poll = await prisma.poll.findUnique({
                where: {
                    id
                }
            })

            if (!poll)
                throw new NotFoundError('Poll not found')

            const summaryResult = await prisma.$queryRaw<{
                participant_name: string
                participant_id: string
                percentage_votes: string
            }[]>`
                SELECT
                    p.name AS participant_name,
                    p.id AS participant_id,
                    COALESCE(ROUND((COUNT(v.participant_id) * 100.0 / (SELECT COUNT(*) FROM votes WHERE poll_id = ${id})), 2), 0) AS percentage_votes
                FROM
                    participants p
                LEFT JOIN
                    votes v ON p.id = v.participant_id AND v.poll_id = ${id}
                WHERE
                    p.poll_id = ${id}
                GROUP BY
                    p.name, p.id;
                `;

            return reply.status(200).send({
                summary: {
                    pollId: poll.id,
                    participants: summaryResult.map(s => {
                        return {
                            id: s.participant_id,
                            name: s.participant_name,
                            percentage: Number(s.percentage_votes)
                        }
                    })
                }
            })
        },
    )
}
