<template>
  <view class="loading-view" :style="{ display: display, height: height }" :animation="animationData">
    <view v-if="type === 'dot'" class="dot-loading"/>
    <view v-else-if="type === 'circle'" class="loadmore">
      <view class="loading"/>
      <view class="loadmore-tips">
        {{ tips }}
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import { Component, Prop, Provide, Watch, Vue } from 'vue-property-decorator'

@Component({
  name: 'Loading'
})
export default class Loading extends Vue {
  @Prop({ type: Boolean, default: true })
  show!: boolean

  @Prop({ type: Boolean, default: false })
  animated!: boolean

  @Prop({ type: Number, default: 350 })
  duration!: number

  @Prop({ type: String, default: 'dot' })
  type!: string

  @Prop({ type: String, default: '' })
  tips!: string

  @Prop({ type: String, default: '100%' })
  height!: string

  @Provide()
  animationData: any = {}

  @Provide()
  animationInstance: any = uni.createAnimation({})

  @Provide()
  display = 'none'

  @Watch('show')
  onShowChange (show: boolean) {
    this.computedStyle(show, this.animated)
  }

  @Watch('animated')
  onAnimatedChange (animated: boolean) {
    this.computedStyle(this.show, animated)
  }

  created () {
    this.animationInstance = uni.createAnimation({
      duration: this.duration,
      timingFunction: 'ease'
    })
    this.computedStyle(this.show, this.animated)
  }

  /**
   * 处理样式
   */
  computedStyle (show: boolean, animated: boolean) {
    if (!show) {
      if (!animated) {
        this.display = 'none'
      } else {
        this.startAnimation()
      }
    } else {
      this.display = ''
    }
  }

  /**
   * 开始动画
   */
  startAnimation () {
    setTimeout(() => {
      const animation: any = this.animationInstance
      animation.height(0).step()
      this.animationData = animation.export()
    }, 0)
  }
}
</script>

