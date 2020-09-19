<template>
  <view class="container">
    <view v-if="!isError">
      <scroll-view :scroll-y="true" style="height: calc(100vh - 140rpx - env(safe-area-inset-bottom));">
        <!-- 头像 -->
        <view class="avatar">
          <img :src="avatar" mode="scaleToFill" @click="checkAvtater"/>
          <view class="avatar-edit iconfont icon-camera" @click="checkAvtater"/>
        </view>
        <!-- 名字 -->
        <view class="cu-form-group margin-top">
          <view class="title">名字</view>
          <input placeholder="给猫咪起个名字" :value="name" @input="nameInput"/>
        </view>
        <!-- 分类 -->
        <view class="cu-form-group">
          <view class="title">分类</view>
          <picker :value="typeIndex" :range="types" @change="typeChange">
            <view class="picker">
              {{ typeIndex >-1 ? types[typeIndex] : '选择分类' }}
            </view>
          </picker>
        </view>
        <!-- 位置 -->
        <view class="cu-form-group">
          <view class="title">位置</view>
          <input class="location" placeholder="为了保护流浪猫 位置信息会隐藏显示" :disabled="true" :value="location.name" @click="changeLocation"/>
          <text class='cuIcon-locationfill text-orange' @click="changeLocation"/>
        </view>
        <!-- 描述 -->
        <view class="cu-form-group margin-top">
          <textarea placeholder="简单描述一下这只猫咪" :value="desc" @input="descInput"/>
        </view>
        <!-- 封面 -->
        <view class="cu-bar bg-white margin-top bar-border">
          <view class="action">封面</view>
        </view>
        <view class="cu-form-group cover-view" @click="checkCover">
          <img :src="cover" mode="scaleToFill"/>
          <view v-if="cover.length === 0" class="cover-edit cuIcon-cameraadd"/>
        </view>
        <!-- 属性 -->
        <view class="cu-bar bg-white margin-top bar-border">
          <view class="action">属性</view>
          <view class="action">
            <button class="cu-btn round line-orange" @click="showAddAttribute">
              <text class="cuIcon-add"/>添加
            </button>
          </view>
        </view>
        <view class="cu-form-group" v-for="(attribute, index) of attributes" :key="index">
          <view class="title">{{ attribute.name }}</view>
          <input :placeholder="`请填写猫咪的${attribute.name}信息`" :data-index="index" :data-name="attribute.name" :value="items[index].content" @input="attributeInput"/>
          <text class='cuIcon-delete' v-if="attribute.type !== 'system'" :data-index="index" @click="deleteAttribute"/>
        </view>
        <!-- 关系 -->
        <view class="cu-list menu margin-top">
          <view class="cu-item arrow" @click="showSelectRelations">
            <view class="content">关系</view>
            <view class="content">
              <view class="cu-avatar-group">
                <image v-for="(relation, index) of relations" :key="index" class="cu-avatar round sm" :src="relation.avatar"/>
              </view>
            </view>
          </view>
        </view>
        <!-- 照片 -->
        <view class="cu-bar bg-white margin-top bar-border">
          <view class="action">照片</view>
        </view>
        <view class="cu-form-group photo-view">
          <view class="grid col-4 grid-square flex-sub">
            <view class="bg-img" v-for="(item, index) in photos" :key="index" :data-index="index" @click="showPhotos">
              <image :src="item" mode="aspectFill"/>
              <view class="cu-tag bg-red" :data-index="index" @click.stop="deletePhotos">
                <text class='cuIcon-close'/>
              </view>
            </view>
            <view class="solids" @click="selectPhotos">
              <text class='cuIcon-cameraadd'/>
            </view>
          </view>
        </view>
      </scroll-view>
      <!-- 提交蒙版 -->
      <view v-if="submitStatus" class="submit-modal"/>
      <!-- 提交按钮 -->
      <view class="buttons padding">
        <button class="cu-btn block bg-orange lg" @click="submitCheck" v-if="submitStatus === false">提交初审</button>
        <button class="cu-btn block bg-orange lg" @click="submitCat" v-if="submitStatus === true">提交管理员审核</button>
      </view>
      <!-- 头像裁剪 -->
      <image-cropper :path="avtaterTempFilePath" cropperWidth="260" cropperHeight="260" @confirm="avtaterCropperConfirm"/>
      <!-- 封面裁剪 -->
      <image-cropper :path="coverTempFilePath" :cropperWidth="width" :cropperHeight="width * 0.8" @confirm="coverCropperConfirm"/>
      <!-- 添加属性模态框 -->
      <attribute-modal :show="addAttributeShow" @close="hideAddAttribute" @confirm="hideAddAttribute"/>
      <!-- 选择关系模态框 -->
      <relations-modal :show="selectRelationsShow" :value="relations" @cancel="hideSelectRelations" @confirm="hideSelectRelations"/>
    </view>
    <page-status v-if="isError" :status="1" message="喵星信号中断 请重试"/>
  </view>
