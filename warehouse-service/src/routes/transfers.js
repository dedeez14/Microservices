const express = require('express')
const { transferController } = require('../controllers')
const { validate } = require('../middleware/validation')
const { transferSchemas } = require('../validators')

const router = express.Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     Transfer:
 *       type: object
 *       required:
 *         - type
 *         - source
 *         - destination
 *         - items
 *         - personnel
 *       properties:
 *         type:
 *           type: string
 *           enum: [internal, warehouse_to_warehouse, inbound, outbound, adjustment, cycle_count]
 *         source:
 *           type: object
 *           properties:
 *             warehouse:
 *               type: string
 *             location:
 *               type: string
 *         destination:
 *           type: object
 *           properties:
 *             warehouse:
 *               type: string
 *             location:
 *               type: string
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               product:
 *                 type: object
 *               quantity:
 *                 type: object
 */

/**
 * @swagger
 * /api/v1/transfers:
 *   post:
 *     summary: Create a new transfer
 *     tags: [Transfers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Transfer'
 *     responses:
 *       201:
 *         description: Transfer created successfully
 */
router.post('/', 
  validate(transferSchemas.create),
  transferController.createTransfer
)

/**
 * @swagger
 * /api/v1/transfers:
 *   get:
 *     summary: Get all transfers with pagination and filtering
 *     tags: [Transfers]
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
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *       - in: query
 *         name: overdue
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Transfers retrieved successfully
 */
router.get('/', 
  validate(transferSchemas.query, 'query'),
  transferController.getTransfers
)

/**
 * @swagger
 * /api/v1/transfers/pending:
 *   get:
 *     summary: Get pending transfers
 *     tags: [Transfers]
 *     parameters:
 *       - in: query
 *         name: warehouseId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pending transfers retrieved successfully
 */
router.get('/pending', transferController.getPendingTransfers)

/**
 * @swagger
 * /api/v1/transfers/overdue:
 *   get:
 *     summary: Get overdue transfers
 *     tags: [Transfers]
 *     parameters:
 *       - in: query
 *         name: warehouseId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Overdue transfers retrieved successfully
 */
router.get('/overdue', transferController.getOverdueTransfers)

/**
 * @swagger
 * /api/v1/transfers/stats:
 *   get:
 *     summary: Get transfer statistics
 *     tags: [Transfers]
 *     parameters:
 *       - in: query
 *         name: warehouseId
 *         schema:
 *           type: string
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Transfer statistics retrieved successfully
 */
router.get('/stats', transferController.getTransferStats)

/**
 * @swagger
 * /api/v1/transfers/number/{transferNumber}:
 *   get:
 *     summary: Get transfer by transfer number
 *     tags: [Transfers]
 *     parameters:
 *       - in: path
 *         name: transferNumber
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transfer retrieved successfully
 *       404:
 *         description: Transfer not found
 */
router.get('/number/:transferNumber', transferController.getTransferByNumber)

/**
 * @swagger
 * /api/v1/transfers/warehouse/{warehouseId}:
 *   get:
 *     summary: Get transfers by warehouse
 *     tags: [Transfers]
 *     parameters:
 *       - in: path
 *         name: warehouseId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: direction
 *         schema:
 *           type: string
 *           enum: [inbound, outbound, both]
 *           default: both
 *     responses:
 *       200:
 *         description: Warehouse transfers retrieved successfully
 */
router.get('/warehouse/:warehouseId', transferController.getTransfersByWarehouse)

/**
 * @swagger
 * /api/v1/transfers/{id}:
 *   get:
 *     summary: Get transfer by ID
 *     tags: [Transfers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transfer retrieved successfully
 *       404:
 *         description: Transfer not found
 */
router.get('/:id', transferController.getTransferById)

/**
 * @swagger
 * /api/v1/transfers/{id}:
 *   put:
 *     summary: Update transfer
 *     tags: [Transfers]
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
 *             $ref: '#/components/schemas/Transfer'
 *     responses:
 *       200:
 *         description: Transfer updated successfully
 *       404:
 *         description: Transfer not found
 */
router.put('/:id', 
  validate(transferSchemas.update),
  transferController.updateTransfer
)

/**
 * @swagger
 * /api/v1/transfers/{id}/items/{itemIndex}:
 *   put:
 *     summary: Update transfer item
 *     tags: [Transfers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: itemIndex
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: object
 *               status:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Transfer item updated successfully
 */
router.put('/:id/items/:itemIndex', 
  validate(transferSchemas.updateItem),
  transferController.updateTransferItem
)

/**
 * @swagger
 * /api/v1/transfers/{id}/approve:
 *   post:
 *     summary: Approve transfer
 *     tags: [Transfers]
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
 *               approvedBy:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Transfer approved successfully
 */
router.post('/:id/approve', 
  validate(transferSchemas.approve),
  transferController.approveTransfer
)

/**
 * @swagger
 * /api/v1/transfers/{id}/start:
 *   post:
 *     summary: Start transfer
 *     tags: [Transfers]
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
 *               assignedTo:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *     responses:
 *       200:
 *         description: Transfer started successfully
 */
router.post('/:id/start', 
  validate(transferSchemas.start),
  transferController.startTransfer
)

/**
 * @swagger
 * /api/v1/transfers/{id}/complete:
 *   post:
 *     summary: Complete transfer
 *     tags: [Transfers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transfer completed successfully
 */
router.post('/:id/complete', transferController.completeTransfer)

/**
 * @swagger
 * /api/v1/transfers/{id}/cancel:
 *   post:
 *     summary: Cancel transfer
 *     tags: [Transfers]
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
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Transfer cancelled successfully
 */
router.post('/:id/cancel', 
  validate(transferSchemas.cancel),
  transferController.cancelTransfer
)

module.exports = router
