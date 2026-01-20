<template>
  <view class="card" @click="openDetail">
    <image class="cover" :src="product.image || '/static/logo.png'" mode="aspectFill" />
    <view class="info">
      <text class="title">{{ product.title }}</text>
      <view class="price-row">
        <text class="price">{{ priceDisplay }}</text>
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
  computed: {
    priceDisplay() {
      try {
        const v = this.product && this.product.price
        if (v === '-' || v === '—') return '-'
        const n = Number(v)
        if (isNaN(n)) return '-'
        return '¥' + n.toFixed(2)
      } catch (e) { return '-' }
    }
  },
  methods: {
    ensureLoggedIn() {
      try {
        const u = uni.getStorageSync('user') || null
        const exp = uni.getStorageSync('token_expiration') || 0
        const ok = !!u && (!exp || Date.now() < exp)
        if (ok) return true
        uni.showModal({
          title: '提示',
          content: '点击前往登陆的话就跳转到登陆页面',
          cancelText: '取消',
          confirmText: '去登录',
          success: (res) => {
            if (res && res.confirm) { try { uni.navigateTo({ url: '/pages/login/index' }) } catch (e) {} }
          }
        })
        return false
      } catch (e) { return false }
    },
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
  color: #000;
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
