import { NextResponse } from 'next/server'
import { z } from 'zod'

import { compareComponent } from '@/lib/pixelperfect/comparison'
import { importFigmaComponents } from '@/lib/pixelperfect/figma'
import { readStore, replaceFigmaComponents, upsertConnectedFile, upsertSyncResult, writeStore } from '@/lib/pixelperfect/store'

const schema = z.object({
  event_type: z.string(),
  file_key: z.string().min(1),
  passcode: z.string().min(1),
})

export async function POST(request: Request) {
  const body = await request.json()
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { received: false, verified: false, error: 'Invalid webhook payload.' },
      { status: 400 }
    )
  }

  const expectedPasscode = process.env.FIGMA_WEBHOOK_PASSCODE ?? 'pixelperfect-secret'
  const verified = parsed.data.passcode === expectedPasscode

  if (!verified) {
    return NextResponse.json(
      { received: true, verified: false, reimportTriggered: false, syncTriggered: false },
      { status: 401 }
    )
  }

  const store = await readStore()
  const connectedFile = store.connectedFiles.find((item) => item.fileKey === parsed.data.file_key)

  if (!connectedFile) {
    return NextResponse.json({
      received: true,
      verified: true,
      reimportTriggered: false,
      syncTriggered: false,
    })
  }

  const existingNodeIds =
    store.figmaComponents
      .filter((item) => item.fileKey === connectedFile.fileKey)
      .map((item) => item.nodeId) ||
    (connectedFile.nodeId ? [connectedFile.nodeId] : [])

  const nodeIds = existingNodeIds.length > 0 ? existingNodeIds : ['12:44']
  const components = await importFigmaComponents(connectedFile.fileKey, nodeIds)
  await replaceFigmaComponents(connectedFile.fileKey, components)

  for (const component of components) {
    const snapshot = store.implementationSnapshots.find(
      (item) => item.componentType === component.componentType
    )

    if (!snapshot) {
      continue
    }

    const result = await compareComponent(component, snapshot)
    await upsertSyncResult(result)
  }

  await upsertConnectedFile({
    ...connectedFile,
    lastSyncedAt: new Date().toISOString(),
  })

  const refreshedStore = await readStore()
  refreshedStore.syncResults = refreshedStore.syncResults.map((result) =>
    result.fileKey === connectedFile.fileKey
      ? {
          ...result,
          comparedAt: new Date().toISOString(),
        }
      : result
  )
  await writeStore(refreshedStore)

  return NextResponse.json({
    received: true,
    verified: true,
    reimportTriggered: true,
    syncTriggered: true,
  })
}
