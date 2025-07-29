const { warehouseService } = require('../../src/services')
const { Warehouse } = require('../../src/models')

describe('Warehouse Service', () => {
  describe('createWarehouse', () => {
    it('should create a new warehouse successfully', async () => {
      const warehouseData = {
        name: 'Main Warehouse',
        code: 'WH001',
        address: {
          street: '123 Main St',
          city: 'Jakarta',
          state: 'DKI Jakarta',
          country: 'Indonesia',
          postalCode: '12345'
        },
        contactInfo: {
          phone: '+62123456789',
          email: 'warehouse@example.com'
        },
        type: 'main',
        capacity: {
          maxWeight: 10000,
          maxVolume: 5000,
          unit: 'kg'
        }
      }

      const warehouse = await warehouseService.createWarehouse(warehouseData)

      expect(warehouse).toBeDefined()
      expect(warehouse.name).toBe(warehouseData.name)
      expect(warehouse.code).toBe(warehouseData.code)
      expect(warehouse.status).toBe('active')
      expect(warehouse.address.city).toBe(warehouseData.address.city)
    })

    it('should throw error for duplicate warehouse code', async () => {
      const warehouseData = {
        name: 'First Warehouse',
        code: 'WH001',
        address: {
          street: '123 Main St',
          city: 'Jakarta',
          state: 'DKI Jakarta',
          country: 'Indonesia',
          postalCode: '12345'
        },
        type: 'main'
      }

      // Create first warehouse
      await warehouseService.createWarehouse(warehouseData)

      // Try to create warehouse with same code
      const duplicateData = { ...warehouseData, name: 'Second Warehouse' }
      
      await expect(warehouseService.createWarehouse(duplicateData))
        .rejects.toThrow('Warehouse code already exists')
    })
  })

  describe('getWarehouses', () => {
    beforeEach(async () => {
      // Create test warehouses
      await Warehouse.create([
        {
          name: 'Warehouse A',
          code: 'WHA001',
          address: {
            street: '123 Street A',
            city: 'Jakarta',
            state: 'DKI Jakarta',
            country: 'Indonesia',
            postalCode: '12345'
          },
          type: 'main',
          status: 'active'
        },
        {
          name: 'Warehouse B',
          code: 'WHB001',
          address: {
            street: '456 Street B',
            city: 'Bandung',
            state: 'West Java',
            country: 'Indonesia',
            postalCode: '54321'
          },
          type: 'distribution',
          status: 'active'
        },
        {
          name: 'Warehouse C',
          code: 'WHC001',
          address: {
            street: '789 Street C',
            city: 'Surabaya',
            state: 'East Java',
            country: 'Indonesia',
            postalCode: '67890'
          },
          type: 'storage',
          status: 'inactive'
        }
      ])
    })

    it('should return paginated warehouses', async () => {
      const result = await warehouseService.getWarehouses({
        page: 1,
        limit: 2
      })

      expect(result.data).toHaveLength(2)
      expect(result.pagination.totalRecords).toBe(3)
      expect(result.pagination.totalPages).toBe(2)
      expect(result.pagination.currentPage).toBe(1)
    })

    it('should filter warehouses by status', async () => {
      const result = await warehouseService.getWarehouses({
        filters: { status: 'active' }
      })

      expect(result.data).toHaveLength(2)
      result.data.forEach(warehouse => {
        expect(warehouse.status).toBe('active')
      })
    })

    it('should filter warehouses by type', async () => {
      const result = await warehouseService.getWarehouses({
        filters: { type: 'main' }
      })

      expect(result.data).toHaveLength(1)
      expect(result.data[0].type).toBe('main')
    })

    it('should search warehouses by name', async () => {
      const result = await warehouseService.getWarehouses({
        search: 'Warehouse A'
      })

      expect(result.data).toHaveLength(1)
      expect(result.data[0].name).toBe('Warehouse A')
    })
  })

  describe('updateWarehouse', () => {
    let warehouse

    beforeEach(async () => {
      warehouse = await Warehouse.create({
        name: 'Test Warehouse',
        code: 'TEST001',
        address: {
          street: '123 Test St',
          city: 'Jakarta',
          state: 'DKI Jakarta',
          country: 'Indonesia',
          postalCode: '12345'
        },
        type: 'main',
        status: 'active'
      })
    })

    it('should update warehouse successfully', async () => {
      const updateData = {
        name: 'Updated Warehouse',
        capacity: {
          maxWeight: 15000,
          maxVolume: 7500,
          unit: 'kg'
        }
      }

      const updatedWarehouse = await warehouseService.updateWarehouse(
        warehouse._id,
        updateData
      )

      expect(updatedWarehouse.name).toBe(updateData.name)
      expect(updatedWarehouse.capacity.maxWeight).toBe(updateData.capacity.maxWeight)
      expect(updatedWarehouse.updatedAt).toBeDefined()
    })

    it('should throw error for non-existent warehouse', async () => {
      const fakeId = new mongoose.Types.ObjectId()
      
      await expect(warehouseService.updateWarehouse(fakeId, { name: 'Test' }))
        .rejects.toThrow('Warehouse not found')
    })
  })
})
