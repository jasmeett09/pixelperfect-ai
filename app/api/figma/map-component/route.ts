import { NextResponse } from 'next/server'
import { z } from 'zod'

import { upsertMapping } from '@/lib/pixelperfect/store'
import { createId } from '@/lib/pixelperfect/utils'

const schema = z.object({
  figmaNodeId: z.string().min(1),
  figmaName: z.string().min(1),
  codeComponentName: z.string().min(1),
  codePath: z.string().optional(),
  variant: z.string().optional(),
})

export async function POST(request: Request) {
  const body = await request.json()
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'A figma node and code component mapping is required.' },
      { status: 400 }
    )
  }

  const mapping = await upsertMapping({
    id: createId('map'),
    ...parsed.data,
    updatedAt: new Date().toISOString(),
  })

  return NextResponse.json({
    success: true,
    mappingSaved: true,
    mapping,
  })
}
