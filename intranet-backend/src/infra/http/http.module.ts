import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module'
import { CryptographyModule } from '../cryptography/cryptography.module'
import { HealthController } from './controllers/health.controller'
import { AuthenticateController } from './controllers/authenticate.controller'
import { RefreshTokenController } from './controllers/refresh-token.controller'
import { LogoutController } from './controllers/logout.controller'
import { AuthenticateUseCase } from '@/domain/iam/application/use-cases/authenticate'
import { RefreshTokenUseCase } from '@/domain/iam/application/use-cases/refresh-token'
import { LogoutUseCase } from '@/domain/iam/application/use-cases/logout'

@Module({
  imports: [DatabaseModule, CryptographyModule],
  controllers: [HealthController, AuthenticateController, RefreshTokenController, LogoutController],
  providers: [AuthenticateUseCase, RefreshTokenUseCase, LogoutUseCase],
})
export class HttpModule {}
