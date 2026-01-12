<template>
  <view class="page">
    <Skeleton :loading="loading" :showTitle="true" />
    <!-- #ifdef H5 -->
    <view class="h5-announcement-bg">
      <view class="h5-topbar">
        <button class="back-btn" @click="goBack">←</button>
      </view>
      <view class="h5-announcement-card">
        <view class="header">
          <text class="title">公告</text>
          <FloatingNav />
        </view>
        <view v-if="announcement" class="card">
          <text class="a-title">{{ announcement.title }}</text>
          <text class="a-time">{{ displayTime }}</text>
          <view class="a-content">{{ announcement.content }}</view>
        </view>
        <view v-else class="empty">
          <text>暂无公告</text>
        </view>
      </view>
    </view>
    <!-- #endif -->
    <!-- #ifndef H5 -->
    <!-- 小程序等端保留原样式 -->
    <image class="page-bg" src="/static/product_detail_background.jpg" mode="aspectFill" />
    <view class="container">
      <view class="header">
        <text class="title">公告</text>
      </view>
      <view v-if="announcement" class="card">
        <text class="a-title">{{ announcement.title }}</text>
        <text class="a-time">{{ displayTime }}</text>
        <view class="a-content">{{ announcement.content }}</view>
      </view>
      <view v-else class="empty">
        <text>暂无公告</text>
      </view>
    </view>
    <!-- #endif -->
  </view>
</template>

<script>
import Skeleton from '@/components/Skeleton.vue'
import FloatingNav from '@/components/FloatingNav.vue'
import { getCurrentAnnouncement } from '../../api/index.js'
export default {
  components: { Skeleton, FloatingNav },
  data() {
    return {
      loading: true,
      announcement: null
    }
  },
  computed: {
    displayTime() {
      try {
        const t = this.announcement?.created_at || this.announcement?.timestamp || ''
        if (!t) return ''
        const d = new Date(t)
        if (isNaN(d.getTime())) return String(t)
        const y = d.getFullYear()
        const m = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        const h = String(d.getHours()).padStart(2, '0')
        const mm = String(d.getMinutes()).padStart(2, '0')
        return `${y}-${m}-${day} ${h}:${mm}`
      } catch (e) { return '' }
    }
  },
  onShow() {
    this.fetch()
  },
  methods: {
    goBack() {
      if (typeof window !== 'undefined' && window.history && window.history.length > 1) { window.history.back(); return }
      if (uni && uni.switchTab) { uni.switchTab({ url: '/pages/home/index' }); return }
      if (uni && uni.navigateTo) { uni.navigateTo({ url: '/pages/home/index' }); return }
    },
    fetch() {
      try {
        const u = uni.getStorageSync('user') || null
        const token = (u && (u.token || (u.data && u.data.token))) || ''
        getCurrentAnnouncement({ token }).then(res => {
          const ok = !!(res && res.success)
          const data = res?.data || null
          if (ok && data) {
            this.announcement = {
              id: data.announcement_id || data.id || '',
              title: data.title || '',
              content: data.content || '',
              created_at: data.created_at || res.timestamp || ''
            }
          } else {
            this.announcement = null
          }
        }).catch(() => { this.announcement = null })
      } catch (e) { this.announcement = null }
      finally { this.loading = false }
    }
  }
}
</script>

<style scoped>
.page { min-height: 100vh; }
.page-bg {
  position: fixed; left: 0; right: 0; top: 0; bottom: 0;
  width: 100vw; height: 100vh; z-index: -1;
}
.h5-announcement-bg {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-image: url('/static/product_detail_background.jpg');
  background-size: cover;
  background-position: center;
  z-index: 0;
  overflow-y: auto;
  padding: 40rpx;
}
.h5-topbar {
  position: fixed;
  top: 0; left: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  height: 100rpx;
  padding: 20rpx;
}
.back-btn {
  height: 60rpx;
  width: 60rpx;
  line-height: 60rpx;
  padding: 0;
  border: none !important;
  border-radius: 0;
  background: transparent !important;
  box-shadow: none !important;
  outline: none;
  color: #000;
  font-size: 44rpx;
}
.back-btn::after { border: none !important; }
.h5-announcement-card {
  max-width: 1000px;
  margin: 0 auto;
  border-radius: 24rpx;
  position: relative;
  z-index: 1;
  background: rgba(255,255,255,0.92);
  padding: 24rpx;
}
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40rpx;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}
.title {
  font-size: 36rpx;
  font-weight: 700;
  color: #000;
}
.card {
  background: #fff;
  border: 1rpx solid #eee;
  border-radius: 12rpx;
  padding: 20rpx;
}
.a-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
  display: block;
}
.a-time {
  font-size: 24rpx;
  color: #999;
  display: block;
  margin-top: 8rpx;
  margin-bottom: 16rpx;
}
.a-content {
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
  white-space: pre-wrap;
}
.empty {
  text-align: center;
  color: #999;
  padding: 40rpx 0;
}
</style>
