import { NextResponse } from 'next/server'
import { z } from 'zod'

import { storeUploadedImplementation } from '@/lib/pixelperfect/implementation'
import { addImplementationSnapshot } from '@/lib/pixelperfect/store'

const componentSchema = z.enum(['Button', 'Input', 'Card']).default('Button')

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file')
  const componentType = componentSchema.parse(formData.get('componentType') ?? 'Button')

  if (!(file instanceof File)) {
    return NextResponse.json(
      { success: false, error: 'An image file is required.' },
      { status: 400 }
    )
  }

  const snapshot = await storeUploadedImplementation(file, componentType)
  await addImplementationSnapshot(snapshot)

  return NextResponse.json({
    success: true,
    imageUrl: snapshot.imageUrl,
    snapshot,
  })
}
