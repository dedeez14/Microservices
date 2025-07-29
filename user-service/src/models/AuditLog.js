const mongoose = require('mongoose')

const auditLogSchema = new mongoose.Schema({
  // User Information
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  userRole: {
    type: String,
    required: true
  },

  // Action Information
  action: {
    type: String,
    required: true,
    enum: [
      // Authentication Actions
      'LOGIN',
      'LOGOUT',
      'LOGIN_FAILED',
      'PASSWORD_CHANGE',
      'PASSWORD_RESET',
      'EMAIL_VERIFICATION',
      'TWO_FACTOR_ENABLED',
      'TWO_FACTOR_DISABLED',
      'ACCOUNT_LOCKED',
      'ACCOUNT_UNLOCKED',

      // User Management Actions
      'USER_CREATED',
      'USER_UPDATED',
      'USER_DELETED',
      'USER_ACTIVATED',
      'USER_DEACTIVATED',
      'USER_SUSPENDED',
      'ROLE_ASSIGNED',
      'ROLE_REMOVED',
      'PERMISSION_GRANTED',
      'PERMISSION_REVOKED',

      // Role Management Actions
      'ROLE_CREATED',
      'ROLE_UPDATED',
      'ROLE_DELETED',

      // System Actions
      'SYSTEM_CONFIG_CHANGED',
      'DATA_EXPORT',
      'DATA_IMPORT',
      'BACKUP_CREATED',
      'BACKUP_RESTORED',

      // Business Actions
      'WAREHOUSE_CREATED',
      'WAREHOUSE_UPDATED',
      'WAREHOUSE_DELETED',
      'INVENTORY_CREATED',
      'INVENTORY_UPDATED',
      'INVENTORY_DELETED',
      'TRANSACTION_CREATED',
      'TRANSACTION_UPDATED',
      'TRANSACTION_CANCELLED',

      // Security Actions
      'SECURITY_ALERT',
      'SUSPICIOUS_ACTIVITY',
      'ACCESS_DENIED',
      'PRIVILEGE_ESCALATION'
    ]
  },
  category: {
    type: String,
    required: true,
    enum: ['AUTHENTICATION', 'USER_MANAGEMENT', 'ROLE_MANAGEMENT', 'SYSTEM', 'BUSINESS', 'SECURITY']
  },
  severity: {
    type: String,
    required: true,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'LOW'
  },

  // Target Information
  targetType: {
    type: String,
    enum: ['USER', 'ROLE', 'WAREHOUSE', 'INVENTORY', 'TRANSACTION', 'SYSTEM']
  },
  targetId: {
    type: mongoose.Schema.Types.Mixed
  },
  targetName: {
    type: String
  },

  // Request Information
  resource: {
    type: String,
    required: true
  },
  method: {
    type: String,
    required: true,
    enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
  },
  endpoint: {
    type: String,
    required: true
  },

  // Change Information
  changes: {
    before: {
      type: mongoose.Schema.Types.Mixed
    },
    after: {
      type: mongoose.Schema.Types.Mixed
    },
    modified: [{
      field: String,
      oldValue: mongoose.Schema.Types.Mixed,
      newValue: mongoose.Schema.Types.Mixed
    }]
  },

  // Context Information
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  // Technical Information
  sessionId: String,
  requestId: String,
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  deviceInfo: {
    deviceType: String,
    browser: String,
    os: String,
    location: {
      country: String,
      city: String,
      timezone: String
    }
  },

  // Status and Result
  status: {
    type: String,
    required: true,
    enum: ['SUCCESS', 'FAILURE', 'ERROR'],
    default: 'SUCCESS'
  },
  errorMessage: String,
  errorCode: String,

  // Timing Information
  duration: {
    type: Number, // in milliseconds
    min: 0
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  }
}, {
  timestamps: false, // We're using custom timestamp field
  collection: 'audit_logs'
})

