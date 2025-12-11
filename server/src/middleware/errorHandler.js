export function errorHandler(err, req, res, next) {
  console.error('Error:', err.message)
  console.error('Stack:', err.stack)

  // Default error
  let statusCode = 500
  let message = 'Internal Server Error'

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400
    message = err.message
  } else if (err.name === 'NotFoundError') {
    statusCode = 404
    message = err.message
  } else if (err.code === 'SQLITE_CONSTRAINT') {
    statusCode = 400
    message = 'Database constraint violation'
  } else if (err.message) {
    message = err.message
  }

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}

// Custom error classes
export class ValidationError extends Error {
  constructor(message) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends Error {
  constructor(message) {
    super(message)
    this.name = 'NotFoundError'
  }
}
