<template>
  <view class="page">
    <!-- #ifdef H5 -->
    <view class="cart-grid">
      <view class="cart-main">
        <view class="toolbar" v-if="cart.length">
          <view class="tool-left">
            <view class="chk all" @click="toggleAll">
              <view class="chk-ico" :class="{ on: isAllSelected }"></view>
              <text class="chk-txt">全选</text>
            </view>
          </view>
          <view class="tool-right">
            <button size="mini" class="btn-del" :disabled="selectedCount === 0" @click="removeSelected">删除选中</button>
          </view>
        </view>

        <view v-if="cart.length" class="list h5">
          <view class="item" v-for="(it, idx) in cart" :key="it.id">
            <view class="chk" @click="toggle(idx)">
              <view class="chk-ico" :class="{ on: it.selected }"></view>
            </view>
            <image class="cover" :src="it.image || '/static/logo.png'" mode="aspectFill" />
            <view class="meta">
              <text class="title">{{ it.title }}</text>
              <text class="attr" v-if="it.attr">{{ it.attr }}</text>
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
      </view>

      <view class="cart-aside">
        <view class="summary-card">
          <view class="sum-title">结算明细</view>
          <view class="sum-hint">实际优惠金额以下单页为准</view>
          <view v-if="selectedCount > 0" class="sum-body">
            <view class="thumbs">
              <image v-for="(src, i) in selectedThumbs" :key="i" :src="src" class="thumb" mode="aspectFill" />
            </view>
            <view class="rows">
              <view class="row">
                <text class="label">商品总价</text>
                <text class="value">¥{{ selectedTotal.toFixed(2) }}</text>
              </view>
              <view class="row">
                <text class="label">共减</text>
                <text class="value reduce">减 ¥{{ totalReduce.toFixed(2) }}</text>
              </view>
              <view class="row small">
                <text class="label">官方立减</text>
                <text class="value reduce">减 ¥{{ officialReduce.toFixed(2) }}</text>
              </view>
              <view class="row small">
                <text class="label">红包</text>
                <text class="value reduce">减 ¥{{ redReduce.toFixed(2) }}</text>
              </view>
            </view>
            <view class="coupon-bar">
              <text class="coupon-txt">消费券｜再实付{{ needForCoupon }}享满800减80</text>
              <text class="coupon-action">凑单›</text>
            </view>
            <view class="row total">
              <text class="label">合计：</text>
              <view class="total-box">
                <text class="pay">¥{{ payable.toFixed(2) }}</text>
                <text class="total-reduce">共减 ¥ {{ totalReduce.toFixed(2) }}</text>
              </view>
            </view>
            <button class="checkout" @click="checkout">结算({{ selectedCount }})</button>
          </view>
          <view v-else class="sum-empty">
            <view class="empty-ico">🛒</view>
            <view class="empty-tip">选择商品查看实际支付价格</view>
            <view class="row total">
              <text class="label">合计：</text>
              <view class="total-box">
                <text class="pay">¥0</text>
              </view>
            </view>
            <button class="checkout disabled">结算</button>
          </view>
        </view>
      </view>
    </view>
    <!-- #endif -->

    <!-- #ifndef H5 -->
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
    <!-- #endif -->

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
    total() { return this.cart.reduce((s, it) => s + (it.price * (it.quantity || 1)), 0) },
    selectedTotal() { return this.cart.reduce((s, it) => s + (it.selected ? it.price * (it.quantity || 1) : 0), 0) },
    selectedCount() { return this.cart.filter(it => it.selected).length },
    isAllSelected() { return this.cart.length > 0 && this.selectedCount === this.cart.length },
    selectedThumbs() { return this.cart.filter(it => it.selected).slice(0, 2).map(it => it.image || '/static/logo.png') },
    officialReduce() { return this.cart.reduce((s, it) => s + (it.selected ? (it.officialReduce || 0) : 0), 0) },
    redReduce() { return this.cart.reduce((s, it) => s + (it.selected ? (it.redReduce || 0) : 0), 0) },
    extraReduce() { return this.cart.reduce((s, it) => s + (it.selected ? (it.reduce || 0) : 0), 0) },
    totalReduce() { return this.officialReduce + this.redReduce + this.extraReduce },
    payable() { return Math.max(0, this.selectedTotal - this.totalReduce) },
    needForCoupon() { const need = Math.max(0, 800 - this.payable); return need.toFixed(2) }
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
      this.cart = (this.cart || []).map(it => ({
        ...it,
        quantity: it.quantity || 1,
        selected: !!it.selected
      }))
    },
    sync() { uni.setStorageSync('cart', this.cart) },
    inc(i) { this.cart[i].quantity += 1; this.sync() },
    dec(i) { this.cart[i].quantity = Math.max(1, (this.cart[i].quantity || 1) - 1); this.sync() },
    remove(i) { this.cart.splice(i, 1); this.sync() },
    removeSelected() { this.cart = this.cart.filter(it => !it.selected); this.sync() },
    toggle(i) { this.cart[i].selected = !this.cart[i].selected; this.sync() },
    toggleAll() {
      const makeSelected = !(this.selectedCount === this.cart.length && this.cart.length > 0)
      this.cart.forEach(it => it.selected = makeSelected)
      this.sync()
    },
    clear() { this.cart = []; this.sync() },
    checkout() {
      if (this.selectedCount === 0) {
        uni.showToast({ title: '请选择商品', icon: 'none' })
        return
      }
      uni.showToast({ title: '暂未接入支付', icon: 'none' })
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

/* #ifdef H5 */
.footer {
  display: none;
}

.cart-grid {
  display: grid;
  grid-template-columns: 1fr 900rpx;
  grid-gap: 20rpx;
  padding: 20rpx;
}

.cart-main {
  background: #fff;
  border-radius: 12rpx;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 20rpx;
  border-bottom: 1px solid #f0f0f0;
}

.chk {
  width: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chk-ico {
  width: 28rpx;
  height: 28rpx;
  border-radius: 50%;
  border: 2rpx solid #ccc;
}

.chk-ico.on {
  background: #ff5500;
  border-color: #ff5500;
}

.chk-txt {
  margin-left: 8rpx;
  color: #333;
}

.list.h5 .item {
  display: flex;
  align-items: flex-start;
  padding: 20rpx;
  border-bottom: 1px solid #f0f0f0;
}

.list.h5 .cover {
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
  background: #f5f5f5;
}

.list.h5 .meta {
  flex: 1;
  margin-left: 16rpx;
}

.attr {
  color: #888;
  font-size: 24rpx;
  margin-top: 6rpx;
  display: block;
}

.cart-aside {}

.summary-card {
  position: relative;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, .06);
  border: 1rpx solid #eee;
}

.sum-title {
  font-weight: 600;
  color: #333;
  font-size: 28rpx;
}

.sum-hint {
  position: absolute;
  right: 24rpx;
  top: 24rpx;
  color: #999;
  font-size: 22rpx;
}

.thumbs {
  display: flex;
  gap: 12rpx;
  margin-top: 16rpx;
}

.thumb {
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
  background: #f5f5f5;
  border: 1rpx solid #eee;
}

.rows {
  margin-top: 16rpx;
}

.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12rpx 0;
}

