<template>
  <view class="container">
  </view>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import Share from '@/mixins/share'

@Component({
  name: 'About'
})
export default class About extends Mixins(Share) {
}
</script>

<style lang="scss">
</style>
