# cypress-vite

Run Cypress specs using Vite

## Introduction

The `cypress-vite` plugin is a [Cypress](https://www.cypress.io/) preprocessor
that allows you to transform and run Cypress e2e specs using
[Vite](https://vitejs.dev/).

### Why?!

- Vite is faster than webpack
- Using same configuration and environment both for development and testing
- Using Vite config for running e2e tests, no need for re-configuring aliases,
  etc. for webpack
- Using vite specific features like plugins and virtual imports, `import.meta`,
  etc. in e2e tests

### What about `@cypress/vite-dev-server`?!

The official `@cypress/vite-dev-server` package is for
[cypress component testing](https://docs.cypress.io/guides/component-testing/writing-your-first-component-test)
that creates a vite dev server for mounting and testing React and Vue
components.

The `cypress-vite` is for compiling and running E2E specs. Neither replaces the
other, but you can combine them to use vite both for component and E2E testing.

## Installation

Install the `cypress-vite` plugin:

```shell
npm install --save-dev cypress-vite

yarn add --dev cypress-vite

pnpm add --save-dev cypress-vite
```

## Usage

For Cypress 10, add the following to your `cypress.config.ts` file:

```typescript
import { defineConfig } from 'cypress'
import vitePreprocessor from 'cypress-vite'

export default defineConfig({
  e2e: {
    setupNodeEvents(on) {
      on('file:preprocessor', vitePreprocessor())
    },
  },
})
```

For Cypress 9 and earlier, add the following to your `cypress/plugins/index.js`
file:

```typescript
const vitePreprocessor = require('cypress-vite')

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
  on('file:preprocessor', vitePreprocessor())
}
```

### Configuration

You can pass a Vite config to the `vitePreprocessor` function:

```typescript
import path from 'path'
import { defineConfig } from 'cypress'
import vitePreprocessor from 'cypress-vite'

export default defineConfig({
  e2e: {
    setupNodeEvents(on) {
      on(
        'file:preprocessor',
        vitePreprocessor({
          configFile: path.resolve(__dirname, './vite.config.ts'),
          mode: 'development',
        }),
      )
    },
  },
})
```

## Debugging

Run your tests with the following environment variable to log the debugging
output:

```bash
DEBUG=cypress-vite
```

## Credits

Thanks to
[Adam Lynch](https://github.com/adam-lynch/preprocess-cypress-tests-with-vite)
for inspiration and initial implementation.

## License

Distributed under the [MIT license](/LICENSE.md).
