<template>
  <view class="banner">
    <swiper class="swiper" :indicator-dots="true" :autoplay="true" :interval="4000" :circular="true">
      <swiper-item v-for="(img, idx) in images" :key="idx">
        <image class="img" :src="img" mode="aspectFill" />
      </swiper-item>
    </swiper>
  </view>
</template>

<script>
export default {
  name: 'BannerSwiper',
  props: {
    images: { type: Array, default: () => ['/static/logo.png', '/static/logo.png'] }
  }
}
</script>

<style scoped>
.banner {
  padding: 0 20rpx;
}

.swiper {
  height: 280rpx;
  border-radius: 16rpx;
  overflow: hidden;
}

.img {
  width: 100%;
  height: 100%;
  display: block;
}
</style>