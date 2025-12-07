<template>
  <view class="banner">
    <swiper class="swiper" :indicator-dots="true" :autoplay="true" :interval="4000" :circular="true">
      <swiper-item v-for="(item, idx) in images" :key="idx" @click="onClick(item)">
        <image class="img" :src="item.image || item" mode="aspectFit" />
      </swiper-item>
    </swiper>
  </view>
</template>

<script>
export default {
  name: 'BannerSwiper',
  props: {
    images: { type: Array, default: () => ['/static/logo.png', '/static/logo.png'] }
  },
  methods: {
    onClick(item) {
      const id = item.id || ''
      if (id) {
        uni.navigateTo({ url: '/pages/product/index?id=' + id })
      }
    }
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
