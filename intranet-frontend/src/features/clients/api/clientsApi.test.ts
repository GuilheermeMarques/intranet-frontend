import { clientsApi } from './clientsApi'
import { httpClient, ApiError } from '@/services/httpClient'

jest.mock('@/services/httpClient', () => {
  const actual = jest.requireActual('@/services/httpClient')
  return { ...actual, httpClient: { get: jest.fn(), post: jest.fn() } }
})

const mockGet = httpClient.get as jest.Mock
const mockPost = httpClient.post as jest.Mock

describe('clientsApi', () => {
  beforeEach(() => {
    mockGet.mockReset()
    mockPost.mockReset()
  })

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

  it('getById() unwraps {client} and GETs /clients/:id', async () => {
    mockGet.mockResolvedValue({ client: { id: 'abc', code: 'CLI001' } })
    const c = await clientsApi.getById('abc')
    expect(mockGet).toHaveBeenCalledWith('/clients/abc')
    expect(c?.code).toBe('CLI001')
  })

  it('getById() returns null on 404', async () => {
    mockGet.mockRejectedValue(new ApiError(404, 'not found'))
    expect(await clientsApi.getById('X')).toBeNull()
  })

  it('create() POSTs /clients and unwraps {client}', async () => {
    const input = {
      name: 'João',
      document: '111',
      zipCode: '00000-000',
      street: 'Rua A',
      city: 'SP',
      state: 'SP',
      neighborhood: 'Centro',
      number: '10',
      complement: '',
      email: 'j@e.com',
      phone: '999',
      instagram: '@j',
    }
    mockPost.mockResolvedValue({ client: { code: 'CLI002', ...input } })
    const c = await clientsApi.create(input)
    expect(mockPost).toHaveBeenCalledWith('/clients', input)
    expect(c.code).toBe('CLI002')
  })
})
