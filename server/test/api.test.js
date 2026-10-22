import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/config/prisma.js';

describe('connectCampus API, Security, & Workflow Tests', () => {
  let adminToken = '';
  let studentToken = '';
  let studentUserId = '';
  let facultyToken = '';
  let facultyUserId = '';
  let departmentId = '';
  let clubId = '';
  let inviteToken = '';
  let conversationId = '';

  const cleanupTestData = async () => {
    try {
      await prisma.messageReaction.deleteMany({});
      await prisma.message.deleteMany({});
      await prisma.conversationMember.deleteMany({});
      await prisma.conversation.deleteMany({});
      await prisma.documentChunk.deleteMany({});
      await prisma.document.deleteMany({});
      await prisma.invitation.deleteMany({});
      await prisma.clubMember.deleteMany({});
      await prisma.club.deleteMany({ where: { code: 'ROBO' } });
      await prisma.refreshToken.deleteMany({});
      await prisma.user.deleteMany({
        where: { email: { not: 'admin@campus.edu' } },
      });
      await prisma.department.deleteMany({ where: { code: 'ISE' } });
    } catch (e) {
      // ignore cleanup errors on initial empty state
    }
  };

  beforeAll(async () => {
    await cleanupTestData();

    // 1. Authenticate as Super Admin (Bootstrap User)
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@campus.edu',
        password: 'CampusAdmin@2026',
      });

    expect(adminRes.status).toBe(200);
    expect(adminRes.body.success).toBe(true);
    expect(adminRes.body.data.user.role).toBe('SUPER_ADMIN');
    adminToken = adminRes.body.data.accessToken;
  });

  afterAll(async () => {
    await cleanupTestData();
    await prisma.$disconnect();
  });

  it('GET /api/health should return system status healthy', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  it('Admin: Create a Department via POST /api/admin/departments', async () => {
    const res = await request(app)
      .post('/api/admin/departments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Information Science & Engineering',
        code: 'ISE',
        description: 'Department of Information Science and Engineering',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.code).toBe('ISE');
    departmentId = res.body.data.id;
  });

  it('Public: GET /api/communities/departments returns created department without auth', async () => {
    const res = await request(app).get('/api/communities/departments');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    const ise = res.body.data.find((d) => d.code === 'ISE');
    expect(ise).toBeDefined();
    expect(ise.name).toBe('Information Science & Engineering');
  });

  it('Auth: Public self-registration enforces role=STUDENT even if client sends SUPER_ADMIN', async () => {
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Aarav Patel',
        email: 'aarav.patel@campus.edu',
        password: 'StudentPassword@123',
        departmentId,
        batch: '2026',
        role: 'SUPER_ADMIN', // attempt privilege escalation
      });

    expect(regRes.status).toBe(201);
    expect(regRes.body.data.user.role).toBe('STUDENT'); // locked to STUDENT
    studentUserId = regRes.body.data.user.id;
    studentToken = regRes.body.data.accessToken;
  });

  it('Auth: Student profile can be retrieved via GET /api/users/me', async () => {
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('aarav.patel@campus.edu');
    expect(res.body.data.role).toBe('STUDENT');
  });

  it('Security Guard: Student cannot access Admin Stats (403 Forbidden)', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('Security Guard: Student cannot issue Invitations (403 Forbidden)', async () => {
    const res = await request(app)
      .post('/api/admin/invitations')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        email: 'hacker@campus.edu',
        role: 'SUPER_ADMIN',
      });

    expect(res.status).toBe(403);
  });

  it('Security Guard: Student cannot publish Announcements (403 Forbidden)', async () => {
    const res = await request(app)
      .post('/api/announcements')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        title: 'Unauthorized Notice',
        content: 'This announcement should fail authorization.',
      });

    expect(res.status).toBe(403);
  });

  it('Admin Invitations: Super Admin can issue an invite for a Faculty member', async () => {
    const res = await request(app)
      .post('/api/admin/invitations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        email: 'prof.sharma@campus.edu',
        role: 'FACULTY',
        departmentId,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    inviteToken = res.body.data.token;
  });

  it('Public: GET /api/auth/verify-invite/:token validates invitation token', async () => {
    const res = await request(app).get(`/api/auth/verify-invite/${inviteToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('prof.sharma@campus.edu');
    expect(res.body.data.role).toBe('FACULTY');
  });

  it('Auth: Faculty accepts invitation via POST /api/auth/accept-invite', async () => {
    const res = await request(app)
      .post('/api/auth/accept-invite')
      .send({
        token: inviteToken,
        fullName: 'Prof. Ananya Sharma',
        password: 'FacultyPassword@123',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.user.role).toBe('FACULTY');
    expect(res.body.data.user.email).toBe('prof.sharma@campus.edu');
    facultyUserId = res.body.data.user.id;
    facultyToken = res.body.data.accessToken;
  });

  it('User Management & Deactivation: Admin can deactivate a user', async () => {
    // Admin deactivates student
    const deactRes = await request(app)
      .patch(`/api/admin/users/${studentUserId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isActive: false });

    expect(deactRes.status).toBe(200);
    expect(deactRes.body.data.isActive).toBe(false);

    // Deactivated student tries to access API -> blocked with 403
    const blockedRes = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(blockedRes.status).toBe(403);
    expect(blockedRes.body.error).toContain('deactivated');

    // Admin reactivates student
    const reactRes = await request(app)
      .patch(`/api/admin/users/${studentUserId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isActive: true });

    expect(reactRes.status).toBe(200);
    expect(reactRes.body.data.isActive).toBe(true);

    // Student can access API again
    const successRes = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(successRes.status).toBe(200);
  });

  it('Admin: Create a Club via POST /api/admin/clubs', async () => {
    const res = await request(app)
      .post('/api/admin/clubs')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Robotics & AI Society',
        code: 'ROBO',
        description: 'Autonomous robotics and intelligent systems club',
        category: 'TECHNICAL',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.code).toBe('ROBO');
    clubId = res.body.data.id;
  });

  it('GET /api/communities returns real departments and clubs', async () => {
    const res = await request(app)
      .get('/api/communities')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.departments.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.clubs.length).toBeGreaterThanOrEqual(1);
  });

  it('Chat: Student initiates conversation with Faculty and sends message', async () => {
    const convRes = await request(app)
      .post('/api/chat/conversations')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        title: 'Operating Systems Research Project',
        type: 'DIRECT',
        participantIds: [facultyUserId],
      });

    expect(convRes.status).toBe(201);
    conversationId = convRes.body.data.id;

    const msgRes = await request(app)
      .post(`/api/chat/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        content: 'Respected Professor, submitting the initial draft of our research paper.',
      });

    expect(msgRes.status).toBe(201);
    expect(msgRes.body.data.content).toBe('Respected Professor, submitting the initial draft of our research paper.');
  });

  it('AI Knowledge Base: Ingest official campus document and query via RAG', async () => {
    // Admin ingests document into DocumentChunk index
    const ingestRes = await request(app)
      .post('/api/ai/documents')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Academic Regulations & Attendance Policy 2026',
        content: 'Minimum mandatory attendance for all undergraduate degree courses is seventy-five percent to be eligible for end semester examinations. Students falling between sixty-five and seventy-four percent due to medical reasons must submit verified certificates within ten days.',
        category: 'ACADEMICS',
        sourceType: 'POLICY',
      });

    expect(ingestRes.status).toBe(201);
    expect(ingestRes.body.data.chunkCount).toBeGreaterThanOrEqual(1);

    // Student queries AI assistant
    const queryRes = await request(app)
      .post('/api/ai/chat')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        query: 'What is the minimum mandatory attendance requirement for examinations?',
        mode: 'CAMPUS_QA',
      });

    expect(queryRes.status).toBe(200);
    expect(queryRes.body.data.answer).toBeDefined();
    expect(queryRes.body.data.citations.length).toBeGreaterThan(0);
    expect(queryRes.body.data.citations[0]).toContain('Academic Regulations & Attendance Policy 2026');
  });

  it('Admin: GET /api/admin/stats returns real database aggregations', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.overview.totalUsers).toBeGreaterThanOrEqual(3);
    expect(res.body.data.overview.totalDepartments).toBeGreaterThanOrEqual(1);
    expect(res.body.data.overview.totalClubs).toBeGreaterThanOrEqual(1);
    expect(res.body.data.overview.totalMessages).toBeGreaterThanOrEqual(1);
    expect(res.body.data.messageVolumeTrend.length).toBe(7);
  });
});
