<template>
  <view class="skeleton-container" v-if="loading">
    <view class="skeleton-header" v-if="showTitle">
      <view class="skeleton-row title-row"></view>
    </view>
    <view class="skeleton-content">
      <view class="skeleton-row" v-for="i in rows" :key="i" :style="{ width: randomWidth() }"></view>
    </view>
    <view class="skeleton-grid" v-if="showGrid">
      <view class="skeleton-grid-item" v-for="j in 4" :key="'g'+j"></view>
    </view>
  </view>
</template>

<script>
/**
 * 骨架屏组件
 * - loading 为 true 时展示占位内容
 * - rows/showTitle/showGrid 控制占位结构，用于页面加载阶段的视觉反馈
 */
export default {
  name: 'Skeleton',
  props: {
    loading: { type: Boolean, default: false },
    rows: { type: Number, default: 4 },
    showTitle: { type: Boolean, default: false },
    showGrid: { type: Boolean, default: false }
  },
  methods: {
    randomWidth() {
      return (50 + Math.random() * 50) + '%'
    }
  }
}
</script>

<style scoped>
.skeleton-container {
  padding: 30rpx;
  background: #fff;
  width: 100%;
  box-sizing: border-box;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 999;
  height: 100%;
}
.skeleton-row {
  height: 32rpx;
  background: #f2f2f2;
  margin-bottom: 24rpx;
  border-radius: 4rpx;
  animation: pulse 1.5s infinite;
}
.title-row {
  height: 48rpx;
  width: 60%;
  margin-bottom: 40rpx;
}
.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  margin-top: 40rpx;
}
.skeleton-grid-item {
  height: 300rpx;
  background: #f2f2f2;
  border-radius: 12rpx;
  animation: pulse 1.5s infinite;
}
@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.6; }
  100% { opacity: 1; }
}
</style>
