import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import { getConfig } from './config.js';
import { ApiError, notFound, errorHandler } from './errors.js';

import { createSystemRoutes } from './routes/system.routes.js';
import { createAuthRoutes, requireAuth } from './routes/auth.routes.js';
import { createUserRoutes, createLegacyUserRoutes } from './routes/users.routes.js';
import { createArticleRoutes } from './routes/news.routes.js';
import { createBookmarkRoutes } from './routes/bookmarks.routes.js';

function apiSecurity(frontendOrigin) {
  return (req, res, next) => {
    res.set('Cache-Control', 'no-store');
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      if (
        req.get('sec-fetch-site') === 'cross-site' ||
        (req.get('origin') && req.get('origin') !== frontendOrigin)
      ) {
        throw new ApiError(403, 'Origin rejected.');
      }
      if (['POST', 'PUT', 'PATCH'].includes(req.method) && !req.is('application/json')) {
        throw new ApiError(415, 'Use application/json.');
      }
    }
    next();
  };
}

export function createApp() {
  const app = express();
  const config = getConfig();
  app.locals.config = config;

  // Application middleware.
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(express.json({ limit: '16kb' }));
  app.use(cookieParser());
  app.use('/api', apiSecurity(config.frontendOrigin));

  // Public endpoints; auth routes protect their own me/logout endpoints.
  app.use('/api', createSystemRoutes());
  app.use('/api/auth', createAuthRoutes());

  // Each resource has an explicit route prefix and authentication boundary.
  app.use('/api/users', requireAuth, createUserRoutes());
  app.use('/api/news', requireAuth, createArticleRoutes());
  app.use('/api/bookmarks', requireAuth, createBookmarkRoutes());

  // Keep PUT /api/interests compatible with existing frontend clients.
  app.use('/api', createLegacyUserRoutes());

  // These handlers must remain after all application routes.
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
