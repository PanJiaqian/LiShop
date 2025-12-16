<template>
  <view class="page">
    <Skeleton :loading="loading" :showTitle="true" />
    <view class="header">
      <text class="title">设置</text>
    </view>
    <view class="content">
      <text class="tip">功能待配置</text>
    </view>
  </view>
</template>

<script>
import Skeleton from '@/components/Skeleton.vue'
export default {
  components: { Skeleton },
  data() { return { loading: false } },
  onShow() { }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f7f7f7;
}

/* #ifdef MP-WEIXIN */
.page {
  background: url('/static/product_detail_background.jpg') no-repeat center center fixed;
  background-size: cover;
}
/* #endif */

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
  padding: 32rpx;
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, .06);
}

.tip {
  color: #666;
}
</style>
