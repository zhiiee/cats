<template>
  <page-main :status="status" :refresherTriggered="refresherTriggered"
    @scrolltolower="onScrolltolower"
    @refresherrefresh="onRefresherrefresh"
    @refresherrestore="onRefresherrestore"
    @refresherpulling="onRefresherpulling"
    emtpyMessage="猫咪出去玩了 请改天再来"
  >
    <view class="cat-content">
      <cat-item v-for="item in items" :key="item.post.id" :item="item"/>
    </view>
  </page-main>
</template>

<script lang="ts">
import { Component, Prop, Provide, Watch, Vue } from 'vue-property-decorator'
import PageMain from '@/components/page-main/page-main.vue'
import CatItem from '@/components/cat-item/cat-item.vue'
import { Cats } from '@/api'

@Component({
  name: 'CatList',
  components: { PageMain, CatItem }
})
export default class CatList extends Vue {
  @Prop({ type: String })
  type!: string

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
  @Prop({ type: Number, default: 10 })
  pageSize!: number

  // 是否加载更多
  @Provide()
  isLoadMore = true

  // 是否在加载中
  @Provide()
  isLoading = false

  @Watch('isInit')
  async onIsInitChange () {
    this.changeIsInit()
  }

  created () {
    this.changeIsInit()
  }

  changeIsInit () {
    if (this.isInit) {
      setTimeout(async () => {
        this.isLoadMore = true
        await this.loadData()
      }, 300)
    }
  }

  async loadData (isRefresh?: boolean) {
    if ((!this.isLoadMore && !isRefresh) || this.isLoading) {
      return
    }
    this.isLoading = true
    const items = await this.getCatList({
      type: this.type,
      pageIndex: isRefresh ? 1 : this.pageIndex,
      pageSize: this.pageSize
    })
    this.isLoading = false
    if (items !== -1) {
      if (items.length) {
        if (isRefresh) {
          this.items = []
        } else {
          this.pageIndex++
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
    await this.loadData(true)
    this.refresherTriggered = false
  }

  /**
   * 下拉事件结束
   */
  onRefresherrestore () {
    this.refresherTriggered = false
  }

  /**
   * 加载猫列表
   */
  getCatList (params: any) {
    return Cats.list(params)
  }
}
</script>

<style lang="scss">
.cat-content {
  padding: 0rpx 20rpx;
  box-sizing: border-box;
}
</style>
