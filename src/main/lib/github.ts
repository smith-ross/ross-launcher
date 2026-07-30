import fs from 'fs'
import { Readable } from 'stream'
import { pipeline } from 'stream/promises'
import type { ReadableStream as WebReadableStream } from 'stream/web'
import { Transform } from 'stream'

export interface ReleaseAsset {
  name: string
  browserDownloadUrl: string
  size: number
}

export interface LatestRelease {
  tagName: string
  assets: ReleaseAsset[]
}

const USER_AGENT = 'ross-launcher'

export async function fetchLatestRelease(owner: string, repo: string): Promise<LatestRelease> {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/latest`, {
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'application/vnd.github+json'
    }
  })

  if (res.status === 404) {
    throw new Error(`No releases found for ${owner}/${repo}`)
  }
  if (!res.ok) {
    throw new Error(`GitHub API error (${res.status}): ${res.statusText}`)
  }

  const data = await res.json()
  const assets: ReleaseAsset[] = (data.assets ?? []).map(
    (asset: { name: string; browser_download_url: string; size: number }) => ({
      name: asset.name,
      browserDownloadUrl: asset.browser_download_url,
      size: asset.size
    })
  )

  return { tagName: data.tag_name, assets }
}

// Picks the release asset to install. Prefers an explicit substring match
// (`pattern`), then falls back to a platform-sensible extension, then just
// takes the first asset there is.
export function pickAsset(assets: ReleaseAsset[], pattern?: string): ReleaseAsset | undefined {
  if (assets.length === 0) return undefined

  if (pattern) {
    const match = assets.find((asset) => asset.name.toLowerCase().includes(pattern.toLowerCase()))
    if (match) return match
  }

  const preferredExtensions = process.platform === 'win32' ? ['.exe', '.zip'] : ['.zip', '.tar.gz']
  for (const ext of preferredExtensions) {
    const match = assets.find((asset) => asset.name.toLowerCase().endsWith(ext))
    if (match) return match
  }

  return assets[0]
}

export async function downloadAsset(
  url: string,
  destPath: string,
  onProgress: (percent: number) => void
): Promise<void> {
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
  if (!res.ok || !res.body) {
    throw new Error(`Failed to download asset (${res.status} ${res.statusText})`)
  }

  const total = Number(res.headers.get('content-length')) || 0
  let received = 0

  const progressTracker = new Transform({
    transform(chunk: Buffer, _encoding, callback) {
      received += chunk.length
      if (total > 0) onProgress(Math.min(99, Math.round((received / total) * 100)))
      callback(null, chunk)
    }
  })

  await pipeline(
    Readable.fromWeb(res.body as WebReadableStream<Uint8Array>),
    progressTracker,
    fs.createWriteStream(destPath)
  )
}

// Compares two version-ish strings, tolerating a leading "v" and differing
// segment counts (e.g. "v1.2" vs "1.2.0"). Returns >0 if a > b, <0 if a < b.
export function compareVersions(a: string, b: string): number {
  const normalize = (v: string): number[] =>
    v
      .trim()
      .replace(/^v/i, '')
      .split(/[.-]/)
      .map((part) => parseInt(part, 10) || 0)

  const partsA = normalize(a)
  const partsB = normalize(b)
  const len = Math.max(partsA.length, partsB.length)

  for (let i = 0; i < len; i++) {
    const diff = (partsA[i] ?? 0) - (partsB[i] ?? 0)
    if (diff !== 0) return diff
  }
  return 0
}
