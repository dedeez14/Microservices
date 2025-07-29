const mongoose = require('mongoose')

const locationSchema = new mongoose.Schema({
  warehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: [true, 'Warehouse reference is required'],
    index: true
  },
  
  code: {
    type: String,
    required: [true, 'Location code is required'],
    uppercase: true,
    trim: true,
    maxlength: [20, 'Location code cannot exceed 20 characters'],
    match: [/^[A-Z0-9-]+$/, 'Location code must contain only uppercase letters, numbers, and hyphens']
  },
  
  name: {
    type: String,
    required: [true, 'Location name is required'],
    trim: true,
    maxlength: [100, 'Location name cannot exceed 100 characters']
  },
  
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  type: {
    type: String,
    required: [true, 'Location type is required'],
    enum: {
      values: ['zone', 'aisle', 'rack', 'shelf', 'bin', 'floor', 'dock', 'staging'],
      message: 'Invalid location type'
    }
  },
  
  hierarchy: {
    level: {
      type: Number,
      required: [true, 'Hierarchy level is required'],
      min: [1, 'Level must be at least 1'],
      max: [10, 'Level cannot exceed 10']
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      default: null
    },
    path: {
      type: String,
      trim: true,
      maxlength: [200, 'Path cannot exceed 200 characters']
    }
  },
  
  coordinates: {
    x: {
      type: Number,
      required: [true, 'X coordinate is required'],
      min: [0, 'X coordinate cannot be negative']
    },
    y: {
      type: Number,
      required: [true, 'Y coordinate is required'],
      min: [0, 'Y coordinate cannot be negative']
    },
    z: {
      type: Number,
      default: 0,
      min: [0, 'Z coordinate cannot be negative']
    }
  },
  
  dimensions: {
    length: {
      type: Number,
      required: [true, 'Length is required'],
      min: [0, 'Length cannot be negative']
    },
    width: {
      type: Number,
      required: [true, 'Width is required'],
      min: [0, 'Width cannot be negative']
    },
    height: {
      type: Number,
      required: [true, 'Height is required'],
      min: [0, 'Height cannot be negative']
    },
    unit: {
      type: String,
      required: [true, 'Dimension unit is required'],
      enum: {
        values: ['cm', 'm', 'in', 'ft'],
        message: 'Invalid dimension unit'
      }
    }
  },
  
  capacity: {
    weight: {
      value: {
        type: Number,
        min: [0, 'Weight capacity cannot be negative']
      },
      unit: {
        type: String,
        enum: {
          values: ['kg', 'lbs', 'ton'],
          message: 'Invalid weight unit'
        }
      }
    },
    volume: {
      value: {
        type: Number,
        min: [0, 'Volume capacity cannot be negative']
      },
      unit: {
        type: String,
        enum: {
          values: ['m3', 'ft3', 'liter'],
          message: 'Invalid volume unit'
        }
      }
    },
    slots: {
      type: Number,
      min: [0, 'Number of slots cannot be negative'],
      default: 1
    }
  },
  
  restrictions: {
    temperature: {
      min: {
        type: Number
      },
      max: {
        type: Number
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
      min: {
        type: Number,
        min: [0, 'Minimum humidity cannot be negative'],
        max: [100, 'Minimum humidity cannot exceed 100%']
      },
      max: {
        type: Number,
        min: [0, 'Maximum humidity cannot be negative'],
        max: [100, 'Maximum humidity cannot exceed 100%']
      }
    },
    hazmat: {
      type: Boolean,
      default: false
    },
    fragile: {
      type: Boolean,
      default: false
    },
    perishable: {
      type: Boolean,
      default: false
    }
  },
  
  features: {
    hasBarcode: { type: Boolean, default: false },
    hasRFID: { type: Boolean, default: false },
    hasClimateControl: { type: Boolean, default: false },
    hasSecurityCamera: { type: Boolean, default: false },
    hasWeightSensor: { type: Boolean, default: false },
    isAutomated: { type: Boolean, default: false }
  },
  
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: {
      values: ['available', 'occupied', 'reserved', 'blocked', 'maintenance'],
      message: 'Invalid status'
    },
    default: 'available'
  },
  
  metadata: {
    barcode: {
      type: String,
      trim: true,
      sparse: true,
      unique: true,
      maxlength: [50, 'Barcode cannot exceed 50 characters']
    },
    rfidTag: {
      type: String,
      trim: true,
      sparse: true,
      unique: true,
      maxlength: [50, 'RFID tag cannot exceed 50 characters']
    },
    qrCode: {
      type: String,
      trim: true,
      maxlength: [200, 'QR code cannot exceed 200 characters']
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters']
    },
    tags: [{
      type: String,
      trim: true,
      maxlength: [30, 'Tag cannot exceed 30 characters']
    }]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Compound indexes
locationSchema.index({ warehouse: 1, code: 1 }, { unique: true })
locationSchema.index({ warehouse: 1, type: 1 })
locationSchema.index({ warehouse: 1, status: 1 })
locationSchema.index({ 'hierarchy.parent': 1 })
locationSchema.index({ 'hierarchy.level': 1 })

// Single field indexes
locationSchema.index({ code: 1 })
locationSchema.index({ type: 1 })
locationSchema.index({ status: 1 })

// Virtual for full location path
locationSchema.virtual('fullPath').get(function() {
  return this.hierarchy.path || this.code
})

// Virtual for calculated volume
locationSchema.virtual('calculatedVolume').get(function() {
  const { length, width, height } = this.dimensions
  return length * width * height
})

// Virtual for occupancy rate (will be calculated based on inventory)
locationSchema.virtual('occupancyRate').get(function() {
  // This would be calculated based on actual inventory data
  return 0
})

// Pre-save middleware
locationSchema.pre('save', function(next) {
  // Validate temperature range
  if (this.restrictions.temperature.min && this.restrictions.temperature.max) {
    if (this.restrictions.temperature.min >= this.restrictions.temperature.max) {
      return next(new Error('Minimum temperature must be less than maximum temperature'))
    }
  }
  
  // Validate humidity range
  if (this.restrictions.humidity.min && this.restrictions.humidity.max) {
    if (this.restrictions.humidity.min >= this.restrictions.humidity.max) {
      return next(new Error('Minimum humidity must be less than maximum humidity'))
    }
  }
  
  // Generate path if parent exists
  if (this.hierarchy.parent) {
    // This would ideally populate the parent and build the path
    // For now, we'll just use the code
    this.hierarchy.path = this.code
  } else {
    this.hierarchy.path = this.code
  }
  
  next()
})

// Static methods
locationSchema.statics.findByWarehouse = function(warehouseId) {
  return this.find({ warehouse: warehouseId }).populate('warehouse')
}

locationSchema.statics.findByType = function(type, warehouseId = null) {
  const query = { type }
  if (warehouseId) {
    query.warehouse = warehouseId
  }
  return this.find(query)
}

locationSchema.statics.findAvailable = function(warehouseId = null) {
  const query = { status: 'available' }
  if (warehouseId) {
    query.warehouse = warehouseId
  }
  return this.find(query)
}

locationSchema.statics.findByParent = function(parentId) {
  return this.find({ 'hierarchy.parent': parentId })
}

// Instance methods
locationSchema.methods.isAvailable = function() {
  return this.status === 'available'
}

locationSchema.methods.canStoreItem = function(item) {
  // Check weight capacity
  if (this.capacity.weight.value && item.weight > this.capacity.weight.value) {
    return false
  }
  
  // Check volume capacity
  if (this.capacity.volume.value && item.volume > this.capacity.volume.value) {
    return false
  }
  
  // Check temperature requirements
  if (item.requiresTemperatureControl) {
    if (!this.features.hasClimateControl) return false
    if (this.restrictions.temperature.min && item.minTemperature < this.restrictions.temperature.min) return false
    if (this.restrictions.temperature.max && item.maxTemperature > this.restrictions.temperature.max) return false
  }
  
  // Check hazmat restrictions
  if (item.isHazmat && !this.restrictions.hazmat) {
    return false
  }
  
  return this.isAvailable()
}

module.exports = mongoose.model('Location', locationSchema)
