const crypto = require('crypto')

// Generate secure random string
function generateSecureRandom(length = 32) {
  return crypto.randomBytes(length).toString('hex')
}

// Paginate results
function paginate(query, page = 1, limit = 10) {
  const skip = (page - 1) * limit
  return query.skip(skip).limit(limit)
}

// Build pagination info
function buildPaginationInfo(page, limit, total) {
  const pages = Math.ceil(total / limit)
  return {
    current: page,
    pages,
    total,
    hasNext: page < pages,
    hasPrev: page > 1,
    limit
  }
}

// Sanitize object by removing sensitive fields
function sanitizeObject(obj, sensitiveFields = ['password', 'refreshTokens', 'emailVerificationToken', 'passwordResetToken']) {
  const sanitized = { ...obj }
  
  sensitiveFields.forEach(field => {
    if (field.includes('.')) {
      // Handle nested fields like 'twoFactorAuth.secret'
      const parts = field.split('.')
      let current = sanitized
      for (let i = 0; i < parts.length - 1; i++) {
        if (current[parts[i]]) {
          current = current[parts[i]]
        } else {
          break
        }
      }
      if (current && current[parts[parts.length - 1]]) {
        delete current[parts[parts.length - 1]]
      }
    } else {
      delete sanitized[field]
    }
  })
  
  return sanitized
}

// Validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate password strength
function validatePasswordStrength(password) {
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
    strength: calculatePasswordStrength(password)
  }
}

// Calculate password strength score
function calculatePasswordStrength(password) {
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

// Format date for display
function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!date) return null
  
  const d = new Date(date)
  
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

// Get time ago string
function getTimeAgo(date) {
  if (!date) return null
  
  const now = new Date()
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000)
  
  if (diffInSeconds < 60) {
    return 'just now'
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
  }
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
  }
  
  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`
  }
  
  const diffInYears = Math.floor(diffInMonths / 12)
  return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`
}

// Deep merge objects
function deepMerge(target, source) {
  const result = { ...target }
  
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key])
    } else {
      result[key] = source[key]
    }
  }
  
  return result
}

// Sleep function for delays
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Retry function with exponential backoff
async function retry(fn, maxAttempts = 3, delay = 1000) {
  let lastError
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      if (attempt === maxAttempts) {
        throw lastError
      }
      
      // Exponential backoff
      const backoffDelay = delay * Math.pow(2, attempt - 1)
      await sleep(backoffDelay)
    }
  }
}

// Generate avatar URL (gravatar)
function generateAvatarUrl(email, size = 200) {
  const emailHash = crypto
    .createHash('md5')
    .update(email.toLowerCase().trim())
    .digest('hex')
  
  return `https://www.gravatar.com/avatar/${emailHash}?s=${size}&d=identicon`
}

// Mask sensitive data for logging
function maskSensitiveData(obj, sensitiveFields = ['password', 'token', 'secret', 'key']) {
  if (typeof obj !== 'object' || obj === null) {
    return obj
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => maskSensitiveData(item, sensitiveFields))
  }
  
  const masked = {}
  
  for (const [key, value] of Object.entries(obj)) {
    const isSensitive = sensitiveFields.some(field => 
      key.toLowerCase().includes(field.toLowerCase())
    )
    
    if (isSensitive && typeof value === 'string') {
      masked[key] = '***MASKED***'
    } else if (typeof value === 'object') {
      masked[key] = maskSensitiveData(value, sensitiveFields)
    } else {
      masked[key] = value
    }
  }
  
  return masked
}

// Validate MongoDB ObjectId
function isValidObjectId(id) {
  return /^[0-9a-fA-F]{24}$/.test(id)
}

// Generate random color for avatars
function generateRandomColor() {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#AED6F1', '#F7DC6F', '#BB8FCE',
    '#85C1E9', '#F8C471', '#82E0AA', '#F1948A', '#85C1E9'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

// Convert string to slug
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

// Escape regex special characters
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Generate initials from name
function getInitials(firstName, lastName) {
  const first = firstName ? firstName.charAt(0).toUpperCase() : ''
  const last = lastName ? lastName.charAt(0).toUpperCase() : ''
  return `${first}${last}` || '??'
}

// Validate phone number format
function isValidPhoneNumber(phone) {
  // Basic international phone number validation
  const phoneRegex = /^[+]?[\d\s\-()]{7,15}$/
  return phoneRegex.test(phone)
}

// Get client IP from request
function getClientIP(req) {
  return req.ip || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         'unknown'
}

// Get user agent info
function getUserAgentInfo(userAgent) {
  if (!userAgent) return { browser: 'Unknown', os: 'Unknown', device: 'Unknown' }
  
  const ua = userAgent.toLowerCase()
  
  let browser = 'Unknown'
  if (ua.includes('chrome')) browser = 'Chrome'
  else if (ua.includes('firefox')) browser = 'Firefox'
  else if (ua.includes('safari')) browser = 'Safari'
  else if (ua.includes('edge')) browser = 'Edge'
  else if (ua.includes('opera')) browser = 'Opera'
  
  let os = 'Unknown'
  if (ua.includes('windows')) os = 'Windows'
  else if (ua.includes('mac')) os = 'macOS'
  else if (ua.includes('linux')) os = 'Linux'
  else if (ua.includes('android')) os = 'Android'
  else if (ua.includes('iphone') || ua.includes('ipad')) os = 'iOS'
  
  let device = 'Desktop'
  if (ua.includes('mobile')) device = 'Mobile'
  else if (ua.includes('tablet')) device = 'Tablet'
  
  return { browser, os, device }
}

// Check if object is empty
function isEmpty(obj) {
  if (obj === null || obj === undefined) return true
  if (Array.isArray(obj)) return obj.length === 0
  if (typeof obj === 'object') return Object.keys(obj).length === 0
  if (typeof obj === 'string') return obj.trim().length === 0
  return false
}

// Convert bytes to human readable format
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

module.exports = {
  generateSecureRandom,
  paginate,
  buildPaginationInfo,
  sanitizeObject,
  isValidEmail,
  validatePasswordStrength,
  calculatePasswordStrength,
  formatDate,
  getTimeAgo,
  deepMerge,
  sleep,
  retry,
  generateAvatarUrl,
  maskSensitiveData,
  isValidObjectId,
  generateRandomColor,
  slugify,
  escapeRegex,
  getInitials,
  isValidPhoneNumber,
  getClientIP,
  getUserAgentInfo,
  isEmpty,
  formatBytes
}
