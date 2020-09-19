import BaseService from '@/api/base'

/**
 * 安全相关接口
 */
export default class SecurityService extends BaseService {
  /**
   * 图片安全检查
   */
  async imgSecCheck (filePath: string) {
    const result: any = await wx.cloud.callFunction({
      name: 'cloud',
      data: {
        controller: 'security',
        action: 'imgSecCheck',
        data: {
          url: wx.cloud.CDN({
            type: 'filePath',
            filePath: filePath
          })
        }
      }
    }).then((data: any) => {
      return data.result
    }).catch(() => {
      return { code: -1 }
    })

    if (result.code === 0) {
      return result.data
    }
    return -1
  }

  /**
   * 文本安全检查
   */
  async msgSecCheck (content: string) {
    const result: any = await wx.cloud.callFunction({
      name: 'cloud',
      data: {
        controller: 'security',
        action: 'msgSecCheck',
        data: { content }
      }
    }).then((data: any) => {
      return data.result
    }).catch(() => {
      return { code: -1 }
    })

    if (result.code === 0) {
      return result.data
    }
    return -1
  }
}
