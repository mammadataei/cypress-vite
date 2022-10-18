import path from 'path'
import Debug from 'debug'
import { build, InlineConfig } from 'vite'
import type { RollupOutput, RollupWatcher, WatcherOptions } from 'rollup'

type FileObject = Cypress.FileObject
type CypressPreprocessor = (file: FileObject) => string | Promise<string>

const debug = Debug('cypress-vite')
const cache: Record<string, string> = {}

/**
 * Cypress preprocessor for running e2e tests using vite.
 *
 * @param {string} userConfigPath
 * @example
 * setupNodeEvents(on) {
 *   on(
 *     'file:preprocessor',
 *     vitePreprocessor(path.resolve(__dirname, './vite.config.ts')),
 *   )
 * },
 */
function vitePreprocessor(userConfigPath?: string): CypressPreprocessor {
  debug('User config path: %s', userConfigPath)

  return async (file) => {
    const { outputPath, filePath, shouldWatch } = file
    debug('Preprocessing file %s', filePath)

    if (cache[filePath]) {
      debug('Cached bundle exist for file %s', filePath)
      return cache[filePath]
    }

    const fileName = path.basename(outputPath)
    const filenameWithoutExtension = path.basename(
      outputPath,
      path.extname(outputPath),
    )

    const defaultConfig: InlineConfig = {
      logLevel: 'silent',
      define: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      },
      build: {
        emptyOutDir: false,
        minify: false,
        outDir: path.dirname(outputPath),
        sourcemap: true,
        write: true,
        watch: getWatcherConfig(shouldWatch),
        lib: {
          entry: filePath,
          fileName: () => fileName,
          formats: ['umd'],
          name: filenameWithoutExtension,
        },
      },
    }

    const watcher = await build({
      configFile: userConfigPath,
      ...defaultConfig,
    })

    if (shouldWatch && isWatcher(watcher)) {
      watcher.on('event', (event) => {
        debug('Watcher %s for file %s', event.code, filePath)

        if (event.code === 'END') {
          file.emit('rerun')
        }

        if (event.code === 'ERROR') {
          console.error(event)
        }
      })

      file.on('close', () => {
        delete cache[filePath]
        watcher.close()

        debug('File %s closed.', filePath)
      })
    }

    cache[filePath] = outputPath
    debug('Bundle for file %s cached at %s', filePath, outputPath)

    return outputPath
  }
}

function getWatcherConfig(shouldWatch: boolean): WatcherOptions | null {
  return shouldWatch ? {} : null
}

type BuildResult = RollupWatcher | RollupOutput | RollupOutput[]

function isWatcher(watcher: BuildResult): watcher is RollupWatcher {
  return (watcher as RollupWatcher).on !== undefined
}

export default vitePreprocessor
