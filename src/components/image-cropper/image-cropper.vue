<template>
  <view class="image-cropper" v-show="show">
    <!-- 图片 -->
    <view class="cropper-box">
      <view class="cropper-box-image"
        @touchstart.stop.prevent="imageTouchStart"
        @touchmove.stop.prevent="imageMove"
        @touchend.stop.prevent="imageMoveEnd"
        :style="{
          width: `${imageWidth}px`,
          height: `${imageHeight}px`,
          transform: `scale(${scale}, ${scale}) translate3d(${x / scale}px, ${y / scale}px, 0) rotateZ(${rotate * 90}deg)`
        }">
          <image class="cropper-image" :src="path" mode="scaleToFill"/>
      </view>
    </view>

    <!-- 蒙版 -->
    <view class="cropper-drag-box cropper-modal pointer-events"/>

    <!-- 裁剪 -->
    <view class="cropper-crop-box pointer-events"
      :style="{
        width: `${currentCropperWidth}px`,
        height: `${currentCropperHeight}px`,
        transform: `translate3d(${cropperOffsetX}px, ${cropperOffsetY}px, 0)`
      }">
      <view class="cropper-view-box">
        <image :src="path" mode="scaleToFill"
          :style="{
            width: `${imageWidth}px`,
            height: `${imageHeight}px`,
            transform: `scale(${scale}, ${scale}) translate3d(${(x - cropperOffsetX) / scale}px, ${(y - cropperOffsetY) / scale}px, 0) rotateZ(${rotate * 90}deg)`
          }"/>
      </view>

      <!-- 边框 -->
      <view class="cropper-line line-w"/>
      <view class="cropper-line line-a"/>
      <view class="cropper-line line-s"/>
      <view class="cropper-line line-d"/>
    </view>

    <!-- 设置 -->
    <view class="cropper-setting-group">
      <view class="cropper-setting-button reset-button" @click="init"/>
      <view class="cropper-setting-button rotate-button" @click="rotateCropper"/>
    </view>

    <!-- 按钮 -->
    <view class="cropper-button-group">
      <view class="cropper-button-item" @click="cancel">取消</view>
      <view class="cropper-button-item" @click="confirm">确定</view>
    </view>

    <canvas canvas-id="cropper-canvas" class="cropper-canvas"
      :style="{
        width: `${currentCropperWidth}px`,
        height: `${currentCropperHeight}px`
      }"/>
  </view>
</template>

<script lang="ts">
import { Component, Prop, Provide, Watch, Vue } from 'vue-property-decorator'
const { windowWidth = 0, windowHeight = 0 } = uni.getSystemInfoSync()

@Component({
  name: 'ImageCropper'
})
export default class ImageCropper extends Vue {
  @Prop({ type: String })
  path!: string

  @Prop({ type: Number, default: 160 })
  cropperWidth!: number

  @Prop({ type: Number, default: 160 })
  cropperHeight!: number

  @Prop({ type: String })
  type!: string

  @Provide()
  show = false

  @Provide()
  scale = 1

  @Provide()
  rotate = 0

  @Provide()
  currentCropperWidth = 0

  @Provide()
  currentCropperHeight = 0

  @Provide()
  cropperOldWidth = 0

  @Provide()
  cropperOldHeight = 0

  @Provide()
  imageRealWidth = 0

  @Provide()
  imageRealHeight = 0

  @Provide()
  cropperOffsetX = 0

  @Provide()
  cropperOffsetY = 0

  @Provide()
  startX = 0

  @Provide()
  startY = 0

  // 裁剪框与边界间距
  @Provide()
  border = 5

  @Provide()
  x = 0

  @Provide()
  y = 0

  @Provide()
  startL = 0

  @Provide()
  scaling = false

  @Provide()
  oldScale = 1

  // 容器高度
  get containerHeight () {
    return windowHeight - 48
  }

  // 屏幕宽度
  get windowWidth () {
    return windowWidth
  }

  // 屏幕高度
  get windowHeight () {
    return windowHeight
  }

  // 图片宽高比
  get imageRatio () {
    if (this.imageRealHeight > 0) {
      return this.imageRealWidth / this.imageRealHeight
    }
    return 0
  }

  // 等比缩放后的宽度
  get imageWidth () {
    return this.windowWidth
  }

