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
  role: z.string().optional().default('STUDENT').transform(() => 'STUDENT'),
});

export const inviteUserSchema = z.object({
  email: z.string().email('Please enter a valid academic email address to invite.'),
  role: z.enum(['STUDENT', 'FACULTY', 'CLUB_COORDINATOR', 'DEPT_ADMIN', 'SUPER_ADMIN']),
  departmentId: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val && val.trim() !== '' ? val.trim() : null)),
});

export const acceptInviteSchema = z.object({
  token: z.string().min(10, 'A valid invitation token is required.'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters long.').max(100),
  password: z.string().min(6, 'Password must be at least 6 characters long.'),
  studentId: z.string().max(30).optional().nullable(),
  batch: z.string().max(50).optional().nullable(),
});

export const updateUserAdminSchema = z.object({
  role: z.enum(['STUDENT', 'FACULTY', 'CLUB_COORDINATOR', 'DEPT_ADMIN', 'SUPER_ADMIN']).optional(),
  departmentId: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val && val.trim() !== '' ? val.trim() : null)),
  isActive: z.boolean().optional(),
});

export const departmentSchema = z.object({
  name: z.string().min(2, 'Department name must be at least 2 characters.').max(100),
  code: z.string().min(2, 'Department code must be at least 2 characters.').max(20),
  description: z.string().max(500).optional().nullable(),
  headOfDepartment: z.string().max(100).optional().nullable(),
});

export const clubSchema = z.object({
  name: z.string().min(2, 'Club name must be at least 2 characters.').max(100),
  code: z.string().min(2, 'Club code must be at least 2 characters.').max(20),
  description: z.string().min(5, 'Club description must be at least 5 characters.').max(1000),
  category: z.enum(['TECHNICAL', 'CULTURAL', 'SPORTS', 'SOCIAL', 'ACADEMIC']).default('TECHNICAL'),
  leadId: z.string().optional().nullable(),
  bannerUrl: z.string().optional().nullable(),
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
