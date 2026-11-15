import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { HotelRoomType } from '../src/rooms/model/rooms.model';
import { disconnect, Types } from 'mongoose';
import { CreateScheduleDto } from '../src/schedule/dto/schedule.dto';
import { CreateRoomDto } from '../src/rooms/dto/room.dto';

const scheduleIdFalsy = new Types.ObjectId().toHexString();
const MockRoom: CreateRoomDto = {
  type: HotelRoomType.Single,
  number: 1,
  seaView: true,
};

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let scheduleCreatedId: string;
  let roomCreatedId: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/rooms/create (POST)', async () => {
    return await request(app.getHttpServer())
      .post('/rooms/create')
      .send(MockRoom)
      .expect(201)
      .then((res) => {
        roomCreatedId = res.body._id;
      });
  });

  it('/schedule (POST) - create success', async () => {
    return await request(app.getHttpServer())
      .post('/schedule')
      .send({ date: '2025-12-02', roomId: roomCreatedId })
      .expect(201)
      .then((res) => {
        scheduleCreatedId = res.body._id;
      });
  });

  it('/schedule (POST) - create - confilct "Room already booked"', async () => {
    return await request(app.getHttpServer())
      .post('/schedule')
      .send({ date: '2025-12-02', roomId: roomCreatedId })
      .expect(409, {
        statusCode: 409,
        message: 'Room already booked for this date',
        error: 'Schedule conflict',
      });
  });

  it('/schedule (POST) - create - validation error', async () => {
    return await request(app.getHttpServer())
      .post('/schedule')
      .send({ date: '2024-02-31', roomId: roomCreatedId })
      .expect(400);
  });

  it('/schedule/:id (PATCH)', async () => {
    return await request(app.getHttpServer())
      .patch('/schedule/' + scheduleCreatedId)
      .send({
        date: '2025-12-03',
      })
      .expect(200)
      .then((res) => {
        const schedule = res.body;
        expect(schedule.date).toBe('2025-12-03');
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
      .expect(404);
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

  it('/schedule/:id (DELETE) - success', async () => {
    return await request(app.getHttpServer())
      .delete('/schedule/' + scheduleCreatedId)
      .expect(200);
  });

  it('/schedule/:id (DELETE) - error', async () => {
    return await request(app.getHttpServer())
      .delete('/rooschedulems/' + scheduleIdFalsy)
      .expect(404);
  });

  it('/rooms/:id (DELETE) - success', async () => {
      return await request(app.getHttpServer())
        .delete('/rooms/' + roomCreatedId)
        .expect(200);
    });

  afterAll(async () => {
    await app.close();
    disconnect();
  });
});
