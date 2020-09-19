import BaseService from '@/api/base'

/**
 * 提交相关接口
 */
export default class PostsService extends BaseService {
  /**
   * 根据openid查询上报列表
   */
  async list ({ pageIndex, pageSize }: any) {
    const result: any = await this.callFunction('posts', 'list', { pageIndex, pageSize })
    if (result.code === 0) {
      return result.data.map((post: any) => {
        return this.parseItem(post)
      })
    }
    return -1
  }

  /**
   * 上报猫咪
   */
  async create (data: any) {
    const result: any = await this.callFunction('posts', 'create', data)
    if (result.code === 0) {
      return result.data
    }
    return -1
  }

  /**
   * 获取上报详情
   */
  async detail (id: string) {
    const result: any = await this.callFunction('posts', 'detail', { id })
    if (result.code === 0) {
      return this.parseItem(result.data)
    }
    return -1
  }

  /**
   * 更新猫咪
   * @param data
   */
  async update (data: any) {
    const result: any = await this.callFunction('posts', 'update', data)
    if (result.code === 0) {
      return result.data
    }
    return -1
  }

  /**
   * 删除文件
   * @param fileId
   */
  async deleteFile (fileId: string) {
    const result: any = await this.callFunction('posts', 'deleteFile', { fileId })
    if (result.code === 0) {
      return result.data
    }
    return -1
  }
}
