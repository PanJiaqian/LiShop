<template>
  <view class="page">
    <!-- H5 三栏布局（包含分类、我的、商品） -->
    <!-- #ifdef H5 -->
    <view class="h5-layout">
      <view class="side-cate">
        <view class="cate-title">全部分类</view>
        <view class="cate-list">
          <view class="cate-item" v-for="(c, i) in topCategories" :key="i" @click="openCategory(c)">
            <text class="dot">•</text>
            <text class="cate-name">{{ c.name }}</text>
          </view>
        </view>
      </view>

      <view class="main">
        <SearchBar v-model="keyword" @search="onSearch" />
        <BannerSwiper :images="banners" />

        <view class="block">
          <view class="block-title">
            <text>京东秒杀</text>
            <navigator url="/pages/category/index" open-type="switchTab" class="more">更多</navigator>
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
              <ProductCard :product="p" />
            </view>
          </view>
        </view>
      </view>

      <view class="side-user">
        <view class="user-card">
          <image class="avatar" src="/static/logo.png" @click="onAvatarClick" />
          <view class="u-row">
            <text class="u-name">{{ user?.username || '未登录' }}</text>
            <button v-if="!user" class="u-btn" size="mini" @click="goLogin">去登录</button>
          </view>
          <view class="u-links">
            <navigator class="u-link" url="/pages/cart/index" open-type="switchTab">我的购物车</navigator>
            <navigator class="u-link" url="/pages/order/index">我的订单</navigator>
            <navigator class="u-link" url="/pages/messages/index">消息</navigator>
            <navigator class="u-link" url="/pages/settings/index">设置</navigator>
          </view>
        </view>
      </view>
    </view>
    <FloatingNav />
    <!-- #endif -->

    <!-- 其他平台保持原布局 -->
    <!-- #ifndef H5 -->
    <SearchBar v-model="keyword" @search="onSearch" />
    <BannerSwiper :images="banners" />
    <CategoryGrid :categories="subCategoryList" />

    <view class="block">
      <view class="block-title">
        <text>京东秒杀</text>
        <navigator url="/pages/category/index" open-type="switchTab" class="more">更多</navigator>
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
          <ProductCard :product="p" />
        </view>
      </view>
    </view>
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
      roomName: '',
      user: null,
      banners: ['/static/logo.png', '/static/logo.png', '/static/logo.png'],
      topCategories: [{ name: '灯光' }],
      subCategoryList: [
        { name: '嵌入式灯光' },
        { name: '后口层板灯' },
        { name: '玻璃层板灯' },
        { name: '明装层板灯' },
        { name: '电源' },
        { name: '开关' },
        { name: '配件' }
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
        { id: 'p4', title: '家电 D 新品', price: 999, sales: 98, image: '/static/logo.png' },
        { id: 'p4', title: '家电 D 新品', price: 999, sales: 98, image: '/static/logo.png' },
        { id: 'p4', title: '家电 D 新品', price: 999, sales: 98, image: '/static/logo.png' },
        { id: 'p4', title: '家电 D 新品', price: 999, sales: 98, image: '/static/logo.png' },
        { id: 'p4', title: '家电 D 新品', price: 999, sales: 98, image: '/static/logo.png' }
      ]
    }
  },
  onShow() {
    // #ifdef H5
    try { uni.hideTabBar({ animation: false }) } catch (e) { }
    try { this.user = uni.getStorageSync('user') || null } catch (e) { }
    try { this.roomName = uni.getStorageSync('currentRoom') || '' } catch (e) { }
    // #endif
  },
  onPullDownRefresh() {
    setTimeout(() => { uni.stopPullDownRefresh() }, 600)
  },
  methods: {
    onSearch(val) {
      uni.showToast({ title: '搜索：' + (val || this.keyword), icon: 'none' })
    },
    openCategory(cat) {
      if (uni.switchTab) {
        uni.switchTab({ url: '/pages/category/index' })
      } else {
        uni.navigateTo({ url: '/pages/category/index' })
      }
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
    },
    goLogin() {
      uni.navigateTo({ url: '/pages/login/index' })
    },
    onAvatarClick() {
      if (this.user) {
        if (uni.switchTab) uni.switchTab({ url: '/pages/profile/index' })
        else uni.navigateTo({ url: '/pages/profile/index' })
      } else {
        uni.navigateTo({ url: '/pages/login/index' })
      }
    },
    saveRoom() {
      try {
        const name = (this.roomName || '').trim()
        if (!name) return
        uni.setStorageSync('currentRoom', name)
        const rooms = uni.getStorageSync('rooms') || []
        if (!rooms.includes(name)) { rooms.push(name); uni.setStorageSync('rooms', rooms) }
        uni.showToast({ title: '房间名已保存', icon: 'success' })
      } catch (e) { }
    }
  }
}
</script>

<style scoped>
.page {
  background: #f7f7f7;
  min-height: 100vh;
}

/* H5 三栏布局样式 */
/* #ifdef H5 */
.h5-layout {
  display: grid;
  grid-template-columns: 300rpx 1fr 320rpx;
  grid-gap: 20rpx;
  padding: 20rpx;
}

.side-cate {
  background: #fff;
  border-radius: 12rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, .06);
}

.cate-title {
  font-weight: 600;
  padding: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.cate-list {
  padding: 10rpx 0;
}

.cate-item {
  display: flex;
  align-items: center;
  padding: 16rpx 20rpx;
}

.cate-item .dot {
  color: #ff5500;
  margin-right: 12rpx;
}

.cate-item .cate-name {
  color: #333;
}

.main {}

.side-user {}

.user-card {
  background: #fff;
  border-radius: 12rpx;
  padding: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, .06);
}

.avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: #f0f0f0;
}

.u-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10rpx;
}

.u-name {
  font-size: 30rpx;
  font-weight: 600;
}

.u-btn {
  background: #e1251b;
  color: #fff;
  border-radius: 10rpx;
}

.u-links {
  margin-top: 16rpx;
  display: flex;
  flex-direction: column;
}

.u-link {
  padding: 18rpx 0;
  color: #555;
  border-bottom: 1rpx solid #f0f0f0;
}

/* 右侧快捷入口与 H5 专属布局优化 */

.main .grid2 {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-gap: 14rpx;
  padding: 0;
}

:deep(.card) {
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, .04);
}

:deep(.cover) {
  height: 220rpx;
}

.seckill {
  padding: 0 12rpx 20rpx;
}

.sk-item {
  width: 180rpx;
}

.sk-img {
  width: 180rpx;
  height: 180rpx;
}

/* #endif */

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

/* 首页隐藏商品卡片中的加入购物车按钮 */
:deep(.actions),
:deep(.btn-cart) {
  display: none !important;
}

/* 房间名输入样式（H5和小程序通用） */
.room-block {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx 20rpx;
  background: #ffffff;
}

.room-label {
  color: #333;
}

.room-input {
  flex: 1;
  height: 64rpx;
  line-height: 64rpx;
  background: #f7f7f7;
  border: 1rpx solid #e6e6e6;
  border-radius: 12rpx;
  padding: 0 16rpx;
}
</style>