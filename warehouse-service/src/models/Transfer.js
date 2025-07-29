const mongoose = require('mongoose')

const transferSchema = new mongoose.Schema({
  transferNumber: {
    type: String,
    required: [true, 'Transfer number is required'],
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: [20, 'Transfer number cannot exceed 20 characters']
  },
  
  type: {
    type: String,
    required: [true, 'Transfer type is required'],
    enum: {
      values: ['internal', 'warehouse_to_warehouse', 'inbound', 'outbound', 'adjustment', 'cycle_count'],
      message: 'Invalid transfer type'
    }
  },
  
  source: {
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: function() {
        return ['internal', 'warehouse_to_warehouse', 'outbound'].includes(this.type)
      }
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      required: function() {
        return this.type === 'internal'
      }
    },
    external: {
      name: {
        type: String,
        trim: true,
        maxlength: [100, 'External source name cannot exceed 100 characters']
      },
      address: {
        type: String,
        trim: true,
        maxlength: [200, 'Address cannot exceed 200 characters']
      },
      contact: {
        type: String,
        trim: true,
        maxlength: [100, 'Contact cannot exceed 100 characters']
      }
    }
  },
  
  destination: {
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: function() {
        return ['internal', 'warehouse_to_warehouse', 'inbound'].includes(this.type)
      }
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      required: function() {
        return this.type === 'internal'
      }
    },
    external: {
      name: {
        type: String,
        trim: true,
        maxlength: [100, 'External destination name cannot exceed 100 characters']
      },
      address: {
        type: String,
        trim: true,
        maxlength: [200, 'Address cannot exceed 200 characters']
      },
      contact: {
        type: String,
        trim: true,
        maxlength: [100, 'Contact cannot exceed 100 characters']
      }
    }
  },
  
  items: [{
    product: {
      sku: {
        type: String,
        required: [true, 'Product SKU is required'],
        trim: true,
        uppercase: true,
        maxlength: [50, 'SKU cannot exceed 50 characters']
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
      }
    },
    
    batch: {
      number: {
        type: String,
        trim: true,
        maxlength: [50, 'Batch number cannot exceed 50 characters']
      },
      expiryDate: {
        type: Date
      }
    },
    
    quantity: {
      requested: {
        type: Number,
        required: [true, 'Requested quantity is required'],
        min: [0, 'Requested quantity cannot be negative']
      },
      transferred: {
        type: Number,
        default: 0,
        min: [0, 'Transferred quantity cannot be negative']
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
    
    cost: {
      unitCost: {
        type: Number,
        min: [0, 'Unit cost cannot be negative']
      },
      totalCost: {
        type: Number,
        min: [0, 'Total cost cannot be negative']
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
      }
    },
    
    status: {
      type: String,
      required: [true, 'Item status is required'],
      enum: {
        values: ['pending', 'picked', 'shipped', 'received', 'cancelled'],
        message: 'Invalid item status'
      },
      default: 'pending'
    },
    
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters']
    }
  }],
  
  priority: {
    type: String,
    enum: {
      values: ['low', 'normal', 'high', 'urgent'],
      message: 'Invalid priority'
    },
    default: 'normal'
  },
  
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: {
      values: ['draft', 'approved', 'in_progress', 'completed', 'cancelled', 'partially_completed'],
      message: 'Invalid status'
    },
    default: 'draft'
  },
  
  dates: {
    requested: {
      type: Date,
      required: [true, 'Requested date is required'],
      default: Date.now
    },
    approved: {
      type: Date
    },
    started: {
      type: Date
    },
    completed: {
      type: Date
    },
    expectedDelivery: {
      type: Date
    }
  },
  
  personnel: {
    requestedBy: {
      id: {
        type: String,
        required: [true, 'Requester ID is required'],
        trim: true
      },
      name: {
        type: String,
        required: [true, 'Requester name is required'],
        trim: true,
        maxlength: [100, 'Requester name cannot exceed 100 characters']
      },
      email: {
        type: String,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email format']
      }
    },
    approvedBy: {
      id: {
        type: String,
        trim: true
      },
      name: {
        type: String,
        trim: true,
        maxlength: [100, 'Approver name cannot exceed 100 characters']
      },
      email: {
        type: String,
        trim: true,
        lowercase: true
      }
    },
    assignedTo: {
      id: {
        type: String,
        trim: true
      },
      name: {
        type: String,
        trim: true,
        maxlength: [100, 'Assignee name cannot exceed 100 characters']
      },
      email: {
        type: String,
        trim: true,
        lowercase: true
      }
    }
  },
  
  shipping: {
    carrier: {
      type: String,
      trim: true,
      maxlength: [100, 'Carrier name cannot exceed 100 characters']
    },
    trackingNumber: {
      type: String,
      trim: true,
      maxlength: [100, 'Tracking number cannot exceed 100 characters']
    },
    method: {
      type: String,
      enum: {
        values: ['ground', 'air', 'sea', 'rail', 'courier', 'pickup'],
        message: 'Invalid shipping method'
      }
    },
    cost: {
      type: Number,
      min: [0, 'Shipping cost cannot be negative']
    }
  },
  
  reference: {
    externalId: {
      type: String,
      trim: true,
      maxlength: [100, 'External ID cannot exceed 100 characters']
    },
    purchaseOrder: {
      type: String,
      trim: true,
      maxlength: [100, 'Purchase order cannot exceed 100 characters']
    },
    salesOrder: {
      type: String,
      trim: true,
      maxlength: [100, 'Sales order cannot exceed 100 characters']
    },
    invoice: {
      type: String,
      trim: true,
      maxlength: [100, 'Invoice cannot exceed 100 characters']
    }
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
    attachments: [{
      name: {
        type: String,
        trim: true,
        maxlength: [100, 'Attachment name cannot exceed 100 characters']
      },
      url: {
        type: String,
        trim: true,
        maxlength: [500, 'URL cannot exceed 500 characters']
      },
      type: {
        type: String,
        enum: ['document', 'image', 'other']
      }
    }]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes
transferSchema.index({ transferNumber: 1 }, { unique: true })
transferSchema.index({ type: 1 })
transferSchema.index({ status: 1 })
transferSchema.index({ 'source.warehouse': 1 })
transferSchema.index({ 'destination.warehouse': 1 })
transferSchema.index({ 'items.product.sku': 1 })
transferSchema.index({ 'dates.requested': 1 })
transferSchema.index({ 'dates.expectedDelivery': 1 })
transferSchema.index({ 'personnel.requestedBy.id': 1 })

// Virtual for completion percentage
transferSchema.virtual('completionPercentage').get(function() {
  if (this.items.length === 0) return 0
  
  const totalRequested = this.items.reduce((sum, item) => sum + item.quantity.requested, 0)
  const totalTransferred = this.items.reduce((sum, item) => sum + item.quantity.transferred, 0)
  
  return totalRequested > 0 ? Math.round((totalTransferred / totalRequested) * 100) : 0
})

// Virtual for total items
transferSchema.virtual('totalItems').get(function() {
  return this.items.length
})

// Virtual for total requested quantity
transferSchema.virtual('totalRequestedQuantity').get(function() {
  return this.items.reduce((sum, item) => sum + item.quantity.requested, 0)
})

// Virtual for total transferred quantity
transferSchema.virtual('totalTransferredQuantity').get(function() {
  return this.items.reduce((sum, item) => sum + item.quantity.transferred, 0)
})

// Virtual for total cost
transferSchema.virtual('totalCost').get(function() {
  return this.items.reduce((sum, item) => sum + (item.cost.totalCost || 0), 0)
})

// Virtual for is overdue
transferSchema.virtual('isOverdue').get(function() {
  if (!this.dates.expectedDelivery) return false
  if (this.status === 'completed' || this.status === 'cancelled') return false
  return new Date() > this.dates.expectedDelivery
})

// Pre-save middleware
transferSchema.pre('save', function(next) {
  // Auto-generate transfer number if not provided
  if (!this.transferNumber && this.isNew) {
    const prefix = this.type.toUpperCase().substring(0, 3)
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0')
    this.transferNumber = `${prefix}${timestamp}${random}`
  }
  
  // Update status based on items completion
  if (this.status === 'in_progress') {
    const allCompleted = this.items.every(item => 
      item.status === 'received' || item.status === 'cancelled'
    )
    const someCompleted = this.items.some(item => 
      item.status === 'received'
    )
    
    if (allCompleted && someCompleted) {
      this.status = 'completed'
      this.dates.completed = new Date()
    } else if (someCompleted) {
      this.status = 'partially_completed'
    }
  }
  
  // Calculate item costs
  this.items.forEach(item => {
    if (item.cost.unitCost && !item.cost.totalCost) {
      item.cost.totalCost = item.cost.unitCost * item.quantity.requested
    }
  })
  
  next()
})

// Pre-save middleware for auto-setting dates
transferSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    const now = new Date()
    
    switch (this.status) {
      case 'approved':
        if (!this.dates.approved) this.dates.approved = now
        break
      case 'in_progress':
        if (!this.dates.started) this.dates.started = now
        break
      case 'completed':
        if (!this.dates.completed) this.dates.completed = now
        break
    }
  }
  next()
})