  // 等比缩放后的高度
  get imageHeight () {
    return this.windowWidth / this.imageRatio
  }

  @Watch('path')
  onPathChange (path: any) {
    if (path && path.length > 0) {
      this.init()
    }
  }

  init () {
    this.rotate = 0
    this.scale = 1
    this.currentCropperWidth = this.cropperWidth
    this.currentCropperHeight = this.cropperHeight
    this.loadImage()
  }

  loadImage () {
    uni.showLoading({
      title: '图片加载中...'
    })
    uni.getImageInfo({
      src: this.path,
      success: result => {
        this.imageRealWidth = result.width || 0
        this.imageRealHeight = result.height || 0

        this.cropperOffsetX = this.windowWidth / 2 - this.currentCropperWidth / 2
        this.cropperOffsetY = this.windowHeight / 2 - this.currentCropperHeight / 2

        this.$nextTick(() => {
          this.x = this.windowWidth / 2 - this.imageWidth / 2
          this.y = this.containerHeight / 2 - this.imageHeight / 2
        })

        this.show = true
        uni.hideLoading()
      },
      fail: () => {
        this.show = false
        uni.hideLoading()
        uni.showModal({
          title: '提示',
          content: '图片加载失败'
        })
      }
    })
  }

  imageTouchStart (event: any) {
    if (event.touches.length === 2) {
      this.oldScale = this.scale
      this.scaling = true
      const x = event.touches[0].pageX - event.touches[1].pageX
      const y = event.touches[0].pageY - event.touches[1].pageY
      const hypotenuse = Math.sqrt(
        Math.pow(x, 2) +
        Math.pow(y, 2)
      )

      this.startL = Math.max(x, y, hypotenuse)
    } else {
      this.startX = event.touches[0].pageX - this.x
      this.startY = event.touches[0].pageY - this.y
    }
  }

  imageMove (event: any) {
    if (this.scaling) {
      let scale = this.oldScale

      const x = event.touches[0].pageX - event.touches[1].pageX
      const y = event.touches[0].pageY - event.touches[1].pageY
      const hypotenuse = Math.sqrt(
        Math.pow(x, 2) +
        Math.pow(y, 2)
      )

      const newL = Math.max(x, y, hypotenuse)

      const cha = newL - this.startL

      // 根据图片本身大小 决定每次改变大小的系数, 图片越大系数越小
      // 1px - 0.2
      let coe = 1
      coe = coe / this.imageWidth > coe / this.imageHeight ? coe / this.imageHeight : coe / this.imageWidth
      coe = coe > 0.1 ? 0.1 : coe
      const num = coe * cha

      if (cha > 0) {
        scale += Math.abs(num)
      } else if (cha < 0) {
        if (scale > Math.abs(num)) {
          scale -= Math.abs(num)
        }
      }

      this.scale = scale
    } else {
      const moveX = event.touches[0].pageX - this.startX
      const moveY = event.touches[0].pageY - this.startY

      this.x = moveX
      this.y = moveY
    }
  }

  imageMoveEnd () {
    setTimeout(() => {
      this.scaling = false
    }, 100)
  }

  rotateCropper () {
    if (this.rotate === 3) {
      this.rotate = 0
    } else {
      ++this.rotate
    }
  }

  cancel () {
    this.show = false
    this.$emit('cancel')
  }

