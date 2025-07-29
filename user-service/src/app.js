const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const compression = require('compression')
const rateLimit = require('express-rate-limit')
const mongoSanitize = require('express-mongo-sanitize')
require('express-async-errors')
require('dotenv').config()

const connectDB = require('./config/database')
const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/users')
const roleRoutes = require('./routes/roles')
const auditRoutes = require('./routes/audit')

const app = express()

// Trust proxy
app.set('trust proxy', 1)

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https:"],
      connectSrc: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false
}))

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',')
    
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true)
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}

app.use(cors(corsOptions))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
})

app.use(limiter)

// Stricter rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 auth requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  },
  skipSuccessfulRequests: true
})

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Data sanitization
app.use(mongoSanitize())

// Compression
app.use(compression())

// Logging
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'))
} else {
  app.use(morgan('dev'))
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'User service is healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  })
})

// Health check endpoint (API Gateway compatible)
app.get('/api/v1/health', (req, res) => {
  res.json({
    success: true,
    message: 'User service is healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  })
})

// API routes
app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/roles', roleRoutes)
app.use('/api/audit', auditRoutes)

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'User Service API',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        logout: 'POST /api/auth/logout',
        forgotPassword: 'POST /api/auth/forgot-password',
        resetPassword: 'POST /api/auth/reset-password/:token',
        verifyEmail: 'GET /api/auth/verify-email/:token',
        refreshToken: 'POST /api/auth/refresh-token',
        changePassword: 'POST /api/auth/change-password',
        profile: 'GET /api/auth/profile',
        twoFactor: {
          enable: 'POST /api/auth/2fa/enable',
          verify: 'POST /api/auth/2fa/verify',
          disable: 'POST /api/auth/2fa/disable'
        }
      },
      users: {
        list: 'GET /api/users',
        create: 'POST /api/users',
        get: 'GET /api/users/:id',
        update: 'PUT /api/users/:id',
        delete: 'DELETE /api/users/:id',
        activate: 'POST /api/users/:id/activate',
        deactivate: 'POST /api/users/:id/deactivate',
        resetPassword: 'POST /api/users/:id/reset-password',
        sessions: 'GET /api/users/:id/sessions',
        revokeSession: 'DELETE /api/users/:id/sessions/:sessionId',
        stats: 'GET /api/users/stats',
        updateProfile: 'PATCH /api/users/profile'
      },
      roles: {
        list: 'GET /api/roles',
        create: 'POST /api/roles',
        get: 'GET /api/roles/:id',
        update: 'PUT /api/roles/:id',
        delete: 'DELETE /api/roles/:id',
        hierarchy: 'GET /api/roles/hierarchy',
        permissions: 'GET /api/roles/permissions',
        assign: 'POST /api/roles/assign',
        remove: 'POST /api/roles/remove',
        stats: 'GET /api/roles/stats'
      },
      audit: {
        list: 'GET /api/audit',
        get: 'GET /api/audit/:id',
        stats: 'GET /api/audit/stats',
        filters: 'GET /api/audit/filters',
        export: 'GET /api/audit/export',
        userActivity: 'GET /api/audit/users/:userId',
        cleanup: 'POST /api/audit/cleanup'
      }
    }
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method
  })
})

// Global error handler
app.use((error, req, res, next) => {
  console.error('Error:', error)

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => err.message)
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors
    })
  }

  // Mongoose duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0]
    return res.status(409).json({
      success: false,
      message: `${field} already exists`
    })
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    })
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    })
  }

  // Mongoose cast error
  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    })
  }

  // Default error
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  })
})

// Start server
const PORT = process.env.PORT || 5001

async function startServer() {
  try {
    // Connect to database
    await connectDB.connect()
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 User service running on port ${PORT}`)
      console.log(`📝 API documentation: http://localhost:${PORT}/api`)
      console.log(`🏥 Health check: http://localhost:${PORT}/health`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err)
  process.exit(1)
})

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err)
  process.exit(1)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...')
  process.exit(0)
})

startServer()

module.exports = app
