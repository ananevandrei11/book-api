import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { HotelRoomType } from '../src/rooms/model/rooms.model';
import { CreateRoomDto } from '../src/rooms/dto/room.dto';
import { disconnect, Types } from 'mongoose';
import {
  ROOM_DTO_VALIDATION,
  ROOM_NOT_FOUND,
} from '../src/rooms/constants/rooms.errors.constants';
import { INVALID_ID } from '../src/pipes/id-validation.pipe';
import { UserRegisterDto } from '../src/users/dto/users.dto';
import { UserRoleType, UsersModel } from '../src/users/model/users.model';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';

const MockRoom: CreateRoomDto = {
  type: HotelRoomType.Single,
  number: 1,
  seaView: true,
};
const roomIdFalsy = new Types.ObjectId().toHexString();
const MockAdmin: UserRegisterDto = {
  email: `admin-${Date.now()}@test.com`,
  password: 'password',
  firstName: 'Admin',
  lastName: 'Test',
  phone: '1234567890',
};

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let adminId: string;
  let adminToken: string;
  let roomCreatedId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const adminRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send(MockAdmin);
    adminId = adminRes.body._id;
    await app
      .get<Model<UsersModel>>(getModelToken(UsersModel.name))
      .updateOne({ email: MockAdmin.email }, { role: UserRoleType.Admin });
    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: MockAdmin.email, password: MockAdmin.password });
    adminToken = adminLogin.body.access_token;
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/rooms/create (POST) - success', async () => {
    return await request(app.getHttpServer())
      .post('/rooms/create')
      .set('Authorization', 'Bearer ' + adminToken)
      .send(MockRoom)
      .expect(201)
      .then((res) => {
        roomCreatedId = res.body._id;
      });
  });

  it('/rooms/create (POST) - error validation type', async () => {
    return await request(app.getHttpServer())
      .post('/rooms/create')
      .set('Authorization', 'Bearer ' + adminToken)
      .send({ ...MockRoom, type: 'VIP' })
      .expect(400)
      .then((res) => {
        expect(res.body).toMatchObject({
          statusCode: 400,
          error: 'Validation',
          message: [ROOM_DTO_VALIDATION.type],
        });
      });
  });

  it('/rooms/create (POST) - error validation sea view', async () => {
    return await request(app.getHttpServer())
      .post('/rooms/create')
      .set('Authorization', 'Bearer ' + adminToken)
      .send({ ...MockRoom, seaView: 'YES' })
      .expect(400)
      .then((res) => {
        expect(res.body).toMatchObject({
          statusCode: 400,
          error: 'Validation',
          message: [ROOM_DTO_VALIDATION.seaView],
        });
      });
  });

  it('/rooms/create (POST) - error validation numer of room', async () => {
    return await request(app.getHttpServer())
      .post('/rooms/create')
      .set('Authorization', 'Bearer ' + adminToken)
      .send({ ...MockRoom, number: 0 })
      .expect(400)
      .then((res) => {
        expect(res.body).toMatchObject({
          statusCode: 400,
          error: 'Validation',
          message: [ROOM_DTO_VALIDATION.minNumber],
        });
      });
  });

  it('/rooms/create (POST) - error validation number is not integer', async () => {
    return await request(app.getHttpServer())
      .post('/rooms/create')
      .set('Authorization', 'Bearer ' + adminToken)
      .send({ ...MockRoom, number: 1.5 })
      .expect(400, {
        statusCode: 400,
        message: [ROOM_DTO_VALIDATION.intNumber],
        error: 'Validation',
      });
  });

  it('/rooms/create (POST) - error validation empty body', async () => {
    return await request(app.getHttpServer())
      .post('/rooms/create')
      .set('Authorization', 'Bearer ' + adminToken)
      .send({})
      .expect(400)
      .then((res) => {
        expect(res.body).toMatchObject({
          statusCode: 400,
          error: 'Validation',
        });
        expect(res.body.message).toEqual(
          expect.arrayContaining([
            ROOM_DTO_VALIDATION.type,
            ROOM_DTO_VALIDATION.intNumber,
            ROOM_DTO_VALIDATION.minNumber,
            ROOM_DTO_VALIDATION.seaView,
          ]),
        );
      });
  });

  it('/rooms/:id (GET ONE) - success', async () => {
    return await request(app.getHttpServer())
      .get('/rooms/' + roomCreatedId)
      .expect(200)
      .then((res) => {
        const id = res.body._id;
        expect(id).toBe(roomCreatedId);
      });
  });

  it('/rooms/:id (GET ONE) - error', async () => {
    return await request(app.getHttpServer())
      .get('/rooms/' + roomIdFalsy)
      .expect(404, { statusCode: 404, message: ROOM_NOT_FOUND });
  });

  it('/rooms/:id (GET ONE) - error - invalid id', async () => {
    return await request(app.getHttpServer()).get('/rooms/123').expect(400, {
      statusCode: 400,
      message: INVALID_ID,
      error: 'Bad Request',
    });
  });

  it('/rooms (GET ALL)', async () => {
    return await request(app.getHttpServer())
      .get('/rooms')
      .expect(200)
      .then((res) => {
        const rooms = res.body;
        expect(Array.isArray(rooms)).toBe(true);
      });
  });

  it('/rooms/:id (PATCH) - success', async () => {
    return await request(app.getHttpServer())
      .patch('/rooms/' + roomCreatedId)
      .set('Authorization', 'Bearer ' + adminToken)
      .send({
        seaView: false,
      })
      .expect(200)
      .then((res) => {
        const room = res.body;
        expect(room.seaView).toBeFalsy();
      });
  });

  it('/rooms/:id (PATCH) - error - id is not found', async () => {
    return await request(app.getHttpServer())
      .patch('/rooms/' + roomIdFalsy)
      .set('Authorization', 'Bearer ' + adminToken)
      .send({
        seaView: false,
      })
      .expect(404, { statusCode: 404, message: ROOM_NOT_FOUND });
  });

  it('/rooms/:id (PATCH) - error validation type', async () => {
    return await request(app.getHttpServer())
      .patch('/rooms/' + roomIdFalsy)
      .set('Authorization', 'Bearer ' + adminToken)
      .send({
        type: 'VIP',
      })
      .expect(400, {
        statusCode: 400,
        message: [ROOM_DTO_VALIDATION.type],
        error: 'Validation',
      });
  });

  it('/rooms/:id (PATCH) - error validation number of room', async () => {
    return await request(app.getHttpServer())
      .patch('/rooms/' + roomIdFalsy)
      .set('Authorization', 'Bearer ' + adminToken)
      .send({
        number: 0,
      })
      .expect(400, {
        statusCode: 400,
        message: [ROOM_DTO_VALIDATION.minNumber],
        error: 'Validation',
      });
  });

  it('/rooms/:id (PATCH) - error validation sea view', async () => {
    return await request(app.getHttpServer())
      .patch('/rooms/' + roomIdFalsy)
      .set('Authorization', 'Bearer ' + adminToken)
      .send({
        seaView: 0,
      })
      .expect(400, {
        statusCode: 400,
        message: [ROOM_DTO_VALIDATION.seaView],
        error: 'Validation',
      });
  });

  it('/rooms/:id (PATCH) - error validation type is null', async () => {
    return await request(app.getHttpServer())
      .patch('/rooms/' + roomCreatedId)
      .set('Authorization', 'Bearer ' + adminToken)
      .send({
        type: null,
      })
      .expect(400, {
        statusCode: 400,
        message: [ROOM_DTO_VALIDATION.type],
        error: 'Validation',
      });
  });

  it('/rooms/:id (DELETE) - success', async () => {
    return await request(app.getHttpServer())
      .delete('/rooms/' + roomCreatedId)
      .set('Authorization', 'Bearer ' + adminToken)
      .expect(200);
  });

  it('/rooms/:id (DELETE) - error', async () => {
    return await request(app.getHttpServer())
      .delete('/rooms/' + roomIdFalsy)
      .set('Authorization', 'Bearer ' + adminToken)
      .expect(404, { statusCode: 404, message: ROOM_NOT_FOUND });
  });

  afterAll(async () => {
    await request(app.getHttpServer())
      .delete('/users/' + adminId)
      .set('Authorization', 'Bearer ' + adminToken)
      .send({ email: MockAdmin.email, password: MockAdmin.password });
    await app.close();
    await disconnect();
  });
});
