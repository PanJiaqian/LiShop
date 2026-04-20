<template>
  <view class="page">
    <view class="header">
      <text class="title">我的优惠券</text>
    </view>
    
    <view class="list" v-if="coupons.length > 0">
      <view class="coupon-item" v-for="c in coupons" :key="c.record_id" :class="{ 'used': c.status !== 1 }">
        <view class="coupon-left">
          <text class="price">
            <text style="font-size:24rpx;">¥</text>
            {{ c.balance }}
          </text>
          <text class="condition" v-if="c.rule && c.rule.min_order_amount > 0">满{{ c.rule.min_order_amount }}元可用</text>
          <text class="condition" v-else>无门槛</text>
        </view>
        <view class="coupon-right">
          <view class="coupon-title">{{ c.name }}</view>
          <view class="coupon-time">
            {{ formatDate(c.valid_start_time) }} 至 {{ formatDate(c.valid_end_time) }}
          </view>
          <image v-if="c.status === 2" class="status-stamp" src="/static/logo.png" /> <!-- 暂时用logo替代印章 -->
          <text v-if="c.status === 2" class="status-text">已用完</text>
          <text v-else-if="c.status === 3" class="status-text">已过期</text>
        </view>
      </view>
    </view>
    
    <view class="empty" v-else>
      <text>暂无优惠券</text>
    </view>
  </view>
</template>

<script>
import { getUserCoupons } from '../../api/index.js'

export default {
  data() {
    return {
      coupons: []
    }
  },
  onShow() {
    this.fetchCoupons()
  },
  methods: {
    formatDate(iso) {
      if (!iso) return '-'
      const d = new Date(iso)
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    },
    fetchCoupons() {
      let token = ''
      try {
        const u = uni.getStorageSync('user') || null
        token = (u && (u.token || (u.data && u.data.token))) || ''
      } catch (e) {}
      if (!token) {
        uni.navigateTo({ url: '/pages/login/index' })
        return
      }
      
      getUserCoupons({ token }).then(res => {
        if (res && res.success && res.data && res.data.items) {
          this.coupons = res.data.items
        }
      }).catch(err => {
        uni.showToast({ title: '获取优惠券失败', icon: 'none' })
      })
    }
  }
}
</script>

<style>
.page {
  min-height: 100vh;
  background-color: #1a1a1a;
  padding: 20rpx;
  box-sizing: border-box;
}
.header {
  margin-bottom: 30rpx;
}
.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
}
.list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}
.coupon-item {
  display: flex;
  background: linear-gradient(135deg, #2a2a2a, #333);
  border-radius: 16rpx;
  overflow: hidden;
  position: relative;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.3);
}
.coupon-item.used {
  filter: grayscale(100%);
  opacity: 0.7;
}
.coupon-left {
  width: 200rpx;
  background: rgba(255, 77, 79, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20rpx;
  border-right: 2rpx dashed #555;
}
.price {
  color: #ff4d4f;
  font-size: 48rpx;
  font-weight: bold;
  margin-bottom: 8rpx;
}
.condition {
  font-size: 20rpx;
  color: #aaa;
}
.coupon-right {
  flex: 1;
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
}
.coupon-title {
  color: #fff;
  font-size: 28rpx;
  font-weight: bold;
  margin-bottom: 12rpx;
}
.coupon-time {
  color: #888;
  font-size: 20rpx;
}
.status-text {
  position: absolute;
  right: 20rpx;
  top: 50%;
  transform: translateY(-50%);
  font-size: 24rpx;
  color: #ff4d4f;
  border: 1rpx solid #ff4d4f;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  transform: translateY(-50%) rotate(-15deg);
}
.empty {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400rpx;
  color: #888;
  font-size: 28rpx;
}
</style>
