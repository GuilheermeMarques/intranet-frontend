import { Entity } from '@/core/entities/entity'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/optional'

export interface ProductProps {
  code: string
  name: string
  description: string
  price: number
  stockQuantity: number
  lastSaleAt?: Date | null
  supplier: string
  category?: string | null
  imageUrl?: string | null
  active: boolean
}

export class Product extends Entity<ProductProps> {
  get code() {
    return this.props.code
  }
  get name() {
    return this.props.name
  }
  get description() {
    return this.props.description
  }
  get price() {
    return this.props.price
  }
  get stockQuantity() {
    return this.props.stockQuantity
  }
  get lastSaleAt() {
    return this.props.lastSaleAt
  }
  get supplier() {
    return this.props.supplier
  }
  get category() {
    return this.props.category
  }
  get imageUrl() {
    return this.props.imageUrl
  }
  get active() {
    return this.props.active
  }

  set name(v: string) {
    this.props.name = v
  }
  set description(v: string) {
    this.props.description = v
  }
  set price(v: number) {
    this.props.price = v
  }
  set stockQuantity(v: number) {
    this.props.stockQuantity = v
  }
  set lastSaleAt(v: Date | null | undefined) {
    this.props.lastSaleAt = v
  }
  set supplier(v: string) {
    this.props.supplier = v
  }
  set category(v: string | null | undefined) {
    this.props.category = v
  }
  set imageUrl(v: string | null | undefined) {
    this.props.imageUrl = v
  }
  set active(v: boolean) {
    this.props.active = v
  }

  static create(
    props: Optional<
      ProductProps,
      'active' | 'lastSaleAt' | 'category' | 'imageUrl'
    >,
    id?: UniqueEntityID,
  ) {
    return new Product(
      {
        ...props,
        active: props.active ?? true,
        lastSaleAt: props.lastSaleAt ?? null,
        category: props.category ?? null,
        imageUrl: props.imageUrl ?? null,
      },
      id,
    )
  }
}
