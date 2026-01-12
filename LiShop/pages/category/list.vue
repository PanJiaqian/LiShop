<template>
  <view class="page">
    <Skeleton :loading="loading" :showTitle="true" :showGrid="true" />
    <image class="page-bg" src="/static/product_detail_background.jpg" mode="aspectFill" />
    <!-- #ifdef H5 -->
    <view class="h5-topbar">
      <button class="back-btn" @click="goBack">←</button>
      <view class="h5-search">
         <image src="/static/logo.png?v=20251211" style="width:240rpx;height:60rpx;margin-right:20rpx;" mode="aspectFit" />
        <view class="search-bar-box">
          <view class="search-type">宝贝<text class="arrow-down">∨</text></view>
          <view class="divider-v"></view>
          <input class="search-input-field" v-model="keyword" confirm-type="search" @confirm="onSearch(null)" />
          <button class="search-btn-black" @click="onSearch(null)">搜索</button>
        </view>
      </view>
    </view>
    <!-- #endif -->

    <scroll-view class="sub-nav" scroll-x>
      <view class="nav-wrap">
        <view v-for="(s, i) in subChildren" :key="i"
          :class="['nav-item', s.categories_id === activeChildId ? 'active' : '']" @click="selectChild(s)">
          <text class="nav-text">{{ s.name }}</text>
        </view>
      </view>
    </scroll-view>

    <view class="grid2">
      <view class="grid2-item" v-for="(p, idx) in items" :key="idx">
        <ProductCard :product="p" />
      </view>
    </view>

    <view class="empty" v-if="!loading && items.length === 0">暂无该子分类下的商品</view>

    <!-- #ifdef H5 -->
    <!-- Pager removed for infinite scroll -->
    <!-- #endif -->

    <!-- #ifdef H5 -->
    <FloatingNav :hoverReveal="true" />
    <!-- #endif -->

    <view class="loading" v-if="loading">正在加载...</view>
    <view class="nomore" v-if="!loading && page >= totalPages && items.length > 0">没有更多了</view>
  </view>
</template>

<script>
import ProductCard from '@/components/ProductCard.vue'
import FloatingNav from '@/components/FloatingNav.vue'
import Skeleton from '@/components/Skeleton.vue'
import { getVisibleCategories, getVisibleProducts } from '../../api/index.js'

