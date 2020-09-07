import BaseService from '@/api/base'

/**
 * 猫咪相关接口
 */
export default class CatsService extends BaseService {
  /**
   * 猫咪列表
   */
  async list ({ type, pageIndex, pageSize }: any) {
    const result: any = await this.callFunction('cats', 'list', { type, pageIndex, pageSize })
    if (result.code === 0) {
      return result.data.map((cat: any) => {
        return this.parseItem(cat)
      })
    }
    return -1
  }

  /**
   * 获取猫咪详情
   */
  async detail (id: string) {
    const result: any = await this.callFunction('cats', 'detail', { id })
    if (result.code === 0) {
      return this.parseItem(result.data)
    }
    return -1
  }
}
