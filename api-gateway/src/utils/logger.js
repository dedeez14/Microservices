const winston = require('winston')
const config = require('../config')

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
)

// Create logger instance
const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  defaultMeta: { 
    service: 'api-gateway',
    version: config.app.version
  },
  transports: [
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: config.logging.maxsize,
      maxFiles: config.logging.maxFiles
    }),
    
    // Write all logs to combined log file
    new winston.transports.File({
      filename: config.logging.file,
      maxsize: config.logging.maxsize,
      maxFiles: config.logging.maxFiles
    })
  ]
})

// Add console transport for non-production environments
if (config.app.env !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple(),
      winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
        let metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
        return `${timestamp} [${service}] ${level}: ${message} ${metaStr}`
      })
    )
  }))
}

module.exports = logger
