<template>
  <view class="page">
    <Skeleton :loading="loading" :showTitle="true" />
    <!-- #ifdef H5 -->
    <view class="h5-mask">
      <view class="h5-modal">
        <view class="modal-header">
          <text class="modal-title">公告</text>
          <view class="modal-close" @click="goBack">✕</view>
        </view>
        <view v-if="announcement" class="modal-body">
          <view class="modal-body-two">
            <view class="two-left" @click="showAnnContent = true">
              <text class="two-label">公告标题</text>
              <view class="two-title">{{ announcement.title }}</view>
            </view>
            <view class="two-right">
              <view v-if="showAnnContent">
                <text class="a-title">{{ announcement.title }}</text>
                <text class="a-time">{{ displayTime }}</text>
                <view class="a-content">{{ announcement.content }}</view>
              </view>
              <view v-else class="two-hint">点击右侧显示公告内容</view>
            </view>
          </view>
        </view>
        <view v-else class="modal-body empty">
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
      announcement: null,
      showAnnContent: true
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
.h5-mask { position: fixed; left: 0; right: 0; top: 0; bottom: 0; background: rgba(0,0,0,.45); display: flex; align-items: center; justify-content: center; z-index: 9999; }
.h5-modal { width: 820rpx; max-width: 90vw; background: #fff; border-radius: 16rpx; padding: 24rpx; box-shadow: 0 12rpx 28rpx rgba(0, 0, 0, 0.12); display: flex; flex-direction: column; height: 60vh; }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 12rpx; border-bottom: 1rpx solid #f0f0f0; margin-bottom: 16rpx; }
.modal-title { font-size: 32rpx; font-weight: 700; color: #333; }
.modal-close { width: 60rpx; height: 60rpx; display: flex; align-items: center; justify-content: center; font-size: 32rpx; color: #999; cursor: pointer; }
.modal-close:active { color: #333; }
.modal-body { flex: 1; min-height: 0; overflow-y: auto; }
.modal-body-two { display: flex; gap: 16rpx; height: 100%; }
.two-left { width: 280rpx; flex-shrink: 0; padding-right: 16rpx; border-right: 1rpx solid #f0f0f0; display: flex; flex-direction: column; gap: 12rpx; }
.two-left { cursor: pointer; }
.two-label { font-size: 24rpx; color: #999; }
.two-title { font-size: 30rpx; color: #333; font-weight: 600; }
.two-right { flex: 1; min-height: 0; overflow-y: auto; padding-left: 16rpx; }
.two-hint { height: 100%; display: flex; align-items: center; justify-content: center; color: #999; font-size: 26rpx; }
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
