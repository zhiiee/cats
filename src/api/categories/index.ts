import BaseService from '@/api/base'

/**
 * 分类相关接口
 */
export default class Categorieservice extends BaseService {
  /**
   * 分类列表
   */
  async list ({ type }: any) {
    const result: any = await this.callFunction('categories', 'list', { type })
    if (result.code === 0) {
      return result.data.map((category: any) => {
        return this.parseItem(category)
      })
    }
    return -1
  }
}
