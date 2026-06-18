import { Entity } from '@/core/entities/entity'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/optional'

export type MessageType = 'comment' | 'status_update' | 'assignment'

export interface MessageProps {
  ticketId: UniqueEntityID
  author: string
  content: string
  type: MessageType
  mentions: string[]
  createdAt: Date
}

export class Message extends Entity<MessageProps> {
  get ticketId() {
    return this.props.ticketId
  }
  get author() {
    return this.props.author
  }
  get content() {
    return this.props.content
  }
  get type() {
    return this.props.type
  }
  get mentions() {
    return this.props.mentions
  }
  get createdAt() {
    return this.props.createdAt
  }

  static create(
    props: Optional<MessageProps, 'mentions' | 'createdAt' | 'type'>,
    id?: UniqueEntityID,
  ) {
    return new Message(
      {
        ...props,
        type: props.type ?? 'comment',
        mentions: props.mentions ?? [],
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    )
  }
}
