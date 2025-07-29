const { body, query, param } = require('express-validator')

class AuthValidator {
  // Register validation
  validateRegister() {
    return [
      body('username')
        .trim()
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be between 3 and 30 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores')
        .normalizeEmail(),

      body('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail()
        .toLowerCase(),

      body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),

      body('firstName')
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('First name is required and must be less than 50 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('First name can only contain letters and spaces'),

      body('lastName')
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Last name is required and must be less than 50 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Last name can only contain letters and spaces'),

      body('phoneNumber')
        .optional()
        .trim()
        .matches(/^[+]?[\d\s\-()]+$/)
        .withMessage('Please provide a valid phone number')
    ]
  }

  // Login validation
  validateLogin() {
    return [
      body('identifier')
        .trim()
        .notEmpty()
        .withMessage('Username or email is required'),

      body('password')
        .notEmpty()
        .withMessage('Password is required'),

      body('twoFactorCode')
        .optional()
        .trim()
        .isLength({ min: 6, max: 6 })
        .withMessage('Two-factor code must be 6 digits')
        .isNumeric()
        .withMessage('Two-factor code must contain only numbers')
    ]
  }

  // Forgot password validation
  validateForgotPassword() {
    return [
      body('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail()
        .toLowerCase()
    ]
  }

  // Reset password validation
  validateResetPassword() {
    return [
      param('token')
        .isLength({ min: 64, max: 64 })
        .withMessage('Invalid reset token'),

      body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
    ]
  }

  // Change password validation
  validateChangePassword() {
    return [
      body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),

      body('newPassword')
        .isLength({ min: 8 })
        .withMessage('New password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),

      body('newPassword')
        .custom((value, { req }) => {
          if (value === req.body.currentPassword) {
            throw new Error('New password must be different from current password')
          }
          return true
        })
    ]
  }

  // Two-factor authentication validation
  validateTwoFactorCode() {
    return [
      body('code')
        .trim()
        .isLength({ min: 6, max: 6 })
        .withMessage('Verification code must be 6 digits')
        .isNumeric()
        .withMessage('Verification code must contain only numbers')
    ]
  }

  // Disable two-factor validation
  validateDisableTwoFactor() {
    return [
      body('password')
        .notEmpty()
        .withMessage('Password is required'),

      body('code')
        .trim()
        .isLength({ min: 6, max: 6 })
        .withMessage('Two-factor code must be 6 digits')
        .isNumeric()
        .withMessage('Two-factor code must contain only numbers')
    ]
  }

  // Refresh token validation
  validateRefreshToken() {
    return [
      body('refreshToken')
        .notEmpty()
        .withMessage('Refresh token is required')
    ]
  }

  // Logout validation
  validateLogout() {
    return [
      body('refreshToken')
        .optional()
        .notEmpty()
        .withMessage('Refresh token cannot be empty if provided')
    ]
  }
}

class UserValidator {
  // Create user validation (admin)
  validateCreateUser() {
    return [
      body('username')
        .trim()
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be between 3 and 30 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),

      body('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail()
        .toLowerCase(),

      body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),

      body('firstName')
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('First name is required and must be less than 50 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('First name can only contain letters and spaces'),

      body('lastName')
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Last name is required and must be less than 50 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Last name can only contain letters and spaces'),

      body('phoneNumber')
        .optional()
        .trim()
        .matches(/^[+]?[\d\s\-()]+$/)
        .withMessage('Please provide a valid phone number'),

      body('roles')
        .optional()
        .isArray()
        .withMessage('Roles must be an array')
        .custom((roles) => {
          if (roles.length === 0) {
            throw new Error('At least one role must be specified')
          }
          return true
        }),

      body('roles.*')
        .isString()
        .withMessage('Each role must be a string')
        .isLength({ min: 1 })
        .withMessage('Role name cannot be empty'),

      body('status')
        .optional()
        .isIn(['active', 'inactive', 'pending'])
        .withMessage('Status must be active, inactive, or pending')
    ]
  }

  // Update user validation
  validateUpdateUser() {
    return [
      param('id')
        .isMongoId()
        .withMessage('Invalid user ID'),

      body('username')
        .optional()
        .trim()
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be between 3 and 30 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),

      body('email')
        .optional()
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail()
        .toLowerCase(),

      body('firstName')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('First name must be less than 50 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('First name can only contain letters and spaces'),

      body('lastName')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Last name must be less than 50 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Last name can only contain letters and spaces'),

      body('phoneNumber')
        .optional()
        .trim()
        .matches(/^[+]?[\d\s\-()]+$/)
        .withMessage('Please provide a valid phone number'),

      body('roles')
        .optional()
        .isArray()
        .withMessage('Roles must be an array'),

      body('roles.*')
        .optional()
        .isString()
        .withMessage('Each role must be a string'),

      body('status')
        .optional()
        .isIn(['active', 'inactive', 'pending', 'deleted'])
        .withMessage('Status must be active, inactive, pending, or deleted')
    ]
  }

  // Update profile validation
  validateUpdateProfile() {
    return [
      body('firstName')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('First name must be less than 50 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('First name can only contain letters and spaces'),

      body('lastName')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Last name must be less than 50 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Last name can only contain letters and spaces'),

      body('phoneNumber')
        .optional()
        .trim()
        .matches(/^[+]?[\d\s\-()]+$/)
        .withMessage('Please provide a valid phone number'),

      body('bio')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Bio must be less than 500 characters'),

      body('dateOfBirth')
        .optional()
        .isISO8601()
        .withMessage('Please provide a valid date of birth')
        .custom((value) => {
          const birthDate = new Date(value)
          const today = new Date()
          const age = today.getFullYear() - birthDate.getFullYear()
          
          if (age < 13 || age > 120) {
            throw new Error('Age must be between 13 and 120 years')
          }
          return true
        }),

      body('address')
        .optional()
        .isObject()
        .withMessage('Address must be an object'),

      body('address.street')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Street address must be less than 100 characters'),

      body('address.city')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('City must be less than 50 characters'),

      body('address.state')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('State must be less than 50 characters'),

      body('address.zipCode')
        .optional()
        .trim()
        .matches(/^[\d\-\s]+$/)
        .withMessage('Please provide a valid zip code'),

      body('address.country')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('Country must be less than 50 characters'),

      body('preferences')
        .optional()
        .isObject()
        .withMessage('Preferences must be an object'),

      body('preferences.language')
        .optional()
        .isIn(['en', 'id', 'es', 'fr', 'de'])
        .withMessage('Language must be one of: en, id, es, fr, de'),

      body('preferences.timezone')
        .optional()
        .isString()
        .withMessage('Timezone must be a string'),

      body('preferences.theme')
        .optional()
        .isIn(['light', 'dark', 'auto'])
        .withMessage('Theme must be light, dark, or auto'),

      body('preferences.notifications')
        .optional()
        .isObject()
        .withMessage('Notifications must be an object')
    ]
  }

  // Reset user password validation (admin)
  validateResetUserPassword() {
    return [
      param('id')
        .isMongoId()
        .withMessage('Invalid user ID'),

      body('newPassword')
        .isLength({ min: 8 })
        .withMessage('New password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
    ]
  }

  // User query validation
  validateUserQuery() {
    return [
      query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),

      query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),

      query('search')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Search term must be less than 100 characters'),

      query('status')
        .optional()
        .isIn(['active', 'inactive', 'pending', 'deleted'])
        .withMessage('Status must be active, inactive, pending, or deleted'),

      query('role')
        .optional()
        .isString()
        .withMessage('Role must be a string'),

      query('sortBy')
        .optional()
        .isIn(['username', 'email', 'createdAt', 'updatedAt', 'lastLoginAt'])
        .withMessage('SortBy must be username, email, createdAt, updatedAt, or lastLoginAt'),

      query('sortOrder')
        .optional()
        .isIn(['asc', 'desc'])
        .withMessage('SortOrder must be asc or desc')
    ]
  }

  // User ID validation
  validateUserId() {
    return [
      param('id')
        .isMongoId()
        .withMessage('Invalid user ID')
    ]
  }

  // Session ID validation
  validateSessionId() {
    return [
      param('id')
        .isMongoId()
        .withMessage('Invalid user ID'),

      param('sessionId')
        .isMongoId()
        .withMessage('Invalid session ID')
    ]
  }
}

class RoleValidator {
  // Create role validation
  validateCreateRole() {
    return [
      body('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Role name must be between 2 and 50 characters')
        .matches(/^[A-Z_]+$/)
        .withMessage('Role name must contain only uppercase letters and underscores'),

      body('description')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Description must be less than 200 characters'),

      body('permissions')
        .optional()
        .isArray()
        .withMessage('Permissions must be an array'),

      body('permissions.*')
        .isString()
        .withMessage('Each permission must be a string')
        .matches(/^[a-z_]+$/)
        .withMessage('Permission names must contain only lowercase letters and underscores'),

      body('level')
        .optional()
        .isInt({ min: 1, max: 10 })
        .withMessage('Level must be between 1 and 10'),

      body('parentRole')
        .optional()
        .isMongoId()
        .withMessage('Parent role must be a valid ID')
    ]
  }

  // Update role validation
  validateUpdateRole() {
    return [
      param('id')
        .isMongoId()
        .withMessage('Invalid role ID'),

      body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Role name must be between 2 and 50 characters')
        .matches(/^[A-Z_]+$/)
        .withMessage('Role name must contain only uppercase letters and underscores'),

      body('description')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Description must be less than 200 characters'),

      body('permissions')
        .optional()
        .isArray()
        .withMessage('Permissions must be an array'),

      body('permissions.*')
        .isString()
        .withMessage('Each permission must be a string')
        .matches(/^[a-z_]+$/)
        .withMessage('Permission names must contain only lowercase letters and underscores'),

      body('level')
        .optional()
        .isInt({ min: 1, max: 10 })
        .withMessage('Level must be between 1 and 10'),

      body('parentRole')
        .optional()
        .isMongoId()
        .withMessage('Parent role must be a valid ID')
    ]
  }

  // Role assignment validation
  validateRoleAssignment() {
    return [
      body('userId')
        .isMongoId()
        .withMessage('User ID must be valid'),

      body('roleId')
        .isMongoId()
        .withMessage('Role ID must be valid')
    ]
  }

  // Role query validation
  validateRoleQuery() {
    return [
      query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),

      query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),

      query('search')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Search term must be less than 100 characters'),

      query('includeSystem')
        .optional()
        .isBoolean()
        .withMessage('IncludeSystem must be a boolean')
    ]
  }

