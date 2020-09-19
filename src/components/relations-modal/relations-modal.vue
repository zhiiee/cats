<template>
  <view class="cu-modal bottom-modal" :class="show ? 'show' : ''">
    <view class="cu-dialog">
      <view class="cu-bar bg-white">
        <view class="action text-blue" @click="cancel">取消</view>
        <view class="action text-green" @click="confirm">确定</view>
      </view>
      <view class="select-relations">
        <view class="cu-bar search bg-white">
          <view class="search-form round">
            <text class="cuIcon-search"/>
            <input type="text" placeholder="根据名字搜索" confirm-type="search" :value="name" @input="nameInput" @blur="searchConfirm"/>
          </view>
        </view>
        <scroll-view :scroll-y="true" style="height: 500rpx;"
          :refresher-enabled="true"
          :refresherTriggered="refresherTriggered"
          @scrolltolower="onScrolltolower"
          @refresherrefresh="onRefresherrefresh"
          @refresherpulling="onRefresherpulling"
          @refresherrestore="onRefresherrestore">
          <view v-if="status === 2" class="grid col-3 padding-sm">
            <view v-for="(cat, index) in cats" class="padding-xs" :key="index">
              <button class="cu-btn orange lg block relation" :class="relations[cat.id] !== undefined ? 'bg-orange' : 'line-orange'"
                :data-index="index" @click="selectRelations">
                <view class="relation-avatar">
                  <image :src="cat.avatar"/>
                </view>
                <view class="relation-name">{{ cat.name }}</view>
              </button>
            </view>
          </view>
          <page-status v-if="status !== 2" :status="status" :message="getMessage()"/>
        </scroll-view>
        <view style="width: 100%; height: env(safe-area-inset-bottom); padding-top: 40rpx;"></view>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import { Component, Prop, Provide, Watch, Vue } from 'vue-property-decorator'
import { Cats } from '@/api'

@Component({
  name: 'RelationsModal'
})
export default class RelationsModal extends Vue {
  @Prop({ type: Boolean, default: false })
  show!: boolean

  @Prop({ type: Array, required: true })
  value!: Array<any>

  @Provide()
  name = ''

  // 下拉刷新状态
  @Provide()
  refresherTriggered = false

  // 页码
  @Provide()
  pageIndex = 1

  // 页大小
  @Provide()
  pageSize = 15

  // 是否加载更多
  @Provide()
  isLoadMore = true

  // 是否在加载中
  @Provide()
  isLoading = false

  // 状态 0: 加载中 1: 加载失败 2: 加载成功 3: 没数据
  @Provide()
  status = 0

  // 猫咪列表
  @Provide()
  cats: Array<any> = []

  // 已选择的关系列表
  @Provide()
  relations: any = {}

  @Watch('show')
  onShowChange (val: boolean) {
    if (val && this.cats.length === 0) {
      this.isLoadMore = true
      this.loadRelations()
    }
  }

  @Watch('value')
  onValueChange (val: Array<any>) {
    this.relations = {}
    val.map(item => {
      this.relations[item.id] = item
    })
  }

  /**
   * 消息 0: 加载中 1: 加载失败 2: 加载成功 3: 没数据
   */
  getMessage () {
    switch (this.status) {
      case 0:
        return '呼叫喵星中...'
      case 1:
        return '喵星信号中断'
      case 3:
        return '猫咪出去玩了 请改天再来'
    }
  }

  /**
   * 搜索事件
   */
  searchConfirm () {
    this.cats = []
    this.onRefresherrefresh()
  }

  /**
   * 加载关系列表
   */
  async loadRelations (isRefresh?: boolean) {
    if ((!this.isLoadMore && !isRefresh) || this.isLoading) {
      return
    }
    this.isLoading = true
    const cats = await Cats.list({
      name: this.name,
      pageIndex: this.pageIndex,
      pageSize: this.pageSize
    })
    this.isLoading = false
    if (cats !== -1) {
      if (cats.length) {
        this.pageIndex++
        if (isRefresh) {
          this.cats = []
        }
        for (const cat of cats) {
          this.cats.push({
            id: cat.id,
            name: cat.name,
            avatar: cat.avatar
          })
        }
        this.isLoadMore = cats.length === this.pageSize
        this.status = 2
      } else {
        this.status = 3
      }
    } else {
      this.status = 1
    }
  }

  /**
   * 选择关系
   */
  selectRelations (event: any) {
    const { index } = event.currentTarget.dataset
    // TODO 此处未触发视图更新 临时解决办法 有空再研究下为什么 可能是深拷贝的问题
    const temp = this.cats
    this.cats = []
    this.cats = temp
    // 根据当前点击的下标获取当前点击的猫咪
    const cat = this.cats[index]
    // 需要判断是选择还是取消
    if (this.relations[cat.id] === undefined) {
      this.relations[cat.id] = cat
    } else {
      delete this.relations[cat.id]
    }
  }

  /**
   * 触底加载
   */
  async onScrolltolower () {
    await this.loadRelations()
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
    await this.loadRelations(true)
    this.refresherTriggered = false
  }

  /**
   * 下拉事件结束
   */
  onRefresherrestore () {
    this.refresherTriggered = false
  }

  /**
   * 输入名字
   */
  nameInput (event: any) {
    this.name = event.detail.value
  }

  /**
   * 取消
   */
  cancel () {
    this.$emit('cancel', this.formatRelations())
  }

  /**
   * 确认
   */
  confirm () {
    this.$emit('confirm', this.formatRelations())
  }

  /**
   * 格式化关系
   */
  formatRelations () {
    const relations = []
    for (const key in this.relations) {
      relations.push(this.relations[key])
    }
    return relations
  }
}
</script>

<style lang="scss">
.select-relations {
  padding: 0rpx;

  .search {
    width: 100%;
  }

  .relation {
    padding: 0 20rpx;
    display: block;

    .relation-avatar {
      position: absolute;
      left: 20rpx;
      top: 50%;
      width: 40rpx;
      height: 40rpx;
      transform: translateY(-50%);

      image {
        width: 100%;
        height: 100%;
        border-radius: 50%;
      }
    }

    .relation-name {
      position: absolute;
      left: 70rpx;
      top: 50%;
      width: calc(100% - 90rpx);
      text-align: left;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      transform: translateY(-50%);
    }
  }
}
</style>
