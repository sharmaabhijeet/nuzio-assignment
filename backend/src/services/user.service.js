import { updateUserInterests } from '../repositories/user.repository.js';
import { ApiError } from '../utils/api-error.js';

export async function updateInterests(userId, interests) {
  const user = await updateUserInterests(userId, interests);
  if (!user) throw new ApiError(401, 'Please sign in.');
  return user;
}
