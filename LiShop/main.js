import App from './App'

// #ifdef MP-WEIXIN
const SHARE_TITLE = '诺米灯光定制'
const SHARE_PATH = '/pages/home/index'
const SHARE_QUERY = ''
const FALLBACK_SHARE_IMAGE_URL = '/static/logo.png'
const SHARE_IMAGE_STORAGE_KEY = 'share_image_url'

const cleanUrl = (u) => (typeof u === 'string' ? u.replace(/`/g, '').trim() : '')

const getShareImageUrl = () => {
  try {
    const cached = uni.getStorageSync(SHARE_IMAGE_STORAGE_KEY)
    if (cached) return cached
  } catch (e) {}
  return FALLBACK_SHARE_IMAGE_URL
}

try {
  if (typeof uni !== 'undefined' && typeof uni.request === 'function') {
    uni.request({
      url: 'https://www.nuomi-light.com:6149/api/carousel',
      method: 'GET',
      success: (res) => {
        try {
          let existing = ''
          try { existing = uni.getStorageSync(SHARE_IMAGE_STORAGE_KEY) || '' } catch (e) { existing = '' }
          const hasLocalPoster = typeof existing === 'string' && (existing.startsWith('wxfile://') || existing.startsWith('file://'))
          if (hasLocalPoster) return
          let data = res?.data
          if (typeof data === 'string') { try { data = JSON.parse(data) } catch (e) {} }
          const items = Array.isArray(data?.data?.items) ? data.data.items : (Array.isArray(data?.items) ? data.items : [])
          const first = items && items.length ? items[0] : null
          const img = cleanUrl(first?.image || first?.thumbnail || first?.url || '')
          if (img) {
            try { uni.setStorageSync(SHARE_IMAGE_STORAGE_KEY, img) } catch (e) {}
          }
        } catch (e) {}
      }
    })
  }
} catch (e) {}

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
    return { title: SHARE_TITLE, path: SHARE_PATH, imageUrl: getShareImageUrl() }
  },
  onShareTimeline() {
    return { title: SHARE_TITLE, query: SHARE_QUERY, imageUrl: getShareImageUrl() }
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
