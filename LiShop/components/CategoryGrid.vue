<template>
  <view class="grid">
    <view class="item" v-for="(cat, idx) in categories" :key="idx" @click="go(cat)">
      <image class="icon" :src="cat.icon || '/static/logo.png'" mode="aspectFill" />
      <text class="name">{{ cat.name }}</text>
    </view>
  </view>
</template>

<script>
/**
 * 分类宫格组件
 * - 展示分类入口（图标+名称）
 * - 点击后跳转/切换到分类页
 */
export default {
  name: 'CategoryGrid',
  props: {
    categories: { type: Array, default: () => [] }
  },
  methods: {
    go(cat) {
      if (uni.switchTab) {
        uni.switchTab({ url: '/pages/category/index' })
      } else {
        uni.navigateTo({ url: '/pages/category/index' })
      }
    }
  }
}
</script>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-row-gap: 24rpx;
  grid-column-gap: 12rpx;
  padding: 20rpx;
  background: #1a1a1a;
}

.item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.icon {
  width: 100rpx;
  height: 100rpx;
  border-radius: 20rpx;
  background: #333;
}

.name {
  margin-top: 12rpx;
  font-size: 26rpx;
  color: #fff;
}
</style>
