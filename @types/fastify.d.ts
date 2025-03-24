import 'fastify'
import type { Role } from '.prisma/client'

declare module 'fastify' {
  export interface FastifyRequest {
    getCurrentUserData(): Promise<{role: Role, userId: string}>
  }
}