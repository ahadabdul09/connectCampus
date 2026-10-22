import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function bootstrap() {
  try {
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' },
    });

    if (existingAdmin) {
      console.log(`[Bootstrap] Super Administrator already exists: ${existingAdmin.email} (${existingAdmin.id})`);
      return;
    }

    const email = (process.env.ADMIN_EMAIL || 'admin@campus.edu').toLowerCase().trim();
    const fullName = process.env.ADMIN_NAME || 'Campus Administrator';
    const password = process.env.ADMIN_PASSWORD || `Campus@${crypto.randomBytes(4).toString('hex')}!`;

    const passwordHash = await bcrypt.hash(password, 10);

    const admin = await prisma.user.create({
      data: {
        email,
        fullName,
        passwordHash,
        role: 'SUPER_ADMIN',
        isActive: true,
      },
    });

    console.log('====================================================');
    console.log('[Bootstrap] Initial Super Administrator account created successfully:');
    console.log(`  Name:     ${admin.fullName}`);
    console.log(`  Email:    ${admin.email}`);
    console.log(`  Role:     ${admin.role}`);
    console.log(`  Password: ${password}`);
    console.log('  IMPORTANT: Please store these credentials safely.');
    console.log('====================================================');
  } catch (err) {
    console.error('[Bootstrap Error]', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

bootstrap();
