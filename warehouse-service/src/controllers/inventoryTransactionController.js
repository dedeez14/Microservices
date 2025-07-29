const InventoryTransaction = require('../models/inventoryTransaction')
const Inventory = require('../models/Inventory')
const Warehouse = require('../models/Warehouse')
const Location = require('../models/Location')
const logger = require('../utils/logger')

class InventoryTransactionController {
  // Get all inventory transactions with filtering and pagination
  async getTransactions(req, res) {
    try {
      const page = parseInt(req.query.page) || 1
      const limit = Math.min(parseInt(req.query.limit) || 20, 100)
      const skip = (page - 1) * limit
      
      // Build filter query
      const filter = {}
      
      if (req.query.warehouse) filter.warehouse = req.query.warehouse
      if (req.query.location) filter.location = req.query.location
      if (req.query.type) filter.type = req.query.type
      if (req.query.status) filter.status = req.query.status
      if (req.query.sku) filter['product.sku'] = req.query.sku.toUpperCase()
      
      // Date range filter
      if (req.query.startDate || req.query.endDate) {
        filter.transactionDate = {}
        if (req.query.startDate) {
          filter.transactionDate.$gte = new Date(req.query.startDate)
        }
        if (req.query.endDate) {
          filter.transactionDate.$lte = new Date(req.query.endDate)
        }
      }
      
      // Execute query with population
      const [transactions, totalCount] = await Promise.all([
        InventoryTransaction.find(filter)
          .populate('warehouse', 'name code')
          .populate('location', 'code name zone aisle')
          .populate('inventory', 'product')
          .sort({ transactionDate: -1, createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        InventoryTransaction.countDocuments(filter)
      ])
      
      // Calculate pagination info
      const totalPages = Math.ceil(totalCount / limit)
      const hasNextPage = page < totalPages
      const hasPrevPage = page > 1
      
      res.status(200).json({
        success: true,
        message: 'Inventory transactions retrieved successfully',
        data: transactions,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: totalCount,
          itemsPerPage: limit,
          hasNextPage,
          hasPrevPage,
          nextPage: hasNextPage ? page + 1 : null,
          prevPage: hasPrevPage ? page - 1 : null
        },
        timestamp: new Date().toISOString()
      })
      
    } catch (error) {
      logger.error('Error retrieving inventory transactions:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve inventory transactions',
        error: error.message,
        timestamp: new Date().toISOString()
      })
    }
  }
  
