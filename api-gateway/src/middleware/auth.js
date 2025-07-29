const jwt = require('jsonwebtoken')
const config = require('../config')
const logger = require('../utils/logger')

/**
 * JWT Authentication middleware
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token is required',
      timestamp: new Date().toISOString()
    })
  }

  jwt.verify(token, config.auth.jwtSecret, (err, user) => {
    if (err) {
      logger.warn('Invalid token attempt', {
        error: err.message,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      })
      
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token',
        timestamp: new Date().toISOString()
      })
    }

    req.user = user
    next()
  })
}

/**
 * Optional authentication middleware - allows both authenticated and unauthenticated requests
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return next()
  }

  jwt.verify(token, config.auth.jwtSecret, (err, user) => {
    if (!err) {
      req.user = user
    }
    next()
  })
}

/**
 * Role-based authorization middleware
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        timestamp: new Date().toISOString()
      })
    }

    if (!roles.includes(req.user.role)) {
      logger.warn('Unauthorized access attempt', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: roles,
        endpoint: req.originalUrl,
        method: req.method,
        ip: req.ip
      })

      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        timestamp: new Date().toISOString()
      })
    }

    next()
  }
}

/**
 * API Key authentication middleware (for service-to-service communication)
 */
const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key']

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: 'API key is required',
      timestamp: new Date().toISOString()
    })
  }

  // In production, validate against a secure store
  const validApiKeys = process.env.VALID_API_KEYS?.split(',') || []
  
  if (!validApiKeys.includes(apiKey)) {
    logger.warn('Invalid API key attempt', {
      apiKey: apiKey.substring(0, 8) + '...',
      ip: req.ip,
      userAgent: req.get('User-Agent')
    })

    return res.status(403).json({
      success: false,
      message: 'Invalid API key',
      timestamp: new Date().toISOString()
    })
  }

  req.apiAuth = true
  next()
}

module.exports = {
  authenticateToken,
  optionalAuth,
  authorize,
  authenticateApiKey
}