  // Role ID validation
  validateRoleId() {
    return [
      param('id')
        .isMongoId()
        .withMessage('Invalid role ID')
    ]
  }
}

class AuditValidator {
  // Audit log query validation
  validateAuditQuery() {
    return [
      query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),

      query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),

      query('search')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Search term must be less than 100 characters'),

      query('action')
        .optional()
        .isString()
        .withMessage('Action must be a string'),

      query('category')
        .optional()
        .isIn(['AUTHENTICATION', 'USER_MANAGEMENT', 'ROLE_MANAGEMENT', 'SYSTEM', 'DATA_ACCESS', 'SECURITY'])
        .withMessage('Invalid category'),

      query('severity')
        .optional()
        .isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
        .withMessage('Severity must be LOW, MEDIUM, HIGH, or CRITICAL'),

      query('status')
        .optional()
        .isIn(['SUCCESS', 'FAILURE', 'WARNING'])
        .withMessage('Status must be SUCCESS, FAILURE, or WARNING'),

      query('userId')
        .optional()
        .isMongoId()
        .withMessage('User ID must be valid'),

      query('resource')
        .optional()
        .isString()
        .withMessage('Resource must be a string'),

      query('startDate')
        .optional()
        .isISO8601()
        .withMessage('Start date must be a valid ISO 8601 date'),

