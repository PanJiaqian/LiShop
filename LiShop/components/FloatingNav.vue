<template>
  <view class="float" v-if="globalShow" :style="styleFix" :class="{ 'hover-reveal': hoverReveal }">
    <view class="item" @click="goHome">
      <text class="ico">🏠</text>
      <text class="txt">首页</text>
    </view>
    <view class="item" @click="goCart">
      <text class="ico">🛒</text>
      <text class="txt">购物车</text>
      <!-- <view v-if="cartCount > 0" class="badge">{{ cartCount }}</view> -->
    </view>
    <view class="item" @click="contact">
      <text class="ico">💬</text>
      <text class="txt">客服</text>
    </view>
    <view class="item to-top" @click="toTop">
      <text class="ico">⬆️</text>
      <text class="txt">顶部</text>
    </view>
  </view>
</template>

<script>
/**
 * 悬浮快捷导航组件
 * - 提供“首页/购物车/客服/回到顶部”等常用入口
 * - 根据运行端与全局开关决定是否显示（H5 默认显示）
 */
export default {
  name: 'FloatingNav',
  props: {
    bottomSafe: { type: Number, default: 120 },
    hoverReveal: { type: Boolean, default: false }
  },
  data() {
    return { cartCount: 0 }
  },
  computed: {
    styleFix() {
      return `bottom:${this.bottomSafe}rpx;`
    }
    ,
    globalShow() {
      // #ifdef H5
      return true
      // #endif
      try {
        const app = typeof getApp === 'function' ? getApp() : null
        const gd = app && app.globalData ? app.globalData : null
        if (gd && gd.showFloatingNav === false) return false
        return true
      } catch (e) {
        return true
      }
    }
  },
  mounted() {
    this.loadCart()
  },
  methods: {
    loadCart() {
      try { const c = uni.getStorageSync('cart') || []; this.cartCount = c.reduce((s, it) => s + (it.quantity || 1), 0) } catch (e) { }
    },
    goHome() { uni.switchTab ? uni.switchTab({ url: '/pages/home/index' }) : uni.navigateTo({ url: '/pages/home/index' }) },
    goCart() { uni.switchTab ? uni.switchTab({ url: '/pages/cart/index' }) : uni.navigateTo({ url: '/pages/cart/index' }) },
    contact() { uni.showToast({ title: '客服暂未接入', icon: 'none' }) },
    toTop() {
      // #ifdef H5
      try {
        const main = typeof document !== 'undefined' ? document.querySelector('.main') : null
        if (main && typeof main.scrollTo === 'function') { main.scrollTo({ top: 0, behavior: 'smooth' }); return }
        if (main) { main.scrollTop = 0; return }
      } catch (err) {}
      try { if (typeof window !== 'undefined' && window && typeof window.scrollTo === 'function') { window.scrollTo({ top: 0, behavior: 'smooth' }) } } catch (e) {}
      // #endif
      uni.pageScrollTo({ scrollTop: 0, duration: 300 })
    }
  }
}
</script>

<style scoped>
.float {
  position: fixed;
  right: 20rpx;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  overflow: visible !important;
}

.float.hover-reveal {
  opacity: 0.2;
  transition: opacity .2s ease, transform .2s ease;
  transform: translateX(16rpx);
}

.float.hover-reveal:hover {
  opacity: 1;
  transform: translateX(0);
}

.item {
  position: relative;
  width: 90rpx;
  height: 90rpx;
  overflow: visible !important;
  border-radius: 12rpx;
  background: #2c2c2c;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, .08);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.ico {
  font-size: 36rpx;
  line-height: 1;
}

.txt {
  font-size: 22rpx;
  color: #fff;
  margin-top: 6rpx;
}

.badge {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  z-index: 10000;
  min-width: 36rpx;
  height: 36rpx;
  padding: 0 8rpx;
  border-radius: 36rpx;
  background: #e1251b;
  color: #fff;
  font-size: 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.to-top {
  background: #3a3a2a;
}
</style>
