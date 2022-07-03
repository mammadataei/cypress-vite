import { Options } from 'tsup'

const config: Options = {
  splitting: false,
  format: ['esm', 'cjs'],
  entryPoints: ['src/index.ts'],
  clean: true,
  dts: true,
  external: ['esbuild', 'vite', 'rollup'],
}

export default config
