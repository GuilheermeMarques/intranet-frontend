import { Client } from '../../enterprise/entities/client'

export interface ClientFilters {
  code?: string
  name?: string
  city?: string
  startDate?: Date | null
  endDate?: Date | null
}

export abstract class ClientsRepository {
  abstract findMany(filters: ClientFilters): Promise<Client[]>
  abstract findById(id: string): Promise<Client | null>
  abstract findByCode(code: string): Promise<Client | null>
  abstract findDistinctCities(): Promise<string[]>
  abstract count(): Promise<number>
  abstract create(client: Client): Promise<void>
  abstract save(client: Client): Promise<void>
  abstract delete(client: Client): Promise<void>
}
