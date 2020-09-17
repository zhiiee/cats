import BaseService from '@/api/base'

/**
 * 提交相关接口
 */
export default class CatsService extends BaseService {
  /**
   * 根据openid查询上报列表
   */
  async list ({ pageIndex, pageSize }: any) {
    const result: any = await this.callFunction('posts', 'list', { pageIndex, pageSize })
    if (result.code === 0) {
      return result.data.map((cat: any) => {
        return this.parseItem(cat)
      })
    }
    return -1
  }
}
