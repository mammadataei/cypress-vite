import path from 'path'
import { build, type InlineConfig } from 'vite'
import chokidar from 'chokidar'
import { debug, getConfig, type CypressPreprocessor } from './common'

const watchers: Record<string, chokidar.FSWatcher> = {}

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
      watchers[filePath] = chokidar.watch(filePath)
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

    const defaultConfig: InlineConfig = {
      logLevel: 'warn',
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
        rollupOptions: {
          output: {
            // override any manualChunks from the user config because they don't work with UMD
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            manualChunks: false as any,
          },
        },
      },
    }

    await build({
      ...config,
      ...defaultConfig,
    })

    return outputPath
  }
}

export default vitePreprocessor
