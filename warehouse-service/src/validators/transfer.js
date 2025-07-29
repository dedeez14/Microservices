const Joi = require('joi')
const { commonSchemas } = require('../utils/schemas')

// Transfer validation schemas
const transferSchemas = {
  create: Joi.object({
    type: Joi.string()
      .required()
      .valid('internal', 'warehouse_to_warehouse', 'inbound', 'outbound', 'adjustment', 'cycle_count'),
    
    source: Joi.object({
      warehouse: commonSchemas.objectId,
      location: commonSchemas.objectId,
      external: Joi.object({
        name: Joi.string().trim().max(100),
        address: Joi.string().trim().max(200),
        contact: Joi.string().trim().max(100)
      })
    }).required(),
    
    destination: Joi.object({
      warehouse: commonSchemas.objectId,
      location: commonSchemas.objectId,
      external: Joi.object({
        name: Joi.string().trim().max(100),
        address: Joi.string().trim().max(200),
        contact: Joi.string().trim().max(100)
      })
    }).required(),
    
    items: Joi.array().items(
      Joi.object({
        product: Joi.object({
          sku: Joi.string().required().trim().uppercase().max(50),
          name: Joi.string().required().trim().max(200),
          description: Joi.string().trim().max(500).allow('')
        }).required(),
        
        batch: Joi.object({
          number: Joi.string().trim().max(50).allow(''),
          expiryDate: Joi.date()
        }),
        
        quantity: Joi.object({
          requested: Joi.number().required().min(1),
          transferred: Joi.number().min(0).default(0),
          unit: Joi.string().required().valid('pcs', 'kg', 'lbs', 'ton', 'liter', 'gallon', 'box', 'pallet', 'case')
        }).required(),
        
        cost: Joi.object({
          unitCost: Joi.number().min(0),
          totalCost: Joi.number().min(0)
        }),
        
        tracking: Joi.object({
          serialNumbers: Joi.array().items(Joi.string().trim().max(100)),
          lotNumber: Joi.string().trim().max(50).allow('')
        }),
        
        notes: Joi.string().trim().max(500).allow('')
      })
    ).min(1).required(),
    
    priority: Joi.string()
      .valid('low', 'normal', 'high', 'urgent')
      .default('normal'),
    
    dates: Joi.object({
      expectedDelivery: Joi.date().min('now')
    }),
    
    personnel: Joi.object({
      requestedBy: Joi.object({
        id: Joi.string().required().trim(),
        name: Joi.string().required().trim().max(100),
        email: Joi.string().email().trim().lowercase()
      }).required()
    }).required(),
    
    shipping: Joi.object({
      carrier: Joi.string().trim().max(100).allow(''),
      method: Joi.string().valid('ground', 'air', 'sea', 'rail', 'courier', 'pickup'),
      cost: Joi.number().min(0)
    }),
    
    reference: Joi.object({
      externalId: Joi.string().trim().max(100).allow(''),
      purchaseOrder: Joi.string().trim().max(100).allow(''),
      salesOrder: Joi.string().trim().max(100).allow(''),
      invoice: Joi.string().trim().max(100).allow('')
    }),
    
    metadata: Joi.object({
      tags: Joi.array().items(Joi.string().trim().max(30)),
      notes: Joi.string().trim().max(1000).allow('')
    })
  }),
  
  update: Joi.object({
    priority: Joi.string().valid('low', 'normal', 'high', 'urgent'),
    
    dates: Joi.object({
      expectedDelivery: Joi.date()
    }),
    
    personnel: Joi.object({
      approvedBy: Joi.object({
        id: Joi.string().trim(),
        name: Joi.string().trim().max(100),
        email: Joi.string().email().trim().lowercase()
      }),
      assignedTo: Joi.object({
        id: Joi.string().trim(),
        name: Joi.string().trim().max(100),
        email: Joi.string().email().trim().lowercase()
      })
    }),
    
    shipping: Joi.object({
      carrier: Joi.string().trim().max(100).allow(''),
      trackingNumber: Joi.string().trim().max(100).allow(''),
      method: Joi.string().valid('ground', 'air', 'sea', 'rail', 'courier', 'pickup'),
      cost: Joi.number().min(0)
    }),
    
    reference: Joi.object({
      externalId: Joi.string().trim().max(100).allow(''),
      purchaseOrder: Joi.string().trim().max(100).allow(''),
      salesOrder: Joi.string().trim().max(100).allow(''),
      invoice: Joi.string().trim().max(100).allow('')
    }),
    
    metadata: Joi.object({
      tags: Joi.array().items(Joi.string().trim().max(30)),
      notes: Joi.string().trim().max(1000).allow('')
    })
  }),
  
  updateItem: Joi.object({
    quantity: Joi.object({
      transferred: Joi.number().min(0)
    }),
    status: Joi.string().valid('pending', 'picked', 'shipped', 'received', 'cancelled'),
    notes: Joi.string().trim().max(500).allow('')
  }),
  
  approve: Joi.object({
    approvedBy: Joi.object({
      id: Joi.string().required().trim(),
      name: Joi.string().required().trim().max(100),
      email: Joi.string().email().trim().lowercase()
    }).required(),
    notes: Joi.string().trim().max(500).allow('')
  }),
  
  start: Joi.object({
    assignedTo: Joi.object({
      id: Joi.string().required().trim(),
      name: Joi.string().required().trim().max(100),
      email: Joi.string().email().trim().lowercase()
    }).required()
  }),
  
  cancel: Joi.object({
    reason: Joi.string().required().trim().max(500)
  }),
  
  query: Joi.object({
    transferNumber: Joi.string().trim(),
    type: Joi.string().valid('internal', 'warehouse_to_warehouse', 'inbound', 'outbound', 'adjustment', 'cycle_count'),
    status: Joi.string().valid('draft', 'approved', 'in_progress', 'completed', 'cancelled', 'partially_completed'),
    priority: Joi.string().valid('low', 'normal', 'high', 'urgent'),
    sourceWarehouse: commonSchemas.objectId,
    destinationWarehouse: commonSchemas.objectId,
    sku: Joi.string().trim(),
    requestedBy: Joi.string().trim(),
    dateFrom: Joi.date(),
    dateTo: Joi.date(),
    overdue: Joi.boolean(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort: Joi.string().default('createdAt')
  })
}

module.exports = {
  transferSchemas
}
