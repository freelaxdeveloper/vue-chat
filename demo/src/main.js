import Vue from 'vue'
import App from './App.vue'
import Chat from './../../dist/index'
import vmodal from 'vue-js-modal'
import VueRouter from 'vue-router'

window.axios = require('axios')

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'
window.axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*'

// window.axios.defaults.baseURL = 'http://chat.loc/api'
window.axios.defaults.baseURL = 'http://api-chat.extrums.cf/api'

window.Echo.connector.pusher.connection.bind('connected', function () {
  window.axios.defaults.headers.common['X-Socket-Id'] = window.Echo.socketId()
})

const token = localStorage.getItem('api_token')
if (token) {
  window.axios.defaults.headers.common['ApiToken'] = token
}

const routes = [{
  path: '/',
  component: App
}
];

const router = new VueRouter
({
  mode: 'history',
  routes
})

Vue.use(VueRouter)
Vue.use(vmodal, { dialog: true })
Vue.use(Chat, {})

// eslint-disable-next-line no-new
new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
