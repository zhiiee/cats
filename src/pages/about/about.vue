<template>
  <view class="container">
    <navigation-bar/>
    <swiper :style="{ height: `calc(100vh - ${statusBarHeight}px - ${navigationHeight}px)` }">
      <swiper-item>
        <article-view :code="'about'" :isInit="true"/>
      </swiper-item>
    </swiper>
  </view>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import Share from '@/mixins/share'
import NavigationBar from '@/components/navigation-bar/navigation-bar.vue'
import ArticleView from '@/components/article-view/article-view.vue'

@Component({
  name: 'About',
  components: { NavigationBar, ArticleView }
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
