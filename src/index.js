import Launcher from './Launcher.vue'
import VTooltip from 'v-tooltip'

import Echo from 'laravel-echo'

window.Pusher = require('pusher-js')

window.Echo = new Echo({
  broadcaster: 'pusher',
  key: '634532234',
  cluster: 'mt1',
  // wsHost: 'chat.loc',
  wsHost: 'api-chat.extrums.cf',
  // authEndpoint: 'http://chat.loc/broadcasting/auth',
  // auth: {
  //   headers: {
  //     Authorization: 'Bearer ' + 'ololo'
  //   }
  // },
  wsPort: 6001
})

const defaultComponentName = 'beautiful-chat'

const Plugin = {
  install (Vue, options = {}) {
    /**
     * Makes sure that plugin can be installed only once
     */
    if (this.installed) {
      return
    }

    this.installed = true
    this.event = new Vue()
    this.dynamicContainer = null
    this.componentName = options.componentName || defaultComponentName
    /**
     * Plugin API
     */
    Vue.prototype.$chat = {
      _setDynamicContainer (dynamicContainer) {
        Plugin.dynamicContainer = dynamicContainer
      }
    }
    /**
     * Sets custom component name (if provided)
     */
    Vue.component(this.componentName, Launcher)
    Vue.use(VTooltip)
  }
}

export default Plugin
