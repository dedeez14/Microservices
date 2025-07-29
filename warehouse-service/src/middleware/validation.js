const Joi = require('joi')
const ApiResponse = require('../utils/response')
const { commonSchemas } = require('../utils/schemas')

/**
 * Validation middleware factory
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const options = {
      abortEarly: false,
      allowUnknown: property === 'query', // Allow unknown for query params
      stripUnknown: true
    }
    
    const { error, value } = schema.validate(req[property], options)

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/"/g, '')
      }))
      
      return ApiResponse.validationError(res, errors)
    }

    // Replace request property with validated value
    req[property] = value
    next()
  }
}

module.exports = {
  validate,
  commonSchemas
}
