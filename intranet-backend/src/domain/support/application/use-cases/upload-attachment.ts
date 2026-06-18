import { Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { AttachmentsRepository } from '../repositories/attachments-repository'
import { Uploader } from '../storage/uploader'
import { Attachment, AttachmentType } from '../../enterprise/entities/attachment'
import { InvalidAttachmentTypeError } from './errors/invalid-attachment-type-error'

const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
const DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]

interface UploadAttachmentUseCaseRequest {
  ticketId: string
  fileName: string
  fileType: string
  body: Buffer
  size: number
  uploadedBy: string
}

type UploadAttachmentUseCaseResponse = Either<InvalidAttachmentTypeError, { attachment: Attachment }>

@Injectable()
export class UploadAttachmentUseCase {
  constructor(
    private attachmentsRepository: AttachmentsRepository,
    private uploader: Uploader,
  ) {}

  async execute({ ticketId, fileName, fileType, body, size, uploadedBy }: UploadAttachmentUseCaseRequest): Promise<UploadAttachmentUseCaseResponse> {
    const isImage = IMAGE_TYPES.includes(fileType)
    const isDocument = DOCUMENT_TYPES.includes(fileType)
    if (!isImage && !isDocument) return left(new InvalidAttachmentTypeError(fileType))

    const { url } = await this.uploader.upload({ fileName, fileType, body })

    const type: AttachmentType = isImage ? 'image' : 'document'
    const attachment = Attachment.create({
      ticketId: new UniqueEntityID(ticketId),
      name: fileName,
      url,
      type,
      size,
      uploadedBy,
    })

    await this.attachmentsRepository.create(attachment)
    return right({ attachment })
  }
}
