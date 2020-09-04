<template>
  <view class="container">
    <navigation-bar/>
    <tab-bar :labels="catTypes" :selectedIndex="tabIndex" @loaded="tabBarLoaded" @change="onTabChange" :auto="true"/>
    <swiper :current="current" @change="onChange" :style="{ height: `calc(100vh - ${statusBarHeight}px - ${navigationHeight}px - ${tabBarHeight}px)` }">
      <swiper-item v-for="(item, index) of catTypes" :key="index">
        <view></view>
      </swiper-item>
    </swiper>
  </view>
</template>

<script lang="ts">
import { Component, Provide, Mixins } from 'vue-property-decorator'
import Share from '@/mixins/share'
import NavigationBar from '@/components/navigation-bar/navigation-bar.vue'
import TabBar from '@/components/tab-bar/tab-bar.vue'

@Component({
  name: 'Home',
  components: { NavigationBar, TabBar }
})
export default class Home extends Mixins(Share) {
  @Provide()
  tabIndex = 0

  @Provide()
  current = 0

  @Provide()
  isInit: Array<boolean> = []

  @Provide()
  tabBarHeight = 44

  get statusBarHeight () {
    return this.$store.state.statusBarHeight
  }

  get navigationHeight () {
    return this.$store.state.navigationHeight
  }

  get userInfo () {
    return this.$store.state.userInfo
  }

  get catTypes () {
    return this.$store.state.catTypes
  }

  created () {
    // 设置初始标签
    this.current = 0
    // 初始化所有页签的状态
    this.catTypes.map((item: any, index: number) => {
      if (index === 0) {
        this.isInit[index] = true
      } else {
        this.isInit[index] = false
      }
    })
  }

  /**
   * tabbar加载后获取大小
   */
  tabBarLoaded (rect: any) {
    this.tabBarHeight = rect.height
  }

  /**
   * 切换tab-bar事件
   */
  onTabChange (index: number) {
    this.current = index
  }

  /**
   * 改变标签事件
   */
  onChange (result: any) {
    const { current } = result.detail
    this.tabIndex = current
    this.current = current
    if (!this.isInit[current]) {
      this.isInit[current] = true
    }
  }
}
</script>

<style lang="scss">
</style>
