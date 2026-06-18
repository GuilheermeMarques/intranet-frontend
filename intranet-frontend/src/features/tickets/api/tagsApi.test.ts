import { tagsApi } from './tagsApi'
import { httpClient } from '@/services/httpClient'

jest.mock('@/services/httpClient', () => {
  const actual = jest.requireActual('@/services/httpClient')
  return { ...actual, httpClient: { get: jest.fn() } }
})

const mockGet = httpClient.get as jest.Mock

describe('tagsApi', () => {
  beforeEach(() => mockGet.mockReset())

  it('list() calls GET /ticket-tags and unwraps {tags}', async () => {
    mockGet.mockResolvedValue({ tags: [{ name: 'bug', color: '#f00' }] })
    const result = await tagsApi.list()
    expect(mockGet).toHaveBeenCalledWith('/ticket-tags')
    expect(result).toHaveLength(1)
    expect(result[0]).toHaveProperty('name')
    expect(result[0]).toHaveProperty('color')
  })
})
