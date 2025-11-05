<template>
  <view class="page" v-if="product">
    <image class="cover" :src="product.image || '/static/logo.png'" mode="aspectFill" />
    <view class="info">
      <text class="title">{{ product.title }}</text>
      <text class="price">¥{{ product.price.toFixed(2) }}</text>
      <text class="sales">销量 {{ product.sales }}</text>
    </view>
    <view class="footer">
      <button class="btn-cart" @click="addToCart">加入购物车</button>
    </view>
  </view>
</template>

<script>
export default {
  data() { return { product: null } },
  onLoad(query) {
    const id = decodeURIComponent(query?.id || '')
    // 简单模拟数据，真实项目中应从接口获取
    const base = { id, title: '商品 ' + (id || 'X'), price: 199, sales: 100, image: '/static/logo.png' }
    this.product = base
  },
  methods: {
    addToCart() {
      try {
        const cart = uni.getStorageSync('cart') || []
        const i = cart.findIndex(it => it.id === this.product.id)
        if (i >= 0) cart[i].quantity = (cart[i].quantity || 1) + 1
        else cart.push({ ...this.product, quantity: 1 })
        uni.setStorageSync('cart', cart)
        uni.showToast({ title: '已加入购物车', icon: 'success' })
      } catch (e) { console.error(e) }
    }
  }
}
</script>

<style scoped>
.page {
  background: #f7f7f7;
  min-height: 100vh;
  padding-bottom: 120rpx;
}

.cover {
  width: 100%;
  height: 500rpx;
  background: #f5f5f5;
}

.info {
  background: #fff;
  padding: 20rpx;
}

.title {
  font-size: 32rpx;
  display: block;
}

.price {
  color: #e1251b;
  font-size: 34rpx;
  margin-top: 8rpx;
  display: block;
}

.sales {
  color: #999;
  font-size: 26rpx;
  margin-top: 8rpx;
  display: block;
}

.footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  box-shadow: 0 -8rpx 20rpx rgba(0, 0, 0, .06);
  padding: 20rpx;
}

.btn-cart {
  width: 100%;
  background: #ff5500;
  color: #fff;
}
</style>