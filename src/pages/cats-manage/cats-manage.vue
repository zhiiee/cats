<template>
  <view class="container">
    <view class="options">
      <view class="add-button cu-btn round bg-orange" @click="addCat">上报猫咪</view>
    </view>
    <view class="context">
      <page-main :status="status" :refresherTriggered="refresherTriggered"
        @scrolltolower="onScrolltolower"
        @refresherrefresh="onRefresherrefresh"
        @refresherrestore="onRefresherrestore"
        @refresherpulling="onRefresherpulling"
        emtpyMessage="您还没有上报猫咪信息"
      >
        <view class="cat-content">
          <post-item v-for="item in items" :key="item.post.id" :item="item"/>
        </view>
      </page-main>
    </view>
  </view>
</template>

<script lang="ts">
import { Component, Prop, Provide, Vue } from 'vue-property-decorator'
import PostItem from '@/components/post-item/post-item.vue'
import { Posts } from '@/api'

@Component({
  name: 'CatsManage',
  components: { PostItem }
})
export default class CatsManage extends Vue {
  // 是否初始化
  @Prop({ type: Boolean, default: false })
  isInit!: boolean

  // 开启下来刷新
  @Prop({ type: Boolean, default: true })
  refresherEnabled!: boolean

  // 下拉刷新状态
  @Provide()
  refresherTriggered = false

  // 状态 0: 加载中 1: 加载失败 2: 加载成功 3: 没数据
  @Provide()
  status = 0

  // 内容项
  @Provide()
  items: Array<any> = []

  // 页码
  @Provide()
  pageIndex = 1

  // 页大小
  @Provide()
  pageSize = 10

  // 是否加载更多
  @Provide()
  isLoadMore = true

  // 是否在加载中
  @Provide()
  isLoading = false

  async created () {
    this.isLoadMore = true
    await this.loadData()
  }

  async loadData (isRefresh?: boolean) {
    if ((!this.isLoadMore && !isRefresh) || this.isLoading) {
      return
    }
    this.isLoading = true
    const items = await Posts.list({
      pageIndex: this.pageIndex,
      pageSize: this.pageSize
    })
    this.isLoading = false
    if (items !== -1) {
      if (items.length) {
        this.pageIndex++
        if (isRefresh) {
          this.items = []
        }
        for (const item of items) {
          this.items.push(item)
        }
        this.isLoadMore = items.length === this.pageSize
        this.status = 2
      } else {
        this.status = 3
      }
    } else {
      this.status = 1
    }
  }

  /**
   * 触底加载
   */
  async onScrolltolower () {
    await this.loadData()
  }

  /**
   * 下拉事件开始
   */
  onRefresherpulling () {
    this.refresherTriggered = true
  }

  /**
   * 触发下拉事件
   */
  async onRefresherrefresh () {
    this.pageIndex = 1
    await this.loadData(true)
    this.refresherTriggered = false
  }

  /**
   * 下拉事件结束
   */
  onRefresherrestore () {
    this.refresherTriggered = false
  }

  addCat () {
    uni.navigateTo({
      url: '/pages/add-cat/add-cat'
    })
  }
}
</script>

<style lang="scss">
.container {
  height: 100vh;

  .options {
    position: relative;
    width: 100%;
    height: 96rpx;

    .add-button {
      position: absolute;
      right: 20rpx;
      top: 16rpx;
      width: 192rpx;
      height: 64rpx;
      border-radius: 32rpx;
    }
  }

  .context {
    height: calc(100% - 96rpx - env(safe-area-inset-bottom));
  }
}
</style>
