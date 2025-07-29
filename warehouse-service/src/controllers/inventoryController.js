const { inventoryService } = require('../services')
const ApiResponse = require('../utils/response')
const { asyncHandler } = require('../middleware/error')

/**
 * @desc    Create a new inventory item
 * @route   POST /api/v1/inventory
 * @access  Private
 */
const createInventoryItem = asyncHandler(async (req, res) => {
  const inventory = await inventoryService.createInventoryItem(req.body)
  return ApiResponse.created(res, inventory, 'Inventory item created successfully')
})

/**
 * @desc    Get all inventory items
 * @route   GET /api/v1/inventory
 * @access  Private
 */
const getInventory = asyncHandler(async (req, res) => {
  const result = await inventoryService.getInventory(req.query)
  return ApiResponse.paginated(res, result.data, result.pagination, 'Inventory retrieved successfully')
})

/**
 * @desc    Get inventory item by ID
 * @route   GET /api/v1/inventory/:id
 * @access  Private
 */
const getInventoryById = asyncHandler(async (req, res) => {
  const inventory = await inventoryService.getInventoryById(req.params.id)
  return ApiResponse.success(res, inventory, 'Inventory item retrieved successfully')
})

/**
 * @desc    Get inventory by warehouse
 * @route   GET /api/v1/inventory/warehouse/:warehouseId
 * @access  Private
 */
const getInventoryByWarehouse = asyncHandler(async (req, res) => {
  const inventory = await inventoryService.getInventoryByWarehouse(req.params.warehouseId, req.query)
  return ApiResponse.success(res, inventory, 'Warehouse inventory retrieved successfully')
})

/**
 * @desc    Get inventory by SKU
 * @route   GET /api/v1/inventory/sku/:sku
 * @access  Private
 */
const getInventoryBySku = asyncHandler(async (req, res) => {
  const { warehouseId } = req.query
  const inventory = await inventoryService.getInventoryBySku(req.params.sku, warehouseId)
  return ApiResponse.success(res, inventory, 'Inventory retrieved successfully')
})

/**
 * @desc    Get low stock items
 * @route   GET /api/v1/inventory/low-stock
 * @access  Private
 */
const getLowStockItems = asyncHandler(async (req, res) => {
  const { warehouseId } = req.query
  const items = await inventoryService.getLowStockItems(warehouseId)
  return ApiResponse.success(res, items, 'Low stock items retrieved successfully')
})

/**
 * @desc    Get expiring items
 * @route   GET /api/v1/inventory/expiring
 * @access  Private
 */
const getExpiringItems = asyncHandler(async (req, res) => {
  const { days = 30, warehouseId } = req.query
  const items = await inventoryService.getExpiringItems(parseInt(days), warehouseId)
  return ApiResponse.success(res, items, 'Expiring items retrieved successfully')
})

/**
 * @desc    Get warehouse inventory summary
 * @route   GET /api/v1/inventory/warehouse/:warehouseId/summary
 * @access  Private
 */
const getWarehouseInventorySummary = asyncHandler(async (req, res) => {
  const summary = await inventoryService.getWarehouseInventorySummary(req.params.warehouseId)
  return ApiResponse.success(res, summary, 'Warehouse inventory summary retrieved successfully')
})

/**
 * @desc    Update inventory item
 * @route   PUT /api/v1/inventory/:id
 * @access  Private
 */
const updateInventoryItem = asyncHandler(async (req, res) => {
  const inventory = await inventoryService.updateInventoryItem(req.params.id, req.body)
  return ApiResponse.success(res, inventory, 'Inventory item updated successfully')
})

/**
 * @desc    Delete inventory item
 * @route   DELETE /api/v1/inventory/:id
 * @access  Private
 */
const deleteInventoryItem = asyncHandler(async (req, res) => {
  await inventoryService.deleteInventoryItem(req.params.id)
  return ApiResponse.success(res, null, 'Inventory item deleted successfully')
})

/**
 * @desc    Adjust inventory quantity
 * @route   POST /api/v1/inventory/:id/adjust
 * @access  Private
 */
const adjustQuantity = asyncHandler(async (req, res) => {
  const inventory = await inventoryService.adjustQuantity(req.params.id, req.body)
  return ApiResponse.success(res, inventory, 'Inventory quantity adjusted successfully')
})

/**
 * @desc    Reserve inventory
 * @route   POST /api/v1/inventory/:id/reserve
 * @access  Private
 */
const reserveInventory = asyncHandler(async (req, res) => {
  const inventory = await inventoryService.reserveInventory(req.params.id, req.body)
  return ApiResponse.success(res, inventory, 'Inventory reserved successfully')
})

/**
 * @desc    Release reservation
 * @route   POST /api/v1/inventory/:id/release-reservation
 * @access  Private
 */
const releaseReservation = asyncHandler(async (req, res) => {
  const inventory = await inventoryService.releaseReservation(req.params.id, req.body)
  return ApiResponse.success(res, inventory, 'Inventory reservation released successfully')
})

/**
 * @desc    Perform cycle count
 * @route   POST /api/v1/inventory/:id/cycle-count
 * @access  Private
 */
const performCycleCount = asyncHandler(async (req, res) => {
  const result = await inventoryService.performCycleCount(req.params.id, req.body)
  return ApiResponse.success(res, result, 'Cycle count completed successfully')
})

module.exports = {
  createInventoryItem,
  getInventory,
  getInventoryById,
  getInventoryByWarehouse,
  getInventoryBySku,
  getLowStockItems,
  getExpiringItems,
  getWarehouseInventorySummary,
  updateInventoryItem,
  deleteInventoryItem,
  adjustQuantity,
  reserveInventory,
  releaseReservation,
  performCycleCount
}
