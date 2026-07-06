function notFound(req, res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.status = 404;
  next(error);
}

function errorHandler(error, req, res, next) { // eslint-disable-line no-unused-vars
  let status = error.status || 500;
  let message = error.message || 'Internal server error.';

  if (error.name === 'CastError') {
    status = 400;
    message = 'Invalid resource identifier.';
  } else if (error.name === 'ValidationError') {
    status = 400;
    message = Object.values(error.errors).map((item) => item.message).join(' ');
  } else if (error.code === 11000) {
    status = 409;
    message = 'A record with that unique value already exists.';
  }

  if (status >= 500) console.error(error);
  if (status >= 500 && process.env.NODE_ENV === 'production') message = 'Internal server error.';
  if (req.originalUrl.startsWith('/api/')) return res.status(status).json({ error: message });
  return res.status(status).render('error', { title: 'Error', status, message });
}

module.exports = { notFound, errorHandler };
