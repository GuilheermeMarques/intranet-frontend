import { Entity } from '@/core/entities/entity'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/optional'

export interface ClientProps {
  code: string
  name: string
  document: string
  zipCode: string
  street: string
  city: string
  state: string
  neighborhood: string
  number: string
  complement: string
  email: string
  phone: string
  instagram: string
  lastPurchaseAt?: Date | null
  purchaseCount: number
}

export class Client extends Entity<ClientProps> {
  get code() {
    return this.props.code
  }
  get name() {
    return this.props.name
  }
  get document() {
    return this.props.document
  }
  get zipCode() {
    return this.props.zipCode
  }
  get street() {
    return this.props.street
  }
  get city() {
    return this.props.city
  }
  get state() {
    return this.props.state
  }
  get neighborhood() {
    return this.props.neighborhood
  }
  get number() {
    return this.props.number
  }
  get complement() {
    return this.props.complement
  }
  get email() {
    return this.props.email
  }
  get phone() {
    return this.props.phone
  }
  get instagram() {
    return this.props.instagram
  }
  get lastPurchaseAt() {
    return this.props.lastPurchaseAt
  }
  get purchaseCount() {
    return this.props.purchaseCount
  }

  set name(v: string) {
    this.props.name = v
  }
  set document(v: string) {
    this.props.document = v
  }
  set zipCode(v: string) {
    this.props.zipCode = v
  }
  set street(v: string) {
    this.props.street = v
  }
  set city(v: string) {
    this.props.city = v
  }
  set state(v: string) {
    this.props.state = v
  }
  set neighborhood(v: string) {
    this.props.neighborhood = v
  }
  set number(v: string) {
    this.props.number = v
  }
  set complement(v: string) {
    this.props.complement = v
  }
  set email(v: string) {
    this.props.email = v
  }
  set phone(v: string) {
    this.props.phone = v
  }
  set instagram(v: string) {
    this.props.instagram = v
  }

  static create(
    props: Optional<ClientProps, 'lastPurchaseAt' | 'purchaseCount'>,
    id?: UniqueEntityID,
  ) {
    return new Client(
      {
        ...props,
        lastPurchaseAt: props.lastPurchaseAt ?? null,
        purchaseCount: props.purchaseCount ?? 0,
      },
      id,
    )
  }
}
