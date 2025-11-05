<template>
  <view class="search-bar">
    <view class="search-input">
      <text class="icon">🔍</text>
      <input class="input" :value="modelValue" :placeholder="placeholder" confirm-type="search" @confirm="onSearch"
        @input="onInput" />
    </view>
    <button class="search-btn" size="mini" @click="onSearch">搜索</button>
  </view>
</template>

<script>
export default {
  name: 'SearchBar',
  props: {
    modelValue: { type: String, default: '' },
    placeholder: { type: String, default: '搜索商品、店铺' }
  },
  emits: ['update:modelValue', 'search'],
  methods: {
    onInput(e) {
      const value = e?.detail?.value ?? ''
      this.$emit('update:modelValue', value)
    },
    onSearch() {
      this.$emit('search', this.modelValue)
    }
  }
}
</script>

<style scoped>
.search-bar {
  display: flex;
  align-items: center;
  padding: 16rpx 20rpx;
  background-color: #ffffff;
}

.search-input {
  flex: 1;
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 999rpx;
  padding: 12rpx 20rpx;
}

.icon {
  margin-right: 12rpx;
  font-size: 28rpx;
}

.input {
  flex: 1;
  font-size: 28rpx;
}

.search-btn {
  margin-left: 20rpx;
  background: #e1251b;
  color: #fff;
  border-radius: 8rpx;
}
</style>