import path from 'path'
import { build, mergeConfig, type InlineConfig } from 'vite'
import baseVitePreprocessor from './vitePreprocessor'
import { debug, getConfig } from './common'

let wasPrebuilt = true

/**
 * Pre-process all files at the beginning of the test run, before they are ran through the
 * preprocessor for each spec.
 *
 * Can greatly improve overall test time, since this pre-build takes into account the shared
 * assets/imports of all spec files being ran (as opposed to the regular preprocessor alone, which
 * performs on each spec file individually).
 * 
 * Does not work in watch mode, since watch mode preprocesses the current watched spec rather than the
 * "whole" of them. (TODO: look into a way to do this)
 * 
 * @param {InlineConfig | string} config - Vite config object, or path to user
 * Vite config file for backwards compatibility
 * 
 * @example
 * import { getVitePrebuilder } from 'cypress-vite'
 * ...
 * const { vitePrebuild, vitePreprocessor } = getVitePrebuilder(path.resolve(__dirname, './vite.config.ts'))
 * ...
 * setupNodeEvents(on, config) {
 *   on('before:run', (details) => vitePrebuild(details, config))
 *   on('file:preprocessor', vitePreprocessor)
 * },
 */
export function getVitePrebuilder(userConfig?: InlineConfig | string) {
    const viteConfig: InlineConfig = getConfig(userConfig)

    const OUT_DIR = 'node_modules/.cypress-vite-prebuild'

    /**
     * Prebuild with all spec files as entries.
     * Does not pre-build if only 1 spec ran, or if `watchForFileChanges=true`.
     * 
     * @param details 
     *    Cypress details
     * @param config
     *    Cypress config
     */
    async function maybeVitePrebuild(
        details: Cypress.BeforeRunDetails,
        config: Cypress.PluginConfigOptions
    ) {
        // TODO: there may be a way to get it to work for watch mode... Could we watch the file while keeping imported assets?
        if (config.watchForFileChanges || !details.specs || details.specs.length < 2) {
            // We don't gain anything from pre-preprocessing if there isn't more than 1 spec being ran.
            wasPrebuilt = false
            debug('Not pre-building with Vite.')
            return
        }
        const files: string[] = details.specs.map((spec) => spec.absolute)
        if (config.supportFile) {
            files.push(config.supportFile)
        }

        debug(`Pre-building ${files.length} files with Vite.`)

        await build(
            mergeConfig(viteConfig, {
                build: {
                    outDir: OUT_DIR,
                    emptyOutDir: true,
                    minify: false,
                    rollupOptions: {
                        input: files,
                        output: { entryFileNames: '[name].ts', format: 'es' },
                        treeshake: true,
                    },
                },
                esbuild: { treeShaking: true },
            } satisfies InlineConfig)
        )
    }

    function customVitePreprocessor(file: Cypress.FileObject) {
        if (wasPrebuilt && !file.shouldWatch) {
            file.filePath = path.join(OUT_DIR, path.basename(file.filePath))
        }

        // TODO: make so initial preprocess works, don't have to re-preprocess here
        return baseVitePreprocessor(viteConfig)(file)
    }

    return { vitePrebuild: maybeVitePrebuild, vitePreprocessor: customVitePreprocessor }
}

export default getVitePrebuilder
