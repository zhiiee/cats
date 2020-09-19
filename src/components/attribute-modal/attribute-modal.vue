<template>
  <view class="cu-modal" :class="show ? 'show' : ''">
    <view class="cu-dialog">
      <view class="cu-bar bg-white justify-end">
        <view class="content">添加属性</view>
        <view class="action" @click="close">
          <text class="cuIcon-close text-red"/>
        </view>
      </view>
      <view class="padding-xl">
        <view class="cu-form-group">
          <input placeholder="属性名称" :value="name" @input="nameInput"/>
        </view>
        <view class="cu-form-group">
          <input placeholder="属性描述" :value="value" @input="valueInput"/>
        </view>
      </view>
      <view class="cu-bar bg-white">
        <view class="action margin-0 flex-sub text-green solid-left" @click="close">取消</view>
        <view class="action margin-0 flex-sub  solid-left" @click="confirm">确定</view>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import { Component, Prop, Provide, Watch, Vue } from 'vue-property-decorator'

@Component({
  name: 'AttributeModal'
})
export default class AttributeModal extends Vue {
  @Prop({ type: Boolean, default: false })
  show!: boolean

  @Provide()
  name = ''

  @Provide()
  value = ''

  @Watch('show')
  onShowChange () {
    this.name = ''
    this.value = ''
  }

  /**
   * 输入属性名
   */
  nameInput (event: any) {
    this.name = event.detail.value
  }

  /**
   * 输入属性值
   */
  valueInput (event: any) {
    this.value = event.detail.value
  }

  /**
   * 关闭/取消
   */
  close () {
    this.$emit('close')
  }

  /**
   * 确认
   */
  confirm () {
    if (this.name.length > 0 && this.value.length > 0) {
      this.$emit('confirm', {
        name: this.name,
        value: this.value
      })
    } else {
      uni.showToast({
        icon: 'none',
        title: '请输入正确的属性信息'
      })
    }
  }
}
</script>

<style lang="scss">
</style>
