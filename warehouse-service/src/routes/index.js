const express = require('express')
const warehouseRoutes = require('./warehouses')
const locationRoutes = require('./locations')
const inventoryRoutes = require('./inventory')
const inventoryTransactionRoutes = require('./inventoryTransactions')
const transferRoutes = require('./transfers')

const router = express.Router()

/**
 * @swagger
 * /api/v1/health:
 *   get:
 *     summary: Health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     service:
 *                       type: string
 *                     version:
 *                       type: string
 *                     timestamp:
 *                       type: string
 *                     uptime:
 *                       type: number
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Warehouse service is healthy',
    data: {
      service: 'warehouse-service',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    }
  })
})

// Mount routes
router.use('/warehouses', warehouseRoutes)
router.use('/locations', locationRoutes)
router.use('/inventory', inventoryRoutes)
router.use('/inventory-transactions', inventoryTransactionRoutes)
router.use('/transfers', transferRoutes)

module.exports = router
