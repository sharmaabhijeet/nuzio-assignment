import mongoose from 'mongoose';
import { getConfig } from './env.js';

export function connectDatabase(uri = getConfig().mongoUri) {
  return mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
}

export function disconnectDatabase() {
  return mongoose.disconnect();
}

export function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}
