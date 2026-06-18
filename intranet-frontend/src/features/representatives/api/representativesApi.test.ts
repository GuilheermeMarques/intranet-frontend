import { representativesApi } from './representativesApi'
import { httpClient } from '@/services/httpClient'

jest.mock('@/services/httpClient', () => {
  const actual = jest.requireActual('@/services/httpClient')
  return { ...actual, httpClient: { get: jest.fn() } }
})

const mockGet = httpClient.get as jest.Mock

describe('representativesApi', () => {
  beforeEach(() => mockGet.mockReset())

  it('list() calls GET /representatives with filters and returns RepresentativesData', async () => {
    mockGet.mockResolvedValue({
      representatives: [{ id: '1', name: 'Ana', region: 'South', status: 'active' }],
      regions: ['South'],
      statusOptions: [{ value: 'active', label: 'Active' }],
    })
    const result = await representativesApi.list({ name: 'an' })
    expect(mockGet).toHaveBeenCalledWith('/representatives', { name: 'an' })
    expect(result.representatives).toHaveLength(1)
    expect(result.regions).toEqual(['South'])
    expect(result.statusOptions[0]).toHaveProperty('value')
    expect(result.statusOptions[0]).toHaveProperty('label')
  })
})
