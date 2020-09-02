import { Component, Vue } from 'vue-property-decorator'

@Component
export default class Share extends Vue {
  onShareAppMessage () {
    console.log('onShareAppMessage')
  }
}
