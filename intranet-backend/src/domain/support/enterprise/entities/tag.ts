import { Entity } from '@/core/entities/entity'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/optional'

export interface TagProps {
  name: string
  color: string
  description?: string | null
  category?: string | null
  isActive: boolean
}

export class Tag extends Entity<TagProps> {
  get name() {
    return this.props.name
  }
  get color() {
    return this.props.color
  }
  get description() {
    return this.props.description
  }
  get category() {
    return this.props.category
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
  set description(v: string | null | undefined) {
    this.props.description = v
  }
  set category(v: string | null | undefined) {
    this.props.category = v
  }
  set isActive(v: boolean) {
    this.props.isActive = v
  }

  static create(
    props: Optional<TagProps, 'isActive' | 'description' | 'category'>,
    id?: UniqueEntityID,
  ) {
    return new Tag(
      {
        ...props,
        isActive: props.isActive ?? true,
        description: props.description ?? null,
        category: props.category ?? null,
      },
      id,
    )
  }
}