</template>

<script lang="ts">
import { Component, Provide, Vue } from 'vue-property-decorator'
import PageStatus from '@/components/page-status/page-status.vue'
import ImageCropper from '@/components/image-cropper/image-cropper.vue'
import AttributeModal from '@/components/attribute-modal/attribute-modal.vue'
import RelationsModal from '@/components/relations-modal/relations-modal.vue'
import { Categories, Security, Posts } from '@/api'

@Component({
  name: 'AddCat',
  components: { PageStatus, ImageCropper, AttributeModal, RelationsModal }
})
export default class AddCat extends Vue {
  @Provide()
  isError = false

  // 头像
  @Provide()
  avatar = ''

  // 头像文件地址
  @Provide()
  avtaterTempFilePath = ''

  // 名字
  @Provide()
  name = ''

  // 分类下标
  @Provide()
  typeIndex = -1

  // 分类名称
  @Provide()
  type = ''

  // 位置
  @Provide()
  location: any = {}

  // 纬度
  @Provide()
  latitude!: number

  // 经度
  @Provide()
  longitude!: number

  // 描述
  @Provide()
  desc = ''

  // 封面
  @Provide()
  cover = ''

  // 封面文件地址
  @Provide()
  coverTempFilePath = ''

  // 属性项列表(数据库存的值)
  @Provide()
  items: Array<any> = []

  // 属性列表(用于渲染列表)
  @Provide()
  attributes: Array<any> = []

  // 是否显示添加属性
  @Provide()
  addAttributeShow = false

  // 关系列表
  @Provide()
  relations: Array<any> = []

  // 是否显示关系选择
  @Provide()
  selectRelationsShow = false

  // 照片列表
  @Provide()
  photos: Array<any> = []

  @Provide()
  checkPhotos: Array<any> = []

  @Provide()
  checkItems: Array<any> = []

  @Provide()
  submitStatus = false

  // 分类列表
  get types () {
    return this.$store.state.catTypes.map((type: any) => {
      return type.name
    })
  }

  // 封面最大宽度
  get width () {
    return uni.getSystemInfoSync().windowWidth * 0.8
  }

  async onLoad () {
    // 获取猫咪属性列表
    this.attributes = []
    const attributes = await Categories.list({ type: 2 })
    if (attributes === -1) {
      this.isError = true
      return
    }
    this.attributes = attributes.map((attribute: any) => {
      return {
        type: 'system',
        name: attribute.name
      }
    })
    uni.getLocation({
      type: 'gcj02',
      altitude: true,
      isHighAccuracy: true,
      highAccuracyExpireTime: 3500,
      success: result => {
        this.latitude = result.latitude
        this.longitude = result.longitude
      }
    })
  }

