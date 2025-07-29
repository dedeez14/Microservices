/**
 * Seed script for warehouse service
 * This script creates sample data for development and testing
 */

require('dotenv').config()
const mongoose = require('mongoose')
const { Warehouse, Location, Inventory } = require('../src/models')
const database = require('../src/config/database')
const logger = require('../src/utils/logger')

const sampleWarehouses = [
  {
    name: 'Jakarta Main Warehouse',
    code: 'JKT-MAIN-001',
    description: 'Primary warehouse facility in Jakarta',
    address: {
      street: 'Jl. Sudirman No. 123',
      city: 'Jakarta',
      state: 'DKI Jakarta',
      country: 'Indonesia',
      postalCode: '10220',
      coordinates: {
        latitude: -6.2088,
        longitude: 106.8456
      }
    },
    contactInfo: {
      phone: '+62-21-12345678',
      email: 'jakarta.warehouse@company.com',
      manager: 'John Doe'
    },
    type: 'main',
    status: 'active',
    capacity: {
      maxWeight: 50000,
      maxVolume: 25000,
      unit: 'kg'
    },
    settings: {
      temperatureControlled: true,
      humidityControlled: true,
      securityLevel: 'high'
    }
  },
  {
    name: 'Bandung Distribution Center',
    code: 'BDG-DIST-001',
    description: 'Regional distribution center for West Java',
    address: {
      street: 'Jl. Asia Afrika No. 456',
      city: 'Bandung',
      state: 'West Java',
      country: 'Indonesia',
      postalCode: '40111',
      coordinates: {
        latitude: -6.9175,
        longitude: 107.6191
      }
    },
    contactInfo: {
      phone: '+62-22-87654321',
      email: 'bandung.warehouse@company.com',
      manager: 'Jane Smith'
    },
    type: 'distribution',
    status: 'active',
    capacity: {
      maxWeight: 30000,
      maxVolume: 15000,
      unit: 'kg'
    },
    settings: {
      temperatureControlled: false,
      humidityControlled: false,
      securityLevel: 'medium'
    }
  },
  {
    name: 'Surabaya Storage Facility',
    code: 'SBY-STOR-001',
    description: 'Long-term storage facility in East Java',
    address: {
      street: 'Jl. Basuki Rahmat No. 789',
      city: 'Surabaya',
      state: 'East Java',
      country: 'Indonesia',
      postalCode: '60261',
      coordinates: {
        latitude: -7.2575,
        longitude: 112.7521
      }
    },
    contactInfo: {
      phone: '+62-31-11111111',
      email: 'surabaya.warehouse@company.com',
      manager: 'Bob Johnson'
    },
    type: 'storage',
    status: 'active',
    capacity: {
      maxWeight: 75000,
      maxVolume: 40000,
      unit: 'kg'
    },
    settings: {
      temperatureControlled: true,
      humidityControlled: true,
      securityLevel: 'high'
    }
  }
]

const sampleLocations = [
  // Jakarta Main Warehouse Locations
  {
    code: 'JKT-A-01-01',
    name: 'Zone A - Rack 1 - Level 1',
    description: 'High-frequency access area',
    warehouse: null, // Will be set after warehouse creation
    zone: 'A',
    aisle: '01',
    rack: '01',
    shelf: '01',
    type: 'rack',
    status: 'active',
    capacity: {
      maxWeight: 500,
      maxVolume: 100,
      unit: 'kg'
    },
    coordinates: {
      x: 10,
      y: 5,
      z: 1
    },
    properties: {
      temperature: 25,
      humidity: 60,
      accessible: true
    }
  },
  {
    code: 'JKT-A-01-02',
    name: 'Zone A - Rack 1 - Level 2',
    description: 'Medium-frequency access area',
    warehouse: null,
    zone: 'A',
    aisle: '01',
    rack: '01',
    shelf: '02',
    type: 'rack',
    status: 'active',
    capacity: {
      maxWeight: 500,
      maxVolume: 100,
      unit: 'kg'
    },
    coordinates: {
      x: 10,
      y: 5,
      z: 2
    },
    properties: {
      temperature: 25,
      humidity: 60,
      accessible: true
    }
  },
  {
    code: 'JKT-B-01-01',
    name: 'Zone B - Floor Storage',
    description: 'Bulk items storage area',
    warehouse: null,
    zone: 'B',
    aisle: '01',
    rack: null,
    shelf: null,
    type: 'floor',
    status: 'active',
    capacity: {
      maxWeight: 2000,
      maxVolume: 500,
      unit: 'kg'
    },
    coordinates: {
      x: 25,
      y: 10,
      z: 0
    },
    properties: {
      temperature: 25,
      humidity: 60,
      accessible: true
    }
  }
]

