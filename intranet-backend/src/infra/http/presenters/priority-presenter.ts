import { Priority } from '@/domain/support/enterprise/entities/priority'

export class PriorityPresenter {
  static toHTTP(priority: Priority) {
    return {
      id: priority.id.toString(),
      name: priority.name,
      color: priority.color,
      level: priority.level,
      description: priority.description ?? null,
      isActive: priority.isActive,
    }
  }
}
