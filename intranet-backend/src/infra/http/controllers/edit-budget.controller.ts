import {
  Body,
  Controller,
  NotFoundException,
  Param,
  Patch,
} from '@nestjs/common'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { EditBudgetUseCase } from '@/domain/sales/application/use-cases/edit-budget'
import { BudgetPresenter } from '@/infra/http/presenters/budget-presenter'
import {
  editBudgetBodySchema,
  EditBudgetBodySchema,
} from './schemas/budget-body-schema'

@Controller('/budgets/:id')
export class EditBudgetController {
  constructor(private editBudget: EditBudgetUseCase) {}

  @Patch()
  async handle(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(editBudgetBodySchema)) body: EditBudgetBodySchema,
  ) {
    const result = await this.editBudget.execute({ id, ...body })
    if (result.isLeft()) throw new NotFoundException(result.value.message)
    return { budget: BudgetPresenter.toHTTP(result.value.budget) }
  }
}
