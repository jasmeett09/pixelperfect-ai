import { NextResponse } from 'next/server'

import { readStore } from '@/lib/pixelperfect/store'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const requestedFileKey = searchParams.get('fileKey')
  const store = await readStore()
  const connectedFile = requestedFileKey
    ? store.connectedFiles.find((item) => item.fileKey === requestedFileKey)
    : store.connectedFiles[0]

  if (!connectedFile) {
    return NextResponse.json({
      fileKey: null,
      lastSyncedAt: null,
      components: [],
    })
  }

  const components = store.figmaComponents
    .filter((item) => item.fileKey === connectedFile.fileKey)
    .map((component) => {
      const syncResult = store.syncResults.find((item) => item.figmaNodeId === component.nodeId)

      return {
        name: component.name,
        nodeId: component.nodeId,
        status: syncResult?.status ?? 'pending',
        issueCount: syncResult?.mismatchCount ?? 0,
        componentType: component.componentType,
        figmaPreviewUrl: component.previewUrl,
      }
    })

  return NextResponse.json({
    fileKey: connectedFile.fileKey,
    lastSyncedAt: connectedFile.lastSyncedAt ?? null,
    components,
  })
}
