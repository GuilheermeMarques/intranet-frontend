import { prioritiesApi } from './prioritiesApi'
import { httpClient } from '@/services/httpClient'

jest.mock('@/services/httpClient', () => {
  const actual = jest.requireActual('@/services/httpClient')
  return { ...actual, httpClient: { get: jest.fn() } }
})

const mockGet = httpClient.get as jest.Mock

describe('prioritiesApi', () => {
  beforeEach(() => mockGet.mockReset())

  it('list() calls GET /ticket-priorities and unwraps {priorities}', async () => {
    mockGet.mockResolvedValue({ priorities: [{ name: 'High', level: 3 }] })
    const result = await prioritiesApi.list()
    expect(mockGet).toHaveBeenCalledWith('/ticket-priorities')
    expect(result).toHaveLength(1)
    expect(result[0]).toHaveProperty('name')
    expect(result[0]).toHaveProperty('level')
  })
})
