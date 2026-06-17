import { Either, right } from '@/core/either'
import { Injectable } from '@nestjs/common'

const TYPES = ['inbound', 'outbound']
const REASONS = [
  'Compra de fornecedor',
  'Venda',
  'Devolução',
  'Ajuste de estoque',
  'Transferência',
  'Perda/Danificação',
]

type FetchInventoryLookupsUseCaseResponse = Either<
  never,
  { types: string[]; reasons: string[] }
>

@Injectable()
export class FetchInventoryLookupsUseCase {
  async execute(): Promise<FetchInventoryLookupsUseCaseResponse> {
    return right({ types: TYPES, reasons: REASONS })
  }
}
