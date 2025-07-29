const express = require('express')
const router = express.Router()
const auditController = require('../controllers/auditController')
const { authenticate, authorize } = require('../middleware/auth')
const { AuditValidator } = require('../validators')

// Get audit logs (admin only)
router.get('/', 
  authenticate, 
  authorize('view_audit_logs'), 
  AuditValidator.validateAuditQuery(), 
  auditController.getAuditLogs
)

// Get audit log statistics (admin only)
router.get('/stats', 
  authenticate, 
  authorize('view_audit_logs'), 
  AuditValidator.validateAuditStatsQuery(),
  auditController.getAuditStats
)

// Get available filter options
router.get('/filters', 
  authenticate, 
  authorize('view_audit_logs'), 
  auditController.getAuditFilters
)

// Get audit log by ID (admin only)
router.get('/:id', 
  authenticate, 
  authorize('view_audit_logs'), 
  AuditValidator.validateAuditLogId(),
  auditController.getAuditLogById
)

// Export audit logs (admin only)
router.get('/export', 
  authenticate, 
  authorize('view_audit_logs'), 
  AuditValidator.validateAuditQuery(),
  auditController.exportAuditLogs
)

// Get user activity
router.get('/users/:userId', 
  authenticate, 
  authorize('view_audit_logs'), 
  AuditValidator.validateUserActivity(),
  auditController.getUserActivity
)

// Cleanup old audit logs (super admin only)
router.post('/cleanup', 
  authenticate, 
  authorize('manage_system_settings'), 
  AuditValidator.validateCleanup(),
  auditController.cleanupAuditLogs
)

module.exports = router
