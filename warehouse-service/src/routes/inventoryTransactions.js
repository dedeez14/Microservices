const express = require('express')
const router = express.Router()

const inventoryTransactionController = require('../controllers/inventoryTransactionController')
const { validate } = require('../middleware/validation')
const inventoryTransactionSchemas = require('../validators/inventoryTransaction')

/**
 * @swagger
 * components:
 *   schemas:
 *     InventoryTransaction:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Transaction ID
 *         transactionNumber:
 *           type: string
 *           description: Unique transaction number
 *         type:
 *           type: string
 *           enum: [INBOUND, OUTBOUND, ADJUSTMENT, TRANSFER_IN, TRANSFER_OUT]
 *           description: Transaction type
 *         warehouse:
 *           $ref: '#/components/schemas/Warehouse'
 *         location:
 *           $ref: '#/components/schemas/Location'
 *         inventory:
 *           $ref: '#/components/schemas/Inventory'
 *         product:
 *           type: object
 *           properties:
 *             sku:
 *               type: string
 *             name:
 *               type: string
 *         quantity:
 *           type: object
 *           properties:
 *             previous:
 *               type: number
 *               description: Previous quantity
 *             change:
 *               type: number
 *               description: Quantity change (+ for in, - for out)
 *             current:
 *               type: number
 *               description: Current quantity after transaction
 *             unit:
 *               type: string
 *         cost:
 *           type: object
 *           properties:
 *             unitCost:
 *               type: number
 *             totalCost:
 *               type: number
 *             currency:
 *               type: string
 *         reference:
 *           type: object
 *           properties:
 *             type:
 *               type: string
 *             number:
 *               type: string
 *             date:
 *               type: string
 *               format: date
 *         party:
 *           type: object
 *           properties:
 *             type:
 *               type: string
 *               enum: [SUPPLIER, CUSTOMER, INTERNAL, OTHER]
 *             name:
 *               type: string
 *             code:
 *               type: string
 *             contact:
 *               type: object
 *               properties:
 *                 email:
 *                   type: string
 *                 phone:
 *                   type: string
 *         batch:
 *           type: object
 *           properties:
 *             number:
 *               type: string
 *             manufactureDate:
 *               type: string
 *               format: date
 *             expiryDate:
 *               type: string
 *               format: date
 *         quality:
 *           type: object
 *           properties:
 *             status:
 *               type: string
 *               enum: [GOOD, DAMAGED, EXPIRED, QUARANTINE]
 *             inspector:
 *               type: string
 *             notes:
 *               type: string
 *         reason:
 *           type: string
 *           description: Transaction reason
 *         notes:
 *           type: string
 *         status:
 *           type: string
 *           enum: [PENDING, CONFIRMED, CANCELLED]
 *         createdBy:
 *           type: object
 *           properties:
 *             userId:
 *               type: string
 *             userName:
 *               type: string
 *         transactionDate:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       required:
 *         - type
 *         - warehouse
 *         - location
 *         - inventory
 *         - product
 *         - quantity
 *         - reason
 *         - createdBy
 */

/**
 * @swagger
 * /api/v1/inventory-transactions:
 *   get:
 *     summary: Get all inventory transactions
 *     tags: [Inventory Transactions]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of items per page
 *       - in: query
 *         name: warehouse
 *         schema:
 *           type: string
 *         description: Filter by warehouse ID
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location ID
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [INBOUND, OUTBOUND, ADJUSTMENT, TRANSFER_IN, TRANSFER_OUT]
 *         description: Filter by transaction type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, CONFIRMED, CANCELLED]
 *         description: Filter by status
 *       - in: query
 *         name: sku
 *         schema:
 *           type: string
 *         description: Filter by product SKU
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter from this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter until this date
 *     responses:
 *       200:
 *         description: Transactions retrieved successfully
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
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/InventoryTransaction'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get('/', 
  validate(inventoryTransactionSchemas.queryFilters, 'query'),
  inventoryTransactionController.getTransactions
)

/**
 * @swagger
 * /api/v1/inventory-transactions/summary:
 *   get:
 *     summary: Get inventory transaction summary/report
 *     tags: [Inventory Transactions]
 *     parameters:
 *       - in: query
 *         name: warehouse
 *         schema:
 *           type: string
 *         description: Filter by warehouse ID
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [INBOUND, OUTBOUND, ADJUSTMENT, TRANSFER_IN, TRANSFER_OUT]
 *         description: Filter by transaction type
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Report start date
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Report end date
 *     responses:
 *       200:
 *         description: Transaction summary retrieved successfully
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
 *                     summary:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           totalTransactions:
 *                             type: number
 *                           totalQuantity:
 *                             type: number
 *                           totalValue:
 *                             type: number
 *                     totalTransactions:
 *                       type: number
 *                     filters:
 *                       type: object
 *                     generatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Validation error
 */
router.get('/summary',
  validate(inventoryTransactionSchemas.summaryFilters, 'query'),
  inventoryTransactionController.getTransactionSummary
)

