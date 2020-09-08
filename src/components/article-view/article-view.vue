<template>
  <page-main :status="status" :refresherTriggered="refresherTriggered"
    :scrollY="true"
    :refresherEnabled="refresherEnabled"
    @refresherrefresh="onRefresherrefresh"
    @refresherrestore="onRefresherrestore"
    @refresherpulling="onRefresherpulling"
    emtpyMessage="文章在整理中 请改天再来"
  >
    <view class="article-content">
      <jyf-parser :html="article"
        :autoscroll="true" :compress="0"
        :loading-img="''" :use-cache="false"
        :domain="''" :lazy-load="false" :selectable="true"
        :tag-style="''" :show-with-animation="false" :use-anchor="true"/>
    </view>
  </page-main>
</template>

<script lang="ts">
import { Component, Prop, Provide, Watch, Vue } from 'vue-property-decorator'
import PageMain from '@/components/page-main/page-main.vue'
import Parser from '@/plugins/jyf-parser/jyf-parser.vue'
import { Articles } from '@/api'

@Component({
  name: 'ArticleView',
  components: { PageMain, 'jyf-parser': Parser }
})
export default class ArticleView extends Vue {
  @Prop({ type: String })
  code!: string

  // 是否初始化
  @Prop({ type: Boolean, default: false })
  isInit!: boolean

  // 开启下来刷新
  @Prop({ type: Boolean, default: true })
  refresherEnabled!: boolean

  // 下拉刷新状态
  @Provide()
  refresherTriggered = false

  // 状态 0: 加载中 1: 加载失败 2: 加载成功 3: 没数据
  @Provide()
  status = 0

  // 文章
  @Provide()
  article = ''

  // 是否在加载中
  @Provide()
  isLoading = false

  @Watch('isInit')
  async onIsInitChange () {
    this.changeIsInit()
  }

  created () {
    this.changeIsInit()
  }

  changeIsInit () {
    if (this.isInit) {
      setTimeout(async () => {
        await this.loadData()
      }, 300)
    }
  }

  async loadData () {
    if (this.isLoading) {
      return
    }
    this.article = ''
    this.isLoading = true
    const article = await this.getArticle({ code: this.code })
    this.isLoading = false
    if (article !== -1) {
      if (article) {
        this.article = article.content
        this.status = 2
      } else {
        this.status = 3
      }
    } else {
      this.status = 1
    }
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
    await this.loadData()
    this.refresherTriggered = false
  }

  /**
   * 下拉事件结束
   */
  onRefresherrestore () {
    this.refresherTriggered = false
  }

  /**
   * 加载文章
   */
  getArticle (params: any) {
    return Articles.get(params)
  }
}
</script>

<style lang="scss">
.article-content {
  padding: 10rpx 30rpx;
  height: 100%;
  box-sizing: border-box;
}
</style>
