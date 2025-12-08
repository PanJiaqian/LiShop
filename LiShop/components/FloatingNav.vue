<template>
  <view class="float" :style="styleFix">
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
export default {
  name: 'FloatingNav',
  props: {
    bottomSafe: { type: Number, default: 120 } // 与 tabBar 避让距离（rpx）
  },
  data() {
    return { cartCount: 0 }
  },
  computed: {
    styleFix() {
      return `bottom:${this.bottomSafe}rpx;`
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
    toTop() { uni.pageScrollTo({ scrollTop: 0, duration: 300 }) }
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

.item {
  position: relative;
  width: 90rpx;
  height: 90rpx;
  overflow: visible !important;
  border-radius: 12rpx;
  background: #ffffff;
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
  color: #666;
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
  background: #fffbf2;
}
</style>