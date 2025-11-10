<template>
  <view class="grid">
    <view class="item" v-for="(cat, idx) in categories" :key="idx" @click="go(cat)">
      <image class="icon" :src="cat.icon || '/static/logo.png'" mode="aspectFill" />
      <text class="name">{{ cat.name }}</text>
    </view>
  </view>
</template>

<script>
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
  background: #ffffff;
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
  background: #f5f5f5;
}

.name {
  margin-top: 12rpx;
  font-size: 26rpx;
  color: #333;
}
</style>