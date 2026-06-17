import {
  Controller,
  Delete,
  HttpCode,
  NotFoundException,
  Param,
} from '@nestjs/common'
import { DeleteBudgetUseCase } from '@/domain/sales/application/use-cases/delete-budget'

@Controller('/budgets/:id')
export class DeleteBudgetController {
  constructor(private deleteBudget: DeleteBudgetUseCase) {}

  @Delete()
  @HttpCode(204)
  async handle(@Param('id') id: string) {
    const result = await this.deleteBudget.execute({ id })
    if (result.isLeft()) throw new NotFoundException(result.value.message)
  }
}
