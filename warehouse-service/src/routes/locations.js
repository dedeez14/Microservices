const express = require('express')
const { locationController } = require('../controllers')
const { validate } = require('../middleware/validation')
const { locationSchemas } = require('../validators')

const router = express.Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     Location:
 *       type: object
 *       required:
 *         - warehouse
 *         - code
 *         - name
 *         - type
 *         - hierarchy
 *         - coordinates
 *         - dimensions
 *       properties:
 *         warehouse:
 *           type: string
 *           description: Warehouse ID
 *         code:
 *           type: string
 *           description: Location code
 *         name:
 *           type: string
 *           description: Location name
 *         type:
 *           type: string
 *           enum: [zone, aisle, rack, shelf, bin, floor, dock, staging]
 */

/**
 * @swagger
 * /api/v1/locations:
 *   post:
 *     summary: Create a new location
 *     tags: [Locations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Location'
 *     responses:
 *       201:
 *         description: Location created successfully
 */
router.post('/', 
  validate(locationSchemas.create),
  locationController.createLocation
)

/**
 * @swagger
 * /api/v1/locations:
 *   get:
 *     summary: Get all locations with pagination and filtering
 *     tags: [Locations]
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
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Locations retrieved successfully
 */
router.get('/', 
  validate(locationSchemas.query, 'query'),
  locationController.getLocations
)

/**
 * @swagger
 * /api/v1/locations/available:
 *   get:
 *     summary: Get available locations
 *     tags: [Locations]
 *     parameters:
 *       - in: query
 *         name: warehouseId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Available locations retrieved successfully
 */
router.get('/available', locationController.getAvailableLocations)

/**
 * @swagger
 * /api/v1/locations/warehouse/{warehouseId}:
 *   get:
 *     summary: Get locations by warehouse
 *     tags: [Locations]
 *     parameters:
 *       - in: path
 *         name: warehouseId
 *         required: true
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
 *         description: Warehouse locations retrieved successfully
 */
router.get('/warehouse/:warehouseId', locationController.getLocationsByWarehouse)

/**
 * @swagger
 * /api/v1/locations/warehouse/{warehouseId}/hierarchy:
 *   get:
 *     summary: Get location hierarchy for warehouse
 *     tags: [Locations]
 *     parameters:
 *       - in: path
 *         name: warehouseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Location hierarchy retrieved successfully
 */
router.get('/warehouse/:warehouseId/hierarchy', locationController.getLocationHierarchy)

/**
 * @swagger
 * /api/v1/locations/warehouse/{warehouseId}/suitable:
 *   post:
 *     summary: Find suitable locations for an item
 *     tags: [Locations]
 *     parameters:
 *       - in: path
 *         name: warehouseId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               weight:
 *                 type: number
 *               volume:
 *                 type: number
 *               isHazmat:
 *                 type: boolean
 *               requiresTemperatureControl:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Suitable locations found
 */
router.post('/warehouse/:warehouseId/suitable', locationController.findSuitableLocations)

/**
 * @swagger
 * /api/v1/locations/{id}:
 *   get:
 *     summary: Get location by ID
 *     tags: [Locations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Location retrieved successfully
 *       404:
 *         description: Location not found
 */
router.get('/:id', locationController.getLocationById)

/**
 * @swagger
 * /api/v1/locations/{id}:
 *   put:
 *     summary: Update location
 *     tags: [Locations]
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
 *             $ref: '#/components/schemas/Location'
 *     responses:
 *       200:
 *         description: Location updated successfully
 *       404:
 *         description: Location not found
 */
router.put('/:id', 
  validate(locationSchemas.update),
  locationController.updateLocation
)

/**
 * @swagger
 * /api/v1/locations/{id}:
 *   delete:
 *     summary: Delete location
 *     tags: [Locations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Location deleted successfully
 *       404:
 *         description: Location not found
 */
router.delete('/:id', locationController.deleteLocation)

/**
 * @swagger
 * /api/v1/locations/{id}/children:
 *   get:
 *     summary: Get child locations
 *     tags: [Locations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Child locations retrieved successfully
 */
router.get('/:id/children', locationController.getChildLocations)

/**
 * @swagger
 * /api/v1/locations/{id}/status:
 *   patch:
 *     summary: Update location status
 *     tags: [Locations]
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
 *               status:
 *                 type: string
 *                 enum: [available, occupied, reserved, blocked, maintenance]
 *     responses:
 *       200:
 *         description: Location status updated successfully
 */
router.patch('/:id/status', locationController.updateLocationStatus)

/**
 * @swagger
 * /api/v1/locations/{id}/can-store:
 *   post:
 *     summary: Check if location can store an item
 *     tags: [Locations]
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
 *               weight:
 *                 type: number
 *               volume:
 *                 type: number
 *               isHazmat:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Storage check completed
 */
router.post('/:id/can-store', locationController.checkCanStoreItem)

module.exports = router