  // Get single inventory transaction by ID
  async getTransactionById(req, res) {
    try {
      const transaction = await InventoryTransaction.findById(req.params.id)
        .populate('warehouse', 'name code location')
        .populate('location', 'code name zone aisle shelf bin')
        .populate('inventory', 'product quantity')
      
      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Inventory transaction not found',
          timestamp: new Date().toISOString()
        })
      }
      
      res.status(200).json({
        success: true,
        message: 'Inventory transaction retrieved successfully',
        data: transaction,
        timestamp: new Date().toISOString()
      })
      
    } catch (error) {
      logger.error('Error retrieving inventory transaction:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve inventory transaction',
        error: error.message,
        timestamp: new Date().toISOString()
      })
    }
  }
  
  // Record inbound inventory (barang masuk)
  async recordInbound(req, res) {
    try {
      const {
        inventoryId,
        quantity,
        cost,
        reference,
        party,
        batch,
        quality,
        reason,
        notes,
        createdBy
      } = req.body
      
      // Get inventory item to update
      const inventory = await Inventory.findById(inventoryId)
        .populate('warehouse', 'name code')
        .populate('location', 'code name')
      
      if (!inventory) {
        return res.status(404).json({
          success: false,
          message: 'Inventory item not found',
          timestamp: new Date().toISOString()
        })
      }
      
      // Create inbound transaction
      const transaction = new InventoryTransaction({
        type: 'INBOUND',
        warehouse: inventory.warehouse._id,
        location: inventory.location._id,
        inventory: inventoryId,
        product: {
          sku: inventory.product.sku,
          name: inventory.product.name
        },
        quantity: {
          previous: inventory.quantity.available,
          change: quantity,
          unit: inventory.quantity.unit
        },
        cost,
        reference,
        party,
        batch,
        quality: quality || { status: 'GOOD' },
        reason,
        notes,
        createdBy,
        confirmedBy: createdBy,
        confirmedAt: new Date()
      })
      
      // Update inventory quantities
      inventory.quantity.available += quantity
      inventory.quantity.total = inventory.quantity.available + 
                                 inventory.quantity.reserved + 
                                 inventory.quantity.onOrder
      
      // Update cost if provided
      if (cost && cost.unitCost) {
        // Calculate weighted average cost
        const totalCurrentValue = inventory.cost.average * inventory.quantity.available
        const totalNewValue = cost.unitCost * quantity
        const newTotalQuantity = inventory.quantity.available
        
        if (newTotalQuantity > 0) {
          inventory.cost.average = (totalCurrentValue + totalNewValue) / newTotalQuantity
        }
        
        inventory.cost.last = cost.unitCost
      }
      
      // Update last transaction info
      inventory.lastTransaction = {
        type: 'INBOUND',
        date: new Date(),
        quantity: quantity,
        reference: transaction.transactionNumber
      }
      
      // Save both documents
      await Promise.all([
        transaction.save(),
        inventory.save()
      ])
      
      // Populate the saved transaction
      await transaction.populate([
        { path: 'warehouse', select: 'name code' },
        { path: 'location', select: 'code name zone' },
        { path: 'inventory', select: 'product quantity' }
      ])
      
      logger.info('Inbound transaction recorded successfully', {
        transactionId: transaction._id,
        transactionNumber: transaction.transactionNumber,
        sku: inventory.product.sku,
        quantity,
        warehouse: inventory.warehouse.name
      })
      
      res.status(201).json({
        success: true,
        message: 'Inbound transaction recorded successfully',
        data: transaction,
        timestamp: new Date().toISOString()
      })
      
    } catch (error) {
      logger.error('Error recording inbound transaction:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to record inbound transaction',
        error: error.message,
        timestamp: new Date().toISOString()
      })
    }
  }
  
  // Record outbound inventory (barang keluar)
  async recordOutbound(req, res) {
    try {
      const {
        inventoryId,
        quantity,
        cost,
        reference,
        party,
        batch,
        quality,
        reason,
        notes,
        createdBy
      } = req.body
      
      // Get inventory item to update
      const inventory = await Inventory.findById(inventoryId)
        .populate('warehouse', 'name code')
        .populate('location', 'code name')
      
      if (!inventory) {
        return res.status(404).json({
          success: false,
          message: 'Inventory item not found',
          timestamp: new Date().toISOString()
        })
      }
      
      // Check if sufficient quantity available
      if (inventory.quantity.available < quantity) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient inventory quantity',
          details: {
            requested: quantity,
            available: inventory.quantity.available,
            sku: inventory.product.sku
          },
          timestamp: new Date().toISOString()
        })
      }
      
      // Create outbound transaction
      const transaction = new InventoryTransaction({
        type: 'OUTBOUND',
        warehouse: inventory.warehouse._id,
        location: inventory.location._id,
        inventory: inventoryId,
        product: {
          sku: inventory.product.sku,
          name: inventory.product.name
        },
        quantity: {
          previous: inventory.quantity.available,
          change: -quantity, // Negative for outbound
          unit: inventory.quantity.unit
        },
        cost: cost || {
          unitCost: inventory.cost.average,
          currency: inventory.cost.currency
        },
        reference,
        party,
        batch,
        quality: quality || { status: 'GOOD' },
        reason,
        notes,
        createdBy,
        confirmedBy: createdBy,
        confirmedAt: new Date()
      })
      
      // Update inventory quantities
      inventory.quantity.available -= quantity
      inventory.quantity.total = inventory.quantity.available + 
                                 inventory.quantity.reserved + 
                                 inventory.quantity.onOrder
      
      // Update last transaction info
      inventory.lastTransaction = {
        type: 'OUTBOUND',
        date: new Date(),
        quantity: quantity,
        reference: transaction.transactionNumber
      }
      
      // Save both documents
      await Promise.all([
        transaction.save(),
        inventory.save()
      ])
      
      // Populate the saved transaction
      await transaction.populate([
        { path: 'warehouse', select: 'name code' },
        { path: 'location', select: 'code name zone' },
        { path: 'inventory', select: 'product quantity' }
      ])
      
      logger.info('Outbound transaction recorded successfully', {
        transactionId: transaction._id,
        transactionNumber: transaction.transactionNumber,
        sku: inventory.product.sku,
        quantity,
        warehouse: inventory.warehouse.name
      })
      
      res.status(201).json({
        success: true,
        message: 'Outbound transaction recorded successfully',
        data: transaction,
        timestamp: new Date().toISOString()
      })
      
    } catch (error) {
      logger.error('Error recording outbound transaction:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to record outbound transaction',
        error: error.message,
        timestamp: new Date().toISOString()
      })
    }
  }
  
  // Record inventory adjustment
  async recordAdjustment(req, res) {
    try {
      const {
        inventoryId,
        newQuantity,
        reason,
        notes,
        createdBy
      } = req.body
      
      // Get inventory item
      const inventory = await Inventory.findById(inventoryId)
        .populate('warehouse', 'name code')
        .populate('location', 'code name')
      
      if (!inventory) {
        return res.status(404).json({
          success: false,
          message: 'Inventory item not found',
          timestamp: new Date().toISOString()
        })
      }
      
      const previousQuantity = inventory.quantity.available
      const quantityChange = newQuantity - previousQuantity
      
      if (quantityChange === 0) {
        return res.status(400).json({
          success: false,
          message: 'No quantity change detected',
          timestamp: new Date().toISOString()
        })
      }
      
      // Create adjustment transaction
      const transaction = new InventoryTransaction({
        type: 'ADJUSTMENT',
        warehouse: inventory.warehouse._id,
        location: inventory.location._id,
        inventory: inventoryId,
        product: {
          sku: inventory.product.sku,
          name: inventory.product.name
        },
        quantity: {
          previous: previousQuantity,
          change: quantityChange,
          unit: inventory.quantity.unit
        },
        cost: {
          unitCost: inventory.cost.average,
          currency: inventory.cost.currency
        },
        reason,
        notes,
        createdBy,
        confirmedBy: createdBy,
        confirmedAt: new Date()
      })
      
      // Update inventory quantity
      inventory.quantity.available = newQuantity
      inventory.quantity.total = inventory.quantity.available + 
                                 inventory.quantity.reserved + 
                                 inventory.quantity.onOrder
      
      // Update last transaction info
      inventory.lastTransaction = {
        type: 'ADJUSTMENT',
        date: new Date(),
        quantity: Math.abs(quantityChange),
        reference: transaction.transactionNumber
      }
      
      // Save both documents
      await Promise.all([
        transaction.save(),
        inventory.save()
      ])
      
      // Populate the saved transaction
      await transaction.populate([
        { path: 'warehouse', select: 'name code' },
        { path: 'location', select: 'code name zone' },
        { path: 'inventory', select: 'product quantity' }
      ])
      
      logger.info('Inventory adjustment recorded successfully', {
        transactionId: transaction._id,
        transactionNumber: transaction.transactionNumber,
        sku: inventory.product.sku,
        previousQuantity,
        newQuantity,
        change: quantityChange
      })
      
      res.status(201).json({
        success: true,
        message: 'Inventory adjustment recorded successfully',
        data: transaction,
        timestamp: new Date().toISOString()
      })
      
    } catch (error) {
      logger.error('Error recording inventory adjustment:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to record inventory adjustment',
        error: error.message,
        timestamp: new Date().toISOString()
      })
    }
  }
  
  // Get transaction summary/report
  async getTransactionSummary(req, res) {
    try {
      const filters = {
        warehouse: req.query.warehouse,
        type: req.query.type,
        startDate: req.query.startDate,
        endDate: req.query.endDate
      }
      
      // Remove undefined filters
      Object.keys(filters).forEach(key => 
        filters[key] === undefined && delete filters[key]
      )
      
      const summary = await InventoryTransaction.getTransactionSummary(filters)
      
      // Get additional statistics
      const totalTransactions = await InventoryTransaction.countDocuments(
        Object.keys(filters).reduce((acc, key) => {
          if (key === 'startDate' || key === 'endDate') {
            if (!acc.transactionDate) acc.transactionDate = {}
            if (key === 'startDate') acc.transactionDate.$gte = new Date(filters[key])
            if (key === 'endDate') acc.transactionDate.$lte = new Date(filters[key])
          } else {
            acc[key] = filters[key]
          }
          return acc
        }, {})
      )
      
      res.status(200).json({
        success: true,
        message: 'Transaction summary retrieved successfully',
        data: {
          summary,
          totalTransactions,
          filters: filters,
          generatedAt: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      })
      
    } catch (error) {
      logger.error('Error generating transaction summary:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to generate transaction summary',
        error: error.message,
        timestamp: new Date().toISOString()
      })
    }
  }
  
  // Cancel transaction (if allowed)
  async cancelTransaction(req, res) {
    try {
      const { reason, cancelledBy } = req.body
      
      const transaction = await InventoryTransaction.findById(req.params.id)
        .populate('inventory')
      
      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found',
          timestamp: new Date().toISOString()
        })
      }
      
      if (!transaction.canCancel()) {
        return res.status(400).json({
          success: false,
          message: 'Transaction cannot be cancelled',
          timestamp: new Date().toISOString()
        })
      }
      
      // Reverse the inventory changes
      const inventory = transaction.inventory
      inventory.quantity.available -= transaction.quantity.change
      inventory.quantity.total = inventory.quantity.available + 
                                 inventory.quantity.reserved + 
                                 inventory.quantity.onOrder
      
      // Update transaction status
      transaction.status = 'CANCELLED'
      transaction.notes = `${transaction.notes || ''}\n\nCANCELLED: ${reason}`
      
      await Promise.all([
        transaction.save(),
        inventory.save()
      ])
      
      logger.info('Transaction cancelled successfully', {
        transactionId: transaction._id,
        transactionNumber: transaction.transactionNumber,
        reason,
        cancelledBy: cancelledBy?.userName
      })
      
      res.status(200).json({
        success: true,
        message: 'Transaction cancelled successfully',
        data: transaction,
        timestamp: new Date().toISOString()
      })
      
    } catch (error) {
      logger.error('Error cancelling transaction:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to cancel transaction',
        error: error.message,
        timestamp: new Date().toISOString()
      })
    }
  }
}

module.exports = new InventoryTransactionController()
