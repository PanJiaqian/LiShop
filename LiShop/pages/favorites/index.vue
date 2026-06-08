<template>
  <view class="page">
    <Skeleton :loading="loading" :showTitle="true" />
    <!-- #ifdef H5 -->
      <view class="back-btn" @click="goBack">←</view>
    <!-- #endif -->
    <view v-if="favorites.length" class="grid">
      <view class="item" v-for="(it, i) in favorites" :key="i" :class="{ 'no-permission': it.favorite_status === 2 }" @click="openProduct(it)">
        <view class="no-perm-mask" v-if="it.favorite_status === 2"></view>
        <image class="thumb" :src="it.image" mode="aspectFill" />
        <view class="info">
          <text class="name">{{ it.title }}</text>
          <text class="price">{{ formatPriceWithSymbol(it.price) }}</text>
        </view>
        <view class="no-perm-tag" v-if="it.favorite_status === 2">无货</view>
      </view>
    </view>
    <view v-else-if="!loading" class="empty">暂无收藏</view>
    <LoginPrompt :visible="showLoginModal" @close="closeLoginModal" @confirm="goLogin" />
  </view>
</template>

<script>
/**
 * 收藏页面模块
 * - 仅在登录态下拉取用户收藏列表
 * - 未登录时通过全局事件触发登录提示弹窗
 */
import Skeleton from '@/components/Skeleton.vue'
import LoginPrompt from '@/components/LoginPrompt.vue'
import { getFavorites } from '../../api/index.js'
import { cacheProductPreview } from '@/utils/product-preview.js'
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
            image: img,
            favorite_status: Number(it?.favorite_status) || 1
          }
        })
      }).catch(() => {
        this.favorites = []
      }).finally(() => { this.loading = false })
    } catch (e) { this.loading = false; this.favorites = [] }
  },
  methods: {
    /**
     * 校验当前用户是否仍处于有效登录态。
     * @description
     * 收藏页进入详情前统一做登录校验，避免新标签页打开后再因鉴权失败回退。
     * @returns {boolean} 已登录返回 true，否则返回 false
     * @example
     * if (!this.ensureLoggedIn()) return
     */
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
    /**
     * 打开收藏商品详情页。
     * @description
     * 在打开新标签前缓存收藏卡片的轻量数据，让详情页首屏可立即起屏。
     * @param {string} id 商品 ID
     * @returns {void}
     * @example
     * this.openProduct('1001')
     */
    openProduct(item) {
      if (!this.ensureLoggedIn()) return
      if (item.favorite_status === 2) { uni.showToast({ title: '该商品暂无货', icon: 'none' }); return }
      const id = item.id
      if (!id) return
      const target = (this.favorites || []).find((f) => f.id === id)
      if (target) cacheProductPreview(target)
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
  padding: 20rpx;
  box-sizing: border-box;
  background-color: #1a1a1a;
  /* background: url('/static/product_detail_background.jpg') no-repeat center center; */
  /* background-size: cover; */
  /* background-attachment: fixed; */
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
  color: #ffffff;
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
  background: #2c2c2c;
  border: 1rpx solid #444444;
  border-radius: 12rpx;
  overflow: hidden;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
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
  background: #1a1a1a;
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
  display: flex;
  flex-direction: column;
  gap: 8rpx;
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
  display: block;
  font-size: 28rpx;
  color: #dddddd;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.price {
  display: block;
  font-size: 32rpx;
  color: #e1251b;
  font-weight: bold;
}
/* #ifdef H5 */
.page {
  padding: 120rpx 400rpx;
}
.price {
  color: #ffffff;
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
  color: #ffffff;
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
  color: #777777;
  font-size: 28rpx;
  padding: 60rpx 0;
  background: #2c2c2c;
  border-radius: 12rpx;
  margin-top: 40rpx;
}

.item.no-permission {
  position: relative;
  opacity: 0.7;
}
.no-perm-mask {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  z-index: 2;
  pointer-events: none;
  border-radius: 12rpx;
}
.no-perm-tag {
  position: absolute;
  top: 12rpx;
  right: 12rpx;
  background: rgba(225, 37, 27, 0.9);
  color: #fff;
  font-size: 22rpx;
  padding: 4rpx 12rpx;
  border-radius: 6rpx;
  z-index: 3;
}
</style>
