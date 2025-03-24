import type { FastifyInstance, RouteShorthandOptions } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '@/lib/prisma';
import { NotFoundError } from '../_errors/not-found.error';
import { auth } from '@/http/middlewares/auth';
import { ForbiddenError } from '../_errors/forbidden.error';

const paramsSchema = z.object({
    id: z.string().uuid()
})
const responseOkSchema = z.object({
    result: z.object({
        pollId: z.string().uuid(),
        overallTotalVotes: z.number(),
        participants: z.array(z.object({
            id: z.string().uuid(),
            name: z.string(),
            totalVotes: z.number(),
        })),
        votesPerHour: z.array(z.object({
            hour: z.date(),
            totalVotes: z.number()
        }))
    })
})
const responseErrorSchema = z.object({
    message: z.string()
})

type GetResultParams = z.infer<typeof paramsSchema>;

const options: RouteShorthandOptions = {
    schema: {
        tags: ['Poll'],
        summary: 'Get detailed poll results.',
        security: [{ bearerAuth: [] }],
        params: paramsSchema,
        response: {
            200: responseOkSchema,
            404: responseErrorSchema,
            401: responseErrorSchema,
            403: responseErrorSchema,
        }
    }
}

export async function getResult(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
        '/:id/results',
        options,
        async (request, reply) => {
            const { role } = await request.getCurrentUserData()
            if(role === 'USER'){
                throw new ForbiddenError('Unauthorized')
            }
            const { id } = request.params as GetResultParams;
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
                total_votes: string
                overall_total_votes: string
            }[]>`
                SELECT
                    p.name AS participant_name,
                    p.id AS participant_id,
                    COALESCE(COUNT(v.participant_id), 0) AS total_votes,(SELECT COUNT(*) FROM votes WHERE poll_id = ${id}) AS overall_total_votes
                FROM
                    participants p
                LEFT JOIN
                    votes v ON p.id = v.participant_id AND v.poll_id = ${id}
                WHERE
                    p.poll_id = ${id}
                GROUP BY
                    p.name, p.id;
                `;

            const votesPerHourResult = await prisma.$queryRaw<{
                vote_hour: Date
                hourly_votes: string
            }[]>`
            SELECT
                DATE_TRUNC('hour', created_at) AS vote_hour,
            COUNT(*) AS hourly_votes
                FROM
                    votes
                WHERE
                    poll_id = ${id}
                GROUP BY
                    vote_hour
                ORDER BY
            vote_hour;`


            return reply.status(200).send({
                result: {
                    pollId: poll.id,
                    overallTotalVotes: Number(summaryResult?.[0].overall_total_votes || 0),
                    participants: summaryResult.map(s => {
                        return {
                            id: s.participant_id,
                            name: s.participant_name,
                            totalVotes: Number(s.total_votes),
                        }
                    }),
                    votesPerHour: votesPerHourResult.map(h => {
                        return {
                            hour: new Date(h.vote_hour),
                            totalVotes: Number(h.hourly_votes)
                        }
                    })
                }
            })
        },
    )
}
