import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect((res) => {
        const body = res.body;
        expect(body.success).toBe(true);
        expect(body.data).toBe('Hello World!');
        expect(body.meta).toBeDefined();
        expect(body.meta.timestamp).toBeDefined();
        expect(body.meta.requestId).toBeDefined();
      });
  });

  it('/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect((res) => {
        const body = res.body;
        expect(body.success).toBe(true);
        expect(body.data).toEqual(
          expect.objectContaining({
            status: 'ok',
            service: 'vet-reg-backend',
            timestamp: expect.any(String),
          }),
        );
      });
  });
});