.row.small {
  color: #666;
}

.label {
  color: #333;
}

.value {
  color: #333;
}

.value.reduce {
  color: #ff5500;
}

.coupon-bar {
  margin-top: 12rpx;
  background: #ffe9ee;
  color: #e1242b;
  border-radius: 8rpx;
  padding: 12rpx 16rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.coupon-action {
  color: #e1242b;
}

.row.total {
  margin-top: 12rpx;
}

.total-box {
  text-align: right;
}

.pay {
  color: #e1251b;
  font-weight: 700;
  font-size: 34rpx;
}

.total-reduce {
  display: block;
  color: #999;
  font-size: 22rpx;
}

.sum-row {
  margin-top: 12rpx;
  color: #555;
}

.sum {
  color: #e1251b;
  font-weight: 600;
}

.summary-card .checkout {
  margin-top: 16rpx;
  width: 100%;
  background: linear-gradient(90deg, #ff7b2b, #ff5500);
  color: #fff;
  border-radius: 12rpx;
  height: 80rpx;
  font-size: 28rpx;
  box-shadow: 0 8rpx 16rpx rgba(255, 85, 0, .24);
}

.summary-card .checkout.disabled {
  opacity: .6;
  pointer-events: none;
}

.empty-ico {
  width: 140rpx;
  height: 140rpx;
  border-radius: 16rpx;
  background: #f8f8f8;
  display: grid;
  place-items: center;
  color: #cfcfcf;
  font-size: 60rpx;
  margin: 20rpx auto;
}

.cart-aside {
  position: sticky;
  top: 20rpx;
}

@media (max-width: 1024px) {
  .cart-grid {
    grid-template-columns: 1fr 400rpx;
  }
}

@media (max-width: 768px) {
  .cart-grid {
    grid-template-columns: 1fr;
  }

  .cart-aside {
    order: -1;
  }
}

/* #endif */
</style>