      query('endDate')
        .optional()
        .isISO8601()
        .withMessage('End date must be a valid ISO 8601 date'),

      query('sortBy')
        .optional()
        .isIn(['timestamp', 'action', 'category', 'severity', 'status'])
        .withMessage('SortBy must be timestamp, action, category, severity, or status'),

      query('sortOrder')
        .optional()
        .isIn(['asc', 'desc'])
        .withMessage('SortOrder must be asc or desc')
    ]
  }

  // Audit stats validation
  validateAuditStatsQuery() {
    return [
      query('period')
        .optional()
        .isIn(['7d', '30d', '90d'])
        .withMessage('Period must be 7d, 30d, or 90d'),

      query('startDate')
        .optional()
        .isISO8601()
        .withMessage('Start date must be a valid ISO 8601 date'),

      query('endDate')
        .optional()
        .isISO8601()
        .withMessage('End date must be a valid ISO 8601 date')
    ]
  }

  // User activity validation
  validateUserActivity() {
    return [
      param('userId')
        .isMongoId()
        .withMessage('User ID must be valid'),

      query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),

      query('limit')
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage('Limit must be between 1 and 50'),

      query('action')
        .optional()
        .isString()
        .withMessage('Action must be a string'),

      query('category')
        .optional()
        .isIn(['AUTHENTICATION', 'USER_MANAGEMENT', 'ROLE_MANAGEMENT', 'SYSTEM', 'DATA_ACCESS', 'SECURITY'])
        .withMessage('Invalid category'),

      query('startDate')
        .optional()
        .isISO8601()
        .withMessage('Start date must be a valid ISO 8601 date'),

      query('endDate')
        .optional()
        .isISO8601()
        .withMessage('End date must be a valid ISO 8601 date')
    ]
  }

  // Cleanup validation
  validateCleanup() {
    return [
      body('olderThanDays')
        .optional()
        .isInt({ min: 30, max: 3650 })
        .withMessage('Days must be between 30 and 3650 (10 years)')
    ]
  }

  // Audit log ID validation
  validateAuditLogId() {
    return [
      param('id')
        .isMongoId()
        .withMessage('Invalid audit log ID')
    ]
  }
}

module.exports = {
  AuthValidator: new AuthValidator(),
  UserValidator: new UserValidator(),
  RoleValidator: new RoleValidator(),
  AuditValidator: new AuditValidator()
}
