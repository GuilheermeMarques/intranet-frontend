import { inventoryApi } from './inventoryApi'
import { httpClient } from '@/services/httpClient'

jest.mock('@/services/httpClient', () => {
  const actual = jest.requireActual('@/services/httpClient')
  return { ...actual, httpClient: { get: jest.fn(), post: jest.fn() } }
})

const mockGet = httpClient.get as jest.Mock
const mockPost = httpClient.post as jest.Mock

describe('inventoryApi', () => {
  beforeEach(() => {
    mockGet.mockReset()
    mockPost.mockReset()
  })

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

  it('create() POSTs /inventory/movements and unwraps .movement', async () => {
    mockPost.mockResolvedValue({ movement: { id: '99' } })
    const input = {
      productCode: 'P1',
      description: 'Item',
      quantity: 5,
      type: 'inbound' as const,
    }
    const result = await inventoryApi.create(input)
    expect(mockPost).toHaveBeenCalledWith('/inventory/movements', input)
    expect(result).toEqual({ id: '99' })
  })

  it('lookups() GETs /inventory/lookups', async () => {
    mockGet.mockResolvedValue({ types: ['inbound'], reasons: ['x'] })
    const result = await inventoryApi.lookups()
    expect(mockGet).toHaveBeenCalledWith('/inventory/lookups')
    expect(result).toEqual({ types: ['inbound'], reasons: ['x'] })
  })
})
