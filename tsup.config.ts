import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src'],
  noExternal: [
    '@fastify',
    'fastify-plugin',
    'fastify',
    'fastify-type-provider-zod',
    'zod',
    'bcryptjs',
    '@prisma/client',
  ],
  splitting: false,
  bundle: true,
  clean: true,
  loader: { '.json': 'copy' },
  minify: false,
  sourcemap: true,
})