/**
 * @swagger
 * /api/v1/inventory-transactions/{id}:
 *   get:
 *     summary: Get inventory transaction by ID
 *     tags: [Inventory Transactions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction ID
 *     responses:
 *       200:
 *         description: Transaction retrieved successfully
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
 *                   $ref: '#/components/schemas/InventoryTransaction'
 *       404:
 *         description: Transaction not found
 */
router.get('/:id', inventoryTransactionController.getTransactionById)

/**
 * @swagger
 * /api/v1/inventory-transactions/inbound:
 *   post:
 *     summary: Record inbound inventory transaction (barang masuk)
 *     tags: [Inventory Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - inventoryId
 *               - quantity
 *               - cost
 *               - reference
 *               - party
 *               - reason
 *               - createdBy
 *             properties:
 *               inventoryId:
 *                 type: string
 *                 description: Inventory item ID
 *               quantity:
 *                 type: number
 *                 minimum: 0.01
 *                 description: Quantity received
 *               cost:
 *                 type: object
 *                 required:
 *                   - unitCost
 *                 properties:
 *                   unitCost:
 *                     type: number
 *                     minimum: 0
 *                   currency:
 *                     type: string
 *                     default: IDR
 *               reference:
 *                 type: object
 *                 required:
 *                   - type
 *                   - date
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [PURCHASE_ORDER, PRODUCTION, RETURN, TRANSFER, OTHER]
 *                   number:
 *                     type: string
 *                   date:
 *                     type: string
 *                     format: date
 *               party:
 *                 type: object
 *                 required:
 *                   - name
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [SUPPLIER, INTERNAL, OTHER]
 *                   name:
 *                     type: string
 *                   code:
 *                     type: string
 *                   contact:
 *                     type: object
 *                     properties:
 *                       email:
 *                         type: string
 *                       phone:
 *                         type: string
 *               batch:
 *                 type: object
 *                 properties:
 *                   number:
 *                     type: string
 *                   manufactureDate:
 *                     type: string
 *                     format: date
 *                   expiryDate:
 *                     type: string
 *                     format: date
 *               quality:
 *                 type: object
 *                 properties:
 *                   status:
 *                     type: string
 *                     enum: [GOOD, DAMAGED, QUARANTINE]
 *                   inspector:
 *                     type: string
 *                   notes:
 *                     type: string
 *               reason:
 *                 type: string
 *                 maxLength: 200
 *               notes:
 *                 type: string
 *                 maxLength: 1000
 *               createdBy:
 *                 type: object
 *                 required:
 *                   - userId
 *                   - userName
 *                 properties:
 *                   userId:
 *                     type: string
 *                   userName:
 *                     type: string
 *           example:
 *             inventoryId: "507f1f77bcf86cd799439011"
 *             quantity: 100
 *             cost:
 *               unitCost: 15000
 *               currency: "IDR"
 *             reference:
 *               type: "PURCHASE_ORDER"
 *               number: "PO-2025-001"
 *               date: "2025-07-27"
 *             party:
 *               type: "SUPPLIER"
 *               name: "PT Supplier Utama"
 *               code: "SUP001"
 *               contact:
 *                 email: "orders@supplier.com"
 *                 phone: "+62211234567"
 *             batch:
 *               number: "BATCH001"
 *               manufactureDate: "2025-07-26"
 *               expiryDate: "2026-07-26"
 *             quality:
 *               status: "GOOD"
 *               inspector: "QC Inspector"
 *             reason: "Purchase order delivery"
 *             notes: "Good quality products received on time"
 *             createdBy:
 *               userId: "user123"
 *               userName: "John Doe"
 *     responses:
 *       201:
 *         description: Inbound transaction recorded successfully
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
 *                   $ref: '#/components/schemas/InventoryTransaction'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Inventory item not found
 */
router.post('/inbound',
  validate(inventoryTransactionSchemas.inbound),
  inventoryTransactionController.recordInbound
)

