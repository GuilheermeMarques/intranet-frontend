import { Client } from '@/domain/sales/enterprise/entities/client'

export class ClientPresenter {
  static toHTTP(client: Client) {
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
      lastPurchaseAt: client.lastPurchaseAt ? client.lastPurchaseAt.toISOString() : null,
      purchaseCount: client.purchaseCount,
    }
  }
}
