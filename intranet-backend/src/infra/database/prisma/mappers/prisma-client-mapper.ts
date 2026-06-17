import { Client as PrismaClientModel, Prisma } from '@prisma/client'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Client } from '@/domain/sales/enterprise/entities/client'

export class PrismaClientMapper {
  static toDomain(raw: PrismaClientModel): Client {
    return Client.create(
      {
        code: raw.code,
        name: raw.name,
        document: raw.document,
        zipCode: raw.zipCode,
        street: raw.street,
        city: raw.city,
        state: raw.state,
        neighborhood: raw.neighborhood,
        number: raw.number,
        complement: raw.complement,
        email: raw.email,
        phone: raw.phone,
        instagram: raw.instagram,
        lastPurchaseAt: raw.lastPurchaseAt,
        purchaseCount: raw.purchaseCount,
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toPrisma(client: Client): Prisma.ClientUncheckedCreateInput {
    return {
      id: client.id.toString(),
      code: client.code,
      name: client.name,
      document: client.document,
      zipCode: client.zipCode,
      street: client.street,
      city: client.city,
      state: client.state,
      neighborhood: client.neighborhood,
      number: client.number,
      complement: client.complement,
      email: client.email,
      phone: client.phone,
      instagram: client.instagram,
      lastPurchaseAt: client.lastPurchaseAt ?? null,
      purchaseCount: client.purchaseCount,
    }
  }
}
