const BaseService = require('./base-service')

/**
 * 用户相关接口
 */
class UsersService extends BaseService {
  /**
   * 登录
   * @param {*} data
   * @param {*} context
   */
  async login (data, context) {
    // 保留参数，暂时用不到session_key
    const { code } = data

    const openId = context.OPENID

    // 先查询用户 如果查不到就新增 查到了就更新
    let result = await db.collection('users')
      .where({ openId: openId })
      .field({
        _id: true,
        openId: true,
        isAdmin: true,
        level: true,
        isHide: true,
        isDelete: true,
        updateTime: true
      })
      .get()
      .then(result => { return result.data.length > 0 ? result.data[0] : 0 })
      .catch(() => { return 0 })

    if (result === 0) {
      // 新增
      let result = await db.collection('users')
        .add({
          data: {
            openId: openId,
            createTime: new Date().getTime(),
            updateTime: new Date().getTime()
          }
        })
        .then(() => this.success({ openId: openId }))
        .catch(() => this.fail({}))

      return { data: result }
    } else {
      // 更新
      await db.collection('users')
        .where({ openId: openId })
        .update({
          data: {
            updateTime: new Date().getTime()
          }
        })

      return { data: this.success(result) }
    }
  }
}

module.exports = UsersService