// Indexes for efficient querying
auditLogSchema.index({ userId: 1, timestamp: -1 })
auditLogSchema.index({ action: 1, timestamp: -1 })
auditLogSchema.index({ category: 1, timestamp: -1 })
auditLogSchema.index({ severity: 1, timestamp: -1 })
auditLogSchema.index({ targetType: 1, targetId: 1 })
auditLogSchema.index({ ipAddress: 1, timestamp: -1 })
auditLogSchema.index({ timestamp: -1 })
auditLogSchema.index({ status: 1, timestamp: -1 })

// TTL index for automatic cleanup (365 days)
auditLogSchema.index(
  { timestamp: 1 }, 
  { 
    expireAfterSeconds: parseInt(process.env.AUDIT_LOG_RETENTION_DAYS || 365) * 24 * 60 * 60 
  }
)

// Static method to create audit log
auditLogSchema.statics.createLog = async function(logData) {
  try {
    const log = new this(logData)
    await log.save()
    return log
  } catch (error) {
    console.error('Failed to create audit log:', error)
    // Don't throw error to prevent breaking the main operation
  }
}

// Static method to log authentication events
auditLogSchema.statics.logAuth = async function(userId, username, action, req, status = 'SUCCESS', errorMessage = null) {
  const logData = {
    userId,
    username,
    userRole: req.user?.roles?.[0]?.name || 'UNKNOWN',
    action,
    category: 'AUTHENTICATION',
    severity: action.includes('FAILED') || action.includes('LOCKED') ? 'HIGH' : 'LOW',
    resource: 'auth',
    method: req.method,
    endpoint: req.originalUrl,
    description: this.getActionDescription(action, username),
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent') || '',
    sessionId: req.sessionID,
    requestId: req.requestId,
    status,
    errorMessage,
    timestamp: new Date()
  }

  return this.createLog(logData)
}

// Static method to log user management events
auditLogSchema.statics.logUserManagement = async function(actor, targetUser, action, req, changes = null) {
  const logData = {
    userId: actor._id,
    username: actor.username,
    userRole: actor.roles?.[0]?.name || 'UNKNOWN',
    action,
    category: 'USER_MANAGEMENT',
    severity: action.includes('DELETE') || action.includes('SUSPEND') ? 'HIGH' : 'MEDIUM',
    targetType: 'USER',
    targetId: targetUser._id,
    targetName: targetUser.username,
    resource: 'users',
    method: req.method,
    endpoint: req.originalUrl,
    description: this.getActionDescription(action, targetUser.username, actor.username),
    changes,
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent') || '',
    sessionId: req.sessionID,
    requestId: req.requestId,
    status: 'SUCCESS',
    timestamp: new Date()
  }

  return this.createLog(logData)
}

// Static method to log role management events
auditLogSchema.statics.logRoleManagement = async function(actor, targetRole, action, req, changes = null) {
  const logData = {
    userId: actor._id,
    username: actor.username,
    userRole: actor.roles?.[0]?.name || 'UNKNOWN',
    action,
    category: 'ROLE_MANAGEMENT',
    severity: action.includes('DELETE') ? 'HIGH' : 'MEDIUM',
    targetType: 'ROLE',
    targetId: targetRole._id,
    targetName: targetRole.name,
    resource: 'roles',
    method: req.method,
    endpoint: req.originalUrl,
    description: this.getActionDescription(action, targetRole.name, actor.username),
    changes,
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent') || '',
    sessionId: req.sessionID,
    requestId: req.requestId,
    status: 'SUCCESS',
    timestamp: new Date()
  }

  return this.createLog(logData)
}

