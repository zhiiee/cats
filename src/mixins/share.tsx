import { Component, Vue } from 'vue-property-decorator'

@Component
export default class Share extends Vue {
  detail: any
  $options: any

  onShareAppMessage () {
    if (this.$options.name === 'Detail') {
      return {
        title: `本喵的名字叫: ${this.detail.name}`,
        imageUrl: this.detail.cover
      }
    } else {
      return {
        title: ' ',
        path: '/pages/index/index'
      }
    }
  }
}
