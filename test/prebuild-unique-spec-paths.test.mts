import assert from 'node:assert/strict'
import { EventEmitter } from 'node:events'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { after, before, describe, it } from 'node:test'
import { getVitePrebuilder } from '../dist/index.mjs'

const PREBUILD_OUT_DIR = 'node_modules/.cypress-vite-prebuild'

function listFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  const files: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) files.push(...listFiles(full))
    else files.push(full)
  }
  return files
}

function makeFile(filePath: string, outputPath: string) {
  const file = new EventEmitter() as EventEmitter & {
    filePath: string
    outputPath: string
    shouldWatch: boolean
  }
  file.filePath = filePath
  file.outputPath = outputPath
  file.shouldWatch = false
  return file
}

describe('prebuild unique spec paths (#261)', () => {
  const originalCwd = process.cwd()
  let projectRoot = ''
  let specA = ''
  let specB = ''
  let outDir = ''
  let vitePrebuild: ReturnType<typeof getVitePrebuilder>['vitePrebuild']
  let vitePreprocessor: ReturnType<typeof getVitePrebuilder>['vitePreprocessor']

  before(async () => {
    projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'cypress-vite-261-'))
    specA = path.join(projectRoot, 'a', 'test.cy.ts')
    specB = path.join(projectRoot, 'b', 'test.cy.ts')
    fs.mkdirSync(path.dirname(specA), { recursive: true })
    fs.mkdirSync(path.dirname(specB), { recursive: true })
    fs.writeFileSync(specA, 'console.log("SPEC_A_MARKER")\n')
    fs.writeFileSync(specB, 'console.log("SPEC_B_MARKER")\n')
    outDir = path.join(projectRoot, PREBUILD_OUT_DIR)

    process.chdir(projectRoot)

    const prebuilder = getVitePrebuilder({
      configFile: false,
      root: projectRoot,
      logLevel: 'error',
    })
    vitePrebuild = prebuilder.vitePrebuild
    vitePreprocessor = prebuilder.vitePreprocessor

    await vitePrebuild(
      {
        specs: [{ absolute: specA }, { absolute: specB }],
      } as Cypress.BeforeRunDetails,
      {
        watchForFileChanges: false,
        supportFile: false,
        projectRoot,
      } as Cypress.PluginConfigOptions,
    )
  })

  after(() => {
    process.chdir(originalCwd)
    fs.rmSync(projectRoot, { recursive: true, force: true })
  })

  it('emits distinct nested outputs for same-basename specs', () => {
    const emitted = listFiles(outDir)
    const rel = emitted.map((file) =>
      path.relative(outDir, file).split(path.sep).join('/'),
    )

    const outA = path.join(outDir, 'a', 'test.cy.ts')
    const outB = path.join(outDir, 'b', 'test.cy.ts')

    assert.ok(
      fs.existsSync(outA),
      `expected ${path.relative(outDir, outA)} under prebuild outDir, got: ${rel.join(', ') || '(empty)'}`,
    )
    assert.ok(
      fs.existsSync(outB),
      `expected ${path.relative(outDir, outB)} under prebuild outDir, got: ${rel.join(', ') || '(empty)'}`,
    )
    assert.notEqual(outA, outB)

    const contentA = fs.readFileSync(outA, 'utf8')
    const contentB = fs.readFileSync(outB, 'utf8')
    assert.match(contentA, /SPEC_A_MARKER/)
    assert.doesNotMatch(contentA, /SPEC_B_MARKER/)
    assert.match(contentB, /SPEC_B_MARKER/)
    assert.doesNotMatch(contentB, /SPEC_A_MARKER/)
  })

  it('maps each spec to its own prebuild output, not path.basename', async () => {
    const outputA = path.join(projectRoot, 'out-a.js')
    const outputB = path.join(projectRoot, 'out-b.js')

    await vitePreprocessor(makeFile(specA, outputA) as Cypress.FileObject)
    await vitePreprocessor(makeFile(specB, outputB) as Cypress.FileObject)

    const bundledA = fs.readFileSync(outputA, 'utf8')
    const bundledB = fs.readFileSync(outputB, 'utf8')
    assert.match(bundledA, /SPEC_A_MARKER/)
    assert.doesNotMatch(bundledA, /SPEC_B_MARKER/)
    assert.match(bundledB, /SPEC_B_MARKER/)
    assert.doesNotMatch(bundledB, /SPEC_A_MARKER/)
    assert.equal(path.basename(specA), path.basename(specB))
  })
})
