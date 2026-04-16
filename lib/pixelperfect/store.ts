import { mkdir, readFile, writeFile } from 'node:fs/promises'
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

export async function readStore() {
  await ensureStore()
  const raw = await readFile(DATA_FILE, 'utf8')
  return JSON.parse(raw) as PixelPerfectStore
}

export async function writeStore(store: PixelPerfectStore) {
  await ensureStore()
  await writeFile(DATA_FILE, JSON.stringify(store, null, 2), 'utf8')
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
  store.figmaComponents = [
    ...store.figmaComponents.filter((item) => item.fileKey !== fileKey),
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
    ...store.syncResults.filter((item) => item.figmaNodeId !== result.figmaNodeId),
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
