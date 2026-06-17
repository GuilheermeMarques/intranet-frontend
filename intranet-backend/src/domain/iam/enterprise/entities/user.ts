import { Entity } from '@/core/entities/entity'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/optional'

export interface UserProps {
  name: string
  email: string
  passwordHash: string
  isActive: boolean
  avatar?: string | null
  jobTitle?: string | null
  department?: string | null
  lastLoginAt?: Date | null
}

export class User extends Entity<UserProps> {
  get name() {
    return this.props.name
  }

  get email() {
    return this.props.email
  }

  get passwordHash() {
    return this.props.passwordHash
  }

  get isActive() {
    return this.props.isActive
  }

  get avatar() {
    return this.props.avatar
  }

  get jobTitle() {
    return this.props.jobTitle
  }

  get department() {
    return this.props.department
  }

  get lastLoginAt() {
    return this.props.lastLoginAt
  }

  static create(props: Optional<UserProps, 'isActive'>, id?: UniqueEntityID) {
    const user = new User({ ...props, isActive: props.isActive ?? true }, id)
    return user
  }
}
