import { budgetsApi } from './budgetsApi'
import { httpClient } from '@/services/httpClient'

jest.mock('@/services/httpClient', () => {
  const actual = jest.requireActual('@/services/httpClient')
  return { ...actual, httpClient: { get: jest.fn() } }
})

const mockGet = httpClient.get as jest.Mock

describe('budgetsApi', () => {
  beforeEach(() => {
    mockGet.mockReset()
    mockGet.mockImplementation((p: string) => {
      if (p === '/budgets') {
        return Promise.resolve({ budgets: [{ responsibleId: 'r1', responsibleName: 'John' }] })
      }
      if (p === '/clients') {
        return Promise.resolve({ clients: [{ id: 'c1', name: 'Acme' }] })
      }
      return Promise.resolve({
        representatives: [
          { id: 'r1', name: 'John', status: 'active' },
          { id: 'r2', name: 'Zed', status: 'inactive' },
        ],
      })
    })
  })

  it('passes budgets through and forwards filters to GET /budgets', async () => {
    const data = await budgetsApi.list({ budgetNumber: 'X' })
    expect(mockGet).toHaveBeenCalledWith('/budgets', { budgetNumber: 'X' })
    expect(data.budgets).toEqual([{ responsibleId: 'r1', responsibleName: 'John' }])
  })

  it('builds client options as {value,label} from /clients', async () => {
    const data = await budgetsApi.list()
    expect(data.clients).toEqual([{ value: 'c1', label: 'Acme' }])
  })

  it('derives responsibles from the budgets list', async () => {
    const data = await budgetsApi.list()
    expect(data.responsibles).toEqual([{ value: 'r1', label: 'John' }])
  })

  it('keeps only active representatives', async () => {
    const data = await budgetsApi.list()
    expect(data.activeRepresentatives).toEqual([{ value: 'r1', label: 'John' }])
  })
})
