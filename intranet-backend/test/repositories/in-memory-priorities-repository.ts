import { PrioritiesRepository } from '@/domain/support/application/repositories/priorities-repository'
import { Priority } from '@/domain/support/enterprise/entities/priority'

export class InMemoryPrioritiesRepository implements PrioritiesRepository {
  public items: Priority[] = []

  async findMany(): Promise<Priority[]> {
    return [...this.items].sort((a, b) => a.level - b.level)
  }

  async findById(id: string): Promise<Priority | null> {
    return this.items.find((p) => p.id.toString() === id) ?? null
  }

  async create(priority: Priority): Promise<void> {
    this.items.push(priority)
  }

  async save(priority: Priority): Promise<void> {
    const index = this.items.findIndex((p) => p.id.equals(priority.id))
    if (index >= 0) this.items[index] = priority
  }

  async delete(priority: Priority): Promise<void> {
    this.items = this.items.filter((p) => !p.id.equals(priority.id))
  }
}
