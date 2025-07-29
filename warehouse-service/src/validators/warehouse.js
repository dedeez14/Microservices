const Joi = require('joi')
const { commonSchemas } = require('../utils/schemas')

// Warehouse validation schemas
const warehouseSchemas = {
  create: Joi.object({
    code: Joi.string()
      .required()
      .uppercase()
      .trim()
      .max(10)
      .pattern(/^[A-Z0-9]+$/)
      .messages({
        'string.pattern.base': 'Warehouse code must contain only uppercase letters and numbers'
      }),
    
    name: Joi.string()
      .required()
      .trim()
      .max(100),
    
    description: Joi.string()
      .trim()
      .max(500)
      .allow(''),
    
    type: Joi.string()
      .required()
      .valid('main', 'transit', 'retail', 'distribution', 'cold_storage', 'hazmat'),
    
    location: Joi.object({
      address: Joi.string().required().trim().max(200),
      city: Joi.string().required().trim().max(50),
      state: Joi.string().required().trim().max(50),
      country: Joi.string().required().trim().max(50),
      zipCode: Joi.string().required().trim().max(20),
      coordinates: Joi.object({
        latitude: Joi.number().min(-90).max(90),
        longitude: Joi.number().min(-180).max(180)
      })
    }).required(),
    
    capacity: Joi.object({
      totalArea: Joi.number().required().min(0),
      usableArea: Joi.number().required().min(0),
      unit: Joi.string().required().valid('sqft', 'sqm'),
      maxWeight: Joi.number().min(0),
      weightUnit: Joi.string().valid('kg', 'lbs', 'ton')
    }).required(),
    
    contact: Joi.object({
      manager: Joi.object({
        name: Joi.string().required().trim().max(100),
        email: Joi.string().required().email().trim().lowercase(),
        phone: Joi.string().required().trim().max(20)
      }).required(),
      mainPhone: Joi.string().trim().max(20).allow(''),
      fax: Joi.string().trim().max(20).allow('')
    }).required(),
    
    operatingHours: Joi.object({
      monday: Joi.object({
        isOpen: Joi.boolean().default(true),
        openTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        closeTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      }),
      tuesday: Joi.object({
        isOpen: Joi.boolean().default(true),
        openTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        closeTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      }),
      wednesday: Joi.object({
        isOpen: Joi.boolean().default(true),
        openTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        closeTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      }),
      thursday: Joi.object({
        isOpen: Joi.boolean().default(true),
        openTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        closeTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      }),
      friday: Joi.object({
        isOpen: Joi.boolean().default(true),
        openTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        closeTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      }),
      saturday: Joi.object({
        isOpen: Joi.boolean().default(false),
        openTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        closeTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      }),
      sunday: Joi.object({
        isOpen: Joi.boolean().default(false),
        openTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        closeTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      })
    }),
    
    features: Joi.object({
      hasLoadingDock: Joi.boolean().default(false),
      hasColdStorage: Joi.boolean().default(false),
      hasSecuritySystem: Joi.boolean().default(false),
      hasFireSafety: Joi.boolean().default(false),
      hasClimatControl: Joi.boolean().default(false),
      hasRacking: Joi.boolean().default(false)
    }),
    
    status: Joi.string()
      .valid('active', 'inactive', 'maintenance', 'closed')
      .default('active'),
    
    metadata: Joi.object({
      tags: Joi.array().items(Joi.string().trim().max(30)),
      notes: Joi.string().trim().max(1000).allow('')
    })
  }),
  
  update: Joi.object({
    name: Joi.string().trim().max(100),
    description: Joi.string().trim().max(500).allow(''),
    type: Joi.string().valid('main', 'transit', 'retail', 'distribution', 'cold_storage', 'hazmat'),
    
    location: Joi.object({
      address: Joi.string().trim().max(200),
      city: Joi.string().trim().max(50),
      state: Joi.string().trim().max(50),
      country: Joi.string().trim().max(50),
      zipCode: Joi.string().trim().max(20),
      coordinates: Joi.object({
        latitude: Joi.number().min(-90).max(90),
        longitude: Joi.number().min(-180).max(180)
      })
    }),
    
    capacity: Joi.object({
      totalArea: Joi.number().min(0),
      usableArea: Joi.number().min(0),
      unit: Joi.string().valid('sqft', 'sqm'),
      maxWeight: Joi.number().min(0),
      weightUnit: Joi.string().valid('kg', 'lbs', 'ton')
    }),
    
    contact: Joi.object({
      manager: Joi.object({
        name: Joi.string().trim().max(100),
        email: Joi.string().email().trim().lowercase(),
        phone: Joi.string().trim().max(20)
      }),
      mainPhone: Joi.string().trim().max(20).allow(''),
      fax: Joi.string().trim().max(20).allow('')
    }),
    
    operatingHours: Joi.object().pattern(
      Joi.string().valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'),
      Joi.object({
        isOpen: Joi.boolean(),
        openTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        closeTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      })
    ),
    
    features: Joi.object({
      hasLoadingDock: Joi.boolean(),
      hasColdStorage: Joi.boolean(),
      hasSecuritySystem: Joi.boolean(),
      hasFireSafety: Joi.boolean(),
      hasClimatControl: Joi.boolean(),
      hasRacking: Joi.boolean()
    }),
    
    status: Joi.string().valid('active', 'inactive', 'maintenance', 'closed'),
    
    metadata: Joi.object({
      tags: Joi.array().items(Joi.string().trim().max(30)),
      notes: Joi.string().trim().max(1000).allow('')
    })
  }),
  
  query: Joi.object({
    code: Joi.string().trim(),
    name: Joi.string().trim(),
    type: Joi.string().valid('main', 'transit', 'retail', 'distribution', 'cold_storage', 'hazmat'),
    status: Joi.string().valid('active', 'inactive', 'maintenance', 'closed'),
    city: Joi.string().trim(),
    state: Joi.string().trim(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort: Joi.string().default('createdAt')
  })
}

module.exports = {
  warehouseSchemas
}
