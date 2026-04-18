/**
 * 应用入口模块
 * - 负责创建应用实例（兼容 Vue2 / Vue3 条件编译）
 * - 小程序端注入分享能力：配置分享标题/路径/封面，并在页面生命周期中统一启用分享菜单
 */
import App from './App'

// #ifdef MP-WEIXIN
const SHARE_TITLE = '诺米灯光定制'
const SHARE_PATH = '/pages/home/index'
const SHARE_QUERY = ''
const FALLBACK_SHARE_IMAGE_URL = '/static/logo.png'
const SHARE_IMAGE_STORAGE_KEY = 'share_image_url'
const FLOATING_BALL_STORAGE_KEY = 'floatingBallPos'

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
  onLoad() {
    try {
      const app = typeof getApp === 'function' ? getApp() : null
      if (!app || !app.globalData) return
      const cached = (typeof wx !== 'undefined' && typeof wx.getStorageSync === 'function')
        ? (wx.getStorageSync(FLOATING_BALL_STORAGE_KEY) || null)
        : ((typeof uni !== 'undefined' && typeof uni.getStorageSync === 'function') ? (uni.getStorageSync(FLOATING_BALL_STORAGE_KEY) || null) : null)
      if (cached && cached.x !== undefined && cached.y !== undefined) app.globalData.floatingBallPos = { x: cached.x, y: cached.y }
    } catch (e) {}
  },
  onShow() {
    if (typeof uni !== 'undefined' && typeof uni.showShareMenu === 'function') {
      uni.showShareMenu({
        withShareTicket: true,
        menus: ['shareAppMessage', 'shareTimeline']
      })
    }
  },
  onHide() {
    try {
      const app = typeof getApp === 'function' ? getApp() : null
      const gd = app && app.globalData ? app.globalData : null
      const pos = gd && gd.floatingBallPos ? gd.floatingBallPos : null
      if (!pos || pos.x === undefined || pos.y === undefined) return
      if (typeof wx !== 'undefined' && typeof wx.setStorageSync === 'function') wx.setStorageSync(FLOATING_BALL_STORAGE_KEY, { x: pos.x, y: pos.y })
      else if (typeof uni !== 'undefined' && typeof uni.setStorageSync === 'function') uni.setStorageSync(FLOATING_BALL_STORAGE_KEY, { x: pos.x, y: pos.y })
    } catch (e) {}
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
