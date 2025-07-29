const Joi = require('joi')
const { commonSchemas } = require('../utils/schemas')

// Inventory transaction validation schemas
const inventoryTransactionSchemas = {
  // Common transaction fields
  transactionBase: Joi.object({
    inventoryId: commonSchemas.objectId.required(),
    quantity: Joi.number()
      .required()
      .min(0.01)
      .max(999999999)
      .messages({
        'number.min': 'Quantity must be greater than 0',
        'number.max': 'Quantity cannot exceed 999,999,999'
      }),
    
    cost: Joi.object({
      unitCost: Joi.number().min(0),
      totalCost: Joi.number().min(0),
      currency: Joi.string().length(3).uppercase().default('IDR')
    }),
    
    reference: Joi.object({
      type: Joi.string().valid(
        'PURCHASE_ORDER', 'SALES_ORDER', 'TRANSFER', 'RETURN', 
        'ADJUSTMENT', 'PRODUCTION', 'OTHER'
      ).default('OTHER'),
      number: Joi.string().trim().max(50).allow(''),
      date: Joi.date()
    }),
    
    party: Joi.object({
      type: Joi.string().valid('SUPPLIER', 'CUSTOMER', 'INTERNAL', 'OTHER').default('OTHER'),
      name: Joi.string().trim().max(200).allow(''),
      code: Joi.string().trim().max(50).allow(''),
      contact: Joi.object({
        email: Joi.string().email().trim().lowercase().allow(''),
        phone: Joi.string().trim().max(20).allow('')
      })
    }),
    
    batch: Joi.object({
      number: Joi.string().trim().max(50).allow(''),
      manufactureDate: Joi.date(),
      expiryDate: Joi.date().greater(Joi.ref('manufactureDate'))
    }),
    
    quality: Joi.object({
      status: Joi.string().valid('GOOD', 'DAMAGED', 'EXPIRED', 'QUARANTINE').default('GOOD'),
      inspector: Joi.string().trim().max(100).allow(''),
      notes: Joi.string().trim().max(500).allow('')
    }),
    
    reason: Joi.string()
      .required()
      .trim()
      .max(200)
      .messages({
        'string.empty': 'Transaction reason is required',
        'string.max': 'Reason cannot exceed 200 characters'
      }),
    
    notes: Joi.string().trim().max(1000).allow(''),
    
    createdBy: Joi.object({
      userId: Joi.string().required().trim(),
      userName: Joi.string().required().trim().max(100)
    }).required()
  }),
  
  // Inbound transaction (barang masuk)
  inbound: Joi.object({
    inventoryId: commonSchemas.objectId.required(),
    quantity: Joi.number()
      .required()
      .min(0.01)
      .max(999999999)
      .messages({
        'number.min': 'Inbound quantity must be greater than 0',
        'number.max': 'Quantity cannot exceed 999,999,999'
      }),
    
    cost: Joi.object({
      unitCost: Joi.number().min(0).required().messages({
        'number.base': 'Unit cost must be a number',
        'number.min': 'Unit cost cannot be negative',
        'any.required': 'Unit cost is required for inbound transactions'
      }),
      currency: Joi.string().length(3).uppercase().default('IDR')
    }).required(),
    
    reference: Joi.object({
      type: Joi.string().valid(
        'PURCHASE_ORDER', 'PRODUCTION', 'RETURN', 'TRANSFER', 'OTHER'
      ).default('PURCHASE_ORDER'),
      number: Joi.string().trim().max(50).when('type', {
        is: 'PURCHASE_ORDER',
        then: Joi.required(),
        otherwise: Joi.optional()
      }),
      date: Joi.date().max('now').required()
    }).required(),
    
    party: Joi.object({
      type: Joi.string().valid('SUPPLIER', 'INTERNAL', 'OTHER').default('SUPPLIER'),
      name: Joi.string().trim().max(200).required().messages({
        'any.required': 'Supplier/party name is required for inbound transactions'
      }),
      code: Joi.string().trim().max(50),
      contact: Joi.object({
        email: Joi.string().email().trim().lowercase(),
        phone: Joi.string().trim().max(20)
      })
    }).required(),
    
    batch: Joi.object({
      number: Joi.string().trim().max(50),
      manufactureDate: Joi.date().max('now'),
      expiryDate: Joi.date().greater(Joi.ref('manufactureDate'))
    }),
    
    quality: Joi.object({
      status: Joi.string().valid('GOOD', 'DAMAGED', 'QUARANTINE').default('GOOD'),
      inspector: Joi.string().trim().max(100),
      notes: Joi.string().trim().max(500)
    }),
    
    reason: Joi.string()
      .required()
      .trim()
      .max(200)
      .messages({
        'string.empty': 'Reason for inbound transaction is required'
      }),
    
    notes: Joi.string().trim().max(1000).allow(''),
    
    createdBy: Joi.object({
      userId: Joi.string().required().trim(),
      userName: Joi.string().required().trim().max(100)
    }).required()
  }),
  
  // Outbound transaction (barang keluar)
  outbound: Joi.object({
    inventoryId: commonSchemas.objectId.required(),
    quantity: Joi.number()
      .required()
      .min(0.01)
      .max(999999999)
      .messages({
        'number.min': 'Outbound quantity must be greater than 0',
        'number.max': 'Quantity cannot exceed 999,999,999'
      }),
    
    cost: Joi.object({
      unitCost: Joi.number().min(0),
      currency: Joi.string().length(3).uppercase().default('IDR')
    }),
    
    reference: Joi.object({
      type: Joi.string().valid(
        'SALES_ORDER', 'TRANSFER', 'PRODUCTION', 'RETURN', 'OTHER'
      ).default('SALES_ORDER'),
      number: Joi.string().trim().max(50).when('type', {
        is: 'SALES_ORDER',
        then: Joi.required(),
        otherwise: Joi.optional()
      }),
      date: Joi.date().max('now').required()
    }).required(),
    
    party: Joi.object({
      type: Joi.string().valid('CUSTOMER', 'INTERNAL', 'OTHER').default('CUSTOMER'),
      name: Joi.string().trim().max(200).required().messages({
        'any.required': 'Customer/party name is required for outbound transactions'
      }),
      code: Joi.string().trim().max(50),
      contact: Joi.object({
        email: Joi.string().email().trim().lowercase(),
        phone: Joi.string().trim().max(20)
      })
    }).required(),
    
    batch: Joi.object({
      number: Joi.string().trim().max(50),
      manufactureDate: Joi.date(),
      expiryDate: Joi.date()
    }),
    
    quality: Joi.object({
      status: Joi.string().valid('GOOD', 'DAMAGED', 'EXPIRED').default('GOOD'),
      inspector: Joi.string().trim().max(100),
      notes: Joi.string().trim().max(500)
    }),
    
    reason: Joi.string()
      .required()
      .trim()
      .max(200)
      .messages({
        'string.empty': 'Reason for outbound transaction is required'
      }),
    
    notes: Joi.string().trim().max(1000).allow(''),
    
    createdBy: Joi.object({
      userId: Joi.string().required().trim(),
      userName: Joi.string().required().trim().max(100)
    }).required()
  }),
  
  // Inventory adjustment
  adjustment: Joi.object({
    inventoryId: commonSchemas.objectId.required(),
    newQuantity: Joi.number()
      .required()
      .min(0)
      .max(999999999)
      .messages({
        'number.min': 'New quantity cannot be negative',
        'number.max': 'Quantity cannot exceed 999,999,999'
      }),
    
    reason: Joi.string()
      .required()
      .trim()
      .max(200)
      .valid(
        'PHYSICAL_COUNT', 'DAMAGE', 'EXPIRY', 'LOSS', 'THEFT', 
        'SYSTEM_ERROR', 'QUALITY_ISSUE', 'OTHER'
      )
      .messages({
        'string.empty': 'Adjustment reason is required',
        'any.only': 'Invalid adjustment reason'
      }),
    
    notes: Joi.string().trim().max(1000).required().messages({
      'string.empty': 'Adjustment notes are required for audit purposes'
    }),
    
    createdBy: Joi.object({
      userId: Joi.string().required().trim(),
      userName: Joi.string().required().trim().max(100)
    }).required()
  }),
  
  // Query filters
  queryFilters: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    warehouse: commonSchemas.objectId,
    location: commonSchemas.objectId,
    type: Joi.string().valid('INBOUND', 'OUTBOUND', 'ADJUSTMENT', 'TRANSFER_IN', 'TRANSFER_OUT'),
    status: Joi.string().valid('PENDING', 'CONFIRMED', 'CANCELLED'),
    sku: Joi.string().trim().uppercase(),
    startDate: Joi.date(),
    endDate: Joi.date().greater(Joi.ref('startDate')),
    sort: Joi.string().valid('date', '-date', 'type', '-type', 'quantity', '-quantity').default('-date')
  }),
  
  // Transaction summary filters
  summaryFilters: Joi.object({
    warehouse: commonSchemas.objectId,
    type: Joi.string().valid('INBOUND', 'OUTBOUND', 'ADJUSTMENT', 'TRANSFER_IN', 'TRANSFER_OUT'),
    startDate: Joi.date().required().messages({
      'any.required': 'Start date is required for summary reports'
    }),
    endDate: Joi.date().greater(Joi.ref('startDate')).required().messages({
      'any.required': 'End date is required for summary reports',
      'date.greater': 'End date must be after start date'
    })
  }),
  
  // Cancel transaction
  cancelTransaction: Joi.object({
    reason: Joi.string()
      .required()
      .trim()
      .max(200)
      .messages({
        'string.empty': 'Cancellation reason is required'
      }),
    
    cancelledBy: Joi.object({
      userId: Joi.string().required().trim(),
      userName: Joi.string().required().trim().max(100)
    }).required()
  })
}

module.exports = inventoryTransactionSchemas
