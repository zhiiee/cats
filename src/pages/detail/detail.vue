<template>
  <view class="container">
    <scroll-view :scroll-y="true" style="height: 100vh;">
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
            <view class="relation" @click="goRelation(item.id, item.name)">
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
  </view>
</template>

<script lang="ts">
import { Component, Provide, Mixins } from 'vue-property-decorator'
import Share from '@/mixins/share'
import Loading from '@/components/loading/loading.vue'
import PageStatus from '@/components/page-status/page-status.vue'
import { Cats } from '@/api'

@Component({
  name: 'Detail',
  components: { Loading, PageStatus }
})
export default class Detail extends Mixins(Share) {
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
    const detail = await Cats.detail(id)
    this.isInit = true
    if (detail !== -1) {
      this.detail = detail
    } else {
      this.isError = true
    }
  }

  /**
   * 查看关系
   */
  goRelation (id: string, title: string) {
    const url = `/pages/detail/detail?id=${id}&title=${title}`
    uni.navigateTo({
      url,
      fail: () => {
        // 已达最大跳转数
        uni.redirectTo({
          url
        })
      }
    })
  }

  showPhoto (index: string) {
    uni.previewImage({
      current: index,
      urls: this.detail.photos
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
</style>
