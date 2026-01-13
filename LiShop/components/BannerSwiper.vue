<template>
  <view class="banner">
    <swiper
      class="swiper"
      :indicator-dots="true"
      :autoplay="true"
      :interval="4000"
      :circular="true"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
      @mousedown="onMouseDown"
      @mousemove="onMouseMove"
      @mouseup="onMouseUp"
    >
      <swiper-item v-for="(item, idx) in images" :key="idx" @click="onClick(item)">
        <image class="img" :src="item.image || item" mode="aspectFill" />
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
  data() {
    return {
      dragging: false,
      justEndedSwipe: false,
      startX: 0,
      startY: 0,
      threshold: 8
    }
  },
  methods: {
    getPoint(e) {
      try {
        if (e && e.touches && e.touches[0]) {
          return { x: e.touches[0].clientX || e.touches[0].pageX || 0, y: e.touches[0].clientY || e.touches[0].pageY || 0 }
        }
        if (e && e.changedTouches && e.changedTouches[0]) {
          return { x: e.changedTouches[0].clientX || e.changedTouches[0].pageX || 0, y: e.changedTouches[0].clientY || e.changedTouches[0].pageY || 0 }
        }
        return { x: e?.clientX || e?.pageX || 0, y: e?.clientY || e?.pageY || 0 }
      } catch (err) {
        return { x: 0, y: 0 }
      }
    },
    onTouchStart(e) {
      const p = this.getPoint(e)
      this.startX = p.x
      this.startY = p.y
      this.dragging = false
      this.justEndedSwipe = false
    },
    onTouchMove(e) {
      const p = this.getPoint(e)
      const dx = Math.abs((p.x || 0) - (this.startX || 0))
      const dy = Math.abs((p.y || 0) - (this.startY || 0))
      if (dx > this.threshold || dy > this.threshold) {
        this.dragging = true
      }
    },
    onTouchEnd() {
      if (this.dragging) {
        this.justEndedSwipe = true
        setTimeout(() => { this.justEndedSwipe = false }, 300)
      }
    },
    onMouseDown(e) {
      const p = this.getPoint(e)
      this.startX = p.x
      this.startY = p.y
      this.dragging = false
      this.justEndedSwipe = false
    },
    onMouseMove(e) {
      const p = this.getPoint(e)
      const dx = Math.abs((p.x || 0) - (this.startX || 0))
      const dy = Math.abs((p.y || 0) - (this.startY || 0))
      if (dx > this.threshold || dy > this.threshold) {
        this.dragging = true
      }
    },
    onMouseUp() {
      if (this.dragging) {
        this.justEndedSwipe = true
        setTimeout(() => { this.justEndedSwipe = false }, 300)
      }
    },
    onClick(item) {
      if (this.dragging || this.justEndedSwipe) return
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
