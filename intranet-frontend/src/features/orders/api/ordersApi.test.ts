import { ordersApi } from './ordersApi'
import { httpClient, ApiError } from '@/services/httpClient'

jest.mock('@/services/httpClient', () => {
  const actual = jest.requireActual('@/services/httpClient')
  return { ...actual, httpClient: { get: jest.fn(), post: jest.fn(), patch: jest.fn() } }
})

const mockGet = httpClient.get as jest.Mock
const mockPost = httpClient.post as jest.Mock
const mockPatch = httpClient.patch as jest.Mock

describe('ordersApi', () => {
  beforeEach(() => {
    mockGet.mockReset()
    mockPost.mockReset()
    mockPatch.mockReset()
  })

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

  it('create() POSTs /orders and unwraps {order}', async () => {
    mockPost.mockResolvedValue({ order: { id: 'ORD002', code: 'PED-002' } })
    const o = await ordersApi.create({ clientId: 'c1', items: [{ productId: 'p1', quantity: 2 }] })
    expect(mockPost).toHaveBeenCalledWith('/orders', { clientId: 'c1', items: [{ productId: 'p1', quantity: 2 }] })
    expect(o.id).toBe('ORD002')
  })

  it('updateStatus() PATCHes /orders/:id/status with {status} and unwraps {order}', async () => {
    mockPatch.mockResolvedValue({ order: { id: 'ORD002', status: 'shipped' } })
    const o = await ordersApi.updateStatus('ORD002', 'shipped')
    expect(mockPatch).toHaveBeenCalledWith('/orders/ORD002/status', { status: 'shipped' })
    expect(o.status).toBe('shipped')
  })
})
