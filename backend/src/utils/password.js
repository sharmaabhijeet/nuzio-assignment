import { randomBytes, scrypt as derive, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(derive);

export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const digest = await scrypt(password, salt, 64);
  return `${salt}:${digest.toString('hex')}`;
}

export async function verifyPassword(password, storedPassword) {
  // Also derive a hash when the account does not exist.
  const [salt, expected] = storedPassword
    ? storedPassword.split(':')
    : ['invalid-account', '00'.repeat(64)];
  const actual = await scrypt(password, salt, 64);
  return timingSafeEqual(Buffer.from(expected, 'hex'), actual) && Boolean(storedPassword);
}
