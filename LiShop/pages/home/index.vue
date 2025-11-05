<template>
  <view class="page">
    <SearchBar v-model="keyword" @search="onSearch" />
    <BannerSwiper :images="banners" />

    <CategoryGrid :categories="categoryList" />

    <view class="block">
      <view class="block-title">
        <text>京东秒杀</text>
        <navigator url="/pages/category/index" class="more">更多</navigator>
      </view>
      <scroll-view class="seckill" scroll-x>
        <view class="sk-item" v-for="(item, idx) in seckillList" :key="idx">
          <image class="sk-img" :src="item.image || '/static/logo.png'" mode="aspectFill" />
          <text class="sk-price">¥{{ item.price }}</text>
        </view>
      </scroll-view>
    </view>

    <view class="block">
      <view class="block-title">
        <text>猜你喜欢</text>
      </view>
      <view class="grid2">
        <view class="grid2-item" v-for="(p, idx) in recommendList" :key="idx">
          <ProductCard :product="p" @add-to-cart="addToCart" />
        </view>
      </view>
    </view>

    <!-- #ifdef H5 -->
    <FloatingNav />
    <!-- #endif -->
  </view>
</template>

<script>
import SearchBar from '@/components/SearchBar.vue'
import BannerSwiper from '@/components/BannerSwiper.vue'
import CategoryGrid from '@/components/CategoryGrid.vue'
import ProductCard from '@/components/ProductCard.vue'
import FloatingNav from '@/components/FloatingNav.vue'

export default {
  components: { SearchBar, BannerSwiper, CategoryGrid, ProductCard, FloatingNav },
  data() {
    return {
      keyword: '',
      banners: ['/static/logo.png', '/static/logo.png', '/static/logo.png'],
      categoryList: [
        { name: '手机数码' }, { name: '家用电器' }, { name: '美妆个护' }, { name: '母婴玩具' },
        { name: '服饰鞋包' }, { name: '运动户外' }, { name: '生鲜食品' }, { name: '图书文娱' }
      ],
      seckillList: [
        { id: 's1', title: '爆款秒杀1', price: 99, image: '/static/logo.png' },
        { id: 's2', title: '爆款秒杀2', price: 129, image: '/static/logo.png' },
        { id: 's3', title: '爆款秒杀3', price: 59, image: '/static/logo.png' }
      ],
      recommendList: [
        { id: 'p1', title: '店铺热销商品 A 旗舰款', price: 299, sales: 1234, image: '/static/logo.png' },
        { id: 'p2', title: '人气爆款 B 限时优惠', price: 89, sales: 5678, image: '/static/logo.png' },
        { id: 'p3', title: '超值 C 套装', price: 179, sales: 345, image: '/static/logo.png' },
        { id: 'p4', title: '家电 D 新品', price: 999, sales: 98, image: '/static/logo.png' }
      ]
    }
  },
  onShow() {
    // #ifdef H5
    try { uni.hideTabBar({ animation: false }) } catch (e) { }
    // #endif
  },
  onPullDownRefresh() {
    setTimeout(() => { uni.stopPullDownRefresh() }, 600)
  },
  methods: {
    onSearch(val) {
      uni.showToast({ title: '搜索：' + (val || this.keyword), icon: 'none' })
    },
    addToCart(product) {
      try {
        const cart = uni.getStorageSync('cart') || []
        const i = cart.findIndex(it => it.id === product.id)
        if (i >= 0) cart[i].quantity = (cart[i].quantity || 1) + 1
        else cart.push({ ...product, quantity: 1 })
        uni.setStorageSync('cart', cart)
        uni.showToast({ title: '已加入购物车', icon: 'success' })
      } catch (e) {
        console.error(e)
      }
    }
  }
}
</script>

<style scoped>
.page {
  background: #f7f7f7;
  min-height: 100vh;
}

.block {
  margin-top: 20rpx;
  background: #fff;
}

.block-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  font-size: 30rpx;
}

.more {
  color: #999;
  font-size: 26rpx;
}

.seckill {
  white-space: nowrap;
  padding: 0 20rpx 20rpx;
}

.sk-item {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  width: 220rpx;
  margin-right: 16rpx;
}

.sk-img {
  width: 220rpx;
  height: 220rpx;
  border-radius: 12rpx;
  background: #f5f5f5;
}

.sk-price {
  color: #e1251b;
  font-size: 28rpx;
  margin-top: 8rpx;
}

.grid2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 16rpx;
  padding: 0 20rpx 20rpx;
}

.grid2-item {}
</style>