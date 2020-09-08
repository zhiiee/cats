<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  mpType: 'app',
  onLaunch () {
    console.log('App Launch')
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      console.log(`当前环境：${EnvConfig.env}`)
      wx.cloud.init({
        traceUser: true,
        env: EnvConfig.env
      })
    }
  },
  // @ts-ignore
  onShow (options: App.LaunchShowOption) {
    console.log('App Show')
    if (options.scene !== 1154 && options.scene !== 1155) {
      this.$store.commit('checkUpdate')
    }
  },
  onHide () {
    console.log('App Hide')
  }
})
</script>
