import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { disconnect } from 'mongoose';
import { UserRegisterDto } from '../src/users/dto/users.dto';
import { UserRoleType } from '../src/users/model/users.model';
import { USER_WRONG_PASSWORD } from '../src/users/constants/users.errors.constants';

const MockUser: UserRegisterDto = {
  email: `users-${Date.now()}@test.com`,
  password: 'password',
  firstName: 'Users',
  lastName: 'Test',
  phone: '1234567890',
  role: UserRoleType.User,
};

describe('UsersController (e2e)', () => {
  let app: INestApplication<App>;
  let userId: string;
  let userToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const userRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send(MockUser);
    userId = userRes.body._id;
    const userLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: MockUser.email, password: MockUser.password });
    userToken = userLogin.body.access_token;
  });

  it('/users/:id (DELETE) - error - no token', async () => {
    return await request(app.getHttpServer())
      .delete('/users/' + userId)
      .send({ email: MockUser.email, password: MockUser.password })
      .expect(401);
  });

  it('/users/:id (DELETE) - error - wrong password', async () => {
    return await request(app.getHttpServer())
      .delete('/users/' + userId)
      .set('Authorization', 'Bearer ' + userToken)
      .send({ email: MockUser.email, password: 'wrong' })
      .expect(401, {
        statusCode: 401,
        message: USER_WRONG_PASSWORD,
        error: 'Unauthorized',
      });
  });

  it('/users/:id (DELETE) - error validation', async () => {
    return await request(app.getHttpServer())
      .delete('/users/' + userId)
      .set('Authorization', 'Bearer ' + userToken)
      .send({})
      .expect(400)
      .then((res) => {
        expect(res.body).toMatchObject({
          statusCode: 400,
          error: 'Bad Request',
        });
      });
  });

  it('/users/:id (DELETE) - success', async () => {
    return await request(app.getHttpServer())
      .delete('/users/' + userId)
      .set('Authorization', 'Bearer ' + userToken)
      .send({ email: MockUser.email, password: MockUser.password })
      .expect(200)
      .then((res) => {
        expect(res.body._id).toBe(userId);
      });
  });

  afterAll(async () => {
    await app.close();
    await disconnect();
  });
});
