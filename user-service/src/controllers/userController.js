const User = require('../models/User')
const Role = require('../models/Role')
const AuditLog = require('../models/AuditLog')
const { validationResult } = require('express-validator')

class UserController {
  // Get all users (admin only)
  async getUsers(req, res) {
    try {
      const page = parseInt(req.query.page) || 1
      const limit = parseInt(req.query.limit) || 10
      const search = req.query.search || ''
      const status = req.query.status
      const role = req.query.role
      const sortBy = req.query.sortBy || 'createdAt'
      const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1

      // Build search query
      const query = {}

      if (search) {
        query.$or = [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { 'profile.firstName': { $regex: search, $options: 'i' } },
          { 'profile.lastName': { $regex: search, $options: 'i' } }
        ]
      }

      if (status) {
        query.status = status
      }

      if (role) {
        const roleDoc = await Role.findOne({ name: role })
        if (roleDoc) {
          query.roles = roleDoc._id
        }
      }

      // Get users with pagination
      const users = await User.find(query)
        .populate('roles', 'name description permissions')
        .select('-password -refreshTokens -emailVerificationToken -passwordResetToken -twoFactorAuth.secret')
        .sort({ [sortBy]: sortOrder })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec()

      // Get total count
      const total = await User.countDocuments(query)

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            current: page,
            pages: Math.ceil(total / limit),
            total,
            hasNext: page < Math.ceil(total / limit),
            hasPrev: page > 1
          }
        }
      })

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get users',
        error: error.message
      })
    }
  }

  // Get user by ID
  async getUserById(req, res) {
    try {
      const { id } = req.params

      const user = await User.findById(id)
        .populate('roles', 'name description permissions')
        .select('-password -refreshTokens -emailVerificationToken -passwordResetToken -twoFactorAuth.secret')

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        })
      }

      res.json({
        success: true,
        data: { user }
      })

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get user',
        error: error.message
      })
    }
  }

  // Create new user (admin only)
  async createUser(req, res) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        })
      }

      const { username, email, password, firstName, lastName, phoneNumber, roles: roleNames, status } = req.body

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

      // Get roles
      let roles = []
      if (roleNames && roleNames.length > 0) {
        roles = await Role.find({ name: { $in: roleNames } })
        if (roles.length !== roleNames.length) {
          return res.status(400).json({
            success: false,
            message: 'One or more roles not found'
          })
        }
      } else {
        // Default role
        const defaultRole = await Role.findOne({ name: 'VIEWER' })
        if (defaultRole) {
          roles = [defaultRole]
        }
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
        roles: roles.map(role => role._id),
        status: status || 'active',
        emailVerified: true, // Admin created users are auto-verified
        createdBy: req.user._id
      })

      await user.save()

      // Populate roles for response
      await user.populate('roles', 'name description permissions')

      // Log user creation
      await AuditLog.logUserManagement(
        req.user._id,
        req.user.username,
        'USER_CREATED',
        req,
        'SUCCESS',
        `Created user ${user.username}`,
        { targetUserId: user._id, targetUsername: user.username }
      )

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: {
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            profile: user.profile,
            roles: user.roles,
            status: user.status,
            emailVerified: user.emailVerified,
            createdAt: user.createdAt
          }
        }
      })

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'User creation failed',
        error: error.message
      })
    }
  }

  // Update user
  async updateUser(req, res) {
    try {
      const { id } = req.params
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        })
      }

      const user = await User.findById(id)
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        })
      }

      const { username, email, firstName, lastName, phoneNumber, roles: roleNames, status } = req.body

      // Check if updating email/username conflicts with existing users
      if (email && email.toLowerCase() !== user.email) {
        const existingUser = await User.findOne({ email: email.toLowerCase() })
        if (existingUser) {
          return res.status(409).json({
            success: false,
            message: 'Email already in use by another user'
          })
        }
      }

      if (username && username.toLowerCase() !== user.username) {
        const existingUser = await User.findOne({ username: username.toLowerCase() })
        if (existingUser) {
          return res.status(409).json({
            success: false,
            message: 'Username already in use by another user'
          })
        }
      }

      // Get roles if provided
      let roles = user.roles
      if (roleNames && roleNames.length > 0) {
        const newRoles = await Role.find({ name: { $in: roleNames } })
        if (newRoles.length !== roleNames.length) {
          return res.status(400).json({
            success: false,
            message: 'One or more roles not found'
          })
        }
        roles = newRoles.map(role => role._id)
      }

      // Update user
      const updateData = {
        updatedBy: req.user._id,
        updatedAt: new Date()
      }

      if (username) updateData.username = username.toLowerCase()
      if (email) updateData.email = email.toLowerCase()
      if (firstName || lastName || phoneNumber) {
        updateData.profile = {
          ...user.profile,
          ...(firstName && { firstName }),
          ...(lastName && { lastName }),
          ...(phoneNumber && { phoneNumber })
        }
      }
      if (roleNames) updateData.roles = roles
      if (status) updateData.status = status

      const updatedUser = await User.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate('roles', 'name description permissions')

      // Log user update
      await AuditLog.logUserManagement(
        req.user._id,
        req.user.username,
        'USER_UPDATED',
        req,
        'SUCCESS',
        `Updated user ${updatedUser.username}`,
        { 
          targetUserId: updatedUser._id, 
          targetUsername: updatedUser.username,
          changes: Object.keys(updateData)
        }
      )

      res.json({
        success: true,
        message: 'User updated successfully',
        data: {
          user: {
            id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
            profile: updatedUser.profile,
            roles: updatedUser.roles,
            status: updatedUser.status,
            emailVerified: updatedUser.emailVerified,
            createdAt: updatedUser.createdAt,
            updatedAt: updatedUser.updatedAt
          }
        }
      })

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'User update failed',
        error: error.message
      })
    }
  }

  // Update user profile (self)
  async updateProfile(req, res) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        })
      }

      const { firstName, lastName, phoneNumber, bio, dateOfBirth, address, preferences } = req.body

      // Update profile
      const updateData = {}

      if (firstName || lastName || phoneNumber || bio || dateOfBirth || address) {
        updateData.profile = {
          ...req.user.profile,
          ...(firstName && { firstName }),
          ...(lastName && { lastName }),
          ...(phoneNumber && { phoneNumber }),
          ...(bio && { bio }),
          ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
          ...(address && { address })
        }
      }

      if (preferences) {
        updateData.preferences = {
          ...req.user.preferences,
          ...preferences
        }
      }

      updateData.updatedAt = new Date()

      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        updateData,
        { new: true, runValidators: true }
      ).populate('roles', 'name description permissions')

      // Log profile update
      await AuditLog.logUserManagement(
        req.user._id,
        req.user.username,
        'PROFILE_UPDATED',
        req,
        'SUCCESS',
        'Updated own profile'
      )

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          user: {
            id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
            profile: updatedUser.profile,
            roles: updatedUser.roles,
            preferences: updatedUser.preferences,
            updatedAt: updatedUser.updatedAt
          }
        }
      })

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Profile update failed',
        error: error.message
      })
    }
  }

  // Delete user (admin only)
  async deleteUser(req, res) {
    try {
      const { id } = req.params

      if (id === req.user._id.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete your own account'
        })
      }

      const user = await User.findById(id)
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        })
      }

      // Soft delete - mark as deleted instead of removing
      await User.findByIdAndUpdate(id, {
        status: 'deleted',
        deletedAt: new Date(),
        deletedBy: req.user._id
      })

      // Log user deletion
      await AuditLog.logUserManagement(
        req.user._id,
        req.user.username,
        'USER_DELETED',
        req,
        'SUCCESS',
        `Deleted user ${user.username}`,
        { targetUserId: user._id, targetUsername: user.username }
      )

      res.json({
        success: true,
        message: 'User deleted successfully'
      })

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'User deletion failed',
        error: error.message
      })
    }
  }

  // Activate user
  async activateUser(req, res) {
    try {
      const { id } = req.params

      const user = await User.findByIdAndUpdate(
        id,
        { 
          status: 'active',
          updatedBy: req.user._id,
          updatedAt: new Date()
        },
        { new: true }
      ).populate('roles', 'name description permissions')

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        })
      }

      // Log user activation
      await AuditLog.logUserManagement(
        req.user._id,
        req.user.username,
        'USER_ACTIVATED',
        req,
        'SUCCESS',
        `Activated user ${user.username}`,
        { targetUserId: user._id, targetUsername: user.username }
      )

      res.json({
        success: true,
        message: 'User activated successfully',
        data: { user }
      })

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'User activation failed',
        error: error.message
      })
    }
  }

  // Deactivate user
  async deactivateUser(req, res) {
    try {
      const { id } = req.params

      if (id === req.user._id.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Cannot deactivate your own account'
        })
      }

      const user = await User.findByIdAndUpdate(
        id,
        { 
          status: 'inactive',
          updatedBy: req.user._id,
          updatedAt: new Date()
        },
        { new: true }
      ).populate('roles', 'name description permissions')

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        })
      }

      // Revoke all refresh tokens to force logout
      user.revokeAllRefreshTokens()
      await user.save()

      // Log user deactivation
      await AuditLog.logUserManagement(
        req.user._id,
        req.user.username,
        'USER_DEACTIVATED',
        req,
        'SUCCESS',
        `Deactivated user ${user.username}`,
        { targetUserId: user._id, targetUsername: user.username }
      )

      res.json({
        success: true,
        message: 'User deactivated successfully',
        data: { user }
      })

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'User deactivation failed',
        error: error.message
      })
    }
  }

  // Reset user password (admin only)
  async resetUserPassword(req, res) {
    try {
      const { id } = req.params
      const { newPassword } = req.body

      const user = await User.findById(id)
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        })
      }

      // Set new password
      user.password = newPassword
      user.passwordChangedAt = new Date()
      user.mustChangePassword = true // Force user to change password on next login
      user.updatedBy = req.user._id

      // Revoke all refresh tokens to force re-login
      user.revokeAllRefreshTokens()

      await user.save()

      // Log password reset
      await AuditLog.logUserManagement(
        req.user._id,
        req.user.username,
        'USER_PASSWORD_RESET',
        req,
        'SUCCESS',
        `Reset password for user ${user.username}`,
        { targetUserId: user._id, targetUsername: user.username }
      )

      res.json({
        success: true,
        message: 'User password reset successfully. User will be required to change password on next login.'
      })

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Password reset failed',
        error: error.message
      })
    }
  }

  // Get user sessions
  async getUserSessions(req, res) {
    try {
      const { id } = req.params

      // Check if user can view sessions (own sessions or admin)
      if (id !== req.user._id.toString() && !req.user.hasPermission('manage_users')) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        })
      }

      const user = await User.findById(id).select('refreshTokens')
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        })
      }

      // Filter active sessions
      const activeSessions = user.refreshTokens
        .filter(token => token.expiresAt > new Date())
        .map(token => ({
          id: token._id,
          deviceType: token.deviceType,
          userAgent: token.userAgent,
          ip: token.ip,
          createdAt: token.createdAt,
          lastUsed: token.lastUsed,
          isCurrentSession: token.token === req.body.currentRefreshToken
        }))

      res.json({
        success: true,
        data: { sessions: activeSessions }
      })

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get user sessions',
        error: error.message
      })
    }
  }

  // Revoke user session
  async revokeUserSession(req, res) {
    try {
      const { id, sessionId } = req.params

      // Check if user can revoke sessions (own sessions or admin)
      if (id !== req.user._id.toString() && !req.user.hasPermission('manage_users')) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        })
      }

      const user = await User.findById(id)
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        })
      }

      // Remove specific session
      user.refreshTokens = user.refreshTokens.filter(
        token => token._id.toString() !== sessionId
      )

      await user.save()

      // Log session revocation
      await AuditLog.logAuth(
        req.user._id,
        req.user.username,
        'SESSION_REVOKED',
        req,
        'SUCCESS',
        `Revoked session for user ${user.username}`
      )

      res.json({
        success: true,
        message: 'Session revoked successfully'
      })

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to revoke session',
        error: error.message
      })
    }
  }

  // Get user statistics (admin only)
  async getUserStats(req, res) {
    try {
      const stats = await User.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ])

      const roleStats = await User.aggregate([
        { $unwind: '$roles' },
        {
          $lookup: {
            from: 'roles',
            localField: 'roles',
            foreignField: '_id',
            as: 'role'
          }
        },
        { $unwind: '$role' },
        {
          $group: {
            _id: '$role.name',
            count: { $sum: 1 }
          }
        }
      ])

      const totalUsers = await User.countDocuments()
      const activeUsers = await User.countDocuments({ status: 'active' })
      const recentUsers = await User.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      })

      res.json({
        success: true,
        data: {
          total: totalUsers,
          active: activeUsers,
          recent: recentUsers,
          statusBreakdown: stats,
          roleBreakdown: roleStats
        }
      })

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get user statistics',
        error: error.message
      })
    }
  }
}

module.exports = new UserController()
