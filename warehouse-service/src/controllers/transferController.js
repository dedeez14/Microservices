const { transferService } = require('../services')
const ApiResponse = require('../utils/response')
const { asyncHandler } = require('../middleware/error')

/**
 * @desc    Create a new transfer
 * @route   POST /api/v1/transfers
 * @access  Private
 */
const createTransfer = asyncHandler(async (req, res) => {
  const transfer = await transferService.createTransfer(req.body)
  return ApiResponse.created(res, transfer, 'Transfer created successfully')
})

/**
 * @desc    Get all transfers
 * @route   GET /api/v1/transfers
 * @access  Private
 */
const getTransfers = asyncHandler(async (req, res) => {
  const result = await transferService.getTransfers(req.query)
  return ApiResponse.paginated(res, result.data, result.pagination, 'Transfers retrieved successfully')
})

/**
 * @desc    Get transfer by ID
 * @route   GET /api/v1/transfers/:id
 * @access  Private
 */
const getTransferById = asyncHandler(async (req, res) => {
  const transfer = await transferService.getTransferById(req.params.id)
  return ApiResponse.success(res, transfer, 'Transfer retrieved successfully')
})

/**
 * @desc    Get transfer by transfer number
 * @route   GET /api/v1/transfers/number/:transferNumber
 * @access  Private
 */
const getTransferByNumber = asyncHandler(async (req, res) => {
  const transfer = await transferService.getTransferByNumber(req.params.transferNumber)
  return ApiResponse.success(res, transfer, 'Transfer retrieved successfully')
})

/**
 * @desc    Get transfers by warehouse
 * @route   GET /api/v1/transfers/warehouse/:warehouseId
 * @access  Private
 */
const getTransfersByWarehouse = asyncHandler(async (req, res) => {
  const { direction = 'both' } = req.query
  const transfers = await transferService.getTransfersByWarehouse(req.params.warehouseId, direction)
  return ApiResponse.success(res, transfers, 'Warehouse transfers retrieved successfully')
})

/**
 * @desc    Get pending transfers
 * @route   GET /api/v1/transfers/pending
 * @access  Private
 */
const getPendingTransfers = asyncHandler(async (req, res) => {
  const { warehouseId } = req.query
  const transfers = await transferService.getPendingTransfers(warehouseId)
  return ApiResponse.success(res, transfers, 'Pending transfers retrieved successfully')
})

/**
 * @desc    Get overdue transfers
 * @route   GET /api/v1/transfers/overdue
 * @access  Private
 */
const getOverdueTransfers = asyncHandler(async (req, res) => {
  const { warehouseId } = req.query
  const transfers = await transferService.getOverdueTransfers(warehouseId)
  return ApiResponse.success(res, transfers, 'Overdue transfers retrieved successfully')
})

/**
 * @desc    Get transfer statistics
 * @route   GET /api/v1/transfers/stats
 * @access  Private
 */
const getTransferStats = asyncHandler(async (req, res) => {
  const { warehouseId, dateFrom, dateTo } = req.query
  
  const dateRange = (dateFrom && dateTo) ? {
    from: dateFrom,
    to: dateTo
  } : null
  
  const stats = await transferService.getTransferStats(warehouseId, dateRange)
  return ApiResponse.success(res, stats, 'Transfer statistics retrieved successfully')
})

/**
 * @desc    Update transfer
 * @route   PUT /api/v1/transfers/:id
 * @access  Private
 */
const updateTransfer = asyncHandler(async (req, res) => {
  const transfer = await transferService.updateTransfer(req.params.id, req.body)
  return ApiResponse.success(res, transfer, 'Transfer updated successfully')
})

/**
 * @desc    Update transfer item
 * @route   PUT /api/v1/transfers/:id/items/:itemIndex
 * @access  Private
 */
const updateTransferItem = asyncHandler(async (req, res) => {
  const transfer = await transferService.updateTransferItem(
    req.params.id, 
    parseInt(req.params.itemIndex), 
    req.body
  )
  return ApiResponse.success(res, transfer, 'Transfer item updated successfully')
})

/**
 * @desc    Approve transfer
 * @route   POST /api/v1/transfers/:id/approve
 * @access  Private
 */
const approveTransfer = asyncHandler(async (req, res) => {
  const transfer = await transferService.approveTransfer(req.params.id, req.body)
  return ApiResponse.success(res, transfer, 'Transfer approved successfully')
})

/**
 * @desc    Start transfer
 * @route   POST /api/v1/transfers/:id/start
 * @access  Private
 */
const startTransfer = asyncHandler(async (req, res) => {
  const transfer = await transferService.startTransfer(req.params.id, req.body)
  return ApiResponse.success(res, transfer, 'Transfer started successfully')
})

/**
 * @desc    Complete transfer
 * @route   POST /api/v1/transfers/:id/complete
 * @access  Private
 */
const completeTransfer = asyncHandler(async (req, res) => {
  const transfer = await transferService.completeTransfer(req.params.id)
  return ApiResponse.success(res, transfer, 'Transfer completed successfully')
})

/**
 * @desc    Cancel transfer
 * @route   POST /api/v1/transfers/:id/cancel
 * @access  Private
 */
const cancelTransfer = asyncHandler(async (req, res) => {
  const transfer = await transferService.cancelTransfer(req.params.id, req.body)
  return ApiResponse.success(res, transfer, 'Transfer cancelled successfully')
})

module.exports = {
  createTransfer,
  getTransfers,
  getTransferById,
  getTransferByNumber,
  getTransfersByWarehouse,
  getPendingTransfers,
  getOverdueTransfers,
  getTransferStats,
  updateTransfer,
  updateTransferItem,
  approveTransfer,
  startTransfer,
  completeTransfer,
  cancelTransfer
}
