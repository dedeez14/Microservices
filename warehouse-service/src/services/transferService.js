const { Transfer, Warehouse, Location, Inventory } = require('../models')
const logger = require('../utils/logger')
const Pagination = require('../utils/pagination')

class TransferService {
  /**
   * Create a new transfer
   */
  async createTransfer(transferData) {
    try {
      logger.info('Creating new transfer', { 
        type: transferData.type,
        itemCount: transferData.items.length
      })
      
      // Validate source and destination warehouses exist
      if (transferData.source.warehouse) {
        const sourceWarehouse = await Warehouse.findById(transferData.source.warehouse)
        if (!sourceWarehouse) {
          throw new Error('Source warehouse not found')
        }
      }
      
      if (transferData.destination.warehouse) {
        const destWarehouse = await Warehouse.findById(transferData.destination.warehouse)
        if (!destWarehouse) {
          throw new Error('Destination warehouse not found')
        }
      }
      
      // Validate locations if specified
      if (transferData.source.location) {
        const sourceLocation = await Location.findById(transferData.source.location)
        if (!sourceLocation) {
          throw new Error('Source location not found')
        }
      }
      
      if (transferData.destination.location) {
        const destLocation = await Location.findById(transferData.destination.location)
        if (!destLocation) {
          throw new Error('Destination location not found')
        }
      }
      
      // For outbound transfers, check inventory availability
      if (['outbound', 'warehouse_to_warehouse', 'internal'].includes(transferData.type)) {
        await this._validateInventoryAvailability(transferData)
      }
      
      const transfer = new Transfer(transferData)
      await transfer.save()
      
      logger.info('Transfer created successfully', { 
        id: transfer._id, 
        transferNumber: transfer.transferNumber 
      })
      
      return await this.getTransferById(transfer._id)
    } catch (error) {
      logger.error('Error creating transfer:', error)
      throw error
    }
  }
  
  /**
   * Get transfer by ID
   */
  async getTransferById(id) {
    try {
      const transfer = await Transfer.findById(id)
        .populate('source.warehouse')
        .populate('source.location')
        .populate('destination.warehouse')
        .populate('destination.location')
      
      if (!transfer) {
        throw new Error('Transfer not found')
      }
      
      return transfer
    } catch (error) {
      logger.error('Error getting transfer by ID:', error)
      throw error
    }
  }
  
  /**
   * Get transfer by transfer number
   */
  async getTransferByNumber(transferNumber) {
    try {
      const transfer = await Transfer.findOne({ transferNumber })
        .populate('source.warehouse')
        .populate('source.location')
        .populate('destination.warehouse')
        .populate('destination.location')
      
      if (!transfer) {
        throw new Error('Transfer not found')
      }
      
      return transfer
    } catch (error) {
      logger.error('Error getting transfer by number:', error)
      throw error
    }
  }
  
  /**
   * Get all transfers with pagination and filtering
   */
  async getTransfers(query = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        sort = '-dates.requested',
        transferNumber,
        type,
        status,
        priority,
        sourceWarehouse,
        destinationWarehouse,
        sku,
        requestedBy,
        dateFrom,
        dateTo,
        overdue
      } = query
      
      // Build filter object
      const filter = {}
      
      if (transferNumber) {
        filter.transferNumber = new RegExp(transferNumber, 'i')
      }
      
      if (type) {
        filter.type = type
      }
      
      if (status) {
        filter.status = status
      }
      
      if (priority) {
        filter.priority = priority
      }
      
      if (sourceWarehouse) {
        filter['source.warehouse'] = sourceWarehouse
      }
      
      if (destinationWarehouse) {
        filter['destination.warehouse'] = destinationWarehouse
      }
      
      if (sku) {
        filter['items.product.sku'] = sku.toUpperCase()
      }
      
      if (requestedBy) {
        filter['personnel.requestedBy.name'] = new RegExp(requestedBy, 'i')
      }
      
      if (dateFrom || dateTo) {
        filter['dates.requested'] = {}
        if (dateFrom) {
          filter['dates.requested'].$gte = new Date(dateFrom)
        }
        if (dateTo) {
          filter['dates.requested'].$lte = new Date(dateTo)
        }
      }
      
