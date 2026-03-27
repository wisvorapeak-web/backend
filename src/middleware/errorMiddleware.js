import ErrorResponse from '../utils/errorResponse.js';

const errorHandler = (err, req, res, next) => {
  let error = { ...err };

  error.message = err.message;

  // Log to console for dev
  console.error(`ERROR 💥: ${err.message}`);

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new ErrorResponse(message, 404);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new ErrorResponse(message, 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Not authorized to access this route';
    error = new ErrorResponse(message, 401);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Session expired. Please log in again.';
    error = new ErrorResponse(message, 401);
  }

  // ValidationError handling
  if (err.name === 'ValidationError') {
    error = new ErrorResponse(err.message, 400);
  }

  // Handle Cloudinary / File errors
  if (err.message && err.message.includes('File')) {
    error = new ErrorResponse(err.message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export default errorHandler;
