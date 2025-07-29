const jwt = require('jsonwebtoken')
const User = require('../models/User')
const Role = require('../models/Role')
const AuditLog = require('../models/AuditLog')
const { promisify } = require('util')

// Middleware to authenticate JWT token
const authenticate = async (req, res, next) => {
  try {
    let token

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      })
    }

    try {
      // Verify token
      const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
      
      // Get user from database
      const user = await User.findById(decoded.id)
        .populate('roles')
        .select('-password')

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Token is invalid. User not found.'
        })
      }

      // Check if user is active
      if (user.status !== 'active') {
        await AuditLog.logSecurity(
          user._id,
          user.username,
          'ACCESS_DENIED',
          req,
          'HIGH',
          'Inactive user attempted to access system'
        )

        return res.status(401).json({
          success: false,
          message: 'Account is not active.'
        })
      }

      // Check if password was changed after token was issued
      if (user.changedPasswordAfter(decoded.iat)) {
        await AuditLog.logSecurity(
          user._id,
          user.username,
          'ACCESS_DENIED',
          req,
          'MEDIUM',
          'Token invalid due to password change'
        )

        return res.status(401).json({
          success: false,
          message: 'Password was changed. Please log in again.'
        })
      }

      // Set user to request object
      req.user = user
      next()

    } catch (jwtError) {
      await AuditLog.createLog({
        userId: null,
        username: 'UNKNOWN',
        userRole: 'UNKNOWN',
        action: 'ACCESS_DENIED',
        category: 'SECURITY',
        severity: 'MEDIUM',
        resource: 'auth',
        method: req.method,
        endpoint: req.originalUrl,
        description: 'Invalid JWT token used',
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent') || '',
        status: 'FAILURE',
        errorMessage: jwtError.message,
        timestamp: new Date()
      })

      return res.status(401).json({
        success: false,
        message: 'Token is invalid.'
      })
    }

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: error.message
    })
  }
}

// Middleware to make authentication optional
const optionalAuth = async (req, res, next) => {
  try {
    let token

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    }

    if (token) {
      try {
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
        const user = await User.findById(decoded.id)
          .populate('roles')
          .select('-password')

        if (user && user.status === 'active' && !user.changedPasswordAfter(decoded.iat)) {
          req.user = user
        }
      } catch (jwtError) {
        // Continue without user if token is invalid
      }
    }

    next()
  } catch (error) {
    next()
  }
}

// Middleware to check if user has required role
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Authentication required.'
      })
    }

    const userRoles = req.user.roles.map(role => role.name)
    const hasPermission = allowedRoles.some(role => userRoles.includes(role))

    if (!hasPermission) {
      AuditLog.logSecurity(
        req.user._id,
        req.user.username,
        'ACCESS_DENIED',
        req,
        'HIGH',
        `Insufficient role permissions. Required: ${allowedRoles.join(', ')}, Has: ${userRoles.join(', ')}`
      )

      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.',
        required: allowedRoles,
        current: userRoles
      })
    }

    next()
  }
}

// Middleware to check specific permissions
const hasPermission = (resource, action) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Authentication required.'
      })
    }

    try {
      // Check if user has super admin role (full access)
      const userRoles = req.user.roles.map(role => role.name)
      if (userRoles.includes('SUPER_ADMIN')) {
        return next()
      }

      // Check role-based permissions
      let hasAccess = false

      // Check permissions from roles
      for (const role of req.user.roles) {
        if (role.hasPermission(resource, action) || role.hasPermission('*', 'manage')) {
          hasAccess = true
          break
        }
      }

      // Check direct user permissions
      if (!hasAccess) {
        hasAccess = req.user.permissions.some(permission =>
          (permission.resource === resource || permission.resource === '*') &&
          (permission.actions.includes(action) || permission.actions.includes('manage'))
        )
      }

      if (!hasAccess) {
        await AuditLog.logSecurity(
          req.user._id,
          req.user.username,
          'ACCESS_DENIED',
          req,
          'HIGH',
          `Missing permission: ${action} on ${resource}`
        )

        return res.status(403).json({
          success: false,
          message: `Access denied. Missing permission: ${action} on ${resource}`
        })
      }

      next()

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Permission check error',
        error: error.message
      })
    }
  }
}

