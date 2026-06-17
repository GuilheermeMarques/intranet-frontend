import { Entity } from '@/core/entities/entity'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

export interface PermissionProps {
  key: string
  name: string
  description?: string | null
  category?: string | null
}

export class Permission extends Entity<PermissionProps> {
  get key() { return this.props.key }
  get name() { return this.props.name }
  get description() { return this.props.description }
  get category() { return this.props.category }

  static create(props: PermissionProps, id?: UniqueEntityID) {
    return new Permission(props, id)
  }
}
