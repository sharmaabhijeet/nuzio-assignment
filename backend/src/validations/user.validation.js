import { topics } from '../constants/content.js';
import { ApiError } from '../utils/api-error.js';
import { requireObject } from './common.validation.js';

export function validateInterests(input) {
  const { interests } = requireObject(input);
  if (!Array.isArray(interests) || interests.length > topics.length || !interests.every(topic => topics.includes(topic))) {
    throw new ApiError(400, 'Choose valid topics.');
  }
  return { interests: [...new Set(interests)] };
}
