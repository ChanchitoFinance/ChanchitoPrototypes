import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { serverEnv } from '../../../../env-validation/config/env'

const s3Client = new S3Client({
  region: serverEnv.supabaseStorageRegion,
  endpoint: serverEnv.supabaseStorageEndpoint,
  credentials: {
    accessKeyId: serverEnv.supabaseStorageAccessKeyId,
    secretAccessKey: serverEnv.supabaseStorageSecretAccessKey,
  },
  forcePathStyle: true,
})

const BUCKET_NAME = serverEnv.supabaseStorageBucketName
const MAX_FILE_SIZE = 50 * 1024 * 1024

export class StorageService {
  static async uploadFile(
    file: File,
    folder: string = 'uploads'
  ): Promise<string> {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds maximum limit of 50MB`)
    }

    const fileName = `${folder}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: BUCKET_NAME,
        Key: fileName,
        Body: file,
        ContentType: file.type,
        ACL: 'public-read',
      },
    })

    const result = await upload.done()

    if (!result.Location) {
      throw new Error('Upload failed - no location returned')
    }

    // Construct the public Supabase storage URL
    const baseUrl = serverEnv.supabaseStorageEndpoint.replace(
      '/storage/v1/s3',
      ''
    )
    return `${baseUrl}/storage/v1/object/public/${BUCKET_NAME}/${fileName}`
  }

  static async deleteFile(url: string): Promise<void> {
    try {
      const urlParts = url.split('/')
      const fileName = urlParts.slice(-2).join('/')

      const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileName,
      })

      await s3Client.send(command)
    } catch (error) {
      console.error('Error deleting file:', error)
    }
  }

  static getMaxFileSize(): number {
    return MAX_FILE_SIZE
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}
