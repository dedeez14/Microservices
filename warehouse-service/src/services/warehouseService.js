const { Warehouse } = require('../models')
const logger = require('../utils/logger')
const Pagination = require('../utils/pagination')

class WarehouseService {
  /**
   * Create a new warehouse
   */
  async createWarehouse(warehouseData) {
    try {
      logger.info('Creating new warehouse', { code: warehouseData.code })
      
      // Check if warehouse code already exists
      const existingWarehouse = await Warehouse.findByCode(warehouseData.code)
      if (existingWarehouse) {
        throw new Error(`Warehouse with code '${warehouseData.code}' already exists`)
      }
      
      const warehouse = new Warehouse(warehouseData)
      await warehouse.save()
      
      logger.info('Warehouse created successfully', { 
        id: warehouse._id, 
        code: warehouse.code 
      })
      
      return warehouse
    } catch (error) {
      logger.error('Error creating warehouse:', error)
      throw error
    }
  }
  
  /**
   * Get warehouse by ID
   */
  async getWarehouseById(id) {
    try {
      const warehouse = await Warehouse.findById(id)
      if (!warehouse) {
        throw new Error('Warehouse not found')
      }
      return warehouse
    } catch (error) {
      logger.error('Error getting warehouse by ID:', error)
      throw error
    }
  }
  
  /**
   * Get warehouse by code
   */
  async getWarehouseByCode(code) {
    try {
      const warehouse = await Warehouse.findByCode(code)
      if (!warehouse) {
        throw new Error('Warehouse not found')
      }
      return warehouse
    } catch (error) {
      logger.error('Error getting warehouse by code:', error)
      throw error
    }
  }
  
  /**
   * Get all warehouses with pagination and filtering
   */
  async getWarehouses(query = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        sort = 'name',
        code,
        name,
        type,
        status,
        city,
        state
      } = query
      
      // Build filter object
      const filter = {}
      
      if (code) {
        filter.code = new RegExp(code, 'i')
      }
      
      if (name) {
        filter.name = new RegExp(name, 'i')
      }
      
      if (type) {
        filter.type = type
      }
      
      if (status) {
        filter.status = status
      }
      
      if (city) {
        filter['location.city'] = new RegExp(city, 'i')
      }
      
      if (state) {
        filter['location.state'] = new RegExp(state, 'i')
      }
      
      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { [sort]: 1 }
      }
      
      const result = await Pagination.paginate(Warehouse, filter, options)
      
      logger.info('Retrieved warehouses', { 
        count: result.data.length,
        total: result.pagination.totalItems 
      })
      
      return result
    } catch (error) {
      logger.error('Error getting warehouses:', error)
      throw error
    }
  }
  
  /**
   * Update warehouse
   */
  async updateWarehouse(id, updateData) {
    try {
      logger.info('Updating warehouse', { id })
      
      const warehouse = await Warehouse.findById(id)
      if (!warehouse) {
        throw new Error('Warehouse not found')
      }
      
      Object.assign(warehouse, updateData)
      await warehouse.save()
      
      logger.info('Warehouse updated successfully', { id })
      
      return warehouse
    } catch (error) {
      logger.error('Error updating warehouse:', error)
      throw error
    }
  }
  
  /**
   * Delete warehouse
   */
  async deleteWarehouse(id) {
    try {
      logger.info('Deleting warehouse', { id })
      
      const warehouse = await Warehouse.findById(id)
      if (!warehouse) {
        throw new Error('Warehouse not found')
      }
      
      // Check if warehouse has any active inventory or locations
      // This would involve checking related collections
      // For now, we'll just delete the warehouse
      
      await Warehouse.findByIdAndDelete(id)
      
      logger.info('Warehouse deleted successfully', { id })
      
      return true
    } catch (error) {
      logger.error('Error deleting warehouse:', error)
      throw error
    }
  }
  
  /**
   * Get active warehouses
   */
  async getActiveWarehouses() {
    try {
      const warehouses = await Warehouse.findActive()
      return warehouses
    } catch (error) {
      logger.error('Error getting active warehouses:', error)
      throw error
    }
  }
  
  /**
   * Get warehouses by location
   */
  async getWarehousesByLocation(city, state) {
    try {
      const warehouses = await Warehouse.findByLocation(city, state)
      return warehouses
    } catch (error) {
      logger.error('Error getting warehouses by location:', error)
      throw error
    }
  }
  
  /**
   * Get warehouse statistics
   */
  async getWarehouseStats(id) {
    try {
      const warehouse = await this.getWarehouseById(id)
      
      // This would calculate stats from related collections
      // For now, we'll return basic stats
      const stats = {
        totalArea: warehouse.capacity.totalArea,
        usableArea: warehouse.capacity.usableArea,
        utilizationPercentage: warehouse.utilizationPercentage,
        totalLocations: 0, // Would be calculated from Location collection
        totalInventory: 0, // Would be calculated from Inventory collection
        totalValue: 0, // Would be calculated from Inventory collection
        lowStockItems: 0, // Would be calculated from Inventory collection
        expiringSoonItems: 0 // Would be calculated from Inventory collection
      }
      
      logger.info('Retrieved warehouse statistics', { id })
      
      return stats
    } catch (error) {
      logger.error('Error getting warehouse statistics:', error)
      throw error
    }
  }
  
  /**
   * Check if warehouse is operational
   */
  async isWarehouseOperational(id) {
    try {
      const warehouse = await this.getWarehouseById(id)
      return warehouse.isOperational()
    } catch (error) {
      logger.error('Error checking warehouse operational status:', error)
      throw error
    }
  }
  
  /**
   * Check if warehouse is open today
   */
  async isWarehouseOpenToday(id) {
    try {
      const warehouse = await this.getWarehouseById(id)
      return warehouse.isOpenToday()
    } catch (error) {
      logger.error('Error checking warehouse open status:', error)
      throw error
    }
  }
}

module.exports = new WarehouseService()
