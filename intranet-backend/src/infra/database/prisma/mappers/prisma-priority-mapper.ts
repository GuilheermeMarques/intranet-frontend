import { TicketPriority as PrismaPriority, Prisma } from '@prisma/client'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Priority } from '@/domain/support/enterprise/entities/priority'

export class PrismaPriorityMapper {
  static toDomain(raw: PrismaPriority): Priority {
    return Priority.create(
      {
        name: raw.name,
        color: raw.color,
        level: raw.level,
        description: raw.description,
        isActive: raw.isActive,
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toPrisma(priority: Priority): Prisma.TicketPriorityUncheckedCreateInput {
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
