import { Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { ClientsRepository } from '../repositories/clients-repository'
import { Client } from '../../enterprise/entities/client'

interface GetClientByCodeUseCaseRequest {
  code: string
}
type GetClientByCodeUseCaseResponse = Either<
  ResourceNotFoundError,
  { client: Client }
>

@Injectable()
export class GetClientByCodeUseCase {
  constructor(private clientsRepository: ClientsRepository) {}

  async execute({
    code,
  }: GetClientByCodeUseCaseRequest): Promise<GetClientByCodeUseCaseResponse> {
    const client = await this.clientsRepository.findByCode(code)
    if (!client) return left(new ResourceNotFoundError())
    return right({ client })
  }
}
