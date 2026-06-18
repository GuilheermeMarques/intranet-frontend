import { Controller, Get } from '@nestjs/common'
import { FetchTagsUseCase } from '@/domain/support/application/use-cases/fetch-tags'
import { TagPresenter } from '@/infra/http/presenters/tag-presenter'

@Controller('/ticket-tags')
export class FetchTagsController {
  constructor(private fetchTags: FetchTagsUseCase) {}

  @Get()
  async handle() {
    const result = await this.fetchTags.execute()
    const { tags } = result.value!
    return { tags: tags.map(TagPresenter.toHTTP) }
  }
}
