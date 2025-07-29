const { locationService } = require('../services')
const ApiResponse = require('../utils/response')
const { asyncHandler } = require('../middleware/error')

/**
 * @desc    Create a new location
 * @route   POST /api/v1/locations
 * @access  Private
 */
const createLocation = asyncHandler(async (req, res) => {
  const location = await locationService.createLocation(req.body)
  return ApiResponse.created(res, location, 'Location created successfully')
})

/**
 * @desc    Get all locations
 * @route   GET /api/v1/locations
 * @access  Private
 */
const getLocations = asyncHandler(async (req, res) => {
  const result = await locationService.getLocations(req.query)
  return ApiResponse.paginated(res, result.data, result.pagination, 'Locations retrieved successfully')
})

/**
 * @desc    Get location by ID
 * @route   GET /api/v1/locations/:id
 * @access  Private
 */
const getLocationById = asyncHandler(async (req, res) => {
  const location = await locationService.getLocationById(req.params.id)
  return ApiResponse.success(res, location, 'Location retrieved successfully')
})

/**
 * @desc    Get locations by warehouse
 * @route   GET /api/v1/locations/warehouse/:warehouseId
 * @access  Private
 */
const getLocationsByWarehouse = asyncHandler(async (req, res) => {
  const locations = await locationService.getLocationsByWarehouse(req.params.warehouseId, req.query)
  return ApiResponse.success(res, locations, 'Warehouse locations retrieved successfully')
})

/**
 * @desc    Get available locations
 * @route   GET /api/v1/locations/available
 * @access  Private
 */
const getAvailableLocations = asyncHandler(async (req, res) => {
  const { warehouseId } = req.query
  const locations = await locationService.getAvailableLocations(warehouseId)
  return ApiResponse.success(res, locations, 'Available locations retrieved successfully')
})

/**
 * @desc    Get child locations
 * @route   GET /api/v1/locations/:id/children
 * @access  Private
 */
const getChildLocations = asyncHandler(async (req, res) => {
  const locations = await locationService.getChildLocations(req.params.id)
  return ApiResponse.success(res, locations, 'Child locations retrieved successfully')
})

/**
 * @desc    Get location hierarchy
 * @route   GET /api/v1/locations/warehouse/:warehouseId/hierarchy
 * @access  Private
 */
const getLocationHierarchy = asyncHandler(async (req, res) => {
  const hierarchy = await locationService.getLocationHierarchy(req.params.warehouseId)
  return ApiResponse.success(res, hierarchy, 'Location hierarchy retrieved successfully')
})

/**
 * @desc    Update location
 * @route   PUT /api/v1/locations/:id
 * @access  Private
 */
const updateLocation = asyncHandler(async (req, res) => {
  const location = await locationService.updateLocation(req.params.id, req.body)
  return ApiResponse.success(res, location, 'Location updated successfully')
})

/**
 * @desc    Update location status
 * @route   PATCH /api/v1/locations/:id/status
 * @access  Private
 */
const updateLocationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body
  const location = await locationService.updateLocationStatus(req.params.id, status)
  return ApiResponse.success(res, location, 'Location status updated successfully')
})

/**
 * @desc    Delete location
 * @route   DELETE /api/v1/locations/:id
 * @access  Private
 */
const deleteLocation = asyncHandler(async (req, res) => {
  await locationService.deleteLocation(req.params.id)
  return ApiResponse.success(res, null, 'Location deleted successfully')
})

/**
 * @desc    Check if location can store item
 * @route   POST /api/v1/locations/:id/can-store
 * @access  Private
 */
const checkCanStoreItem = asyncHandler(async (req, res) => {
  const canStore = await locationService.canStoreItem(req.params.id, req.body)
  return ApiResponse.success(res, { canStore }, 'Location storage check completed')
})

/**
 * @desc    Find suitable locations for item
 * @route   POST /api/v1/locations/warehouse/:warehouseId/suitable
 * @access  Private
 */
const findSuitableLocations = asyncHandler(async (req, res) => {
  const { limit } = req.query
  const locations = await locationService.findSuitableLocations(
    req.params.warehouseId, 
    req.body, 
    parseInt(limit) || 10
  )
  return ApiResponse.success(res, locations, 'Suitable locations found')
})

module.exports = {
  createLocation,
  getLocations,
  getLocationById,
  getLocationsByWarehouse,
  getAvailableLocations,
  getChildLocations,
  getLocationHierarchy,
  updateLocation,
  updateLocationStatus,
  deleteLocation,
  checkCanStoreItem,
  findSuitableLocations
}
