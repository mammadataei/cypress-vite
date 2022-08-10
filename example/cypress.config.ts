import { resolve } from 'path'
import { defineConfig } from 'cypress'
import vitePreprocessor from 'cypress-vite'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173/',
    viewportWidth: 1280,
    viewportHeight: 768,
    specPattern: '**/*.e2e.ts',
    video: false,
    screenshotOnRunFailure: false,

    setupNodeEvents(on) {
      on(
        'file:preprocessor',
        vitePreprocessor(resolve(__dirname, './vite.config.ts')),
      )
    },
  },
})
