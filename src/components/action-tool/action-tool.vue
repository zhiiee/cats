<template>
  <view>
    <view class="action-mask" v-show="showMore" @click="changeShowMore"/>
    <view class="action-tool">
      <view class="tool-button button-circle" :style="{ marginBottom: `${showMore ? 20 : -80}rpx;`, opacity: `${showMore ? 1 : 0};` }"
        v-for="(tool, index) in tools" :key="index"
        @click="openPage(tool.page)">
        <view :class="'iconfont icon-' + tool.icon"/>
        <view class="button-title" v-show="showMore">
          {{ tool.title }}
        </view>
      </view>
      <view class="tool-button" :class="showMore ? 'button-show-more' : ''" @click="changeShowMore">
        <view class="iconfont icon-tool-plus" :style="{ transform: `rotate(${showMore ? 135 : 0}deg);` }"/>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import { Component, Provide, Vue } from 'vue-property-decorator'

@Component({
  name: 'ActionTool'
})
export default class ActionTool extends Vue {
  @Provide()
  showMore = false

  // 根据权限展示可用工具
  get tools () {
    const tools: Array<any> = []
    const level = this.$store.state.userInfo.level
    this.$store.state.tools.map((tool: any) => {
      if (tool.levels.some((toolLevel: any) => toolLevel === level)) {
        tools.push(tool)
      }
    })
    return tools
  }

  changeShowMore () {
    this.showMore = !this.showMore
  }

  openPage (url: string) {
    uni.navigateTo({
      url,
      success: () => {
        this.$nextTick(() => {
          this.changeShowMore()
        })
      }
    })
  }
}
</script>

<style lang="scss">
.action-mask {
  position: fixed;
  top: 0px;
  left: 0px;
  width: 100%;
  height: calc(100vh);
  z-index: 10000;
  background: rgba(255, 255, 255, 0.95);
}

.action-tool {
  position: fixed;
  right: 60rpx;
  bottom: 80rpx;
  z-index: 10001;
  transition: all 0.3s;

  .tool-button {
    position: relative;
    width: 80rpx;
    height: 80rpx;
    line-height: 80rpx;
    text-align: center;
    background: #FF7F50;
    border-radius: 50%;
    margin-bottom: 20rpx;
    box-shadow: 2rpx 3rpx 6rpx rgba(0, 0, 0, 0.1);

    &.button-show-more {
      background: #F7F2EE;
    }

    &.button-circle {
      width: 80rpx;
      height: 80rpx;
      line-height: 80rpx;
      transition: all 0.3s;

      .button-title {
        position: absolute;
        top: 5rpx;
        left: -190rpx;
        width: 160rpx;
        border-radius: 8rpx;
        line-height: 70rpx;
        font-size: 28rpx;
        font-weight: bold;
        transition: all 0.3s;
        background: #F1F1F1;
        box-shadow: 2rpx 3rpx 6rpx rgba(0, 0, 0, 0.1);
      }
    }

    .iconfont {
      font-size: 40rpx;
      transition: all 0.3s;
    }
  }
}
</style>
