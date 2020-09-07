const BaseService = require('./base-service.js')

/**
 * 猫咪相关接口
 */
class CatsService extends BaseService {
  /**
   * 查询猫咪列表
   * @param {*} data
   * @param {*} context
   */
  async list (data, context) {
    const { type, admin, pageIndex, pageSize } = data
    let collection = db.collection('cats')
    let where = {
      isDelete: _.neq(true)
    }
    let isWhere = type !== null && type !== undefined && type.length > 0
    if (isWhere) {
      where.type = type
    }
    let isAdmin = admin !== null && admin !== undefined && admin === true
    if (!isAdmin) {
      where.isHide = _.neq(true)
    }

    if (pageSize && pageSize !== -1) {
      collection = collection
        .skip((pageIndex - 1) * pageSize)
        .limit(pageSize)
    }

    let result = await collection
      .where(where)
      .field({
        _id: true,
        name: true,
        desc: true,
        avatar: true,
        type: true
      })
      .orderBy('updateTime', 'desc')
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

    return { data: result }
  }

  /**
   * 查询猫咪详细
   * @param {*} data
   * @param {*} context
   */
  async detail (data, context) {
    const { id } = data
    let collection = db.collection('cats')
    let result = await collection
      .doc(id)
      .get()
      .then(result => this.success(result.data))
      .catch(() => this.fail({}))

    return { data: result }
  }
}

module.exports = CatsService
