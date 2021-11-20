import { Test } from '@nestjs/testing';
import { Connection } from 'mongoose';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';

import { AppModule } from '../app.module';
import { DatabaseService } from '../database/database.service';

describe('UsersController', () => {
  let dbConnection: Connection;
  let httpServer: any;
  let app: any;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
    dbConnection = moduleRef
      .get<DatabaseService>(DatabaseService)
      .getDbHandle();
    httpServer = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await dbConnection.collection('users').deleteMany({});
  });

  describe('register', () => {
    it('register success', async () => {
      const params = {
        email: 'test@example.com',
        username: 'abcabc',
        password: '123123',
      };
      const response = await request(httpServer)
        .post('/auth/register')
        .send(params);

      expect(response.status).toBe(200);
    });

    it('it fail beacuse dup email', async () => {
      const params = {
        email: 'test@example.com',
        username: 'abcabc',
        password: '123123',
      };
      let response = await request(httpServer)
        .post('/auth/register')
        .send(params);

      expect(response.status).toBe(200);

      response = await request(httpServer).post('/auth/register').send(params);

      expect(response.status).toBe(422);
    });
  });

  describe('login', () => {
    it('it success', async () => {
      const password = '123123';
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);
      const params = {
        email: 'test2@egample.com',
        username: 'abcabc',
        password: password_hash,
      };
      await dbConnection.collection('users').insertOne(params);
      const response = await request(httpServer)
        .post('/auth/login')
        .send({ email: params.email, password: password });

      expect(response.status).toBe(200);
    });

    it('it failed because wrong password', async () => {
      const password = '123123';
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);
      const params = {
        email: 'test2@egample.com',
        username: 'abcabc',
        password: password_hash,
      };
      await dbConnection.collection('users').insertOne(params);
      const response = await request(httpServer)
        .post('/auth/login')
        .send({ email: params.email, password: '123456' });

      expect(response.status).toBe(422);
    });
  });
});
