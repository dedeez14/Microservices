/**
 * Server entry point for API Gateway
 */

// Load environment variables first
require('dotenv').config()

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

// Start the application
const ApiGateway = require('./app')

async function bootstrap() {
  try {
    const gateway = new ApiGateway()
    await gateway.start()
  } catch (error) {
    console.error('Failed to bootstrap API Gateway:', error)
    process.exit(1)
  }
}

bootstrap()
