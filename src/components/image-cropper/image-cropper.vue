<template>
  <view class="image-cropper" v-show="show" :style="{
      width: `${windowWidth}px`,
      height: `calc(${windowHeight}px - env(safe-area-inset-bottom))`
    }">
    <!-- 图片 -->
    <view class="cropper-box">
      <view class="cropper-box-image"
        @touchstart.stop.prevent="imageTouchStart"
        @touchmove.stop.prevent="imageTouchMove"
        @touchend.stop.prevent="imageTouchEnd"
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
      <view class="cropper-setting-button iconfont icon-reset" @click="init"/>
      <view class="cropper-setting-button iconfont icon-rotate" @click="rotateImage"/>
    </view>

    <!-- 按钮 -->
    <view class="cropper-button-group">
      <view class="cropper-button-item" @click="cancel">取消</view>
      <view class="cropper-button-item" @click="confirm">确定</view>
    </view>

    <!-- 绘图Canvas -->
    <canvas canvas-id="cropper-canvas" class="cropper-canvas"
      :style="{
        width: `${currentCropperWidth}px`,
        height: `${currentCropperHeight}px`
      }"/>
  </view>
</template>

<script lang="ts">
import { Component, Prop, Provide, Watch, Vue } from 'vue-property-decorator'

@Component({
  name: 'ImageCropper'
})
export default class ImageCropper extends Vue {
  @Prop({ type: String })
  path!: string

  // 裁剪框宽度
  @Prop({ type: Number, default: 260 })
  cropperWidth!: number

  // 裁剪框高度
  @Prop({ type: Number, default: 260 })
  cropperHeight!: number

  // 导出文件类型
  @Prop({ type: String })
  type!: string

  // 显示状态
  @Provide()
  show = false

  // 缩放比例
  @Provide()
  scale = 1

  // 旋转角度
  @Provide()
  rotate = 0

  // 当前裁剪框宽度
  @Provide()
  currentCropperWidth = 0

  // 当前裁剪框高度
  @Provide()
  currentCropperHeight = 0

  // 图片真实宽度
  @Provide()
  imageRealWidth = 0

  // 图片真实高度
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

  // 屏幕宽度
  get windowWidth () {
    return uni.getSystemInfoSync().windowWidth
  }

  // 屏幕高度
  get windowHeight () {
    return uni.getSystemInfoSync().windowHeight - 48
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

  /**
   * 初始化
   */
  init () {
    this.scale = 1
    this.rotate = 0
    this.currentCropperWidth = this.cropperWidth
    this.currentCropperHeight = this.cropperHeight
    this.loadImage()
  }

  /**
   * 加载图片
   */
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
          this.y = this.windowHeight / 2 - this.imageHeight / 2
        })

        this.show = true
        uni.hideLoading()
      },
      fail: () => {
        this.show = false
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

  imageTouchMove (event: any) {
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

  imageTouchEnd () {
    setTimeout(() => {
      this.scaling = false
    }, 100)
  }

  /**
   * 旋转图片
   */
  rotateImage () {
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
.image-cropper {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 998;
  box-sizing: border-box;
  background-color: #000000;

  .cropper-box {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    overflow: hidden;

    .cropper-box-image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 999;

      .cropper-image {
        position: relative;
        width: 100%;
        height: 100%;
        transform: none;
        max-width: none;
        max-height: none;
        z-index: 999;
      }
    }
  }

  .pointer-events {
    pointer-events: none;
  }

  .cropper-drag-box {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;

    &.cropper-modal {
      background: rgba(0, 0, 0, 0.5);
    }
  }

  .cropper-crop-box {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;

    .cropper-view-box {
      display: block;
      width: 100%;
      height: 100%;
      overflow: hidden;
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
      z-index: 999;

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
    bottom: 60rpx;
    z-index: 9999;

    .cropper-setting-button {
      display: inline-block;
      width: 80rpx;
      height: 80rpx;
      font-size: 48rpx;
      font-style: normal;
      line-height: 80rpx;
      text-align: center;
      margin-left: 30rpx;
      border-radius: 40rpx;
      background: #FFFFFF;
    }
  }

  .cropper-button-group {
    display: flex;
    position: fixed;
    left: 0;
    bottom: env(safe-area-inset-bottom);
    width: 100%;
    height: 96rpx;
    line-height: 96rpx;
    font-size: 36rpx;
    z-index: 9999;
    background-color: #FFFFFF;
    padding-bottom: env(safe-area-inset-bottom);

    .cropper-button-item {
      display: block;
      position: relative;
      flex: 1;
      color: #FF7F50;
      text-align: center;
      text-decoration: none;
      background-color: #FFFFFF;

      &:first-child {
        color: #000000;

        &::after {
          display:  none;
        }
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
    z-index: -9999;
  }
}
</style>
