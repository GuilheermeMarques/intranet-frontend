import { ordersApi } from './ordersApi'
import { httpClient, ApiError } from '@/services/httpClient'

jest.mock('@/services/httpClient', () => {
  const actual = jest.requireActual('@/services/httpClient')
  return { ...actual, httpClient: { get: jest.fn() } }
})

const mockGet = httpClient.get as jest.Mock

describe('ordersApi', () => {
  beforeEach(() => mockGet.mockReset())

  it('list() calls GET /orders with filters and returns Order[]', async () => {
    mockGet.mockResolvedValue({ orders: [{ id: 'ORD001', clientName: 'Acme', status: 'open' }] })
    const result = await ordersApi.list({ clientName: 'ac' })
    expect(mockGet).toHaveBeenCalledWith('/orders', { clientName: 'ac' })
    expect(result).toHaveLength(1)
    expect(result[0]).toHaveProperty('status')
  })

  it('getById() unwraps {order}', async () => {
    mockGet.mockResolvedValue({ order: { id: 'ORD001' } })
    const o = await ordersApi.getById('ORD001')
    expect(mockGet).toHaveBeenCalledWith('/orders/ORD001')
    expect(o?.id).toBe('ORD001')
  })

  it('getById() returns null on 404', async () => {
    mockGet.mockRejectedValue(new ApiError(404, 'not found'))
    expect(await ordersApi.getById('X')).toBeNull()
  })
})