const sampleInventory = [
  {
    sku: 'LAPTOP-001',
    productName: 'Business Laptop',
    description: 'High-performance laptop for business use',
    category: 'Electronics',
    warehouse: null, // Will be set after warehouse creation
    location: null, // Will be set after location creation
    quantity: {
      available: 50,
      reserved: 5,
      onOrder: 20,
      unit: 'pieces'
    },
    cost: {
      unitCost: 15000000,
      totalValue: 750000000,
      currency: 'IDR'
    },
    specifications: {
      weight: 2.5,
      dimensions: {
        length: 35,
        width: 25,
        height: 2.5,
        unit: 'cm'
      },
      volume: 2.1875
    },
    tracking: {
      serialNumbers: [],
      batchNumber: 'BATCH-2024-001',
      expiryDate: null,
      manufactureDate: new Date('2024-01-15')
    },
    status: 'active',
    minimumStock: 10,
    maximumStock: 100,
    reorderPoint: 15
  },
  {
    sku: 'MOUSE-001',
    productName: 'Wireless Mouse',
    description: 'Ergonomic wireless mouse',
    category: 'Electronics',
    warehouse: null,
    location: null,
    quantity: {
      available: 200,
      reserved: 10,
      onOrder: 0,
      unit: 'pieces'
    },
    cost: {
      unitCost: 250000,
      totalValue: 50000000,
      currency: 'IDR'
    },
    specifications: {
      weight: 0.1,
      dimensions: {
        length: 12,
        width: 6,
        height: 4,
        unit: 'cm'
      },
      volume: 0.288
    },
    tracking: {
      serialNumbers: [],
      batchNumber: 'BATCH-2024-002',
      expiryDate: null,
      manufactureDate: new Date('2024-02-01')
    },
    status: 'active',
    minimumStock: 50,
    maximumStock: 500,
    reorderPoint: 75
  }
]

async function seedData() {
  try {
    logger.info('Starting database seeding...')
    
    // Connect to database
    await database.connect()
    
    // Clear existing data
    logger.info('Clearing existing data...')
    await Promise.all([
      Warehouse.deleteMany({}),
      Location.deleteMany({}),
      Inventory.deleteMany({})
    ])
    
    // Create warehouses
    logger.info('Creating sample warehouses...')
    const createdWarehouses = await Warehouse.insertMany(sampleWarehouses)
    logger.info(`Created ${createdWarehouses.length} warehouses`)
    
    // Create locations
    logger.info('Creating sample locations...')
    const jakartaWarehouse = createdWarehouses.find(w => w.code === 'JKT-MAIN-001')
    
    // Update locations with warehouse reference
    const locationsWithWarehouse = sampleLocations.map(location => ({
      ...location,
      warehouse: jakartaWarehouse._id
    }))
    
    const createdLocations = await Location.insertMany(locationsWithWarehouse)
    logger.info(`Created ${createdLocations.length} locations`)
    
    // Create inventory
    logger.info('Creating sample inventory...')
    const firstLocation = createdLocations[0]
    const secondLocation = createdLocations[1]
    
    // Update inventory with warehouse and location references
    const inventoryWithReferences = sampleInventory.map((item, index) => ({
      ...item,
      warehouse: jakartaWarehouse._id,
      location: index === 0 ? firstLocation._id : secondLocation._id
    }))
    
    const createdInventory = await Inventory.insertMany(inventoryWithReferences)
    logger.info(`Created ${createdInventory.length} inventory items`)
    
    // Log summary
    logger.info('Database seeding completed successfully!')
    logger.info('Summary:', {
      warehouses: createdWarehouses.length,
      locations: createdLocations.length,
      inventory: createdInventory.length
    })
    
    console.log(`
✅ Database seeding completed successfully!

📊 Created:
   - ${createdWarehouses.length} Warehouses
   - ${createdLocations.length} Locations  
   - ${createdInventory.length} Inventory Items

🏢 Sample Warehouses:
${createdWarehouses.map(w => `   - ${w.name} (${w.code})`).join('\n')}

📍 Sample Locations:
${createdLocations.map(l => `   - ${l.name} (${l.code})`).join('\n')}

📦 Sample Inventory:
${createdInventory.map(i => `   - ${i.productName} (${i.sku}) - ${i.quantity.available} units`).join('\n')}
    `)
    
  } catch (error) {
    logger.error('Database seeding failed:', error)
    console.error('❌ Database seeding failed:', error.message)
    process.exit(1)
  } finally {
    await database.disconnect()
    process.exit(0)
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedData()
}

module.exports = {
  seedData,
  sampleWarehouses,
  sampleLocations,
  sampleInventory
}
