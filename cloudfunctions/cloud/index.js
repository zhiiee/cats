const cloud = require('wx-server-sdk')
const Users = require('./services/users-service')

// Api 对象
const api = {
  users: new Users()
}

// 初始化 cloud
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

global.cloud = cloud
global.db = cloud.database({
  throwOnNotFound: false,
  autoRecommend: true
})
global._ = db.command
global.$ = _.aggregate
global.isInit = false

// 云函数入口
exports.main = async (event, context) => {
  const { action, controller, data } = event

  // 初始化数据库
  if (!isInit) {
    try {
      await db.createCollection('users').catch(() => null)
    } catch (error) {
      console.log(error)
    } finally {
      isInit = true
    }
  }

  const result = await api[controller][action](data, cloud.getWXContext())
  return result
}
