<template>
  <view class="page">
    <view class="brand">
      <image class="brand-logo" src="/static/logo.png" mode="aspectFit" />
      <text class="brand-name">LiShop</text>
    </view>
    <view class="form">
      <view class="field">
        <text class="label">账号</text>
        <input class="input" type="text" v-model="username" placeholder="请输入账号" />
      </view>
      <view class="field">
        <text class="label">密码</text>
        <input class="input" type="password" v-model="password" placeholder="请输入密码" />
      </view>
      <button class="btn" @click="login">登录</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return { username: '', password: '' }
  },
  methods: {
    login() {
      if (!this.username || !this.password) {
        uni.showToast({ title: '请输入账号和密码', icon: 'none' })
        return
      }
      const user = { username: this.username, token: 'mock-' + Date.now() }
      try { uni.setStorageSync('user', user) } catch (e) { }
      uni.showToast({ title: '登录成功', icon: 'success' })
      setTimeout(() => {
        if (uni.switchTab) uni.switchTab({ url: '/pages/profile/index' })
        else uni.navigateTo({ url: '/pages/profile/index' })
      }, 300)
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 60rpx 30rpx;
  background: linear-gradient(180deg, #fff4f2 0%, #f7f7f7 40%, #f7f7f7 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.brand {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.brand-logo {
  width: 120rpx;
  height: 120rpx;
  border-radius: 24rpx;
  background: #fff;
  box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, .06);
}

.brand-name {
  margin-top: 12rpx;
  font-size: 36rpx;
  font-weight: 700;
  color: #333;
  letter-spacing: 1rpx;
}

.form {
  width: 640rpx;
  max-width: 90vw;
  margin-top: 30rpx;
  background: #ffffff;
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 12rpx 40rpx rgba(225, 37, 27, .08);
}

.field {
  margin-bottom: 28rpx;
}

.label {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-bottom: 10rpx;
}

.input {
  height: 84rpx;
  line-height: 84rpx;
  background: #fafafa;
  border: 1rpx solid #eee;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
}

.btn {
  margin-top: 6rpx;
  height: 88rpx;
  line-height: 88rpx;
  background: linear-gradient(90deg, #ff6b4b, #e1251b);
  color: #fff;
  border-radius: 12rpx;
  font-weight: 600;
  box-shadow: 0 6rpx 18rpx rgba(225, 37, 27, .25);
}
</style>