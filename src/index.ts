import path from 'path'
import Debug from 'debug'
import { build, InlineConfig } from 'vite'
import chokidar from 'chokidar'

type FileObject = Cypress.FileObject
type CypressPreprocessor = (file: FileObject) => Promise<string>

const debug = Debug('cypress-vite')
const watchers: Record<string, chokidar.FSWatcher> = {}

/**
 * Cypress preprocessor for running e2e tests using vite.
 *
 * @param {InlineConfig | string} config - Vite config object, or path to user
 * Vite config file for backwards compatibility
 * @example
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
  const config: InlineConfig =
    typeof userConfig === 'string'
      ? { configFile: userConfig }
      : userConfig ?? {}
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
