import App from './App'

// #ifdef MP-WEIXIN
const toQueryString = (obj = {}) => {
  return Object.keys(obj)
    .filter((key) => obj[key] !== undefined && obj[key] !== null && obj[key] !== '')
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(String(obj[key]))}`)
    .join('&')
}

const getShareLocation = () => {
  const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : []
  const page = pages.length ? pages[pages.length - 1] : null
  const route = page?.route || 'pages/home/index'
  const query = toQueryString(page?.options || {})
  const path = `/${route}${query ? `?${query}` : ''}`
  return { path, query }
}

const shareMixin = {
  onShow() {
    if (typeof uni !== 'undefined' && typeof uni.showShareMenu === 'function') {
      uni.showShareMenu({
        withShareTicket: true,
        menus: ['shareAppMessage', 'shareTimeline']
      })
    }
  },
  onShareAppMessage() {
    const { path } = getShareLocation()
    return { title: '诺米', path, imageUrl: '/static/logo.png' }
  },
  onShareTimeline() {
    const { query } = getShareLocation()
    return { title: '诺米', query, imageUrl: '/static/logo.png' }
  }
}
// #endif

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
App.mpType = 'app'
// #ifdef MP-WEIXIN
Vue.mixin(shareMixin)
// #endif
const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  // #ifdef MP-WEIXIN
  app.mixin(shareMixin)
  // #endif
  return {
    app
  }
}
// #endif
