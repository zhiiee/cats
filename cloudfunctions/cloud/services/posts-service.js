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
