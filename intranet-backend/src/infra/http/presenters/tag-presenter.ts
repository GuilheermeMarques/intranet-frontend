import { Tag } from '@/domain/support/enterprise/entities/tag'

export class TagPresenter {
  static toHTTP(tag: Tag) {
    return {
      id: tag.id.toString(),
      name: tag.name,
      color: tag.color,
      description: tag.description ?? null,
      category: tag.category ?? null,
      isActive: tag.isActive,
    }
  }
}
