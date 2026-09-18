import { User } from '../models/user.model.js';

export function createUser({ name, email, password }) {
  return User.create({ name, email, password });
}

export function findUserCredentials(email) {
  return User.findOne({ email }).select('+password');
}

export function updateUserInterests(userId, interests) {
  return User.findByIdAndUpdate(userId, { $set: { interests } }, { returnDocument: 'after', runValidators: true });
}
