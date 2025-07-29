const AuditLog = require('../models/AuditLog')
const { validationResult } = require('express-validator')

class AuditController {
  // Get audit logs
  async getAuditLogs(req, res) {
    try {
      const page = parseInt(req.query.page) || 1
      const limit = Math.min(parseInt(req.query.limit) || 50, 100) // Max 100 per page
      const search = req.query.search || ''
      const action = req.query.action
      const category = req.query.category
      const severity = req.query.severity
      const status = req.query.status
      const userId = req.query.userId
      const resource = req.query.resource
      const startDate = req.query.startDate
      const endDate = req.query.endDate
      const sortBy = req.query.sortBy || 'timestamp'
      const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1

      // Build search query
      const query = {}

      if (search) {
        query.$or = [
          { action: { $regex: search, $options: 'i' } },
          { username: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { resource: { $regex: search, $options: 'i' } }
        ]
      }

      if (action) query.action = action
      if (category) query.category = category
      if (severity) query.severity = severity
      if (status) query.status = status
      if (userId) query.userId = userId
      if (resource) query.resource = resource

      // Date range filter
      if (startDate || endDate) {
        query.timestamp = {}
        if (startDate) query.timestamp.$gte = new Date(startDate)
        if (endDate) query.timestamp.$lte = new Date(endDate)
      }

      // Get audit logs with pagination
      const auditLogs = await AuditLog.find(query)
        .populate('userId', 'username email profile.firstName profile.lastName')
        .sort({ [sortBy]: sortOrder })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec()

      // Get total count
      const total = await AuditLog.countDocuments(query)

      res.json({
        success: true,
        data: {
          auditLogs,
          pagination: {
            current: page,
            pages: Math.ceil(total / limit),
            total,
            hasNext: page < Math.ceil(total / limit),
            hasPrev: page > 1
          }
        }
      })

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get audit logs',
        error: error.message
      })
    }
  }

  // Get audit log by ID
  async getAuditLogById(req, res) {
    try {
      const { id } = req.params

      const auditLog = await AuditLog.findById(id)
        .populate('userId', 'username email profile.firstName profile.lastName')

      if (!auditLog) {
        return res.status(404).json({
          success: false,
          message: 'Audit log not found'
        })
      }

      res.json({
        success: true,
        data: { auditLog }
      })

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get audit log',
        error: error.message
      })
    }
  }

  // Get audit log statistics
  async getAuditStats(req, res) {
    try {
      const { period = '30d', startDate, endDate } = req.query

      // Calculate date range
      let dateFilter = {}
      if (startDate && endDate) {
        dateFilter = {
          timestamp: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      } else {
        const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
        dateFilter = {
          timestamp: {
            $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
          }
        }
      }

      // Get activity by action
      const actionStats = await AuditLog.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: '$action',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])

      // Get activity by category
      const categoryStats = await AuditLog.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ])

      // Get activity by severity
      const severityStats = await AuditLog.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: '$severity',
            count: { $sum: 1 }
          }
        }
      ])

      // Get activity by status
      const statusStats = await AuditLog.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ])

      // Get daily activity (last 30 days)
      const dailyActivity = await AuditLog.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$timestamp'
              }
            },
            count: { $sum: 1 },
            successCount: {
              $sum: {
                $cond: [{ $eq: ['$status', 'SUCCESS'] }, 1, 0]
              }
            },
            failureCount: {
              $sum: {
                $cond: [{ $eq: ['$status', 'FAILURE'] }, 1, 0]
              }
            }
          }
        },
        { $sort: { _id: 1 } }
      ])

      // Get top users by activity
      const topUsers = await AuditLog.aggregate([
        { $match: { ...dateFilter, userId: { $ne: null } } },
        {
          $group: {
            _id: {
              userId: '$userId',
              username: '$username'
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
        {
          $project: {
            userId: '$_id.userId',
            username: '$_id.username',
            count: 1,
            _id: 0
          }
        }
      ])

      // Get failed login attempts
      const failedLogins = await AuditLog.countDocuments({
        ...dateFilter,
        action: 'LOGIN_FAILED'
      })

      // Get password reset attempts
      const passwordResets = await AuditLog.countDocuments({
        ...dateFilter,
        action: { $in: ['PASSWORD_RESET', 'PASSWORD_CHANGE'] }
      })

      // Get total activity
      const totalActivity = await AuditLog.countDocuments(dateFilter)

      res.json({
        success: true,
        data: {
          period,
          totalActivity,
          failedLogins,
          passwordResets,
          actionBreakdown: actionStats,
          categoryBreakdown: categoryStats,
          severityBreakdown: severityStats,
          statusBreakdown: statusStats,
          dailyActivity,
          topUsers
        }
      })

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get audit statistics',
        error: error.message
      })
    }
  }

  // Get user activity
  async getUserActivity(req, res) {
    try {
      const { userId } = req.params
      const page = parseInt(req.query.page) || 1
      const limit = Math.min(parseInt(req.query.limit) || 20, 50)
      const action = req.query.action
      const category = req.query.category
      const startDate = req.query.startDate
      const endDate = req.query.endDate

      // Build query
      const query = { userId }

      if (action) query.action = action
      if (category) query.category = category

      // Date range filter
      if (startDate || endDate) {
        query.timestamp = {}
        if (startDate) query.timestamp.$gte = new Date(startDate)
        if (endDate) query.timestamp.$lte = new Date(endDate)
      }

      // Get user activity logs
      const activityLogs = await AuditLog.find(query)
        .sort({ timestamp: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec()

      // Get total count
      const total = await AuditLog.countDocuments(query)

      res.json({
        success: true,
        data: {
          activityLogs,
          pagination: {
            current: page,
            pages: Math.ceil(total / limit),
            total,
            hasNext: page < Math.ceil(total / limit),
            hasPrev: page > 1
          }
        }
      })

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get user activity',
        error: error.message
      })
    }
  }

  // Export audit logs
  async exportAuditLogs(req, res) {
    try {
      const { format = 'json', startDate, endDate, ...filters } = req.query

      // Build query
      const query = {}

      // Apply filters
      if (filters.action) query.action = filters.action
      if (filters.category) query.category = filters.category
      if (filters.severity) query.severity = filters.severity
      if (filters.status) query.status = filters.status
      if (filters.userId) query.userId = filters.userId
      if (filters.resource) query.resource = filters.resource

      // Date range filter
      if (startDate || endDate) {
        query.timestamp = {}
        if (startDate) query.timestamp.$gte = new Date(startDate)
        if (endDate) query.timestamp.$lte = new Date(endDate)
      }

      // Limit export to prevent overwhelming the system
      const maxExportLimit = 10000
      const auditLogs = await AuditLog.find(query)
        .populate('userId', 'username email')
        .sort({ timestamp: -1 })
        .limit(maxExportLimit)
        .lean()

      if (format === 'csv') {
        // Convert to CSV
        const csv = this.convertToCSV(auditLogs)
        
        res.setHeader('Content-Type', 'text/csv')
        res.setHeader('Content-Disposition', `attachment; filename=audit-logs-${Date.now()}.csv`)
        res.send(csv)
      } else {
        // Return as JSON
        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Content-Disposition', `attachment; filename=audit-logs-${Date.now()}.json`)
        res.json({
          success: true,
          data: {
            auditLogs,
            exported: auditLogs.length,
            exportedAt: new Date(),
            filters: filters
          }
        })
      }

      // Log export activity
      await AuditLog.createLog({
        userId: req.user._id,
        username: req.user.username,
        userRole: req.user.roles[0]?.name || 'UNKNOWN',
        action: 'AUDIT_LOGS_EXPORTED',
        category: 'SYSTEM',
        severity: 'LOW',
        resource: 'audit-logs',
        method: req.method,
        endpoint: req.originalUrl,
        description: `Exported ${auditLogs.length} audit logs in ${format} format`,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent') || '',
        status: 'SUCCESS',
        metadata: { 
          format, 
          filters,
          recordCount: auditLogs.length
        },
        timestamp: new Date()
      })

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to export audit logs',
        error: error.message
      })
    }
  }

  // Get audit log filters (available options)
  async getAuditFilters(req, res) {
    try {
      // Get unique values for filter dropdowns
      const actions = await AuditLog.distinct('action')
      const categories = await AuditLog.distinct('category')
      const severities = await AuditLog.distinct('severity')
      const statuses = await AuditLog.distinct('status')
      const resources = await AuditLog.distinct('resource')

      res.json({
        success: true,
        data: {
          actions: actions.sort(),
          categories: categories.sort(),
          severities: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
          statuses: statuses.sort(),
          resources: resources.sort()
        }
      })

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get audit filters',
        error: error.message
      })
    }
  }

  // Helper method to convert audit logs to CSV
  convertToCSV(auditLogs) {
    if (auditLogs.length === 0) return ''

    const headers = [
      'Timestamp',
      'Action',
      'Category',
      'Severity',
      'Status',
      'Username',
      'Resource',
      'Method',
      'Endpoint',
      'IP Address',
      'User Agent',
      'Description',
      'Error Message'
    ]

    const csvRows = [headers.join(',')]

    auditLogs.forEach(log => {
      const row = [
        log.timestamp?.toISOString() || '',
        log.action || '',
        log.category || '',
        log.severity || '',
        log.status || '',
        log.username || '',
        log.resource || '',
        log.method || '',
        log.endpoint || '',
        log.ipAddress || '',
        `"${(log.userAgent || '').replace(/"/g, '""')}"`,
        `"${(log.description || '').replace(/"/g, '""')}"`,
        `"${(log.errorMessage || '').replace(/"/g, '""')}"`
      ]
      csvRows.push(row.join(','))
    })

    return csvRows.join('\n')
  }

  // Clean up old audit logs
  async cleanupAuditLogs(req, res) {
    try {
      const { olderThanDays = 365 } = req.body

      const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000)
      
      const result = await AuditLog.deleteMany({
        timestamp: { $lt: cutoffDate }
      })

      // Log cleanup activity
      await AuditLog.createLog({
        userId: req.user._id,
        username: req.user.username,
        userRole: req.user.roles[0]?.name || 'UNKNOWN',
        action: 'AUDIT_LOGS_CLEANUP',
        category: 'SYSTEM',
        severity: 'MEDIUM',
        resource: 'audit-logs',
        method: req.method,
        endpoint: req.originalUrl,
        description: `Cleaned up ${result.deletedCount} audit logs older than ${olderThanDays} days`,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent') || '',
        status: 'SUCCESS',
        metadata: { 
          olderThanDays,
          deletedCount: result.deletedCount,
          cutoffDate
        },
        timestamp: new Date()
      })

      res.json({
        success: true,
        message: `Successfully cleaned up ${result.deletedCount} old audit logs`,
        data: {
          deletedCount: result.deletedCount,
          cutoffDate
        }
      })

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to cleanup audit logs',
        error: error.message
      })
    }
  }
}

module.exports = new AuditController()
