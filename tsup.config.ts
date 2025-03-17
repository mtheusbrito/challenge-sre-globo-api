import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src'],
  noExternal: [
  ],
  splitting: false,
  bundle: true,
  clean: true,
  loader: { '.json': 'copy' },
  minify: false,
  sourcemap: true,
})