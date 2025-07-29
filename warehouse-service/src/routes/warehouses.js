const express = require('express')
const { warehouseController } = require('../controllers')
const { validate } = require('../middleware/validation')
const { warehouseSchemas } = require('../validators')

const router = express.Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     Warehouse:
 *       type: object
 *       required:
 *         - code
 *         - name
 *         - type
 *         - location
 *         - capacity
 *         - contact
 *       properties:
 *         code:
 *           type: string
 *           description: Unique warehouse code
 *         name:
 *           type: string
 *           description: Warehouse name
 *         type:
 *           type: string
 *           enum: [main, transit, retail, distribution, cold_storage, hazmat]
 *         location:
 *           type: object
 *           properties:
 *             address:
 *               type: string
 *             city:
 *               type: string
 *             state:
 *               type: string
 *             country:
 *               type: string
 *             zipCode:
 *               type: string
 */

/**
 * @swagger
 * /api/v1/warehouses:
 *   post:
 *     summary: Create a new warehouse
 *     tags: [Warehouses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Warehouse'
 *     responses:
 *       201:
 *         description: Warehouse created successfully
 *       400:
 *         description: Bad request
 */
router.post('/', 
  validate(warehouseSchemas.create),
  warehouseController.createWarehouse
)

/**
 * @swagger
 * /api/v1/warehouses:
 *   get:
 *     summary: Get all warehouses with pagination and filtering
 *     tags: [Warehouses]
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
 *         name: code
 *         schema:
 *           type: string
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Warehouses retrieved successfully
 */
router.get('/', 
  validate(warehouseSchemas.query, 'query'),
  warehouseController.getWarehouses
)

/**
 * @swagger
 * /api/v1/warehouses/active:
 *   get:
 *     summary: Get all active warehouses
 *     tags: [Warehouses]
 *     responses:
 *       200:
 *         description: Active warehouses retrieved successfully
 */
router.get('/active', warehouseController.getActiveWarehouses)

/**
 * @swagger
 * /api/v1/warehouses/code/{code}:
 *   get:
 *     summary: Get warehouse by code
 *     tags: [Warehouses]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Warehouse retrieved successfully
 *       404:
 *         description: Warehouse not found
 */
router.get('/code/:code', warehouseController.getWarehouseByCode)

/**
 * @swagger
 * /api/v1/warehouses/location/{city}/{state}:
 *   get:
 *     summary: Get warehouses by location
 *     tags: [Warehouses]
 *     parameters:
 *       - in: path
 *         name: city
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: state
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Warehouses retrieved successfully
 */
router.get('/location/:city/:state', warehouseController.getWarehousesByLocation)

/**
 * @swagger
 * /api/v1/warehouses/{id}:
 *   get:
 *     summary: Get warehouse by ID
 *     tags: [Warehouses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Warehouse retrieved successfully
 *       404:
 *         description: Warehouse not found
 */
router.get('/:id', warehouseController.getWarehouseById)

/**
 * @swagger
 * /api/v1/warehouses/{id}:
 *   put:
 *     summary: Update warehouse
 *     tags: [Warehouses]
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
 *             $ref: '#/components/schemas/Warehouse'
 *     responses:
 *       200:
 *         description: Warehouse updated successfully
 *       404:
 *         description: Warehouse not found
 */
router.put('/:id', 
  validate(warehouseSchemas.update),
  warehouseController.updateWarehouse
)

/**
 * @swagger
 * /api/v1/warehouses/{id}:
 *   delete:
 *     summary: Delete warehouse
 *     tags: [Warehouses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Warehouse deleted successfully
 *       404:
 *         description: Warehouse not found
 */
router.delete('/:id', warehouseController.deleteWarehouse)

/**
 * @swagger
 * /api/v1/warehouses/{id}/stats:
 *   get:
 *     summary: Get warehouse statistics
 *     tags: [Warehouses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Warehouse statistics retrieved successfully
 */
router.get('/:id/stats', warehouseController.getWarehouseStats)

/**
 * @swagger
 * /api/v1/warehouses/{id}/operational:
 *   get:
 *     summary: Check if warehouse is operational
 *     tags: [Warehouses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Warehouse operational status retrieved
 */
router.get('/:id/operational', warehouseController.checkWarehouseOperational)

/**
 * @swagger
 * /api/v1/warehouses/{id}/open-today:
 *   get:
 *     summary: Check if warehouse is open today
 *     tags: [Warehouses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Warehouse open status retrieved
 */
router.get('/:id/open-today', warehouseController.checkWarehouseOpenToday)

module.exports = router
