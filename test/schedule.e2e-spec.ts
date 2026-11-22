import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { HotelRoomType } from '../src/rooms/model/rooms.model';
import { disconnect, Types } from 'mongoose';
import { CreateScheduleDto } from '../src/schedule/dto/schedule.dto';
import { CreateRoomDto } from '../src/rooms/dto/room.dto';
import {
  SCHEDULE_DTO_VALIDATION,
  SCHEDULE_NOT_FOUND,
} from '../src/schedule/constants/schedule.errors.constants';
import { ROOM_NOT_FOUND } from '../src/rooms/constants/rooms.errors.constants';
import { INVALID_ID } from '../src/pipes/id-validation.pipe';
import { UserRegisterDto } from '../src/users/dto/users.dto';

const scheduleIdFalsy = new Types.ObjectId().toHexString();
const roomIdFalsy = new Types.ObjectId().toHexString();
const MockRoom: CreateRoomDto = {
  type: HotelRoomType.Single,
  number: 1,
  seaView: true,
};
const MockAdmin: UserRegisterDto = {
  email: `admin-${Date.now()}@test.com`,
  password: 'password',
  firstName: 'Admin',
  lastName: 'Test',
  phone: '1234567890',
};
const MockOther: UserRegisterDto = {
  email: `other-${Date.now()}@test.com`,
  password: 'password',
  firstName: 'Other',
  lastName: 'Test',
  phone: '1234567890',
};
const MockUser: UserRegisterDto = {
  email: `user-${Date.now()}@test.com`,
  password: 'password',
  firstName: 'User',
  lastName: 'Test',
  phone: '1234567890',
};

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let adminId: string;
  let adminToken: string;
  let userId: string;
  let userToken: string;
  let otherId: string;
  let otherToken: string;
  let scheduleCreatedId: string;
  let roomCreatedId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const adminRes = await request(app.getHttpServer())
      .post('/auth/register-admin')
      .send(MockAdmin);
    adminId = adminRes.body._id;
    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: MockAdmin.email, password: MockAdmin.password });
    adminToken = adminLogin.body.access_token;

    const userRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send(MockUser);
    userId = userRes.body._id;
    const userLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: MockUser.email, password: MockUser.password });
    userToken = userLogin.body.access_token;

    const otherRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send(MockOther);
    otherId = otherRes.body._id;
    const otherLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: MockOther.email, password: MockOther.password });
    otherToken = otherLogin.body.access_token;
  });

  it('/rooms/create (POST)', async () => {
    return await request(app.getHttpServer())
      .post('/rooms/create')
      .set('Authorization', 'Bearer ' + adminToken)
      .send(MockRoom)
      .expect(201)
      .then((res) => {
        roomCreatedId = res.body._id;
      });
  });

  it('/schedule (POST) - create success', async () => {
    return await request(app.getHttpServer())
      .post('/schedule')
      .set('Authorization', 'Bearer ' + userToken)
      .send({ date: '2025-12-02', roomId: roomCreatedId })
      .expect(201)
      .then((res) => {
        scheduleCreatedId = res.body._id;
      });
  });

  it('/schedule (POST) - create - confilct "Room already booked"', async () => {
    return await request(app.getHttpServer())
      .post('/schedule')
      .set('Authorization', 'Bearer ' + userToken)
      .send({ date: '2025-12-02', roomId: roomCreatedId })
      .expect(409, {
        statusCode: 409,
        message: 'Room already booked for this date',
        error: 'Schedule conflict',
      });
  });

  it('/schedule (POST) - create - pipe validation error - not a real date', async () => {
    return await request(app.getHttpServer())
      .post('/schedule')
      .set('Authorization', 'Bearer ' + userToken)
      .send({ date: '2024-02-31', roomId: roomCreatedId })
      .expect(400, {
        statusCode: 400,
        message: [SCHEDULE_DTO_VALIDATION.realDate],
        error: 'Validation',
      });
  });

  it('/schedule (POST) - create - pipe validation error - date', async () => {
    return await request(app.getHttpServer())
      .post('/schedule')
      .set('Authorization', 'Bearer ' + userToken)
      .send({ date: '2026, November 19', roomId: roomCreatedId })
      .expect(400)
      .then((res) => {
        expect(res.body).toMatchObject({
          statusCode: 400,
          error: 'Validation',
        });
        expect(res.body.message).toEqual(
          expect.arrayContaining([SCHEDULE_DTO_VALIDATION.date]),
        );
      });
  });

  it('/schedule (POST) - create - pipe validation error - empty body', async () => {
    return await request(app.getHttpServer())
      .post('/schedule')
      .set('Authorization', 'Bearer ' + userToken)
      .send({})
      .expect(400)
      .then((res) => {
        expect(res.body).toMatchObject({
          statusCode: 400,
          error: 'Validation',
        });
        expect(res.body.message).toEqual(
          expect.arrayContaining([
            'roomId must be a mongodb id',
            SCHEDULE_DTO_VALIDATION.date,
            SCHEDULE_DTO_VALIDATION.realDate,
          ]),
        );
      });
  });

  it('/schedule (POST) - create - room not found', async () => {
    return await request(app.getHttpServer())
      .post('/schedule')
      .set('Authorization', 'Bearer ' + userToken)
      .send({ date: '2025-12-02', roomId: roomIdFalsy })
      .expect(404, {
        statusCode: 404,
        message: ROOM_NOT_FOUND,
        error: 'Not Found',
      });
  });

  it('/schedule (POST) - create - pipe validation error roomId', async () => {
    return await request(app.getHttpServer())
      .post('/schedule')
      .set('Authorization', 'Bearer ' + userToken)
      .send({ date: '2025-12-02', roomId: '123' })
      .expect(400)
      .then((res) => {
        expect(res.body).toMatchObject({
          statusCode: 400,
          error: 'Validation',
        });
      });
  });

  it('/schedule/:id (PATCH) - success', async () => {
    return await request(app.getHttpServer())
      .patch('/schedule/' + scheduleCreatedId)
      .set('Authorization', 'Bearer ' + userToken)
      .send({
        date: '2025-12-03',
      })
      .expect(200)
      .then((res) => {
        const schedule = res.body;
        expect(schedule.date).toBe('2025-12-03');
      });
  });

  it('/schedule/:id (PATCH) - error - not found', async () => {
    return await request(app.getHttpServer())
      .patch('/schedule/' + scheduleIdFalsy)
      .set('Authorization', 'Bearer ' + userToken)
      .send({
        date: '2025-12-03',
      })
      .expect(404, { statusCode: 404, message: SCHEDULE_NOT_FOUND });
  });

  it('/schedule/:id (PATCH) - error - room not found', async () => {
    return await request(app.getHttpServer())
      .patch('/schedule/' + scheduleCreatedId)
      .set('Authorization', 'Bearer ' + userToken)
      .send({
        roomId: roomIdFalsy,
      })
      .expect(404, {
        statusCode: 404,
        message: ROOM_NOT_FOUND,
        error: 'Not Found',
      });
  });

  it('/schedule/:id (PATCH) - error - pipe validation - roomId', async () => {
    return await request(app.getHttpServer())
      .patch('/schedule/' + scheduleCreatedId)
      .set('Authorization', 'Bearer ' + userToken)
      .send({
        roomId: 123,
      })
      .expect(400)
      .then((res) => {
        expect(res.body).toMatchObject({
          statusCode: 400,
          error: 'Validation',
        });
      });
  });

  it('/schedule/:id (PATCH) - error - pipe validation error - not a real date', async () => {
    return await request(app.getHttpServer())
      .patch('/schedule/' + scheduleCreatedId)
      .set('Authorization', 'Bearer ' + userToken)
      .send({
        date: '2024-02-31',
      })
      .expect(400, {
        statusCode: 400,
        message: [SCHEDULE_DTO_VALIDATION.realDate],
        error: 'Validation',
      });
  });

  it('/schedule/:id (PATCH) - error - pipe validation error - date', async () => {
    return await request(app.getHttpServer())
      .patch('/schedule/' + scheduleCreatedId)
      .set('Authorization', 'Bearer ' + userToken)
      .send({ date: '2026, November 19' })
      .expect(400)
      .then((res) => {
        expect(res.body).toMatchObject({
          statusCode: 400,
          error: 'Validation',
        });
        expect(res.body.message).toEqual(
          expect.arrayContaining([SCHEDULE_DTO_VALIDATION.date]),
        );
      });
  });

  it('/schedule/:id (GET ONE) - success', async () => {
    return await request(app.getHttpServer())
      .get('/schedule/' + scheduleCreatedId)
      .expect(200)
      .then((res) => {
        const id = res.body._id;
        expect(id).toBe(scheduleCreatedId);
      });
  });

  it('/schedule/:id (GET ONE) - error', async () => {
    return await request(app.getHttpServer())
      .get('/schedule/' + scheduleIdFalsy)
      .expect(404, { statusCode: 404, message: SCHEDULE_NOT_FOUND });
  });

  it('/schedule/:id (GET ONE) - error - invalid id', async () => {
    return await request(app.getHttpServer()).get('/schedule/123').expect(400, {
      statusCode: 400,
      message: INVALID_ID,
      error: 'Bad Request',
    });
  });

  it('/schedule (GET ALL)', async () => {
    return await request(app.getHttpServer())
      .get('/schedule')
      .expect(200)
      .then((res) => {
        const schedules = res.body;
        expect(Array.isArray(schedules)).toBe(true);
      });
  });

  it('/schedule/:id (PATCH) - error - booking of another user', async () => {
    return await request(app.getHttpServer())
      .patch('/schedule/' + scheduleCreatedId)
      .set('Authorization', 'Bearer ' + otherToken)
      .send({ date: '2025-12-04' })
      .expect(404, { statusCode: 404, message: SCHEDULE_NOT_FOUND });
  });

  it('/schedule/:id (DELETE) - error - booking of another user', async () => {
    return await request(app.getHttpServer())
      .delete('/schedule/' + scheduleCreatedId)
      .set('Authorization', 'Bearer ' + otherToken)
      .expect(404, { statusCode: 404, message: SCHEDULE_NOT_FOUND });
  });

  it('/schedule/:id (DELETE) - success', async () => {
    return await request(app.getHttpServer())
      .delete('/schedule/' + scheduleCreatedId)
      .set('Authorization', 'Bearer ' + userToken)
      .expect(200);
  });

  it('/schedule/:id (DELETE) - error', async () => {
    return await request(app.getHttpServer())
      .delete('/schedule/' + scheduleIdFalsy)
      .set('Authorization', 'Bearer ' + userToken)
      .expect(404, { statusCode: 404, message: SCHEDULE_NOT_FOUND });
  });

  it('/rooms/:id (DELETE) - success', async () => {
    return await request(app.getHttpServer())
      .delete('/rooms/' + roomCreatedId)
      .set('Authorization', 'Bearer ' + adminToken)
      .expect(200);
  });

  afterAll(async () => {
    await request(app.getHttpServer())
      .delete('/users/' + otherId)
      .set('Authorization', 'Bearer ' + otherToken)
      .send({ email: MockOther.email, password: MockOther.password });
    await request(app.getHttpServer())
      .delete('/users/' + adminId)
      .set('Authorization', 'Bearer ' + adminToken)
      .send({ email: MockAdmin.email, password: MockAdmin.password });
    await request(app.getHttpServer())
      .delete('/users/' + userId)
      .set('Authorization', 'Bearer ' + userToken)
      .send({ email: MockUser.email, password: MockUser.password });
    await app.close();
    await disconnect();
  });
});
