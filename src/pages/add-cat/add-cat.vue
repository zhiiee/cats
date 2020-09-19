<template>
  <view class="container">
    <view v-if="!isError">
      <scroll-view :scroll-y="true" style="height: calc(100vh - 140rpx - env(safe-area-inset-bottom));">
        <!-- 头像 -->
        <view class="avatar">
          <img :src="avatar" mode="scaleToFill"/>
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
          <input class="location" placeholder="为了保护流浪猫 位置信息会隐藏显示" :disabled="true" :value="location" @click="changeLocation"/>
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
      <!-- 审核按钮 -->
      <view class="buttons padding">
        <button class="cu-btn block bg-orange lg" @click="saveCat">提交审核</button>
      </view>
      <!-- 头像裁剪 -->
      <image-cropper :path="avtaterTempFilePath" cropperWidth="160" cropperHeight="160" @confirm="avtaterCropperConfirm"/>
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
import { Categories } from '@/api'

@Component({
  name: 'AddCat',
  components: { PageStatus, ImageCropper, AttributeModal, RelationsModal }
})
export default class AddCat extends Vue {
  @Provide()
  isError = false

  // 表单数据
  @Provide()
  form = {}

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
  location = ''

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

  get types () {
    return this.$store.state.catTypes.map((type: any) => {
      return type.name
    })
  }

  get width () {
    return uni.getSystemInfoSync().windowWidth * 0.8
  }

  /**
   * 获取猫咪属性列表
   */
  async created () {
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
        this.location = result.name
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

  saveCat () {
    if (!this.avatar) {
      this.showError('上传一个猫咪的头像')
      return false
    }
    if (!this.name) {
      this.showError('给猫咪起个名字')
      return false
    }
    if (!this.type) {
      this.showError('选择一个猫咪的花色分类')
      return false
    }
    if (!this.desc) {
      this.showError('简单描述一下这只猫咪')
      return false
    }
    if (!this.cover) {
      this.showError('上传一个猫咪的封面图')
      return false
    }
    this.form = {
      avatar: this.avatar,
      name: this.name,
      type: this.type,
      desc: this.desc,
      cover: this.cover,
      items: this.items
    }
    console.log(this.form)
  }

  showError (title: string) {
    uni.showToast({
      icon: 'none',
      title: title
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

  .buttons {
    z-index: 0;
  }
}
</style>
