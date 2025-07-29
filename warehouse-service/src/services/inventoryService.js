const { Inventory, Warehouse, Location } = require('../models')
const logger = require('../utils/logger')
const Pagination = require('../utils/pagination')

class InventoryService {
  /**
   * Create a new inventory item
   */
  async createInventoryItem(inventoryData) {
    try {
      logger.info('Creating new inventory item', { 
        warehouse: inventoryData.warehouse,
        sku: inventoryData.product.sku,
        location: inventoryData.location
      })
      
      // Validate warehouse exists
      const warehouse = await Warehouse.findById(inventoryData.warehouse)
      if (!warehouse) {
        throw new Error('Warehouse not found')
      }
      
      // Validate location exists and belongs to warehouse
      const location = await Location.findById(inventoryData.location)
      if (!location) {
        throw new Error('Location not found')
      }
      
      if (location.warehouse.toString() !== inventoryData.warehouse.toString()) {
        throw new Error('Location does not belong to the specified warehouse')
      }
      
      // Check if inventory item already exists for this SKU and batch in this location
      const existingInventory = await Inventory.findOne({
        warehouse: inventoryData.warehouse,
        location: inventoryData.location,
        'product.sku': inventoryData.product.sku,
        'batch.number': inventoryData.batch?.number || null
      })
      
      if (existingInventory) {
        throw new Error('Inventory item already exists for this SKU and batch in this location')
      }
      
      const inventory = new Inventory(inventoryData)
      await inventory.save()
      
      logger.info('Inventory item created successfully', { 
        id: inventory._id, 
        sku: inventory.product.sku 
      })
      
      return await this.getInventoryById(inventory._id)
    } catch (error) {
      logger.error('Error creating inventory item:', error)
      throw error
    }
  }
  
  /**
   * Get inventory item by ID
   */
  async getInventoryById(id) {
    try {
      const inventory = await Inventory.findById(id)
        .populate('warehouse')
        .populate('location')
      
      if (!inventory) {
        throw new Error('Inventory item not found')
      }
      
      return inventory
    } catch (error) {
      logger.error('Error getting inventory by ID:', error)
      throw error
    }
  }
  
  /**
   * Get all inventory items with pagination and filtering
   */
  async getInventory(query = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        sort = 'product.name',
        warehouse,
        location,
        sku,
        name,
        category,
        status,
        stockStatus,
        expiringInDays
      } = query
      
      // Build filter object
      const filter = {}
      
      if (warehouse) {
        filter.warehouse = warehouse
      }
      
      if (location) {
        filter.location = location
      }
      
      if (sku) {
        filter['product.sku'] = new RegExp(sku, 'i')
      }
      
      if (name) {
        filter['product.name'] = new RegExp(name, 'i')
      }
      
      if (category) {
        filter['product.category'] = new RegExp(category, 'i')
      }
      
      if (status) {
        filter.status = status
      }
      