// Static methods
transferSchema.statics.findByWarehouse = function(warehouseId, direction = 'both') {
  const query = {}
  
  if (direction === 'outbound' || direction === 'both') {
    query['source.warehouse'] = warehouseId
  }
  
  if (direction === 'inbound' || direction === 'both') {
    if (query['source.warehouse']) {
      query.$or = [
        { 'source.warehouse': warehouseId },
        { 'destination.warehouse': warehouseId }
      ]
    } else {
      query['destination.warehouse'] = warehouseId
    }
  }
  
  return this.find(query)
}

transferSchema.statics.findByStatus = function(status) {
  return this.find({ status })
}

transferSchema.statics.findPending = function() {
  return this.find({ 
    status: { $in: ['draft', 'approved', 'in_progress'] } 
  })
}

transferSchema.statics.findOverdue = function() {
  return this.find({
    'dates.expectedDelivery': { $lt: new Date() },
    status: { $nin: ['completed', 'cancelled'] }
  })
}

transferSchema.statics.findBySku = function(sku) {
  return this.find({ 'items.product.sku': sku.toUpperCase() })
}

// Instance methods
transferSchema.methods.canApprove = function() {
  return this.status === 'draft'
}

transferSchema.methods.canStart = function() {
  return this.status === 'approved'
}

