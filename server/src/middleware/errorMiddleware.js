import { ApiError } from '../utils/ApiError.js';

export const errorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || (error.code === 'P1001' ? 503 : 500);
    const message = error.message || 'Something went wrong on the server.';
    error = new ApiError(statusCode, message, error?.errors || [], err.stack);
  }

  const response = {
    success: false,
    error: {
      code: error.statusCode >= 500 ? 'SERVER_ERROR' : 'CLIENT_ERROR',
      message: error.message,
      ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {})
    }
  };

  return res.status(error.statusCode).json(response);
};
