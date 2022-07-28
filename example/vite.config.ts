import { resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { compilerOptions } from './tsconfig.json'

function resolveAliasesFromTypescriptConfig() {
  return Object.entries(compilerOptions.paths).reduce((acc, [key, [value]]) => {
    const aliasKey = key.substring(0, key.length - 2)
    const path = value.substring(0, value.length - 2)
    return { ...acc, [aliasKey]: resolve(__dirname, path) }
  }, {})
}

export default defineConfig({
  resolve: {
    alias: resolveAliasesFromTypescriptConfig(),
  },
  plugins: [react()],
})
