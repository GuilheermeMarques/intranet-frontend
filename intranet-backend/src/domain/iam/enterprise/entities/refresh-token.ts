import { Entity } from '@/core/entities/entity'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/optional'

export interface RefreshTokenProps {
  userId: UniqueEntityID
  token: string
  expiresAt: Date
  revokedAt?: Date | null
  createdAt: Date
}

export class RefreshToken extends Entity<RefreshTokenProps> {
  get userId() { return this.props.userId }
  get token() { return this.props.token }
  get expiresAt() { return this.props.expiresAt }
  get revokedAt() { return this.props.revokedAt }
  get createdAt() { return this.props.createdAt }

  get isExpired() { return this.props.expiresAt.getTime() < Date.now() }
  get isRevoked() { return this.props.revokedAt !== null && this.props.revokedAt !== undefined }
  get isValid() { return !this.isExpired && !this.isRevoked }

  revoke() { this.props.revokedAt = new Date() }

  static create(props: Optional<RefreshTokenProps, 'createdAt'>, id?: UniqueEntityID) {
    return new RefreshToken({ ...props, createdAt: props.createdAt ?? new Date() }, id)
  }
}
