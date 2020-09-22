/* eslint-disable @typescript-eslint/no-var-requires */
const BaseService = require('./base-service')

/**
 * 猫咪相关接口
 */
class CatsService extends BaseService {
  /**
   * 查询猫咪列表
   * @param {*} data
   */
  async list (data) {
    const { type, name, pageIndex, pageSize } = data
    let collection = global.db.collection('cats')

    const where = {
      isHide: global._.neq(true),
      isDelete: global._.neq(true)
    }

    const isType = type !== null && type !== undefined && type.length > 0
    if (isType) {
      where.type = type
    }

    const isName = name !== null && name !== undefined && name.length > 0
    if (isName) {
      where.name = new global.db.RegExp({
        regexp: name,
        options: 'i'
      })
    }

    if (pageSize && pageSize !== -1) {
      collection = collection
        .skip((pageIndex - 1) * pageSize)
        .limit(pageSize)
    }

    const result = await collection
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
      const total = await collection
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
   */
  async detail (data) {
    const { id } = data
    const collection = global.db.collection('cats')
    const result = await collection
      .doc(id)
      .get()
      .then(result => this.success(result.data))
      .catch(() => this.fail({}))

    return { data: result }
  }
}

module.exports = CatsService
