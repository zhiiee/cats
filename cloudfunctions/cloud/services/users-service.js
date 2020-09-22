/* eslint-disable @typescript-eslint/no-var-requires */
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
    // const { code } = data

    const openId = context.OPENID

    // 先查询用户 如果查不到就新增 查到了就更新
    const result = await global.db.collection('users')
      .where({ openId: openId })
      .field({
        openId: true,
        level: true,
        isAdmin: true
      })
      .get()
      .then(result => { return result.data.length > 0 ? result.data[0] : 0 })
      .catch(() => { return 0 })

    if (result === 0) {
      // 新增
      const result = await global.db.collection('users')
        .add({
          data: {
            openId: openId,
            level: 0,
            isAdmin: false,
            ...this.defaultValue()
          }
        })
        .then(() => this.success({ openId: openId }))
        .catch(() => this.fail({}))

      return { data: result }
    } else {
      // 更新
      await global.db.collection('users')
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
