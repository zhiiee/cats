import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    statusBarHeight: 0,
    navigationWidth: 0,
    navigationHeight: 0,
    userInfo: undefined
  },
  mutations: {
    /**
     * 检查更新
     */
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
    },
    /**
     * 设置系统信息
     */
    setSystemInfo (state, info) {
      state.statusBarHeight = info.statusBarHeight
      state.navigationWidth = info.navigationWidth
      state.navigationHeight = info.navigationHeight
    },
    /**
     * 设置用户信息
     */
    setUserInfo (state, info) {
      state.userInfo = info
    }
  },
  actions: {
  },
  modules: {
  }
})
