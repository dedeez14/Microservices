/**
 * Standard API response utility
 */
class ApiResponse {
  static success(res, data = null, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    })
  }

  static error(res, message = 'Internal Server Error', statusCode = 500, errors = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString()
    })
  }

  static created(res, data = null, message = 'Resource created successfully') {
    return this.success(res, data, message, 201)
  }

  static badRequest(res, message = 'Bad Request', errors = null) {
    return this.error(res, message, 400, errors)
  }

  static unauthorized(res, message = 'Unauthorized') {
    return this.error(res, message, 401)
  }

  static forbidden(res, message = 'Forbidden') {
    return this.error(res, message, 403)
  }

  static notFound(res, message = 'Resource not found') {
    return this.error(res, message, 404)
  }

  static conflict(res, message = 'Conflict') {
    return this.error(res, message, 409)
  }

  static validationError(res, errors) {
    return this.error(res, 'Validation Error', 422, errors)
  }

  static paginated(res, data, pagination, message = 'Success') {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination,
      timestamp: new Date().toISOString()
    })
  }
}

module.exports = ApiResponse
