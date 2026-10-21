import { z } from 'zod';

export const aiQuerySchema = z.object({
  query: z.string().min(2, 'Query must be at least 2 characters.').max(1000),
  conversationId: z.string().uuid().optional().nullable(),
  mode: z.enum(['CAMPUS_QA', 'SUMMARIZE_CONVERSATION', 'EXTRACT_DEADLINES', 'TRANSLATE']).default('CAMPUS_QA'),
  targetLanguage: z.string().optional(),
});
