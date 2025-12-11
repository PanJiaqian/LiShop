<template>
  <view class="page">
    <Skeleton :loading="loading" :showTitle="true" :showGrid="true" />
    <!-- H5 三栏布局（包含分类、我的、商品） -->
    <!-- #ifdef H5 -->
    <view class="h5-container">
      <!-- 顶部 Header -->
      <view class="h5-header">
        <view class="h5-logo-area">
          <image src="/static/logo.png?v=20251211" style="width:200rpx;height:60rpx;margin-right:20rpx;" mode="aspectFit" />
          <!-- <text class="logo-text">SHOP</text> -->
        </view>
        <view class="h5-search-wrapper">
           <view class="search-bar-box">
              <view class="search-type">宝贝<text class="arrow-down">∨</text></view>
              <view class="divider-v"></view>
              <input class="search-input-field" v-model="keyword" confirm-type="search" @confirm="onSearch(null)" />
              <button class="search-btn-black" @click="onSearch(null)">搜索</button>
           </view>
        </view>
      </view>

      <view class="h5-middle-layout">
        <view class="side-user">
                  <view class="side-cate">
          <view class="cate-title">
             <text style="color:#000;margin-right:8rpx;font-weight:900;">☰</text>分类
          </view>
          <view class="cate-list">
            <view class="cate-item" v-for="(c, i) in topCategories" :key="i" @mouseenter="hoverCategory(c, $event)">
              <text class="cate-dot">●</text>
              <text class="cate-name">{{ c.name }}</text>
            </view>
          </view>
        </view>

        </view>


        <view class="center-content">
          <BannerSwiper :images="banners" class="full-height-banner" />
          
          <view v-if="activeCateId" class="sub-panel" :style="{ top: panelTop + 'px', left: panelLeft + 'px', right: panelRight + 'px' }" @mouseleave="closeCategory">
            <view class="panel-title">
              <text>{{ activeCateName || '二级分类' }}</text>
            </view>
            <view class="panel-columns">
              <view class="panel-link" v-for="(s, si) in leftChildren" :key="si" @click="goSubList(s)">
                <text class="sub-icon">●</text>
                {{ s.name }}
              </view>
            </view>
            <view v-if="!leftChildren || leftChildren.length === 0" class="sub-empty">暂无子分类</view>
          </view>
        </view>

        <view class="side-user">
          <view class="user-card-new">
            <view class="uc-header">
               <!-- <image class="uc-avatar" :src="user?.avatar || '/static/logo.png'" @click="onAvatarClick" /> -->
               <view class="uc-info">
                  <text class="uc-greet">下午好 {{ user?.username || 'XXX' }}</text>
               </view>
            </view>
            
            <view class="uc-links">
               <navigator class="uc-link-item" url="/pages/profile/index" open-type="switchTab">
                  <text class="uc-icon">👤</text>
                  <text>我的</text>
               </navigator>
               <navigator class="uc-link-item" url="/pages/cart/index" open-type="switchTab">
                  <text class="uc-icon">🛒</text>
                  <text>我的购物车</text>
               </navigator>
               <navigator class="uc-link-item" url="/pages/order/index">
                  <text class="uc-icon">📋</text>
                  <text>我的订单</text>
               </navigator>
               <navigator class="uc-link-item" url="/pages/messages/index">
                   <text class="uc-icon">💬</text>
                  <text>信息</text>
               </navigator>
               <navigator class="uc-link-item" url="/pages/settings/index">
                   <text class="uc-icon">⚙️</text>
                  <text>设置</text>
               </navigator>
            </view>
            
            <button v-if="!user" class="uc-login-btn" @click="goLogin">立即登录</button>
            <button v-else class="uc-login-btn" @click="logout">退出登录</button>
          </view>
        </view>
      </view>

      <view class="h5-bottom-section">
          <view class="guess-header">
             <view class="guess-icon">❤</view>
             <text class="guess-title">猜你喜欢</text>
          </view>
          <view class="grid2">
            <view class="grid2-item" v-for="(p, idx) in recommendList" :key="idx">
              <ProductCard :product="p" />
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
    <scroll-view class="mp-cate-nav" scroll-x>
      <view class="mp-cate-item" v-for="(c,i) in subCategoryList" :key="'mc'+i" @click="openCategory(c)">
        <image class="mp-cate-thumb" :src="c.icon || '/static/logo.png'" mode="aspectFit" />
        <text class="mp-cate-name">{{ c.name }}</text>
      </view>
    </scroll-view>
    <!-- 京东秒杀模块（非 H5，小程序端）已按要求注释 -->
    <!--
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
    -->

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
import Skeleton from '@/components/Skeleton.vue'
import { getRecommendedProducts, getVisibleCategories, searchProducts } from '../../api/index.js'

