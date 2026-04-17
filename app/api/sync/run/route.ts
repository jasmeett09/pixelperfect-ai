import { NextResponse } from 'next/server'
import { z } from 'zod'

import { compareComponent } from '@/lib/pixelperfect/comparison'
import { readStore, upsertSyncResult } from '@/lib/pixelperfect/store'

const schema = z.object({
  fileKey: z.string().min(1),
  figmaNodeId: z.string().min(1),
  codeComponentName: z.string().optional(),
  componentType: z.enum(['Button', 'Input', 'Card']).optional(),
  implementationSnapshotId: z.string().optional(),
  focusNode: z.boolean().optional(),
})

export async function POST(request: Request) {
  const body = await request.json()
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'fileKey and figmaNodeId are required.' },
      { status: 400 }
    )
  }

  const store = await readStore()
  const component = store.figmaComponents.find(
    (item) =>
      item.fileKey === parsed.data.fileKey &&
      item.nodeId === parsed.data.figmaNodeId.replace(/-/g, ':')
  )

  if (!component) {
    return NextResponse.json(
      { success: false, error: 'No imported Figma component found for that node.' },
      { status: 404 }
    )
  }

  const latestMatchingSnapshot = [...store.implementationSnapshots]
    .filter((item) => item.componentType === (parsed.data.componentType ?? component.componentType))
    .sort((left, right) => (right.capturedAt ?? '').localeCompare(left.capturedAt ?? ''))[0]

  const snapshot = parsed.data.implementationSnapshotId
    ? store.implementationSnapshots.find((item) => item.id === parsed.data.implementationSnapshotId)
    : latestMatchingSnapshot

  if (!snapshot) {
    return NextResponse.json(
      { success: false, error: 'Capture or upload an implementation first.' },
      { status: 404 }
    )
  }

  const result = await compareComponent(component, snapshot, {
    focusNode: parsed.data.focusNode ?? false,
  })
  await upsertSyncResult(result)

  return NextResponse.json({
    success: true,
    status: result.status,
    component: result.componentName,
    mismatches: result.mismatches,
    result,
  })
}
