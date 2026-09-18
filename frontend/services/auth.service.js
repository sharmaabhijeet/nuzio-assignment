import { api } from '../lib/api';
export const getCurrentUser = (options) => api('/users/me', options);
export const login = (credentials) =>
  api('/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
export const register = (credentials) =>
  api('/auth/register', { method: 'POST', body: JSON.stringify(credentials) });
export const logout = () => api('/auth/logout', { method: 'POST', body: '{}' });
