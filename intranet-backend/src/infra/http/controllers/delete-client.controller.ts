import { Controller, Delete, HttpCode, NotFoundException, Param } from '@nestjs/common'
import { DeleteClientUseCase } from '@/domain/sales/application/use-cases/delete-client'

@Controller('/clients/:id')
export class DeleteClientController {
  constructor(private deleteClient: DeleteClientUseCase) {}

  @Delete()
  @HttpCode(204)
  async handle(@Param('id') id: string) {
    const result = await this.deleteClient.execute({ id })
    if (result.isLeft()) throw new NotFoundException(result.value.message)
  }
}
