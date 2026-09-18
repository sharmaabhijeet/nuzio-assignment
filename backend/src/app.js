import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import { getConfig } from './config/env.js';
import { requireAuth } from './middleware/auth.middleware.js';
import { apiSecurity } from './middleware/security.middleware.js';
import { errorHandler, notFound } from './middleware/error.middleware.js';

import { createSystemRoutes } from './routes/system.routes.js';
import { createAuthRoutes } from './routes/auth.routes.js';
import { createUserRoutes, createLegacyUserRoutes } from './routes/user.routes.js';
import { createArticleRoutes } from './routes/article.routes.js';
import { createBookmarkRoutes } from './routes/bookmark.routes.js';

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

  // Public endpoints; auth.routes protects its own me/logout endpoints.
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
