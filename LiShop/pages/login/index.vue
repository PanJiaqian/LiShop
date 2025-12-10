<template>
  <view class="login-container">
    <image class="bg-image" src="/static/login_background.jpg" mode="aspectFill" />
    
    <view class="top-bar">
      <text class="brand-title">Light Strip Mall</text>
      <text class="menu-icon">☰</text>
    </view>

    <view class="login-card">
      <view class="input-group">
        <input class="glass-input" type="text" v-model="username" placeholder="账号" placeholder-class="ph-style" />
      </view>
      <view class="input-group">
        <input class="glass-input" type="password" v-model="password" placeholder="密码" placeholder-class="ph-style" />
      </view>
      <button class="login-btn" @tap="login">LOGIN</button>
    </view>
  </view>
</template>

<script>
import { loginAdmin } from '../../api/index.js'
export default {
  data() {
    return { username: '', password: '' }
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
          } catch (e) { }
          // uni.showToast({ title: 'Login Success', icon: 'success' })
          setTimeout(() => {
            uni.switchTab({ url: '/pages/home/index' })
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
  left: 15%; /* Adjust to match the image (left side) */
  transform: translateY(-50%);
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
