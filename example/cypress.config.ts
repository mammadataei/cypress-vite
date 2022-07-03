import { defineConfig } from 'cypress'
import vitePreprocessor from 'cypress-vite-preprocessor'

export default defineConfig({
  e2e: {
    specPattern: '**/*.e2e.ts',

    setupNodeEvents(on) {
      on('file:preprocessor', vitePreprocessor())
    },
  },
})
