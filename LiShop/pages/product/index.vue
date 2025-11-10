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
            <view class="pd-param-item"><text class="key">型号</text><text class="val">{{ product.id || '默认款' }}</text>
            </view>
            <view class="pd-param-item"><text class="key">名称</text><text class="val">{{ product.title }}</text></view>
            <view class="pd-param-item"><text class="key">规格</text><text class="val">默认规格</text></view>
            <view class="pd-param-item"><text class="key">单位</text><text class="val">件</text></view>
            <view class="pd-param-item"><text class="key">单位价格</text><text class="val">¥{{ product.price.toFixed(2)
            }}</text></view>
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

          <view class="pd-form">
            <view class="pd-field">
              <text class="label">房间名</text>
              <input class="pd-input" v-model="roomName" placeholder="请输入或选择房间名，如 客厅A" />
            </view>
            <view class="pd-field">
              <text class="label">色温</text>
              <input class="pd-input" v-model="specTemp" placeholder="如 3000K / 4000K" />
            </view>
            <view class="pd-field">
              <text class="label">长度</text>
              <input class="pd-input" v-model="specLength" placeholder="如 1m / 2m" />
            </view>
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
    <!-- MP 端参数信息与图文详情 -->
    <view class="mp-section">
      <text class="mp-title">参数信息</text>
      <view class="mp-param-grid">
        <view class="mp-param-item"><text class="key">型号</text><text class="val">{{ product.id || '默认款' }}</text></view>
        <view class="mp-param-item"><text class="key">名称</text><text class="val">{{ product.title }}</text></view>
        <view class="mp-param-item"><text class="key">规格</text><text class="val">默认规格</text></view>
        <view class="mp-param-item"><text class="key">单位</text><text class="val">件</text></view>
        <view class="mp-param-item"><text class="key">单位价格</text><text class="val">¥{{ product.price.toFixed(2)
        }}</text></view>
      </view>
    </view>
    <view class="mp-section">
      <text class="mp-title">图文详情</text>
      <image v-for="(src, i) in images" :key="'md' + i" class="mp-detail-img" :src="src" mode="widthFix" />
    </view>
    <view class="footer">
      <!-- #ifdef MP-WEIXIN -->
      <button class="btn-cart" @click="openSpecSheet">加入购物车</button>
      <!-- #endif -->
      <!-- #ifndef MP-WEIXIN -->
      <button class="btn-cart" @click="addToCart">加入购物车</button>
      <!-- #endif -->
    </view>

    <!-- #ifdef MP-WEIXIN -->
    <view v-if="mpSheet" class="mp-mask" @click="closeSpecSheet">
      <view class="mp-sheet" @click.stop>
        <view class="mp-title">填写规格</view>
        <view class="mp-field"><text class="label">房间名</text><input class="mp-input" v-model="mpRoom" placeholder="如 客厅A" /></view>
        <view class="mp-field"><text class="label">色温</text><input class="mp-input" v-model="mpTemp"
            placeholder="如 3000K" /></view>
        <view class="mp-field"><text class="label">长度</text><input class="mp-input" v-model="mpLength"
            placeholder="如 2m" /></view>
        <view class="mp-field">
          <text class="label">数量</text>
          <view class="qty-stepper">
            <button class="step" @click="mpQty = Math.max(1, mpQty - 1)">-</button>
            <text class="count">{{ mpQty }}</text>
            <button class="step" @click="mpQty = mpQty + 1">+</button>
          </view>
        </view>
        <view class="mp-actions">
          <button class="mp-btn ghost" @click="closeSpecSheet">取消</button>
          <button class="mp-btn primary" @click="confirmSpecToCart">确定加入</button>
        </view>
      </view>
    </view>
    <!-- #endif -->
    <!-- #endif -->
  </view>
</template>

