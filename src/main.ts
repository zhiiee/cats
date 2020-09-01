import Vue from 'vue'
import App from '@/App.vue'
import store from '@/store'
import '@/main.scss'

Vue.config.productionTip = false

new App({
  store
}).$mount()
