import { Body, Controller, Post, UsePipes } from '@nestjs/common'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { CreateClientUseCase } from '@/domain/sales/application/use-cases/create-client'
import { ClientPresenter } from '@/infra/http/presenters/client-presenter'
import {
  createClientBodySchema,
  CreateClientBodySchema,
} from './schemas/client-body-schema'

@Controller('/clients')
export class CreateClientController {
  constructor(private createClient: CreateClientUseCase) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createClientBodySchema))
  async handle(@Body() body: CreateClientBodySchema) {
    const result = await this.createClient.execute(body)
    return { client: ClientPresenter.toHTTP(result.value!.client) }
  }
}
