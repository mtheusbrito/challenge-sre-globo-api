import type { FastifyInstance, RouteShorthandOptions } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { auth } from '@/http/middlewares/auth';
import { addJob } from '@/jobs/producer';

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
                const { userId } = await request.getCurrentUserData()
                const { pollId } = request.params as CreateNewVoteParams;
                const { participantId } = request.body as CreateNewVoteBody;
                
                await addJob('registrationVote', {participantId,userId, pollId, createdAt: new Date()})
                
                return reply.status(201).send({})
            },
        )
}
