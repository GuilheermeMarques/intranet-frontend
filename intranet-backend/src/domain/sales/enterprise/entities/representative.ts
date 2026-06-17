import { Entity } from '@/core/entities/entity'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/optional'

export interface RepresentativeProps {
  name: string
  email: string
  phone: string
  region: string
  status: string
  totalSales: number
  monthlyGoal: number
  clientsCount: number
  lastActivity?: Date | null
  avatar?: string | null
}

export class Representative extends Entity<RepresentativeProps> {
  get name() {
    return this.props.name
  }
  get email() {
    return this.props.email
  }
  get phone() {
    return this.props.phone
  }
  get region() {
    return this.props.region
  }
  get status() {
    return this.props.status
  }
  get totalSales() {
    return this.props.totalSales
  }
  get monthlyGoal() {
    return this.props.monthlyGoal
  }
  get clientsCount() {
    return this.props.clientsCount
  }
  get lastActivity() {
    return this.props.lastActivity
  }
  get avatar() {
    return this.props.avatar
  }

  static create(
    props: Optional<RepresentativeProps, 'lastActivity' | 'avatar'>,
    id?: UniqueEntityID,
  ) {
    return new Representative(
      {
        ...props,
        lastActivity: props.lastActivity ?? null,
        avatar: props.avatar ?? null,
      },
      id,
    )
  }
}
