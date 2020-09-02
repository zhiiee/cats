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
}

module.exports = BaseService
