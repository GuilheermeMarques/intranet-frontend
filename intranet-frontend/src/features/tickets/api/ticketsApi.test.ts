import { ticketsApi } from './ticketsApi'
import { httpClient } from '@/services/httpClient'

jest.mock('@/services/httpClient', () => {
  const actual = jest.requireActual('@/services/httpClient')
  return { ...actual, httpClient: { get: jest.fn(), post: jest.fn(), patch: jest.fn() } }
})

const mockGet = httpClient.get as jest.Mock
const mockPost = httpClient.post as jest.Mock
const mockPatch = httpClient.patch as jest.Mock

describe('ticketsApi', () => {
  beforeEach(() => {
    mockGet.mockReset()
    mockPost.mockReset()
    mockPatch.mockReset()
  })

  it('list() unwraps tickets and attaches local statusConfig', async () => {
    mockGet.mockResolvedValue({ tickets: [{ id: '1' }] })
    const result = await ticketsApi.list()
    expect(mockGet).toHaveBeenCalledWith('/tickets')
    expect(result.tickets).toEqual([{ id: '1' }])
    expect(result.statusConfig.todo).toBeDefined()
  })

  it('create() POSTs /tickets and unwraps .ticket', async () => {
    mockPost.mockResolvedValue({ ticket: { id: '99' } })
    const input = {
      title: 'T',
      description: 'D',
      priorityId: 'p1',
      assignee: 'A',
      reporter: 'R',
      category: 'C',
      tags: ['x'],
    }
    const result = await ticketsApi.create(input)
    expect(mockPost).toHaveBeenCalledWith('/tickets', input)
    expect(result).toEqual({ id: '99' })
  })

  it('updateStatus() PATCHes /tickets/:id with {status} and unwraps .ticket', async () => {
    mockPatch.mockResolvedValue({ ticket: { id: '5', status: 'done' } })
    const result = await ticketsApi.updateStatus('5', 'done')
    expect(mockPatch).toHaveBeenCalledWith('/tickets/5', { status: 'done' })
    expect(result).toEqual({ id: '5', status: 'done' })
  })

  it('addMessage() POSTs /tickets/:id/messages and unwraps .message', async () => {
    mockPost.mockResolvedValue({ message: { id: 'm1', content: 'hi' } })
    const data = { author: 'A', content: 'hi', type: 'comment', mentions: [] }
    const result = await ticketsApi.addMessage('7', data)
    expect(mockPost).toHaveBeenCalledWith('/tickets/7/messages', data)
    expect(result).toEqual({ id: 'm1', content: 'hi' })
  })

  it('uploadAttachment() POSTs FormData to /api/backend/tickets/:id/attachments and unwraps .attachment', async () => {
    const originalFetch = global.fetch
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ attachment: { id: 'a1', name: 'f.txt' } }) })
    const file = new File(['data'], 'f.txt', { type: 'text/plain' })
    const result = await ticketsApi.uploadAttachment('42', file)
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/backend/tickets/42/attachments',
      expect.objectContaining({ method: 'POST', body: expect.any(FormData) }),
    )
    expect(result).toEqual({ id: 'a1', name: 'f.txt' })
    global.fetch = originalFetch
  })
})
