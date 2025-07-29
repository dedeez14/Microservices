const { Location, Warehouse } = require('../models')
const logger = require('../utils/logger')
const Pagination = require('../utils/pagination')

class LocationService {
  /**
   * Create a new location
   */
  async createLocation(locationData) {
    try {
      logger.info('Creating new location', { 
        warehouse: locationData.warehouse,
        code: locationData.code 
      })
      
      // Check if warehouse exists
      const warehouse = await Warehouse.findById(locationData.warehouse)
      if (!warehouse) {
        throw new Error('Warehouse not found')
      }
      
      // Check if location code already exists in this warehouse
      const existingLocation = await Location.findOne({
        warehouse: locationData.warehouse,
        code: locationData.code
      })
      
      if (existingLocation) {
        throw new Error(`Location with code '${locationData.code}' already exists in this warehouse`)
      }
      
      // Validate parent location if specified
      if (locationData.hierarchy.parent) {
        const parentLocation = await Location.findById(locationData.hierarchy.parent)
        if (!parentLocation) {
          throw new Error('Parent location not found')
        }
        
        if (parentLocation.warehouse.toString() !== locationData.warehouse.toString()) {
          throw new Error('Parent location must be in the same warehouse')
        }
        
        if (parentLocation.hierarchy.level >= locationData.hierarchy.level) {
          throw new Error('Parent location level must be less than child location level')
        }
      }
      
      const location = new Location(locationData)
      await location.save()
      
      logger.info('Location created successfully', { 
        id: location._id, 
        code: location.code 
      })
      
      return await Location.findById(location._id).populate('warehouse')
    } catch (error) {
      logger.error('Error creating location:', error)
      throw error
    }
  }
  
  /**
   * Get location by ID
   */
  async getLocationById(id) {
    try {
      const location = await Location.findById(id)
        .populate('warehouse')
        .populate('hierarchy.parent')
      
      if (!location) {
        throw new Error('Location not found')
      }
      
      return location
    } catch (error) {
      logger.error('Error getting location by ID:', error)
      throw error
    }
  }
  
  /**
   * Get all locations with pagination and filtering
   */
  async getLocations(query = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        sort = 'code',
        warehouse,
        code,
        name,
        type,
        status,
        parent,
        level
      } = query
      
      // Build filter object
      const filter = {}
      
      if (warehouse) {
        filter.warehouse = warehouse
      }
      
      if (code) {
        filter.code = new RegExp(code, 'i')
      }
      
      if (name) {
        filter.name = new RegExp(name, 'i')
      }
      
      if (type) {
        filter.type = type
      }
      
      if (status) {
        filter.status = status
      }
      
      if (parent) {
        filter['hierarchy.parent'] = parent
      }
      
