const dotenv = require('dotenv')

dotenv.config()

module.exports = {
  app: {
    port: process.env.PORT || 3001,
    env: process.env.NODE_ENV || 'development',
    apiVersion: process.env.API_VERSION || 'v1',
    apiPrefix: process.env.API_PREFIX || '/api/v1'
  },
  
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/warehouse_db',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    }
  },
  
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    options: {
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3
    }
  },
  
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://admin:admin123@localhost:5672',
    exchanges: {
      warehouse: 'warehouse.exchange',
      inventory: 'inventory.exchange'
    },
    queues: {
      stockUpdates: 'stock.updates',
      lowStock: 'low.stock.alerts',
      transfers: 'transfers'
    }
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },
  
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.NODE_ENV === 'production' ? 'json' : 'simple'
  },
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  },
  
  pagination: {
    defaultLimit: 20,
    maxLimit: 100
  }
}
