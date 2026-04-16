import { NextResponse } from 'next/server'
import { z } from 'zod'

import { getFigmaAuthMode, isFigmaConfigured } from '@/lib/pixelperfect/figma-auth'
import { fetchFigmaFileMeta } from '@/lib/pixelperfect/figma'
import { upsertConnectedFile } from '@/lib/pixelperfect/store'
import { createId, parseFigmaUrl } from '@/lib/pixelperfect/utils'

const schema = z.object({
  figmaUrl: z.string().url(),
})

export async function POST(request: Request) {
  const body = await request.json()
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'A valid Figma URL is required.' },
      { status: 400 }
    )
  }

  const figmaMeta = parseFigmaUrl(parsed.data.figmaUrl)

  if (!figmaMeta) {
    return NextResponse.json(
      { success: false, error: 'Could not parse a Figma file key from the URL.' },
      { status: 400 }
    )
  }

  const fileMeta = await fetchFigmaFileMeta(figmaMeta.fileKey)
  const connectedFile = await upsertConnectedFile({
    id: createId('file'),
    fileKey: figmaMeta.fileKey,
    nodeId: figmaMeta.nodeId,
    figmaUrl: parsed.data.figmaUrl,
    fileName: fileMeta.fileName,
    createdAt: new Date().toISOString(),
  })

  return NextResponse.json({
    success: true,
    fileKey: connectedFile.fileKey,
    nodeId: connectedFile.nodeId,
    fileName: connectedFile.fileName,
    source: fileMeta.source,
    authMode: getFigmaAuthMode(),
    figmaConfigured: isFigmaConfigured(),
  })
}
