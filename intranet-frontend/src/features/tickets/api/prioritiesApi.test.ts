import { prioritiesApi } from './prioritiesApi'
import { httpClient } from '@/services/httpClient'

jest.mock('@/services/httpClient', () => {
  const actual = jest.requireActual('@/services/httpClient')
  return {
    ...actual,
    httpClient: { get: jest.fn(), post: jest.fn(), patch: jest.fn(), delete: jest.fn() },
  }
})

const mockGet = httpClient.get as jest.Mock
const mockPost = httpClient.post as jest.Mock
const mockPatch = httpClient.patch as jest.Mock
const mockDelete = httpClient.delete as jest.Mock

describe('prioritiesApi', () => {
  beforeEach(() => {
    mockGet.mockReset()
    mockPost.mockReset()
    mockPatch.mockReset()
    mockDelete.mockReset()
  })

  it('list() calls GET /ticket-priorities and unwraps {priorities}', async () => {
    mockGet.mockResolvedValue({ priorities: [{ name: 'High', level: 3 }] })
    const result = await prioritiesApi.list()
    expect(mockGet).toHaveBeenCalledWith('/ticket-priorities')
    expect(result).toHaveLength(1)
    expect(result[0]).toHaveProperty('name')
    expect(result[0]).toHaveProperty('level')
  })

  it('create() calls POST /ticket-priorities and unwraps {priority}', async () => {
    mockPost.mockResolvedValue({ priority: { id: '1', name: 'High', level: 3 } })
    const data = { name: 'High', color: '#f00', level: 3 }
    const result = await prioritiesApi.create(data)
    expect(mockPost).toHaveBeenCalledWith('/ticket-priorities', data)
    expect(result).toHaveProperty('name', 'High')
  })

  it('update() calls PATCH /ticket-priorities/:id and unwraps {priority}', async () => {
    mockPatch.mockResolvedValue({ priority: { id: '1', name: 'Low', level: 1 } })
    const result = await prioritiesApi.update('1', { name: 'Low' })
    expect(mockPatch).toHaveBeenCalledWith('/ticket-priorities/1', { name: 'Low' })
    expect(result).toHaveProperty('name', 'Low')
  })

  it('remove() calls DELETE /ticket-priorities/:id', async () => {
    mockDelete.mockResolvedValue(undefined)
    await prioritiesApi.remove('1')
    expect(mockDelete).toHaveBeenCalledWith('/ticket-priorities/1')
  })
})
