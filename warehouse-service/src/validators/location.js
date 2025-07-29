const Joi = require('joi')
const { commonSchemas } = require('../utils/schemas')

// Location validation schemas
const locationSchemas = {
  create: Joi.object({
    warehouse: commonSchemas.objectId.required(),
    
    code: Joi.string()
      .required()
      .uppercase()
      .trim()
      .max(20)
      .pattern(/^[A-Z0-9-]+$/)
      .messages({
        'string.pattern.base': 'Location code must contain only uppercase letters, numbers, and hyphens'
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
      .valid('zone', 'aisle', 'rack', 'shelf', 'bin', 'floor', 'dock', 'staging'),
    
    hierarchy: Joi.object({
      level: Joi.number().required().min(1).max(10),
      parent: commonSchemas.objectId.allow(null),
      path: Joi.string().trim().max(200)
    }).required(),
    
    coordinates: Joi.object({
      x: Joi.number().required().min(0),
      y: Joi.number().required().min(0),
      z: Joi.number().min(0).default(0)
    }).required(),
    
    dimensions: Joi.object({
      length: Joi.number().required().min(0),
      width: Joi.number().required().min(0),
      height: Joi.number().required().min(0),
      unit: Joi.string().required().valid('cm', 'm', 'in', 'ft')
    }).required(),
    
    capacity: Joi.object({
      weight: Joi.object({
        value: Joi.number().min(0),
        unit: Joi.string().valid('kg', 'lbs', 'ton')
      }),
      volume: Joi.object({
        value: Joi.number().min(0),
        unit: Joi.string().valid('m3', 'ft3', 'liter')
      }),
      slots: Joi.number().min(0).default(1)
    }),
    
    restrictions: Joi.object({
      temperature: Joi.object({
        min: Joi.number(),
        max: Joi.number(),
        unit: Joi.string().valid('celsius', 'fahrenheit').default('celsius')
      }),
      humidity: Joi.object({
        min: Joi.number().min(0).max(100),
        max: Joi.number().min(0).max(100)
      }),
      hazmat: Joi.boolean().default(false),
      fragile: Joi.boolean().default(false),
      perishable: Joi.boolean().default(false)
    }),
    
    features: Joi.object({
      hasBarcode: Joi.boolean().default(false),
      hasRFID: Joi.boolean().default(false),
      hasClimateControl: Joi.boolean().default(false),
      hasSecurityCamera: Joi.boolean().default(false),
      hasWeightSensor: Joi.boolean().default(false),
      isAutomated: Joi.boolean().default(false)
    }),
    
    status: Joi.string()
      .valid('available', 'occupied', 'reserved', 'blocked', 'maintenance')
      .default('available'),
    
    metadata: Joi.object({
      barcode: Joi.string().trim().max(50),
      rfidTag: Joi.string().trim().max(50),
      qrCode: Joi.string().trim().max(200),
      notes: Joi.string().trim().max(1000).allow(''),
      tags: Joi.array().items(Joi.string().trim().max(30))
    })
  }),
  
  update: Joi.object({
    name: Joi.string().trim().max(100),
    description: Joi.string().trim().max(500).allow(''),
    type: Joi.string().valid('zone', 'aisle', 'rack', 'shelf', 'bin', 'floor', 'dock', 'staging'),
    
    hierarchy: Joi.object({
      level: Joi.number().min(1).max(10),
      parent: commonSchemas.objectId.allow(null),
      path: Joi.string().trim().max(200)
    }),
    
    coordinates: Joi.object({
      x: Joi.number().min(0),
      y: Joi.number().min(0),
      z: Joi.number().min(0)
    }),
    
    dimensions: Joi.object({
      length: Joi.number().min(0),
      width: Joi.number().min(0),
      height: Joi.number().min(0),
      unit: Joi.string().valid('cm', 'm', 'in', 'ft')
    }),
    
    capacity: Joi.object({
      weight: Joi.object({
        value: Joi.number().min(0),
        unit: Joi.string().valid('kg', 'lbs', 'ton')
      }),
      volume: Joi.object({
        value: Joi.number().min(0),
        unit: Joi.string().valid('m3', 'ft3', 'liter')
      }),
      slots: Joi.number().min(0)
    }),
    
    restrictions: Joi.object({
      temperature: Joi.object({
        min: Joi.number(),
        max: Joi.number(),
        unit: Joi.string().valid('celsius', 'fahrenheit')
      }),
      humidity: Joi.object({
        min: Joi.number().min(0).max(100),
        max: Joi.number().min(0).max(100)
      }),
      hazmat: Joi.boolean(),
      fragile: Joi.boolean(),
      perishable: Joi.boolean()
    }),
    
    features: Joi.object({
      hasBarcode: Joi.boolean(),
      hasRFID: Joi.boolean(),
      hasClimateControl: Joi.boolean(),
      hasSecurityCamera: Joi.boolean(),
      hasWeightSensor: Joi.boolean(),
      isAutomated: Joi.boolean()
    }),
    
    status: Joi.string().valid('available', 'occupied', 'reserved', 'blocked', 'maintenance'),
    
    metadata: Joi.object({
      barcode: Joi.string().trim().max(50),
      rfidTag: Joi.string().trim().max(50),
      qrCode: Joi.string().trim().max(200),
      notes: Joi.string().trim().max(1000).allow(''),
      tags: Joi.array().items(Joi.string().trim().max(30))
    })
  }),
  
  query: Joi.object({
    warehouse: commonSchemas.objectId,
    code: Joi.string().trim(),
    name: Joi.string().trim(),
    type: Joi.string().valid('zone', 'aisle', 'rack', 'shelf', 'bin', 'floor', 'dock', 'staging'),
    status: Joi.string().valid('available', 'occupied', 'reserved', 'blocked', 'maintenance'),
    parent: commonSchemas.objectId,
    level: Joi.number().min(1).max(10),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort: Joi.string().default('createdAt')
  })
}

module.exports = {
  locationSchemas
}
