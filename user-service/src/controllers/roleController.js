const Role = require('../models/Role')
const AuditLog = require('../models/AuditLog')
const { validationResult } = require('express-validator')

class RoleController {
  // Get all roles
  async getRoles(req, res) {
    try {
      const page = parseInt(req.query.page) || 1
      const limit = parseInt(req.query.limit) || 10
      const search = req.query.search || ''
      const includeSystem = req.query.includeSystem === 'true'

      // Build search query
      const query = {}

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      }

      if (!includeSystem) {
        query.isSystemRole = { $ne: true }
      }

      // Get roles with pagination
      const roles = await Role.find(query)
        .sort({ level: 1, name: 1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec()

      // Get total count
      const total = await Role.countDocuments(query)

      res.json({
        success: true,
        data: {
          roles,
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
        message: 'Failed to get roles',
        error: error.message
      })
    }
  }

  // Get role by ID
  async getRoleById(req, res) {
    try {
      const { id } = req.params

      const role = await Role.findById(id)

      if (!role) {
        return res.status(404).json({
          success: false,
          message: 'Role not found'
        })
      }

      res.json({
        success: true,
        data: { role }
      })

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get role',
        error: error.message
      })
    }
  }

  // Create new role
  async createRole(req, res) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        })
      }

      const { name, description, permissions, level, parentRole } = req.body

      // Check if role already exists
      const existingRole = await Role.findOne({ name: name.toUpperCase() })
      if (existingRole) {
        return res.status(409).json({
          success: false,
          message: 'Role already exists with this name'
        })
      }

      // Validate parent role if provided
      let parentRoleDoc = null
      if (parentRole) {
        parentRoleDoc = await Role.findById(parentRole)
        if (!parentRoleDoc) {
          return res.status(400).json({
            success: false,
            message: 'Parent role not found'
          })
        }
      }

      // Create role
      const role = new Role({
        name: name.toUpperCase(),
        description,
        permissions: permissions || [],
        level: level || 1,
        parentRole: parentRoleDoc ? parentRoleDoc._id : null,
        isSystemRole: false,
        createdBy: req.user._id
      })

      await role.save()

      // Log role creation
      await AuditLog.logUserManagement(
        req.user._id,
        req.user.username,
        'ROLE_CREATED',
        req,
        'SUCCESS',
        `Created role ${role.name}`,
        { targetRoleId: role._id, targetRoleName: role.name }
      )

      res.status(201).json({
        success: true,
        message: 'Role created successfully',
        data: { role }
      })

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Role creation failed',
        error: error.message
      })
    }
  }

  // Update role
  async updateRole(req, res) {
    try {
      const { id } = req.params
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        })
      }

      const role = await Role.findById(id)
      if (!role) {
        return res.status(404).json({
          success: false,
          message: 'Role not found'
        })
      }

      // Prevent updating system roles
      if (role.isSystemRole) {
        return res.status(403).json({
          success: false,
          message: 'Cannot modify system roles'
        })
      }

      const { name, description, permissions, level, parentRole } = req.body

      // Check if new name conflicts with existing roles
      if (name && name.toUpperCase() !== role.name) {
        const existingRole = await Role.findOne({ name: name.toUpperCase() })
        if (existingRole) {
          return res.status(409).json({
            success: false,
            message: 'Role name already in use'
          })
        }
      }

      // Validate parent role if provided
      let parentRoleDoc = null
      if (parentRole) {
        parentRoleDoc = await Role.findById(parentRole)
        if (!parentRoleDoc) {
          return res.status(400).json({
            success: false,
            message: 'Parent role not found'
          })
        }

        // Prevent circular hierarchy
        if (parentRoleDoc._id.toString() === role._id.toString()) {
          return res.status(400).json({
            success: false,
            message: 'Role cannot be its own parent'
          })
        }
      }

      // Update role
      const updateData = {
        updatedBy: req.user._id,
        updatedAt: new Date()
      }

      if (name) updateData.name = name.toUpperCase()
      if (description !== undefined) updateData.description = description
      if (permissions) updateData.permissions = permissions
      if (level !== undefined) updateData.level = level
      if (parentRole !== undefined) updateData.parentRole = parentRoleDoc ? parentRoleDoc._id : null

      const updatedRole = await Role.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      )

      // Log role update
      await AuditLog.logUserManagement(
        req.user._id,
        req.user.username,
        'ROLE_UPDATED',
        req,
        'SUCCESS',
        `Updated role ${updatedRole.name}`,
        { 
          targetRoleId: updatedRole._id, 
          targetRoleName: updatedRole.name,
          changes: Object.keys(updateData)
        }
      )

      res.json({
        success: true,
        message: 'Role updated successfully',
        data: { role: updatedRole }
      })

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Role update failed',
        error: error.message
      })
    }
  }

  // Delete role
  async deleteRole(req, res) {
    try {
      const { id } = req.params

      const role = await Role.findById(id)
      if (!role) {
        return res.status(404).json({
          success: false,
          message: 'Role not found'
        })
      }

      // Prevent deleting system roles
      if (role.isSystemRole) {
        return res.status(403).json({
          success: false,
          message: 'Cannot delete system roles'
        })
      }

      // Check if role is in use
      const User = require('../models/User')
      const usersWithRole = await User.countDocuments({ roles: role._id })
      
      if (usersWithRole > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete role. It is assigned to ${usersWithRole} user(s).`
        })
      }

      // Check if role has child roles
      const childRoles = await Role.countDocuments({ parentRole: role._id })
      if (childRoles > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete role. It has child roles.'
        })
      }

      await Role.findByIdAndDelete(id)

      // Log role deletion
      await AuditLog.logUserManagement(
        req.user._id,
        req.user.username,
        'ROLE_DELETED',
        req,
        'SUCCESS',
        `Deleted role ${role.name}`,
        { targetRoleId: role._id, targetRoleName: role.name }
      )

      res.json({
        success: true,
        message: 'Role deleted successfully'
      })

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Role deletion failed',
        error: error.message
      })
    }
  }

  // Get role hierarchy
  async getRoleHierarchy(req, res) {
    try {
      const roles = await Role.find({}).sort({ level: 1, name: 1 })

      // Build hierarchy tree
      const roleMap = new Map()
      const rootRoles = []

      // First pass: create map of all roles
      roles.forEach(role => {
        roleMap.set(role._id.toString(), {
          ...role.toObject(),
          children: []
        })
      })

      // Second pass: build hierarchy
      roles.forEach(role => {
        if (role.parentRole) {
          const parent = roleMap.get(role.parentRole.toString())
          const child = roleMap.get(role._id.toString())
          if (parent && child) {
            parent.children.push(child)
          }
        } else {
          rootRoles.push(roleMap.get(role._id.toString()))
        }
      })

      res.json({
        success: true,
        data: { hierarchy: rootRoles }
      })

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get role hierarchy',
        error: error.message
      })
    }
  }

  // Get available permissions
  async getPermissions(req, res) {
    try {
      // Define all available permissions grouped by category
      const permissions = {
        users: [
          'create_users',
          'read_users',
          'update_users',
          'delete_users',
          'manage_users'
        ],
        roles: [
          'create_roles',
          'read_roles',
          'update_roles',
          'delete_roles',
          'manage_roles'
        ],
        warehouse: [
          'create_products',
          'read_products',
          'update_products',
          'delete_products',
          'manage_inventory',
          'create_categories',
          'read_categories',
          'update_categories',
          'delete_categories'
        ],
        system: [
          'view_audit_logs',
          'manage_system_settings',
          'backup_restore',
          'manage_integrations'
        ],
        reports: [
          'view_reports',
          'create_reports',
          'export_data'
        ]
      }

      res.json({
        success: true,
        data: { permissions }
      })

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get permissions',
        error: error.message
      })
    }
  }

  // Assign role to user
  async assignRoleToUser(req, res) {
    try {
      const { userId, roleId } = req.body

      const User = require('../models/User')
      const user = await User.findById(userId)
      const role = await Role.findById(roleId)

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        })
      }

      if (!role) {
        return res.status(404).json({
          success: false,
          message: 'Role not found'
        })
      }

      // Check if user already has this role
      if (user.roles.includes(roleId)) {
        return res.status(400).json({
          success: false,
          message: 'User already has this role'
        })
      }

      // Add role to user
      user.roles.push(roleId)
      user.updatedBy = req.user._id
      await user.save()

      // Log role assignment
      await AuditLog.logUserManagement(
        req.user._id,
        req.user.username,
        'ROLE_ASSIGNED',
        req,
        'SUCCESS',
        `Assigned role ${role.name} to user ${user.username}`,
        { 
          targetUserId: user._id, 
          targetUsername: user.username,
          targetRoleId: role._id,
          targetRoleName: role.name
        }
      )

      await user.populate('roles', 'name description permissions')

      res.json({
        success: true,
        message: 'Role assigned successfully',
        data: { user }
      })

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Role assignment failed',
        error: error.message
      })
    }
  }

  // Remove role from user
  async removeRoleFromUser(req, res) {
    try {
      const { userId, roleId } = req.body

      const User = require('../models/User')
      const user = await User.findById(userId)
      const role = await Role.findById(roleId)

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        })
      }

      if (!role) {
        return res.status(404).json({
          success: false,
          message: 'Role not found'
        })
      }

      // Check if user has this role
      if (!user.roles.includes(roleId)) {
        return res.status(400).json({
          success: false,
          message: 'User does not have this role'
        })
      }

      // Prevent removing the last role
      if (user.roles.length === 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot remove the last role from user'
        })
      }

      // Remove role from user
      user.roles = user.roles.filter(id => id.toString() !== roleId.toString())
      user.updatedBy = req.user._id
      await user.save()

      // Log role removal
      await AuditLog.logUserManagement(
        req.user._id,
        req.user.username,
        'ROLE_REMOVED',
        req,
        'SUCCESS',
        `Removed role ${role.name} from user ${user.username}`,
        { 
          targetUserId: user._id, 
          targetUsername: user.username,
          targetRoleId: role._id,
          targetRoleName: role.name
        }
      )

      await user.populate('roles', 'name description permissions')

      res.json({
        success: true,
        message: 'Role removed successfully',
        data: { user }
      })

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Role removal failed',
        error: error.message
      })
    }
  }

  // Get role statistics
  async getRoleStats(req, res) {
    try {
      const User = require('../models/User')
      
      const roleStats = await User.aggregate([
        { $unwind: '$roles' },
        {
          $lookup: {
            from: 'roles',
            localField: 'roles',
            foreignField: '_id',
            as: 'role'
          }
        },
        { $unwind: '$role' },
        {
          $group: {
            _id: {
              roleId: '$role._id',
              roleName: '$role.name'
            },
            userCount: { $sum: 1 },
            activeUserCount: {
              $sum: {
                $cond: [{ $eq: ['$status', 'active'] }, 1, 0]
              }
            }
          }
        },
        {
          $project: {
            roleId: '$_id.roleId',
            roleName: '$_id.roleName',
            userCount: 1,
            activeUserCount: 1,
            _id: 0
          }
        },
        { $sort: { roleName: 1 } }
      ])

      const totalRoles = await Role.countDocuments()
      const systemRoles = await Role.countDocuments({ isSystemRole: true })
      const customRoles = totalRoles - systemRoles

      res.json({
        success: true,
        data: {
          totalRoles,
          systemRoles,
          customRoles,
          roleUsage: roleStats
        }
      })

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get role statistics',
        error: error.message
      })
    }
  }
}

module.exports = new RoleController()