  confirm () {
    uni.showLoading({
      title: '裁剪中...'
    })

    const ctx = uni.createCanvasContext('cropper-canvas', this)

    const imgage = this.path
    const imageWidth = this.imageWidth * this.scale
    const imageHeight = this.imageHeight * this.scale
    const rotate = this.rotate
    let dx = this.cropperOffsetX - this.x - (this.imageWidth - imageWidth) / 2
    let dy = this.cropperOffsetY - this.y - (this.imageHeight - imageHeight) / 2

    ctx.setFillStyle('white')
    ctx.fillRect(0, 0, imageWidth, imageHeight)
    ctx.save()

    ctx.rotate((rotate * 90 * Math.PI) / 180)

    switch (rotate) {
      case 1:
        dx += (imageHeight - imageWidth) / 2
        dy -= (imageHeight - imageWidth) / 2
        ctx.drawImage(imgage, -dy, dx, imageWidth, -imageHeight)
        break
      case 2:
        ctx.drawImage(imgage, dx, dy, -imageWidth, -imageHeight)
        break
      case 3:
        dx += (imageHeight - imageWidth) / 2
        dy -= (imageHeight - imageWidth) / 2
        ctx.drawImage(imgage, dy, -dx, -imageWidth, imageHeight)
        break
      default:
        ctx.drawImage(imgage, -dx, -dy, imageWidth, imageHeight)
        break
    }
    ctx.restore()

    ctx.draw(false, () => {
      uni.canvasToTempFilePath({
        canvasId: 'cropper-canvas',
        destWidth: this.cropperWidth,
        destHeight: this.cropperWidth,
        fileType: 'jpg',
        success: (result: any) => {
          const path = result.tempFilePath
          let cropperImage = path
          if (this.type === 'base64') {
            cropperImage = `data:image/jpeg;base64,${uni.getFileSystemManager().readFileSync(path, 'base64')}`
          }
          uni.hideLoading()
          this.show = false
          this.$emit('confirm', cropperImage)
        },
        fail: () => {
          uni.hideLoading()
          uni.showModal({
            title: '提示',
            content: '裁剪失败'
          })
        }
      }, this)
    })
  }
}
</script>

<style lang="scss">
@font-face {
  font-family: "iconfont";
  src: url('data:application/x-font-woff2;charset=utf-8;base64,d09GMgABAAAAAAR4AAsAAAAACKgAAAQsAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHEIGVgCDBgqEfIRGATYCJAMMCwgABCAFhG0HShugB8gOJUHBwAAAAAFEBNmwzd4dtatSmmpFoVAEhUThEAYkCozFKDCqCVO6RfH/89v869awDnTR1qrSANFt4GG4SNxreBn91fmV9f3+53J613ieHba+N1zmGM8PA7oXTaCAxpjei8IoLWFsGLu4jPME6vWJJdovqmgAO4U2LRBnep0K7GJmpYQWanXVOWuLuAFrtenK4haAa/f38QnKsCOpyrRFh6eFWsh5KXnfYcn958BGQNKfE8wmMmaAQpzkuo9Z+ukZluoltVV5abUipL5i/ysArlhWVut/eCRBVNPUjYg6oUo7JTHFoaYDSvdacnKTq9GAB4AY5y2dtL3qpFh1DENdnJC6Hq+xYb7pyRMDMzc/fYoJjY8flwO3m98rMucF+IZHj6Cagw5UeKpxyFbt2rHGY/8jpa7CYMvLfcIesLjY3bdqhaf+nqgQs2qT/+rjCH/VfA0VFGuAC3iE8NEr/Vau8vZsXiUy7+V3c3tQQXMAuNjDCC89KDIHH0OFhnUi81GEPwyc7wZUaN7DnUf4g+ZLQsMKYV/94NjK7R7TEM4niTY1oJ5zEU62aNVaasUub08YLUEam5EnT6a61/I17dNk+vTu9jpJjXhsTFwjqTtpCBxBIIgS6iQnc/Zod1YGKp0rAwsD8kkyP6AwcK0hcAwkiQmBhWvxPZWKDu86aUH2nLEdi9rGX1eXq5P6A1SrnAucMVMdZH/GKi/jyfCqJyucfK3mXpVujXOPfFf5LC4Dvx0X/943JyOq4HuCTZ8KiIPPAb6ro8akpT6ufiq39BQrNlk5mp8pO0JlJLk8f5QalRjoP60IMx0N8n7wGhSD3n6/F1zlcTVz/cR+Ev0lkLSTd7UiPbD/wCxGRMA2Krwro2O0bTQtImbwhjAJc0S3N4ROx15/PH60IzaIOjCbEelqkDOfETNxb/FMixnWNzeJp2KPQw9A5d76jGUOQOUvH7RE/o2RfkNatd3OGf9q0QKbnq8WB7qy+hVqJRjJn1BQgP/iErks0yy5iGJTrOayW7C/z0IoZH0qNH+7N+31XXc7G2p1hZDU6IWs1ghaqDNQpcEKVKu1BfWmFW9u0IFhKUodpswCEFodgqTZHWStbqOF+hqqdPsG1VrDEuodhfueDcZCj+QzuIrFtZh6BNNraIowbCzi1dbhOlOfionKXHoTzgzoY5hCKk/minEKZ/pYMDCoU7IsgREM3Y8Vgcvwvj4aMzK0AdewUpJljWkyGZH3IKmG7gfEHgZOhYXTwqiNwOhp0CiE3ZiFpL5fB6dj0keFKcGV+JvgGAP0vWMUpOQ10GI1VQt3LoMHDNJRYrEIPInAoPXDFEEnrk9P0zDG/FEGOA2WFNkiaZRGhuoRddXS8bX917cL6mn9c6TIUXSekybKHKQfJXFq2KSiRklLYU8dNKWDIX0cAA==') format('woff2');
}

