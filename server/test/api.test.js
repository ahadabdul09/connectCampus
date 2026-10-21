import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/config/prisma.js';

describe('connectCampus API & Security Tests', () => {
  let studentToken = '';
  let adminToken = '';
  let studentUserId = '';
  let conversationId = '';

  beforeAll(async () => {
    // 1. Authenticate as Student
    const studentRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'abdul.ahad@campus.edu',
        password: 'Campus@123',
      });

    expect(studentRes.status).toBe(200);
    expect(studentRes.body.success).toBe(true);
    studentToken = studentRes.body.data.accessToken;
    studentUserId = studentRes.body.data.user.id;

    // 2. Authenticate as Super Admin
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@campus.edu',
        password: 'Campus@123',
      });

    expect(adminRes.status).toBe(200);
    adminToken = adminRes.body.data.accessToken;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('GET /api/health should return system status healthy', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  it('POST /api/auth/login should reject invalid passwords', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'abdul.ahad@campus.edu',
        password: 'WrongPassword123',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/users/me should return authenticated profile', async () => {
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('abdul.ahad@campus.edu');
    expect(res.body.data.role).toBe('STUDENT');
  });

  it('GET /api/chat/conversations should return active conversations', async () => {
    const res = await request(app)
      .get('/api/chat/conversations')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    conversationId = res.body.data[0].id;
  });

  it('POST /api/chat/conversations/:id/messages should send a real-time message', async () => {
    const res = await request(app)
      .post(`/api/chat/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        content: 'Automated test message for placement verification.',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.content).toBe('Automated test message for placement verification.');
  });

  it('GET /api/announcements should return prioritized notices', async () => {
    const res = await request(app)
      .get('/api/announcements')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('Role Guard: Student cannot publish announcements (403 Forbidden)', async () => {
    const res = await request(app)
      .post('/api/announcements')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        title: 'Unauthorized Announcement',
        content: 'This should be blocked by role authorization.',
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('Admin Access: Super Admin can access /api/admin/stats', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.overview.totalUsers).toBeGreaterThanOrEqual(20);
    expect(res.body.data.messageVolumeTrend.length).toBe(7);
  });

  it('Campus AI RAG: Responds to query with verified citations', async () => {
    const res = await request(app)
      .post('/api/ai/chat')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        query: 'What is the Deloitte eligibility criteria?',
        mode: 'CAMPUS_QA',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.answer).toBeDefined();
    expect(Array.isArray(res.body.data.citations)).toBe(true);
  });

  it('GET /api/events should return campus events list', async () => {
    const res = await request(app)
      .get('/api/events')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('GET /api/resources should return curated academic resources', async () => {
    const res = await request(app)
      .get('/api/resources')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('GET /api/communities should return departmental channels and clubs', async () => {
    const res = await request(app)
      .get('/api/communities')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.departments).toBeDefined();
    expect(res.body.data.clubs).toBeDefined();
  });

  it('GET /api/notifications should return user notification feed', async () => {
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.notifications)).toBe(true);
    expect(typeof res.body.data.unreadCount).toBe('number');
  });

  it('GET /api/search should perform multi-entity campus search', async () => {
    const res = await request(app)
      .get('/api/search?q=placement')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
  });
});
