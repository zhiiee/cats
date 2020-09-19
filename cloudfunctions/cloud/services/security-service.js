const BaseService = require('./base-service.js')
const images = require('images')

/**
 * 安全相关接口
 */
class SecurityService extends BaseService {
  /**
   * 图片安全检查
   * @param {*} data
   * @param {*} context
   */
  async imgSecCheck (data, context) {
    const { url } = data
    // 下载文件
    const buffer = await this.downloadFile(url)
    // 检查文件
    const result = await cloud.openapi.security.imgSecCheck({
      media: {
        contentType: 'image/jpg',
        value: this.compressSize(this.changeSize(buffer))
      }
    })
    
    return this.success({ url, status: result.errCode })
  }

  /**
   * 文本安全检查
   * @param {*} data
   * @param {*} context
   */
  async msgSecCheck (data, context) {
    const { content } = data
    // 检查文件
    const result = await cloud.openapi.security.msgSecCheck({
      content: content
    })
    
    return this.success({ status: result.errCode })
  }

  /**
   * 改变图片大小
   * @param {*} buffer
   */
  changeSize (buffer) {
    let maxWidth = 1334
    let maxHeight = 750
    // 创建一个image对象
    const image = images(buffer)
    // 获取图片宽高
    const size = image.size()
    // 如果图片的尺寸没有超过规定的尺寸 则不做处理
    if (size.width <= maxWidth && size.height <= maxHeight) {
      return image.encode('jpg', { quality: 50 })
    }

    let widthScale = maxWidth / size.width
    let heightScale = maxHeight / size.height

    if (widthScale > heightScale) {
      widthScale = heightScale
      maxWidth = widthScale * size.width
    } else {
      heightScale = widthScale
      maxHeight = heightScale * size.height
    }

    return image.resize(maxWidth, maxHeight).encode('jpg', { quality: 50 })
  }

  /**
   * 压缩图片大小
   * @param {*} buffer
   */
  compressSize (buffer) {
    // 如果图片的大小没有超过规定的大小 则不做处理
    if (buffer.length < 1 * 1024 * 1024) {
      return buffer
    }

    return images(buffer).encode('jpg', { quality: this.getAccuracy(buffer.length / 1024) })
  }

  /**
   * 自动调节精度(经验数值)
   * @param {*} size
   */
  getAccuracy (size) {
    if (size < 900) {
      return 85
    } else if (size < 2047) {
      return 60
    } else if (size < 3275) {
      return 44
    } else {
      return 40
    }
  }
}

module.exports = SecurityService