      if (level) {
        filter['hierarchy.level'] = level
      }
      
      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { [sort]: 1 },
        populate: 'warehouse hierarchy.parent'
      }
      
      const result = await Pagination.paginate(Location, filter, options)
      
      logger.info('Retrieved locations', { 
        count: result.data.length,
        total: result.pagination.totalItems 
      })
      
      return result
    } catch (error) {
      logger.error('Error getting locations:', error)
      throw error
    }
  }
  
  /**
   * Get locations by warehouse
   */
  async getLocationsByWarehouse(warehouseId, query = {}) {
    try {
      const {
        type,
        status = 'available',
        level
      } = query
      
      const filter = { warehouse: warehouseId }
      
      if (type) {
        filter.type = type
      }
      
      if (status) {
        filter.status = status
      }
      
      if (level) {
        filter['hierarchy.level'] = level
      }
      
      const locations = await Location.find(filter)
        .populate('warehouse')
        .populate('hierarchy.parent')
        .sort({ 'hierarchy.level': 1, code: 1 })
      
      return locations
    } catch (error) {
      logger.error('Error getting locations by warehouse:', error)
      throw error
    }
  }
  
  /**
   * Get available locations
   */
  async getAvailableLocations(warehouseId = null) {
    try {
      const locations = await Location.findAvailable(warehouseId)
        .populate('warehouse')
      
      return locations
    } catch (error) {
      logger.error('Error getting available locations:', error)
      throw error
    }
  }
  
  /**
   * Get child locations
   */
  async getChildLocations(parentId) {
    try {
      const locations = await Location.findByParent(parentId)
        .populate('warehouse')
        .sort({ code: 1 })
      
      return locations
    } catch (error) {
      logger.error('Error getting child locations:', error)
      throw error
    }
  }
  
  /**
   * Update location
   */
  async updateLocation(id, updateData) {
    try {
      logger.info('Updating location', { id })
      
      const location = await Location.findById(id)
      if (!location) {
        throw new Error('Location not found')
      }
      
      // Validate parent location if being updated
      if (updateData.hierarchy && updateData.hierarchy.parent) {
        const parentLocation = await Location.findById(updateData.hierarchy.parent)
        if (!parentLocation) {
          throw new Error('Parent location not found')
        }
        
        if (parentLocation.warehouse.toString() !== location.warehouse.toString()) {
          throw new Error('Parent location must be in the same warehouse')
        }
      }
      
      Object.assign(location, updateData)
      await location.save()
      
      logger.info('Location updated successfully', { id })
      
      return await Location.findById(id)
        .populate('warehouse')
        .populate('hierarchy.parent')
    } catch (error) {
      logger.error('Error updating location:', error)
      throw error
    }
  }
  
  /**
   * Delete location
   */
  async deleteLocation(id) {
    try {
      logger.info('Deleting location', { id })
      
      const location = await Location.findById(id)
      if (!location) {
        throw new Error('Location not found')
      }
      
      // Check if location has child locations
      const childLocations = await this.getChildLocations(id)
      if (childLocations.length > 0) {
        throw new Error('Cannot delete location with child locations')
      }
      
      // Check if location has inventory
      // This would involve checking the Inventory collection
      // For now, we'll just delete the location
      
      await Location.findByIdAndDelete(id)
      
      logger.info('Location deleted successfully', { id })
      
      return true
    } catch (error) {
      logger.error('Error deleting location:', error)
      throw error
    }
  }
  
  /**
   * Check if location can store an item
   */
  async canStoreItem(locationId, item) {
    try {
      const location = await this.getLocationById(locationId)
      return location.canStoreItem(item)
    } catch (error) {
      logger.error('Error checking if location can store item:', error)
      throw error
    }
  }
  
  /**
   * Find suitable locations for an item
   */
  async findSuitableLocations(warehouseId, item, limit = 10) {
    try {
      const locations = await this.getAvailableLocations(warehouseId)
      
      const suitableLocations = locations
        .filter(location => location.canStoreItem(item))
        .slice(0, limit)
      
      return suitableLocations
    } catch (error) {
      logger.error('Error finding suitable locations:', error)
      throw error
    }
  }
  
  /**
   * Get location hierarchy
   */
  async getLocationHierarchy(warehouseId) {
    try {
      const locations = await this.getLocationsByWarehouse(warehouseId)
      
      // Build hierarchy tree
      const locationMap = new Map()
      const rootLocations = []
      
      // First pass: create map
      locations.forEach(location => {
        locationMap.set(location._id.toString(), {
          ...location.toObject(),
          children: []
        })
      })
      
      // Second pass: build tree
      locations.forEach(location => {
        const locationObj = locationMap.get(location._id.toString())
        
        if (location.hierarchy.parent) {
          const parentId = location.hierarchy.parent._id.toString()
          const parent = locationMap.get(parentId)
          if (parent) {
            parent.children.push(locationObj)
          }
        } else {
          rootLocations.push(locationObj)
        }
      })
      
      return rootLocations
    } catch (error) {
      logger.error('Error getting location hierarchy:', error)
      throw error
    }
  }
  
  /**
   * Update location status
   */
  async updateLocationStatus(id, status) {
    try {
      logger.info('Updating location status', { id, status })
      
      const location = await Location.findById(id)
      if (!location) {
        throw new Error('Location not found')
      }
      
      location.status = status
      await location.save()
      
      logger.info('Location status updated successfully', { id, status })
      
      return location
    } catch (error) {
      logger.error('Error updating location status:', error)
      throw error
    }
  }
}

module.exports = new LocationService()
