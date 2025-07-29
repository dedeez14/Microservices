const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const { authenticate, authorize, requireOwnershipOrAdmin } = require('../middleware/auth')
const { UserValidator } = require('../validators')

// Get all users (admin only)
router.get('/', 
  authenticate, 
  authorize('manage_users'), 
  UserValidator.validateUserQuery(), 
  userController.getUsers
)

// Get user statistics (admin only)
router.get('/stats', 
  authenticate, 
  authorize('manage_users'), 
  userController.getUserStats
)

// Get user by ID
router.get('/:id', 
  authenticate, 
  UserValidator.validateUserId(),
  requireOwnershipOrAdmin('manage_users'), 
  userController.getUserById
)

// Create new user (admin only)
router.post('/', 
  authenticate, 
  authorize('create_users'), 
  UserValidator.validateCreateUser(), 
  userController.createUser
)

// Update user (admin or self)
router.put('/:id', 
  authenticate, 
  UserValidator.validateUpdateUser(),
  requireOwnershipOrAdmin('update_users'), 
  userController.updateUser
)

// Update user profile (self only)
router.patch('/profile', 
  authenticate, 
  UserValidator.validateUpdateProfile(), 
  userController.updateProfile
)

// Delete user (admin only)
router.delete('/:id', 
  authenticate, 
  authorize('delete_users'), 
  UserValidator.validateUserId(),
  userController.deleteUser
)

// Activate user (admin only)
router.post('/:id/activate', 
  authenticate, 
  authorize('manage_users'), 
  UserValidator.validateUserId(),
  userController.activateUser
)

// Deactivate user (admin only)
router.post('/:id/deactivate', 
  authenticate, 
  authorize('manage_users'), 
  UserValidator.validateUserId(),
  userController.deactivateUser
)

// Reset user password (admin only)
router.post('/:id/reset-password', 
  authenticate, 
  authorize('manage_users'), 
  UserValidator.validateResetUserPassword(),
  userController.resetUserPassword
)

// Get user sessions
router.get('/:id/sessions', 
  authenticate, 
  UserValidator.validateUserId(),
  requireOwnershipOrAdmin('manage_users'), 
  userController.getUserSessions
)

// Revoke user session
router.delete('/:id/sessions/:sessionId', 
  authenticate, 
  UserValidator.validateSessionId(),
  requireOwnershipOrAdmin('manage_users'), 
  userController.revokeUserSession
)

module.exports = router
