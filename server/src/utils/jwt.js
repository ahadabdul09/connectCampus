import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';

export function signAccessToken(payload) {
  return jwt.sign(payload, ENV.JWT_SECRET, {
    expiresIn: '15m',
  });
}

export function signRefreshToken(payload) {
  return jwt.sign(payload, ENV.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });
}

export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, ENV.JWT_SECRET);
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, ENV.JWT_REFRESH_SECRET);
  } catch {
    return null;
  }
}
