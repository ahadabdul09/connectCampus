import { EventService } from '../services/eventService.js';
import { createEventSchema } from '../validators/eventValidator.js';
import { sendSuccess } from '../utils/response.js';

export class EventController {
  static async getEvents(req, res, next) {
    try {
      const departmentId = req.query.departmentId;
      const clubId = req.query.clubId;
      const events = await EventService.getEvents(req.user?.id, { departmentId, clubId });
      sendSuccess(res, events);
    } catch (error) {
      next(error);
    }
  }

  static async createEvent(req, res, next) {
    try {
      const validated = createEventSchema.parse(req.body);
      const event = await EventService.createEvent(req.user.id, validated);
      sendSuccess(res, event, 'Event created successfully.', 201);
    } catch (error) {
      next(error);
    }
  }

  static async registerForEvent(req, res, next) {
    try {
      const registration = await EventService.registerForEvent(req.params.id, req.user.id);
      sendSuccess(res, registration, 'Registration confirmed.');
    } catch (error) {
      next(error);
    }
  }

  static async cancelRegistration(req, res, next) {
    try {
      const result = await EventService.cancelRegistration(req.params.id, req.user.id);
      sendSuccess(res, result, 'Registration cancelled.');
    } catch (error) {
      next(error);
    }
  }
}
