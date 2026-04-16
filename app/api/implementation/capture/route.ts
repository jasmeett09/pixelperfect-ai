import { NextResponse } from 'next/server'
import { z } from 'zod'

import { captureImplementationFromUrl } from '@/lib/pixelperfect/implementation'
import { addImplementationSnapshot } from '@/lib/pixelperfect/store'

export const runtime = 'nodejs'

const schema = z.object({
  url: z.string().url(),
  componentType: z.enum(['Button', 'Input', 'Card']).default('Button'),
})

export async function POST(request: Request) {
  const body = await request.json()
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'A valid implementation URL is required.' },
      { status: 400 }
    )
  }

  try {
    const snapshot = await captureImplementationFromUrl(
      parsed.data.url,
      parsed.data.componentType
    )
    await addImplementationSnapshot(snapshot)

    return NextResponse.json({
      success: true,
      screenshotUrl: snapshot.imageUrl,
      tokens: snapshot.tokens,
      snapshot,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Could not capture the live website. Check the URL and browser runtime.',
      },
      { status: 502 }
    )
  }
}
