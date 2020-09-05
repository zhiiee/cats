<template>
  <view class="page-status">
    <view class="page-info">
      <image :src="status === 1 ? '/static/images/error.svg' : '/static/images/empty.svg'"/>
      <view>{{ message }}</view>
      <button class="status-button" hover-class="status-button-hover" v-if="showButton" @click="onReload">重新呼叫</button>
    </view>
  </view>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({
  name: 'PageStatus'
})
export default class PageStatus extends Vue {
  // 状态 1: 加载失败 3: 没数据
  @Prop({ type: Number, default: 3 })
  status!: number

  @Prop({ type: String })
  message!: string

  @Prop({ type: Boolean, default: false })
  showButton!: boolean

  // 重试
  onReload () {
    this.$emit('reload')
  }
}
</script>

<style lang="scss">
.page-status {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  text-align: center;

  image {
    width: 200rpx;
    height: 200rpx;
  }

  .page-info {
    display: inline-block;
    font-size: 26rpx;
    color: #B2B2B2;

    .status-button {
      margin-top: 20rpx;
      height: 68rpx;
      line-height: 68rpx;
      border-radius: 68rpx;
      padding: 0rpx 64rpx;
      display: inline-block;
      background: #FF7F50;
      color: #13100E;
      border: none;
      box-shadow: 4rpx 8rpx 12rpx rgba(255, 127, 80, 0.3);
      font-size: 34rpx;

      &::after {
        border: none;
      }

      &.status-button-hover {
        background: rgba(255, 127, 80, 0.5);
      }
    }
  }
}
</style>
