<template>
  <view class="container">
    <view v-if="!isError">
      <scroll-view :scroll-y="true" style="height: calc(100vh - 140rpx - env(safe-area-inset-bottom));">
        <view class="avatar">
          <img :src="avatar" mode="scaleToFill"/>
          <view class="avatar-edit iconfont icon-camera" @click="checkAvtater"/>
        </view>
        <view class="cu-form-group margin-top">
          <view class="title">名字</view>
          <input placeholder="给猫咪起个名字" :value="name" @input="nameInput"/>
        </view>
        <view class="cu-form-group">
          <view class="title">分类</view>
          <picker :value="typeIndex" :range="types" @change="typeChange">
            <view class="picker">
              {{ typeIndex >-1 ? types[typeIndex] : '选择分类' }}
            </view>
          </picker>
        </view>
        <view class="cu-form-group">
          <view class="title">位置</view>
          <input class="location" placeholder="为了保护流浪猫 位置信息会隐藏显示" :disabled="true" :value="location" @click="changeLocation"/>
          <text class='cuIcon-locationfill text-orange' @click="changeLocation"/>
        </view>
        <!-- 属性 -->
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
              <text class="cuIcon-add"></text>添加
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
            <!-- <view class="bg-img" v-for="(item,index) in imgList" :key="index" @tap="ViewImage" :data-url="imgList[index]">
              <image :src="imgList[index]" mode="aspectFill"></image>
              <view class="cu-tag bg-red" @tap.stop="DelImg" :data-index="index">
                <text class='cuIcon-close'></text>
              </view>
            </view> -->
            <view class="solids">
              <text class='cuIcon-cameraadd'/>
            </view>
          </view>
        </view>
      </scroll-view>
      <view class="buttons padding">
        <button class="cu-btn block bg-orange lg" @click="saveCat">提交审核</button>
      </view>
      <!-- 添加属性模态框 -->
      <view class="cu-modal" :class="addAttributeStatus ? 'show' : ''">
        <view class="cu-dialog">
          <view class="cu-bar bg-white justify-end">
            <view class="content">添加属性</view>
            <view class="action" @click="hideAddAttribute(false)">
              <text class="cuIcon-close text-red"></text>
            </view>
          </view>
          <view class="padding-xl">
            <view class="cu-form-group">
              <input placeholder="属性名称" :value="attributeName" @input="attributeNameInput"/>
            </view>
            <view class="cu-form-group">
              <input placeholder="属性描述" :value="attributeValue" @input="attributeValueInput"/>
            </view>
          </view>
          <view class="cu-bar bg-white">
            <view class="action margin-0 flex-sub text-green solid-left" @click="hideAddAttribute(false)">取消</view>
            <view class="action margin-0 flex-sub  solid-left" @click="hideAddAttribute(true)">确定</view>
          </view>
        </view>
      </view>
      <!-- 选择关系模态框 -->
      <view class="cu-modal bottom-modal" :class="selectRelationsStatus ? 'show' : ''">
        <view class="cu-dialog">
          <view class="cu-bar bg-white">
            <view class="action text-blue" @click="hideSelectRelations">取消</view>
            <view class="action text-green" @click="hideSelectRelations">确定</view>
          </view>
          <view class="select-relations">
            <view class="cu-bar search bg-white">
              <view class="search-form round">
                <text class="cuIcon-search"></text>
                <input type="text" placeholder="根据名字搜索" confirm-type="search" :value="searchName" @input="searchNameInput" @blur="searchConfirm"/>
              </view>
            </view>
            <scroll-view :scroll-y="true" style="height: 500rpx;"
              :refresher-enabled="true"
              :refresherTriggered="refresherTriggered"
              @scrolltolower="onScrolltolower"
              @refresherrefresh="onRefresherrefresh"
              @refresherpulling="onRefresherpulling"
              @refresherrestore="onRefresherrestore">
              <view class="grid col-3 padding-sm">
                <view v-for="(cat, index) in cats" class="padding-xs" :key="index">
                  <button class="cu-btn orange lg block relation" :class="relations[cat.id] !== undefined ? 'bg-orange' : 'line-orange'"
                    :data-index="index" @click="selectRelations">
                    <view class="relation-avatar">
                      <image :src="cat.avatar"/>
                    </view>
                    <view class="relation-name">{{ cat.name }}</view>
                  </button>
                </view>
              </view>
              <page-status v-if="status !== 2" :status="status"/>
            </scroll-view>
            <view style="width: 100%; height: env(safe-area-inset-bottom); padding-top: 40rpx;"></view>
          </view>
        </view>
      </view>
      <!-- 头像裁剪 -->
      <image-cropper :path="avtaterTempFilePath" cropperWidth="160" cropperHeight="160" @confirm="avtaterCropperConfirm"/>
      <!-- 封面裁剪 -->
      <image-cropper :path="coverTempFilePath" :cropperWidth="width" :cropperHeight="width * 0.8" @confirm="coverCropperConfirm"/>
    </view>
    <page-status v-if="isError" :status="1" message="喵星信号中断 请重试"/>
  </view>
</template>

<script lang="ts">
import { Component, Provide, Vue } from 'vue-property-decorator'
import PageStatus from '@/components/page-status/page-status.vue'
import ImageCropper from '@/components/image-cropper/image-cropper.vue'
import { Categories, Cats } from '@/api'

