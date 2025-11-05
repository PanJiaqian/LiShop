<template>
  <view class="page">
    <view v-if="cart.length" class="list">
      <view class="item" v-for="(it, idx) in cart" :key="it.id">
        <image class="cover" :src="it.image || '/static/logo.png'" mode="aspectFill" />
        <view class="meta">
          <text class="title">{{ it.title }}</text>
          <text class="price">¥{{ it.price.toFixed(2) }}</text>
          <view class="qty">
            <button size="mini" @click="dec(idx)">-</button>
            <text class="count">{{ it.quantity }}</text>
            <button size="mini" @click="inc(idx)">+</button>
            <button size="mini" class="del" @click="remove(idx)">删除</button>
          </view>
        </view>
      </view>
    </view>
    <view v-else class="empty">购物车空空如也~</view>

    <view class="footer">
      <text>合计：<text class="sum">¥{{ total.toFixed(2) }}</text></text>
      <view class="actions">
        <button size="mini" @click="clear">清空</button>
        <button size="mini" class="checkout" @click="checkout">去结算</button>
      </view>
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
    return { cart: [] }
  },
  computed: {
    total() { return this.cart.reduce((s, it) => s + (it.price * (it.quantity || 1)), 0) }
  },
  onShow() {
    this.load()
    // #ifdef H5
    try { uni.hideTabBar({ animation: false }) } catch (e) { }
    // #endif
  },
  methods: {
    load() {
      try { this.cart = uni.getStorageSync('cart') || [] } catch (e) { this.cart = [] }
    },
    sync() { uni.setStorageSync('cart', this.cart) },
    inc(i) { this.cart[i].quantity += 1; this.sync() },
    dec(i) { this.cart[i].quantity = Math.max(1, (this.cart[i].quantity || 1) - 1); this.sync() },
    remove(i) { this.cart.splice(i, 1); this.sync() },
    clear() { this.cart = []; this.sync() },
    checkout() { uni.showToast({ title: '暂未接入支付', icon: 'none' }) }
  }
}
</script>

<style scoped>
.page {
  background: #f7f7f7;
  min-height: 100vh;
  padding-bottom: 120rpx;
}

.list {
  background: #fff;
}

.item {
  display: flex;
  padding: 20rpx;
  border-bottom: 1px solid #f0f0f0;
}

.cover {
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
  background: #f5f5f5;
}

.meta {
  flex: 1;
  margin-left: 16rpx;
}

.title {
  font-size: 28rpx;
  color: #333;
  display: block;
}

.price {
  color: #e1251b;
  font-size: 30rpx;
  margin-top: 8rpx;
  display: block;
}

.qty {
  display: flex;
  align-items: center;
  margin-top: 12rpx;
}

.count {
  margin: 0 16rpx;
}

.del {
  margin-left: 12rpx;
}

.empty {
  padding: 60rpx;
  text-align: center;
  color: #999;
}

.footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  box-shadow: 0 -8rpx 20rpx rgba(0, 0, 0, .06);
  padding: 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sum {
  color: #e1251b;
  font-weight: 600;
}

.checkout {
  background: #ff5500;
  color: #fff;
}
</style>