.image-cropper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 998;
  box-sizing: border-box;
  background-color: #000000;

  .cropper-box,
  .cropper-box-image,
  .cropper-drag-box,
  .cropper-crop-box {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 998;
  }

  .cropper-box {
    overflow: hidden;

    .cropper-box-image {

      .cropper-image {
        position: relative;
        width: 100%;
        height: 100%;
        transform: none;
        max-width: none;
        max-height: none;
        z-index: 998;
      }
    }
  }

  .cropper-modal {
    background: rgba(0, 0, 0, 0.5);
  }

  .pointer-events {
    pointer-events: none;
  }

  .cropper-crop-box {

    .cropper-view-box {
      display: block;
      overflow: hidden;
      width: 100%;
      height: 100%;
      outline: 4rpx solid #FFFFFF;
      outline-color: rgba(255, 255, 255, 0.75);

      image {
        max-width: none;
        max-height: none;
      }
    }

    .cropper-line {
      position: absolute;
      display: block;
      width: 100%;
      height: 100%;
      opacity: 0.1;
      z-index: 998;

      &.line-w {
        top: -6rpx;
        left: 0;
        height: 10rpx;
      }

      &.line-a {
        top: 0;
        left: -6rpx;
        width: 10rpx;
      }

      &.line-s {
        bottom: -6rpx;
        left: 0;
        height: 10rpx;
      }

      &.line-d {
        top: 0;
        right: -6rpx;
        width: 10rpx;
      }
    }
  }

  .cropper-setting-group {
    position: absolute;
    right: 60rpx;
    bottom: calc(160rpx + env(safe-area-inset-bottom));
    z-index: 998;

    .cropper-setting-button {
      position: relative;
      width: 80rpx;
      height: 80rpx;
      background: #FFFFFF;
      border-radius: 40rpx;
      display: inline-block;
      padding: 20rpx;
      margin-left: 20rpx;

      &:active {
        background: #CCCCCC;
      }
    }

    .rotate-button {
      font-family: "iconfont" !important;
      font-size: 48rpx;
      font-style: normal;
      line-height: 40rpx;

      &::before {
        content: "\e65c";
        margin-left: -4rpx;
      }
    }

    .reset-button {
      font-family: "iconfont" !important;
      font-size: 48rpx;
      font-style: normal;
      line-height: 40rpx;

      &::before {
        content: "\e648";
        margin-left: -4rpx;
      }
    }
  }

  .cropper-button-group {
    position: absolute;
    line-height: 96rpx;
    font-size: 36rpx;
    display: flex;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 998;
    background-color: #FFFFFF;
    padding-bottom: env(safe-area-inset-bottom);

    &::after {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      right: 0;
      height: 2rpx;
      border-top: 2rpx solid #D5D5D6;
      color: #D5D5D6;
      transform-origin: 0 0;
      transform: scaleY(0.5);
      z-index: 998;
    }

    .cropper-button-item {
      display: block;
      flex: 1;
      color: #FF7F50;
      text-decoration: none;
      position: relative;
      text-align: center;
      background-color: #FFFFFF;
      z-index: 998;

      &:first-child {
        color: #000000;

        &::after {
          display:  none;
        }
      }

      &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        width: 2rpx;
        border-left: 2rpx solid #D5D5D5;
        color: #D5D5D5;
        transform-origin: 0 0;
        transform: scaleX(0.5);
        z-index: 998;
      }

      &:active {
        background-color: #EEEEEE;
      }
    }
  }

  .cropper-canvas {
    position: absolute;
    top: -9999px;
    left: -9999px;
    z-index: -998;
  }
}
</style>