  /**
   * 选择头像
   */
  checkAvtater () {
    uni.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (result: any) => {
        this.avtaterTempFilePath = result.tempFilePaths.shift()
      }
    })
  }

  /**
   * 头像确认
   */
  avtaterCropperConfirm (image: any) {
    this.avatar = image
  }

  /**
   * 输入名字
   */
  nameInput (event: any) {
    this.name = event.detail.value
  }

  /**
   * 分类选择
   */
  typeChange (event: any) {
    const index = event.detail.value
    this.type = this.$store.state.catTypes[index].code
    this.typeIndex = index
  }

  /**
   * 选择位置
   */
  changeLocation () {
    uni.chooseLocation({
      latitude: this.latitude,
      longitude: this.longitude,
      success: result => {
        this.location = result
      }
    })
  }

  /**
   * 描述输入
   */
  descInput (event: any) {
    this.desc = event.detail.value
  }

  /**
   * 选择封面
   */
  checkCover () {
    uni.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (result: any) => {
        this.coverTempFilePath = result.tempFilePaths.shift()
      }
    })
  }

  /**
   * 封面确认
   */
  coverCropperConfirm (image: any) {
    this.cover = image
  }

  /**
   * 输入属性
   */
  attributeInput (event: any) {
    const { name, index } = event.currentTarget.dataset
    const value = event.detail.value
    this.items[index] = {
      category: name,
      content: value
    }
  }

  /**
   * 显示添加属性
   */
  showAddAttribute () {
    this.addAttributeShow = true
  }

  /**
   * 隐藏添加属性
   */
  hideAddAttribute (attribute: any) {
    if (attribute && attribute.name) {
      this.attributes.push({
        name: attribute.name
      })
      this.items[this.attributes.length - 1] = {
        category: attribute.name,
        content: attribute.value
      }
    }
    this.addAttributeShow = false
  }

  /**
   * 删除属性
   */
  deleteAttribute (event: any) {
    const { index } = event.currentTarget.dataset
    uni.showModal({
      title: '提示',
      content: '确认删除这个属性吗？',
      success: result => {
        if (result.confirm) {
          this.items.splice(index, 1)
          this.attributes.splice(index, 1)
        }
      }
    })
  }

  /**
   * 显示关系选择
   */
  showSelectRelations () {
    this.selectRelationsShow = true
  }

  /**
   * 隐藏关系选择
   */
  hideSelectRelations (relations: any) {
    this.selectRelationsShow = false
    this.relations = relations
  }

  /**
   * 选择照片
   */
  selectPhotos () {
    uni.chooseImage({
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: result => {
        this.photos = this.photos.concat(result.tempFilePaths)
      }
    })
  }

  /**
   * 查看照片
   */
  showPhotos (event: any) {
    const { index } = event.currentTarget.dataset
    uni.previewImage({
      urls: this.photos,
      current: index
    })
  }

  /**
   * 删除照片
   */
  deletePhotos (event: any) {
    const { index } = event.currentTarget.dataset
    uni.showModal({
      title: '提示',
      content: '确定要删除这张照片吗？',
      success: result => {
        if (result.confirm) {
          this.photos.splice(index, 1)
        }
      }
    })
  }

  /**
   * 提交初审
   */
  async submitCheck () {
    // 表单校验
    if (this.validation()) {
      uni.showLoading({
        mask: true,
        title: '初审中...'
      })
      // 安全检查
      if (await this.securityCheck()) {
        this.submitStatus = true
        uni.showToast({
          mask: true,
          icon: 'success',
          title: '初审通过',
          duration: 3000
        })
      }
    }
  }

  /**
   * 表单校验
   */
  validation () {
    if (this.isEmpty(this.avatar)) {
      this.showError('上传一个猫咪的头像')
      return false
    }

    if (this.isEmpty(this.name)) {
      this.showError('给猫咪起个名字')
      return false
    }

    if (this.isEmpty(this.type)) {
      this.showError('选择一个猫咪的花色分类')
      return false
    }

    if (this.isEmpty(this.location.name)) {
      this.showError('选择一下猫咪的位置')
      return false
    }

    if (this.isEmpty(this.desc)) {
      this.showError('简单描述一下这只猫咪')
      return false
    }

    if (this.isEmpty(this.cover)) {
      this.showError('上传一个猫咪的封面图')
      return false
    }

    if (this.items.length < this.attributes.length) {
      this.showError('属性信息要填写完整')
      return false
    }

    for (const item of this.items) {
      if (this.isEmpty(item.content)) {
        this.showError('属性信息要填写完整')
        return false
      }
    }
    return true
  }

  /**
   * 安全检查
   */
  async securityCheck () {
    const avatarCheckResult = await this.imageSecurityCheck(this.avatar)
    if (avatarCheckResult === false) {
      this.showError('头像不合法请修改')
      return false
    } else if (avatarCheckResult !== true) {
      this.avatar = avatarCheckResult
    }

    if (!await this.contentSecurityCheck(this.name)) {
      this.showError('名字不合法请修改')
      return false
    }

    if (!await this.contentSecurityCheck(this.desc)) {
      this.showError('描述不合法请修改')
      return false
    }

    const coverCheckResult = await this.imageSecurityCheck(this.cover)
    if (coverCheckResult === false) {
      this.showError('封面不合法请修改')
      return false
    } else if (coverCheckResult !== true) {
      this.cover = coverCheckResult
    }

    await this.itemsSecurityCheck()
    if (this.checkItems.length !== this.items.length) {
      this.showError('属性不合法请修改')
      return false
    }

    await this.photosSecurityCheck()
    if (this.checkPhotos.length !== this.photos.length) {
      this.showError('照片不合法请修改')
      return false
    }
    return true
  }

  /**
   * 图片安全检查
   */
  async imageSecurityCheck (image: string) {
    if (image.indexOf('cloud://') !== -1) {
      return true
    } else {
      const result = await Security.imgSecCheck(image)
      if (result.status === 0) {
        console.log('图片检查合法', image)
        return result.url
      } else {
        console.log('图片检查不合法', image)
        return false
      }
    }
  }

  /**
   * 检查照片
   */
  async photosSecurityCheck () {
    if (this.photos.length > 0) {
      this.checkPhotos = []
      await this.photoSecurityCheck(this.photos[0], 0)
    }
  }

  /**
   * 递归检查照片
   */
  async photoSecurityCheck (photo: any, index: number) {
    const photoCheckResult = await this.imageSecurityCheck(photo)
    if (photoCheckResult !== false) {
      this.checkPhotos.push(photo)
      if (photoCheckResult !== true) {
        this.photos[index] = photoCheckResult
      }
    }
    if (this.photos.length > index + 1) {
      await this.photoSecurityCheck(this.photos[index + 1], index + 1)
    }
  }

  /**
   * 文本安全检查
   */
  async contentSecurityCheck (content: string) {
    const result = await Security.msgSecCheck(content)
    if (result.status === 0) {
      console.log('文本检查合法', content)
      return true
    } else {
      console.log('文本检查不合法', content)
      return false
    }
  }

  /**
   * 检查属性
   */
  async itemsSecurityCheck () {
    this.checkItems = []
    await this.itemSecurityCheck(this.items[0], 0)
  }

  /**
   * 递归检查属性
   */
  async itemSecurityCheck (item: any, index: number) {
    if (await this.contentSecurityCheck(item.category) && await this.contentSecurityCheck(item.content)) {
      this.checkItems.push(item)
    }
    if (this.items.length > index + 1) {
      await this.itemSecurityCheck(this.items[index + 1], index + 1)
    }
  }

  /**
   * 判断是否为空
   */
  isEmpty (val: string) {
    if (val === null || val === undefined || val.length === 0) {
      return true
    }
    return false
  }

  /**
   * 显示错误信息
   */
  showError (title: string) {
    uni.showToast({
      icon: 'none',
      title: title,
      duration: 3000
    })
  }

  /**
   * 提交猫咪信息
   */
  submitCat () {
    uni.requestSubscribeMessage({
      tmplIds: ['rrPousHxOgv-Lf5vQMry8xa5CjspYVzfYCjXxFA-ZmI'],
      complete: async (result: any) => {
        console.log(result)
        uni.showLoading({
          mask: true,
          title: '提交中...'
        })
        let subscribe = false
        if (result['rrPousHxOgv-Lf5vQMry8xa5CjspYVzfYCjXxFA-ZmI'] === 'accept') {
          subscribe = true
        }
        const respone = await Posts.create({
          avatar: this.avatar,
          name: this.name,
          type: this.type,
          desc: this.desc,
          cover: this.cover,
          items: this.items,
          relations: this.relations,
          photos: this.photos,
          subscribe: subscribe
        })
        if (respone !== -1) {
          uni.navigateBack({
            delta: 1
          })
        } else {
          this.showError('发生错误 请重试')
        }
      }
    })
  }
}
</script>

