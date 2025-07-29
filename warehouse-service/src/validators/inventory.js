const Joi = require('joi')
const { commonSchemas } = require('../utils/schemas')

// Inventory validation schemas
const inventorySchemas = {
  create: Joi.object({
    warehouse: commonSchemas.objectId.required(),
    location: commonSchemas.objectId.required(),
    
    product: Joi.object({
      sku: Joi.string().required().trim().uppercase().max(50),
      name: Joi.string().required().trim().max(200),
      description: Joi.string().trim().max(500).allow(''),
      category: Joi.string().required().trim().max(100),
      brand: Joi.string().trim().max(100).allow(''),
      upc: Joi.string().trim().max(50).allow('')
    }).required(),
    
    batch: Joi.object({
      number: Joi.string().trim().max(50).allow(''),
      manufacturingDate: Joi.date(),
      expiryDate: Joi.date(),
      supplier: Joi.string().trim().max(100).allow('')
    }),
    
    quantity: Joi.object({
      available: Joi.number().required().min(0),
      reserved: Joi.number().min(0).default(0),
      committed: Joi.number().min(0).default(0),
      damaged: Joi.number().min(0).default(0),
      unit: Joi.string().required().valid('pcs', 'kg', 'lbs', 'ton', 'liter', 'gallon', 'box', 'pallet', 'case')
    }).required(),
    
    physical: Joi.object({
      weight: Joi.object({
        value: Joi.number().min(0),
        unit: Joi.string().valid('kg', 'lbs', 'ton')
      }),
      dimensions: Joi.object({
        length: Joi.number().min(0),
        width: Joi.number().min(0),
        height: Joi.number().min(0),
        unit: Joi.string().valid('cm', 'm', 'in', 'ft')
      }),
      volume: Joi.object({
        value: Joi.number().min(0),
        unit: Joi.string().valid('m3', 'ft3', 'liter')
      })
    }),
    
    cost: Joi.object({
      unitCost: Joi.number().min(0),
      totalCost: Joi.number().min(0),
      currency: Joi.string().max(3).default('USD')
    }),
    
    tracking: Joi.object({
      serialNumbers: Joi.array().items(Joi.string().trim().max(100)),
      lotNumber: Joi.string().trim().max(50).allow(''),
      barcode: Joi.string().trim().max(50).allow(''),
      rfidTag: Joi.string().trim().max(50).allow('')
    }),
    
    thresholds: Joi.object({
      reorderPoint: Joi.number().min(0).default(0),
      reorderQuantity: Joi.number().min(0).default(0),
      maxQuantity: Joi.number().min(0),
      minQuantity: Joi.number().min(0).default(0)
    }),
    
    conditions: Joi.object({
      temperature: Joi.object({
        current: Joi.number(),
        required: Joi.object({
          min: Joi.number(),
          max: Joi.number()
        }),
        unit: Joi.string().valid('celsius', 'fahrenheit').default('celsius')
      }),
      humidity: Joi.object({
        current: Joi.number().min(0).max(100),
        required: Joi.object({
          min: Joi.number().min(0).max(100),
          max: Joi.number().min(0).max(100)
        })
      }),
      specialHandling: Joi.object({
        isFragile: Joi.boolean().default(false),
        isHazmat: Joi.boolean().default(false),
        isPerishable: Joi.boolean().default(false),
        requiresRefrigeration: Joi.boolean().default(false),
        requiresFreezing: Joi.boolean().default(false)
      })
    }),
    
    status: Joi.string()
      .valid('active', 'on_hold', 'quarantine', 'expired', 'damaged', 'recalled')
      .default('active'),
    
    metadata: Joi.object({
      tags: Joi.array().items(Joi.string().trim().max(30)),
      notes: Joi.string().trim().max(1000).allow('')
    })
  }),
  
  update: Joi.object({
    location: commonSchemas.objectId,
    
    product: Joi.object({
      name: Joi.string().trim().max(200),
      description: Joi.string().trim().max(500).allow(''),
      category: Joi.string().trim().max(100),
      brand: Joi.string().trim().max(100).allow(''),
      upc: Joi.string().trim().max(50).allow('')
    }),
    
    batch: Joi.object({
      number: Joi.string().trim().max(50).allow(''),
      manufacturingDate: Joi.date(),
      expiryDate: Joi.date(),
      supplier: Joi.string().trim().max(100).allow('')
    }),
    
    quantity: Joi.object({
      available: Joi.number().min(0),
      reserved: Joi.number().min(0),
      committed: Joi.number().min(0),
      damaged: Joi.number().min(0),
      unit: Joi.string().valid('pcs', 'kg', 'lbs', 'ton', 'liter', 'gallon', 'box', 'pallet', 'case')
    }),
    
    physical: Joi.object({
      weight: Joi.object({
        value: Joi.number().min(0),
        unit: Joi.string().valid('kg', 'lbs', 'ton')
      }),
      dimensions: Joi.object({
        length: Joi.number().min(0),
        width: Joi.number().min(0),
        height: Joi.number().min(0),
        unit: Joi.string().valid('cm', 'm', 'in', 'ft')
      }),
      volume: Joi.object({
        value: Joi.number().min(0),
        unit: Joi.string().valid('m3', 'ft3', 'liter')
      })
    }),
    
    cost: Joi.object({
      unitCost: Joi.number().min(0),
      totalCost: Joi.number().min(0),
      currency: Joi.string().max(3)
    }),
    
    tracking: Joi.object({
      serialNumbers: Joi.array().items(Joi.string().trim().max(100)),
      lotNumber: Joi.string().trim().max(50).allow(''),
      barcode: Joi.string().trim().max(50).allow(''),
      rfidTag: Joi.string().trim().max(50).allow('')
    }),
    
    thresholds: Joi.object({
      reorderPoint: Joi.number().min(0),
      reorderQuantity: Joi.number().min(0),
      maxQuantity: Joi.number().min(0),
      minQuantity: Joi.number().min(0)
    }),
    
    conditions: Joi.object({
      temperature: Joi.object({
        current: Joi.number(),
        required: Joi.object({
          min: Joi.number(),
          max: Joi.number()
        }),
        unit: Joi.string().valid('celsius', 'fahrenheit')
      }),
      humidity: Joi.object({
        current: Joi.number().min(0).max(100),
        required: Joi.object({
          min: Joi.number().min(0).max(100),
          max: Joi.number().min(0).max(100)
        })
      }),
      specialHandling: Joi.object({
        isFragile: Joi.boolean(),
        isHazmat: Joi.boolean(),
        isPerishable: Joi.boolean(),
        requiresRefrigeration: Joi.boolean(),
        requiresFreezing: Joi.boolean()
      })
    }),
    
    status: Joi.string().valid('active', 'on_hold', 'quarantine', 'expired', 'damaged', 'recalled'),
    
    metadata: Joi.object({
      tags: Joi.array().items(Joi.string().trim().max(30)),
      notes: Joi.string().trim().max(1000).allow('')
    })
  }),
  
  query: Joi.object({
    warehouse: Joi.string().empty('').optional(),
    location: Joi.string().empty('').optional(),
    search: Joi.string().empty('').optional(),
    sku: Joi.string().empty('').optional(),
    name: Joi.string().empty('').optional(),
    category: Joi.string().empty('').optional(),
    status: Joi.string().valid('active', 'on_hold', 'quarantine', 'expired', 'damaged', 'recalled').optional(),
    stockStatus: Joi.string().valid('out_of_stock', 'critical', 'low', 'adequate').optional(),
    expiringInDays: Joi.number().min(1).max(365).optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort: Joi.string().default('createdAt')
  }).unknown(true),
  
  adjustment: Joi.object({
    quantity: Joi.number().required(),
    reason: Joi.string().required().trim().max(200),
    reference: Joi.string().trim().max(100).allow(''),
    adjustedBy: Joi.object({
      id: Joi.string().required().trim(),
      name: Joi.string().required().trim().max(100)
    }).required()
  }),
  
  reserve: Joi.object({
    quantity: Joi.number().required().min(1),
    reference: Joi.string().trim().max(100).allow(''),
    reservedBy: Joi.object({
      id: Joi.string().required().trim(),
      name: Joi.string().required().trim().max(100)
    }).required()
  })
}

module.exports = {
  inventorySchemas
}
