import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { DatabaseModule } from '../database/database.module'
import { CryptographyModule } from '../cryptography/cryptography.module'
import { PermissionsGuard } from '../auth/permissions.guard'
import { HealthController } from './controllers/health.controller'
import { AuthenticateController } from './controllers/authenticate.controller'
import { RefreshTokenController } from './controllers/refresh-token.controller'
import { LogoutController } from './controllers/logout.controller'
import { GetMeController } from './controllers/get-me.controller'
import { ListUsersController } from './controllers/list-users.controller'
import { GetUserPermissionsController } from './controllers/get-user-permissions.controller'
import { SetUserPermissionsController } from './controllers/set-user-permissions.controller'
import { GetPermissionsCatalogController } from './controllers/get-permissions-catalog.controller'
import { PreferencesController } from './controllers/preferences.controller'
import { AuthenticateUseCase } from '@/domain/iam/application/use-cases/authenticate'
import { RefreshTokenUseCase } from '@/domain/iam/application/use-cases/refresh-token'
import { LogoutUseCase } from '@/domain/iam/application/use-cases/logout'
import { GetMeUseCase } from '@/domain/iam/application/use-cases/get-me'
import { ListUsersUseCase } from '@/domain/iam/application/use-cases/list-users'
import { GetUserPermissionsUseCase } from '@/domain/iam/application/use-cases/get-user-permissions'
import { SetUserPermissionsUseCase } from '@/domain/iam/application/use-cases/set-user-permissions'
import { GetPermissionsCatalogUseCase } from '@/domain/iam/application/use-cases/get-permissions-catalog'
import { GetPreferencesUseCase } from '@/domain/iam/application/use-cases/get-preferences'
import { UpdatePreferencesUseCase } from '@/domain/iam/application/use-cases/update-preferences'

@Module({
  imports: [DatabaseModule, CryptographyModule],
  controllers: [
    HealthController,
    AuthenticateController,
    RefreshTokenController,
    LogoutController,
    GetMeController,
    ListUsersController,
    GetUserPermissionsController,
    SetUserPermissionsController,
    GetPermissionsCatalogController,
    PreferencesController,
  ],
  providers: [
    AuthenticateUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    GetMeUseCase,
    ListUsersUseCase,
    GetUserPermissionsUseCase,
    SetUserPermissionsUseCase,
    GetPermissionsCatalogUseCase,
    GetPreferencesUseCase,
    UpdatePreferencesUseCase,
    { provide: APP_GUARD, useClass: PermissionsGuard },
  ],
})
export class HttpModule {}
