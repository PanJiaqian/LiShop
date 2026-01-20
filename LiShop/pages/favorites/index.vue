<template>
  <view class="page">
    <Skeleton :loading="loading" :showTitle="true" />
      <view class="back-btn" @click="goBack">←</view>
    <view v-if="favorites.length" class="grid">
      <view class="item" v-for="(it, i) in favorites" :key="i" @click="openProduct(it.id)">
        <image class="thumb" :src="it.image" mode="aspectFill" />
        <view class="info">
          <text class="name">{{ it.title }}</text>
          <text class="price">{{ formatPriceWithSymbol(it.price) }}</text>
        </view>
      </view>
    </view>
    <view v-else-if="!loading" class="empty">暂无收藏</view>
    <LoginPrompt :visible="showLoginModal" @close="closeLoginModal" @confirm="goLogin" />
  </view>
</template>

<script>
import Skeleton from '@/components/Skeleton.vue'
import LoginPrompt from '@/components/LoginPrompt.vue'
import { getFavorites } from '../../api/index.js'
export default {
  components: { Skeleton, LoginPrompt },
  data() {
    return {
      loading: true,
      favorites: [],
      showLoginModal: false
    }
  },
  onLoad() {
    try {
      const h = () => { this.showLoginModal = true }
      this._globalLoginHandler = h
      uni.$on('global-login-prompt', h)
    } catch (e) {}
  },
  onUnload() {
    try {
      if (this._globalLoginHandler) uni.$off('global-login-prompt', this._globalLoginHandler)
      this._globalLoginHandler = null
    } catch (e) {}
  },
  onShow() {
    try {
      const u = uni.getStorageSync('user') || null
      const token = (u && (u.token || (u.data && u.data.token))) || ''
      if (!token) { this.loading = false; return }
      getFavorites({ token }).then((res) => {
        const raw = Array.isArray(res?.data?.items) ? res.data.items
          : (Array.isArray(res?.items) ? res.items
            : (Array.isArray(res?.data?.children) ? res.data.children
              : (Array.isArray(res?.data?.list) ? res.data.list
                : (Array.isArray(res?.data) ? res.data : []))))
        this.favorites = (raw || []).map((it, i) => {
          const img = (typeof it?.main_image === 'string' ? it.main_image.replace(/`/g, '').trim() : '')
            || (typeof it?.image === 'string' ? it.image.replace(/`/g, '').trim() : '')
            || (typeof it?.thumbnail === 'string' ? it.thumbnail.replace(/`/g, '').trim() : '')
            || '/static/logo.png'
          return {
            id: it?.available_product_id || it?.product_id || it?.id || ('f' + i),
            title: it?.name || it?.title || ('收藏 ' + (i + 1)),
            price: (it?.price === '-' || it?.price === '—') ? '-' : (Number(it?.price ?? 0) || 0),
            image: img
          }
        })
      }).catch(() => {
        this.favorites = []
      }).finally(() => { this.loading = false })
    } catch (e) { this.loading = false; this.favorites = [] }
  },
  methods: {
    ensureLoggedIn() {
      try {
        const u = uni.getStorageSync('user') || null
        const exp = uni.getStorageSync('token_expiration') || 0
        const ok = !!u && (!exp || Date.now() < exp)
        if (ok) return true
        this.showLoginModal = true
        return false
      } catch (e) { return false }
    },
    closeLoginModal() { this.showLoginModal = false },
    goLogin() { this.showLoginModal = false; uni.navigateTo({ url: '/pages/login/index' }) },
    formatPriceWithSymbol(val) {
      try {
        if (val === '-' || val === '—') return '-'
        const n = Number(val)
        if (isNaN(n)) return '-'
        return '¥' + n.toFixed(2)
      } catch (e) { return '-' }
    },
    goBack() {
      try {
        if (typeof window !== 'undefined' && window.history && window.history.length > 1) { window.history.back(); return }
      } catch (e) {}
      if (uni && uni.switchTab) { uni.switchTab({ url: '/pages/home/index' }); return }
      if (uni && uni.navigateTo) { uni.navigateTo({ url: '/pages/home/index' }); return }
      try {
        const base = (typeof location !== 'undefined' && location.href) ? location.href.split('#')[0] : ''
        if (base) location.href = base + '#/pages/home/index'
      } catch (e) {}
    },
    openProduct(id) {
      if (!this.ensureLoggedIn()) return
      if (!id) return
      const url = '/pages/product/index?id=' + encodeURIComponent(id)
      if (typeof window !== 'undefined' && window.open) {
        const base = (typeof location !== 'undefined' && location.href) ? location.href.split('#')[0] : ''
        const full = base ? (base + '#/pages/product/index?id=' + encodeURIComponent(id)) : url
        window.open(full, '_blank')
      } else if (uni && uni.navigateTo) {
        uni.navigateTo({ url })
      }
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 120rpx;
  box-sizing: border-box;
  background: url('/static/product_detail_background.jpg') no-repeat center center;
  background-size: cover;
  background-attachment: fixed;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}
.title {
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
}
.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 20rpx;
}
/* #ifdef H5 */
.header { display: none; }
.grid {
  display: flex;
  flex-direction: column;
}
/* #endif */

.item {
  background: rgba(255, 255, 255, 0.9);
  border: 1rpx solid #eee;
  border-radius: 12rpx;
  overflow: hidden;
  transition: all 0.3s;
}
/* #ifdef H5 */
.item {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 20rpx;
  padding: 20rpx;
}
/* #endif */

.thumb {
  width: 100%;
  height: 300rpx;
  background: #f5f5f5;
}
/* #ifdef H5 */
.thumb {
  width: 200rpx;
  height: 200rpx;
  flex-shrink: 0;
  margin-right: 20rpx;
  border-radius: 8rpx;
}
/* #endif */

.info {
  padding: 16rpx;
}
/* #ifdef H5 */
.info {
  padding: 0;
  flex: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}
/* #endif */

.name {
  display: inline-block;
  font-size: 28rpx;
  color: #333;
  line-height: 1.4;
}
.price {
  display: inline-block;
  font-size: 32rpx;
  color: #000;
  font-weight: bold;
}
/* #ifdef H5 */
.page {
  padding-left: 400rpx;
  padding-right: 400rpx;
}
.h5-topbar {
  display: none;
}
.back-btn {
  position: fixed;
  left: 40rpx;
  top: 40rpx;
  width: 80rpx;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  /* border-radius: 50%; */
  /* background: rgba(255,255,255,0.7); */
  /* box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.12); */
  color: #333;
  font-size: 36rpx;
  z-index: 999;
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
}
.h5-topbar {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  height: 100rpx;
  padding: 20rpx;
}
/* #endif */
.empty {
  text-align: center;
  color: #666;
  font-size: 28rpx;
  padding: 60rpx 0;
  background: rgba(255,255,255,0.8);
  border-radius: 12rpx;
  margin-top: 40rpx;
}
</style>
