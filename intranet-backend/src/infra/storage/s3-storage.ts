import { UploadParams, Uploader } from '@/domain/support/application/storage/uploader'
import {
  CreateBucketCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { Injectable } from '@nestjs/common'
import { EnvService } from '../env/env.service'
import { randomUUID } from 'node:crypto'

@Injectable()
export class S3Storage implements Uploader {
  private client: S3Client
  private bucketReady = false

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

  private async ensureBucket(): Promise<void> {
    if (this.bucketReady) return
    const Bucket = this.envService.get('S3_BUCKET')
    try {
      await this.client.send(new HeadBucketCommand({ Bucket }))
    } catch {
      await this.client.send(new CreateBucketCommand({ Bucket }))
    }
    this.bucketReady = true
  }

  async upload({ fileName, fileType, body }: UploadParams): Promise<{ url: string }> {
    await this.ensureBucket()

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
