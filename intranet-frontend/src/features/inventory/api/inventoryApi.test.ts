import { inventoryApi } from './inventoryApi'
import { httpClient } from '@/services/httpClient'

jest.mock('@/services/httpClient', () => {
  const actual = jest.requireActual('@/services/httpClient')
  return { ...actual, httpClient: { get: jest.fn() } }
})

const mockGet = httpClient.get as jest.Mock

describe('inventoryApi', () => {
  beforeEach(() => mockGet.mockReset())

  it('list() assembles movements + types + reasons from both endpoints', async () => {
    mockGet.mockImplementation((p: string) =>
      p === '/inventory/lookups'
        ? Promise.resolve({ types: ['inbound', 'outbound'], reasons: ['x'] })
        : Promise.resolve({ movements: [{ id: '1' }] }),
    )
    const result = await inventoryApi.list({ type: 'inbound' })
    expect(mockGet).toHaveBeenCalledWith('/inventory/movements', { type: 'inbound' })
    expect(mockGet).toHaveBeenCalledWith('/inventory/lookups')
    expect(result.movements).toEqual([{ id: '1' }])
    expect(result.types).toEqual(['inbound', 'outbound'])
    expect(result.reasons).toEqual(['x'])
  })
})
