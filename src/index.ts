import path from 'path'
import { build } from 'vite'
import type { RollupOutput, RollupWatcher, WatcherOptions } from 'rollup'

type CypressPreprocessor = (
  file: Cypress.FileObject,
) => string | Promise<string>

export default function vitePreprocessor(): CypressPreprocessor {
  return async (file) => {
    const { outputPath, filePath, shouldWatch } = file

    const fileName = path.basename(outputPath)
    const filenameWithoutExtension = path.basename(
      outputPath,
      path.extname(outputPath),
    )

    const watcher = await build({
      logLevel: 'silent',
      build: {
        emptyOutDir: false,
        minify: false,
        outDir: path.dirname(outputPath),
        sourcemap: true,
        write: true,
        watch: getWatcherConfig(shouldWatch),
        lib: {
          entry: filePath,
          fileName,
          formats: ['es'],
          name: filenameWithoutExtension,
        },
      },
    })

    if (shouldWatch && isWatcher(watcher)) {
      watcher.on('event', (event) => {
        if (event.code === 'END') {
          file.emit('rerun')
        }
      })

      file.on('close', () => {
        watcher.close()
      })
    }

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
