export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function notFound(req, res, next) {
  next(new ApiError(404, 'Endpoint not found.'));
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  if (error.code === 11000) {
    return res.status(409).json({ error: 'This record already exists. Please sign in if you have an account.' });
  }
  if (error.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON.' });
  if (error.name === 'ValidationError') return res.status(400).json({ error: 'Invalid data.' });
  if (!error.status) console.error(error);
  res.status(error.status || 500).json({
    error: error.status ? error.message : 'Something went wrong. Please try again.',
  });
}
