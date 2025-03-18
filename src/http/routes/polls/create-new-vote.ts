import type { FastifyInstance, RouteShorthandOptions } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '@/lib/prisma';
import { NotFoundError } from '../_errors/not-found.error';
import { auth } from '@/http/middlewares/auth';
import { BadRequestError } from '../_errors/bad-request.error';

const paramsSchema = z.object({
    pollId: z.string().uuid()
})
const bodySchema = z.object({
    participantId: z.string().uuid()
})

const responseCreatedSchema = z.object({})

const responseErrorSchema = z.object({
    message: z.string()
})

type CreateNewVoteParams = z.infer<typeof paramsSchema>;
type CreateNewVoteBody = z.infer<typeof bodySchema>
const options: RouteShorthandOptions = {
    schema: {
        tags: ['Poll'],
        summary: 'Create a new vote',
        security: [{ bearerAuth: [] }],
        params: paramsSchema,
        body: bodySchema,
        response: {
            201: responseCreatedSchema,
            401: responseErrorSchema,
            404: responseErrorSchema,
        }
    }
}
export async function createNewVote(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>()
        .register(auth)
        .post(
            '/:pollId/vote',
            options,
            async (request, reply) => {
                const userId = await request.getCurrentUserId()
                const { pollId } = request.params as CreateNewVoteParams;
                const { participantId } = request.body as CreateNewVoteBody;

                const poll = await prisma.poll.findUnique({
                    where: { id: pollId },
                    include: { participants: true }
                });

                if (!poll)
                    throw new NotFoundError('Poll not found');

                const participantExists = poll.participants.some(p => p.id === participantId);

                if (!participantExists)
                    throw new BadRequestError('Participant does not exist in Poll');

                if (new Date() > poll.endDate)
                    throw new BadRequestError('Voting is now closed!');

                const vote = await prisma.vote.create({
                    data: {
                        userId,
                        participantId,
                        pollId
                    }
                })

                return reply.status(201).send({})
            },
        )
}
