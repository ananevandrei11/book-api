import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { disconnect } from 'mongoose';
import { UserRegisterDto } from '../src/users/dto/users.dto';
import { UserRoleType } from '../src/users/model/users.model';
import { USER_ALREADY_REGISTERED } from '../src/auth/constants/auth.errors.constants';
import {
  USER_NOT_FOUND,
  USER_WRONG_PASSWORD,
} from '../src/users/constants/users.errors.constants';

const MockUser: UserRegisterDto = {
  email: `auth-${Date.now()}@test.com`,
  password: 'password',
  firstName: 'Auth',
  lastName: 'Test',
  phone: '1234567890',
  role: UserRoleType.User,
};

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;
  let userId: string;
  let userToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/auth/register (POST) - success', async () => {
    return await request(app.getHttpServer())
      .post('/auth/register')
      .send(MockUser)
      .expect(200)
      .then((res) => {
        userId = res.body._id;
        expect(res.body.email).toBe(MockUser.email);
        expect(res.body.role).toBe(MockUser.role);
      });
  });

  it('/auth/register (POST) - error - already registered', async () => {
    return await request(app.getHttpServer())
      .post('/auth/register')
      .send(MockUser)
      .expect(400, {
        statusCode: 400,
        message: USER_ALREADY_REGISTERED,
        error: 'Bad Request',
      });
  });

  it('/auth/register (POST) - error validation email', async () => {
    return await request(app.getHttpServer())
      .post('/auth/register')
      .send({ ...MockUser, email: 'not-an-email' })
      .expect(400)
      .then((res) => {
        expect(res.body).toMatchObject({
          statusCode: 400,
          error: 'Bad Request',
          message: ['email must be an email'],
        });
      });
  });

  it('/auth/register (POST) - error validation role', async () => {
    return await request(app.getHttpServer())
      .post('/auth/register')
      .send({ ...MockUser, role: 'superadmin' })
      .expect(400)
      .then((res) => {
        expect(res.body).toMatchObject({
          statusCode: 400,
          error: 'Bad Request',
        });
      });
  });

  it('/auth/register (POST) - error validation empty body', async () => {
    return await request(app.getHttpServer())
      .post('/auth/register')
      .send({})
      .expect(400)
      .then((res) => {
        expect(res.body).toMatchObject({
          statusCode: 400,
          error: 'Bad Request',
        });
      });
  });

  it('/auth/login (POST) - success', async () => {
    return await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: MockUser.email, password: MockUser.password })
      .expect(200)
      .then((res) => {
        userToken = res.body.access_token;
        expect(typeof userToken).toBe('string');
      });
  });

  it('/auth/login (POST) - error - user not found', async () => {
    return await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'missing-' + MockUser.email, password: MockUser.password })
      .expect(401, {
        statusCode: 401,
        message: USER_NOT_FOUND,
        error: 'Unauthorized',
      });
  });

  it('/auth/login (POST) - error - wrong password', async () => {
    return await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: MockUser.email, password: 'wrong' })
      .expect(401, {
        statusCode: 401,
        message: USER_WRONG_PASSWORD,
        error: 'Unauthorized',
      });
  });

  it('/auth/login (POST) - error validation', async () => {
    return await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'not-an-email' })
      .expect(400)
      .then((res) => {
        expect(res.body).toMatchObject({
          statusCode: 400,
          error: 'Bad Request',
        });
      });
  });

  afterAll(async () => {
    await request(app.getHttpServer())
      .delete('/users/' + userId)
      .set('Authorization', 'Bearer ' + userToken)
      .send({ email: MockUser.email, password: MockUser.password });
    await app.close();
    await disconnect();
  });
});
