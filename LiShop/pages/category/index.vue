<template>
  <view class="page">
    <view class="container">
      <scroll-view class="left" scroll-y>
        <view v-for="(c, idx) in categories" :key="idx" :class="['left-item', activeIndex === idx ? 'active' : '']"
          @click="activeIndex = idx">
          <text>{{ c.name }}</text>
        </view>
      </scroll-view>
      <scroll-view class="right" scroll-y>
        <view class="right-wrap">
          <view class="sub-title">{{ activeCategory.name }}</view>
          <view class="sub-grid">
            <view class="sub-item" v-for="(s, i) in activeCategory.children" :key="i" @click="openList(s)">
              <image class="sub-icon" :src="s.icon || '/static/logo.png'" mode="aspectFill" />
              <text class="sub-name">{{ s.name }}</text>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>
    <!-- #ifdef H5 -->
    <FloatingNav />
    <!-- #endif -->
  </view>
</template>

<script>
import FloatingNav from '@/components/FloatingNav.vue'
export default {
  components: { FloatingNav },
  data() {
    return {
      activeIndex: 0,
      categories: [
        {
          name: '灯光',
          children: [
            { name: '嵌入式灯光' },
            { name: '后口层板灯' },
            { name: '玻璃层板灯' },
            { name: '明装层板灯' },
            { name: '电源' },
            { name: '开关' },
            { name: '配件' }
          ]
        }
      ]
    }
  },
  computed: {
    activeCategory() { return this.categories[this.activeIndex] || { name: '', children: [] } }
  },
  onShow() {
    // #ifdef H5
    try { uni.hideTabBar({ animation: false }) } catch (e) { }
    // #endif
  },
  onLoad(query) {
    const q = decodeURIComponent(query?.active || '')
    const idx = this.categories.findIndex(c => c.name === q)
    if (idx >= 0) this.activeIndex = idx
  },
  methods: {
    openList(sub) {
      uni.showToast({ title: sub.name, icon: 'none' })
    }
  }
}
</script>

<style scoped>
.page {
  background: #f7f7f7;
  min-height: 100vh;
}

.container {
  display: flex;
  height: calc(100vh - 88rpx);
}

.left {
  width: 220rpx;
  background: #f5f5f5;
}

.left-item {
  padding: 24rpx;
  border-left: 6rpx solid transparent;
}

.left-item.active {
  background: #fff;
  border-left-color: #e1251b;
  font-weight: 600;
}

.right {
  flex: 1;
  background: #fff;
}

.right-wrap {
  padding: 20rpx;
}

.sub-title {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 12rpx;
}

.sub-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 16rpx;
}

.sub-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.sub-icon {
  width: 140rpx;
  height: 140rpx;
  border-radius: 12rpx;
  background: #f5f5f5;
}

.sub-name {
  margin-top: 12rpx;
  font-size: 26rpx;
}
</style>