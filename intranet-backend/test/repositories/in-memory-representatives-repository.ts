import {
  RepresentativeFilters,
  RepresentativesRepository,
} from '@/domain/sales/application/repositories/representatives-repository'
import { Representative } from '@/domain/sales/enterprise/entities/representative'

export class InMemoryRepresentativesRepository
  implements RepresentativesRepository
{
  public items: Representative[] = []

  async findMany(filters: RepresentativeFilters): Promise<Representative[]> {
    return this.items.filter((representative) => {
      if (
        filters.name?.trim() &&
        !representative.name.toLowerCase().includes(filters.name.toLowerCase())
      )
        return false
      if (filters.region?.trim() && representative.region !== filters.region)
        return false
      if (filters.status?.trim() && representative.status !== filters.status)
        return false
      return true
    })
  }

  async findDistinctRegions(): Promise<string[]> {
    return [...new Set(this.items.map((r) => r.region))].sort()
  }
}
