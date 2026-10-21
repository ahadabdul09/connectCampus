import { SearchService } from '../services/searchService.js';
import { sendSuccess } from '../utils/response.js';

export class SearchController {
  static async search(req, res, next) {
    try {
      const q = req.query.q || '';
      const results = await SearchService.globalSearch(q, req.user.id);
      sendSuccess(res, results);
    } catch (error) {
      next(error);
    }
  }
}
