// import { FastifyInstance } from 'fastify'
// import { fastifyPlugin } from 'fastify-plugin'
// import { ForbiddenError } from '../routes/_errors/forbidden.error'

// export const admin = fastifyPlugin(async (app: FastifyInstance) => {
//   app.addHook('preHandler', async (request) => {
//     request.userIsAdmin = async () => {

//          const role = await request.getCurrentRole()
//         console.log(role)
//         console.log('weewerwerwe')
//           if(role !== 'ADMIN')
//             throw new ForbiddenError('Not authorized')
//       }
//   })
// })