const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
  // Basic Information
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    lowercase: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false
  },

  // Personal Information
  profile: {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    phoneNumber: {
      type: String,
      trim: true,
      match: [/^[+]?[1-9]\d{1,14}$/, 'Please enter a valid phone number']
    },
    avatar: {
      type: String,
      default: null
    },
    dateOfBirth: {
      type: Date
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    }
  },

  // Role and Permissions
  roles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true
  }],
  permissions: [{
    resource: {
      type: String,
      required: true
    },
    actions: [{
      type: String,
      enum: ['create', 'read', 'update', 'delete', 'manage']
    }]
  }],

  // Account Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'pending'],
    default: 'active'
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,

  // Security
  twoFactorAuth: {
    enabled: {
      type: Boolean,
      default: false
    },
    secret: String,
    backupCodes: [String],
    lastUsedBackupCode: String
  },
  
  // Password Management
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  mustChangePassword: {
    type: Boolean,
    default: false
  },
  passwordHistory: [{
    hash: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Session Management
  refreshTokens: [{
    token: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    deviceInfo: {
      userAgent: String,
      ip: String,
      deviceType: String
    },
    expiresAt: Date
  }],

  // Activity Tracking
  lastLoginAt: Date,
  lastLoginIP: String,
  loginAttempts: {
    count: {
      type: Number,
      default: 0
    },
    lastAttempt: Date,
    lockUntil: Date
  },

  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  department: String,
  jobTitle: String,
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Preferences
  preferences: {
    language: {
      type: String,
      default: 'en'
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      },
      push: {
        type: Boolean,
        default: true
      }
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Virtual for full name
userSchema.virtual('profile.fullName').get(function() {
  return `${this.profile.firstName} ${this.profile.lastName}`
})

// Virtual for account locked status
userSchema.virtual('isLocked').get(function() {
  return !!(this.loginAttempts.lockUntil && this.loginAttempts.lockUntil > Date.now())
})

// Indexes
userSchema.index({ email: 1 })
userSchema.index({ username: 1 })
userSchema.index({ status: 1 })
userSchema.index({ 'roles': 1 })
userSchema.index({ createdAt: -1 })
userSchema.index({ lastLoginAt: -1 })

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next()

  try {
    // Hash the password with cost of 12
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12)
    this.password = await bcrypt.hash(this.password, salt)

    // Set password changed timestamp
    if (!this.isNew) {
      this.passwordChangedAt = new Date()
    }

    next()
  } catch (error) {
    next(error)
  }
})

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

// Instance method to generate JWT token
userSchema.methods.generateAuthToken = function() {
  const payload = {
    id: this._id,
    username: this.username,
    email: this.email,
    roles: this.roles,
    permissions: this.permissions
  }

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  })
}

// Instance method to generate refresh token
userSchema.methods.generateRefreshToken = function(deviceInfo = {}) {
  const refreshToken = crypto.randomBytes(64).toString('hex')
  const expiresAt = new Date(Date.now() + (parseInt(process.env.JWT_REFRESH_EXPIRES_IN) || 30) * 24 * 60 * 60 * 1000)

  this.refreshTokens.push({
    token: refreshToken,
    deviceInfo,
    expiresAt
  })

  return refreshToken
}

// Instance method to revoke refresh token
userSchema.methods.revokeRefreshToken = function(token) {
  this.refreshTokens = this.refreshTokens.filter(rt => rt.token !== token)
}

// Instance method to revoke all refresh tokens
userSchema.methods.revokeAllRefreshTokens = function() {
  this.refreshTokens = []
}

// Instance method to check if password was changed after JWT was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10)
    return JWTTimestamp < changedTimestamp
  }
  return false
}

// Instance method to create password reset token
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex')
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')
  
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000 // 10 minutes
  
  return resetToken
}

// Instance method to increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // Reset attempts if lock has expired
  if (this.loginAttempts.lockUntil && this.loginAttempts.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: {
        'loginAttempts.lockUntil': 1
      },
      $set: {
        'loginAttempts.count': 1,
        'loginAttempts.lastAttempt': Date.now()
      }
    })
  }

  const updates = {
    $inc: { 'loginAttempts.count': 1 },
    $set: { 'loginAttempts.lastAttempt': Date.now() }
  }

  // Lock account after 5 failed attempts for 30 minutes
  if (this.loginAttempts.count + 1 >= 5 && !this.isLocked) {
    updates.$set['loginAttempts.lockUntil'] = Date.now() + 30 * 60 * 1000 // 30 minutes
  }

  return this.updateOne(updates)
}

// Instance method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: {
      'loginAttempts.count': 1,
      'loginAttempts.lastAttempt': 1,
      'loginAttempts.lockUntil': 1
    }
  })
}

// Static method to find user by credentials
userSchema.statics.findByCredentials = async function(identifier, password) {
  // Find user by email or username
  const user = await this.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { username: identifier.toLowerCase() }
    ],
    status: { $ne: 'suspended' }
  }).select('+password').populate('roles')

  if (!user) {
    throw new Error('Invalid credentials')
  }

  // Check if account is locked
  if (user.isLocked) {
    throw new Error('Account is temporarily locked due to too many failed login attempts')
  }

  // Check password
  const isMatch = await user.comparePassword(password)
  if (!isMatch) {
    await user.incLoginAttempts()
    throw new Error('Invalid credentials')
  }

  // Reset login attempts on successful login
  if (user.loginAttempts.count > 0) {
    await user.resetLoginAttempts()
  }

  return user
}

module.exports = mongoose.model('User', userSchema)
