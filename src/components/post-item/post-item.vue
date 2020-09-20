<template>
  <view class="item" hover-class="item-hover" @click="goCatDetail">
    <view class="item-title">
      <view class="item-title-status">{{ getStatus() }}</view>
    </view>
    <view class="item-info">
      <view class="item-info-avatar">
        <image :src="item.avatar"/>
      </view>
      <view class="item-info-content">
        <view class="item-name">{{ item.name }}</view>
        <view class="item-desc">{{ item.desc }}</view>
      </view>
    </view>
    <view class="item-buttons">
      <button class="item-button cu-btn round bg-orange" :disabled="item.status === 0" @click.stop="goAddCat">编辑</button>
    </view>
  </view>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({
  name: 'PostItem'
})
export default class PostItem extends Vue {
  @Prop({ type: Object })
  item!: any

  /**
   * 获取状态 0: 审核中 1: 审核通过 9: 审核驳回
   */
  getStatus () {
    switch (this.item.status) {
      case 0:
        return '审核中'
      case 1:
        return '审核通过'
      default:
        return '审核驳回'
    }
  }

  goCatDetail () {
    if (this.item.catId && this.item.status === 1) {
      uni.navigateTo({
        url: `/pages/detail/detail?id=${this.item.catId}&title=${this.item.name}`
      })
    }
  }

  goAddCat () {
    uni.navigateTo({
      url: `/pages/add-cat/add-cat?id=${this.item.id}`
    })
  }
}
</script>

<style lang="scss">
.item {
  background: #FFFFFF;
  margin-bottom: 10rpx;
  border-radius: 8rpx;

  &.item-hover {
    background: #FAFAFA;
  }

  .item-title {
    position: relative;
    width: 100%;
    height: 88rpx;
    border-bottom: 2rpx solid #F2F3FA;

    .item-title-status {
      position: absolute;
      top: 50%;
      right: 32rpx;
      padding: 0 14rpx;
      height: 44rpx;
      background: rgba(255, 165, 63, 0.3);
      border-radius: 8rpx;
      font-size: 24rpx;
      font-weight: 400;
      color: rgba(255, 165, 63, 1);
      line-height: 44rpx;
      transform: translateY(-50%);
    }
  }

  .item-info {
    position: relative;
    padding: 20rpx 30rpx;
    width: 100%;
    height: 136rpx;

    .item-info-avatar {
      position: absolute;
      top: 50%;
      left: 30rpx;
      width: 96rpx;
      height: 96rpx;
      transform: translateY(-50%);

      image {
        width: 100%;
        height: 100%;
        border-radius: 10rpx;
      }
    }

    .item-info-content {
      position: absolute;
      top: 50%;
      right: 30rpx;
      width: calc(100% - 186rpx);
      height: 96rpx;
      transform: translateY(-50%);

      .item-name {
        font-size: 30rpx;
      }

      .item-desc {
        font-size: 26rpx;
        margin-top: 12rpx;
        color: #B2B2B2;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

  .item-buttons {
    text-align: right;
    padding: 20rpx 30rpx;

    .item-button {
      width: 142rpx;
      height: 64rpx;
      margin-left: 16rpx;
      border-radius: 64rpx;
    }
  }
}
</style>