export default {
  components: { SearchBar, BannerSwiper, CategoryGrid, ProductCard, FloatingNav, Skeleton },
  data() {
    return {
      loading: true,
      keyword: '',
      roomName: '',
      user: null,
      banners: ['/static/logo.png', '/static/logo.png', '/static/logo.png'],
      topCategories: [],
      activeCateId: '',
      activeCateName: '',
      leftChildren: [],
      subCategoryList: [],
      seckillList: [
        { id: 's1', title: '爆款秒杀1', price: 99, image: '/static/logo.png' },
        { id: 's2', title: '爆款秒杀2', price: 129, image: '/static/logo.png' },
        { id: 's3', title: '爆款秒杀3', price: 59, image: '/static/logo.png' }
      ],
      recommendList: []
      , panelTop: 20
      , panelLeft: 0
      , panelRight: 0
    }
  },
  onShow() {
    // #ifdef H5
    try { uni.hideTabBar({ animation: false }) } catch (e) { }
    try { this.user = uni.getStorageSync('user') || null } catch (e) { }
    try { this.roomName = uni.getStorageSync('currentRoom') || '' } catch (e) { }
    // #endif
    // 拉取分类与推荐商品（最小接入，不影响现有交互）
    try {
      const p1 = getVisibleCategories({ page: 1, page_size: 20, sort_by: 'id' })
        .then((res) => {
          const items = Array.isArray(res?.data?.items) ? res.data.items : []
          const mapped = items.map((it, i) => ({
            name: it?.name || ('分类' + (i + 1)),
            icon: (typeof it?.thumbnail === 'string' ? it.thumbnail.replace(/`/g, '').trim() : '') || (typeof it?.icon === 'string' ? it.icon.replace(/`/g, '').trim() : ''),
            categories_id: it?.categories_id || it?.id || ''
          }))
          this.topCategories = mapped
          this.subCategoryList = mapped
        })
        .catch(() => { })
      
      const p2 = getRecommendedProducts({ page: 1, page_size: 20 })
        .then((res) => {
          const carousel = (res?.data?.carousel && Array.isArray(res.data.carousel)) ? res.data.carousel 
              : ((res?.data?.carousel && Array.isArray(res.data.carousel.items)) ? res.data.carousel.items : [])
          this.banners = carousel.map(it => {
             const img = (typeof it?.thumbnail === 'string' ? it.thumbnail.replace(/`/g, '').trim() : '')
             return { image: img || '/static/logo.png', id: it?.available_product_id || '' }
          })
          if (this.banners.length === 0) {
             this.banners = ['/static/logo.png', '/static/logo.png']
          }

          const pick = (d) => {
            const candidates = [
              d?.data?.fixed?.items,
              d?.data?.recommended?.items,
              d?.data?.items,
              d?.items,
              Array.isArray(d) ? d : []
            ]
            for (let i = 0; i < candidates.length; i++) {
              const arr = candidates[i]
              if (Array.isArray(arr) && arr.length) return arr
            }
            return []
          }
          const fixed = pick(res)
          const mapped = fixed.map((it, i) => ({
            id: it?.available_product_id || it?.id || ('p' + i),
            title: it?.name || it?.title || ('推荐商品 ' + (i + 1)),
            price: Number(it?.price ?? it?.sale_price ?? 0) || 0,
            sales: Number(it?.sales ?? 0) || 0,
            image: (typeof it?.thumbnail === 'string' ? it.thumbnail.replace(/`/g, '').trim() : '') || (typeof it?.image === 'string' ? it.image.replace(/`/g, '').trim() : '') || '/static/logo.png'
          }))
          this.recommendList = mapped
        })
        .catch(() => { })

      Promise.allSettled([p1, p2]).then(() => {
        this.loading = false
      })
    } catch (e) { this.loading = false }
  },
  onPullDownRefresh() {
    setTimeout(() => { uni.stopPullDownRefresh() }, 600)
  },
  methods: {
    hoverCategory(cat, e) {
      const id = cat?.categories_id || ''
      if (!id) { uni.showToast({ title: '分类缺少ID', icon: 'none' }); return }
      if (this.activeCateId === id && (this.leftChildren && this.leftChildren.length)) return
      this.activeCateId = id
      this.activeCateName = cat?.name || ''
      // #ifdef H5
      try {
        const main = document.querySelector('.center-content')
        if (main && e && e.clientY != null) {
          const rect = main.getBoundingClientRect()
          const y = e.clientY - rect.top
          this.panelTop = Math.max(20, Math.min(y - 40, rect.height - 200))
          this.panelLeft = rect.left
          this.panelRight = Math.max(0, document.documentElement.clientWidth - rect.right)
        }
      } catch (err) {}
      // #endif
      try {
        getVisibleCategories({ page: 1, page_size: 50, sort_by: 'id', categories_id: id })
          .then((res) => {
            const items = Array.isArray(res?.data?.items) ? res.data.items : []
            this.leftChildren = items.map((it, i) => ({ name: it?.name || ('子分类' + (i + 1)), categories_id: it?.categories_id || it?.id || '', icon: (typeof it?.thumbnail === 'string' ? it.thumbnail.replace(/`/g, '').trim() : '') || (typeof it?.icon === 'string' ? it.icon.replace(/`/g, '').trim() : '' ) }))
          })
          .catch(() => { this.leftChildren = [] })
      } catch (e) { this.leftChildren = [] }
    },
    closeCategory() {
      this.activeCateId = ''
      this.activeCateName = ''
      this.leftChildren = []
    },
    onSearch(val) {
      const q = (val || this.keyword || '').trim()
      if (!q) { uni.showToast({ title: '请输入关键字', icon: 'none' }); return }
      // #ifdef H5
      uni.navigateTo({ url: '/pages/search/index?q=' + encodeURIComponent(q) })
      // #endif
      // #ifndef H5
      uni.navigateTo({ url: '/pages/search/index?q=' + encodeURIComponent(q) })
      // #endif
    },
    openCategory(cat) {
      // #ifdef H5
      const id = cat?.categories_id || ''
      if (!id) { uni.showToast({ title: '分类缺少ID', icon: 'none' }); return }
      // 再次点击同一一级分类时收缩关闭展开框
      if (this.activeCateId === id) {
        this.activeCateId = ''
        this.activeCateName = ''
        this.leftChildren = []
        return
      }
      // 展开并加载子分类
      this.activeCateId = id
      this.activeCateName = cat?.name || ''
      try {
        getVisibleCategories({ page: 1, page_size: 50, sort_by: 'id', categories_id: id })
          .then((res) => {
            const items = Array.isArray(res?.data?.items) ? res.data.items : []
            this.leftChildren = items.map((it, i) => ({ name: it?.name || ('子分类' + (i + 1)), categories_id: it?.categories_id || it?.id || '' }))
          })
          .catch(() => { this.leftChildren = [] })
      } catch (e) { this.leftChildren = [] }
      // #endif
      // #ifndef H5
      const aid = encodeURIComponent(cat?.categories_id || '')
      const aname = encodeURIComponent(cat?.name || '')
      const url = `/pages/category/index?active=${aname}&active_id=${aid}`
      if (uni.switchTab) { uni.switchTab({ url }) } else { uni.navigateTo({ url }) }
      // #endif
    },
    goSubList(sub) {
      // 仅 H5 展开面板内点击：跳转到子分类商品列表新页面
      // 传递父分类ID与当前子分类ID以用于顶部导航和内容加载
      const pid = encodeURIComponent(this.activeCateId || '')
      const cid = encodeURIComponent(sub?.categories_id || '')
      const pname = encodeURIComponent(this.activeCateName || '')
      if (!cid) { uni.showToast({ title: '子分类缺少ID', icon: 'none' }); return }
      const url = `/pages/category/list?parent_id=${pid}&category_id=${cid}&active=${pname}`
      this.closeCategory()
      uni.navigateTo({ url })
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
    },
    logout() {
      try {
        uni.removeStorageSync('user')
      } catch (e) { }
      this.user = null
      // uni.showToast({ title: '已退出登录', icon: 'success' })
      setTimeout(() => {
        uni.navigateTo({ url: '/pages/login/index' })
      }, 500)
    }
  }
}
</script>

<style scoped>
.page {
  background: white;
  /* #ifdef H5 */
  min-height: 100vh;
  /* #endif */
  /* #ifndef H5 */
  min-height: 100vh;
  padding-bottom: 20rpx;
  /* #endif */
}

/* H5 New Layout Styles */
/* #ifdef H5 */
.h5-container {
  max-width: 1350px;
  margin: 0 auto;
  padding: 0 100rpx;
  min-height: 100vh;
  background-color: #fff;
  padding-bottom: 60rpx;
}

/* Header */
.h5-header {
  display: flex;
  align-items: center;
  height: 140rpx; /* Increased height for better top spacing */
  padding: 30rpx 0;
  /* margin-bottom: 20rpx; */
}

.h5-logo-area {
  width: 300px; /* Match side-cate width */
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-text {
  font-size: 48rpx;
  font-weight: bold;
  font-family: serif;
  color: #000;
  letter-spacing: 2rpx;
}

.h5-search-wrapper {
  flex: 1;
  display: flex;
  justify-content: flex-start;
  padding-left: 20rpx; /* Align with gap */
  padding-right: 120rpx;
}

.search-bar-box {
  display: flex;
  align-items: center;
  width: 100%;
  height: 80rpx;
  border: 3rpx solid #000;
  border-radius: 40rpx;
  padding: 4rpx;
  background: #fff;
}

.search-type {
  padding: 0 30rpx;
  font-size: 30rpx;
  color: #333;
  font-weight: 500;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.arrow-down {
  font-size: 20rpx;
  margin-left: 10rpx;
  color: #666;
}

.divider-v {
  width: 2rpx;
  height: 30rpx;
  background: #ddd;
  margin-right: 16rpx;
}

.search-input-field {
  flex: 1;
  height: 100%;
  font-size: 30rpx;
}

.search-btn-black {
  background: #000;
  color: #fff;
  border-radius: 36rpx;
  font-size: 30rpx;
  font-weight: bold;
  height: 70rpx;
  line-height: 70rpx;
  padding: 0 50rpx;
  margin-right: 4rpx;
}

/* Middle Layout */
.h5-middle-layout {
  display: grid;
  grid-template-columns: 300px 1fr 300px;
  gap: 20rpx;
  height: 720rpx;
  margin-bottom: 40rpx;
  align-items: stretch;
}

.side-cate {
  background: #f8f8f8;
  border-radius: 12rpx;
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  width:60%;
  /* align-items: center; */
  /* text-align: center; */
  height: 100%;
  box-sizing: border-box;
}

.cate-title {
  font-size: 32rpx;
  font-weight: bold;
  padding-bottom: 20rpx;
  display: flex;
  /* align-items: center; */
  /* justify-content: center; */
  color: #000;
  border-bottom: 1rpx solid #eee;
  margin-bottom: 10rpx;
}

.cate-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  /* justify-content: space-between; */
  overflow-y: auto;
}

.cate-item {
  display: flex;
  align-items: center;
  padding: 16rpx 0;
  cursor: pointer;
  color: #333;
  font-size: 32rpx; /* 分类字体加大 */
  transition: all 0.2s;
  /* justify-content: center; */
}

.cate-item:hover {
  color: #000;
  font-weight: bold;
}

.cate-dot { margin-right: 12rpx; font-size: 32rpx; color: #000; }
.cate-name { font-size: 32rpx; }

/* Center Banner */
.center-content {
  position: relative;
  border-radius: 12rpx;
  overflow: hidden;
  height: 100%;
  box-sizing: border-box;
}

.full-height-banner {
  height: 100%;
}

.center-content :deep(.banner), .center-content :deep(.swiper) {
  height: 100% !important;
  padding: 0 !important;
}

.center-content :deep(.uni-swiper-wrapper) {
  border-radius: 12rpx;
}

/* User Card */
.side-user {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.user-card-new {
  background: #f8f8f8;
  border-radius: 24rpx;
  height: 100%;
  padding: 40rpx 30rpx;
  display: flex;
  flex-direction: column;
  box-shadow: none;
  box-sizing: border-box;
}

.uc-header {
  display: flex;
  align-items: center;
  margin-bottom: 50rpx;
}

.uc-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 20rpx;
  background: #fff;
  border: 2rpx solid #fff;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
}

.uc-info {
  flex: 1;
}

.uc-greet {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  line-height: 1.4;
}

.uc-links {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.uc-link-item {
  display: flex;
  align-items: center;
  font-size: 30rpx;
  color: #333;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
}

.uc-link-item:hover {
  color: #000;
}

.uc-icon {
  margin-right: 24rpx;
  font-size: 36rpx;
  width: 40rpx;
  text-align: center;
  filter: grayscale(100%) brightness(0);
  opacity: 1;
}

.uc-link-item:hover .uc-icon {
  filter: grayscale(100%) brightness(0);
  opacity: 0.8;
}

.uc-login-btn {
  background: #000;
  color: #fff;
  border-radius: 999rpx;
  width: 100%;
  font-size: 32rpx;
  font-weight: bold;
  height: 80rpx;
  line-height: 80rpx;
  margin-top: auto;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.2);
}

.uc-login-btn:active {
  transform: scale(0.98);
}

/* Bottom Section */
.h5-bottom-section {
  margin-top: 120rpx;
  padding-left: 110rpx;
  padding-right: 110rpx;
}

.guess-header {
  display: flex;
  align-items: center;
  margin-bottom: 40rpx;
  padding-left: 20rpx;
}

.guess-icon {
  width: 64rpx;
  height: 64rpx;
  background: #000;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  margin-right: 24rpx;
  font-size: 32rpx;
}

.guess-title {
  font-size: 40rpx;
  font-weight: 900;
  color: #333;
}

.grid2 {
  display: grid;
  grid-template-columns: repeat(6, 1fr) !important;
  gap: 30rpx;
}

/* Sub Panel */
.sub-panel {
  position: fixed;
  z-index: 999;
  background: rgba(255,255,255,0.98);
  border: 1rpx solid #eee;
  padding: 40rpx;
  box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.12);
  border-radius: 12rpx;
  min-width: 600rpx;
}

.panel-title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 30rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.panel-columns {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20rpx;
}

.panel-link {
  color: #666;
  font-size: 28rpx;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.panel-link:hover {
  color: #e1251b;
}

/* Responsive */
/* @media (max-width: 1200px) {
  .grid2 { grid-template-columns: repeat(4, 1fr); }
  .h5-middle-layout { grid-template-columns: 220rpx 1fr 260rpx; }
} */

/* Hide original components overrides */
.main :deep(.search-bar), .main :deep(.banner) {
  display: none;
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
  font-weight: 500;
  font-size: 35rpx;
  margin-left: 70rpx;
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
  grid-gap: 40rpx;
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

/* H5：右侧展开的子分类面板样式 */
.sub-panel {
  position: fixed;
  z-index: 1000;
  background-color: #fff;
  border-radius: 12rpx;
  box-shadow: 0 6rpx 18rpx rgba(0, 0, 0, 0.08);
  border: 1.5rpx solid #e1251b;
  height: clamp(240rpx, 38vh, 560rpx);
  max-height: 60vh;
  overflow-y: auto;
  padding: 30rpx 60rpx 60rpx;
}

.panel-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 12rpx;
}

.panel-columns {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30rpx 40rpx;
}

.panel-link {
  font-size: 32rpx;
  color: #333;
  line-height: 48rpx;
  display: flex;
  align-items: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.panel-link:hover {
  color: #e1251b;
}

.sub-icon {
  margin-right: 12rpx;
  font-size: 28rpx;
}

.sub-empty {
  font-size: 24rpx;
  color: #888;
  text-align: center;
  padding: 20rpx 0;
}
</style>
<style scoped>
.mp-cate-nav { white-space: nowrap; padding: 12rpx 20rpx; background: #fff; position: sticky; top: 0; z-index: 50; }
.mp-cate-item { display: inline-flex; flex-direction: column; align-items: center; justify-content: center; padding: 14rpx 18rpx; margin-right: 12rpx; border-radius: 16rpx; background: #fff; color: #333; font-size: 26rpx; box-shadow: 0 4rpx 12rpx rgba(0,0,0,.04); }
.mp-cate-thumb { width: 96rpx; height: 96rpx; background: #f5f5f5; border-radius: 12rpx; }
.mp-cate-name { margin-top: 8rpx; }
.mp-cate-item.active { background: #ffe9e3; color: #ff5000; }
</style>
