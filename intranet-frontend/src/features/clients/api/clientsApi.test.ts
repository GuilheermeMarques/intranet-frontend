import { clientsApi } from './clientsApi'
import { httpClient, ApiError } from '@/services/httpClient'

jest.mock('@/services/httpClient', () => {
  const actual = jest.requireActual('@/services/httpClient')
  return { ...actual, httpClient: { get: jest.fn() } }
})

const mockGet = httpClient.get as jest.Mock

describe('clientsApi', () => {
  beforeEach(() => mockGet.mockReset())

  it('list() calls GET /clients with filters and returns ClientsData', async () => {
    mockGet.mockResolvedValue({ clients: [{ code: 'CLI001' }], cities: ['SP'] })
    const result = await clientsApi.list({ name: 'jo' })
    expect(mockGet).toHaveBeenCalledWith('/clients', { name: 'jo' })
    expect(result.clients).toHaveLength(1)
    expect(result.cities).toEqual(['SP'])
  })

  it('getByCode() unwraps {client}', async () => {
    mockGet.mockResolvedValue({ client: { code: 'CLI001' } })
    const c = await clientsApi.getByCode('CLI001')
    expect(mockGet).toHaveBeenCalledWith('/clients/code/CLI001')
    expect(c?.code).toBe('CLI001')
  })

  it('getByCode() returns null on 404', async () => {
    mockGet.mockRejectedValue(new ApiError(404, 'not found'))
    expect(await clientsApi.getByCode('X')).toBeNull()
  })
})
