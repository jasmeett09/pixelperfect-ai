import { NextResponse } from 'next/server'
import { z } from 'zod'

import { importFigmaComponents } from '@/lib/pixelperfect/figma'
import { replaceFigmaComponents } from '@/lib/pixelperfect/store'

const schema = z.object({
  fileKey: z.string().min(1),
  nodeIds: z.array(z.string().min(1)).min(1),
})

export async function POST(request: Request) {
  const body = await request.json()
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'fileKey and at least one nodeId are required.' },
      { status: 400 }
    )
  }

  try {
    const normalizedNodeIds = parsed.data.nodeIds.map((nodeId) => nodeId.replace(/-/g, ':'))
    const components = await importFigmaComponents(parsed.data.fileKey, normalizedNodeIds)
    await replaceFigmaComponents(parsed.data.fileKey, components)

    return NextResponse.json({
      success: true,
      imported: components.length,
      components,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Figma import failed. Check the file key, node id, and server-side Figma integration.',
      },
      { status: 502 }
    )
  }
}
