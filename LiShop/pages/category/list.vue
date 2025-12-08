<template>
  <view class="page">
    <!-- <view class="header">
      <text class="title">分类商品</text>
      <text class="kw" v-if="activeName">{{ activeName }}</text>
    </view> -->

    <scroll-view class="sub-nav" scroll-x>
      <view class="nav-wrap">
        <view
          v-for="(s, i) in subChildren"
          :key="i"
          :class="['nav-item', s.categories_id === activeChildId ? 'active' : '']"
          @click="selectChild(s)"
        >
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
    <view class="pager" v-if="items.length > 0">
      <view class="pg-bar">
        <button size="mini" class="pg-btn" :disabled="page<=1 || loading" @click="goPrev"><</button>
        <text class="pg-text">第 {{ page }} / {{ totalPages }} 页，共 {{ total }} 条</text>
        <button size="mini" class="pg-btn" :disabled="page>=totalPages || loading" @click="goNext">></button>
      </view>
    </view>
    <!-- #endif -->

    <view class="loading" v-if="loading">正在加载...</view>
  </view>
  </template>

<script>
import ProductCard from '@/components/ProductCard.vue'
import { getVisibleCategories, getVisibleProducts } from '../../api/index.js'

export default {
  components: { ProductCard },
  data() {
    return {
      parentId: '',
      activeChildId: '',
      activeName: '',
      subChildren: [],
      items: [],
      page: 1,
      page_size: 32,
      total: 0,
      loading: false
    }
  },
  computed: {
    totalPages() {
      const t = Number(this.total || 0)
      const ps = Number(this.page_size || 32)
      return t > 0 ? Math.ceil(t / ps) : 1
    }
  },
  onLoad(query) {
    this.parentId = decodeURIComponent(query?.parent_id || '')
    this.activeChildId = decodeURIComponent(query?.category_id || '')
    this.activeName = decodeURIComponent(query?.active || '')
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
  },
  methods: {
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
        image: this.cleanImage(it?.thumbnail)
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
    async fetchPage(nextPage = 1) {
      if (!this.activeChildId) return
      this.loading = true
      try {
        const res = await getVisibleProducts({ page: nextPage, page_size: this.page_size, sort_by: 'id', category_id: this.activeChildId })
        const rows = Array.isArray(res?.data?.items) ? res.data.items : []
        const total = Number(res?.data?.total ?? rows.length)
        this.items = this.normalize(rows)
        this.total = total
        this.page = nextPage
      } catch (e) {}
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
  background: #f7f7f7;
  min-height: 100vh;
  width: 100vw;
  box-sizing: border-box;
}
.header {
  display: flex;
  align-items: baseline;
  padding: 20rpx 50rpx;
}
.title { font-size: 32rpx; font-weight: 600; margin-right: 16rpx; }
.kw { font-size: 28rpx; color: #666; }

.sub-nav { background: #fff; border-bottom: 1rpx solid #f0f0f0; }
.nav-wrap { 
   display: flex;
   gap: 80rpx; 
   padding: 16rpx 60rpx; 
   white-space: nowrap;
  }
.nav-item { display: inline-flex; align-items: center; padding: 0; background: transparent; border-radius: 0; }
.nav-text { font-size: 26rpx; color: #333; }
.nav-item.active .nav-text { color: #e1251b; font-weight: 600; }

.grid2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 16rpx;
  padding: 20rpx;
}
.grid2-item { background: #fff; border-radius: 12rpx; overflow: hidden; }

.pager { display: flex; align-items: center; justify-content: center; padding: 20rpx; flex-direction: column; }
.pg-bar { display: flex; align-items: center; justify-content: center; gap: 12rpx; }
.pg-btn { margin: 0 12rpx;font-weight: 900; }
.pg-text { margin: 0 12rpx; color: #666; }

.loading { text-align: center; color: #999; padding: 20rpx; }
.empty { height: 40vh; display: flex; align-items: center; justify-content: center; color: #999; }

/* #ifdef H5 */
.grid2 { 
  grid-template-columns: repeat(8, minmax(0, 1fr)); 
  padding: 20rpx 80rpx; /* Add side spacing */
  grid-gap: 50rpx; /* Increase gap */
}
.header {
  padding: 20rpx 80rpx; /* Add side spacing */
}
.nav-wrap {
  padding: 16rpx 80rpx; /* Add side spacing */
}
.title { font-size: 38rpx !important; }
.kw { font-size: 32rpx !important; }
.nav-text { font-size: 32rpx !important; }

.pager {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  /* background: #fff; */
  z-index: 99;
  /* box-shadow: 0 -4rpx 16rpx rgba(0,0,0,0.05); */
  padding: 30rpx;
}
.pg-text { font-size: 28rpx; }
.page {
  padding-bottom: 160rpx; /* Space for fixed pager */
}

@media (max-width: 1440px) {
  .grid2 { grid-template-columns: repeat(6, minmax(0, 1fr)); }
}
@media (max-width: 1024px) {
  .grid2 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}
@media (max-width: 640px) {
  .grid2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
/* #endif */
</style>
