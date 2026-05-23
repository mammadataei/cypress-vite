import path from 'path'
import { build, mergeConfig, type InlineConfig } from 'vite'
import { watch, FSWatcher } from 'chokidar'
import { debug, getConfig, type CypressPreprocessor } from './common'
import { maybeMap } from './utils'
import { omit, isEmptyObject } from 'es-toolkit'

const watchers: Record<string, FSWatcher> = {}

/**
 * Cypress preprocessor for running e2e tests using vite.
 *
 * @param {InlineConfig | string} config - Vite config object, or path to user
 * Vite config file for backwards compatibility
 *
 * @example
 * import vitePreprocessor from 'cypress-vite'
 * ...
 * setupNodeEvents(on) {
 *   on(
 *     'file:preprocessor',
 *     vitePreprocessor(path.resolve(__dirname, './vite.config.ts')),
 *   )
 * },
 */
function vitePreprocessor(
  userConfig?: InlineConfig | string,
): CypressPreprocessor {
  const config: InlineConfig = getConfig(userConfig)
  debug('User config path: %s', config.configFile)

  return async (file) => {
    const { outputPath, filePath, shouldWatch } = file
    debug('Preprocessing file %s', filePath)

    const fileName = path.basename(outputPath)
    const filenameWithoutExtension = path.basename(
      outputPath,
      path.extname(outputPath),
    )

    if (shouldWatch && !watchers[filePath]) {
      // Watch this spec file if we are not already doing so (and Cypress is
      // not in headless mode)
      let initial = true
      watchers[filePath] = watch(filePath)
      debug('Watcher for file %s cached', filePath)

      file.on('close', async () => {
        await watchers[filePath].close()
        delete watchers[filePath]

        debug('File %s closed.', filePath)
      })

      watchers[filePath].on('all', () => {
        // Re-run the preprocessor if the file changes
        if (!initial) {
          file.emit('rerun')
        }
        initial = false
      })
    }

    const resolvedConfig: InlineConfig = mergeConfig(
      {
        // defaults
        logLevel: 'warn',
        // user config
        ...config,
      },
      // overrides
      {
        define: {
          'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        },
        build: {
          emptyOutDir: false,
          minify: false,
          outDir: path.dirname(outputPath),
          sourcemap: true,
          write: true,
          watch: null,
          lib: {
            entry: filePath,
            fileName: () => fileName,
            formats: ['umd'],
            name: filenameWithoutExtension,
          },
        },
      } satisfies InlineConfig,
    )

    // Remove any manualChunks, advancedChunks, or codeSplitting.
    for (const key of ['rollupOptions', 'rolldownOptions'] as const) {
      const buildConfig = resolvedConfig.build?.[key]
      if (buildConfig?.output) {
        buildConfig.output = maybeMap(buildConfig.output, (o) =>
          omit(o, ['manualChunks', 'advancedChunks', 'codeSplitting']),
        )
        // If output is now an empty object or array of empty objects, remove it
        if (
          (Array.isArray(buildConfig.output) &&
            buildConfig.output.every(isEmptyObject)) ||
          isEmptyObject(buildConfig.output)
        ) {
          delete buildConfig.output
        }
      }
      // If the whole options object is now empty, remove it
      if (buildConfig && isEmptyObject(buildConfig) && resolvedConfig.build) {
        delete resolvedConfig.build[key]
      }
    }

    await build(resolvedConfig)

    return outputPath
  }
}

export default vitePreprocessor
