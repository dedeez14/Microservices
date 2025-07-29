/**
 * Pagination utility
 */
class Pagination {
  static getPaginationParams(query, defaultLimit = 20, maxLimit = 100) {
    const page = Math.max(1, parseInt(query.page) || 1)
    const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit) || defaultLimit))
    const skip = (page - 1) * limit

    return {
      page,
      limit,
      skip
    }
  }

  static getPaginationInfo(page, limit, total) {
    const totalPages = Math.ceil(total / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? page + 1 : null,
      prevPage: hasPrevPage ? page - 1 : null
    }
  }

  static async paginate(model, query = {}, options = {}) {
    const {
      page = 1,
      limit = 20,
      sort = { createdAt: -1 },
      populate = '',
      select = ''
    } = options

    const skip = (page - 1) * limit

    const [data, total] = await Promise.all([
      model
        .find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate(populate)
        .select(select)
        .lean(),
      model.countDocuments(query)
    ])

    const pagination = this.getPaginationInfo(page, limit, total)

    return {
      data,
      pagination
    }
  }
}

module.exports = Pagination