// Static method to log business events
auditLogSchema.statics.logBusiness = async function(actor, targetType, targetId, targetName, action, req, changes = null) {
  const logData = {
    userId: actor._id,
    username: actor.username,
    userRole: actor.roles?.[0]?.name || 'UNKNOWN',
    action,
    category: 'BUSINESS',
    severity: action.includes('DELETE') ? 'MEDIUM' : 'LOW',
    targetType,
    targetId,
    targetName,
    resource: targetType.toLowerCase(),
    method: req.method,
    endpoint: req.originalUrl,
    description: this.getActionDescription(action, targetName, actor.username),
    changes,
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent') || '',
    sessionId: req.sessionID,
    requestId: req.requestId,
    status: 'SUCCESS',
    timestamp: new Date()
  }

  return this.createLog(logData)
}

// Static method to log security events
auditLogSchema.statics.logSecurity = async function(userId, username, action, req, severity = 'HIGH', description = '') {
  const logData = {
    userId,
    username,
    userRole: req.user?.roles?.[0]?.name || 'UNKNOWN',
    action,
    category: 'SECURITY',
    severity,
    resource: 'security',
    method: req.method,
    endpoint: req.originalUrl,
    description: description || this.getActionDescription(action, username),
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent') || '',
    sessionId: req.sessionID,
    requestId: req.requestId,
    status: 'SUCCESS',
    timestamp: new Date()
  }

  return this.createLog(logData)
}

// Static helper method to generate action descriptions
auditLogSchema.statics.getActionDescription = function(action, target = '', actor = '') {
  const descriptions = {
    'LOGIN': `User ${target} logged in successfully`,
    'LOGOUT': `User ${target} logged out`,
    'LOGIN_FAILED': `Failed login attempt for user ${target}`,
    'PASSWORD_CHANGE': `Password changed for user ${target}`,
    'PASSWORD_RESET': `Password reset requested for user ${target}`,
    'EMAIL_VERIFICATION': `Email verified for user ${target}`,
    'TWO_FACTOR_ENABLED': `Two-factor authentication enabled for user ${target}`,
    'TWO_FACTOR_DISABLED': `Two-factor authentication disabled for user ${target}`,
    'ACCOUNT_LOCKED': `Account locked for user ${target}`,
    'ACCOUNT_UNLOCKED': `Account unlocked for user ${target}`,
    'USER_CREATED': `User ${target} created by ${actor}`,
    'USER_UPDATED': `User ${target} updated by ${actor}`,
    'USER_DELETED': `User ${target} deleted by ${actor}`,
    'USER_ACTIVATED': `User ${target} activated by ${actor}`,
    'USER_DEACTIVATED': `User ${target} deactivated by ${actor}`,
    'USER_SUSPENDED': `User ${target} suspended by ${actor}`,
    'ROLE_ASSIGNED': `Role assigned to user ${target} by ${actor}`,
    'ROLE_REMOVED': `Role removed from user ${target} by ${actor}`,
    'ROLE_CREATED': `Role ${target} created by ${actor}`,
    'ROLE_UPDATED': `Role ${target} updated by ${actor}`,
    'ROLE_DELETED': `Role ${target} deleted by ${actor}`,
    'ACCESS_DENIED': `Access denied for user ${target}`,
    'SUSPICIOUS_ACTIVITY': `Suspicious activity detected for user ${target}`,
    'WAREHOUSE_CREATED': `Warehouse ${target} created by ${actor}`,
    'WAREHOUSE_UPDATED': `Warehouse ${target} updated by ${actor}`,
    'WAREHOUSE_DELETED': `Warehouse ${target} deleted by ${actor}`,
    'INVENTORY_CREATED': `Inventory item ${target} created by ${actor}`,
    'INVENTORY_UPDATED': `Inventory item ${target} updated by ${actor}`,
    'INVENTORY_DELETED': `Inventory item ${target} deleted by ${actor}`,
    'TRANSACTION_CREATED': `Transaction ${target} created by ${actor}`,
    'TRANSACTION_UPDATED': `Transaction ${target} updated by ${actor}`,
    'TRANSACTION_CANCELLED': `Transaction ${target} cancelled by ${actor}`
  }

  return descriptions[action] || `${action} performed by ${actor} on ${target}`
}

module.exports = mongoose.model('AuditLog', auditLogSchema)
