import { ticketsApi } from './ticketsApi'
import { httpClient } from '@/services/httpClient'

jest.mock('@/services/httpClient', () => {
  const actual = jest.requireActual('@/services/httpClient')
  return { ...actual, httpClient: { get: jest.fn() } }
})

const mockGet = httpClient.get as jest.Mock

describe('ticketsApi', () => {
  beforeEach(() => mockGet.mockReset())

  it('list() unwraps tickets and attaches local statusConfig', async () => {
    mockGet.mockResolvedValue({ tickets: [{ id: '1' }] })
    const result = await ticketsApi.list()
    expect(mockGet).toHaveBeenCalledWith('/tickets')
    expect(result.tickets).toEqual([{ id: '1' }])
    expect(result.statusConfig.todo).toBeDefined()
  })
})
