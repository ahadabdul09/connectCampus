import { z } from 'zod';

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters long.').max(100),
  email: z.string().email('Please enter a valid academic email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters long.'),
  departmentId: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val && val.trim() !== '' ? val.trim() : null)),
  batch: z.string().max(50).optional().nullable(),
  studentId: z.string().max(30).optional().nullable(),
  role: z.enum(['STUDENT', 'FACULTY', 'CLUB_COORDINATOR', 'DEPT_ADMIN', 'SUPER_ADMIN']).default('STUDENT'),
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid academic email address.'),
  password: z.string().min(1, 'Password is required.'),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required.'),
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  bio: z.string().max(500).optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
  batch: z.string().max(50).optional().nullable(),
  studentId: z.string().max(30).optional().nullable(),
});
