import { usersApi } from './usersApi'
import { httpClient } from '@/services/httpClient'

jest.mock('@/services/httpClient', () => {
  const actual = jest.requireActual('@/services/httpClient')
  return { ...actual, httpClient: { get: jest.fn(), put: jest.fn() } }
})

const mockGet = httpClient.get as jest.Mock
const mockPut = httpClient.put as jest.Mock

describe('usersApi', () => {
  beforeEach(() => {
    mockGet.mockReset()
    mockPut.mockReset()
  })

  it('list() GETs /users, unwraps .users and coerces nulls to empty strings', async () => {
    mockGet.mockResolvedValue({
      users: [
        {
          id: 'u1',
          name: 'Alice',
          email: 'alice@example.com',
          jobTitle: null,
          department: null,
          status: 'active',
          lastLogin: null,
          avatar: null,
          permissions: ['settings.permissions.manage'],
        },
      ],
    })

    const result = await usersApi.list()

    expect(mockGet).toHaveBeenCalledWith('/users')
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      id: 'u1',
      name: 'Alice',
      email: 'alice@example.com',
      jobTitle: '',
      department: '',
      status: 'active',
      lastLogin: '',
      avatar: '',
      permissions: ['settings.permissions.manage'],
    })
  })

  it('setPermissions() PUTs /users/:id/permissions with {permissions} and returns .permissions', async () => {
    mockPut.mockResolvedValue({ permissions: ['a', 'b'] })

    const result = await usersApi.setPermissions('u1', ['a', 'b'])

    expect(mockPut).toHaveBeenCalledWith('/users/u1/permissions', { permissions: ['a', 'b'] })
    expect(result).toEqual(['a', 'b'])
  })
})
