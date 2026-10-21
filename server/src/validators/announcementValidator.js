import { z } from 'zod';

export const createAnnouncementSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.').max(200),
  content: z.string().min(10, 'Announcement body must be at least 10 characters.'),
  priority: z.enum(['NORMAL', 'IMPORTANT', 'URGENT']).default('NORMAL'),
  departmentId: z.string().uuid().optional().nullable(),
  attachmentUrl: z.string().optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable(),
});