<style lang="scss">
.container {
  height: 100vh;

  .avatar {
    text-align: center;
    padding-top: 30rpx;
    position: relative;

    image {
      width: 200rpx;
      height: 200rpx;
      border-radius: 10rpx;
      border: #FFFFFF solid 8rpx;
      box-shadow: 4rpx 4rpx 4rpx rgba(0, 0, 0, 0.1);
    }

    .avatar-edit {
      display: flex;
      justify-content: center;
      align-items: center;
      background: #FFFFFF;
      border: #FFFFFF solid 8rpx;
      box-shadow: 4rpx 4rpx 4rpx rgba(0, 0, 0, 0.1);
      width: 64rpx;
      height: 64rpx;
      line-height: 64rpx;
      position: absolute;
      bottom: -15rpx;
      left: 440rpx;
      border-radius: 64rpx;

      &.iconfont {
        font-size: 42rpx;
      }
    }
  }

  .location {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .cover-view {
    padding: 30rpx;
    width: 100vw;
    height: calc(100vw * 0.8);

    image {
      width: 100%;
      height: 100%;
    }

    .cover-edit {
      display: flex;
      justify-content: center;
      align-items: center;
      width: calc(100% - 60rpx);
      height: 200rpx;
      line-height: 200rpx;
      position: absolute;
      margin: 0 auto;
      font-size: 80rpx;

      &.iconfont {
        font-size: 80rpx;
        color: #666666;
      }
    }
  }

  .photo-view {
    padding: 30rpx;
  }

  .bar-border {
    border-bottom: 1rpx solid #EEEEEE;
  }

  .submit-modal {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: calc(100vh - 140rpx - env(safe-area-inset-bottom));
    opacity: 0.8;
    z-index: 9999;
    background-color: #F7F2EE;
  }

  .buttons {
    z-index: 0;
  }
}
</style>
