import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { hash } from 'bcryptjs'
import request from 'supertest'
import { UserFactory } from 'test/factories/make-user'

describe('Authenticate (E2E)', () => {
  let app: INestApplication
  let userFactory: UserFactory

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [UserFactory],
    }).compile()

    app = moduleRef.createNestApplication()
    app.setGlobalPrefix('api/v1')
    userFactory = moduleRef.get(UserFactory)
    await app.init()
  })

  test('[POST] /sessions', async () => {
    await userFactory.makePrismaUser({
      email: 'admin@empresa.com',
      passwordHash: await hash('admin123', 8),
    })

    const response = await request(app.getHttpServer())
      .post('/api/v1/sessions')
      .send({ email: 'admin@empresa.com', password: 'admin123' })

    expect(response.statusCode).toBe(201)
    expect(response.body).toEqual({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
    })
  })
})
