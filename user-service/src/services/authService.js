const jwt = require('jsonwebtoken')
const crypto = require('crypto')

class AuthService {
  // Generate verification token
  generateVerificationToken() {
    return crypto.randomBytes(32).toString('hex')
  }

  // Generate temporary token for two-factor authentication
  generateTempToken(userId) {
    return jwt.sign(
      { userId, temp: true },
      process.env.JWT_SECRET,
      { expiresIn: '10m' }
    )
  }

  // Generate backup codes for two-factor authentication
  generateBackupCodes(count = 8) {
    const codes = []
    for (let i = 0; i < count; i++) {
      // Generate 8-character alphanumeric codes
      const code = crypto.randomBytes(4).toString('hex').toUpperCase()
      codes.push(`${code.slice(0, 4)}-${code.slice(4)}`)
    }
    return codes
  }

  // Get device type from user agent
  getDeviceType(userAgent) {
    if (!userAgent) return 'unknown'
    
    const ua = userAgent.toLowerCase()
    
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return 'mobile'
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
      return 'tablet'
    } else if (ua.includes('electron')) {
      return 'desktop_app'
    } else {
      return 'desktop'
    }
  }

  // Verify JWT token
  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET)
    } catch (error) {
      throw new Error('Invalid token')
    }
  }

  // Verify refresh token
  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET)
    } catch (error) {
      throw new Error('Invalid refresh token')
    }
  }

  // Generate password reset token
  generatePasswordResetToken() {
    const resetToken = crypto.randomBytes(32).toString('hex')
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex')
    
    return { resetToken, hashedToken }
  }

  // Hash password reset token
  hashToken(token) {
    return crypto
      .createHash('sha256')
      .update(token)
      .digest('hex')
  }

  // Generate API key
  generateApiKey() {
    return crypto.randomBytes(32).toString('hex')
  }

  // Validate password strength
  validatePasswordStrength(password) {
    const minLength = 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    const errors = []

    if (password.length < minLength) {
      errors.push(`Password must be at least ${minLength} characters long`)
    }

    if (!hasUpperCase) {
      errors.push('Password must contain at least one uppercase letter')
    }

    if (!hasLowerCase) {
      errors.push('Password must contain at least one lowercase letter')
    }

    if (!hasNumbers) {
      errors.push('Password must contain at least one number')
    }

    if (!hasSpecialChar) {
      errors.push('Password must contain at least one special character')
    }

    return {
      isValid: errors.length === 0,
      errors,
      strength: this.calculatePasswordStrength(password)
    }
  }

  // Calculate password strength score
  calculatePasswordStrength(password) {
    let score = 0

    // Length bonus
    score += Math.min(password.length * 2, 20)

    // Character variety bonus
    if (/[a-z]/.test(password)) score += 5
    if (/[A-Z]/.test(password)) score += 5
    if (/\d/.test(password)) score += 5
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 10

    // Penalty for common patterns
    if (/(.)\1{2,}/.test(password)) score -= 10 // Repeating characters
    if (/123|abc|qwe/i.test(password)) score -= 10 // Sequential characters

    // Normalize score to 0-100
    score = Math.max(0, Math.min(100, score))

    if (score >= 80) return 'strong'
    if (score >= 60) return 'medium'
    if (score >= 40) return 'weak'
    return 'very_weak'
  }

  // Check if password is compromised (in real implementation, check against known breaches)
  async isPasswordCompromised(password) {
    // In a real implementation, you would check against services like HaveIBeenPwned
    // For now, just check against a simple list of common passwords
    const commonPasswords = [
      'password', '123456', 'password123', 'admin', 'qwerty',
      'letmein', 'welcome', 'monkey', '1234567890', 'abc123'
    ]

    return commonPasswords.includes(password.toLowerCase())
  }

  // Generate secure session ID
  generateSessionId() {
    return crypto.randomUUID()
  }

  // Create session data
  createSessionData(user, req) {
    return {
      userId: user._id,
      username: user.username,
      roles: user.roles,
      permissions: user.permissions,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      deviceType: this.getDeviceType(req.get('User-Agent')),
      createdAt: new Date(),
      lastActivity: new Date()
    }
  }

  // Validate session
  async validateSession(sessionId, userId) {
    // In a real implementation, you would check against Redis or database
    // For now, just return true
    return true
  }

  // Rate limiting helper
  getRateLimitKey(identifier, action) {
    return `rate_limit:${action}:${identifier}`
  }

  // Generate CSRF token
  generateCSRFToken() {
    return crypto.randomBytes(32).toString('hex')
  }

  // Verify CSRF token
  verifyCSRFToken(token, sessionToken) {
    // In a real implementation, verify against session
    return token && token.length === 64
  }

  // Encrypt sensitive data
  encrypt(text) {
    const algorithm = 'aes-256-gcm'
    const key = Buffer.from(process.env.ENCRYPTION_KEY || 'default-key-please-change-in-production', 'utf8')
    const iv = crypto.randomBytes(16)
    
    const cipher = crypto.createCipher(algorithm, key)
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    return `${iv.toString('hex')}:${encrypted}`
  }

  // Decrypt sensitive data
  decrypt(encryptedText) {
    const algorithm = 'aes-256-gcm'
    const key = Buffer.from(process.env.ENCRYPTION_KEY || 'default-key-please-change-in-production', 'utf8')
    
    const [ivHex, encrypted] = encryptedText.split(':')
    const iv = Buffer.from(ivHex, 'hex')
    
    const decipher = crypto.createDecipher(algorithm, key)
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  }

  // Generate secure random string
  generateSecureRandom(length = 32) {
    return crypto.randomBytes(length).toString('hex')
  }

  // Hash data for comparison
  hashData(data) {
    return crypto
      .createHash('sha256')
      .update(data)
      .digest('hex')
  }

  // Create HMAC signature
  createSignature(data, secret) {
    return crypto
      .createHmac('sha256', secret)
      .update(data)
      .digest('hex')
  }

  // Verify HMAC signature
  verifySignature(data, signature, secret) {
    const expectedSignature = this.createSignature(data, secret)
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    )
  }

  // Generate JWT with custom claims
  generateCustomToken(payload, options = {}) {
    const defaultOptions = {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      issuer: process.env.JWT_ISSUER || 'user-service',
      audience: process.env.JWT_AUDIENCE || 'erp-system'
    }

    return jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { ...defaultOptions, ...options }
    )
  }

  // Verify JWT with custom validation
  verifyCustomToken(token, options = {}) {
    const defaultOptions = {
      issuer: process.env.JWT_ISSUER || 'user-service',
      audience: process.env.JWT_AUDIENCE || 'erp-system'
    }

    return jwt.verify(token, process.env.JWT_SECRET, { ...defaultOptions, ...options })
  }

  // Sanitize user input
  sanitizeInput(input) {
    if (typeof input !== 'string') return input
    
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
  }

  // Validate email format
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Validate username format
  isValidUsername(username) {
    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/
    return usernameRegex.test(username)
  }

  // Generate user avatar URL (gravatar or default)
  generateAvatarUrl(email, size = 200) {
    const emailHash = crypto
      .createHash('md5')
      .update(email.toLowerCase().trim())
      .digest('hex')
    
    return `https://www.gravatar.com/avatar/${emailHash}?s=${size}&d=identicon`
  }

  // Check if IP is from allowed range
  isAllowedIP(ip, allowedRanges = []) {
    if (allowedRanges.length === 0) return true
    
    // Simple IP checking - in production, use a proper IP range library
    return allowedRanges.some(range => {
      if (range.includes('/')) {
        // CIDR notation
        return this.isIPInCIDR(ip, range)
      } else {
        // Exact match
        return ip === range
      }
    })
  }

  // Check if IP is in CIDR range (simplified)
  isIPInCIDR(ip, cidr) {
    // This is a simplified implementation
    // In production, use a proper CIDR library like 'ip-range-check'
    const [network, prefixLength] = cidr.split('/')
    return ip.startsWith(network.split('.').slice(0, Math.floor(prefixLength / 8)).join('.'))
  }

  // Generate QR code for 2FA setup
  async generateQRCode(text) {
    const QRCode = require('qrcode')
    return await QRCode.toDataURL(text)
  }

  // Time-based cache key generator
  generateTimeBasedKey(identifier, windowMinutes = 5) {
    const window = Math.floor(Date.now() / (windowMinutes * 60 * 1000))
    return `${identifier}:${window}`
  }
}

module.exports = new AuthService()
