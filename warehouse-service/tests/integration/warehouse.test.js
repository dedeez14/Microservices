const request = require('supertest')
const App = require('../../src/app')

describe('Warehouse API Integration Tests', () => {
  let app

  beforeAll(() => {
    const appInstance = new App()
    app = appInstance.app
  })

  describe('POST /api/v1/warehouses', () => {
    it('should create a new warehouse', async () => {
      const warehouseData = {
        name: 'Integration Test Warehouse',
        code: 'INT001',
        address: {
          street: '123 Integration St',
          city: 'Jakarta',
          state: 'DKI Jakarta',
          country: 'Indonesia',
          postalCode: '12345'
        },
        contactInfo: {
          phone: '+62123456789',
          email: 'integration@example.com'
        },
        type: 'main',
        capacity: {
          maxWeight: 10000,
          maxVolume: 5000,
          unit: 'kg'
        }
      }

      const response = await request(app)
        .post('/api/v1/warehouses')
        .send(warehouseData)
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.data.name).toBe(warehouseData.name)
      expect(response.body.data.code).toBe(warehouseData.code)
      expect(response.body.data.status).toBe('active')
    })

    it('should return validation error for invalid data', async () => {
      const invalidData = {
        name: '', // Empty name should fail validation
        code: 'INT002'
      }

      const response = await request(app)
        .post('/api/v1/warehouses')
        .send(invalidData)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('validation')
    })
  })

  describe('GET /api/v1/warehouses', () => {
    beforeEach(async () => {
      // Create test warehouses
      const warehouses = [
        {
          name: 'Test Warehouse 1',
          code: 'TEST001',
          address: {
            street: '123 Test St',
            city: 'Jakarta',
            state: 'DKI Jakarta',
            country: 'Indonesia',
            postalCode: '12345'
          },
          type: 'main'
        },
        {
          name: 'Test Warehouse 2',
          code: 'TEST002',
          address: {
            street: '456 Test Ave',
            city: 'Bandung',
            state: 'West Java',
            country: 'Indonesia',
            postalCode: '54321'
          },
          type: 'distribution'
        }
      ]

      for (const warehouse of warehouses) {
        await request(app)
          .post('/api/v1/warehouses')
          .send(warehouse)
      }
    })

    it('should get all warehouses with pagination', async () => {
      const response = await request(app)
        .get('/api/v1/warehouses')
        .query({ page: 1, limit: 10 })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(Array.isArray(response.body.data)).toBe(true)
      expect(response.body.pagination).toBeDefined()
      expect(response.body.pagination.currentPage).toBe(1)
    })

    it('should filter warehouses by type', async () => {
      const response = await request(app)
        .get('/api/v1/warehouses')
        .query({ type: 'main' })
        .expect(200)

      expect(response.body.success).toBe(true)
      response.body.data.forEach(warehouse => {
        expect(warehouse.type).toBe('main')
      })
    })

    it('should search warehouses by name', async () => {
      const response = await request(app)
        .get('/api/v1/warehouses')
        .query({ search: 'Test Warehouse 1' })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.length).toBeGreaterThan(0)
    })
  })

  describe('GET /api/v1/warehouses/:id', () => {
    let warehouseId

    beforeEach(async () => {
      const warehouseData = {
        name: 'Get Test Warehouse',
        code: 'GET001',
        address: {
          street: '123 Get St',
          city: 'Jakarta',
          state: 'DKI Jakarta',
          country: 'Indonesia',
          postalCode: '12345'
        },
        type: 'main'
      }

      const createResponse = await request(app)
        .post('/api/v1/warehouses')
        .send(warehouseData)

      warehouseId = createResponse.body.data._id
    })

    it('should get warehouse by ID', async () => {
      const response = await request(app)
        .get(`/api/v1/warehouses/${warehouseId}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data._id).toBe(warehouseId)
      expect(response.body.data.name).toBe('Get Test Warehouse')
    })

    it('should return 404 for non-existent warehouse', async () => {
      const fakeId = '507f1f77bcf86cd799439011'
      
      const response = await request(app)
        .get(`/api/v1/warehouses/${fakeId}`)
        .expect(404)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('not found')
    })
  })

  describe('PUT /api/v1/warehouses/:id', () => {
    let warehouseId

    beforeEach(async () => {
      const warehouseData = {
        name: 'Update Test Warehouse',
        code: 'UPD001',
        address: {
          street: '123 Update St',
          city: 'Jakarta',
          state: 'DKI Jakarta',
          country: 'Indonesia',
          postalCode: '12345'
        },
        type: 'main'
      }

      const createResponse = await request(app)
        .post('/api/v1/warehouses')
        .send(warehouseData)

      warehouseId = createResponse.body.data._id
    })

    it('should update warehouse successfully', async () => {
      const updateData = {
        name: 'Updated Warehouse Name',
        capacity: {
          maxWeight: 15000,
          maxVolume: 7500,
          unit: 'kg'
        }
      }

      const response = await request(app)
        .put(`/api/v1/warehouses/${warehouseId}`)
        .send(updateData)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.name).toBe(updateData.name)
      expect(response.body.data.capacity.maxWeight).toBe(updateData.capacity.maxWeight)
    })
  })

  describe('DELETE /api/v1/warehouses/:id', () => {
    let warehouseId

    beforeEach(async () => {
      const warehouseData = {
        name: 'Delete Test Warehouse',
        code: 'DEL001',
        address: {
          street: '123 Delete St',
          city: 'Jakarta',
          state: 'DKI Jakarta',
          country: 'Indonesia',
          postalCode: '12345'
        },
        type: 'main'
      }

      const createResponse = await request(app)
        .post('/api/v1/warehouses')
        .send(warehouseData)

      warehouseId = createResponse.body.data._id
    })

    it('should delete warehouse successfully', async () => {
      const response = await request(app)
        .delete(`/api/v1/warehouses/${warehouseId}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.message).toContain('deleted')

      // Verify warehouse is deleted
      await request(app)
        .get(`/api/v1/warehouses/${warehouseId}`)
        .expect(404)
    })
  })

  describe('GET /api/v1/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/v1/health')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.status).toBe('healthy')
      expect(response.body.data.timestamp).toBeDefined()
    })
  })
})
