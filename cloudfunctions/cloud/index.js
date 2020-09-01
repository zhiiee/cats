const cloud = require('wx-server-sdk')

// Api 对象
const api = {}

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

// 云函数入口
exports.main = async (event, context) => {
  const { action, controller, data } = event
  const result = await api[controller][action](data, cloud.getWXContext())
  return result
}
