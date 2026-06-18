import { Controller, Get } from '@nestjs/common'
import { FetchPrioritiesUseCase } from '@/domain/support/application/use-cases/fetch-priorities'
import { PriorityPresenter } from '@/infra/http/presenters/priority-presenter'

@Controller('/ticket-priorities')
export class FetchPrioritiesController {
  constructor(private fetchPriorities: FetchPrioritiesUseCase) {}

  @Get()
  async handle() {
    const result = await this.fetchPriorities.execute()
    const { priorities } = result.value!
    return { priorities: priorities.map(PriorityPresenter.toHTTP) }
  }
}
