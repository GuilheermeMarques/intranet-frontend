import { FetchInventoryLookupsUseCase } from './fetch-inventory-lookups'

let sut: FetchInventoryLookupsUseCase

describe('Fetch Inventory Lookups', () => {
  beforeEach(() => {
    sut = new FetchInventoryLookupsUseCase()
  })

  it('returns the fixed types and reasons catalog', async () => {
    const result = await sut.execute()

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.types).toEqual(['inbound', 'outbound'])
      expect(result.value.reasons).toEqual([
        'Compra de fornecedor',
        'Venda',
        'Devolução',
        'Ajuste de estoque',
        'Transferência',
        'Perda/Danificação',
      ])
    }
  })
})
