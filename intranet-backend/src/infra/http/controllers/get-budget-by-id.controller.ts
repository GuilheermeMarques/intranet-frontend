import { Controller, Get, NotFoundException, Param } from '@nestjs/common'
import { GetBudgetByIdUseCase } from '@/domain/sales/application/use-cases/get-budget-by-id'
import { BudgetPresenter } from '@/infra/http/presenters/budget-presenter'

@Controller('/budgets/:id')
export class GetBudgetByIdController {
  constructor(private getBudgetById: GetBudgetByIdUseCase) {}

  @Get()
  async handle(@Param('id') id: string) {
    const result = await this.getBudgetById.execute({ id })
    if (result.isLeft()) throw new NotFoundException(result.value.message)
    return { budget: BudgetPresenter.toHTTP(result.value.budget) }
  }
}
