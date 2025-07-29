const express = require('express')
const { inventoryController } = require('../controllers')
const { validate } = require('../middleware/validation')
const { inventorySchemas } = require('../validators')

const router = express.Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     Inventory:
 *       type: object
 *       required:
 *         - warehouse
 *         - location
 *         - product
 *         - quantity
 *       properties:
 *         warehouse:
 *           type: string
 *           description: Warehouse ID
 *         location:
 *           type: string
 *           description: Location ID
 *         product:
 *           type: object
 *           properties:
 *             sku:
 *               type: string
 *             name:
 *               type: string
 *             category:
 *               type: string
 *         quantity:
 *           type: object
 *           properties:
 *             available:
 *               type: number
 *             unit:
 *               type: string
 */

/**
 * @swagger
 * /api/v1/inventory:
 *   post:
 *     summary: Create a new inventory item
 *     tags: [Inventory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Inventory'
 *     responses:
 *       201:
 *         description: Inventory item created successfully
 */
router.post('/', 
  validate(inventorySchemas.create),
  inventoryController.createInventoryItem
)

/**
 * @swagger
 * /api/v1/inventory:
 *   get:
 *     summary: Get all inventory items with pagination and filtering
 *     tags: [Inventory]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: warehouse
 *         schema:
 *           type: string
 *       - in: query
 *         name: sku
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: stockStatus
 *         schema:
 *           type: string
 *           enum: [out_of_stock, critical, low, adequate]
 *     responses:
 *       200:
 *         description: Inventory retrieved successfully
 */
router.get('/', 
  validate(inventorySchemas.query, 'query'),
  inventoryController.getInventory
)

/**
 * @swagger
 * /api/v1/inventory/low-stock:
 *   get:
 *     summary: Get low stock items
 *     tags: [Inventory]
 *     parameters:
 *       - in: query
 *         name: warehouseId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Low stock items retrieved successfully
 */
router.get('/low-stock', inventoryController.getLowStockItems)

/**
 * @swagger
 * /api/v1/inventory/expiring:
 *   get:
 *     summary: Get expiring items
 *     tags: [Inventory]
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *       - in: query
 *         name: warehouseId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Expiring items retrieved successfully
 */
router.get('/expiring', inventoryController.getExpiringItems)

/**
 * @swagger
 * /api/v1/inventory/warehouse/{warehouseId}:
 *   get:
 *     summary: Get inventory by warehouse
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: warehouseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Warehouse inventory retrieved successfully
 */
router.get('/warehouse/:warehouseId', inventoryController.getInventoryByWarehouse)

/**
 * @swagger
 * /api/v1/inventory/warehouse/{warehouseId}/summary:
 *   get:
 *     summary: Get warehouse inventory summary
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: warehouseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Warehouse inventory summary retrieved successfully
 */
router.get('/warehouse/:warehouseId/summary', inventoryController.getWarehouseInventorySummary)

/**
 * @swagger
 * /api/v1/inventory/sku/{sku}:
 *   get:
 *     summary: Get inventory by SKU
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: sku
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: warehouseId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Inventory retrieved successfully
 */
router.get('/sku/:sku', inventoryController.getInventoryBySku)

/**
 * @swagger
 * /api/v1/inventory/{id}:
 *   get:
 *     summary: Get inventory item by ID
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Inventory item retrieved successfully
 *       404:
 *         description: Inventory item not found
 */
router.get('/:id', inventoryController.getInventoryById)

/**
 * @swagger
 * /api/v1/inventory/{id}:
 *   put:
 *     summary: Update inventory item
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Inventory'
 *     responses:
 *       200:
 *         description: Inventory item updated successfully
 *       404:
 *         description: Inventory item not found
 */
router.put('/:id', 
  validate(inventorySchemas.update),
  inventoryController.updateInventoryItem
)

/**
 * @swagger
 * /api/v1/inventory/{id}:
 *   delete:
 *     summary: Delete inventory item
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Inventory item deleted successfully
 *       404:
 *         description: Inventory item not found
 */
router.delete('/:id', inventoryController.deleteInventoryItem)

/**
 * @swagger
 * /api/v1/inventory/{id}/adjust:
 *   post:
 *     summary: Adjust inventory quantity
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: number
 *               reason:
 *                 type: string
 *               reference:
 *                 type: string
 *               adjustedBy:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *     responses:
 *       200:
 *         description: Inventory quantity adjusted successfully
 */
router.post('/:id/adjust', 
  validate(inventorySchemas.adjustment),
  inventoryController.adjustQuantity
)

/**
 * @swagger
 * /api/v1/inventory/{id}/reserve:
 *   post:
 *     summary: Reserve inventory
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: number
 *               reference:
 *                 type: string
 *               reservedBy:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *     responses:
 *       200:
 *         description: Inventory reserved successfully
 */
router.post('/:id/reserve', 
  validate(inventorySchemas.reserve),
  inventoryController.reserveInventory
)

/**
 * @swagger
 * /api/v1/inventory/{id}/release-reservation:
 *   post:
 *     summary: Release inventory reservation
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: number
 *               reference:
 *                 type: string
 *     responses:
 *       200:
 *         description: Inventory reservation released successfully
 */
router.post('/:id/release-reservation', inventoryController.releaseReservation)

/**
 * @swagger
 * /api/v1/inventory/{id}/cycle-count:
 *   post:
 *     summary: Perform cycle count
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               countedQuantity:
 *                 type: number
 *               countedBy:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cycle count completed successfully
 */
router.post('/:id/cycle-count', inventoryController.performCycleCount)

module.exports = router
