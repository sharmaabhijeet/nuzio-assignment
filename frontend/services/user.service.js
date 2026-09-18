import { api } from '../lib/api';
export const saveInterests = (interests) =>
  api('/users/interests', { method: 'PUT', body: JSON.stringify({ interests }) });
