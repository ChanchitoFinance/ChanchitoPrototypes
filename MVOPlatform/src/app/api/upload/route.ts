import { NextRequest, NextResponse } from 'next/server'
import { StorageService } from '@/core/lib/services/storageService'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = (formData.get('folder') as string) || 'uploads'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (file.size > StorageService.getMaxFileSize()) {
      return NextResponse.json(
        {
          error: `File size exceeds maximum limit of ${StorageService.formatFileSize(StorageService.getMaxFileSize())}`,
        },
        { status: 400 }
      )
    }

    const url = await StorageService.uploadFile(file, folder)

    return NextResponse.json({ url })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Upload failed',
      },
      { status: 500 }
    )
  }
}
