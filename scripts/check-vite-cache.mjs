import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const lockfiles = ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml']
const lockfile = lockfiles.map(f => resolve(root, f)).find(existsSync)

if (!lockfile) process.exit(0) // no lockfile, skip

const hashFile = resolve(root, 'node_modules/.vite-hash')
const cacheDir = resolve(root, 'node_modules/.vite')

const hash = createHash('sha256').update(readFileSync(lockfile)).digest('hex')
const prev = existsSync(hashFile) ? readFileSync(hashFile, 'utf8').trim() : ''

if (hash !== prev) {
  if (existsSync(cacheDir)) {
    rmSync(cacheDir, { recursive: true, force: true })
    console.log('[vite-cache] deps changed — cache cleared')
  }
  writeFileSync(hashFile, hash)
} else {
  console.log('[vite-cache] deps unchanged — cache kept')
}
