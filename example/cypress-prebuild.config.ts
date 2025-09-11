import { fileURLToPath } from 'url'
import { resolve, dirname } from 'path'
import { defineConfig } from 'cypress'
import { getVitePrebuilder } from 'cypress-vite'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const { vitePrebuild, vitePreprocessor } = getVitePrebuilder(
  resolve(__dirname, './vite.config.ts'),
)

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173/',
    viewportWidth: 1280,
    viewportHeight: 768,
    specPattern: '**/*.e2e.ts',
    video: false,
    screenshotOnRunFailure: false,

    setupNodeEvents(on, config) {
      on('before:run', (details) => vitePrebuild(details, config))
      on('file:preprocessor', vitePreprocessor)
    },
  },
})
