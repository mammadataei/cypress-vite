import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: ['src/index'],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true,
    // used for very basic (primitive) utilities, so just bundle the utilized
    // functions directly into our code, to avoid an additional dependency for
    // users of this package.
    inlineDependencies: ['es-toolkit'],
  },
})