export default {
  components: { ProductCard, FloatingNav, Skeleton },
  data() {
    return {
      keyword: '',
      parentId: '',
      activeChildId: '',
      activeName: '',
      subChildren: [],
      items: [],
      page: 1,
      page_size: 32,
      total: 0,
      loading: true
    }
  },
  computed: {
    totalPages() {
      const t = Number(this.total || 0)
      const ps = Number(this.page_size || 32)
      return t > 0 ? Math.ceil(t / ps) : 1
    },
    activeChildTitle() {
      const s = (this.subChildren || []).find(it => it.categories_id === this.activeChildId)
      return s ? (s.name || '') : ''
    }
  },
  onLoad(query) {
    this.parentId = decodeURIComponent(query?.parent_id || '')
    this.activeChildId = decodeURIComponent(query?.category_id || '')
    this.activeName = decodeURIComponent(query?.active || '')
  },
  onReachBottom() {
    if (this.page >= this.totalPages || this.loading) return
    this.fetchPage(this.page + 1, true)
  },
  onShow() {
    if (!this.parentId && !this.activeChildId) return
    this.loadSubChildren().then(() => {
      if (!this.activeChildId && this.subChildren.length) {
        this.activeChildId = this.subChildren[0].categories_id || ''
        this.activeName = this.subChildren[0].name || ''
      }
      if (this.activeChildId) this.fetchPage(1)
    })
    // #ifndef H5
    try { uni.setNavigationBarTitle({ title: this.activeName || '分类商品' }) } catch (e) { }
    // #endif
  },
  methods: {
    onSearch(val) {
      const q = (val || this.keyword || '').trim()
      if (!q) { uni.showToast({ title: '请输入关键字', icon: 'none' }); return }
      uni.navigateTo({ url: '/pages/search/index?q=' + encodeURIComponent(q) + '&category_name=' + encodeURIComponent(this.activeName || '') })
    },
    goBack() {
      if (typeof window !== 'undefined' && window.history && window.history.length > 1) { window.history.back(); return }
      if (uni && uni.switchTab) { uni.switchTab({ url: '/pages/category/index' }); return }
      if (uni && uni.navigateTo) { uni.navigateTo({ url: '/pages/category/index' }); return }
    },
    cleanImage(url) {
      if (typeof url !== 'string') return '/static/logo.png'
      const s = url.replace(/`/g, '').trim()
      return s || '/static/logo.png'
    },
    normalize(rows = []) {
      return rows.map((it, i) => ({
        id: it?.available_product_id || ('p' + i),
        title: it?.name || ('商品 ' + (i + 1)),
        price: Number(it?.price ?? 0) || 0,
        sales: 0,
        image: this.cleanImage(it?.main_image) || this.cleanImage(it?.thumbnail)
      }))
    },
    async loadSubChildren() {
      try {
        const res = await getVisibleCategories({ page: 1, page_size: 50, sort_by: 'id', categories_id: this.parentId || this.activeChildId })
        const items = Array.isArray(res?.data?.items) ? res.data.items : []
        this.subChildren = items.map((it, i) => ({ name: it?.name || ('子分类' + (i + 1)), categories_id: it?.categories_id || it?.id || '' }))
      } catch (e) {
        this.subChildren = []
      }
    },
    async fetchPage(nextPage = 1, append = false) {
      if (!this.activeChildId) return
      this.loading = true
      try {
        const res = await getVisibleProducts({ page: nextPage, page_size: this.page_size, sort_by: 'id', category_id: this.activeChildId })
        const rows = Array.isArray(res?.data?.items) ? res.data.items : []
        const total = Number(res?.data?.total ?? rows.length)
        const newItems = this.normalize(rows)
        if (append) {
          this.items = [...this.items, ...newItems]
        } else {
          this.items = newItems
        }
        this.total = total
        this.page = nextPage
      } catch (e) { }
      finally { this.loading = false }
    },
    selectChild(s) {
      this.activeChildId = s.categories_id
      this.activeName = s.name || ''
      this.fetchPage(1)
    },
    goPrev() {
      if (this.page <= 1 || this.loading) return
      this.fetchPage(this.page - 1)
    },
    goNext() {
      if (this.page >= this.totalPages || this.loading) return
      this.fetchPage(this.page + 1)
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  width: 100vw;
  box-sizing: border-box;
}

.page-bg {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
}

.h5-topbar {
  display: none;
}

.header {
  display: flex;
  align-items: baseline;
  padding: 20rpx 50rpx;
}

.title {
  font-size: 32rpx;
  font-weight: 600;
  margin-right: 16rpx;
}

.kw {
  font-size: 28rpx;
  color: #666;
}

.sub-nav {
  border-bottom: 1rpx solid #f0f0f0;
}

.nav-wrap {
  display: flex;
  gap: 80rpx;
  padding: 16rpx 60rpx;
  white-space: nowrap;
}

.nav-item {
  display: inline-flex;
  align-items: center;
  padding: 0;
  background: transparent;
  border-radius: 0;
}

.nav-text {
  font-size: 26rpx;
  color: #333;
}

.nav-item.active .nav-text {
  color: #333;
  font-weight: 600;
}

.grid2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 16rpx;
  padding: 20rpx;
}

.grid2-item {
  background: #fff;
  border-radius: 12rpx;
  overflow: hidden;
}

.loading {
  text-align: center;
  color: #999;
  padding: 20rpx;
}

.empty {
  height: 40vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
}

.nomore {
  text-align: center;
  color: #999;
  padding: 30rpx;
  font-size: 26rpx;
}

/* #ifdef H5 */
.h5-topbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20rpx;
  height: 120rpx;
  padding: 20rpx;
}

.back-btn {
  height: 60rpx;
  width: 60rpx;
  line-height: 60rpx;
  padding: 0;
  border: none !important;
  border-radius: 0;
  background: transparent !important;
  box-shadow: none !important;
  outline: none;
  color: #000;
  font-size: 44rpx;
  transition: background .2s, transform .2s, color .2s;
  margin-left: 20rpx;
}

.back-btn::after {
  border: none !important;
}

.back-btn:hover {
  transform: translateY(0.3rpx);
  font-weight: 500;
}

.h5-search {
  flex: 1;
  display: flex;
  /* justify-content: center; */
  align-items: center;
  margin-left: 200rpx;
  gap: 80rpx;
}

.search-bar-box {
  display: flex;
  align-items: center;
  width: 70%;
  /* max-width: 900rpx; */
  /* margin: 0 auto; */
  height: 80rpx;
  border: 3rpx solid #000;
  border-radius: 40rpx;
  padding: 4rpx;
  background: transparent !important;
}

.search-type {
  padding: 0 30rpx;
  font-size: 30rpx;
  color: #333;
  font-weight: 500;
  display: flex;
  align-items: center;
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
  background: transparent !important;
  color: #000;
}

.search-btn-black {
  background: #000;
  color: #fff;
  border-radius: 36rpx;
  font-size: 30rpx;
  font-weight: 700;
  height: 70rpx;
  line-height: 70rpx;
  padding: 0 50rpx;
  margin-right: 4rpx;
}

.sub-nav {
  margin-top: 120rpx;
}

.grid2 {
  grid-template-columns: repeat(8, minmax(0, 1fr));
  padding: 20rpx 80rpx;
  /* Add side spacing */
  grid-gap: 50rpx;
  /* Increase gap */
}

.header {
  padding: 20rpx 80rpx;
  /* Add side spacing */
}

.nav-wrap {
  padding: 16rpx 80rpx;
  /* Add side spacing */
}

.title {
  font-size: 38rpx !important;
}

.kw {
  font-size: 32rpx !important;
}

.nav-text {
  font-size: 32rpx !important;
}

.page {
  padding-bottom: 40rpx;
}

.page {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('/static/product_detail_background.jpg');
  background-size: cover;
  background-position: center;
  z-index: 0;
  overflow-y: auto;
  padding: 40rpx;
}

@media (max-width: 1440px) {
  .grid2 {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }
}

@media (max-width: 1024px) {
  .grid2 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .grid2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

/* #endif */
</style>
