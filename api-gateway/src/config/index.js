require('dotenv').config()

const config = {
  app: {
    name: 'API Gateway',
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  },
  
  services: {
    warehouse: {
      name: 'warehouse-service',
      url: process.env.WAREHOUSE_SERVICE_URL || 'http://localhost:3001',
      timeout: parseInt(process.env.SERVICE_TIMEOUT) || 30000,
      retries: parseInt(process.env.SERVICE_RETRIES) || 3
    },
    user: {
      name: 'user-service',
      url: process.env.USER_SERVICE_URL || 'http://localhost:3002',
      timeout: parseInt(process.env.SERVICE_TIMEOUT) || 30000,
      retries: parseInt(process.env.SERVICE_RETRIES) || 3
    },
    order: {
      name: 'order-service',
      url: process.env.ORDER_SERVICE_URL || 'http://localhost:3003',
      timeout: parseInt(process.env.SERVICE_TIMEOUT) || 30000,
      retries: parseInt(process.env.SERVICE_RETRIES) || 3
    },
    product: {
      name: 'product-service',
      url: process.env.PRODUCT_SERVICE_URL || 'http://localhost:3004',
      timeout: parseInt(process.env.SERVICE_TIMEOUT) || 30000,
      retries: parseInt(process.env.SERVICE_RETRIES) || 3
    }
  },

  auth: {
    jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    jwtExpire: process.env.JWT_EXPIRE || '7d',
    refreshExpire: process.env.JWT_REFRESH_EXPIRE || '30d'
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || '',
    db: parseInt(process.env.REDIS_DB) || 0,
    ttl: parseInt(process.env.CACHE_TTL) || 3600 // 1 hour
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX) || (process.env.NODE_ENV === 'production' ? 100 : 1000), // 1000 requests per window in dev, 100 in prod
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  },

  cors: {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/api-gateway.log',
    maxsize: parseInt(process.env.LOG_MAX_SIZE) || 5242880, // 5MB
    maxFiles: parseInt(process.env.LOG_MAX_FILES) || 5
  },

  consul: {
    host: process.env.CONSUL_HOST || 'localhost',
    port: parseInt(process.env.CONSUL_PORT) || 8500,
    secure: process.env.CONSUL_SECURE === 'true'
  },

  healthCheck: {
    interval: parseInt(process.env.HEALTH_CHECK_INTERVAL) || 30000, // 30 seconds
    timeout: parseInt(process.env.HEALTH_CHECK_TIMEOUT) || 5000 // 5 seconds
  }
}

module.exports = config
