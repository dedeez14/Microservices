/**
 * Server entry point for Warehouse Service
 * This file is responsible for starting the warehouse microservice
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
const App = require('./app')

async function bootstrap() {
  try {
    const app = new App()
    await app.start()
  } catch (error) {
    console.error('Failed to bootstrap warehouse service:', error)
    process.exit(1)
  }
}

bootstrap()
