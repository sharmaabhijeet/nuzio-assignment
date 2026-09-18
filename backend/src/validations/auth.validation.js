import { ApiError } from '../utils/api-error.js';
import { requireObject } from './common.validation.js';

export function validateLogin(input) {
  const body = requireObject(input);
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = body.password;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254
    || typeof password !== 'string' || password.length < 8 || password.length > 128) {
    throw new ApiError(400, 'Enter a valid email and a password of 8–128 characters.');
  }
  return { email, password };
}

export function validateRegistration(input) {
  const credentials = validateLogin(input);
  const name = typeof input.name === 'string' ? input.name.trim() : '';
  if (!name || name.length > 80) throw new ApiError(400, 'Enter a name of 1–80 characters.');
  return { ...credentials, name };
}
