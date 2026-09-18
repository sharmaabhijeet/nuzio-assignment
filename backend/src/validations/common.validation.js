import mongoose from 'mongoose';
import { ApiError } from '../utils/api-error.js';

export function requireObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new ApiError(400, 'Expected a JSON object.');
  }
  return value;
}

export function validateArticleId(params) {
  if (!mongoose.isObjectIdOrHexString(params.id)) throw new ApiError(404, 'Article not found.');
  return { id: params.id };
}
