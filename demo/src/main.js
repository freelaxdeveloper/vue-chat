import Vue from 'vue'
import App from './App.vue'
import Chat from './../../dist/index'
import vmodal from 'vue-js-modal'

window.axios = require('axios')

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'
window.axios.defaults.baseURL = 'http://chat.loc/api'

const token = localStorage.getItem('api_token')
if (token) {
  window.axios.defaults.headers.common['ApiToken'] = token
}

Vue.use(vmodal, { dialog: true })
Vue.use(Chat, {})

// eslint-disable-next-line no-new
new Vue({
  el: '#app',
  render: h => h(App)
})
