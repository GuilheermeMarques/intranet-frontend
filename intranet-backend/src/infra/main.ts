import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { EnvService } from './env/env.service'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.setGlobalPrefix('api/v1')

  const env = app.get(EnvService)
  app.enableCors({ origin: env.get('FRONTEND_URL'), credentials: true })

  await app.listen(env.get('PORT'))
}
bootstrap()
