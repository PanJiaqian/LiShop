<template>
  <view class="page" v-if="product">
    <!-- #ifdef H5 -->
    <view class="pd-grid">
      <!-- 左侧：可滚动，包含画廊 + 参数 + 图文详情 -->
      <view class="pd-left">
        <view class="pd-gallery">
          <image class="pd-main" :src="currentImage" mode="aspectFill" />
          <view class="pd-thumbs">
            <image v-for="(src, i) in images" :key="i" class="pd-thumb" :src="src" mode="aspectFill"
              :class="{ active: i === current }" @click="current = i" />
          </view>
        </view>

        <view class="pd-card pd-params">
          <text class="pd-section-title">参数信息</text>
          <view class="pd-param-grid">
            <view class="pd-param-item"><text class="key">品牌</text><text class="val">LiShop</text></view>
            <view class="pd-param-item"><text class="key">型号</text><text class="val">{{ product.id || '默认款' }}</text>
            </view>
            <view class="pd-param-item"><text class="key">游戏人数</text><text class="val">2人</text></view>
            <view class="pd-param-item"><text class="key">时长</text><text class="val">30分钟以下</text></view>
          </view>
        </view>

        <view class="pd-card pd-detail">
          <text class="pd-section-title">图文详情</text>
          <image v-for="(src, i) in images" :key="'d' + i" class="pd-detail-img" :src="src" mode="widthFix" />
        </view>
      </view>

      <!-- 右侧：保持现有信息与按钮，不做其它改动 -->
      <view class="pd-right">
        <view class="pd-info">
          <text class="pd-title">{{ product.title }}</text>
          <view class="pd-price-row">
            <text class="pd-price">¥{{ product.price.toFixed(2) }}</text>
            <text class="pd-coupon">券后更低</text>
          </view>
          <view class="pd-meta">
            <text>包邮 ｜ 48小时内发货 ｜ 七天无理由</text>
          </view>

          <view class="pd-qty">
            <text class="label">数量</text>
            <view class="qty-stepper">
              <button class="step" @click="decQty">-</button>
              <text class="count">{{ qty }}</text>
              <button class="step" @click="incQty">+</button>
            </view>
          </view>

          <view class="pd-actions">
            <button class="btn-buy" @click="buyNow">立即购买</button>
            <button class="btn-cart" @click="addToCartWithQty">加入购物车</button>
          </view>
        </view>
      </view>
    </view>
    <!-- #endif -->

    <!-- #ifndef H5 -->
    <image class="cover" :src="product.image || '/static/logo.png'" mode="aspectFill" />
    <view class="info">
      <text class="title">{{ product.title }}</text>
      <text class="price">¥{{ product.price.toFixed(2) }}</text>
      <text class="sales">销量 {{ product.sales }}</text>
    </view>
    <view class="footer">
      <button class="btn-cart" @click="addToCart">加入购物车</button>
    </view>
    <!-- #endif -->
  </view>
</template>

<script>
export default {
  data() { return { product: null, current: 0, qty: 1 } },
  onLoad(query) {
    const id = decodeURIComponent(query?.id || '')
    // 简单模拟数据，真实项目中应从接口获取
    const base = { id, title: '商品 ' + (id || 'X'), price: 199, sales: 100, image: '/static/logo.png', images: ['/static/logo.png', '/static/logo.png', '/static/logo.png'] }
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
    },
    incQty() { this.qty += 1 },
    decQty() { this.qty = Math.max(1, this.qty - 1) },
    addToCartWithQty() {
      try {
        const cart = uni.getStorageSync('cart') || []
        const i = cart.findIndex(it => it.id === this.product.id)
        if (i >= 0) cart[i].quantity = (cart[i].quantity || 1) + this.qty
        else cart.push({ ...this.product, quantity: this.qty })
        uni.setStorageSync('cart', cart)
        uni.showToast({ title: '已加入购物车', icon: 'success' })
      } catch (e) { console.error(e) }
    },
    buyNow() { uni.showToast({ title: '暂未接入下单', icon: 'none' }) }
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

/* #ifdef H5 */
.footer {
  display: none;
}

.pd-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 24rpx;
  padding: 20rpx;
  height: calc(100vh - 40rpx);
  align-items: start;
}

.pd-left,
.pd-right {
  height: 100%;
}

.pd-left {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  padding-right: 6rpx;
}

.pd-gallery {
  background: #fff;
  border-radius: 12rpx;
  padding: 20rpx;
  position: relative;
}

.pd-main {
  width: 100%;
  height: 520rpx;
  border-radius: 8rpx;
  background: #f5f5f5;
}

.pd-thumbs {
  position: absolute;
  left: 20rpx;
  top: 20rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.pd-thumb {
  width: 88rpx;
  height: 88rpx;
  border-radius: 8rpx;
  background: #f5f5f5;
  border: 1rpx solid #eee;
}

.pd-thumb.active {
  outline: 3rpx solid #ff5500;
}

.pd-card {
  background: #fff;
  border-radius: 12rpx;
  padding: 20rpx;
}

.pd-section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 12rpx;
}

.pd-param-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12rpx;
}

.pd-param-item {
  display: flex;
  flex-direction: column;
  background: #fafafa;
  border: 1rpx solid #eee;
  border-radius: 10rpx;
  padding: 12rpx;
}

.pd-param-item .key {
  color: #666;
  font-size: 24rpx;
}

.pd-param-item .val {
  color: #333;
  font-size: 26rpx;
  margin-top: 6rpx;
}

.pd-detail-img {
  width: 100%;
  border-radius: 8rpx;
  background: #f5f5f5;
  margin-top: 12rpx;
}

.pd-info {
  background: #fff;
  border-radius: 12rpx;
  padding: 20rpx;
  height: 100%;
}

.pd-title {
  font-size: 34rpx;
  color: #333;
  display: block;
}

.pd-price-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-top: 10rpx;
}

.pd-price {
  color: #e1251b;
  font-size: 40rpx;
  font-weight: 700;
}

.pd-coupon {
  background: #fff2e8;
  color: #ff7b2b;
  padding: 8rpx 12rpx;
  border-radius: 6rpx;
  font-size: 24rpx;
}

.pd-meta {
  color: #666;
  margin-top: 12rpx;
}

.pd-qty {
  display: flex;
  align-items: center;
  margin-top: 20rpx;
}

.pd-qty .label {
  color: #333;
  margin-right: 16rpx;
}

.qty-stepper {
  display: flex;
  align-items: center;
}

.qty-stepper .step {
  width: 56rpx;
  height: 56rpx;
  border-radius: 8rpx;
  background: #f5f5f5;
}

.qty-stepper .count {
  width: 80rpx;
  text-align: center;
}

.pd-actions {
  display: flex;
  gap: 16rpx;
  margin-top: 24rpx;
}

.btn-buy {
  flex: 0 0 220rpx;
  background: #ff5500;
  color: #fff;
  border-radius: 8rpx;
}

.pd-info .btn-cart {
  flex: 1;
  background: #ff7b2b;
  color: #fff;
  border-radius: 8rpx;
}

/* #endif */
</style>