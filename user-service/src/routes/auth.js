const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const { authenticate, optionalAuth } = require('../middleware/auth')
const { AuthValidator } = require('../validators')

// Public routes
router.post('/register', 
  AuthValidator.validateRegister(), 
  authController.register
)

router.post('/login', 
  AuthValidator.validateLogin(), 
  authController.login
)

router.post('/forgot-password', 
  AuthValidator.validateForgotPassword(), 
  authController.forgotPassword
)

router.post('/reset-password/:token', 
  AuthValidator.validateResetPassword(), 
  authController.resetPassword
)

router.get('/verify-email/:token', 
  authController.verifyEmail
)

router.post('/refresh-token', 
  AuthValidator.validateRefreshToken(), 
  authController.refreshToken
)

// Protected routes
router.post('/logout', 
  authenticate, 
  AuthValidator.validateLogout(), 
  authController.logout
)

router.post('/change-password', 
  authenticate, 
  AuthValidator.validateChangePassword(), 
  authController.changePassword
)

router.get('/profile', 
  authenticate, 
  authController.getProfile
)

// Two-factor authentication routes
router.post('/2fa/enable', 
  authenticate, 
  authController.enableTwoFactor
)

router.post('/2fa/verify', 
  authenticate, 
  AuthValidator.validateTwoFactorCode(), 
  authController.verifyTwoFactor
)

router.post('/2fa/disable', 
  authenticate, 
  AuthValidator.validateDisableTwoFactor(), 
  authController.disableTwoFactor
)

module.exports = router
