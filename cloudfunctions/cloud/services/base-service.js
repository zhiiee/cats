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
}

module.exports = BaseService
