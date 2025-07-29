const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const compression = require('compression')
const rateLimit = require('express-rate-limit')
const swaggerJsdoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')

const config = require('./config')
const database = require('./config/database')
const logger = require('./utils/logger')
const routes = require('./routes')
const { errorHandler, notFoundHandler } = require('./middleware/error')

class App {
  constructor() {
    this.app = express()
    this.setupMiddleware()
    this.setupSwagger()
    this.setupRoutes()
    this.setupErrorHandling()
  }

  setupMiddleware() {
    // Security middleware
    this.app.use(helmet())
    
    // CORS
    this.app.use(cors({
      origin: process.env.NODE_ENV === 'production' 
        ? process.env.CORS_ORIGIN?.split(',') || false
        : true,
      credentials: true
    }))

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
      legacyHeaders: false
    })
    
    this.app.use('/api/', limiter)

    // Request ID and timestamp
    this.app.use((req, res, next) => {
      req.requestId = Math.random().toString(36).substring(2, 15)
      req.timestamp = new Date().toISOString()
      
      // Add request ID to response headers
      res.setHeader('X-Request-ID', req.requestId)
      
      next()
    })
  }

  setupSwagger() {
    const options = {
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'Warehouse Service API',
          version: '1.0.0',
          description: 'Warehouse management microservice for ERP system',
          contact: {
            name: 'API Support',
            email: 'support@example.com'
          }
        },
        servers: [
          {
            url: `http://localhost:${config.app.port}`,
            description: 'Development server'
          },
          {
            url: '/api/v1',
            description: 'API base path'
          }
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT'
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
      customSiteTitle: 'Warehouse Service API Documentation'
    }))
  }

  setupRoutes() {
    // Health check endpoint (compatibility)
    this.app.get('/health', (req, res) => {
      res.json({
        success: true,
        message: 'Warehouse service is healthy',
        data: {
          service: 'warehouse-service',
          version: '1.0.0',
          timestamp: new Date().toISOString(),
          uptime: process.uptime()
        }
      })
    })

    // Mount API routes
    this.app.use(config.app.apiPrefix, routes)

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        success: true,
        message: 'Warehouse Service API',
        data: {
          service: 'warehouse-service',
          version: '1.0.0',
          environment: config.app.env,
          timestamp: new Date().toISOString(),
          endpoints: {
            health: `${config.app.apiPrefix}/health`,
            docs: '/api-docs',
            warehouses: `${config.app.apiPrefix}/warehouses`,
            locations: `${config.app.apiPrefix}/locations`,
            inventory: `${config.app.apiPrefix}/inventory`,
            transfers: `${config.app.apiPrefix}/transfers`
          }
        }
      })
    })
  }

  setupErrorHandling() {
    // 404 handler
    this.app.use(notFoundHandler)
    
    // Global error handler
    this.app.use(errorHandler)
  }

  async start() {
    try {
      // Connect to database
      await database.connect()
      
      // Start server
      const server = this.app.listen(config.app.port, () => {
        logger.info(`Warehouse service started successfully`, {
          port: config.app.port,
          environment: config.app.env,
          nodeVersion: process.version,
          pid: process.pid
        })
        
        console.log(`
🚀 Warehouse Service is running!
📍 Server: http://localhost:${config.app.port}
📚 API Docs: http://localhost:${config.app.port}/api-docs
🏥 Health Check: http://localhost:${config.app.port}${config.app.apiPrefix}/health
📦 Environment: ${config.app.env}
        `)
      })

      // Graceful shutdown
      const gracefulShutdown = async (signal) => {
        logger.info(`Received ${signal}, starting graceful shutdown...`)
        
        server.close(async () => {
          logger.info('HTTP server closed')
          
          try {
            await database.disconnect()
            logger.info('Database disconnected')
            process.exit(0)
          } catch (error) {
            logger.error('Error during graceful shutdown:', error)
            process.exit(1)
          }
        })
      }

      process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
      process.on('SIGINT', () => gracefulShutdown('SIGINT'))

      return server
    } catch (error) {
      logger.error('Failed to start warehouse service:', error)
      process.exit(1)
    }
  }
}

// Start the application if this file is run directly
if (require.main === module) {
  const app = new App()
  app.start()
}

module.exports = App
