import { Entity } from '@/core/entities/entity'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/optional'

export interface PriorityProps {
  name: string
  color: string
  level: number
  description?: string | null
  isActive: boolean
}

export class Priority extends Entity<PriorityProps> {
  get name() {
    return this.props.name
  }
  get color() {
    return this.props.color
  }
  get level() {
    return this.props.level
  }
  get description() {
    return this.props.description
  }
  get isActive() {
    return this.props.isActive
  }

  set name(v: string) {
    this.props.name = v
  }
  set color(v: string) {
    this.props.color = v
  }
  set level(v: number) {
    this.props.level = v
  }
  set description(v: string | null | undefined) {
    this.props.description = v
  }
  set isActive(v: boolean) {
    this.props.isActive = v
  }

  static create(
    props: Optional<PriorityProps, 'isActive' | 'description'>,
    id?: UniqueEntityID,
  ) {
    return new Priority(
      {
        ...props,
        isActive: props.isActive ?? true,
        description: props.description ?? null,
      },
      id,
    )
  }
}
