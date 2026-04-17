import { NextResponse } from 'next/server'

import { readStore } from '@/lib/pixelperfect/store'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const requestedFileKey = searchParams.get('fileKey')
  const requestedNodeId = searchParams.get('nodeId')?.replace(/-/g, ':')
  const store = await readStore()
  const connectedFile = requestedFileKey
    ? store.connectedFiles.find((item) => item.fileKey === requestedFileKey)
    : store.connectedFiles[0]

  if (!connectedFile) {
    return NextResponse.json({
      fileKey: null,
      lastSyncedAt: null,
      components: [],
      latestResult: null,
    })
  }

  const latestResult = requestedNodeId
    ? store.syncResults
        .filter(
          (item) =>
            item.fileKey === connectedFile.fileKey && item.figmaNodeId === requestedNodeId
        )
        .sort((left, right) => right.comparedAt.localeCompare(left.comparedAt))[0] ?? null
    : store.syncResults
        .filter((item) => item.fileKey === connectedFile.fileKey)
        .sort((left, right) => right.comparedAt.localeCompare(left.comparedAt))[0] ?? null

  const components = store.figmaComponents
    .filter((item) => item.fileKey === connectedFile.fileKey)
    .map((component) => {
      const syncResult =
        store.syncResults
          .filter(
            (item) =>
              item.fileKey === connectedFile.fileKey &&
              item.figmaNodeId === component.nodeId
          )
          .sort((left, right) => right.comparedAt.localeCompare(left.comparedAt))[0] ?? null

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
    lastSyncedAt:
      connectedFile.lastSyncedAt ??
      store.syncResults
        .filter((item) => item.fileKey === connectedFile.fileKey)
        .map((item) => item.comparedAt)
        .sort((left, right) => right.localeCompare(left))[0] ??
      null,
    components,
    latestResult,
  })
}
