import path from 'path'
import { build, InlineConfig } from 'vite'
import type { RollupOutput, RollupWatcher, WatcherOptions } from 'rollup'
import { getConfig, resolveConfig } from './resolveConfig'

type FileObject = Cypress.FileObject
type CypressPreprocessor = (file: FileObject) => string | Promise<string>

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
  if (userConfigPath) {
    resolveConfig(userConfigPath)
  }

  return async (file) => {
    const { outputPath, filePath, shouldWatch } = file

    if (cache[filePath]) {
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

    const watcher = await build(getConfig(defaultConfig))

    if (shouldWatch && isWatcher(watcher)) {
      watcher.on('event', (event) => {
        if (event.code === 'END') {
          file.emit('rerun')
        }
      })

      file.on('close', () => {
        delete cache[filePath]
        watcher.close()
      })
    }

    cache[filePath] = outputPath
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
