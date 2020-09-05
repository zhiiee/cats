<template>
  <view class="navigation-bar" :style="{ height: `${statusBarHeight + navigationHeight}px` }">
    <view class="navigation-status" :style="{ height: `${statusBarHeight}px` }"/>
    <view :class="'navigation-bar-inner'"
      :style="{
        top: `${statusBarHeight}px`,
        width: `${navigationWidth}px`,
        height: `${navigationHeight}px`
      }">
      <view class="navigation-bar-left" :style="{ width: `${navigationWidth}px` }">
        <view class="title">
          <image class="icon" :src="icon">
          <view class="nickname" :style="{ lineHeight: `${navigationHeight}px` }">{{ nickname }}</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component({
  name: 'NavigationBar'
})
export default class NavigationBar extends Vue {
  get statusBarHeight () {
    return this.$store.state.statusBarHeight
  }

  get navigationWidth () {
    return this.$store.state.navigationWidth
  }

  get navigationHeight () {
    return this.$store.state.navigationHeight
  }

  get icon () {
    return this.$store.state.icon
  }

  get nickname () {
    return this.$store.state.nickname
  }
}
</script>

<style lang="scss">
.navigation-bar {
  overflow: hidden;
  box-sizing: border-box;
  border-bottom: 1rpx dotted #DCDFE6;

  .navigation-status {
    position: fixed;
    left: 0px;
    top: 0px;
    width: 100%
  }

  .navigation-bar-inner {
    position: fixed;
    left: 0;
    z-index: 5001;
    display: flex;
    align-items: center;
    box-sizing: border-box;

    .navigation-bar-left {
      position: relative;
      height: 100%;
      display: flex;
      align-items: center;
      vertical-align: middle;

      .title {
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        padding-left: 25rpx;

        .icon {
          width: 50rpx;
          height: 50rpx;
          border-radius: 50%;
          display: inline-block;
        }

        .nickname {
          height: 100%;
          font-size: 38rpx;
          font-weight: bold;
          margin-left: 15rpx;
          display: inline-block;
        }
      }
    }
  }
}
</style>
