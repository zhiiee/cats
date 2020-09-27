/* eslint-disable @typescript-eslint/no-var-requires */
const BaseService = require('./base-service')
const { v4: uuidv4 } = require('uuid')
const moment = require('moment')

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
    let collection = global.db.collection('posts')

    const where = {
      openId: context.OPENID,
      isHide: global._.neq(true),
      isDelete: global._.neq(true)
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
        status: true,
        catId: true
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
   * 查询上报详细
   * @param {*} data
   */
  async detail (data) {
    const { id } = data
    const collection = global.db.collection('posts')
    const result = await collection
      .doc(id)
      .get()
      .then(result => this.success(result.data))
      .catch(() => this.fail({}))

    return { data: result }
  }

  /**
   * 上报猫咪
   * @param {*} data
   * @param {*} context
   */
  async create (data, context) {
    const { avatar, cover, photos } = data

    // 保存头像
    data.avatar = await this.saveFile(avatar, `cats/avatars/${uuidv4()}.jpg`)

    // 保存封面
    data.cover = await this.saveFile(cover, `cats/covers/${uuidv4()}.jpg`)

    // 保存照片
    data.photos = await this.savaPhotos(photos)

    const collection = global.db.collection('posts')
    const result = await collection
      .add({
        data: {
          ...data,
          status: 0,
          openId: context.OPENID,
          ...this.defaultValue()
        }
      })
      .then(result => this.success(result._id))
      .catch(() => this.fail({}))

    return { data: result }
  }

  /**
   * 更新猫咪
   * @param {*} data
   */
  async update (data) {
    const { id, avatar, cover, photos } = data
    delete data.id

    // 保存头像
    data.avatar = await this.saveFile(avatar, `cats/avatars/${uuidv4()}.jpg`)

    // 保存封面
    data.cover = await this.saveFile(cover, `cats/covers/${uuidv4()}.jpg`)

    // 保存照片
    data.photos = await this.savaPhotos(photos)

    const collection = global.db.collection('posts')
    const result = await collection
      .where({
        _id: id
      })
      .update({
        data: {
          ...data,
          status: 0,
          updateTime: new Date().getTime()
        }
      })
      .then(result => this.success(result.data))
      .catch(() => this.fail({}))

    return { data: result }
  }

  /**
   * 删除文件
   * @param {*} data
   */
  async deleteFile (data) {
    const { fileId } = data
    const result = await global.cloud.deleteFile({
      fileList: [fileId]
    })
    return this.success({ result })
  }

  /**
   * 获取待审核列表
   * @param {*} data
   */
  async checkList (data) {
    const { pageIndex, pageSize } = data
    let collection = global.db.collection('posts')
    const where = {
      status: 0,
      isHide: global._.neq(true),
      isDelete: global._.neq(true)
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
        avatar: true
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
   * 审核上报的信息
   * @param {*} data
   */
  async check (data) {
    const { id, action } = data
    const collection = global.db.collection('posts')

    // 查询上报的信息
    const post = await collection
      .doc(id)
      .get()
      .then(result => result.data)
      .catch(() => { return {} })

    let catId = post.catId

    // 处理猫咪信息
    if (action === 'confirm') {
      catId = await this.handleCat(post)
    }

    // 更新提交信息
    await collection
      .where({
        _id: id
      })
      .update({
        data: {
          catId: catId,
          status: action === 'confirm' ? 1 : -1,
          updateTime: new Date().getTime()
        }
      })

    // 推送订阅消息
    if (post.subscribe) {
      console.log('订阅消息')
      this.sendSubscribeMessage(action === 'confirm', post.openId, catId, post.name)
    }

    return { data: this.success({ id }) }
  }

  /**
   * 保存图片
   * @param {*} url
   * @param {*} cloudPath
   */
  async saveFile (url, cloudPath) {
    if (url.indexOf('cloud://') !== -1) {
      return url
    }
    // 下载文件
    const buffer = await this.downloadFile(url)
    return (await global.cloud.uploadFile({
      cloudPath: cloudPath,
      fileContent: buffer
    })).fileID
  }

  /**
   * 保存照片列表
   * @param {*} photos
   */
  async savaPhotos (photos) {
    const cloudPhotos = []
    if (photos.length > 0) {
      await this.savaPhoto(photos, 0, cloudPhotos)
    }
    return cloudPhotos
  }

  /**
   * 保存照片
   * @param {*} photos
   * @param {*} index
   * @param {*} cloudPhotos
   */
  async savaPhoto (photos, index, cloudPhotos) {
    cloudPhotos.push(await this.saveFile(photos[index], `cats/photos/${uuidv4()}.jpg`))
    if (photos.length > index + 1) {
      await this.savaPhoto(photos, index + 1, cloudPhotos)
    }
  }

  /**
   * 处理猫咪信息
   * @param {*} post
   */
  async handleCat (post) {
    const collection = global.db.collection('cats')

    // 猫咪信息
    const data = {
      openId: post.openId,
      avatar: post.avatar,
      name: post.name,
      type: post.type,
      location: post.location,
      desc: post.desc,
      cover: post.cover,
      items: post.items,
      relations: post.relations,
      photos: post.photos,
      isHide: post.isHide,
      isDelete: post.isDelete,
      createTime: post.createTime,
      updateTime: post.updateTime
    }

    // 判断是否关联catId 如果有就是更新 如果没有就是新增
    if (post.catId) {
      await collection
        .where({
          _id: post.catId
        })
        .update({ data: data })
        .then(result => this.success(result.data))
        .catch(() => this.fail({}))

      return post.catId
    } else {
      const result = await collection
        .add({ data: data })
        .then(result => this.success(result._id))
        .catch(() => this.fail({}))

      return result.data
    }
  }

  /**
   * 发送订阅消息
   * @param {*} status
   * @param {*} openId
   * @param {*} id
   * @param {*} name
   */
  async sendSubscribeMessage (status, openId, id, name) {
    // 推送订阅消息
    await global.cloud.openapi.subscribeMessage.send({
      touser: openId,
      templateId: 'rrPousHxOgv-Lf5vQMry8xa5CjspYVzfYCjXxFA-ZmI',
      page: status ? `/pages/detail/detail?id=${id}&title=${name}` : '/pages/index/index',
      data: {
        thing3: {
          value: '流浪猫信息审核'
        },
        phrase1: {
          value: status ? '通过' : '驳回'
        },
        thing5: {
          value: name
        },
        date4: {
          value: moment(new Date()).utcOffset(480).format('YYYY-MM-DD HH:mm:ss')
        },
        thing2: {
          value: status ? '感谢您提供的信息我们已经为您审核通过！' : '抱歉您提交的信息因包含敏感信息被驳回！'
        }
      },
      miniprogramState: 'formal',
      lang: 'zh_CN'
    })
  }
}

module.exports = PostsService
