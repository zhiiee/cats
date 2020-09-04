<template>
  <scroll-view :scroll-x="true" :scroll-with-animation="true"
    :style="{ width: auto ? '' : `${navigationWidth}px` }"
    :scroll-into-view="'tab-' + currentView">
    <view id="tab-bar" class="top-tabs">
      <view class="tabs">
        <view v-for="(item, index) in labels" :key="index" @click="tabTap(index)" :id="'tab-' + index" :class="'tab ' + (index === selectedIndex ? 'active' : '')">
          <view>{{ item.name }}</view>
        </view>
      </view>
    </view>
  </scroll-view>
</template>

<script lang="ts">
import { Component, Prop, Provide, Watch, Vue } from 'vue-property-decorator'

@Component({
  name: 'TabBar'
})
export default class TabBar extends Vue {
  @Prop({ type: Array, required: true })
  labels!: Array<any>

  @Prop({ type: Number, default: 0 })
  selectedIndex!: number

  @Prop({ type: Boolean, default: false })
  auto!: boolean

  @Provide()
  currentView = 0

  get navigationWidth () {
    return this.$store.state.navigationWidth
  }

  @Watch('selectedIndex')
  onSelectedIndexChange (index: number) {
    this.currentView = -1
    this.$nextTick(() => {
      const len = this.labels.length
      let currentView = index - 2
      if (currentView < 0) currentView = 0
      if (currentView > len - 2) currentView = len - 2
      this.currentView = currentView
    })
  }

  created () {
    // @ts-ignore
    this.createSelectorQuery()
      .select('#tab-bar')
      .boundingClientRect()
      .exec((result: any) => {
        this.$emit('loaded', result[0])
      })
  }

  tabTap (index: number) {
    this.$emit('change', index)
  }
}
</script>

<style lang="scss">
.top-tabs {
  position: relative;
  border-radius: 0rpx;
  text-align: left;

  .tabs {
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
    flex-wrap: nowrap;

    .tab {
      position: relative;
      display: inline-block;
      width: 120rpx;
      flex-shrink: 0;
      font-size: 28rpx;
      padding: 24rpx 0rpx;
      box-sizing: border-box;
      line-height: 40rpx;
      color: #9B9B9B;
      text-align: center;

      &.active {
        font-size: 34rpx;
        color: #000000;
        font-weight: bold;

        &::after {
          content: '';
          width: 18rpx;
          height: 6rpx;
          position: absolute;
          left: 50%;
          margin-left: -9rpx;
          margin-top: 4rpx;
          border-radius: 18rpx;
          background-color: #13100E;
        }
      }
    }
  }
}
</style>
