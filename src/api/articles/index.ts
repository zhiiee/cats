import BaseService from '@/api/base'

/**
 * 文章相关接口
 */
export default class ArticlesService extends BaseService {
  /**
   * 获取文章
   */
  async get ({ code }: any) {
    const result: any = await this.callFunction('articles', 'get', { code })
    if (result.code === 0) {
      return result.data
    }
    return -1
  }
}
