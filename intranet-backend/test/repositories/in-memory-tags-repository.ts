import { TagsRepository } from '@/domain/support/application/repositories/tags-repository'
import { Tag } from '@/domain/support/enterprise/entities/tag'

export class InMemoryTagsRepository implements TagsRepository {
  public items: Tag[] = []

  async findMany(): Promise<Tag[]> {
    return [...this.items].sort((a, b) => a.name.localeCompare(b.name))
  }

  async findById(id: string): Promise<Tag | null> {
    return this.items.find((t) => t.id.toString() === id) ?? null
  }

  async create(tag: Tag): Promise<void> {
    this.items.push(tag)
  }

  async save(tag: Tag): Promise<void> {
    const index = this.items.findIndex((t) => t.id.equals(tag.id))
    if (index >= 0) this.items[index] = tag
  }

  async delete(tag: Tag): Promise<void> {
    this.items = this.items.filter((t) => !t.id.equals(tag.id))
  }
}
