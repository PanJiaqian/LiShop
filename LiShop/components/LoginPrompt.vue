<template>
  <view v-if="visible" class="login-mask" :class="{ mp: isMp }" @click="$emit('close')">
    <view class="login-modal" :class="{ mp: isMp }" @click.stop>
      <view class="login-title">{{ title }}</view>
      <view class="login-desc">{{ desc }}</view>
      <view class="login-actions">
        <view class="btn-pill cancel" :class="{ mp: isMp }" @click="$emit('close')">{{ cancelText }}</view>
        <view class="btn-pill confirm" :class="{ mp: isMp }" @click="$emit('confirm')">{{ confirmText }}</view>
      </view>
    </view>
  </view>
  </template>
  
  <script>
  export default {
    name: 'LoginPrompt',
    props: {
      visible: { type: Boolean, default: false },
      title: { type: String, default: '提示' },
      desc: { type: String, default: '点击前往登录的话就跳转到登录页面' },
      cancelText: { type: String, default: '取消' },
      confirmText: { type: String, default: '立即登录' }
    },
    computed: {
      isMp() {
        try { return typeof window === 'undefined' } catch (e) { return true }
      }
    }
  }
  </script>
  
  <style scoped>
  .login-mask {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
  }
  .login-mask.mp {
    background: rgba(0,0,0,0.6);
  }
  .login-modal {
    width: 640rpx;
    max-width: 90vw;
    background: #fff;
    border-radius: 32rpx;
    padding: 76rpx 44rpx;
    box-shadow: 0 28rpx 64rpx rgba(0,0,0,0.16);
    display: flex;
    flex-direction: column;
    gap: 52rpx;
  }
  .login-modal.mp {
    width: 600rpx;
    border-radius: 36rpx;
    padding: 84rpx 48rpx;
    box-shadow: 0 32rpx 72rpx rgba(0,0,0,0.18);
  }
  .login-title {
    font-size: 36rpx;
    font-weight: 800;
    color: #111;
    text-align: center;
  }
  .login-desc {
    font-size: 30rpx;
    color: #5f5f5f;
    text-align: center;
  }
  .login-actions {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 24rpx;
  }
  .btn-pill {
    min-width: 220rpx;
    height: 80rpx;
    line-height: 80rpx;
    padding: 0 44rpx;
    border-radius: 999rpx;
    text-align: center;
    font-size: 30rpx;
    font-weight: 700;
  }
  .btn-pill.confirm {
    background: #2F80ED;
    color: #fff;
    box-shadow: 0 10rpx 24rpx rgba(47,128,237,0.3);
  }
  .btn-pill.cancel {
    background: #fff;
    color: #999;
    border: 2rpx solid #e5e5e5;
  }
  .btn-pill.mp {
    min-width: 200rpx;
    height: 84rpx;
    line-height: 84rpx;
    font-size: 32rpx;
  }
  </style>
