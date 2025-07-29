const mongoose = require('mongoose')
const config = require('./index')
const logger = require('../utils/logger')

class Database {
  constructor() {
    this.connection = null
  }

  async connect() {
    try {
      this.connection = await mongoose.connect(config.database.uri, config.database.options)
      
      logger.info('MongoDB connected successfully', {
        host: this.connection.connection.host,
        port: this.connection.connection.port,
        database: this.connection.connection.name
      })

      // Handle connection events
      mongoose.connection.on('error', (error) => {
        logger.error('MongoDB connection error:', error)
      })

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected')
      })

      mongoose.connection.on('reconnected', () => {
        logger.info('MongoDB reconnected')
      })

      return this.connection
    } catch (error) {
      logger.error('MongoDB connection failed:', error)
      throw error
    }
  }

  async disconnect() {
    try {
      if (this.connection) {
        await mongoose.disconnect()
        logger.info('MongoDB disconnected successfully')
      }
    } catch (error) {
      logger.error('Error disconnecting from MongoDB:', error)
      throw error
    }
  }

  isConnected() {
    return mongoose.connection.readyState === 1
  }
}

module.exports = new Database()
