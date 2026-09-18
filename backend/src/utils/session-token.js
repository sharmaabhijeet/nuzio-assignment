import { createHash, randomBytes } from 'node:crypto';

export const generateSessionToken = () => randomBytes(32).toString('hex');
export const hashSessionToken = token => createHash('sha256').update(token).digest('hex');
export const isSessionToken = token => typeof token === 'string' && /^[a-f0-9]{64}$/.test(token);
