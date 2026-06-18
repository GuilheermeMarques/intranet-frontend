import { Tag } from '../../enterprise/entities/tag'

export abstract class TagsRepository {
  abstract findMany(): Promise<Tag[]>
  abstract findById(id: string): Promise<Tag | null>
  abstract create(tag: Tag): Promise<void>
  abstract save(tag: Tag): Promise<void>
  abstract delete(tag: Tag): Promise<void>
}
