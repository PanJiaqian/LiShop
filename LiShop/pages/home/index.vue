<template>
  <view class="page">
    <Skeleton :loading="loading" :showTitle="true" :showGrid="true" />
    <!-- H5 三栏布局（包含分类、我的、商品） -->
    <!-- #ifdef H5 -->
    <view class="h5-layout">
      <view class="side-cate">
        <view class="cate-title">全部分类</view>
        <view class="cate-list">
          <view class="cate-item" v-for="(c, i) in topCategories" :key="i" @mouseenter="hoverCategory(c, $event)">
            <text class="dot">•</text>
            <text class="cate-name">{{ c.name }}</text>
          </view>
        </view>
      </view>

      <view class="main">
        <SearchBar v-model="keyword" @search="onSearch" />
        <BannerSwiper :images="banners" />

        <!-- #ifdef H5 -->
        <view v-if="activeCateId" class="sub-panel" :style="{ top: panelTop + 'px', left: panelLeft + 'px', right: panelRight + 'px' }" @mouseleave="closeCategory">
          <view class="panel-title">
            <text>{{ activeCateName || '二级分类' }}</text>
          </view>
          <view class="panel-columns">
            <view class="panel-link" v-for="(s, si) in leftChildren" :key="si" @click="goSubList(s)">{{ s.name }}</view>
          </view>
          <view v-if="!leftChildren || leftChildren.length === 0" class="sub-empty">暂无子分类</view>
        </view>
        <!-- #endif -->

        <!-- <view class="block">
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
        </view> -->

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
            <view class="u-link" v-if="user" @click="logout">退出登录</view>
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

          const fixed = ((res?.data?.fixed && Array.isArray(res.data.fixed.items)) ? res.data.fixed.items : [])
          const mapped = fixed.map((it, i) => ({
            id: it?.available_product_id || ('p' + i),
            title: it?.name || ('推荐商品 ' + (i + 1)),
            price: Number(it?.price ?? 0) || 0,
            sales: 0,
            image: (typeof it?.thumbnail === 'string' ? it.thumbnail.replace(/`/g, '').trim() : '') || '/static/logo.png'
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
        const main = document.querySelector('.main')
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
      try {
        const base = window.location.origin + window.location.pathname
        const url = base + '#/pages/search/index?q=' + encodeURIComponent(q)
        window.open(url, '_blank')
      } catch (e) {
        uni.navigateTo({ url: '/pages/search/index?q=' + encodeURIComponent(q) })
      }
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
      uni.showToast({ title: '已退出登录', icon: 'success' })
    }
  }
}
</script>

<style scoped>
.page {
  background: #f7f7f7;
  /* #ifdef H5 */
  height: 100vh;
  overflow: hidden;
  /* #endif */
  /* #ifndef H5 */
  min-height: 100vh;
  padding-bottom: 20rpx;
  /* #endif */
}

/* H5 三栏布局样式 */
/* #ifdef H5 */
.h5-layout {
  display: grid;
  grid-template-columns: 300rpx 1fr 320rpx;
  grid-gap: 70rpx;
  padding-left: 60rpx;
  padding-right: 160rpx;
  padding-top: 20rpx;
  /* padding: 50rpx; */
  height: 100%;
}

.side-cate {
  background: #fff;
  border-radius: 12rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, .06);
  height: 100%;
}

.cate-title {
  font-weight: 600;
  padding: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
  text-align: center;
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
  font-size: 52rpx;
}

.cate-item .cate-name {
  color: #333;
  font-size: 32rpx;
}

.sub-cat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-gap: 12rpx;
  padding: 0 20rpx 20rpx;
}

.sub-cat-item .sub-cat-card {
  background: #fff;
  border-radius: 12rpx;
  padding: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);
}

.sub-cat-name {
  color: #333;
  font-size: 26rpx;
}

.main {
  position: relative;
  height: 100%;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  background: #ffffff;
}
/* #ifdef H5 */
.main::-webkit-scrollbar { width: 0; height: 0; }
.main { scrollbar-width: none; -ms-overflow-style: none; }
/* #endif */
 

.side-user {
  height: 100%;
}

.user-card {
  background: #fff;
  border-radius: 12rpx;
  padding: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, .06);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: #f0f0f0;
  margin: 0 auto;
}

.u-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
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
  align-items: center;
}

.u-link {
  padding: 18rpx 0;
  color: #555;
  border-bottom: 1rpx solid #f0f0f0;
  text-align: center;
  width: 100%;
}

/* 右侧快捷入口与 H5 专属布局优化 */

.main .grid2 {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-gap: 60rpx;
  padding-left: 80rpx;
  padding-right: 80rpx;
}

.main :deep(.search-bar) {
  padding: 26rpx 40rpx;
  margin: 0 80rpx;
}

.main :deep(.search-input) {
  padding: 18rpx 28rpx;
}

.main :deep(.icon) {
  font-size: 34rpx;
}

.main :deep(.input) {
  font-size: 32rpx;
}

.main :deep(.swiper) {
  height: 500rpx;
}

.main :deep(.banner) {
  margin: 0 120rpx;
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
  grid-template-columns: repeat(8, 1fr);
  gap: 20rpx 24rpx;
}

.panel-link {
  font-size: 32rpx;
  color: #333;
  line-height: 48rpx;
}

.panel-link:hover {
  color: #e1251b;
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
