import { Module } from '@nestjs/common'
import { PrismaService } from './prisma/prisma.service'
import { UsersRepository } from '@/domain/iam/application/repositories/users-repository'
import { PrismaUsersRepository } from './prisma/repositories/prisma-users-repository'
import { RefreshTokensRepository } from '@/domain/iam/application/repositories/refresh-tokens-repository'
import { PrismaRefreshTokensRepository } from './prisma/repositories/prisma-refresh-tokens-repository'
import { PermissionsRepository } from '@/domain/iam/application/repositories/permissions-repository'
import { PrismaPermissionsRepository } from './prisma/repositories/prisma-permissions-repository'
import { PreferencesRepository } from '@/domain/iam/application/repositories/preferences-repository'
import { PrismaPreferencesRepository } from './prisma/repositories/prisma-preferences-repository'
import { ClientsRepository } from '@/domain/sales/application/repositories/clients-repository'
import { PrismaClientsRepository } from './prisma/repositories/prisma-clients-repository'
import { ProductsRepository } from '@/domain/sales/application/repositories/products-repository'
import { PrismaProductsRepository } from './prisma/repositories/prisma-products-repository'
import { InventoryMovementsRepository } from '@/domain/sales/application/repositories/inventory-movements-repository'
import { PrismaInventoryMovementsRepository } from './prisma/repositories/prisma-inventory-movements-repository'
import { RepresentativesRepository } from '@/domain/sales/application/repositories/representatives-repository'
import { PrismaRepresentativesRepository } from './prisma/repositories/prisma-representatives-repository'

@Module({
  providers: [
    PrismaService,
    { provide: UsersRepository, useClass: PrismaUsersRepository },
    { provide: RefreshTokensRepository, useClass: PrismaRefreshTokensRepository },
    { provide: PermissionsRepository, useClass: PrismaPermissionsRepository },
    { provide: PreferencesRepository, useClass: PrismaPreferencesRepository },
    { provide: ClientsRepository, useClass: PrismaClientsRepository },
    { provide: ProductsRepository, useClass: PrismaProductsRepository },
    {
      provide: InventoryMovementsRepository,
      useClass: PrismaInventoryMovementsRepository,
    },
    {
      provide: RepresentativesRepository,
      useClass: PrismaRepresentativesRepository,
    },
  ],
  exports: [
    PrismaService,
    UsersRepository,
    RefreshTokensRepository,
    PermissionsRepository,
    PreferencesRepository,
    ClientsRepository,
    ProductsRepository,
    InventoryMovementsRepository,
    RepresentativesRepository,
  ],
})
export class DatabaseModule {}
