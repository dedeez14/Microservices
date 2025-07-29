/**
 * Service discovery and health monitoring utilities
 */

const config = require('../config')
const logger = require('./logger')

class ServiceRegistry {
  constructor() {
    this.services = new Map()
    this.healthCheckInterval = null
    this.initialize()
  }

  initialize() {
    // Register known services from config
    Object.entries(config.services).forEach(([name, serviceConfig]) => {
      this.registerService(name, serviceConfig)
    })

    // Start health monitoring
    this.startHealthMonitoring()
  }

  registerService(name, serviceConfig) {
    this.services.set(name, {
      ...serviceConfig,
      status: 'unknown',
      lastHealthCheck: null,
      consecutiveFailures: 0
    })
    
    logger.info(`Service registered: ${name}`, { 
      url: serviceConfig.url,
      timeout: serviceConfig.timeout
    })
  }

  getService(name) {
    const service = this.services.get(name)
    if (!service) {
      throw new Error(`Service not found: ${name}`)
    }
    
    if (service.status === 'unhealthy') {
      throw new Error(`Service unavailable: ${name}`)
    }
    
    return service
  }

  getAllServices() {
    return Array.from(this.services.entries()).map(([name, service]) => ({
      name,
      ...service
    }))
  }

  async checkServiceHealth(name, service) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), config.healthCheck.timeout)

      const response = await fetch(`${service.url}/api/v1/health`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'API-Gateway-HealthCheck/1.0'
        }
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        service.status = 'healthy'
        service.consecutiveFailures = 0
        service.lastHealthCheck = new Date()
        
        logger.debug(`Health check passed for service: ${name}`)
        return true
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      service.consecutiveFailures++
      service.lastHealthCheck = new Date()
      
      // Mark as unhealthy after 3 consecutive failures
      if (service.consecutiveFailures >= 3) {
        service.status = 'unhealthy'
        logger.error(`Service marked as unhealthy: ${name}`, {
          error: error.message,
          consecutiveFailures: service.consecutiveFailures
        })
      } else {
        service.status = 'degraded'
        logger.warn(`Health check failed for service: ${name}`, {
          error: error.message,
          consecutiveFailures: service.consecutiveFailures
        })
      }
      
      return false
    }
  }

  async performHealthChecks() {
    const healthCheckPromises = Array.from(this.services.entries()).map(
      ([name, service]) => this.checkServiceHealth(name, service)
    )

    try {
      await Promise.allSettled(healthCheckPromises)
    } catch (error) {
      logger.error('Error during health checks:', error)
    }
  }

  startHealthMonitoring() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
    }

    this.healthCheckInterval = setInterval(() => {
      this.performHealthChecks()
    }, config.healthCheck.interval)

    logger.info('Health monitoring started', {
      interval: config.healthCheck.interval,
      timeout: config.healthCheck.timeout
    })

    // Perform initial health check
    setTimeout(() => this.performHealthChecks(), 5000)
  }

  stopHealthMonitoring() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
      this.healthCheckInterval = null
      logger.info('Health monitoring stopped')
    }
  }

  getHealthStatus() {
    const services = this.getAllServices()
    const healthyServices = services.filter(s => s.status === 'healthy').length
    const totalServices = services.length
    
    const overallStatus = healthyServices === totalServices ? 'healthy' : 
                         healthyServices > 0 ? 'degraded' : 'unhealthy'

    return {
      status: overallStatus,
      services: services.map(service => ({
        name: service.name,
        status: service.status,
        url: service.url,
        lastHealthCheck: service.lastHealthCheck,
        consecutiveFailures: service.consecutiveFailures
      })),
      summary: {
        total: totalServices,
        healthy: healthyServices,
        degraded: services.filter(s => s.status === 'degraded').length,
        unhealthy: services.filter(s => s.status === 'unhealthy').length,
        unknown: services.filter(s => s.status === 'unknown').length
      },
      timestamp: new Date()
    }
  }
}

// Create singleton instance
const serviceRegistry = new ServiceRegistry()

module.exports = serviceRegistry
