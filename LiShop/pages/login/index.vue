<template>
  <view class="login-container">
    <Skeleton :loading="loading" />
    <!-- #ifdef MP-WEIXIN -->
    <image class="bg-image" src="/static/product_detail_background.jpg" mode="aspectFill" />
    <!-- #endif -->
    <!-- #ifndef MP-WEIXIN -->
    <image class="bg-image" src="/static/login_background.jpg" mode="aspectFill" />
    <!-- #endif -->
    
    

    <view class="login-card">
      <!-- #ifdef MP-WEIXIN -->
      <image src="/static/logo.png" style="width:200rpx;height:200rpx;display:block;margin:0 auto;" mode="aspectFit" />
      <!-- #endif -->
      <!-- #ifndef MP-WEIXIN -->
      <image src="/static/logo.png?v=20251211" style="width:200rpx;height:200rpx;display:block;margin:0 auto;" mode="aspectFit" />
      <!-- #endif -->
      <view class="input-group">
        <input class="glass-input" type="text" v-model="username" placeholder="账号" placeholder-class="ph-style" />
      </view>
      <view class="input-group">
        <input class="glass-input" type="password" v-model="password" placeholder="密码" placeholder-class="ph-style" />
      </view>
      <button class="login-btn" @tap="login">登录</button>
    </view>
  </view>
</template>

<script>
import Skeleton from '@/components/Skeleton.vue'
import { loginAdmin } from '../../api/index.js'
export default {
  components: { Skeleton },
  data() {
    return { username: '', password: '', loading: true }
  },
  onShow() {
    try {
      const u = uni.getStorageSync('user') || null
      const exp = uni.getStorageSync('token_expiration') || 0
      const valid = !!u && (!exp || Date.now() < exp)
      if (valid) {
        if (uni && uni.switchTab) { uni.switchTab({ url: '/pages/home/index' }); return }
        if (uni && uni.navigateTo) { uni.navigateTo({ url: '/pages/home/index' }); return }
      }
    } catch (e) {}
    this.loading = false
  },
  methods: {
    login() {
      if (!this.username || !this.password) {
        uni.showToast({ title: 'Please enter username and password', icon: 'none' })
        return
      }
      const payload = { phone: this.username, password: this.password }
      uni.showLoading({ title: 'Logging in...', mask: true })
      loginAdmin(payload)
        .then((dataRaw) => {
          let data = dataRaw
          if (typeof data === 'string') { try { data = JSON.parse(data) } catch (e) {} }
          const user = { username: this.username, ...(data || {}) }
          try {
            uni.setStorageSync('user', user)
            uni.setStorageSync('token_expiration', Date.now() + 4 * 24 * 60 * 60 * 1000)
            uni.setStorageSync('just_logged_in', true)
          } catch (e) { }
          // uni.showToast({ title: 'Login Success', icon: 'success' })
          setTimeout(() => {
            try {
              if (uni && uni.switchTab) { uni.switchTab({ url: '/pages/home/index' }); return }
              if (uni && uni.reLaunch) { uni.reLaunch({ url: '/pages/home/index' }); return }
              if (uni && uni.navigateTo) { uni.navigateTo({ url: '/pages/home/index' }); return }
            } catch (e) {
              try { uni.navigateTo({ url: '/pages/home/index' }) } catch (e2) {}
            }
          }, 300)
        })
        .catch((err) => {
          console.error('login error', err)
          uni.showToast({ title: '账号或密码错误', icon: 'none' })
        })
        .finally(() => { try { uni.hideLoading() } catch (e) {} })
    }
  }
}
</script>

<style scoped>
.login-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.bg-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.top-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 40rpx 60rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 10;
  box-sizing: border-box;
}

.brand-title {
  font-size: 48rpx;
  font-weight: bold;
  color: #000;
  font-family: sans-serif;
}

.menu-icon {
  font-size: 48rpx;
  color: #000;
}

.login-card {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600rpx;
  padding: 60rpx 40rpx;
  background: rgba(255, 255, 255, 0.2); /* Glassmorphism */
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 30rpx;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 40rpx;
}

/* #ifdef H5 */
.login-card { left: 30%; }
/* #endif */

.input-group {
  width: 100%;
}

.glass-input {
  width: 100%;
  height: 100rpx;
  background: rgba(255, 255, 255, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 16rpx;
  padding: 0 30rpx;
  font-size: 32rpx;
  color: #333;
  box-sizing: border-box;
}

.ph-style {
  color: #666;
}

.login-btn {
  width: 100%;
  height: 100rpx;
  line-height: 100rpx;
  background: #000;
  color: #fff;
  font-size: 36rpx;
  font-weight: bold;
  border-radius: 16rpx;
  margin-top: 20rpx;
  letter-spacing: 2rpx;
}

.login-btn:active {
  opacity: 0.9;
  transform: scale(0.98);
}
</style>
