const BaseService = require('./base-service.js')
const { v4: uuidv4 } = require('uuid')

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
        avatar: true,
        status: true,
        catId: true
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

  /**
   * 查询上报详细
   * @param {*} data
   * @param {*} context
   */
  async detail (data, context) {
    const { id } = data
    let collection = db.collection('posts')
    let result = await collection
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
    let collection = db.collection('posts')

    // 保存头像
    data.avatar = await this.saveFile(avatar, `cats/avatars/${uuidv4()}.jpg`)

    // 保存封面
    data.cover = await this.saveFile(cover, `cats/covers/${uuidv4()}.jpg`)

    // 保存照片
    data.photos = await this.savaPhotos(photos)

    let result = await collection
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
   * @param {*} context
   */
  async update (data, context) {
    const { id } = data
    delete data.id
    let collection = db.collection('posts')
    let result = await collection
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
   * @param {*} context
   */
  async deleteFile (data, context) {
    const { fileId } = data
    const result = await cloud.deleteFile({
      fileList: [fileId],
    })
    return this.success({ result })
  }

  /**
   * 获取待审核列表
   * @param {*} data
   * @param {*} context
   */
  async checkList (data, context) {
    const { pageIndex, pageSize } = data
    let collection = db.collection('posts')
    let where = {
      status: 0,
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

  /**
   * 审核上报的信息
   * @param {*} data
   * @param {*} context
   */
  async check (data, context) {
    const { id, action } = data
    let collection = db.collection('posts')

    // 查询上报的信息
    let post = await collection
      .doc(id)
      .get()
      .then(result => result.data)
      .catch(() => {})

    let updateData = {
      status: -1,
      updateTime: new Date().getTime()
    }

    let catId = post._id

    if (action === 'confirm') {
      // 复制到cats表
      collection = db.collection('cats')
      let cat = await collection
        .add({
          data: {
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
        })
        .then(result => this.success(result._id))
        .catch(() => this.fail({}))

        catId = cat.data
        updateData.catId = catId
        updateData.status = 1
    }

    // 更新提交信息
    collection = db.collection('posts')
    await collection
    .where({
      _id: id
    })
    .update({
      data: {
        ...updateData
      }
    })

    if (post.subscribe) {
      // 推送订阅消息
      await cloud.openapi.subscribeMessage.send({
        touser: post.openId,
        page: action === 'confirm' ? `/pages/detail/detail?id=${catId}&title=${post.name}` : `/pages/add-cat/add-cat?id=${catId}`,
        lang: 'zh_CN',
        data: {
          thing3: {
            value: '流浪猫信息审核'
          },
          phrase1: {
            value: action === 'confirm' ? '通过' : '驳回'
          },
          thing5: {
            value: post.name
          },
          date4: {
            value: this.getDate('yyyy-MM-dd HH:mm:ss')
          },
          thing2: {
            value: action === 'confirm' ? '感谢您提供的信息我们已经为您审核通过！' : '抱歉您提交的信息因包含敏感信息被驳回！'
          }
        },
        templateId: 'rrPousHxOgv-Lf5vQMry8xa5CjspYVzfYCjXxFA-ZmI',
        miniprogramState: 'formal'
      })
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
    return (await cloud.uploadFile({
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
}

module.exports = PostsService
