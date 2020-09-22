/* eslint-disable @typescript-eslint/no-var-requires */
const BaseService = require('./base-service')

/**
 * 文章相关接口
 */
class ArticlesService extends BaseService {
  /**
   * 获取文章
   * @param {*} data
   */
  async get (data) {
    const { code } = data
    const collection = global.db.collection('articles')
    const where = {
      isHide: global._.neq(true),
      isDelete: global._.neq(true),
      code: code
    }

    const result = await collection
      .where(where)
      .field({
        content: true
      })
      .get()
      .then(result => this.success(result.data[0]))
      .catch(() => this.fail({}))

    return { data: result }
  }
}

module.exports = ArticlesService
