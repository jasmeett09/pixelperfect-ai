import { copyFile, mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'

import type {
  CodeComponentMapping,
  ConnectedFile,
  FigmaComponent,
  ImplementationSnapshot,
  PixelPerfectStore,
  SyncResult,
} from '@/lib/pixelperfect/types'

const DATA_DIR = path.join(process.cwd(), '.pixelperfect')
const DATA_FILE = path.join(DATA_DIR, 'store.json')
const DATA_FILE_TEMP = path.join(DATA_DIR, 'store.tmp.json')
const DATA_FILE_BACKUP = path.join(DATA_DIR, 'store.corrupt.json')

const emptyStore = (): PixelPerfectStore => ({
  connectedFiles: [],
  figmaComponents: [],
  mappings: [],
  implementationSnapshots: [],
  syncResults: [],
})

async function ensureStore() {
  await mkdir(DATA_DIR, { recursive: true })

  try {
    await readFile(DATA_FILE, 'utf8')
  } catch {
    await writeFile(DATA_FILE, JSON.stringify(emptyStore(), null, 2), 'utf8')
  }
}

function isStoreShape(value: unknown): value is PixelPerfectStore {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<PixelPerfectStore>

  return (
    Array.isArray(candidate.connectedFiles) &&
    Array.isArray(candidate.figmaComponents) &&
    Array.isArray(candidate.mappings) &&
    Array.isArray(candidate.implementationSnapshots) &&
    Array.isArray(candidate.syncResults)
  )
}

export async function readStore() {
  await ensureStore()
  const raw = await readFile(DATA_FILE, 'utf8')

  try {
    const parsed = JSON.parse(raw) as unknown

    if (isStoreShape(parsed)) {
      return parsed
    }
  } catch {
    await copyFile(DATA_FILE, DATA_FILE_BACKUP).catch(() => null)
  }

  const empty = emptyStore()
  await writeFile(DATA_FILE, JSON.stringify(empty, null, 2), 'utf8')
  return empty
}

export async function writeStore(store: PixelPerfectStore) {
  await ensureStore()
  const serialized = JSON.stringify(store, null, 2)
  await writeFile(DATA_FILE_TEMP, serialized, 'utf8')
  await rename(DATA_FILE_TEMP, DATA_FILE)
}

export async function upsertConnectedFile(record: ConnectedFile) {
  const store = await readStore()
  store.connectedFiles = [
    record,
    ...store.connectedFiles.filter((item) => item.fileKey !== record.fileKey),
  ]
  await writeStore(store)
  return record
}

export async function replaceFigmaComponents(fileKey: string, components: FigmaComponent[]) {
  const store = await readStore()
  const replacedNodeIds = new Set(components.map((item) => `${item.fileKey}:${item.nodeId}`))
  store.figmaComponents = [
    ...store.figmaComponents.filter((item) => !replacedNodeIds.has(`${item.fileKey}:${item.nodeId}`)),
    ...components,
  ]
  await writeStore(store)
  return components
}

export async function upsertMapping(mapping: CodeComponentMapping) {
  const store = await readStore()
  store.mappings = [
    mapping,
    ...store.mappings.filter((item) => item.figmaNodeId !== mapping.figmaNodeId),
  ]
  await writeStore(store)
  return mapping
}

export async function addImplementationSnapshot(snapshot: ImplementationSnapshot) {
  const store = await readStore()
  store.implementationSnapshots = [
    snapshot,
    ...store.implementationSnapshots.filter((item) => item.id !== snapshot.id),
  ]
  await writeStore(store)
  return snapshot
}

export async function upsertSyncResult(result: SyncResult) {
  const store = await readStore()
  store.syncResults = [
    result,
    ...store.syncResults.filter(
      (item) =>
        !(
          item.fileKey === result.fileKey &&
          item.figmaNodeId === result.figmaNodeId
        )
    ),
  ]
  store.connectedFiles = store.connectedFiles.map((file) =>
    file.fileKey === result.fileKey
      ? {
          ...file,
          lastSyncedAt: result.comparedAt,
        }
      : file
  )
  await writeStore(store)
  return result
}
