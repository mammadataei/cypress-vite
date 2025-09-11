import Debug from 'debug'
import { type InlineConfig } from 'vite'

export type CypressPreprocessor = (
  file: Cypress.FileObject,
) => string | Promise<string>

export function getConfig(
  userConfig: string | InlineConfig | undefined,
): InlineConfig {
  const config: InlineConfig =
    typeof userConfig === 'string'
      ? { configFile: userConfig }
      : (userConfig ?? {})
  return config
}

export const debug = Debug('cypress-vite')
