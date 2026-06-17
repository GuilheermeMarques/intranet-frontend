import {
  Representative as PrismaRepresentativeModel,
  Prisma,
} from '@prisma/client'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Representative } from '@/domain/sales/enterprise/entities/representative'

export class PrismaRepresentativeMapper {
  static toDomain(raw: PrismaRepresentativeModel): Representative {
    return Representative.create(
      {
        name: raw.name,
        email: raw.email,
        phone: raw.phone,
        region: raw.region,
        status: raw.status,
        totalSales: raw.totalSales,
        monthlyGoal: raw.monthlyGoal,
        clientsCount: raw.clientsCount,
        lastActivity: raw.lastActivity,
        avatar: raw.avatar,
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toPrisma(
    representative: Representative,
  ): Prisma.RepresentativeUncheckedCreateInput {
    return {
      id: representative.id.toString(),
      name: representative.name,
      email: representative.email,
      phone: representative.phone,
      region: representative.region,
      status: representative.status,
      totalSales: representative.totalSales,
      monthlyGoal: representative.monthlyGoal,
      clientsCount: representative.clientsCount,
      lastActivity: representative.lastActivity ?? null,
      avatar: representative.avatar ?? null,
    }
  }
}
