import { FastifyInstance } from 'fastify'
import { fastifyPlugin } from 'fastify-plugin'

import { UnauthorizedError } from '../routes/_errors/unauthorized.error'
import { Role } from '.prisma/client'

export const auth = fastifyPlugin(async (app: FastifyInstance) => {
  app.addHook('preHandler', async (request) => {
    request.getCurrentUserData = async () => {
      try {
        const { userId, role } = await request.jwtVerify<{ userId: string, role: Role }>()

        return {userId: userId, role}
      } catch (err) {
        throw new UnauthorizedError('Invalid auth token')
      }
    }
  })
})