      // Handle expiring items filter
      if (expiringInDays) {
        const futureDate = new Date()
        futureDate.setDate(futureDate.getDate() + parseInt(expiringInDays))
        
        filter['batch.expiryDate'] = {
          $exists: true,
          $lte: futureDate
        }
      }
      
      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { [sort]: 1 },
        populate: 'warehouse location'
      }
      
      let result = await Pagination.paginate(Inventory, filter, options)
      
      // Apply stock status filter if specified (virtual field)
      if (stockStatus) {
        result.data = result.data.filter(item => item.stockStatus === stockStatus)
        result.pagination.totalItems = result.data.length
      }
      
      logger.info('Retrieved inventory items', { 
        count: result.data.length,
        total: result.pagination.totalItems 
      })
      
      return result
    } catch (error) {
      logger.error('Error getting inventory:', error)
      throw error
    }
  }
  
  /**
   * Get inventory by warehouse
   */
  async getInventoryByWarehouse(warehouseId, options = {}) {
    try {
      const inventory = await Inventory.findByWarehouse(warehouseId)
        .sort(options.sort || { 'product.name': 1 })
        .limit(options.limit || 0)
      
      return inventory
    } catch (error) {
      logger.error('Error getting inventory by warehouse:', error)
      throw error
    }
  }
  
  /**
   * Get inventory by SKU
   */
  async getInventoryBySku(sku, warehouseId = null) {
    try {
      let inventory = await Inventory.findBySku(sku)
        .populate('warehouse')
        .populate('location')
      
      if (warehouseId) {
        inventory = inventory.filter(item => 
          item.warehouse._id.toString() === warehouseId.toString()
        )
      }
      
      return inventory
    } catch (error) {
      logger.error('Error getting inventory by SKU:', error)
      throw error
    }
  }
  
  /**
   * Get low stock items
   */
  async getLowStockItems(warehouseId = null) {
    try {
      const lowStockItems = await Inventory.findLowStock(warehouseId)
      
      logger.info('Retrieved low stock items', { count: lowStockItems.length })
      
      return lowStockItems
    } catch (error) {
      logger.error('Error getting low stock items:', error)
      throw error
    }
  }
  
  /**
   * Get expiring items
   */
  async getExpiringItems(days = 30, warehouseId = null) {
    try {
      const expiringItems = await Inventory.findExpiringSoon(days, warehouseId)
        .populate('warehouse')
        .populate('location')
      
      logger.info('Retrieved expiring items', { 
        count: expiringItems.length,
        days 
      })
      
      return expiringItems
    } catch (error) {
      logger.error('Error getting expiring items:', error)
      throw error
    }
  }
  
  /**
   * Update inventory item
   */
  async updateInventoryItem(id, updateData) {
    try {
      logger.info('Updating inventory item', { id })
      
      const inventory = await Inventory.findById(id)
      if (!inventory) {
        throw new Error('Inventory item not found')
      }
      
      // Validate location if being updated
      if (updateData.location) {
        const location = await Location.findById(updateData.location)
        if (!location) {
          throw new Error('Location not found')
        }
        
        if (location.warehouse.toString() !== inventory.warehouse.toString()) {
          throw new Error('Location does not belong to the same warehouse')
        }
      }
      
      Object.assign(inventory, updateData)
      await inventory.save()
      
      logger.info('Inventory item updated successfully', { id })
      
      return await this.getInventoryById(id)
    } catch (error) {
      logger.error('Error updating inventory item:', error)
      throw error
    }
  }
  
  /**
   * Delete inventory item
   */
  async deleteInventoryItem(id) {
    try {
      logger.info('Deleting inventory item', { id })
      
      const inventory = await Inventory.findById(id)
      if (!inventory) {
        throw new Error('Inventory item not found')
      }
      
      // Check if item has reserved or committed quantities
      if (inventory.quantity.reserved > 0 || inventory.quantity.committed > 0) {
        throw new Error('Cannot delete inventory item with reserved or committed quantities')
      }
      
      await Inventory.findByIdAndDelete(id)
      
      logger.info('Inventory item deleted successfully', { id })
      
      return true
    } catch (error) {
      logger.error('Error deleting inventory item:', error)
      throw error
    }
  }
  
  /**
   * Adjust inventory quantity
   */
  async adjustQuantity(id, adjustmentData) {
    try {
      const { quantity, reason, reference, adjustedBy } = adjustmentData
      
      logger.info('Adjusting inventory quantity', { 
        id, 
        quantity, 
        reason 
      })
      
      const inventory = await Inventory.findById(id)
      if (!inventory) {
        throw new Error('Inventory item not found')
      }
      
      const previousQuantity = inventory.quantity.available
      inventory.quantity.available = Math.max(0, inventory.quantity.available + quantity)
      
      // Update last movement
      inventory.lastMovement = {
        type: 'adjustment',
        date: new Date(),
        quantity: quantity,
        reference: reference || `Adjustment: ${reason}`
      }
      
      // Add to notes
      const adjustmentNote = `Quantity adjusted by ${adjustedBy.name} on ${new Date().toISOString()}. ` +
        `Previous: ${previousQuantity}, Change: ${quantity}, New: ${inventory.quantity.available}. ` +
        `Reason: ${reason}`
      
      inventory.metadata.notes = inventory.metadata.notes 
        ? `${inventory.metadata.notes}\n${adjustmentNote}`
        : adjustmentNote
      
      await inventory.save()
      
      logger.info('Inventory quantity adjusted successfully', { 
        id,
        previousQuantity,
        newQuantity: inventory.quantity.available
      })
      
      return inventory
    } catch (error) {
      logger.error('Error adjusting inventory quantity:', error)
      throw error
    }
  }
  
  /**
   * Reserve inventory
   */
  async reserveInventory(id, reservationData) {
    try {
      const { quantity, reference, reservedBy } = reservationData
      
      logger.info('Reserving inventory', { id, quantity })
      
      const inventory = await Inventory.findById(id)
      if (!inventory) {
        throw new Error('Inventory item not found')
      }
      
      if (!inventory.canReserve(quantity)) {
        throw new Error(`Insufficient available quantity for reservation. Available: ${inventory.availableForSale}`)
      }
      
      await inventory.reserve(quantity)
      
      // Update last movement
      inventory.lastMovement = {
        type: 'reservation',
        date: new Date(),
        quantity: quantity,
        reference: reference || `Reserved by ${reservedBy.name}`
      }
      
      await inventory.save()
      
      logger.info('Inventory reserved successfully', { id, quantity })
      
      return inventory
    } catch (error) {
      logger.error('Error reserving inventory:', error)
      throw error
    }
  }
  
  /**
   * Release reservation
   */
  async releaseReservation(id, releaseData) {
    try {
      const { quantity, reference } = releaseData
      
      logger.info('Releasing inventory reservation', { id, quantity })
      
      const inventory = await Inventory.findById(id)
      if (!inventory) {
        throw new Error('Inventory item not found')
      }
      
      await inventory.releaseReservation(quantity)
      
      // Update last movement
      inventory.lastMovement = {
        type: 'release_reservation',
        date: new Date(),
        quantity: quantity,
        reference: reference || 'Reservation released'
      }
      
      await inventory.save()
      
      logger.info('Inventory reservation released successfully', { id, quantity })
      
      return inventory
    } catch (error) {
      logger.error('Error releasing inventory reservation:', error)
      throw error
    }
  }
  
  /**
   * Get inventory summary for a warehouse
   */
  async getWarehouseInventorySummary(warehouseId) {
    try {
      const summary = await Inventory.aggregate([
        { $match: { warehouse: mongoose.Types.ObjectId(warehouseId) } },
        {
          $group: {
            _id: null,
            totalItems: { $sum: 1 },
            totalQuantity: { $sum: '$quantity.available' },
            totalValue: { 
              $sum: { 
                $multiply: ['$quantity.available', '$cost.unitCost'] 
              } 
            },
            categories: { $addToSet: '$product.category' },
            lowStockItems: {
              $sum: {
                $cond: [
                  { $lte: ['$quantity.available', '$thresholds.reorderPoint'] },
                  1,
                  0
                ]
              }
            }
          }
        }
      ])
      
      const result = summary[0] || {
        totalItems: 0,
        totalQuantity: 0,
        totalValue: 0,
        categories: [],
        lowStockItems: 0
      }
      
      logger.info('Generated warehouse inventory summary', { warehouseId })
      
      return result
    } catch (error) {
      logger.error('Error getting warehouse inventory summary:', error)
      throw error
    }
  }
  
  /**
   * Perform cycle count
   */
  async performCycleCount(id, countData) {
    try {
      const { countedQuantity, countedBy, notes } = countData
      
      logger.info('Performing cycle count', { id, countedQuantity })
      
      const inventory = await Inventory.findById(id)
      if (!inventory) {
        throw new Error('Inventory item not found')
      }
      
      const variance = countedQuantity - inventory.quantity.available
      
      // Update cycle count metadata
      inventory.metadata.lastCycleCount = {
        date: new Date(),
        countedBy: countedBy,
        variance: variance
      }
      
      // If there's a variance, adjust the quantity
      if (variance !== 0) {
        inventory.quantity.available = countedQuantity
        
        // Update last movement
        inventory.lastMovement = {
          type: 'cycle_count',
          date: new Date(),
          quantity: variance,
          reference: `Cycle count adjustment. Variance: ${variance}`
        }
        
        // Add notes
        const countNote = `Cycle count performed by ${countedBy} on ${new Date().toISOString()}. ` +
          `Variance: ${variance}. ${notes || ''}`
        
        inventory.metadata.notes = inventory.metadata.notes 
          ? `${inventory.metadata.notes}\n${countNote}`
          : countNote
      }
      
      await inventory.save()
      
      logger.info('Cycle count completed', { id, variance })
      
      return { inventory, variance }
    } catch (error) {
      logger.error('Error performing cycle count:', error)
      throw error
    }
  }
}

module.exports = new InventoryService()
