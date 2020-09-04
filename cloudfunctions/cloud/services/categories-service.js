const BaseService = require('./base-service.js')

/**
 * 分类相关接口
 */
class CategoriesService extends BaseService {
  /**
   * 查询分类列表
   * @param {*} data
   * @param {*} context
   */
  async list (data, context) {
    // type 1：品种、2：属性、3：科普
    const { type, admin, pageIndex, pageSize } = data
    let collection = db.collection('categories')
    let where = {
      isDelete: _.neq(true)
    }
    let isWhere = type !== null && type !== undefined && type !== 0
    if (isWhere) {
      where.type = type
    }
    let isAdmin = admin !== null && admin !== undefined && admin === true
    if (!isAdmin) {
      where.isHide = _.neq(true)
      collection = collection.orderBy('seq', 'asc')
    } else {
      collection = collection.orderBy('updateTime', 'desc')
    }

    if (pageSize && pageSize !== -1) {
      collection = collection
        .skip((pageIndex - 1) * pageSize)
        .limit(pageSize)
    }

    let result = await collection
      .where(where)
      .field({
        code: true,
        name: true
      })
      .get()
      .then(result => this.success(result.data))
      .catch(() => this.fail([]))

    if (pageSize && pageSize !== -1) {
      let total = await collection
        .where(where)
        .count()
        .then(result => { return result.total })
        .catch(() => { return -1 })

      result.total = total
    }

    return {
      data: result
    }
  }
}

module.exports = CategoriesService
