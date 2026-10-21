import { z } from 'zod';

export const createConversationSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  type: z.enum(['DIRECT', 'GROUP', 'CHANNEL']).default('GROUP'),
  departmentId: z.string().uuid().optional().nullable(),
  clubId: z.string().uuid().optional().nullable(),
  participantIds: z.array(z.string().uuid()).min(1, 'At least one participant is required.'),
});

export const sendMessageSchema = z.object({
  content: z.string().min(1, 'Message content cannot be empty.').max(5000),
  type: z.enum(['TEXT', 'FILE', 'SYSTEM']).default('TEXT'),
  replyToId: z.string().uuid().optional().nullable(),
  attachment: z
    .object({
      fileName: z.string(),
      fileUrl: z.string(),
      fileType: z.string(),
      fileSize: z.number().int().positive(),
    })
    .optional(),
});

export const editMessageSchema = z.object({
  content: z.string().min(1, 'Updated message cannot be empty.').max(5000),
});

export const reactionSchema = z.object({
  emoji: z.string().min(1).max(10),
});
