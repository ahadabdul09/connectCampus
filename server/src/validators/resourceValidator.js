import { z } from 'zod';

export const createResourceSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.').max(200),
  description: z.string().max(1000).optional().nullable(),
  category: z.enum(['PLACEMENT', 'ACADEMICS', 'PROJECTS', 'NOTES', 'EVENTS', 'CLUBS']).default('ACADEMICS'),
  departmentId: z.string().uuid().optional().nullable(),
  clubId: z.string().uuid().optional().nullable(),
  tags: z.string().max(200).optional().nullable(),
});
