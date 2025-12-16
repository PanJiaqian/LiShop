<template>
  <view class="card" @click="openDetail">
    <image class="cover" :src="product.image || '/static/logo.png'" mode="aspectFill" />
    <view class="info">
      <text class="title">{{ product.title }}</text>
      <view class="price-row">
        <text class="price">¥{{ product.price.toFixed(2) }}</text>
        <text class="sales">已售 {{ product.sales }}</text>
      </view>
      <view class="actions">
        <!-- <button class="btn-cart" size="mini" @click.stop="add">加入购物车</button> -->
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ProductCard',
  props: {
    product: { type: Object, required: true }
  },
  emits: ['add-to-cart'],
  methods: {
    add() {
      this.$emit('add-to-cart', this.product)
    },
    openDetail() {
      const id = this.product?.id ?? ''
      uni.navigateTo({ url: '/pages/product/index?id=' + encodeURIComponent(id) })
    }
  }
}
</script>

<style scoped>
.card {
  background: #fff;
  border-radius: 12rpx;
  overflow: hidden;
}

.cover {
  width: 100%;
  height: 300rpx;
  background: #f5f5f5;
  display: block;
}

.info {
  padding: 16rpx;
}

.title {
  font-size: 28rpx;
  color: #333;
  line-height: 1.4;
  display: block;
  height: 80rpx;
  overflow: hidden;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12rpx;
}

.price {
  color: #e1251b;
  font-size: 30rpx;
  font-weight: 600;
}

/* #ifdef MP-WEIXIN */
.price {
  color: #000;
}
/* #endif */

.sales {
  font-size: 24rpx;
  color: #999;
}

.actions {
  margin-top: 12rpx;
  display: flex;
}

.btn-cart {
  background: #ff5500;
  color: #fff;
  border-radius: 8rpx;
}
</style>
