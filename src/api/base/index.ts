export default class BaseService {
  async callFunction (controller: string, action: string, data: any) {
    const result: any = await wx.cloud.callFunction({
      name: 'cloud',
      data: { controller, action, data }
    }).then((data: any) => {
      return data.result.data
    }).catch(() => {
      return { code: -1 }
    })
    return result
  }

  parseItem (item: any) {
    item.id = item._id
    return item
  }
}
