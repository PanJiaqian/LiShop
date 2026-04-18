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
/**
 * 消息页面模块
 * - 展示本地缓存的消息列表（当前从 storage 读取）
 */
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
  background: #1a1a1a;
}

/* #ifdef MP-WEIXIN */
.page {
  /* background: url('/static/product_detail_background.jpg') no-repeat center center fixed; */
  /* background-size: cover; */
  background-color: #1a1a1a;
}
/* #endif */

.header {
  padding: 32rpx;
  background: #2c2c2c;
  border-bottom: 1px solid #444444;
}

.title {
  font-size: 32rpx;
  font-weight: 700;
  color: #ffffff;
}

.content {
  margin: 24rpx;
  padding: 0;
}

.list {
  background: #2c2c2c;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, .3);
}

.item {
  padding: 24rpx;
  border-bottom: 1px solid #444444;
}

.item:last-child {
  border-bottom: none;
}

.time {
  display: block;
  color: #aaaaaa;
  font-size: 24rpx;
  margin-bottom: 8rpx;
}

.text {
  color: #dddddd;
}

.empty {
  text-align: center;
  color: #777777;
  padding: 48rpx;
  background: #2c2c2c;
  border-radius: 16rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, .3);
}
</style>
