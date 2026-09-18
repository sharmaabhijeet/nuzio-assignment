import mongoose from 'mongoose';

export function getConfig() {
  return {
    port: Number(process.env.PORT || 3001),
    mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nuzio',
    frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
    production: process.env.NODE_ENV === 'production',
  };
}

export function connectDatabase(uri = getConfig().mongoUri) {
  return mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
}

export function disconnectDatabase() {
  return mongoose.disconnect();
}

export function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}

export const SESSION_COOKIE_NAME = 'nuzio_session';
export const SESSION_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;

export function sessionCookieOptions(production) {
  return { httpOnly: true, sameSite: 'strict', secure: production, path: '/' };
}
