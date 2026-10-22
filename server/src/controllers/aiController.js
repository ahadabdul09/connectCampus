import { AIService } from '../services/aiService.js';
import { aiQuerySchema } from '../validators/aiValidator.js';
import { sendSuccess } from '../utils/response.js';

export class AIController {
  static async query(req, res, next) {
    try {
      const validated = aiQuerySchema.parse(req.body);
      const result = await AIService.handleQuery(req.user.id, validated);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async summarize(req, res, next) {
    try {
      const { conversationId } = req.body;
      if (!conversationId) {
        throw new Error('conversationId is required for conversation summarization.');
      }
      const result = await AIService.handleQuery(req.user.id, {
        query: 'Summarize recent conversation highlights',
        conversationId,
        mode: 'SUMMARIZE_CONVERSATION',
      });
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async getDeadlines(req, res, next) {
    try {
      const conversationId = req.query.conversationId;
      const result = await AIService.handleQuery(req.user.id, {
        query: 'Extract deadlines and key milestones',
        conversationId,
        mode: 'EXTRACT_DEADLINES',
      });
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async uploadDocument(req, res, next) {
    try {
      const { title, category, departmentId, content } = req.body;
      const result = await AIService.ingestDocument({
        title,
        category,
        departmentId,
        uploaderId: req.user.id,
        content,
      });
      sendSuccess(res, result, 'Campus document ingested and chunked for AI retrieval.', 201);
    } catch (error) {
      next(error);
    }
  }
}
