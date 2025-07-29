const mongoose = require('mongoose')
const logger = require('../utils/logger')

class Database {
  constructor() {
    this.connection = null
  }

  async connect() {
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/user_service_db'
      
      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4
      }

      this.connection = await mongoose.connect(mongoUri, options)
      
      // Connection event handlers
      mongoose.connection.on('connected', () => {
        logger.info('MongoDB connected successfully')
      })

      mongoose.connection.on('error', (err) => {
        logger.error('MongoDB connection error:', err)
      })

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected')
      })

      // Handle process termination
      process.on('SIGINT', this.disconnect.bind(this))
      process.on('SIGTERM', this.disconnect.bind(this))

      logger.info(`Connected to MongoDB: ${mongoUri}`)
      return this.connection

    } catch (error) {
      logger.error('Failed to connect to MongoDB:', error)
      process.exit(1)
    }
  }

  async disconnect() {
    try {
      await mongoose.connection.close()
      logger.info('MongoDB connection closed')
      process.exit(0)
    } catch (error) {
      logger.error('Error closing MongoDB connection:', error)
      process.exit(1)
    }
  }

  async seedDatabase() {
    try {
      const Role = require('../models/Role')
      
      // Seed default roles
      await Role.seedDefaultRoles()
      logger.info('Database seeded successfully')
      
    } catch (error) {
      logger.error('Error seeding database:', error)
    }
  }

  isConnected() {
    return mongoose.connection.readyState === 1
  }

  getConnectionStatus() {
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting']
    return states[mongoose.connection.readyState]
  }
}

module.exports = new Database()
