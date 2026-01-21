<template>
  <view>
    <LoginPrompt :visible="showLoginModal" @close="closeLoginModal" @confirm="goLogin" />
    <view class="card" @click="openDetail">
    <image class="cover" :src="product.image || '/static/logo.png'" mode="aspectFill" />
    <view class="info">
      <text class="title">{{ product.title }}</text>
      <view class="price-row">
        <view class="price">
          <text v-if="!displayPriceParts.textMsg" class="price-icon">¥</text>
          <text v-if="!displayPriceParts.textMsg" class="price-amount">{{ displayPriceParts.amount }}</text>
          <text v-else class="price-text">{{ displayPriceParts.textMsg }}</text>
        </view>
        <text class="sales">已售 {{ product.sales }}</text>
      </view>
      <view class="actions">
        <!-- <button class="btn-cart" size="mini" @click.stop="add">加入购物车</button> -->
      </view>
    </view>
    </view>
  </view>
</template>

<script>
import LoginPrompt from '@/components/LoginPrompt.vue'
export default {
  name: 'ProductCard',
  props: {
    product: { type: Object, required: true }
  },
  emits: ['add-to-cart'],
  data() {
    return { showLoginModal: false }
  },
  components: { LoginPrompt },
  computed: {
    displayPriceParts() {
      try {
        const v = this.product && this.product.price
        if (v === '-' || v === '—') return { textMsg: '登录可查看售价' }
        const n = Number(v)
        if (isNaN(n)) return { textMsg: '---' }
        return { amount: n.toFixed(2) }
      } catch (e) { return { textMsg: '---' } }
    }
  },
  methods: {
    ensureLoggedIn() {
      try {
        const u = uni.getStorageSync('user') || null
        const exp = uni.getStorageSync('token_expiration') || 0
        const ok = !!u && (!exp || Date.now() < exp)
        if (ok) return true
        this.showLoginModal = true
        return false
      } catch (e) { return false }
    },
    closeLoginModal() { this.showLoginModal = false },
    goLogin() { this.showLoginModal = false; uni.navigateTo({ url: '/pages/login/index' }) },
    add() {
      this.$emit('add-to-cart', this.product)
    },
    openDetail() {
      if (!this.ensureLoggedIn()) return
      const id = this.product?.id ?? ''
      const url = '/pages/product/index?id=' + encodeURIComponent(id)
      if (typeof window !== 'undefined' && window.open) {
        const base = (typeof location !== 'undefined' && location.href) ? location.href.split('#')[0] : ''
        const full = base ? (base + '#/pages/product/index?id=' + encodeURIComponent(id)) : url
        window.open(full, '_blank')
      } else {
        uni.navigateTo({ url })
      }
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
  display: flex;
  align-items: baseline;
  gap: 12rpx;
}
.price-icon {
  color: #000;
  font-size: 28rpx;
  font-weight: 600;
}
.price-amount {
  color: #000;
  font-size: 30rpx;
  font-weight: 700;
}
.price-text {
  color: #000;
  font-size: 28rpx;
  font-weight: 600;
}

/* #ifdef MP-WEIXIN */
.price-icon { color: #000; }
.price-amount { color: #000; }
.price-text { color: #000; }
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
