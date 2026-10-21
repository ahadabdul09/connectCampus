import { ResourceService } from '../services/resourceService.js';
import { createResourceSchema } from '../validators/resourceValidator.js';
import { sendSuccess } from '../utils/response.js';

export class ResourceController {
  static async getResources(req, res, next) {
    try {
      const category = req.query.category;
      const departmentId = req.query.departmentId;
      const clubId = req.query.clubId;
      const search = req.query.search;
      const sortBy = req.query.sortBy;

      const resources = await ResourceService.getResources({
        category,
        departmentId,
        clubId,
        search,
        sortBy,
      });

      sendSuccess(res, resources);
    } catch (error) {
      next(error);
    }
  }

  static async uploadResource(req, res, next) {
    try {
      if (!req.file) {
        throw new Error('Please select a file to upload.');
      }

      const validated = createResourceSchema.parse(req.body);
      const fileUrl = `/uploads/${req.file.filename}`;
      const ext = req.file.originalname.split('.').pop()?.toUpperCase() || 'FILE';

      const resource = await ResourceService.createResource(req.user.id, {
        ...validated,
        fileUrl,
        fileType: ext,
        fileSize: req.file.size,
      });

      sendSuccess(res, resource, 'Resource uploaded successfully.', 201);
    } catch (error) {
      next(error);
    }
  }

  static async recordDownload(req, res, next) {
    try {
      const updated = await ResourceService.incrementDownload(req.params.id);
      sendSuccess(res, updated);
    } catch (error) {
      next(error);
    }
  }
}
