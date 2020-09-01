import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
  },
  mutations: {
    checkUpdate () {
      console.log('checkUpdate')
      if (uni.canIUse('getUpdateManager')) {
        const updateManager = uni.getUpdateManager()
        updateManager.onCheckForUpdate(result => {
          if (result.hasUpdate) {
            updateManager.onUpdateReady(() => {
              uni.showModal({
                title: '更新提示',
                content: '发现新版本，是否更新？',
                success: result => {
                  if (result.confirm) {
                    updateManager.applyUpdate()
                  }
                }
              })
            })
            updateManager.onUpdateFailed(() => {
              uni.showModal({
                title: '发现新版本',
                content: '自动更新失败，请您删除当前小程序，重新搜索打开！'
              })
            })
          }
        })
      } else {
        uni.showModal({
          title: '提示',
          content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试！'
        })
      }
    }
  },
  actions: {
  },
  modules: {
  }
})
