const mongoose = require('mongoose')

const inventoryTransactionSchema = new mongoose.Schema({
  transactionNumber: {
    type: String,
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: [20, 'Transaction number cannot exceed 20 characters']
  },
  
  type: {
    type: String,
    required: [true, 'Transaction type is required'],
    enum: {
      values: ['INBOUND', 'OUTBOUND', 'ADJUSTMENT', 'TRANSFER_IN', 'TRANSFER_OUT'],
      message: 'Invalid transaction type'
    },
    index: true
  },
  
  warehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: [true, 'Warehouse reference is required'],
    index: true
  },
  
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: [true, 'Location reference is required'],
    index: true
  },
  
  inventory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inventory',
    required: [true, 'Inventory reference is required'],
    index: true
  },
  
  // Product information
  product: {
    sku: {
      type: String,
      required: [true, 'Product SKU is required'],
      trim: true,
      uppercase: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters']
    }
  },
  
  // Quantity details
  quantity: {
    previous: {
      type: Number,
      required: [true, 'Previous quantity is required'],
      min: [0, 'Previous quantity cannot be negative']
    },
    change: {
      type: Number,
      required: [true, 'Quantity change is required']
    },
    current: {
      type: Number,
      min: [0, 'Current quantity cannot be negative']
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      trim: true,
      maxlength: [20, 'Unit cannot exceed 20 characters']
    }
  },
  
  // Cost information
  cost: {
    unitCost: {
      type: Number,
      min: [0, 'Unit cost cannot be negative']
    },
    totalCost: {
      type: Number,
      min: [0, 'Total cost cannot be negative']
    },
    currency: {
      type: String,
      default: 'IDR',
      maxlength: [3, 'Currency code must be 3 characters'],
      uppercase: true
    }
  },
  
  // Transaction details
  reference: {
    type: {
      type: String,
      enum: ['PURCHASE_ORDER', 'SALES_ORDER', 'TRANSFER', 'RETURN', 'ADJUSTMENT', 'PRODUCTION', 'OTHER'],
      default: 'OTHER'
    },
    number: {
      type: String,
      trim: true,
      maxlength: [50, 'Reference number cannot exceed 50 characters']
    },
    date: {
      type: Date
    }
  },
  
  // Supplier/Customer information (for inbound/outbound)
  party: {
    type: {
      type: String,
      enum: ['SUPPLIER', 'CUSTOMER', 'INTERNAL', 'OTHER'],
      default: 'OTHER'
    },
    name: {
      type: String,
      trim: true,
      maxlength: [200, 'Party name cannot exceed 200 characters']
    },
    code: {
      type: String,
      trim: true,
      maxlength: [50, 'Party code cannot exceed 50 characters']
    },
    contact: {
      email: {
        type: String,
        trim: true,
        lowercase: true
      },
      phone: {
        type: String,
        trim: true,
        maxlength: [20, 'Phone cannot exceed 20 characters']
      }
    }
  },
  
  // Batch and expiry information
  batch: {
    number: {
      type: String,
      trim: true,
      maxlength: [50, 'Batch number cannot exceed 50 characters'],
      index: true
    },
    manufactureDate: {
      type: Date
    },
    expiryDate: {
      type: Date
    }
  },
  
  // Quality control
  quality: {
    status: {
      type: String,
      enum: ['GOOD', 'DAMAGED', 'EXPIRED', 'QUARANTINE'],
      default: 'GOOD'
    },
    inspector: {
      type: String,
      trim: true,
      maxlength: [100, 'Inspector name cannot exceed 100 characters']
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Quality notes cannot exceed 500 characters']
    }
  },
  
  // Transaction metadata
  reason: {
    type: String,
    required: [true, 'Transaction reason is required'],
    trim: true,
    maxlength: [200, 'Reason cannot exceed 200 characters']
  },
  
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  
  status: {
    type: String,
    enum: ['PENDING', 'CONFIRMED', 'CANCELLED'],
    default: 'CONFIRMED',
    index: true
  },
  
  // User information
  createdBy: {
    userId: {
      type: String,
      required: [true, 'Created by user ID is required'],
      trim: true
    },
    userName: {
      type: String,
      required: [true, 'Created by user name is required'],
      trim: true,
      maxlength: [100, 'User name cannot exceed 100 characters']
    }
  },
  
  confirmedBy: {
    userId: {
      type: String,
      trim: true
    },
    userName: {
      type: String,
      trim: true,
      maxlength: [100, 'User name cannot exceed 100 characters']
    },
    confirmedAt: {
      type: Date
    }
  },
  
  // Timestamps
  transactionDate: {
    type: Date,
    required: [true, 'Transaction date is required'],
    default: Date.now,
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes for better query performance
inventoryTransactionSchema.index({ warehouse: 1, transactionDate: -1 })
inventoryTransactionSchema.index({ type: 1, transactionDate: -1 })
inventoryTransactionSchema.index({ 'product.sku': 1, transactionDate: -1 })
inventoryTransactionSchema.index({ status: 1, createdAt: -1 })
inventoryTransactionSchema.index({ transactionDate: -1 })

// Virtual for transaction value
inventoryTransactionSchema.virtual('totalValue').get(function() {
  return Math.abs(this.quantity.change) * (this.cost.unitCost || 0)
})

// Virtual for transaction direction
inventoryTransactionSchema.virtual('direction').get(function() {
  return this.quantity.change >= 0 ? 'IN' : 'OUT'
})

// Pre-save middleware to generate transaction number
inventoryTransactionSchema.pre('save', async function(next) {
  if (this.isNew && !this.transactionNumber) {
    const date = new Date()
    const prefix = this.type === 'INBOUND' ? 'IN' : 
                  this.type === 'OUTBOUND' ? 'OUT' : 
                  this.type === 'ADJUSTMENT' ? 'ADJ' : 'TXN'
    
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
    
    // Find the last transaction number for today
    const lastTransaction = await this.constructor.findOne({
      transactionNumber: new RegExp(`^${prefix}${dateStr}`),
    }).sort({ transactionNumber: -1 })
    
    let sequence = 1
    if (lastTransaction) {
      const lastSequence = parseInt(lastTransaction.transactionNumber.slice(-4))
      sequence = lastSequence + 1
    }
    
    this.transactionNumber = `${prefix}${dateStr}${sequence.toString().padStart(4, '0')}`
  }
  
  // Calculate current quantity
  this.quantity.current = this.quantity.previous + this.quantity.change
  
  // Calculate total cost
  if (this.cost.unitCost) {
    this.cost.totalCost = Math.abs(this.quantity.change) * this.cost.unitCost
  }
  
  next()
})

// Static methods
inventoryTransactionSchema.statics.findByWarehouse = function(warehouseId, options = {}) {
  const query = { warehouse: warehouseId }
  if (options.type) query.type = options.type
  if (options.status) query.status = options.status
  
  return this.find(query)
    .populate('warehouse', 'name code')
    .populate('location', 'code name zone')
    .populate('inventory', 'product')
    .sort({ transactionDate: -1 })
}

inventoryTransactionSchema.statics.findBySKU = function(sku, options = {}) {
  const query = { 'product.sku': sku.toUpperCase() }
  if (options.warehouse) query.warehouse = options.warehouse
  if (options.type) query.type = options.type
  
  return this.find(query)
    .populate('warehouse', 'name code')
    .populate('location', 'code name')
    .sort({ transactionDate: -1 })
}

inventoryTransactionSchema.statics.getTransactionSummary = function(filters = {}) {
  const matchStage = {}
  
  if (filters.warehouse) matchStage.warehouse = mongoose.Types.ObjectId(filters.warehouse)
  if (filters.type) matchStage.type = filters.type
  if (filters.startDate || filters.endDate) {
    matchStage.transactionDate = {}
    if (filters.startDate) matchStage.transactionDate.$gte = new Date(filters.startDate)
    if (filters.endDate) matchStage.transactionDate.$lte = new Date(filters.endDate)
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$type',
        totalTransactions: { $sum: 1 },
        totalQuantity: { $sum: { $abs: '$quantity.change' } },
        totalValue: { $sum: '$cost.totalCost' }
      }
    },
    { $sort: { _id: 1 } }
  ])
}

// Instance methods
inventoryTransactionSchema.methods.isInbound = function() {
  return ['INBOUND', 'TRANSFER_IN'].includes(this.type) || this.quantity.change > 0
}

inventoryTransactionSchema.methods.isOutbound = function() {
  return ['OUTBOUND', 'TRANSFER_OUT'].includes(this.type) || this.quantity.change < 0
}

inventoryTransactionSchema.methods.canCancel = function() {
  return this.status === 'PENDING' || this.status === 'CONFIRMED'
}

module.exports = mongoose.model('InventoryTransaction', inventoryTransactionSchema)
