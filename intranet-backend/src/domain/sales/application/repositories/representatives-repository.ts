import { Representative } from '../../enterprise/entities/representative'

export interface RepresentativeFilters {
  name?: string
  region?: string
  status?: string
}

export abstract class RepresentativesRepository {
  abstract findMany(filters: RepresentativeFilters): Promise<Representative[]>
  abstract findById(id: string): Promise<Representative | null>
  abstract findDistinctRegions(): Promise<string[]>
}
