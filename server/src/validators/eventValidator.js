import { z } from 'zod';

export const createEventSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.').max(200),
  description: z.string().min(10, 'Event description must be at least 10 characters.'),
  location: z.string().min(2, 'Location is required.').max(150),
  eventDate: z.string().datetime('Please provide a valid ISO event date.'),
  registrationDeadline: z.string().datetime().optional().nullable(),
  maxCapacity: z.number().int().positive().default(100),
  departmentId: z.string().uuid().optional().nullable(),
  clubId: z.string().uuid().optional().nullable(),
  bannerUrl: z.string().optional().nullable(),
});
