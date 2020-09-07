<template>
  <view class="item" hover-class="item-hover" @click="goCatDetail">
    <view class="item-avatar">
      <image :src="item.avatar"/>
    </view>
    <view class="item-content">
      <view class="item-name">{{ item.name }}</view>
      <view class="item-desc">{{ item.desc }}</view>
    </view>
  </view>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({
  name: 'CatItem'
})
export default class CatItem extends Vue {
  @Prop({ type: Object })
  item!: any

  goCatDetail () {
    uni.navigateTo({
      url: `/pages/detail/detail?id=${this.item.id}&title=${this.item.name}`
    })
  }
}
</script>

<style lang="scss">
.item {
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
  background: #FFFFFF;
  margin-bottom: 10rpx;
  border-radius: 8rpx;

  &.item-hover {
    background: #FAFAFA;
  }

  .item-avatar {
    width: 96rpx;
    height: 96rpx;

    image {
      width: 100%;
      height: 100%;
      border-radius: 10rpx;
    }
  }

  .item-content {
    text-align: left;
    width: 520rpx;
    margin-left: 30rpx;

    .item-name {
      font-size: 30rpx;
    }

    .item-desc {
      font-size: 26rpx;
      margin-top: 12rpx;
      color: #B2B2B2;
      max-width: 560rpx;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
</style>
