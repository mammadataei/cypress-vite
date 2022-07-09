import {
  loadConfigFromFile,
  UserConfig,
  mergeConfig,
  InlineConfig,
  ConfigEnv,
} from 'vite'

let resolvedUserConfig: UserConfig | undefined = undefined

const configEnv: ConfigEnv = { command: 'build', mode: 'development' }

export function resolveConfig(userConfigPath: string) {
  loadConfigFromFile(configEnv, userConfigPath).then((result) => {
    resolvedUserConfig = result?.config
  })
}

export function getConfig(defaultConfig: InlineConfig) {
  if (resolvedUserConfig) {
    return mergeConfig(resolvedUserConfig, defaultConfig)
  }

  return defaultConfig
}
