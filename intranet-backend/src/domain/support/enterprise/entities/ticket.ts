import { Entity } from '@/core/entities/entity'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/optional'
import { Message } from './message'

export type TicketStatus = 'todo' | 'inProgress' | 'inReview' | 'done'

export interface TicketProps {
  title: string
  description: string
  status: TicketStatus
  priorityId: string
  assignee: string
  reporter: string
  category: string
  tags: string[]
  messages: Message[]
  createdAt: Date
  updatedAt?: Date | null
}

export class Ticket extends Entity<TicketProps> {
  get title() {
    return this.props.title
  }
  get description() {
    return this.props.description
  }
  get status() {
    return this.props.status
  }
  get priorityId() {
    return this.props.priorityId
  }
  get assignee() {
    return this.props.assignee
  }
  get reporter() {
    return this.props.reporter
  }
  get category() {
    return this.props.category
  }
  get tags() {
    return this.props.tags
  }
  get messages() {
    return this.props.messages
  }
  get createdAt() {
    return this.props.createdAt
  }
  get updatedAt() {
    return this.props.updatedAt
  }

  set title(v: string) {
    this.props.title = v
    this.touch()
  }
  set description(v: string) {
    this.props.description = v
    this.touch()
  }
  set status(v: TicketStatus) {
    this.props.status = v
    this.touch()
  }
  set priorityId(v: string) {
    this.props.priorityId = v
    this.touch()
  }
  set assignee(v: string) {
    this.props.assignee = v
    this.touch()
  }
  set category(v: string) {
    this.props.category = v
    this.touch()
  }
  set tags(v: string[]) {
    this.props.tags = v
    this.touch()
  }

  private touch() {
    this.props.updatedAt = new Date()
  }

  static create(
    props: Optional<
      TicketProps,
      'status' | 'tags' | 'messages' | 'createdAt'
    >,
    id?: UniqueEntityID,
  ) {
    return new Ticket(
      {
        ...props,
        status: props.status ?? 'todo',
        tags: props.tags ?? [],
        messages: props.messages ?? [],
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    )
  }
}
