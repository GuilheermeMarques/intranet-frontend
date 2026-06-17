import {
  ClientFilters,
  ClientsRepository,
} from '@/domain/sales/application/repositories/clients-repository'
import { Client } from '@/domain/sales/enterprise/entities/client'

export class InMemoryClientsRepository implements ClientsRepository {
  public items: Client[] = []

  async findMany(filters: ClientFilters): Promise<Client[]> {
    return this.items.filter((client) => {
      if (
        filters.code?.trim() &&
        !client.code.toLowerCase().includes(filters.code.toLowerCase())
      )
        return false
      if (
        filters.name?.trim() &&
        !client.name.toLowerCase().includes(filters.name.toLowerCase())
      )
        return false
      if (filters.city?.trim() && client.city !== filters.city) return false
      if (
        filters.startDate &&
        (!client.lastPurchaseAt || client.lastPurchaseAt < filters.startDate)
      )
        return false
      if (
        filters.endDate &&
        (!client.lastPurchaseAt || client.lastPurchaseAt > filters.endDate)
      )
        return false
      return true
    })
  }

  async findById(id: string) {
    return this.items.find((c) => c.id.toString() === id) ?? null
  }

  async findByCode(code: string) {
    return this.items.find((c) => c.code === code) ?? null
  }

  async findDistinctCities() {
    return [...new Set(this.items.map((c) => c.city))].sort()
  }

  async count() {
    return this.items.length
  }

  async create(client: Client) {
    this.items.push(client)
  }

  async save(client: Client) {
    const index = this.items.findIndex((c) => c.id.equals(client.id))
    if (index >= 0) this.items[index] = client
  }

  async delete(client: Client) {
    this.items = this.items.filter((c) => !c.id.equals(client.id))
  }
}