transferSchema.methods.canComplete = function() {
  return ['in_progress', 'partially_completed'].includes(this.status)
}

transferSchema.methods.canCancel = function() {
  return !['completed', 'cancelled'].includes(this.status)
}

transferSchema.methods.approve = function(approvedBy) {
  if (!this.canApprove()) {
    throw new Error('Transfer cannot be approved in current status')
  }
  
  this.status = 'approved'
  this.dates.approved = new Date()
  this.personnel.approvedBy = approvedBy
  
  return this.save()
}

transferSchema.methods.start = function(assignedTo) {
  if (!this.canStart()) {
    throw new Error('Transfer cannot be started in current status')
  }
  
  this.status = 'in_progress'
  this.dates.started = new Date()
  if (assignedTo) {
    this.personnel.assignedTo = assignedTo
  }
  
  return this.save()
}

transferSchema.methods.complete = function() {
  if (!this.canComplete()) {
    throw new Error('Transfer cannot be completed in current status')
  }
  
  this.status = 'completed'
  this.dates.completed = new Date()
  
  // Mark all pending items as received
  this.items.forEach(item => {
    if (item.status === 'pending' || item.status === 'picked' || item.status === 'shipped') {
      item.status = 'received'
      item.quantity.transferred = item.quantity.requested
    }
  })
  
  return this.save()
}

transferSchema.methods.cancel = function(reason) {
  if (!this.canCancel()) {
    throw new Error('Transfer cannot be cancelled in current status')
  }
  
  this.status = 'cancelled'
  if (reason) {
    this.metadata.notes = (this.metadata.notes || '') + `\nCancellation reason: ${reason}`
  }
  
  // Mark all pending items as cancelled
  this.items.forEach(item => {
    if (item.status !== 'received') {
      item.status = 'cancelled'
    }
  })
  
  return this.save()
}

module.exports = mongoose.model('Transfer', transferSchema)
