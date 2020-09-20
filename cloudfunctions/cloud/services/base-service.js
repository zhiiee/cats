const got = require('got')

class BaseService {
  /**
   * 调用成功
   */
  success (data) {
    return { code: 0, data }
  }

  /**
   * 调用失败
   */
  fail (erroCode = 0, msg = '') {
    return { erroCode, msg, code: -1 }
  }

  /**
   * 默认值
   */
  defaultValue () {
    const dateTime = new Date().getTime()
    return {
      isHide: false,
      isDelete: false,
      createTime: dateTime,
      updateTime: dateTime
    }
  }

  /**
   * 下载文件
   * @param {*} url
   */
  async downloadFile (url) {
    return (await got(url, { responseType: 'buffer' })).body
  }
}

module.exports = BaseService
