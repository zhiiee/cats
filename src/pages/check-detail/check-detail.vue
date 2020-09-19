<template>
  <view class="container">
    <scroll-view :scroll-y="true" style="height: calc(100vh - 140rpx - env(safe-area-inset-bottom));">
      <loading :show="!isInit" height="100rpx"/>
      <view class="cat-detail" v-if="detail">
        <!-- 封面 -->
        <view class="item-cover">
          <image mode="aspectFill" :src="detail.cover"/>
        </view>
        <!-- 描述 -->
        <view class="desc">{{ detail.desc }}</view>
        <!-- 基本信息 -->
        <view class="items">
          <view v-for="(item, index) of detail.items" :key="index" style="width: 50%;">
            <view class="item-category">{{ item.category }}</view>
            <view class="item-content">{{ item.content }}</view>
          </view>
        </view>
        <!-- 关系 -->
        <view class="items relation-items" v-if="detail.relations">
          <block v-for="(item, index) of detail.relations" :key="index">
            <view class="relation">
              <image class="relation-avatar" :src="item.avatar"/>
              <view class="relation-name">{{ item.name }}</view>
            </view>
          </block>
        </view>
        <!-- 照片 -->
        <block v-for="(item, index) of detail.photos" :key="index">
          <view class="photos" @click="showPhoto(index)">
            <image class="cat-image" mode="widthFix" :lazy-load="true" :src="item"/>
          </view>
        </block>
        <view style="width: 100%; height: env(safe-area-inset-bottom); padding-top: 40rpx;"></view>
      </view>
      <page-status v-if="isError" :status="1" message="喵星信号中断 请重试" :showButton="true" @reload="loadDetail"/>
    </scroll-view>
    <view class="buttons padding">
      <button class="cu-btn bg-red lg" @click="checkReject">驳回</button>
      <button class="cu-btn bg-orange lg" @click="checkConfirm">通过</button>
    </view>
  </view>
</template>

<script lang="ts">
import { Component, Provide, Vue } from 'vue-property-decorator'
import Loading from '@/components/loading/loading.vue'
import PageStatus from '@/components/page-status/page-status.vue'
import { Posts } from '@/api'

@Component({
  name: 'CheckDetail',
  components: { Loading, PageStatus }
})
export default class CheckDetail extends Vue {
  @Provide()
  detail: any = null

  @Provide()
  isInit = false

  @Provide()
  isError = false

  async onLoad (options: any) {
    const { id, title } = options
    uni.setNavigationBarTitle({
      title: decodeURIComponent(title)
    })
    this.isInit = false
    this.$nextTick(() => {
      this.loadDetail(id)
    })
  }

  async loadDetail (id: string) {
    const detail = await Posts.detail(id)
    this.isInit = true
    if (detail !== -1) {
      this.detail = detail
    } else {
      this.isError = true
    }
  }

  showPhoto (index: string) {
    uni.previewImage({
      current: index,
      urls: this.detail.photos
    })
  }

  /**
   * 审核驳回
   */
  checkReject () {
    uni.showModal({
      title: '提示',
      content: '确认驳回该信息吗？',
      success: async result => {
        if (result.confirm) {
          const data = await Posts.check({
            id: this.detail.id,
            action: 'reject'
          })
          if (data !== -1) {
            uni.navigateBack({
              delta: 1
            })
          } else {
            uni.showToast({
              icon: 'none',
              title: '发生错误 请重试'
            })
          }
        }
      }
    })
  }

  /**
   * 审核通过
   */
  checkConfirm () {
    uni.showModal({
      title: '提示',
      content: '确认审核通过吗？',
      success: async result => {
        if (result.confirm) {
          const data = await Posts.check({
            id: this.detail.id,
            action: 'confirm'
          })
          if (data !== -1) {
            uni.navigateBack({
              delta: 1
            })
          } else {
            uni.showToast({
              icon: 'none',
              title: '发生错误 请重试'
            })
          }
        }
      }
    })
  }
}
</script>

<style lang="scss">
.cat-detail {
  .item-cover {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 30rpx 0;

    image {
      width: calc(100vw - 60rpx);
      height: calc(80vw - 60rpx);
      border-radius: 10rpx;
    }
  }

  .desc {
    font-size: 28rpx;
    color:#888888;
    padding: 0rpx 40rpx;
    font-weight: normal;
  }

  .items {
    font-size: 26rpx;
    padding: 40rpx 40rpx 0rpx;
    display: flex;
    color:#888888;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: flex-start;

    .item-category {
      flex-shrink: 0;
      box-sizing: border-box;
      width: 100%;
    }

    .item-content {
      font-size: 28rpx;
      color:#353535;
      font-weight: normal;
      margin-right: 40rpx;
      margin-bottom: 30rpx;
    }
  }

  .relation-items {
    padding: 0rpx 20rpx 20rpx;

    .relation {
      width: 20%;
      flex-shrink: 0;
      box-sizing: border-box;
      padding: 10rpx;
      text-align: center;

      .relation-avatar {
        width: 100rpx;
        height: 100rpx;
        border-radius: 50%;
      }

      .relation-name {
        text-align: center;
        color:#353535;
      }
    }
  }

  .photos {
    display: flex;
    align-items: center;
    justify-content: center;

    image {
      width: calc(100vw - 60rpx);
      margin-top: 20rpx;
      border-radius: 10rpx;
    }
  }
}

.buttons {
  z-index: 0;

  .cu-btn {
    width: 45%;

    &:last-child {
      margin-left: 10%;
    }
  }
}
</style>