<style lang="scss">
.loading-view {
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;

  .dot-loading, .dot-loading:before, .dot-loading:after {
    display: inline-block;
    vertical-align: middle;
    font-size: 0;
    width: 14rpx;
    height: 14rpx;
    border-radius: 50%;
  }

  .dot-loading {
    position: relative;
    background-color: rgb(110, 110, 110);
    animation: dot2 0.8s step-start infinite;

    &::before {
      content: '';
      position: absolute;
      left: -26rpx;
      background-color:  rgb(145, 145, 145);
      animation: dot1 0.8s step-start infinite;
    }

    &::after {
      content: '';
      position: absolute;
      right: -26rpx;
      background-color: rgb(75, 75, 75);
      animation: dot3 0.8s step-start infinite;
    }
  }

  .loadmore {
    margin: 0 auto;
    line-height: 24rpx;
    font-size: 24rpx;
    color: #B2B2B2;
    text-align: center;

    .loading {
      margin: 0 10rpx;
      width: 40rpx;
      height: 40rpx;
      font-size: 34rpx;
      text-align: center;
      display: inline-block;
      vertical-align: middle;
      animation: loading 1s steps(12, end) infinite;
      color: rgba(255, 255, 255, 0.9);
      background: transparent
        url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHBhdGggZmlsbD0ibm9uZSIgZD0iTTAgMGgxMDB2MTAwSDB6Ii8+PHJlY3Qgd2lkdGg9IjciIGhlaWdodD0iMjAiIHg9IjQ2LjUiIHk9IjQwIiBmaWxsPSIjRTlFOUU5IiByeD0iNSIgcnk9IjUiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAgLTMwKSIvPjxyZWN0IHdpZHRoPSI3IiBoZWlnaHQ9IjIwIiB4PSI0Ni41IiB5PSI0MCIgZmlsbD0iIzk4OTY5NyIgcng9IjUiIHJ5PSI1IiB0cmFuc2Zvcm09InJvdGF0ZSgzMCAxMDUuOTggNjUpIi8+PHJlY3Qgd2lkdGg9IjciIGhlaWdodD0iMjAiIHg9IjQ2LjUiIHk9IjQwIiBmaWxsPSIjOUI5OTlBIiByeD0iNSIgcnk9IjUiIHRyYW5zZm9ybT0icm90YXRlKDYwIDc1Ljk4IDY1KSIvPjxyZWN0IHdpZHRoPSI3IiBoZWlnaHQ9IjIwIiB4PSI0Ni41IiB5PSI0MCIgZmlsbD0iI0EzQTFBMiIgcng9IjUiIHJ5PSI1IiB0cmFuc2Zvcm09InJvdGF0ZSg5MCA2NSA2NSkiLz48cmVjdCB3aWR0aD0iNyIgaGVpZ2h0PSIyMCIgeD0iNDYuNSIgeT0iNDAiIGZpbGw9IiNBQkE5QUEiIHJ4PSI1IiByeT0iNSIgdHJhbnNmb3JtPSJyb3RhdGUoMTIwIDU4LjY2IDY1KSIvPjxyZWN0IHdpZHRoPSI3IiBoZWlnaHQ9IjIwIiB4PSI0Ni41IiB5PSI0MCIgZmlsbD0iI0IyQjJCMiIgcng9IjUiIHJ5PSI1IiB0cmFuc2Zvcm09InJvdGF0ZSgxNTAgNTQuMDIgNjUpIi8+PHJlY3Qgd2lkdGg9IjciIGhlaWdodD0iMjAiIHg9IjQ2LjUiIHk9IjQwIiBmaWxsPSIjQkFCOEI5IiByeD0iNSIgcnk9IjUiIHRyYW5zZm9ybT0icm90YXRlKDE4MCA1MCA2NSkiLz48cmVjdCB3aWR0aD0iNyIgaGVpZ2h0PSIyMCIgeD0iNDYuNSIgeT0iNDAiIGZpbGw9IiNDMkMwQzEiIHJ4PSI1IiByeT0iNSIgdHJhbnNmb3JtPSJyb3RhdGUoLTE1MCA0NS45OCA2NSkiLz48cmVjdCB3aWR0aD0iNyIgaGVpZ2h0PSIyMCIgeD0iNDYuNSIgeT0iNDAiIGZpbGw9IiNDQkNCQ0IiIHJ4PSI1IiByeT0iNSIgdHJhbnNmb3JtPSJyb3RhdGUoLTEyMCA0MS4zNCA2NSkiLz48cmVjdCB3aWR0aD0iNyIgaGVpZ2h0PSIyMCIgeD0iNDYuNSIgeT0iNDAiIGZpbGw9IiNEMkQyRDIiIHJ4PSI1IiByeT0iNSIgdHJhbnNmb3JtPSJyb3RhdGUoLTkwIDM1IDY1KSIvPjxyZWN0IHdpZHRoPSI3IiBoZWlnaHQ9IjIwIiB4PSI0Ni41IiB5PSI0MCIgZmlsbD0iI0RBREFEQSIgcng9IjUiIHJ5PSI1IiB0cmFuc2Zvcm09InJvdGF0ZSgtNjAgMjQuMDIgNjUpIi8+PHJlY3Qgd2lkdGg9IjciIGhlaWdodD0iMjAiIHg9IjQ2LjUiIHk9IjQwIiBmaWxsPSIjRTJFMkUyIiByeD0iNSIgcnk9IjUiIHRyYW5zZm9ybT0icm90YXRlKC0zMCAtNS45OCA2NSkiLz48L3N2Zz4=)
        no-repeat;
      background-size: 100%;
    }

    .loadmore-tips {
      display: inline-block;
      vertical-align: middle;
    }
  }
}

@keyframes loading {
  0% {
    transform: rotate3d(0, 0, 1, 0deg);
  }
  100% {
    transform: rotate3d(0, 0, 1, 360deg);
  }
}

@keyframes dot1 {
  0%,
  100% {
    background-color: rgb(145, 145, 145);
  }
  30% {
    background-color: rgb(75, 75, 75);
  }
  60% {
    background-color: rgb(110, 110, 110);
  }
}

@keyframes dot2 {
  0%,
  100% {
    background-color: rgb(110, 110, 110);
  }
  30% {
    background-color: rgb(145, 145, 145);
  }
  60% {
    background-color: rgb(75, 75, 75);
  }
}

@keyframes dot3 {
  0%,
  100% {
    background-color: rgb(75, 75, 75);
  }
  30% {
    background-color: rgb(110, 110, 110);
  }
  60% {
    background-color: rgb(145, 145, 145);
  }
}
</style>
