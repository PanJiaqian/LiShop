<template>
  <view class="page">
    <view class="header">
      <image class="avatar" src="/static/logo.png" />
      <view class="user">
        <text class="name">{{ loggedIn ? displayName : '未登录' }}</text>
        <button v-if="!loggedIn" size="mini" class="login" @click="login">登录</button>
      </view>
    </view>

    <view class="menu">
      <navigator url="/pages/profile/index" class="menu-item">
        <text>我的订单</text>
        <text class="arrow">›</text>
      </navigator>
      <navigator url="/pages/cart/index" class="menu-item">
        <text>我的购物车</text>
        <text class="arrow">›</text>
      </navigator>
      <view class="menu-item">
        <text>收货地址</text>
        <text class="arrow">›</text>
      </view>
    </view>
    <!-- #ifdef H5 -->
    <FloatingNav />
    <!-- #endif -->
  </view>
</template>

<script>
import FloatingNav from '@/components/FloatingNav.vue'
export default {
  components: { FloatingNav },
  data() { return { loggedIn: false, displayName: '' } },
  onShow() {
    // #ifdef H5
    try { uni.hideTabBar({ animation: false }) } catch (e) { }
    // #endif
    try {
      const u = uni.getStorageSync('user') || null
      this.loggedIn = !!u
      this.displayName = u?.username || ''
    } catch (e) { }
  },
  methods: {
    login() {
      uni.navigateTo({ url: '/pages/login/index' })
    }
  }
}
</script>

<style scoped>
.page {
  background: linear-gradient(180deg, #fff4f2 0%, #f7f7f7 45%, #f7f7f7 100%);
  min-height: 100vh;
  padding-bottom: 40rpx;
}

.header {
  display: flex;
  align-items: center;
  padding: 40rpx 24rpx;
  background: #fff;
  border-radius: 0 0 24rpx 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, .06);
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: #f0f0f0;
}

.user {
  margin-left: 20rpx;
}

.name {
  font-size: 34rpx;
  display: block;
  font-weight: 600;
}

.login {
  margin-top: 10rpx;
  height: 60rpx;
  line-height: 60rpx;
  background: linear-gradient(90deg, #ff6b4b, #e1251b);
  color: #fff;
  border-radius: 12rpx;
  padding: 0 24rpx;
  box-shadow: 0 6rpx 16rpx rgba(225, 37, 27, .25);
}

.menu {
  margin: 24rpx;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, .06);
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 24rpx;
  border-bottom: 1px solid #f0f0f0;
}

.arrow {
  color: #a0a0a0;
}
</style>