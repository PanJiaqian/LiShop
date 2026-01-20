<template>
  <view class="search-bar">
    <view class="search-input">
      <image v-if="isH5" class="icon"
        src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><circle cx='28' cy='28' r='16' fill='none' stroke='%23000' stroke-width='4'/><line x1='42' y1='42' x2='58' y2='58' stroke='%23000' stroke-width='4' stroke-linecap='round'/></svg>"
        mode="widthFix" />
      <input class="input" :value="modelValue" :placeholder="placeholder" confirm-type="search" @input="onInput" />
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
  computed: {
    isH5() {
      try { return typeof window !== 'undefined' } catch (e) { return false }
    }
  },
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
  padding: 4rpx;
  background-color: #ffffff;
  border: 3rpx solid #000;
  border-radius: 40rpx;
  margin: 10rpx 20rpx;
}

.search-input {
  flex: 1;
  display: flex;
  align-items: center;
  background: transparent;
  border-radius: 0;
  padding: 12rpx 20rpx;
}

.icon {
  width: 32rpx;
  height: 32rpx;
  margin-right: 12rpx;
}

.input {
  flex: 1;
  font-size: 28rpx;
}

.search-btn {
  background: #000;
  color: #fff;
  border-radius: 36rpx;
  font-size: 30rpx;
  font-weight: bold;
  height: 70rpx;
  line-height: 70rpx;
  padding: 0 40rpx;
  margin-right: 4rpx;
  margin-left: 0;
}
</style>
