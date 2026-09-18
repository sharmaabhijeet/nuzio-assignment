export function validateCredentials(values, mode) {
  const email = String(values.email || '')
    .trim()
    .toLowerCase();
  const password = String(values.password || '');
  const name = String(values.name || '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254)
    throw new Error('Enter a valid email address.');
  if (password.length < 8 || password.length > 128)
    throw new Error('Use a password of 8–128 characters.');
  if (mode === 'register' && (!name || name.length > 80))
    throw new Error('Enter a name of 1–80 characters.');
  return { email, password, ...(mode === 'register' ? { name } : {}) };
}
