<template>
  <view class="container">
    <view class="page" v-if="!isError">
      <view class="page-loading">
        <loading :show="true" tips="呼叫喵星中..." type="circle"/>
      </view>
    </view>
    <page-status v-if="isError" :status="1" message="喵星信号中断 请重试" :showButton="true" @reload="loadData"/>
  </view>
</template>

<script lang="ts">
import { Component, Provide, Vue } from 'vue-property-decorator'
import Loading from '@/components/loading/loading.vue'
import PageStatus from '@/components/page-status/page-status.vue'
import { Users } from '@/api'

/**
 * 首页
 */
@Component({
  name: 'Index',
  components: { Loading, PageStatus }
})
export default class Index extends Vue {
  @Provide()
  isError = false

  created () {
    this.loadData()
  }

  /**
   * 初始化加载数据
   */
  async loadData () {
    this.isError = false
    // 云开发实际上不用登录就可以拿到openId，只是为了方便统计用户数量
    uni.login({
      success: async result => {
        const userInfo = await Users.login({ code: result.code })
        if (userInfo === -1) {
          this.isError = true
          return
        }
        this.$store.commit('setUserInfo', userInfo)

        // 放在这里初始化是为了兼容 部分基础库或设备自定义navbar会有问题
        this.$nextTick(() => {
          // 初始化系统信息
          const { statusBarHeight = 0 } = uni.getSystemInfoSync()
          const { top = 0, left = 0, height = 0 } = uni.getMenuButtonBoundingClientRect()
          this.$store.commit('setSystemInfo', {
            statusBarHeight: statusBarHeight,
            navigationWidth: left,
            navigationHeight: (top - statusBarHeight) * 2 + height
          })
          this.$nextTick(() => {
            uni.switchTab({
              url: '/pages/home/home'
            })
          })
        })
      },
      fail: () => {
        this.isError = true
      }
    })
  }
}
</script>

<style lang="scss">
.container {
  height: 100vh;

  .page {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;

    .page-loading {
      display: inline-block;
      font-size: 26rpx;
      color: #B2B2B2;
    }
  }
}
</style>
