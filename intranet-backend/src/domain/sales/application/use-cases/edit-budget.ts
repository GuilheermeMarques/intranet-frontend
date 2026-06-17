import { Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { BudgetsRepository } from '../repositories/budgets-repository'
import { ProductsRepository } from '../repositories/products-repository'
import { Budget, BudgetStatus } from '../../enterprise/entities/budget'
import { BudgetItem } from '../../enterprise/entities/budget-item'

interface EditBudgetItemInput {
  productId: string
  quantity: number
  unitPrice?: number
}

interface EditBudgetUseCaseRequest {
  id: string
  status?: BudgetStatus
  validityDate?: Date | null
  items?: EditBudgetItemInput[]
}

type EditBudgetUseCaseResponse = Either<ResourceNotFoundError, { budget: Budget }>

@Injectable()
export class EditBudgetUseCase {
  constructor(
    private budgetsRepository: BudgetsRepository,
    private productsRepository: ProductsRepository,
  ) {}

  async execute({ id, status, validityDate, items }: EditBudgetUseCaseRequest): Promise<EditBudgetUseCaseResponse> {
    const budget = await this.budgetsRepository.findById(id)
    if (!budget) return left(new ResourceNotFoundError())

    if (items) {
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
      budget.items = budgetItems
    }

    if (status !== undefined) budget.status = status
    if (validityDate !== undefined) budget.validityDate = validityDate

    await this.budgetsRepository.save(budget)
    return right({ budget })
  }
}
