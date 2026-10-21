import { AuthService } from '../services/authService.js';
import { registerSchema, loginSchema, refreshSchema } from '../validators/authValidator.js';
import { sendSuccess } from '../utils/response.js';

export class AuthController {
  static async register(req, res, next) {
    try {
      const validated = registerSchema.parse(req.body);
      const result = await AuthService.register(validated);
      sendSuccess(res, result, 'Registration successful.', 201);
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const result = await AuthService.login(email, password);
      sendSuccess(res, result, 'Signed in successfully.');
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req, res, next) {
    try {
      const { refreshToken } = refreshSchema.parse(req.body);
      const result = await AuthService.refresh(refreshToken);
      sendSuccess(res, result, 'Token refreshed successfully.');
    } catch (error) {
      next(error);
    }
  }

  static async logout(req, res, next) {
    try {
      const userId = req.user.id;
      const { refreshToken } = req.body;
      await AuthService.logout(userId, refreshToken);
      sendSuccess(res, null, 'Signed out successfully.');
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req, res, next) {
    try {
      const user = await AuthService.getMe(req.user.id);
      sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  }
}