// Middleware to check if user can access their own resource or has admin access
const requireOwnershipOrAdmin = (userIdParam = 'id') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Authentication required.'
      })
    }

    const userRoles = req.user.roles.map(role => role.name)
    const isAdmin = userRoles.some(role => ['SUPER_ADMIN', 'ADMIN'].includes(role))
    const isOwner = req.user._id.toString() === req.params[userIdParam]

    if (!isOwner && !isAdmin) {
      AuditLog.logSecurity(
        req.user._id,
        req.user.username,
        'ACCESS_DENIED',
        req,
        'HIGH',
        'Attempted to access resource without ownership or admin rights'
      )

      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own resources.'
      })
    }

    next()
  }
}

// Middleware to enforce role hierarchy
const enforceRoleHierarchy = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Authentication required.'
    })
  }

  try {
    // Get target user if modifying another user
    let targetUser = null
    if (req.params.id && req.params.id !== req.user._id.toString()) {
      targetUser = await User.findById(req.params.id).populate('roles')
      if (!targetUser) {
        return res.status(404).json({
          success: false,
          message: 'Target user not found'
        })
      }
    }

    // Get current user's highest role level
    const userMaxLevel = Math.max(...req.user.roles.map(role => role.level))

    // If modifying another user, check role hierarchy
    if (targetUser) {
      const targetMaxLevel = Math.max(...targetUser.roles.map(role => role.level))
      
      if (userMaxLevel <= targetMaxLevel) {
        await AuditLog.logSecurity(
          req.user._id,
          req.user.username,
          'ACCESS_DENIED',
          req,
          'HIGH',
          `Attempted to modify user with equal or higher role level: ${targetMaxLevel} vs ${userMaxLevel}`
        )

        return res.status(403).json({
          success: false,
          message: 'Access denied. Cannot modify users with equal or higher role level.'
        })
      }
    }

    // If assigning roles, check if user can assign these roles
    if (req.body.roles) {
      const rolesToAssign = await Role.find({ _id: { $in: req.body.roles } })
      const maxRoleLevel = Math.max(...rolesToAssign.map(role => role.level))
      
      if (userMaxLevel <= maxRoleLevel) {
        await AuditLog.logSecurity(
          req.user._id,
          req.user.username,
          'ACCESS_DENIED',
          req,
          'HIGH',
          `Attempted to assign role with equal or higher level: ${maxRoleLevel} vs ${userMaxLevel}`
        )

        return res.status(403).json({
          success: false,
          message: 'Access denied. Cannot assign roles with equal or higher level than your own.'
        })
      }
    }

    next()

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Role hierarchy check error',
      error: error.message
    })
  }
}

// Middleware to validate API key for service-to-service communication
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key']
  
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: 'API key required'
    })
  }

  // Validate API key (in production, store hashed keys in database)
  const validApiKeys = process.env.API_KEYS ? process.env.API_KEYS.split(',') : []
  
  if (!validApiKeys.includes(apiKey)) {
    return res.status(401).json({
      success: false,
      message: 'Invalid API key'
    })
  }

  next()
}

// Middleware to check account status
const checkAccountStatus = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Authentication required.'
    })
  }

  if (req.user.status === 'suspended') {
    AuditLog.logSecurity(
      req.user._id,
      req.user.username,
      'ACCESS_DENIED',
      req,
      'HIGH',
      'Suspended user attempted to access system'
    )

    return res.status(403).json({
      success: false,
      message: 'Account is suspended. Contact administrator.'
    })
  }

  if (req.user.status === 'inactive') {
    return res.status(403).json({
      success: false,
      message: 'Account is inactive. Contact administrator.'
    })
  }

  if (req.user.isLocked) {
    return res.status(423).json({
      success: false,
      message: 'Account is temporarily locked due to multiple failed login attempts.'
    })
  }

  next()
}

module.exports = {
  authenticate,
  optionalAuth,
  authorize,
  hasPermission,
  requireOwnershipOrAdmin,
  enforceRoleHierarchy,
  validateApiKey,
  checkAccountStatus
}
