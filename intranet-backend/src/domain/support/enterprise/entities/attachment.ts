import { Entity } from '@/core/entities/entity'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/optional'

export type AttachmentType = 'image' | 'document' | 'other'

export interface AttachmentProps {
  ticketId: UniqueEntityID
  messageId?: UniqueEntityID | null
  name: string
  url: string
  type: AttachmentType
  size: number
  uploadedBy: string
  createdAt: Date
}

export class Attachment extends Entity<AttachmentProps> {
  get ticketId() {
    return this.props.ticketId
  }
  get messageId() {
    return this.props.messageId
  }
  get name() {
    return this.props.name
  }
  get url() {
    return this.props.url
  }
  get type() {
    return this.props.type
  }
  get size() {
    return this.props.size
  }
  get uploadedBy() {
    return this.props.uploadedBy
  }
  get createdAt() {
    return this.props.createdAt
  }

  static create(
    props: Optional<AttachmentProps, 'messageId' | 'createdAt'>,
    id?: UniqueEntityID,
  ) {
    return new Attachment(
      {
        ...props,
        messageId: props.messageId ?? null,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    )
  }
}
