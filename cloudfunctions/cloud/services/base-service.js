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

  /**
   * 获取日期
   * @param {*} format
   */
  getDate (format) {
    let date = new Date()
    let o = {
      'M+': date.getMonth() + 1, // 月份
      'd+': date.getDate(), // 日
      'h+': date.getHours() % 12 === 0 ? 12 : date.getHours() % 12, // 小时
      'H+': date.getHours(), // 小时
      'm+': date.getMinutes(), // 分
      's+': date.getSeconds(), // 秒
      'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
      'S': date.getMilliseconds() // 毫秒
    }
    if (/(y+)/.test(format)) {
      format = format.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
    }
    for (const k in o) {
      if(new RegExp('('+ k +')').test(format)) {
        format = format.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
      }
    }
    return format
  }
}

module.exports = BaseService
