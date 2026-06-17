import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module'
import { CryptographyModule } from '../cryptography/cryptography.module'
import { HealthController } from './controllers/health.controller'
import { AuthenticateController } from './controllers/authenticate.controller'
import { AuthenticateUseCase } from '@/domain/iam/application/use-cases/authenticate'

@Module({
  imports: [DatabaseModule, CryptographyModule],
  controllers: [HealthController, AuthenticateController],
  providers: [AuthenticateUseCase],
})
export class HttpModule {}
