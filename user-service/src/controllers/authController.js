const User = require('../models/User')
const Role = require('../models/Role')
const AuditLog = require('../models/AuditLog')
const authService = require('../services/authService')
const emailService = require('../services/emailService')
const { validationResult } = require('express-validator')
const speakeasy = require('speakeasy')
const QRCode = require('qrcode')

class AuthController {
  // Register new user
  async register(req, res) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        })
      }

      const { username, email, password, firstName, lastName, phoneNumber } = req.body

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }]
      })

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User already exists with this email or username'
        })
      }

      // Get default role (VIEWER)
      const defaultRole = await Role.findOne({ name: 'VIEWER' })
      if (!defaultRole) {
        return res.status(500).json({
          success: false,
          message: 'Default role not found. Please contact administrator.'
        })
      }

      // Create user
      const user = new User({
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        password,
        profile: {
          firstName,
          lastName,
          phoneNumber
        },
        roles: [defaultRole._id],
        status: 'pending', // Require email verification
        emailVerificationToken: authService.generateVerificationToken(),
        emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
      })

      await user.save()

      // Send verification email
      try {
        await emailService.sendVerificationEmail(user.email, user.emailVerificationToken, user.profile.firstName)
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError)
        // Continue with registration even if email fails
      }

      // Log registration
      await AuditLog.createLog({
        userId: user._id,
        username: user.username,
        userRole: 'VIEWER',
        action: 'USER_CREATED',
        category: 'USER_MANAGEMENT',
        severity: 'LOW',
        resource: 'users',
        method: req.method,
        endpoint: req.originalUrl,
        description: `User ${user.username} registered`,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent') || '',
        status: 'SUCCESS',
        timestamp: new Date()
      })

      res.status(201).json({
        success: true,
        message: 'User registered successfully. Please check your email for verification.',
        data: {
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            profile: user.profile,
            status: user.status,
            emailVerified: user.emailVerified
          }
        }
      })

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Registration failed',
        error: error.message
      })
    }
  }

  // Login user
  async login(req, res) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        })
      }

      const { identifier, password, twoFactorCode } = req.body

      // Find user and check credentials
      const user = await User.findByCredentials(identifier, password)
      
      // Check if email is verified
      if (!user.emailVerified) {
        await AuditLog.logAuth(user._id, user.username, 'LOGIN_FAILED', req, 'FAILURE', 'Email not verified')
        
        return res.status(401).json({
          success: false,
          message: 'Please verify your email before logging in.'
        })
      }

      // Check two-factor authentication
      if (user.twoFactorAuth.enabled) {
        if (!twoFactorCode) {
          return res.status(200).json({
            success: false,
            message: 'Two-factor authentication code required',
            requiresTwoFactor: true,
            tempToken: authService.generateTempToken(user._id)
          })
        }

        const isValidCode = speakeasy.totp.verify({
          secret: user.twoFactorAuth.secret,
          encoding: 'base32',
          token: twoFactorCode,
          window: 2
        })

        if (!isValidCode) {
          await AuditLog.logAuth(user._id, user.username, 'LOGIN_FAILED', req, 'FAILURE', 'Invalid 2FA code')
          
          return res.status(401).json({
            success: false,
            message: 'Invalid two-factor authentication code'
          })
        }
      }

      // Generate tokens
      const accessToken = user.generateAuthToken()
      const refreshToken = user.generateRefreshToken({
        userAgent: req.get('User-Agent'),
        ip: req.ip || req.connection.remoteAddress,
        deviceType: authService.getDeviceType(req.get('User-Agent'))
      })

      // Update user login info
      user.lastLoginAt = new Date()
      user.lastLoginIP = req.ip || req.connection.remoteAddress
      await user.save()

      // Log successful login
      await AuditLog.logAuth(user._id, user.username, 'LOGIN', req)

      // Populate user roles for response
      await user.populate('roles')

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            profile: user.profile,
            roles: user.roles,
            permissions: user.permissions,
            status: user.status,
            lastLoginAt: user.lastLoginAt,
            preferences: user.preferences
          },
          tokens: {
            accessToken,
            refreshToken,
            expiresIn: process.env.JWT_EXPIRES_IN || '7d'
          }
        }
      })

    } catch (error) {
      // Log failed login attempt if we have user info
      if (req.body.identifier) {
        await AuditLog.createLog({
          userId: null,
          username: req.body.identifier,
          userRole: 'UNKNOWN',
          action: 'LOGIN_FAILED',
          category: 'AUTHENTICATION',
          severity: 'MEDIUM',
          resource: 'auth',
          method: req.method,
          endpoint: req.originalUrl,
          description: `Failed login attempt for ${req.body.identifier}`,
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get('User-Agent') || '',
          status: 'FAILURE',
          errorMessage: error.message,
          timestamp: new Date()
        })
      }

      res.status(401).json({
        success: false,
        message: error.message || 'Login failed'
      })
    }
  }

  // Logout user
  async logout(req, res) {
    try {
      const { refreshToken } = req.body

      if (refreshToken) {
        // Remove specific refresh token
        req.user.revokeRefreshToken(refreshToken)
      } else {
        // Remove all refresh tokens
        req.user.revokeAllRefreshTokens()
      }

      await req.user.save()

      // Log logout
      await AuditLog.logAuth(req.user._id, req.user.username, 'LOGOUT', req)

      res.json({
        success: true,
        message: 'Logout successful'
      })

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Logout failed',
        error: error.message
      })
    }
  }

  // Refresh access token
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token required'
        })
      }

      // Find user with this refresh token
      const user = await User.findOne({
        'refreshTokens.token': refreshToken,
        'refreshTokens.expiresAt': { $gt: new Date() }
      }).populate('roles')

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired refresh token'
        })
      }

      // Generate new access token
      const accessToken = user.generateAuthToken()

      // Optionally rotate refresh token
      const shouldRotateRefreshToken = Math.random() > 0.7 // 30% chance
      let newRefreshToken = refreshToken

      if (shouldRotateRefreshToken) {
        user.revokeRefreshToken(refreshToken)
        newRefreshToken = user.generateRefreshToken({
          userAgent: req.get('User-Agent'),
          ip: req.ip || req.connection.remoteAddress,
          deviceType: authService.getDeviceType(req.get('User-Agent'))
        })
        await user.save()
      }

      res.json({
        success: true,
        data: {
          tokens: {
            accessToken,
            refreshToken: newRefreshToken,
            expiresIn: process.env.JWT_EXPIRES_IN || '7d'
          }
        }
      })

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Token refresh failed',
        error: error.message
      })
    }
  }

  // Verify email
  async verifyEmail(req, res) {
    try {
      const { token } = req.params

      const user = await User.findOne({
        emailVerificationToken: token,
        emailVerificationExpires: { $gt: Date.now() }
      })

      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired verification token'
        })
      }

      user.emailVerified = true
      user.emailVerificationToken = undefined
      user.emailVerificationExpires = undefined
      user.status = 'active'

      await user.save()

      // Log email verification
      await AuditLog.logAuth(user._id, user.username, 'EMAIL_VERIFICATION', req)

      res.json({
        success: true,
        message: 'Email verified successfully. You can now log in.'
      })

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Email verification failed',
        error: error.message
      })
    }
  }

  // Forgot password
  async forgotPassword(req, res) {
    try {
      const { email } = req.body

      const user = await User.findOne({ email: email.toLowerCase() })

      if (!user) {
        // Don't reveal if email exists or not
        return res.json({
          success: true,
          message: 'If the email exists, a password reset link has been sent.'
        })
      }

      // Generate reset token
      const resetToken = user.createPasswordResetToken()
      await user.save({ validateBeforeSave: false })

      try {
        // Send reset email
        await emailService.sendPasswordResetEmail(user.email, resetToken, user.profile.firstName)

        res.json({
          success: true,
          message: 'Password reset link sent to your email.'
        })

      } catch (emailError) {
        user.passwordResetToken = undefined
        user.passwordResetExpires = undefined
        await user.save({ validateBeforeSave: false })

        return res.status(500).json({
          success: false,
          message: 'Failed to send password reset email. Please try again.'
        })
      }

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Password reset request failed',
        error: error.message
      })
    }
  }

  // Reset password
  async resetPassword(req, res) {
    try {
      const { token } = req.params
      const { password } = req.body

      // Hash the token from URL
      const hashedToken = require('crypto')
        .createHash('sha256')
        .update(token)
        .digest('hex')

      // Find user with valid reset token
      const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
      })

      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired password reset token'
        })
      }

      // Set new password
      user.password = password
      user.passwordResetToken = undefined
      user.passwordResetExpires = undefined
      user.passwordChangedAt = new Date()

      // Revoke all refresh tokens to force re-login
      user.revokeAllRefreshTokens()

      await user.save()

      // Log password reset
      await AuditLog.logAuth(user._id, user.username, 'PASSWORD_RESET', req)

      res.json({
        success: true,
        message: 'Password reset successful. Please log in with your new password.'
      })

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Password reset failed',
        error: error.message
      })
    }
  }

  // Change password (authenticated)
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body

      // Get user with password
      const user = await User.findById(req.user._id).select('+password')

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword)
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        })
      }

      // Set new password
      user.password = newPassword
      user.passwordChangedAt = new Date()
      user.mustChangePassword = false

      // Revoke all other refresh tokens to force re-login on other devices
      user.revokeAllRefreshTokens()

      await user.save()

      // Log password change
      await AuditLog.logAuth(user._id, user.username, 'PASSWORD_CHANGE', req)

      res.json({
        success: true,
        message: 'Password changed successfully'
      })

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Password change failed',
        error: error.message
      })
    }
  }

  // Enable two-factor authentication
  async enableTwoFactor(req, res) {
    try {
      const user = req.user

      if (user.twoFactorAuth.enabled) {
        return res.status(400).json({
          success: false,
          message: 'Two-factor authentication is already enabled'
        })
      }

      // Generate secret
      const secret = speakeasy.generateSecret({
        name: `${process.env.TWO_FACTOR_SERVICE_NAME || 'ERP System'} (${user.email})`,
        issuer: process.env.TWO_FACTOR_SERVICE_NAME || 'ERP System'
      })

      // Generate QR code
      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url)

      // Generate backup codes
      const backupCodes = authService.generateBackupCodes()

      // Save secret (but don't enable yet)
      user.twoFactorAuth.secret = secret.base32
      user.twoFactorAuth.backupCodes = backupCodes
      await user.save()

      res.json({
        success: true,
        data: {
          secret: secret.base32,
          qrCode: qrCodeUrl,
          backupCodes,
          manualEntryKey: secret.base32
        }
      })

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to generate two-factor authentication setup',
        error: error.message
      })
    }
  }

  // Verify and activate two-factor authentication
  async verifyTwoFactor(req, res) {
    try {
      const { code } = req.body
      const user = req.user

      if (!user.twoFactorAuth.secret) {
        return res.status(400).json({
          success: false,
          message: 'Two-factor authentication setup not initiated'
        })
      }

      // Verify the code
      const isValid = speakeasy.totp.verify({
        secret: user.twoFactorAuth.secret,
        encoding: 'base32',
        token: code,
        window: 2
      })

      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: 'Invalid verification code'
        })
      }

      // Enable two-factor authentication
      user.twoFactorAuth.enabled = true
      await user.save()

      // Log two-factor enable
      await AuditLog.logAuth(user._id, user.username, 'TWO_FACTOR_ENABLED', req)

      res.json({
        success: true,
        message: 'Two-factor authentication enabled successfully'
      })

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Two-factor authentication verification failed',
        error: error.message
      })
    }
  }

  // Disable two-factor authentication
  async disableTwoFactor(req, res) {
    try {
      const { password, code } = req.body
      const user = await User.findById(req.user._id).select('+password')

      // Verify password
      const isPasswordValid = await user.comparePassword(password)
      if (!isPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Invalid password'
        })
      }

      // Verify current 2FA code
      const isCodeValid = speakeasy.totp.verify({
        secret: user.twoFactorAuth.secret,
        encoding: 'base32',
        token: code,
        window: 2
      })

      if (!isCodeValid) {
        return res.status(400).json({
          success: false,
          message: 'Invalid two-factor authentication code'
        })
      }

      // Disable two-factor authentication
      user.twoFactorAuth.enabled = false
      user.twoFactorAuth.secret = undefined
      user.twoFactorAuth.backupCodes = []
      await user.save()

      // Log two-factor disable
      await AuditLog.logAuth(user._id, user.username, 'TWO_FACTOR_DISABLED', req)

      res.json({
        success: true,
        message: 'Two-factor authentication disabled successfully'
      })

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to disable two-factor authentication',
        error: error.message
      })
    }
  }

  // Get current user profile
  async getProfile(req, res) {
    try {
      await req.user.populate('roles')

      res.json({
        success: true,
        data: {
          user: {
            id: req.user._id,
            username: req.user.username,
            email: req.user.email,
            profile: req.user.profile,
            roles: req.user.roles,
            permissions: req.user.permissions,
            status: req.user.status,
            emailVerified: req.user.emailVerified,
            lastLoginAt: req.user.lastLoginAt,
            preferences: req.user.preferences,
            twoFactorEnabled: req.user.twoFactorAuth.enabled,
            createdAt: req.user.createdAt,
            updatedAt: req.user.updatedAt
          }
        }
      })

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get profile',
        error: error.message
      })
    }
  }
}

module.exports = new AuthController()
