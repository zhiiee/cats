const BaseService = require('./base-service.js')

/**
 * 文章相关接口
 */
class ArticlesService extends BaseService {
  /**
   * 获取文章
   * @param {*} data
   * @param {*} context
   */
  async get (data, context) {
    const { code, admin } = data
    let collection = db.collection('articles')
    let where = {
      isDelete: _.neq(true),
      code: code
    }
    let isAdmin = admin !== null && admin !== undefined && admin === true
    if (!isAdmin) {
      where.isHide = _.neq(true)
    }

    let result = await collection
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
