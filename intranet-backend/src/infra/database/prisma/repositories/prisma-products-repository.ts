import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../prisma.service'
import {
  ProductFilters,
  ProductsRepository,
} from '@/domain/sales/application/repositories/products-repository'
import { Product } from '@/domain/sales/enterprise/entities/product'
import { PrismaProductMapper } from '../mappers/prisma-product-mapper'

@Injectable()
export class PrismaProductsRepository implements ProductsRepository {
  constructor(private prisma: PrismaService) {}

  async findMany(filters: ProductFilters): Promise<Product[]> {
    const where: Prisma.ProductWhereInput = {}
    if (filters.code?.trim()) where.code = { contains: filters.code, mode: 'insensitive' }
    if (filters.name?.trim()) where.name = { contains: filters.name, mode: 'insensitive' }
    if (filters.supplier?.trim())
      where.supplier = { contains: filters.supplier, mode: 'insensitive' }
    if (filters.category?.trim()) where.category = filters.category

    const rows = await this.prisma.product.findMany({ where, orderBy: { name: 'asc' } })
    return rows.map(PrismaProductMapper.toDomain)
  }

  async findById(id: string): Promise<Product | null> {
    const row = await this.prisma.product.findUnique({ where: { id } })
    return row ? PrismaProductMapper.toDomain(row) : null
  }

  async findDistinctCategories(): Promise<string[]> {
    const rows = await this.prisma.product.findMany({
      distinct: ['category'],
      select: { category: true },
      where: { category: { not: null } },
      orderBy: { category: 'asc' },
    })
    return rows
      .map((r) => r.category)
      .filter((c): c is string => c !== null)
  }

  async findDistinctSuppliers(): Promise<string[]> {
    const rows = await this.prisma.product.findMany({
      distinct: ['supplier'],
      select: { supplier: true },
      orderBy: { supplier: 'asc' },
    })
    return rows.map((r) => r.supplier)
  }

  async count(): Promise<number> {
    return this.prisma.product.count()
  }

  async create(product: Product): Promise<void> {
    await this.prisma.product.create({ data: PrismaProductMapper.toPrisma(product) })
  }

  async save(product: Product): Promise<void> {
    const data = PrismaProductMapper.toPrisma(product)
    await this.prisma.product.update({ where: { id: data.id as string }, data })
  }

  async delete(product: Product): Promise<void> {
    await this.prisma.product.delete({ where: { id: product.id.toString() } })
  }
}
