import { Module } from '@nestjs/common'
import { PrismaService } from './prisma/prisma.service'
import { UsersRepository } from '@/domain/iam/application/repositories/users-repository'
import { PrismaUsersRepository } from './prisma/repositories/prisma-users-repository'
import { RefreshTokensRepository } from '@/domain/iam/application/repositories/refresh-tokens-repository'
import { PrismaRefreshTokensRepository } from './prisma/repositories/prisma-refresh-tokens-repository'
import { PermissionsRepository } from '@/domain/iam/application/repositories/permissions-repository'
import { PrismaPermissionsRepository } from './prisma/repositories/prisma-permissions-repository'

@Module({
  providers: [
    PrismaService,
    { provide: UsersRepository, useClass: PrismaUsersRepository },
    { provide: RefreshTokensRepository, useClass: PrismaRefreshTokensRepository },
    { provide: PermissionsRepository, useClass: PrismaPermissionsRepository },
  ],
  exports: [PrismaService, UsersRepository, RefreshTokensRepository, PermissionsRepository],
})
export class DatabaseModule {}
