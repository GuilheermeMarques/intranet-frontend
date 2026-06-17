import { Body, Controller, NotFoundException, Post } from '@nestjs/common'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { CreateBudgetUseCase } from '@/domain/sales/application/use-cases/create-budget'
import { BudgetPresenter } from '@/infra/http/presenters/budget-presenter'
import {
  createBudgetBodySchema,
  CreateBudgetBodySchema,
} from './schemas/budget-body-schema'

@Controller('/budgets')
export class CreateBudgetController {
  constructor(private createBudget: CreateBudgetUseCase) {}

  @Post()
  async handle(
    @Body(new ZodValidationPipe(createBudgetBodySchema))
    body: CreateBudgetBodySchema,
  ) {
    const result = await this.createBudget.execute(body)
    if (result.isLeft()) throw new NotFoundException(result.value.message)
    return { budget: BudgetPresenter.toHTTP(result.value.budget) }
  }
}
