const mongoose = require('mongoose')

const inventorySchema = new mongoose.Schema({
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
  
  // Product information (would reference Product service in full implementation)
  product: {
    sku: {
      type: String,
      required: [true, 'Product SKU is required'],
      trim: true,
      uppercase: true,
      maxlength: [50, 'SKU cannot exceed 50 characters'],
      index: true
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Product description cannot exceed 500 characters']
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      trim: true,
      maxlength: [100, 'Category cannot exceed 100 characters']
    },
    brand: {
      type: String,
      trim: true,
      maxlength: [100, 'Brand cannot exceed 100 characters']
    },
    upc: {
      type: String,
      trim: true,
      maxlength: [50, 'UPC cannot exceed 50 characters'],
      sparse: true
    }
  },
  
  batch: {
    number: {
      type: String,
      trim: true,
      maxlength: [50, 'Batch number cannot exceed 50 characters'],
      index: true
    },
    manufacturingDate: {
      type: Date
    },
    expiryDate: {
      type: Date
    },
    supplier: {
      type: String,
      trim: true,
      maxlength: [100, 'Supplier name cannot exceed 100 characters']
    }
  },
  
  quantity: {
    available: {
      type: Number,
      required: [true, 'Available quantity is required'],
      min: [0, 'Available quantity cannot be negative'],
      default: 0
    },
    reserved: {
      type: Number,
      default: 0,
      min: [0, 'Reserved quantity cannot be negative']
    },
    committed: {
      type: Number,
      default: 0,
      min: [0, 'Committed quantity cannot be negative']
    },
    damaged: {
      type: Number,
      default: 0,
      min: [0, 'Damaged quantity cannot be negative']
    },
    unit: {
      type: String,
      required: [true, 'Quantity unit is required'],
      enum: {
        values: ['pcs', 'kg', 'lbs', 'ton', 'liter', 'gallon', 'box', 'pallet', 'case'],
        message: 'Invalid quantity unit'
      }
    }
  },
  
  physical: {
    weight: {
      value: {
        type: Number,
        min: [0, 'Weight cannot be negative']
      },
      unit: {
        type: String,
        enum: {
          values: ['kg', 'lbs', 'ton'],
          message: 'Invalid weight unit'
        }
      }
    },
    dimensions: {
      length: {
        type: Number,
        min: [0, 'Length cannot be negative']
      },
      width: {
        type: Number,
        min: [0, 'Width cannot be negative']
      },
      height: {
        type: Number,
        min: [0, 'Height cannot be negative']
      },
      unit: {
        type: String,
        enum: {
          values: ['cm', 'm', 'in', 'ft'],
          message: 'Invalid dimension unit'
        }
      }
    },
    volume: {
      value: {
        type: Number,
        min: [0, 'Volume cannot be negative']
      },
      unit: {
        type: String,
        enum: {
          values: ['m3', 'ft3', 'liter'],
          message: 'Invalid volume unit'
        }
      }
    }
  },
  
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
      default: 'USD',
      maxlength: [3, 'Currency code cannot exceed 3 characters']
    }
  },
  
  tracking: {
    serialNumbers: [{
      type: String,
      trim: true,
      maxlength: [100, 'Serial number cannot exceed 100 characters']
    }],
    lotNumber: {
      type: String,
      trim: true,
      maxlength: [50, 'Lot number cannot exceed 50 characters']
    },
    barcode: {
      type: String,
      trim: true,
      maxlength: [50, 'Barcode cannot exceed 50 characters']
    },
    rfidTag: {
      type: String,
      trim: true,
      maxlength: [50, 'RFID tag cannot exceed 50 characters']
    }
  },
  
  thresholds: {
    reorderPoint: {
      type: Number,
      min: [0, 'Reorder point cannot be negative'],
      default: 0
    },
    reorderQuantity: {
      type: Number,
      min: [0, 'Reorder quantity cannot be negative'],
      default: 0
    },
    maxQuantity: {
      type: Number,
      min: [0, 'Maximum quantity cannot be negative']
    },
    minQuantity: {
      type: Number,
      min: [0, 'Minimum quantity cannot be negative'],
      default: 0
    }
  },
  
  conditions: {
    temperature: {
      current: {
        type: Number
      },
      required: {
        min: { type: Number },
        max: { type: Number }
      },
      unit: {
        type: String,
        enum: {
          values: ['celsius', 'fahrenheit'],
          message: 'Invalid temperature unit'
        },
        default: 'celsius'
      }
    },
    humidity: {
      current: {
        type: Number,
        min: [0, 'Humidity cannot be negative'],
        max: [100, 'Humidity cannot exceed 100%']
      },
      required: {
        min: { type: Number, min: 0, max: 100 },
        max: { type: Number, min: 0, max: 100 }
      }
    },
    specialHandling: {
      isFragile: { type: Boolean, default: false },
      isHazmat: { type: Boolean, default: false },
      isPerishable: { type: Boolean, default: false },
      requiresRefrigeration: { type: Boolean, default: false },
      requiresFreezing: { type: Boolean, default: false }
    }
  },
  
  lastMovement: {
    type: {
      type: String,
      enum: {
        values: ['inbound', 'outbound', 'transfer', 'adjustment', 'cycle_count'],
        message: 'Invalid movement type'
      }
    },
    date: {
      type: Date
    },
    quantity: {
      type: Number
    },
    reference: {
      type: String,
      trim: true,
      maxlength: [100, 'Reference cannot exceed 100 characters']
    }
  },
  
  lastTransaction: {
    type: {
      type: String,
      enum: {
        values: ['INBOUND', 'OUTBOUND', 'ADJUSTMENT', 'TRANSFER_IN', 'TRANSFER_OUT'],
        message: 'Invalid transaction type'
      }
    },
    date: {
      type: Date
    },
    quantity: {
      type: Number
    },
    reference: {
      type: String,
      trim: true,
      maxlength: [50, 'Transaction reference cannot exceed 50 characters']
    }
  },
  
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: {
      values: ['active', 'on_hold', 'quarantine', 'expired', 'damaged', 'recalled'],
      message: 'Invalid status'
    },
    default: 'active'
  },
  
  metadata: {
    tags: [{
      type: String,
      trim: true,
      maxlength: [30, 'Tag cannot exceed 30 characters']
    }],
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters']
    },
    lastCycleCount: {
      date: { type: Date },
      countedBy: { type: String, trim: true },
      variance: { type: Number }
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Compound indexes
inventorySchema.index({ warehouse: 1, 'product.sku': 1 })
inventorySchema.index({ warehouse: 1, location: 1 })
inventorySchema.index({ 'product.sku': 1, 'batch.number': 1 })
inventorySchema.index({ warehouse: 1, status: 1 })

// Single field indexes
inventorySchema.index({ 'product.sku': 1 })
inventorySchema.index({ 'batch.number': 1 })
inventorySchema.index({ 'batch.expiryDate': 1 })
inventorySchema.index({ status: 1 })
inventorySchema.index({ 'quantity.available': 1 })

// Virtual for total quantity
inventorySchema.virtual('totalQuantity').get(function() {
  return this.quantity.available + this.quantity.reserved + this.quantity.committed + this.quantity.damaged
})

// Virtual for available for sale quantity
inventorySchema.virtual('availableForSale').get(function() {
  return this.quantity.available - this.quantity.reserved
})

// Virtual for total value
inventorySchema.virtual('totalValue').get(function() {
  return this.totalQuantity * (this.cost.unitCost || 0)
})

// Virtual for days until expiry
inventorySchema.virtual('daysUntilExpiry').get(function() {
  if (!this.batch.expiryDate) return null
  const today = new Date()
  const expiry = new Date(this.batch.expiryDate)
  const diffTime = expiry - today
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

// Virtual for stock status
inventorySchema.virtual('stockStatus').get(function() {
  const available = this.quantity.available
  const reorderPoint = this.thresholds.reorderPoint
  const minQuantity = this.thresholds.minQuantity
  
  if (available <= 0) return 'out_of_stock'
  if (available <= minQuantity) return 'critical'
  if (available <= reorderPoint) return 'low'
  return 'adequate'
})

// Pre-save middleware
inventorySchema.pre('save', function(next) {
  // Calculate total cost if unit cost is provided
  if (this.cost.unitCost && this.isModified('quantity.available')) {
    this.cost.totalCost = this.totalQuantity * this.cost.unitCost
  }
  
  // Validate expiry date
  if (this.batch.expiryDate && this.batch.manufacturingDate) {
    if (this.batch.expiryDate <= this.batch.manufacturingDate) {
      return next(new Error('Expiry date must be after manufacturing date'))
    }
  }
  
  // Update last movement
  if (this.isModified('quantity.available') && !this.isNew) {
    this.lastMovement = {
      type: 'adjustment',
      date: new Date(),
      quantity: this.quantity.available
    }
  }
  
  next()
})

// Static methods
inventorySchema.statics.findByWarehouse = function(warehouseId) {
  return this.find({ warehouse: warehouseId })
    .populate('warehouse')
    .populate('location')
}

inventorySchema.statics.findBySku = function(sku) {
  return this.find({ 'product.sku': sku.toUpperCase() })
}

inventorySchema.statics.findLowStock = function(warehouseId = null) {
  const pipeline = [
    {
      $addFields: {
        stockStatus: {
          $cond: {
            if: { $lte: ['$quantity.available', '$thresholds.reorderPoint'] },
            then: 'low',
            else: 'adequate'
          }
        }
      }
    },
    {
      $match: {
        stockStatus: 'low',
        status: 'active'
      }
    }
  ]
  
  if (warehouseId) {
    pipeline.unshift({ $match: { warehouse: mongoose.Types.ObjectId(warehouseId) } })
  }
  
  return this.aggregate(pipeline)
}

inventorySchema.statics.findExpiringSoon = function(days = 30, warehouseId = null) {
  const futureDate = new Date()
  futureDate.setDate(futureDate.getDate() + days)
  
  const query = {
    'batch.expiryDate': {
      $exists: true,
      $lte: futureDate
    },
    status: 'active'
  }
  
  if (warehouseId) {
    query.warehouse = warehouseId
  }
  
  return this.find(query).sort({ 'batch.expiryDate': 1 })
}

// Instance methods
inventorySchema.methods.isAvailable = function() {
  return this.status === 'active' && this.quantity.available > 0
}

inventorySchema.methods.canReserve = function(quantity) {
  return this.availableForSale >= quantity
}

inventorySchema.methods.reserve = function(quantity) {
  if (!this.canReserve(quantity)) {
    throw new Error('Insufficient available quantity for reservation')
  }
  
  this.quantity.available -= quantity
  this.quantity.reserved += quantity
  
  return this.save()
}

inventorySchema.methods.releaseReservation = function(quantity) {
  if (this.quantity.reserved < quantity) {
    throw new Error('Cannot release more than reserved quantity')
  }
  
  this.quantity.reserved -= quantity
  this.quantity.available += quantity
  
  return this.save()
}

inventorySchema.methods.isExpiringSoon = function(days = 30) {
  if (!this.batch.expiryDate) return false
  
  const today = new Date()
  const checkDate = new Date()
  checkDate.setDate(today.getDate() + days)
  
  return this.batch.expiryDate <= checkDate
}

inventorySchema.methods.isExpired = function() {
  if (!this.batch.expiryDate) return false
  return this.batch.expiryDate <= new Date()
}

module.exports = mongoose.model('Inventory', inventorySchema)
