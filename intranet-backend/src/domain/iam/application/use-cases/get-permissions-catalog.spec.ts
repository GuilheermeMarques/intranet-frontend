import { InMemoryPermissionsRepository } from 'test/repositories/in-memory-permissions-repository'
import { Permission } from '@/domain/iam/enterprise/entities/permission'
import { GetPermissionsCatalogUseCase } from './get-permissions-catalog'

let permissionsRepository: InMemoryPermissionsRepository
let sut: GetPermissionsCatalogUseCase

describe('Get Permissions Catalog', () => {
  beforeEach(() => {
    permissionsRepository = new InMemoryPermissionsRepository()
    sut = new GetPermissionsCatalogUseCase(permissionsRepository)
  })

  it('returns the permission catalog', async () => {
    permissionsRepository.catalog.push(
      Permission.create({ key: 'menu.dashboard', name: 'Dashboard', category: 'menu' }),
    )
    permissionsRepository.catalog.push(
      Permission.create({ key: 'menu.clients', name: 'Clientes', category: 'menu' }),
    )

    const result = await sut.execute()

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.permissions).toHaveLength(2)
    }
  })
})
