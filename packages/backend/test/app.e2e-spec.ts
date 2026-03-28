import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { cleanDatabase, seedTestUser, prisma } from './setup-e2e';

describe('App E2E', () => {
  let app: INestApplication;
  // Store the agent so we can persist cookies across requests
  let agent: ReturnType<typeof request.agent>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    (app as any).set('trust proxy', true);
    await app.init();
    agent = request.agent(app.getHttpServer());
  });

  afterAll(async () => {
    await cleanDatabase();
    await app.close();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await cleanDatabase();
  });

  // ── Auth E2E ──────────────────────────────────────────────────

  describe('Auth E2E', () => {
    it('should seed and retrieve the e2e test user', async () => {
      const user = await seedTestUser();
      expect(user.id).toBeGreaterThan(0);
      expect(user.githubUserId).toBe('e2e-test');
    });

    it('should login via e2e-login endpoint and set JWT cookie', async () => {
      const user = await seedTestUser();
      const res = await request(app.getHttpServer())
        .get(`/auth/e2e-login?userId=${user.id}`)
        .expect(200);

      expect(res.body.user).toBeDefined();
      expect(res.body.user.id).toBe(user.id);
      // Cookie should be set by the endpoint
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('should redirect with test token via github/callback in e2e mode', async () => {
      const res = await request(app.getHttpServer())
        .get('/auth/github/callback?code=e2e-test-token&state=test')
        .expect(302);
      expect(res.headers['location']).toContain('/home/cloud-docs');
    });

    it('should logout successfully', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/logout')
        .expect(200);
      expect(res.body.message).toBe('Logged out successfully');
    });

    it('should return token from /auth/token when cookie is set', async () => {
      const user = await seedTestUser();
      // Login to get cookie
      await request(app.getHttpServer())
        .get(`/auth/e2e-login?userId=${user.id}`)
        .expect(200);

      const res = await request(app.getHttpServer())
        .get('/auth/token')
        .expect(200);
      expect(res.body.token).toBeDefined();
    });
  });

  // ── Documents API E2E ─────────────────────────────────────────

  describe('Documents API (authenticated)', () => {
    let testUser: { id: number };

    beforeEach(async () => {
      testUser = await seedTestUser();
    });

    it('should create a document', async () => {
      // Login to get cookie
      const loginRes = await request(app.getHttpServer())
        .get(`/auth/e2e-login?userId=${testUser.id}`)
        .expect(200);

      const cookies = loginRes.headers['set-cookie'];
      expect(cookies).toBeDefined();

      const res = await request(app.getHttpServer())
        .post('/documents/create')
        .set('Cookie', cookies)
        .send({ title: 'E2E Test Doc' })
        .expect(201);

      expect(res.body).toBeDefined();
      expect(res.body.title).toBe('E2E Test Doc');
    });

    it('should list documents for authenticated user', async () => {
      const loginRes = await request(app.getHttpServer())
        .get(`/auth/e2e-login?userId=${testUser.id}`)
        .expect(200);

      await request(app.getHttpServer())
        .post('/documents/create')
        .set('Cookie', loginRes.headers['set-cookie'])
        .send({ title: 'My Doc' })
        .expect(201);

      const res = await request(app.getHttpServer())
        .get('/documents/list')
        .set('Cookie', loginRes.headers['set-cookie'])
        .expect(200);

      // API returns { items: [...], total, page, pageSize }
      expect(Array.isArray(res.body.items)).toBe(true);
      expect(res.body.items.length).toBeGreaterThan(0);
    });

    it('should create a folder', async () => {
      const loginRes = await request(app.getHttpServer())
        .get(`/auth/e2e-login?userId=${testUser.id}`)
        .expect(200);

      const res = await request(app.getHttpServer())
        .post('/documents/folder')
        .set('Cookie', loginRes.headers['set-cookie'])
        .send({ title: 'Test Folder' })
        .expect(201);

      expect(res.body.title).toBe('Test Folder');
      expect(res.body.isFolder).toBe(true);
    });

    it('should get document tree', async () => {
      const loginRes = await request(app.getHttpServer())
        .get(`/auth/e2e-login?userId=${testUser.id}`)
        .expect(200);

      // Create a folder and a doc inside it
      await request(app.getHttpServer())
        .post('/documents/folder')
        .set('Cookie', loginRes.headers['set-cookie'])
        .send({ title: 'Parent Folder' })
        .expect(201);

      const treeRes = await request(app.getHttpServer())
        .get('/documents/tree')
        .set('Cookie', loginRes.headers['set-cookie'])
        .expect(200);

      expect(Array.isArray(treeRes.body)).toBe(true);
    });

    it('should search documents', async () => {
      const loginRes = await request(app.getHttpServer())
        .get(`/auth/e2e-login?userId=${testUser.id}`)
        .expect(200);

      await request(app.getHttpServer())
        .post('/documents/create')
        .set('Cookie', loginRes.headers['set-cookie'])
        .send({ title: 'Unique Search Term Doc' })
        .expect(201);

      const res = await request(app.getHttpServer())
        .get('/documents/search?q=Unique')
        .set('Cookie', loginRes.headers['set-cookie'])
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should reject unauthenticated requests to /documents/list', async () => {
      await request(app.getHttpServer())
        .get('/documents/list')
        .expect(401);
    });

    it('should reject unauthenticated document creation', async () => {
      await request(app.getHttpServer())
        .post('/documents/create')
        .send({ title: 'Unauthorized Doc' })
        .expect(401);
    });
  });
});
