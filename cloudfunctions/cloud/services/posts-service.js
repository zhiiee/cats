const BaseService = require('./base-service.js')

/**
 * 提交相关接口
 */
class PostsService extends BaseService {
  /**
   * 根据openid查询上报列表
   * @param {*} data
   * @param {*} context
   */
  async list (data, context) {
    const { pageIndex, pageSize } = data
    let collection = db.collection('posts')
    let where = {
      openId: context.OPENID,
      isHide: _.neq(true),
      isDelete: _.neq(true)
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
        avatar: true
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
}

module.exports = PostsService
