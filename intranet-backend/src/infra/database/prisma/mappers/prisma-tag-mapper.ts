import { TicketTag as PrismaTag, Prisma } from '@prisma/client'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Tag } from '@/domain/support/enterprise/entities/tag'

export class PrismaTagMapper {
  static toDomain(raw: PrismaTag): Tag {
    return Tag.create(
      {
        name: raw.name,
        color: raw.color,
        description: raw.description,
        category: raw.category,
        isActive: raw.isActive,
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toPrisma(tag: Tag): Prisma.TicketTagUncheckedCreateInput {
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