      if (overdue === 'true') {
        filter['dates.expectedDelivery'] = { $lt: new Date() }
        filter.status = { $nin: ['completed', 'cancelled'] }
      }
      
      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { [sort.replace('-', '')]: sort.startsWith('-') ? -1 : 1 },
        populate: 'source.warehouse source.location destination.warehouse destination.location'
      }
      
      const result = await Pagination.paginate(Transfer, filter, options)
      
      logger.info('Retrieved transfers', { 
        count: result.data.length,
        total: result.pagination.totalItems 
      })
      
      return result
    } catch (error) {
      logger.error('Error getting transfers:', error)
      throw error
    }
  }
  
  /**
   * Get transfers by warehouse
   */
  async getTransfersByWarehouse(warehouseId, direction = 'both') {
    try {
      const transfers = await Transfer.findByWarehouse(warehouseId, direction)
        .populate('source.warehouse')
        .populate('destination.warehouse')
        .sort({ 'dates.requested': -1 })
      
      return transfers
    } catch (error) {
      logger.error('Error getting transfers by warehouse:', error)
      throw error
    }
  }
  
  /**
   * Get pending transfers
   */
  async getPendingTransfers(warehouseId = null) {
    try {
      let query = Transfer.findPending()
      
      if (warehouseId) {
        query = query.where({
          $or: [
            { 'source.warehouse': warehouseId },
            { 'destination.warehouse': warehouseId }
          ]
        })
      }
      
      const transfers = await query
        .populate('source.warehouse')
        .populate('destination.warehouse')
        .sort({ priority: -1, 'dates.requested': 1 })
      
      return transfers
    } catch (error) {
      logger.error('Error getting pending transfers:', error)
      throw error
    }
  }
  
  /**
   * Get overdue transfers
   */
  async getOverdueTransfers(warehouseId = null) {
    try {
      let query = Transfer.findOverdue()
      
      if (warehouseId) {
        query = query.where({
          $or: [
            { 'source.warehouse': warehouseId },
            { 'destination.warehouse': warehouseId }
          ]
        })
      }
      
      const transfers = await query
        .populate('source.warehouse')
        .populate('destination.warehouse')
        .sort({ 'dates.expectedDelivery': 1 })
      
      return transfers
    } catch (error) {
      logger.error('Error getting overdue transfers:', error)
      throw error
    }
  }
  
  /**
   * Update transfer
   */
  async updateTransfer(id, updateData) {
    try {
      logger.info('Updating transfer', { id })
      
      const transfer = await Transfer.findById(id)
      if (!transfer) {
        throw new Error('Transfer not found')
      }
      
      // Prevent updates to completed or cancelled transfers
      if (['completed', 'cancelled'].includes(transfer.status)) {
        throw new Error('Cannot update completed or cancelled transfer')
      }
      
      Object.assign(transfer, updateData)
      await transfer.save()
      
      logger.info('Transfer updated successfully', { id })
      
      return await this.getTransferById(id)
    } catch (error) {
      logger.error('Error updating transfer:', error)
      throw error
    }
  }
  
  /**
   * Update transfer item
   */
  async updateTransferItem(transferId, itemIndex, updateData) {
    try {
      logger.info('Updating transfer item', { transferId, itemIndex })
      
      const transfer = await Transfer.findById(transferId)
      if (!transfer) {
        throw new Error('Transfer not found')
      }
      
      if (itemIndex < 0 || itemIndex >= transfer.items.length) {
        throw new Error('Invalid item index')
      }
      
      Object.assign(transfer.items[itemIndex], updateData)
      await transfer.save()
      
      logger.info('Transfer item updated successfully', { transferId, itemIndex })
      
      return transfer
    } catch (error) {
      logger.error('Error updating transfer item:', error)
      throw error
    }
  }
  
  /**
   * Approve transfer
   */
  async approveTransfer(id, approvalData) {
    try {
      logger.info('Approving transfer', { id })
      
      const transfer = await Transfer.findById(id)
      if (!transfer) {
        throw new Error('Transfer not found')
      }
      
      await transfer.approve(approvalData.approvedBy)
      
      if (approvalData.notes) {
        transfer.metadata.notes = transfer.metadata.notes 
          ? `${transfer.metadata.notes}\n${approvalData.notes}`
          : approvalData.notes
        await transfer.save()
      }
      
      logger.info('Transfer approved successfully', { id })
      
      return transfer
    } catch (error) {
      logger.error('Error approving transfer:', error)
      throw error
    }
  }
  
  /**
   * Start transfer
   */
  async startTransfer(id, startData) {
    try {
      logger.info('Starting transfer', { id })
      
      const transfer = await Transfer.findById(id)
      if (!transfer) {
        throw new Error('Transfer not found')
      }
      
      await transfer.start(startData.assignedTo)
      
      logger.info('Transfer started successfully', { id })
      
      return transfer
    } catch (error) {
      logger.error('Error starting transfer:', error)
      throw error
    }
  }
  
  /**
   * Complete transfer
   */
  async completeTransfer(id) {
    try {
      logger.info('Completing transfer', { id })
      
      const transfer = await Transfer.findById(id)
      if (!transfer) {
        throw new Error('Transfer not found')
      }
      
      await transfer.complete()
      
      // Update inventory based on transfer type
      await this._updateInventoryFromTransfer(transfer)
      
      logger.info('Transfer completed successfully', { id })
      
      return transfer
    } catch (error) {
      logger.error('Error completing transfer:', error)
      throw error
    }
  }
  
  /**
   * Cancel transfer
   */
  async cancelTransfer(id, cancellationData) {
    try {
      logger.info('Cancelling transfer', { id })
      
      const transfer = await Transfer.findById(id)
      if (!transfer) {
        throw new Error('Transfer not found')
      }
      
      await transfer.cancel(cancellationData.reason)
      
      // Release any reserved inventory
      await this._releaseReservedInventory(transfer)
      
      logger.info('Transfer cancelled successfully', { id })
      
      return transfer
    } catch (error) {
      logger.error('Error cancelling transfer:', error)
      throw error
    }
  }
  
  /**
   * Get transfer statistics
   */
  async getTransferStats(warehouseId = null, dateRange = null) {
    try {
      const matchStage = {}
      
      if (warehouseId) {
        matchStage.$or = [
          { 'source.warehouse': mongoose.Types.ObjectId(warehouseId) },
          { 'destination.warehouse': mongoose.Types.ObjectId(warehouseId) }
        ]
      }
      
      if (dateRange) {
        matchStage['dates.requested'] = {
          $gte: new Date(dateRange.from),
          $lte: new Date(dateRange.to)
        }
      }
      
      const stats = await Transfer.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalTransfers: { $sum: 1 },
            pendingTransfers: {
              $sum: {
                $cond: [
                  { $in: ['$status', ['draft', 'approved', 'in_progress']] },
                  1,
                  0
                ]
              }
            },
            completedTransfers: {
              $sum: {
                $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
              }
            },
            cancelledTransfers: {
              $sum: {
                $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0]
              }
            },
            overdueTransfers: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $lt: ['$dates.expectedDelivery', new Date()] },
                      { $nin: ['$status', ['completed', 'cancelled']] }
                    ]
                  },
                  1,
                  0
                ]
              }
            },
            avgCompletionTime: {
              $avg: {
                $cond: [
                  { $eq: ['$status', 'completed'] },
                  {
                    $divide: [
                      { $subtract: ['$dates.completed', '$dates.requested'] },
                      1000 * 60 * 60 * 24 // Convert to days
                    ]
                  },
                  null
                ]
              }
            }
          }
        }
      ])
      
      const result = stats[0] || {
        totalTransfers: 0,
        pendingTransfers: 0,
        completedTransfers: 0,
        cancelledTransfers: 0,
        overdueTransfers: 0,
        avgCompletionTime: 0
      }
      
      logger.info('Generated transfer statistics', { warehouseId })
      
      return result
    } catch (error) {
      logger.error('Error getting transfer statistics:', error)
      throw error
    }
  }
  
  /**
   * Private method to validate inventory availability
   */
  async _validateInventoryAvailability(transferData) {
    if (!transferData.source.warehouse) return
    
    for (const item of transferData.items) {
      const inventory = await Inventory.findOne({
        warehouse: transferData.source.warehouse,
        'product.sku': item.product.sku,
        'batch.number': item.batch?.number || { $exists: false }
      })
      
      if (!inventory) {
        throw new Error(`Inventory not found for SKU: ${item.product.sku}`)
      }
      
      if (inventory.availableForSale < item.quantity.requested) {
        throw new Error(
          `Insufficient inventory for SKU: ${item.product.sku}. ` +
          `Available: ${inventory.availableForSale}, Requested: ${item.quantity.requested}`
        )
      }
    }
  }
  
  /**
   * Private method to update inventory from completed transfer
   */
  async _updateInventoryFromTransfer(transfer) {
    // This is a simplified implementation
    // In a real system, this would handle complex inventory movements
    
    for (const item of transfer.items) {
      if (item.status === 'received') {
        // Handle different transfer types
        switch (transfer.type) {
          case 'inbound':
            // Increase inventory at destination
            await this._increaseInventory(
              transfer.destination.warehouse,
              transfer.destination.location,
              item
            )
            break
            
          case 'outbound':
            // Decrease inventory at source
            await this._decreaseInventory(
              transfer.source.warehouse,
              transfer.source.location,
              item
            )
            break
            
          case 'internal':
            // Move inventory within warehouse
            await this._moveInventory(
              transfer.source.location,
              transfer.destination.location,
              item
            )
            break
            
          case 'warehouse_to_warehouse':
            // Move between warehouses
            await this._decreaseInventory(
              transfer.source.warehouse,
              transfer.source.location,
              item
            )
            await this._increaseInventory(
              transfer.destination.warehouse,
              transfer.destination.location,
              item
            )
            break
        }
      }
    }
  }
  
  /**
   * Private method to release reserved inventory
   */
  async _releaseReservedInventory(transfer) {
    // Release any inventory that was reserved for this transfer
    // This would be implemented based on business logic
  }
  
  /**
   * Private method to increase inventory
   */
  async _increaseInventory(warehouseId, locationId, item) {
    // Find or create inventory record
    // Increase quantity
    // This is a placeholder implementation
  }
  
  /**
   * Private method to decrease inventory
   */
  async _decreaseInventory(warehouseId, locationId, item) {
    // Find inventory record
    // Decrease quantity
    // This is a placeholder implementation
  }
  
  /**
   * Private method to move inventory
   */
  async _moveInventory(sourceLocationId, destLocationId, item) {
    // Update inventory location
    // This is a placeholder implementation
  }
}

module.exports = new TransferService()
