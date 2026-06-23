import { defineConfig } from 'cypress'
import { getVitePrebuilder } from 'cypress-vite'

const { vitePrebuild, vitePreprocessor } = getVitePrebuilder({})

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173/',
    viewportWidth: 1280,
    viewportHeight: 768,
    specPattern: 'cypress/tests/**/*.e2e.ts',
    video: false,
    screenshotOnRunFailure: false,

    setupNodeEvents(on, config) {
      on('before:run', (details) => vitePrebuild(details, config))
      on('file:preprocessor', vitePreprocessor)
    },
  },
})
