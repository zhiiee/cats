<template>
  <view style="height: 100%; position: relative;">
    <scroll-view style="height: 100%;"
      :scroll-y="scrollY"
      :refresher-enabled="refresherEnabled"
      :refresher-triggered="refresherTriggered"
      @scroll="onScroll"
      @scrolltolower="onScrolltolower"
      @refresherrefresh="onRefresherrefresh"
      @refresherrestore="onRefresherrestore"
      @refresherpulling="onRefresherpulling"
    >
      <loading :show="status === 0" height="100rpx"/>
      <page-status v-if="status === 1" :status="1" message="喵星信号中断 请下拉刷新"/>
      <view v-if="status === 2">
        <slot/>
      </view>
      <page-status v-if="status === 3" :status="3" :message="emtpyMessage"/>
    </scroll-view>
  </view>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import Loading from '@/components/loading/loading.vue'
import PageStatus from '@/components/page-status/page-status.vue'

@Component({
  name: 'PageMain',
  components: { Loading, PageStatus }
})
export default class PageMain extends Vue {
  // 状态 0: 加载中 1: 加载失败 2: 加载成功 3: 没数据
  @Prop({ type: Number, default: 0 })
  status!: number

  @Prop({ type: Boolean, default: true })
  scrollY!: boolean

  @Prop({ type: Boolean, default: true })
  refresherEnabled!: boolean

  @Prop({ type: Boolean, default: false })
  refresherTriggered!: boolean

  @Prop({ type: String })
  emtpyMessage!: string

  onRefresherrefresh () {
    this.$emit('refresherrefresh')
  }

  onRefresherrestore () {
    this.$emit('refresherrestore')
  }

  onScroll (result: any) {
    this.$emit('scroll', result.detail)
  }

  onScrolltolower () {
    this.$emit('scrolltolower')
  }

  onRefresherpulling () {
    this.$emit('refresherpulling')
  }
}
</script>

<style lang="scss">
</style>
