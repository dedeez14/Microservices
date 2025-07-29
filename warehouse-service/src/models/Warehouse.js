const mongoose = require('mongoose')

const warehouseSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Warehouse code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: [10, 'Warehouse code cannot exceed 10 characters'],
    match: [/^[A-Z0-9]+$/, 'Warehouse code must contain only uppercase letters and numbers']
  },
  
  name: {
    type: String,
    required: [true, 'Warehouse name is required'],
    trim: true,
    maxlength: [100, 'Warehouse name cannot exceed 100 characters']
  },
  
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  type: {
    type: String,
    required: [true, 'Warehouse type is required'],
    enum: {
      values: ['main', 'transit', 'retail', 'distribution', 'cold_storage', 'hazmat'],
      message: 'Invalid warehouse type'
    }
  },
  
  location: {
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
      maxlength: [200, 'Address cannot exceed 200 characters']
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      maxlength: [50, 'City cannot exceed 50 characters']
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
      maxlength: [50, 'State cannot exceed 50 characters']
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
      maxlength: [50, 'Country cannot exceed 50 characters']
    },
    zipCode: {
      type: String,
      required: [true, 'Zip code is required'],
      trim: true,
      maxlength: [20, 'Zip code cannot exceed 20 characters']
    },
    coordinates: {
      latitude: {
        type: Number,
        min: [-90, 'Latitude must be between -90 and 90'],
        max: [90, 'Latitude must be between -90 and 90']
      },
      longitude: {
        type: Number,
        min: [-180, 'Longitude must be between -180 and 180'],
        max: [180, 'Longitude must be between -180 and 180']
      }
    }
  },
  
  capacity: {
    totalArea: {
      type: Number,
      required: [true, 'Total area is required'],
      min: [0, 'Total area cannot be negative']
    },
    usableArea: {
      type: Number,
      required: [true, 'Usable area is required'],
      min: [0, 'Usable area cannot be negative']
    },
    unit: {
      type: String,
      required: [true, 'Area unit is required'],
      enum: {
        values: ['sqft', 'sqm'],
        message: 'Invalid area unit'
      }
    },
    maxWeight: {
      type: Number,
      min: [0, 'Max weight cannot be negative']
    },
    weightUnit: {
      type: String,
      enum: {
        values: ['kg', 'lbs', 'ton'],
        message: 'Invalid weight unit'
      }
    }
  },
  
  contact: {
    manager: {
      name: {
        type: String,
        required: [true, 'Manager name is required'],
        trim: true,
        maxlength: [100, 'Manager name cannot exceed 100 characters']
      },
      email: {
        type: String,
        required: [true, 'Manager email is required'],
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email format']
      },
      phone: {
        type: String,
        required: [true, 'Manager phone is required'],
        trim: true,
        maxlength: [20, 'Phone number cannot exceed 20 characters']
      }
    },
    mainPhone: {
      type: String,
      trim: true,
      maxlength: [20, 'Phone number cannot exceed 20 characters']
    },
    fax: {
      type: String,
      trim: true,
      maxlength: [20, 'Fax number cannot exceed 20 characters']
    }
  },
  
  operatingHours: {
    monday: {
      isOpen: { type: Boolean, default: true },
      openTime: { type: String, match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'] },
      closeTime: { type: String, match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'] }
    },
    tuesday: {
      isOpen: { type: Boolean, default: true },
      openTime: { type: String, match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'] },
      closeTime: { type: String, match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'] }
    },
    wednesday: {
      isOpen: { type: Boolean, default: true },
      openTime: { type: String, match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'] },
      closeTime: { type: String, match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'] }
    },
    thursday: {
      isOpen: { type: Boolean, default: true },
      openTime: { type: String, match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'] },
      closeTime: { type: String, match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'] }
    },
    friday: {
      isOpen: { type: Boolean, default: true },
      openTime: { type: String, match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'] },
      closeTime: { type: String, match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'] }
    },
    saturday: {
      isOpen: { type: Boolean, default: false },
      openTime: { type: String, match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'] },
      closeTime: { type: String, match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'] }
    },
    sunday: {
      isOpen: { type: Boolean, default: false },
      openTime: { type: String, match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'] },
      closeTime: { type: String, match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'] }
    }
  },
  
  features: {
    hasLoadingDock: { type: Boolean, default: false },
    hasColdStorage: { type: Boolean, default: false },
    hasSecuritySystem: { type: Boolean, default: false },
    hasFireSafety: { type: Boolean, default: false },
    hasClimatControl: { type: Boolean, default: false },
    hasRacking: { type: Boolean, default: false }
  },
  
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: {
      values: ['active', 'inactive', 'maintenance', 'closed'],
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
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes
warehouseSchema.index({ code: 1 }, { unique: true })
warehouseSchema.index({ name: 1 })
warehouseSchema.index({ type: 1 })
warehouseSchema.index({ status: 1 })
warehouseSchema.index({ 'location.city': 1 })
warehouseSchema.index({ 'location.state': 1 })
warehouseSchema.index({ 'location.coordinates': '2dsphere' })

// Virtual for full address
warehouseSchema.virtual('fullAddress').get(function() {
  const { address, city, state, country, zipCode } = this.location
  return `${address}, ${city}, ${state} ${zipCode}, ${country}`
})

// Virtual for capacity utilization (will be calculated based on inventory)
warehouseSchema.virtual('utilizationPercentage').get(function() {
  // This would be calculated based on actual inventory data
  return 0
})

// Pre-save middleware
warehouseSchema.pre('save', function(next) {
  // Validate usable area is not greater than total area
  if (this.capacity.usableArea > this.capacity.totalArea) {
    next(new Error('Usable area cannot be greater than total area'))
  }
  
  // Validate operating hours
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  for (const day of days) {
    const dayHours = this.operatingHours[day]
    if (dayHours.isOpen && (!dayHours.openTime || !dayHours.closeTime)) {
      next(new Error(`${day} is marked as open but missing operating hours`))
    }
  }
  
  next()
})

// Static methods
warehouseSchema.statics.findByCode = function(code) {
  return this.findOne({ code: code.toUpperCase() })
}

warehouseSchema.statics.findActive = function() {
  return this.find({ status: 'active' })
}

warehouseSchema.statics.findByLocation = function(city, state) {
  return this.find({
    'location.city': new RegExp(city, 'i'),
    'location.state': new RegExp(state, 'i')
  })
}

// Instance methods
warehouseSchema.methods.isOperational = function() {
  return this.status === 'active'
}

warehouseSchema.methods.isOpenToday = function() {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'lowercase' })
  return this.operatingHours[today]?.isOpen || false
}

module.exports = mongoose.model('Warehouse', warehouseSchema)
