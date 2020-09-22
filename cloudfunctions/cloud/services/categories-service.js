/* eslint-disable @typescript-eslint/no-var-requires */
const BaseService = require('./base-service')

/**
 * 分类相关接口
 */
class CategoriesService extends BaseService {
  /**
   * 查询分类列表
   * @param {*} data
   */
  async list (data) {
    // type 1：品种、2：属性、3：科普
    const { type, pageIndex, pageSize } = data
    let collection = global.db.collection('categories')
    const where = {
      isHide: global._.neq(true),
      isDelete: global._.neq(true)
    }

    const isWhere = type !== null && type !== undefined && type !== 0
    if (isWhere) {
      where.type = type
    }

    if (pageSize && pageSize !== -1) {
      collection = collection
        .skip((pageIndex - 1) * pageSize)
        .limit(pageSize)
    }

    const result = await collection
      .where(where)
      .field({
        code: true,
        name: true
      })
      .orderBy('seq', 'asc')
      .get()
      .then(result => this.success(result.data))
      .catch(() => this.fail([]))

    if (pageSize && pageSize !== -1) {
      const total = await collection
        .where(where)
        .count()
        .then(result => { return result.total })
        .catch(() => { return -1 })

      result.total = total
    }

    return { data: result }
  }
}

module.exports = CategoriesService
