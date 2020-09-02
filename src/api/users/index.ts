import BaseService from '@/api/base'

/**
 * 用户相关接口
 */
export default class UsersService extends BaseService {
  /**
   * 登录
   */
  async login ({ code }: any) {
    const result: any = await this.callFunction('users', 'login', { code })
    if (result.code === 0) {
      return result.data
    }
    return -1
  }
}