@Component({
  name: 'AddCat',
  components: { PageStatus, ImageCropper }
})
export default class AddCat extends Vue {
  @Provide()
  isError = false

  @Provide()
  form = {}

  @Provide()
  avatar = ''

  @Provide()
  avtaterTempFilePath = ''

  @Provide()
  name = ''

  @Provide()
  typeIndex = -1

  @Provide()
  type = ''

  @Provide()
  location = ''

  @Provide()
  latitude!: number

  @Provide()
  longitude!: number

  @Provide()
  desc = ''

  @Provide()
  cover = ''

  @Provide()
  coverTempFilePath = ''

  @Provide()
  items: Array<any> = []

  @Provide()
  attributes: Array<any> = []

  @Provide()
  addAttributeStatus = false

  @Provide()
  attributeName = ''

  @Provide()
  attributeValue = ''

  @Provide()
  relations: any = {}

  @Provide()
  searchName = ''

  @Provide()
  selectRelationsStatus = false

  // 下拉刷新状态
  @Provide()
  refresherTriggered = false

  // 页码
  @Provide()
  pageIndex = 1

  // 页大小
  @Provide()
  pageSize = 15

  // 是否加载更多
  @Provide()
  isLoadMore = true

  // 是否在加载中
  @Provide()
  isLoading = false

  // 状态 0: 加载中 1: 加载失败 2: 加载成功 3: 没数据
  @Provide()
  status = 0

  @Provide()
  cats: Array<any> = []

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
    this.addAttributeStatus = true
  }

  /**
   * 输入属性名
   */
  attributeNameInput (event: any) {
    this.attributeName = event.detail.value
  }

  /**
   * 输入属性值
   */
  attributeValueInput (event: any) {
    this.attributeValue = event.detail.value
  }

  /**
   * 隐藏添加属性
   */
  hideAddAttribute (status: boolean) {
    if (status) {
      this.attributes.push({
        name: this.attributeName
      })
      this.items[this.attributes.length - 1] = {
        category: this.attributeName,
        content: this.attributeValue
      }
    }
    this.attributeName = ''
    this.attributeValue = ''
    this.addAttributeStatus = false
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
    this.selectRelationsStatus = true
    if (this.cats.length === 0) {
      this.isLoadMore = true
      this.loadRelations()
    }
  }

  /**
   * 关系搜索输入
   */
  searchNameInput (event: any) {
    this.searchName = event.detail.value
  }

  /**
   * 搜索事件
   */
  searchConfirm () {
    this.cats = []
    this.onRefresherrefresh()
  }

  /**
   * 加载关系列表
   */
  async loadRelations (isRefresh?: boolean) {
    if ((!this.isLoadMore && !isRefresh) || this.isLoading) {
      return
    }
    this.isLoading = true
    const cats = await Cats.list({
      type: this.type,
      name: this.searchName,
      pageIndex: this.pageIndex,
      pageSize: this.pageSize
    })
    this.isLoading = false
    if (cats !== -1) {
      if (cats.length) {
        this.pageIndex++
        if (isRefresh) {
          this.cats = []
        }
        for (const cat of cats) {
          this.cats.push(cat)
        }
        this.isLoadMore = cats.length === this.pageSize
        this.status = 2
      } else {
        this.status = 3
      }
    } else {
      this.status = 1
    }
  }

  /**
   * 选择关系
   */
  selectRelations (event: any) {
    const { index } = event.currentTarget.dataset
    // 此处未触发视图更新 临时解决办法 有空再研究下为什么 可能是深拷贝的问题
    const temp = this.cats
    this.cats = []
    this.cats = temp
    // 根据当前点击的下标获取当前点击的猫咪
    const cat = this.cats[index]
    // 需要判断是选择还是取消
    if (this.relations[cat.id] === undefined) {
      this.relations[cat.id] = cat
    } else {
      delete this.relations[cat.id]
    }
  }

  /**
   * 触底加载
   */
  async onScrolltolower () {
    await this.loadRelations()
  }

  /**
   * 下拉事件开始
   */
  onRefresherpulling () {
    this.refresherTriggered = true
  }

  /**
   * 触发下拉事件
   */
  async onRefresherrefresh () {
    this.pageIndex = 1
    await this.loadRelations(true)
    this.refresherTriggered = false
  }

  /**
   * 下拉事件结束
   */
  onRefresherrestore () {
    this.refresherTriggered = false
  }

  /**
   * 隐藏关系选择
   */
  hideSelectRelations () {
    this.selectRelationsStatus = false
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

  .select-relations {
    padding: 0rpx;

    .search {
      width: 100%;
    }

    .relation {
      padding: 0 20rpx;
      display: block;

      .relation-avatar {
        position: absolute;
        left: 20rpx;
        top: 50%;
        width: 40rpx;
        height: 40rpx;
        transform: translateY(-50%);

        image {
          width: 100%;
          height: 100%;
          border-radius: 50%;
        }
      }

      .relation-name {
        position: absolute;
        left: 70rpx;
        top: 50%;
        width: calc(100% - 90rpx);
        text-align: left;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        transform: translateY(-50%);
      }
    }
  }

  .buttons {
    z-index: 0;
  }
}
</style>
