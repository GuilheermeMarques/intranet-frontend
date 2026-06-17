import { UploadParams, Uploader } from '@/domain/support/application/storage/uploader'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { Injectable } from '@nestjs/common'
import { EnvService } from '../env/env.service'
import { randomUUID } from 'node:crypto'

@Injectable()
export class S3Storage implements Uploader {
  private client: S3Client

  constructor(private envService: EnvService) {
    this.client = new S3Client({
      endpoint: envService.get('S3_ENDPOINT'),
      region: envService.get('S3_REGION'),
      forcePathStyle: envService.get('S3_FORCE_PATH_STYLE'),
      credentials: {
        accessKeyId: envService.get('S3_ACCESS_KEY') ?? '',
        secretAccessKey: envService.get('S3_SECRET_KEY') ?? '',
      },
    })
  }

  async upload({ fileName, fileType, body }: UploadParams): Promise<{ url: string }> {
    const uploadId = randomUUID()
    const uniqueFileName = `${uploadId}-${fileName}`

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.envService.get('S3_BUCKET'),
        Key: uniqueFileName,
        ContentType: fileType,
        Body: body,
      }),
    )

    return { url: uniqueFileName }
  }
}