<script>
export default {
  data() { return { product: null, current: 0, qty: 1, specTemp: '', specLength: '', roomName: '', mpSheet: false, mpTemp: '', mpLength: '', mpRoom: '', mpQty: 1 } },
  onLoad(query) {
    const id = decodeURIComponent(query?.id || '')
    // 简单模拟数据，真实项目中应从接口获取
    const base = { id, title: '商品 ' + (id || 'X'), price: 199, sales: 100, image: '/static/logo.png', images: ['/static/logo.png', '/static/logo.png', '/static/logo.png'] }
    this.product = base
  },
  computed: {
    images() {
      const imgs = (this.product && this.product.images) || []
      return imgs.length ? imgs : [this.product?.image || '/static/logo.png']
    },
    currentImage() {
      const arr = this.images
      return arr[this.current] || arr[0]
    }
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
      const chosen = (this.roomName || '').trim()
      if (!chosen) { uni.showToast({ title: '请先填写房间名', icon: 'none' }); return }
      try {
        const cart = uni.getStorageSync('cart') || []
        const i = cart.findIndex(it => it.id === this.product.id)
        if (i >= 0) {
          cart[i].quantity = (cart[i].quantity || 1) + this.qty
          cart[i].specTemp = this.specTemp
          cart[i].specLength = this.specLength
          cart[i].roomName = chosen
        } else {
          cart.push({ ...this.product, quantity: this.qty, specTemp: this.specTemp, specLength: this.specLength, roomName: chosen })
        }
        const rooms = uni.getStorageSync('rooms') || []
        if (!rooms.includes(chosen)) { rooms.push(chosen); uni.setStorageSync('rooms', rooms) }
        uni.setStorageSync('cart', cart)
        uni.showToast({ title: `已加入房间：${chosen}`, icon: 'success' })
      } catch (e) { console.error(e) }
    },
    buyNow() { uni.showToast({ title: '暂未接入下单', icon: 'none' }) },
    // MP-WEIXIN 规格填写
    openSpecSheet() { this.mpSheet = true },
    closeSpecSheet() { this.mpSheet = false },
    confirmSpecToCart() {
      if (!this.mpRoom || !this.mpTemp || !this.mpLength || !this.mpQty) {
        uni.showToast({ title: '请填写房间名、色温、长度、数量', icon: 'none' })
        return
      }
      const chosen = (this.mpRoom || '').trim()
      try {
        const cart = uni.getStorageSync('cart') || []
        const i = cart.findIndex(it => it.id === this.product.id)
        if (i >= 0) {
          cart[i].quantity = (cart[i].quantity || 1) + this.mpQty
          cart[i].specTemp = this.mpTemp
          cart[i].specLength = this.mpLength
          cart[i].roomName = chosen
        } else {
          cart.push({ ...this.product, quantity: this.mpQty, specTemp: this.mpTemp, specLength: this.mpLength, roomName: chosen })
        }
        const rooms = uni.getStorageSync('rooms') || []
        if (!rooms.includes(chosen)) { rooms.push(chosen); uni.setStorageSync('rooms', rooms) }
        uni.setStorageSync('cart', cart)
        this.mpSheet = false
        uni.showToast({ title: `已加入房间：${chosen}`, icon: 'success' })
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

/* 右侧卡片置顶且自适应高度，仅影响 H5 */
.pd-right {
  height: auto;
  position: sticky;
  top: 20rpx;
  align-self: start;
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
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  background: #fafafa;
  border-radius: 10rpx;
}

.pd-param-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  border: none;
  padding: 10rpx;
}

.pd-param-item .key {
  color: #666;
  font-size: 24rpx;
}

.pd-param-item .val {
  color: #333;
  font-size: 26rpx;
  margin-top: 0rpx;
}

.pd-detail-img {
  width: 100%;
  border-radius: 8rpx;
  background: #f5f5f5;
  margin-top: 12rpx;
}

.pd-info {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 8rpx 28rpx rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.pd-form {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-top: 16rpx;
}

.pd-field {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8rpx;
}

.pd-input {
  width: 100%;
  height: 64rpx;
  line-height: 64rpx;
  background: #f7f7f7;
  border: 1rpx solid #e5e5e5;
  border-radius: 10rpx;
  padding: 0 14rpx;
}

.pd-title {
  font-size: 40rpx;
  color: #222;
  font-weight: 700;
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
  color: #777;
  font-size: 24rpx;
  margin-top: 12rpx;
}

.pd-qty {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20rpx;
  padding: 12rpx;
  background: #fafafa;
  border: 1rpx solid #eee;
  border-radius: 10rpx;
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
  border-radius: 10rpx;
  background: #fff;
  border: 1rpx solid #ddd;
  color: #333;
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
  background: linear-gradient(135deg, #ff6a00, #ff2d55);
  color: #fff;
  border-radius: 10rpx;
}

.pd-info .btn-cart {
  flex: 1;
  background: #ff8c3a;
  color: #fff;
  border-radius: 10rpx;
}

/* #endif */

/* #ifdef MP-WEIXIN */
.mp-mask {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgba(0, 0, 0, .55);
  display: flex;
  align-items: flex-end; /* 底部弹窗 */
  justify-content: center;
  z-index: 9999;
}

.mp-sheet {
  width: 100vw;
  max-width: none;
  background: #fff;
  border-top-left-radius: 24rpx;
  border-top-right-radius: 24rpx;
  padding: 24rpx;
  box-shadow: 0 -8rpx 24rpx rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  max-height: 72vh;
  animation: mpSlideUp .22s ease-out;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
}

.mp-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #333;
  padding-bottom: 12rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.mp-field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
  margin: 16rpx 0;
}

.mp-input {
  width: 60%;
  height: 64rpx;
  line-height: 64rpx;
  background: #fff;
  border: 1rpx solid #e6e6e6;
  border-radius: 12rpx;
  padding: 0 14rpx;
}

.mp-actions {
  display: flex;
  gap: 12rpx;
  margin-top: auto; /* 固定在底部 */
  padding-top: 16rpx;
  border-top: 1rpx solid #f0f0f0;
}

.mp-btn {
  flex: 1;
  height: 72rpx;
  border-radius: 999rpx;
  font-size: 28rpx;
}

.mp-btn.ghost {
  background: #f7f7f7;
  color: #333;
  border: 1rpx solid #e6e6e6;
}

.mp-btn.primary {
  background: linear-gradient(135deg, #ff6a00, #ff2d55);
  color: #fff;
  box-shadow: 0 6rpx 16rpx rgba(255,106,0,0.35);
}

/* 使数量步进器横向排列 */
.mp-sheet .qty-stepper {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12rpx;
}

/* 淘宝风格：步进器在弹窗内的样式适配 */
.mp-sheet .qty-stepper .step {
  width: 56rpx;
  height: 56rpx;
  border-radius: 12rpx;
  background: #fff;
  border: 1rpx solid #ddd;
}
.mp-sheet .qty-stepper .count {
  width: 80rpx;
  text-align: center;
}

@keyframes mpSlideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

/* 参数与图文详情样式 */
.mp-section {
  background: #fff;
  border-radius: 12rpx;
  padding: 20rpx;
  margin: 20rpx;
}

.mp-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 12rpx;
}

.mp-param-grid {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  border-radius: 10rpx;
  background: #fafafa;
}

.mp-param-item {
  border: none;
  padding: 10rpx;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.mp-param-item .key {
  color: #666;
  font-size: 24rpx;
}

.mp-param-item .val {
  color: #333;
  font-size: 26rpx;
  margin-top: 0rpx;
}

.mp-detail-img {
  width: 100%;
  border-radius: 8rpx;
  background: #f5f5f5;
  margin-top: 12rpx;
}

/* #endif */
</style>