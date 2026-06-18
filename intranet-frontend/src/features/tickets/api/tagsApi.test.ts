import { tagsApi } from './tagsApi'
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

describe('tagsApi', () => {
  beforeEach(() => {
    mockGet.mockReset()
    mockPost.mockReset()
    mockPatch.mockReset()
    mockDelete.mockReset()
  })

  it('list() calls GET /ticket-tags and unwraps {tags}', async () => {
    mockGet.mockResolvedValue({ tags: [{ name: 'bug', color: '#f00' }] })
    const result = await tagsApi.list()
    expect(mockGet).toHaveBeenCalledWith('/ticket-tags')
    expect(result).toHaveLength(1)
    expect(result[0]).toHaveProperty('name')
    expect(result[0]).toHaveProperty('color')
  })

  it('create() calls POST /ticket-tags and unwraps {tag}', async () => {
    mockPost.mockResolvedValue({ tag: { id: '1', name: 'bug', color: '#f00' } })
    const data = { name: 'bug', color: '#f00' }
    const result = await tagsApi.create(data)
    expect(mockPost).toHaveBeenCalledWith('/ticket-tags', data)
    expect(result).toHaveProperty('name', 'bug')
  })

  it('update() calls PATCH /ticket-tags/:id and unwraps {tag}', async () => {
    mockPatch.mockResolvedValue({ tag: { id: '1', name: 'feature', color: '#0f0' } })
    const result = await tagsApi.update('1', { name: 'feature' })
    expect(mockPatch).toHaveBeenCalledWith('/ticket-tags/1', { name: 'feature' })
    expect(result).toHaveProperty('name', 'feature')
  })

  it('remove() calls DELETE /ticket-tags/:id', async () => {
    mockDelete.mockResolvedValue(undefined)
    await tagsApi.remove('1')
    expect(mockDelete).toHaveBeenCalledWith('/ticket-tags/1')
  })
})
