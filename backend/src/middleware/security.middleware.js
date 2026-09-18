import { ApiError } from '../utils/api-error.js';

export function apiSecurity(frontendOrigin) {
  return (req, res, next) => {
    res.set('Cache-Control', 'no-store');
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      if (req.get('sec-fetch-site') === 'cross-site'
        || (req.get('origin') && req.get('origin') !== frontendOrigin)) {
        throw new ApiError(403, 'Origin rejected.');
      }
      if (['POST', 'PUT', 'PATCH'].includes(req.method) && !req.is('application/json')) {
        throw new ApiError(415, 'Use application/json.');
      }
    }
    next();
  };
}