/**
 * @swagger
 * /api/v1/inventory-transactions/outbound:
 *   post:
 *     summary: Record outbound inventory transaction (barang keluar)
 *     tags: [Inventory Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - inventoryId
 *               - quantity
 *               - reference
 *               - party
 *               - reason
 *               - createdBy
 *             properties:
 *               inventoryId:
 *                 type: string
 *                 description: Inventory item ID
 *               quantity:
 *                 type: number
 *                 minimum: 0.01
 *                 description: Quantity to issue
 *               cost:
 *                 type: object
 *                 properties:
 *                   unitCost:
 *                     type: number
 *                     minimum: 0
 *                   currency:
 *                     type: string
 *                     default: IDR
 *               reference:
 *                 type: object
 *                 required:
 *                   - type
 *                   - date
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [SALES_ORDER, TRANSFER, PRODUCTION, RETURN, OTHER]
 *                   number:
 *                     type: string
 *                   date:
 *                     type: string
 *                     format: date
 *               party:
 *                 type: object
 *                 required:
 *                   - name
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [CUSTOMER, INTERNAL, OTHER]
 *                   name:
 *                     type: string
 *                   code:
 *                     type: string
 *                   contact:
 *                     type: object
 *                     properties:
 *                       email:
 *                         type: string
 *                       phone:
 *                         type: string
 *               batch:
 *                 type: object
 *                 properties:
 *                   number:
 *                     type: string
 *                   manufactureDate:
 *                     type: string
 *                     format: date
 *                   expiryDate:
 *                     type: string
 *                     format: date
 *               quality:
 *                 type: object
 *                 properties:
 *                   status:
 *                     type: string
 *                     enum: [GOOD, DAMAGED, EXPIRED]
 *                   inspector:
 *                     type: string
 *                   notes:
 *                     type: string
 *               reason:
 *                 type: string
 *                 maxLength: 200
 *               notes:
 *                 type: string
 *                 maxLength: 1000
 *               createdBy:
 *                 type: object
 *                 required:
 *                   - userId
 *                   - userName
 *                 properties:
 *                   userId:
 *                     type: string
 *                   userName:
 *                     type: string
 *           example:
 *             inventoryId: "507f1f77bcf86cd799439011"
 *             quantity: 50
 *             reference:
 *               type: "SALES_ORDER"
 *               number: "SO-2025-001"
 *               date: "2025-07-27"
 *             party:
 *               type: "CUSTOMER"
 *               name: "PT Customer Setia"
 *               code: "CUST001"
 *               contact:
 *                 email: "orders@customer.com"
 *                 phone: "+62211234568"
 *             batch:
 *               number: "BATCH001"
 *             quality:
 *               status: "GOOD"
 *             reason: "Sales order fulfillment"
 *             notes: "Shipped to customer on time"
 *             createdBy:
 *               userId: "user123"
 *               userName: "Jane Doe"
 *     responses:
 *       201:
 *         description: Outbound transaction recorded successfully
 *       400:
 *         description: Validation error or insufficient inventory
 *       404:
 *         description: Inventory item not found
 */
router.post('/outbound',
  validate(inventoryTransactionSchemas.outbound),
  inventoryTransactionController.recordOutbound
)

/**
 * @swagger
 * /api/v1/inventory-transactions/adjustment:
 *   post:
 *     summary: Record inventory adjustment
 *     tags: [Inventory Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - inventoryId
 *               - newQuantity
 *               - reason
 *               - notes
 *               - createdBy
 *             properties:
 *               inventoryId:
 *                 type: string
 *                 description: Inventory item ID
 *               newQuantity:
 *                 type: number
 *                 minimum: 0
 *                 description: New quantity after adjustment
 *               reason:
 *                 type: string
 *                 enum: [PHYSICAL_COUNT, DAMAGE, EXPIRY, LOSS, THEFT, SYSTEM_ERROR, QUALITY_ISSUE, OTHER]
 *                 description: Adjustment reason
 *               notes:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Detailed notes for audit purposes
 *               createdBy:
 *                 type: object
 *                 required:
 *                   - userId
 *                   - userName
 *                 properties:
 *                   userId:
 *                     type: string
 *                   userName:
 *                     type: string
 *           example:
 *             inventoryId: "507f1f77bcf86cd799439011"
 *             newQuantity: 95
 *             reason: "PHYSICAL_COUNT"
 *             notes: "Physical count revealed 5 units missing"
 *             createdBy:
 *               userId: "user123"
 *               userName: "Inventory Manager"
 *     responses:
 *       201:
 *         description: Inventory adjustment recorded successfully
 *       400:
 *         description: Validation error or no quantity change
 *       404:
 *         description: Inventory item not found
 */
router.post('/adjustment',
  validate(inventoryTransactionSchemas.adjustment),
  inventoryTransactionController.recordAdjustment
)

/**
 * @swagger
 * /api/v1/inventory-transactions/{id}/cancel:
 *   put:
 *     summary: Cancel inventory transaction
 *     tags: [Inventory Transactions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *               - cancelledBy
 *             properties:
 *               reason:
 *                 type: string
 *                 maxLength: 200
 *                 description: Cancellation reason
 *               cancelledBy:
 *                 type: object
 *                 required:
 *                   - userId
 *                   - userName
 *                 properties:
 *                   userId:
 *                     type: string
 *                   userName:
 *                     type: string
 *           example:
 *             reason: "Incorrect entry - wrong product"
 *             cancelledBy:
 *               userId: "user123"
 *               userName: "Supervisor"
 *     responses:
 *       200:
 *         description: Transaction cancelled successfully
 *       400:
 *         description: Transaction cannot be cancelled
 *       404:
 *         description: Transaction not found
 */
router.put('/:id/cancel',
  validate(inventoryTransactionSchemas.cancelTransaction),
  inventoryTransactionController.cancelTransaction
)

module.exports = router
