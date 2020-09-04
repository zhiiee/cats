<template>
  <view class="container">
    <navigation-bar/>
    <swiper :style="{ height: `calc(100vh - ${statusBarHeight}px - ${navigationHeight}px)` }">
      <swiper-item>
        <view></view>
      </swiper-item>
    </swiper>
  </view>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import Share from '@/mixins/share'
import NavigationBar from '@/components/navigation-bar/navigation-bar.vue'

@Component({
  name: 'About',
  components: { NavigationBar }
})
export default class About extends Mixins(Share) {
  get statusBarHeight () {
    return this.$store.state.statusBarHeight
  }

  get navigationHeight () {
    return this.$store.state.navigationHeight
  }
}
</script>

<style lang="scss">
</style>
