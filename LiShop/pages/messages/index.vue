<template>
  <view class="page">
    <Skeleton :loading="loading" :showTitle="true" />
    <view class="header">
      <text class="title">消息</text>
    </view>
    <view class="content">
      <view v-if="messages && messages.length" class="list">
        <view v-for="(m, i) in messages" :key="i" class="item">
          <text class="time">{{ m.time }}</text>
          <text class="text">{{ m.text }}</text>
        </view>
      </view>
      <view v-else class="empty">暂无消息</view>
    </view>
  </view>
</template>

<script>
import Skeleton from '@/components/Skeleton.vue'
export default {
  components: { Skeleton },
  data() { return { messages: [], loading: true } },
  onShow() {
    try { this.messages = uni.getStorageSync('messages') || [] } catch (e) { this.messages = [] }
    this.loading = false
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f7f7f7;
}

.header {
  padding: 32rpx;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
}

.title {
  font-size: 32rpx;
  font-weight: 700;
}

.content {
  margin: 24rpx;
  padding: 0;
}

.list {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, .06);
}

.item {
  padding: 24rpx;
  border-bottom: 1px solid #f0f0f0;
}

.item:last-child {
  border-bottom: none;
}

.time {
  display: block;
  color: #999;
  font-size: 24rpx;
  margin-bottom: 8rpx;
}

.text {
  color: #333;
}

.empty {
  text-align: center;
  color: #999;
  padding: 48rpx;
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, .06);
}
</style>
