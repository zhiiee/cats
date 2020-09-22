/* eslint-disable @typescript-eslint/no-var-requires */
const cloud = require('wx-server-sdk')
const Users = require('./services/users-service')
const Categories = require('./services/categories-service')
const Cats = require('./services/cats-service')
const Articles = require('./services/articles-service')
const Security = require('./services/security-service')
const Posts = require('./services/posts-service')

// Api 对象
const api = {
  users: new Users(),
  categories: new Categories(),
  cats: new Cats(),
  articles: new Articles(),
  security: new Security(),
  posts: new Posts()
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
global._ = global.db.command
global.$ = global._.aggregate
global.isInit = false

// 云函数入口
exports.main = async (event) => {
  const { action, controller, data } = event

  // 初始化数据库
  if (!global.isInit) {
    try {
      await global.db.createCollection('users').catch(() => null)
      await global.db.createCollection('categories').catch(() => null)
      await global.db.createCollection('cats').catch(() => null)
      await global.db.createCollection('articles').catch(() => null)
      await global.db.createCollection('posts').catch(() => null)
    } catch (error) {
      console.log(error)
    } finally {
      global.isInit = true
    }
  }

  const result = await api[controller][action](data, cloud.getWXContext())
  return result
}
