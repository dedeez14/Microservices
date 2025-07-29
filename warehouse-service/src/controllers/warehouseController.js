const { warehouseService } = require('../services')
const ApiResponse = require('../utils/response')
const { asyncHandler } = require('../middleware/error')

/**
 * @desc    Create a new warehouse
 * @route   POST /api/v1/warehouses
 * @access  Private
 */
const createWarehouse = asyncHandler(async (req, res) => {
  const warehouse = await warehouseService.createWarehouse(req.body)
  return ApiResponse.created(res, warehouse, 'Warehouse created successfully')
})

/**
 * @desc    Get all warehouses
 * @route   GET /api/v1/warehouses
 * @access  Private
 */
const getWarehouses = asyncHandler(async (req, res) => {
  const result = await warehouseService.getWarehouses(req.query)
  return ApiResponse.paginated(res, result.data, result.pagination, 'Warehouses retrieved successfully')
})

/**
 * @desc    Get warehouse by ID
 * @route   GET /api/v1/warehouses/:id
 * @access  Private
 */
const getWarehouseById = asyncHandler(async (req, res) => {
  const warehouse = await warehouseService.getWarehouseById(req.params.id)
  return ApiResponse.success(res, warehouse, 'Warehouse retrieved successfully')
})

/**
 * @desc    Get warehouse by code
 * @route   GET /api/v1/warehouses/code/:code
 * @access  Private
 */
const getWarehouseByCode = asyncHandler(async (req, res) => {
  const warehouse = await warehouseService.getWarehouseByCode(req.params.code)
  return ApiResponse.success(res, warehouse, 'Warehouse retrieved successfully')
})

/**
 * @desc    Update warehouse
 * @route   PUT /api/v1/warehouses/:id
 * @access  Private
 */
const updateWarehouse = asyncHandler(async (req, res) => {
  const warehouse = await warehouseService.updateWarehouse(req.params.id, req.body)
  return ApiResponse.success(res, warehouse, 'Warehouse updated successfully')
})

/**
 * @desc    Delete warehouse
 * @route   DELETE /api/v1/warehouses/:id
 * @access  Private
 */
const deleteWarehouse = asyncHandler(async (req, res) => {
  await warehouseService.deleteWarehouse(req.params.id)
  return ApiResponse.success(res, null, 'Warehouse deleted successfully')
})

/**
 * @desc    Get active warehouses
 * @route   GET /api/v1/warehouses/active
 * @access  Private
 */
const getActiveWarehouses = asyncHandler(async (req, res) => {
  const warehouses = await warehouseService.getActiveWarehouses()
  return ApiResponse.success(res, warehouses, 'Active warehouses retrieved successfully')
})

/**
 * @desc    Get warehouses by location
 * @route   GET /api/v1/warehouses/location/:city/:state
 * @access  Private
 */
const getWarehousesByLocation = asyncHandler(async (req, res) => {
  const { city, state } = req.params
  const warehouses = await warehouseService.getWarehousesByLocation(city, state)
  return ApiResponse.success(res, warehouses, 'Warehouses retrieved successfully')
})

/**
 * @desc    Get warehouse statistics
 * @route   GET /api/v1/warehouses/:id/stats
 * @access  Private
 */
const getWarehouseStats = asyncHandler(async (req, res) => {
  const stats = await warehouseService.getWarehouseStats(req.params.id)
  return ApiResponse.success(res, stats, 'Warehouse statistics retrieved successfully')
})

/**
 * @desc    Check if warehouse is operational
 * @route   GET /api/v1/warehouses/:id/operational
 * @access  Private
 */
const checkWarehouseOperational = asyncHandler(async (req, res) => {
  const isOperational = await warehouseService.isWarehouseOperational(req.params.id)
  return ApiResponse.success(res, { isOperational }, 'Warehouse operational status retrieved successfully')
})

/**
 * @desc    Check if warehouse is open today
 * @route   GET /api/v1/warehouses/:id/open-today
 * @access  Private
 */
const checkWarehouseOpenToday = asyncHandler(async (req, res) => {
  const isOpen = await warehouseService.isWarehouseOpenToday(req.params.id)
  return ApiResponse.success(res, { isOpen }, 'Warehouse open status retrieved successfully')
})

module.exports = {
  createWarehouse,
  getWarehouses,
  getWarehouseById,
  getWarehouseByCode,
  updateWarehouse,
  deleteWarehouse,
  getActiveWarehouses,
  getWarehousesByLocation,
  getWarehouseStats,
  checkWarehouseOperational,
  checkWarehouseOpenToday
}
