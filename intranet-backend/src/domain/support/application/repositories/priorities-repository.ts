import { Priority } from '../../enterprise/entities/priority'

export abstract class PrioritiesRepository {
  abstract findMany(): Promise<Priority[]>
  abstract findById(id: string): Promise<Priority | null>
  abstract create(priority: Priority): Promise<void>
  abstract save(priority: Priority): Promise<void>
  abstract delete(priority: Priority): Promise<void>
}
