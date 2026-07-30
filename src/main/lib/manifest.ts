import { app } from 'electron'
import fs from 'fs'
import path from 'path'

// Tracks what's actually installed on disk, keyed by game id. This is the
// launcher's source of truth for "installed version" — separate from
// whatever the store/UI thinks, so it survives app restarts.
export interface ManifestEntry {
  version: string
  executablePath: string
  assetName: string
}

type Manifest = Record<string, ManifestEntry>

function manifestPath(): string {
  return path.join(app.getPath('userData'), 'games-manifest.json')
}

export function readManifest(): Manifest {
  try {
    const raw = fs.readFileSync(manifestPath(), 'utf-8')
    return JSON.parse(raw) as Manifest
  } catch {
    return {}
  }
}

export function getManifestEntry(id: string): ManifestEntry | undefined {
  return readManifest()[id]
}

export function writeManifestEntry(id: string, entry: ManifestEntry): void {
  const manifest = readManifest()
  manifest[id] = entry
  fs.mkdirSync(path.dirname(manifestPath()), { recursive: true })
  fs.writeFileSync(manifestPath(), JSON.stringify(manifest, null, 2))
}
