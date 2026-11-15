import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { HotelRoomType } from '../src/rooms/model/rooms.model';
import { CreateRoomDto } from '../src/rooms/dto/room.dto';
import { disconnect, Types } from 'mongoose';

const MockRoom: CreateRoomDto = {
  type: HotelRoomType.Single,
  number: 1,
  seaView: true,
};
const roomIdFalsy = new Types.ObjectId().toHexString();

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
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

  it('/rooms/create (POST) - success', async () => {
    return await request(app.getHttpServer())
      .post('/rooms/create')
      .send(MockRoom)
      .expect(201)
      .then((res) => {
        roomCreatedId = res.body._id;
      });
  });

  it('/rooms/create (POST) - error validation', async () => {
    return await request(app.getHttpServer())
      .post('/rooms/create')
      .send({ ...MockRoom, type: 'VIP' })
      .expect(400)
      .then((res) => {
        expect(res.body).toMatchObject({ statusCode: 400, error: 'Validation' });
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
      .expect(404);
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
      .send({
        seaView: false,
      })
      .expect(200)
      .then((res) => {
        const room = res.body;
        expect(room.seaView).toBeFalsy();
      });
  });

  it('/rooms/:id (PATCH) - error', async () => {
    return await request(app.getHttpServer())
      .patch('/rooms/' + roomIdFalsy)
      .send({
        seaView: false,
      })
      .expect(404);
  });

  it('/rooms/:id (DELETE) - success', async () => {
    return await request(app.getHttpServer())
      .delete('/rooms/' + roomCreatedId)
      .expect(200);
  });

  it('/rooms/:id (DELETE) - error', async () => {
    return await request(app.getHttpServer())
      .delete('/rooms/' + roomIdFalsy)
      .expect(404);
  });

  afterAll(async () => {
    await app.close();
    disconnect();
  });
});
