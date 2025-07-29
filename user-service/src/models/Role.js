const mongoose = require('mongoose')

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Role name is required'],
    unique: true,
    trim: true,
    uppercase: true,
    maxlength: [50, 'Role name cannot exceed 50 characters']
  },
  displayName: {
    type: String,
    required: [true, 'Display name is required'],
    trim: true,
    maxlength: [100, 'Display name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  permissions: [{
    resource: {
      type: String,
      required: true,
      trim: true
    },
    actions: [{
      type: String,
      enum: ['create', 'read', 'update', 'delete', 'manage'],
      required: true
    }],
    conditions: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  }],
  level: {
    type: Number,
    required: true,
    min: 1,
    max: 100,
    default: 10
  },
  isSystem: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  parentRole: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    default: null
  },
  childRoles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes
roleSchema.index({ name: 1 })
roleSchema.index({ isActive: 1 })
roleSchema.index({ level: 1 })

// Pre-save middleware to ensure system roles cannot be modified
roleSchema.pre('save', function(next) {
  if (this.isModified() && this.isSystem && !this.isNew) {
    return next(new Error('System roles cannot be modified'))
  }
  next()
})

// Pre-remove middleware to prevent deletion of system roles
roleSchema.pre('remove', function(next) {
  if (this.isSystem) {
    return next(new Error('System roles cannot be deleted'))
  }
  next()
})

// Instance method to check if role has permission
roleSchema.methods.hasPermission = function(resource, action) {
  return this.permissions.some(permission => 
    permission.resource === resource && 
    permission.actions.includes(action)
  )
}

// Instance method to add permission
roleSchema.methods.addPermission = function(resource, actions, conditions = {}) {
  const existingPermission = this.permissions.find(p => p.resource === resource)
  
  if (existingPermission) {
    // Merge actions and conditions
    const uniqueActions = [...new Set([...existingPermission.actions, ...actions])]
    existingPermission.actions = uniqueActions
    existingPermission.conditions = { ...existingPermission.conditions, ...conditions }
  } else {
    this.permissions.push({
      resource,
      actions,
      conditions
    })
  }
}

// Instance method to remove permission
roleSchema.methods.removePermission = function(resource, actions = null) {
  if (actions) {
    const permission = this.permissions.find(p => p.resource === resource)
    if (permission) {
      permission.actions = permission.actions.filter(action => !actions.includes(action))
      if (permission.actions.length === 0) {
        this.permissions = this.permissions.filter(p => p.resource !== resource)
      }
    }
  } else {
    this.permissions = this.permissions.filter(p => p.resource !== resource)
  }
}

// Static method to get default roles
roleSchema.statics.getDefaultRoles = function() {
  return [
    {
      name: 'SUPER_ADMIN',
      displayName: 'Super Administrator',
      description: 'Full system access with all permissions',
      level: 100,
      isSystem: true,
      permissions: [
        {
          resource: '*',
          actions: ['manage']
        }
      ]
    },
    {
      name: 'ADMIN',
      displayName: 'Administrator',
      description: 'Administrative access with user and system management',
      level: 90,
      isSystem: true,
      permissions: [
        {
          resource: 'users',
          actions: ['create', 'read', 'update', 'delete']
        },
        {
          resource: 'roles',
          actions: ['create', 'read', 'update', 'delete']
        },
        {
          resource: 'warehouse',
          actions: ['create', 'read', 'update', 'delete']
        },
        {
          resource: 'inventory',
          actions: ['create', 'read', 'update', 'delete']
        },
        {
          resource: 'reports',
          actions: ['read']
        }
      ]
    },
    {
      name: 'MANAGER',
      displayName: 'Manager',
      description: 'Management access with team oversight capabilities',
      level: 70,
      isSystem: true,
      permissions: [
        {
          resource: 'users',
          actions: ['read', 'update']
        },
        {
          resource: 'warehouse',
          actions: ['read', 'update']
        },
        {
          resource: 'inventory',
          actions: ['create', 'read', 'update']
        },
        {
          resource: 'transactions',
          actions: ['create', 'read', 'update']
        },
        {
          resource: 'reports',
          actions: ['read']
        }
      ]
    },
    {
      name: 'SUPERVISOR',
      displayName: 'Supervisor',
      description: 'Supervisory access with operational oversight',
      level: 50,
      isSystem: true,
      permissions: [
        {
          resource: 'inventory',
          actions: ['read', 'update']
        },
        {
          resource: 'transactions',
          actions: ['create', 'read', 'update']
        },
        {
          resource: 'warehouse',
          actions: ['read']
        },
        {
          resource: 'reports',
          actions: ['read']
        }
      ]
    },
    {
      name: 'OPERATOR',
      displayName: 'Operator',
      description: 'Operational access for daily tasks',
      level: 30,
      isSystem: true,
      permissions: [
        {
          resource: 'inventory',
          actions: ['read', 'update']
        },
        {
          resource: 'transactions',
          actions: ['create', 'read']
        },
        {
          resource: 'warehouse',
          actions: ['read']
        }
      ]
    },
    {
      name: 'VIEWER',
      displayName: 'Viewer',
      description: 'Read-only access for viewing information',
      level: 10,
      isSystem: true,
      permissions: [
        {
          resource: 'inventory',
          actions: ['read']
        },
        {
          resource: 'warehouse',
          actions: ['read']
        },
        {
          resource: 'transactions',
          actions: ['read']
        }
      ]
    }
  ]
}

// Static method to seed default roles
roleSchema.statics.seedDefaultRoles = async function() {
  const defaultRoles = this.getDefaultRoles()
  
  for (const roleData of defaultRoles) {
    const existingRole = await this.findOne({ name: roleData.name })
    if (!existingRole) {
      await this.create(roleData)
    }
  }
}

module.exports = mongoose.model('Role', roleSchema)
