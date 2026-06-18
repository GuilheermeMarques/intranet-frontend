import { Attachment } from '@/domain/support/enterprise/entities/attachment'

export class AttachmentPresenter {
  static toHTTP(attachment: Attachment) {
    return {
      id: attachment.id.toString(),
      name: attachment.name,
      url: attachment.url,
      type: attachment.type,
      size: attachment.size,
      uploadedBy: attachment.uploadedBy,
      uploadedAt: attachment.createdAt.toISOString(),
    }
  }
}
