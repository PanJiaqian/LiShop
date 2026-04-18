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
      <image src="/static/logo.png" style="width:300rpx;height:300rpx;display:block;margin:0 auto;max-width:180px;" mode="aspectFit" />
      <!-- #endif -->
      <!-- #ifndef MP-WEIXIN -->
      <image src="/static/logo.png" style="width:300rpx;height:300rpx;display:block;margin:0 auto;max-width:180px;" mode="aspectFit" />
      <!-- #endif -->
      <view class="input-group">
        <input class="glass-input" type="text" v-model="username" placeholder="账号" placeholder-class="ph-style" />
      </view>
      <view class="input-group">
        <input class="glass-input" type="password" v-model="password" placeholder="密码" placeholder-class="ph-style" />
      </view>
      <view class="agreement-row">
        <view class="agree-box" :class="{ checked: agree }" @click="toggleAgree"></view>
        <text class="agreement-text">我已阅读并同意</text>
        <text class="agreement-link" @click="openAgreement('service')">《用户服务协议》</text>
        <text class="agreement-text">和</text>
        <text class="agreement-link" @click="openAgreement('privacy')">《隐私协议》</text>
      </view>
      <button class="login-btn" :class="{ disabled: !agree }" :disabled="!agree" @tap="login">登录</button>
    </view>
  </view>
</template>

<script>
/**
 * 登录页面模块
 * - 提供账号密码登录，并在成功后写入本地缓存的 user/token_expiration
 * - 已登录且未过期时自动跳转回首页
 */
import Skeleton from '@/components/Skeleton.vue'
import { loginAdmin } from '../../api/index.js'
export default {
  components: { Skeleton },
  data() {
    return { username: '', password: '', loading: true, agree: false }
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
    toggleAgree() {
      this.agree = !this.agree
    },
    openAgreement(type) {
      const map = {
        service: '/pages/agreement/service',
        privacy: '/pages/agreement/privacy'
      }
      const url = map[type] || map.service
      if (uni && uni.navigateTo) { uni.navigateTo({ url }); return }
      try {
        const base = (typeof location !== 'undefined' && location.href) ? location.href.split('#')[0] : ''
        if (base) location.href = base + '#' + url
      } catch (e) {}
    },
    login() {
      if (!this.username || !this.password) {
        uni.showToast({ title: 'Please enter username and password', icon: 'none' })
        return
      }
      if (!this.agree) {
        uni.showToast({ title: '请先阅读并同意协议', icon: 'none' })
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
  background-color: #1a1a1a;
}

.bg-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  opacity: 0.4; /* Darken the background image */
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
  color: #ffffff;
  font-family: sans-serif;
}

.menu-icon {
  font-size: 48rpx;
  color: #ffffff;
}

.login-card {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600rpx;
  padding: 60rpx 40rpx;
  background: rgba(44, 44, 44, 0.8); /* Dark Glassmorphism */
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 30rpx;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.3);
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
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16rpx;
  padding: 0 30rpx;
  font-size: 32rpx;
  color: #ffffff;
  box-sizing: border-box;
}

.ph-style {
  color: #999999;
}

.agreement-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6rpx;
  font-size: 24rpx;
  color: #aaaaaa;
}
.agree-box {
  width: 26rpx;
  height: 26rpx;
  border-radius: 6rpx;
  border: 2rpx solid #666666;
  box-sizing: border-box;
  position: relative;
}
.agree-box.checked {
  background: #e1251b;
  border-color: #e1251b;
}
.agree-box.checked::after {
  content: '';
  position: absolute;
  left: 7rpx;
  top: 2rpx;
  width: 6rpx;
  height: 12rpx;
  border: 2rpx solid #ffffff;
  border-top: none;
  border-left: none;
  transform: rotate(45deg);
}
.agreement-text {
  color: #aaaaaa;
}
.agreement-link {
  color: #5aa7ff;
}

.login-btn {
  width: 100%;
  height: 100rpx;
  line-height: 100rpx;
  background: #e1251b;
  color: #fff;
  font-size: 36rpx;
  font-weight: bold;
  border-radius: 16rpx;
  margin-top: 20rpx;
  letter-spacing: 2rpx;
}
.login-btn.disabled {
  background: #666666;
  color: #cccccc;
  pointer-events: none;
}

.login-btn:active {
  opacity: 0.9;
  transform: scale(0.98);
}
</style>
