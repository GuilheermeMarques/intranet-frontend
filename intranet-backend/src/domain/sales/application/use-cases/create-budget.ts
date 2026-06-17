import { Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { BudgetsRepository } from '../repositories/budgets-repository'
import { ClientsRepository } from '../repositories/clients-repository'
import { RepresentativesRepository } from '../repositories/representatives-repository'
import { ProductsRepository } from '../repositories/products-repository'
import { Budget } from '../../enterprise/entities/budget'
import { BudgetItem } from '../../enterprise/entities/budget-item'

interface CreateBudgetItemInput {
  productId: string
  quantity: number
  unitPrice?: number
}

interface CreateBudgetUseCaseRequest {
  clientId: string
  responsibleId: string
  validityDate?: Date
  items: CreateBudgetItemInput[]
}

type CreateBudgetUseCaseResponse = Either<ResourceNotFoundError, { budget: Budget }>

@Injectable()
export class CreateBudgetUseCase {
  constructor(
    private budgetsRepository: BudgetsRepository,
    private clientsRepository: ClientsRepository,
    private representativesRepository: RepresentativesRepository,
    private productsRepository: ProductsRepository,
  ) {}

  async execute({
    clientId,
    responsibleId,
    validityDate,
    items,
  }: CreateBudgetUseCaseRequest): Promise<CreateBudgetUseCaseResponse> {
    const client = await this.clientsRepository.findById(clientId)
    if (!client) return left(new ResourceNotFoundError())

    const representative = await this.representativesRepository.findById(responsibleId)
    if (!representative) return left(new ResourceNotFoundError())

    const budgetItems: BudgetItem[] = []
    for (const item of items) {
      const product = await this.productsRepository.findById(item.productId)
      if (!product) return left(new ResourceNotFoundError())
      budgetItems.push(
        BudgetItem.create({
          productId: product.id.toString(),
          productCode: product.code,
          productName: product.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice ?? product.price,
        }),
      )
    }

    const count = await this.budgetsRepository.count()
    const number = `ORC-2025-${String(count + 1).padStart(3, '0')}`

    const budget = Budget.create({
      number,
      clientId: client.id.toString(),
      clientName: client.name,
      responsibleId: representative.id.toString(),
      responsibleName: representative.name,
      validityDate: validityDate ?? null,
      items: budgetItems,
    })

    await this.budgetsRepository.create(budget)
    return right({ budget })
  }
}
