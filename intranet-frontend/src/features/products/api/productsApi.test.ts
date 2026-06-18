import { productsApi } from './productsApi'
import { httpClient, ApiError } from '@/services/httpClient'

jest.mock('@/services/httpClient', () => {
  const actual = jest.requireActual('@/services/httpClient')
  return { ...actual, httpClient: { get: jest.fn() } }
})

const mockGet = httpClient.get as jest.Mock

describe('productsApi', () => {
  beforeEach(() => mockGet.mockReset())

  it('list() calls GET /products with filters and returns Product[]', async () => {
    mockGet.mockResolvedValue({ products: [{ id: 1, code: 'PROD001' }] })
    const result = await productsApi.list({ name: 'wid' })
    expect(mockGet).toHaveBeenCalledWith('/products', { name: 'wid' })
    expect(result).toHaveLength(1)
    expect(result[0]).toHaveProperty('code')
  })

  it('getById() unwraps {product}', async () => {
    mockGet.mockResolvedValue({ product: { id: 1, code: 'PROD001' } })
    const p = await productsApi.getById(1)
    expect(mockGet).toHaveBeenCalledWith('/products/1')
    expect(String(p?.id)).toBe('1')
  })

  it('getById() returns null on 404', async () => {
    mockGet.mockRejectedValue(new ApiError(404, 'not found'))
    expect(await productsApi.getById('X')).toBeNull()
  })
})
