import path from 'path'
import { build } from 'vite'

type CypressPreprocessor = (
  file: Cypress.FileObject,
) => string | Promise<string>

export default function vitePreprocessor(): CypressPreprocessor {
  return async (file) => {
    const { outputPath, filePath } = file

    const fileName = path.basename(outputPath)
    const filenameWithoutExtension = path.basename(
      outputPath,
      path.extname(outputPath),
    )

    await build({
      logLevel: 'silent',
      build: {
        emptyOutDir: false,
        minify: false,
        outDir: path.dirname(outputPath),
        sourcemap: true,
        write: true,
        lib: {
          entry: filePath,
          fileName,
          formats: ['es'],
          name: filenameWithoutExtension,
        },
      },
    })

    return outputPath
  }
}
