import { Controller, Get, Query } from '@nestjs/common'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { FetchBudgetsUseCase } from '@/domain/sales/application/use-cases/fetch-budgets'
import { BudgetPresenter } from '@/infra/http/presenters/budget-presenter'
import {
  budgetQuerySchema,
  BudgetQuerySchema,
} from './schemas/budget-body-schema'

@Controller('/budgets')
export class FetchBudgetsController {
  constructor(private fetchBudgets: FetchBudgetsUseCase) {}

  @Get()
  async handle(
    @Query(new ZodValidationPipe(budgetQuerySchema)) query: BudgetQuerySchema,
  ) {
    const result = await this.fetchBudgets.execute({
      filters: {
        budgetNumber: query.budgetNumber,
        clientId: query.clientId,
        responsibleId: query.responsibleId,
        status: query.status,
        startDate: query.startDate,
        endDate: query.endDate,
      },
    })

    const { budgets } = result.value!

    return { budgets: budgets.map(BudgetPresenter.toHTTP) }
  }
}
