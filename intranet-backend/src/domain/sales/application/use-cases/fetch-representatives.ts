import { Either, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import {
  RepresentativeFilters,
  RepresentativesRepository,
} from '../repositories/representatives-repository'
import { Representative } from '../../enterprise/entities/representative'

const STATUS_OPTIONS = [
  { value: 'active', label: 'Ativo' },
  { value: 'inactive', label: 'Inativo' },
  { value: 'vacation', label: 'Férias' },
  { value: 'training', label: 'Treinamento' },
]

interface FetchRepresentativesUseCaseRequest {
  filters: RepresentativeFilters
}
type FetchRepresentativesUseCaseResponse = Either<
  never,
  {
    representatives: Representative[]
    regions: string[]
    statusOptions: { value: string; label: string }[]
  }
>

@Injectable()
export class FetchRepresentativesUseCase {
  constructor(private representativesRepository: RepresentativesRepository) {}

  async execute({
    filters,
  }: FetchRepresentativesUseCaseRequest): Promise<FetchRepresentativesUseCaseResponse> {
    const representatives = await this.representativesRepository.findMany(filters)
    const regions = await this.representativesRepository.findDistinctRegions()
    return right({ representatives, regions, statusOptions: STATUS_OPTIONS })
  }
}
