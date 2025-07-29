const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const compression = require('compression')
const rateLimit = require('express-rate-limit')
const { createProxyMiddleware } = require('http-proxy-middleware')
const swaggerJsdoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')

const config = require('./config')
const logger = require('./utils/logger')
const serviceRegistry = require('./utils/serviceRegistry')
const { errorHandler, notFoundHandler, asyncHandler } = require('./middleware/error')
const { authenticateToken, optionalAuth, authorize, authenticateApiKey } = require('./middleware/auth')

class ApiGateway {
  constructor() {
    this.app = express()
    this.setupMiddleware()
    this.setupSwagger()
    this.setupProxies()
    this.setupRoutes()
    this.setupErrorHandling()
  }

  setupMiddleware() {
    // Security middleware
    this.app.use(helmet())
    
    // CORS
    this.app.use(cors(config.cors))

    // Compression
    this.app.use(compression())

    // Request parsing
    this.app.use(express.json({ limit: '10mb' }))
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }))

    // Logging
    if (config.app.env !== 'test') {
      this.app.use(morgan('combined', {
        stream: {
          write: (message) => logger.info(message.trim())
        }
      }))
    }

    // Rate limiting
    const limiter = rateLimit({
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.max,
      message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.',
        timestamp: new Date().toISOString()
      },
      standardHeaders: true,
      legacyHeaders: false,
      skip: (req) => {
        // Skip rate limiting for health checks and service-to-service calls
        return req.path === '/health' || req.headers['x-api-key']
      }
    })
    
    this.app.use(limiter)

    // Request ID and timestamp
    this.app.use((req, res, next) => {
      req.requestId = Math.random().toString(36).substring(2, 15)
      req.timestamp = new Date().toISOString()
      
      // Add request ID to response headers
      res.setHeader('X-Request-ID', req.requestId)
      res.setHeader('X-Gateway-Version', config.app.version)
      
      next()
    })

    // Request logging middleware
    this.app.use((req, res, next) => {
      logger.info('Incoming request', {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        requestId: req.requestId
      })
      next()
    })
  }

  setupSwagger() {
    const options = {
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'ERP Microservices API Gateway',
          version: config.app.version,
          description: 'API Gateway for ERP microservices system providing unified access to all services',
          contact: {
            name: 'API Support',
            email: 'support@example.com'
          }
        },
        servers: [
          {
            url: `http://localhost:${config.app.port}`,
            description: 'Development server'
          }
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT'
            },
            apiKeyAuth: {
              type: 'apiKey',
              in: 'header',
              name: 'X-API-Key'
            }
          }
        },
        security: [
          {
            bearerAuth: []
          }
        ]
      },
      apis: ['./src/routes/*.js']
    }

    const specs = swaggerJsdoc(options)
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'ERP API Gateway Documentation'
    }))
  }

  setupProxies() {
    // Warehouse Service Proxy
    this.app.use('/api/warehouse', 
      optionalAuth, // Allow both authenticated and unauthenticated requests
      createProxyMiddleware({
        target: config.services.warehouse.url,
        changeOrigin: true,
        pathRewrite: {
          '^/api/warehouse': '/api/v1'
        },
        timeout: config.services.warehouse.timeout,
        onError: (err, req, res) => {
          logger.error('Warehouse service proxy error:', {
            error: err.message,
            url: req.url,
            method: req.method,
            requestId: req.requestId
          })
          
          res.status(503).json({
            success: false,
            message: 'Warehouse service temporarily unavailable',
            timestamp: new Date().toISOString(),
            requestId: req.requestId
          })
        },
        onProxyReq: (proxyReq, req) => {
          // Forward user context if authenticated
          if (req.user) {
            proxyReq.setHeader('X-User-ID', req.user.id)
            proxyReq.setHeader('X-User-Role', req.user.role)
          }
          proxyReq.setHeader('X-Request-ID', req.requestId)
          proxyReq.setHeader('X-Gateway-Source', 'api-gateway')
        },
        onProxyRes: (proxyRes, req) => {
          logger.info('Warehouse service response', {
            status: proxyRes.statusCode,
            url: req.url,
            method: req.method,
            requestId: req.requestId
          })
        }
      })
    )

    // User Service Proxy
    this.app.use('/api/users',
      optionalAuth, // Some endpoints like register/login don't need auth
      createProxyMiddleware({
        target: config.services.user.url,
        changeOrigin: true,
        pathRewrite: {
          '^/api/users': '/api/v1'
        },
        timeout: config.services.user.timeout,
        onError: (err, req, res) => {
          logger.error('User service proxy error:', {
            error: err.message,
            url: req.url,
            method: req.method,
            requestId: req.requestId
          })
          
          res.status(503).json({
            success: false,
            message: 'User service temporarily unavailable',
            timestamp: new Date().toISOString(),
            requestId: req.requestId
          })
        },
        onProxyReq: (proxyReq, req) => {
          // Forward user context if authenticated
          if (req.user) {
            proxyReq.setHeader('X-User-ID', req.user.id)
            proxyReq.setHeader('X-User-Role', req.user.role)
            proxyReq.setHeader('X-User-Permissions', JSON.stringify(req.user.permissions || []))
          }
          proxyReq.setHeader('X-Request-ID', req.requestId)
          proxyReq.setHeader('X-Gateway-Source', 'api-gateway')
        },
        onProxyRes: (proxyRes, req) => {
          logger.info('User service response', {
            status: proxyRes.statusCode,
            url: req.url,
            method: req.method,
            requestId: req.requestId
          })
        }
      })
    )

    // Auth Service Proxy (part of user service)
    this.app.use('/api/auth',
      createProxyMiddleware({
        target: config.services.user.url,
        changeOrigin: true,
        pathRewrite: {
          '^/api/auth': '/api/v1/auth'
        },
        timeout: config.services.user.timeout,
        onError: (err, req, res) => {
          logger.error('Auth service proxy error:', {
            error: err.message,
            url: req.url,
            method: req.method,
            requestId: req.requestId
          })
          
          res.status(503).json({
            success: false,
            message: 'Authentication service temporarily unavailable',
            timestamp: new Date().toISOString(),
            requestId: req.requestId
          })
        },
        onProxyReq: (proxyReq, req) => {
          proxyReq.setHeader('X-Request-ID', req.requestId)
          proxyReq.setHeader('X-Gateway-Source', 'api-gateway')
        }
      })
    )

    // Order Service Proxy (when implemented)
    this.app.use('/api/orders',
      authenticateToken, // Orders require authentication
      createProxyMiddleware({
        target: config.services.order.url,
        changeOrigin: true,
        pathRewrite: {
          '^/api/orders': '/api/v1'
        },
        timeout: config.services.order.timeout,
        onError: this.createProxyErrorHandler('Order service')
      })
    )

    // Product Service Proxy (when implemented)
    this.app.use('/api/products',
      optionalAuth,
      createProxyMiddleware({
        target: config.services.product.url,
        changeOrigin: true,
        pathRewrite: {
          '^/api/products': '/api/v1'
        },
        timeout: config.services.product.timeout,
        onError: this.createProxyErrorHandler('Product service')
      })
    )
  }

  createProxyErrorHandler(serviceName) {
    return (err, req, res) => {
      logger.error(`${serviceName} proxy error:`, {
        error: err.message,
        url: req.url,
        method: req.method,
        requestId: req.requestId
      })
      
      res.status(503).json({
        success: false,
        message: `${serviceName} temporarily unavailable`,
        timestamp: new Date().toISOString(),
        requestId: req.requestId
      })
    }
  }

  setupRoutes() {
    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        success: true,
        message: 'ERP API Gateway',
        data: {
          name: config.app.name,
          version: config.app.version,
          environment: config.app.env,
          timestamp: new Date().toISOString(),
          endpoints: {
            health: '/health',
            services: '/services',
            docs: '/api-docs',
            warehouse: '/api/warehouse',
            users: '/api/users',
            orders: '/api/orders',
            products: '/api/products'
          }
        }
      })
    })

    // Health check endpoint
    this.app.get('/health', asyncHandler(async (req, res) => {
      const healthStatus = serviceRegistry.getHealthStatus()
      
      res.status(healthStatus.status === 'healthy' ? 200 : 503).json({
        success: healthStatus.status === 'healthy',
        message: 'API Gateway Health Check',
        data: {
          gateway: {
            status: 'healthy',
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            version: config.app.version,
            environment: config.app.env
          },
          services: healthStatus
        },
        timestamp: new Date().toISOString(),
        requestId: req.requestId
      })
    }))

    // Services status endpoint
    this.app.get('/services', authenticateApiKey, (req, res) => {
      const services = serviceRegistry.getAllServices()
      
      res.json({
        success: true,
        message: 'Services status',
        data: services,
        timestamp: new Date().toISOString(),
        requestId: req.requestId
      })
    })

    // Authentication endpoint (mock - replace with actual auth service)
    this.app.post('/auth/login', asyncHandler(async (req, res) => {
      // This is a mock implementation
      // In production, this should proxy to the auth service
      const { email, password } = req.body

      // Mock validation
      if (email === 'admin@example.com' && password === 'admin123') {
        const jwt = require('jsonwebtoken')
        const token = jwt.sign(
          { 
            id: '1', 
            email: email, 
            role: 'admin',
            permissions: ['warehouse:read', 'warehouse:write', 'orders:read', 'orders:write']
          },
          config.auth.jwtSecret,
          { expiresIn: config.auth.jwtExpire }
        )

        res.json({
          success: true,
          message: 'Authentication successful',
          data: {
            token,
            user: {
              id: '1',
              email: email,
              role: 'admin'
            }
          },
          timestamp: new Date().toISOString()
        })
      } else {
        res.status(401).json({
          success: false,
          message: 'Invalid credentials',
          timestamp: new Date().toISOString()
        })
      }
    }))
  }

  setupErrorHandling() {
    // 404 handler
    this.app.use(notFoundHandler)
    
    // Global error handler
    this.app.use(errorHandler)
  }

  async start() {
    try {
      const server = this.app.listen(config.app.port, () => {
        logger.info(`API Gateway started successfully`, {
          port: config.app.port,
          environment: config.app.env,
          nodeVersion: process.version,
          pid: process.pid
        })
        
        console.log(`
🚀 API Gateway is running!
📍 Server: http://localhost:${config.app.port}
📚 API Docs: http://localhost:${config.app.port}/api-docs
🏥 Health Check: http://localhost:${config.app.port}/health
📦 Environment: ${config.app.env}

🔗 Service Endpoints:
   📦 Warehouse: http://localhost:${config.app.port}/api/warehouse
   👥 Users: http://localhost:${config.app.port}/api/users
   📋 Orders: http://localhost:${config.app.port}/api/orders
   🛍️ Products: http://localhost:${config.app.port}/api/products
        `)
      })

      // Graceful shutdown
      const gracefulShutdown = async (signal) => {
        logger.info(`Received ${signal}, starting graceful shutdown...`)
        
        // Stop health monitoring
        serviceRegistry.stopHealthMonitoring()
        
        server.close(() => {
          logger.info('HTTP server closed')
          process.exit(0)
        })
      }

      process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
      process.on('SIGINT', () => gracefulShutdown('SIGINT'))

      return server
    } catch (error) {
      logger.error('Failed to start API Gateway:', error)
      process.exit(1)
    }
  }
}

module.exports = ApiGateway
