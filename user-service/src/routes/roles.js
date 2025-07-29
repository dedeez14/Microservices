const express = require('express')
const router = express.Router()
const roleController = require('../controllers/roleController')
const { authenticate, authorize } = require('../middleware/auth')
const { RoleValidator } = require('../validators')

// Get all roles
router.get('/', 
  authenticate, 
  authorize('read_roles'), 
  RoleValidator.validateRoleQuery(), 
  roleController.getRoles
)

// Get role statistics (admin only)
router.get('/stats', 
  authenticate, 
  authorize('manage_roles'), 
  roleController.getRoleStats
)

// Get role hierarchy
router.get('/hierarchy', 
  authenticate, 
  authorize('read_roles'), 
  roleController.getRoleHierarchy
)

// Get available permissions
router.get('/permissions', 
  authenticate, 
  authorize('read_roles'), 
  roleController.getPermissions
)

// Get role by ID
router.get('/:id', 
  authenticate, 
  authorize('read_roles'), 
  RoleValidator.validateRoleId(),
  roleController.getRoleById
)

// Create new role (admin only)
router.post('/', 
  authenticate, 
  authorize('create_roles'), 
  RoleValidator.validateCreateRole(), 
  roleController.createRole
)

// Update role (admin only)
router.put('/:id', 
  authenticate, 
  authorize('update_roles'), 
  RoleValidator.validateUpdateRole(),
  roleController.updateRole
)

// Delete role (admin only)
router.delete('/:id', 
  authenticate, 
  authorize('delete_roles'), 
  RoleValidator.validateRoleId(),
  roleController.deleteRole
)

// Assign role to user (admin only)
router.post('/assign', 
  authenticate, 
  authorize('manage_roles'), 
  RoleValidator.validateRoleAssignment(),
  roleController.assignRoleToUser
)

// Remove role from user (admin only)
router.post('/remove', 
  authenticate, 
  authorize('manage_roles'), 
  RoleValidator.validateRoleAssignment(),
  roleController.removeRoleFromUser
)

module.exports = router
