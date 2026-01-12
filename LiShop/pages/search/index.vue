<template>
  <view class="page">
    <Skeleton :loading="loading" :showTitle="true" :showGrid="true" />
    <view class="header">
      <text class="title">搜索结果</text>
      <text class="kw">{{ keyword }}</text>
    </view>

  <view class="grid2">
    <view class="grid2-item" v-for="(p, idx) in items" :key="idx">
      <ProductCard :product="p" />
    </view>
  </view>

  <view class="empty" v-if="!loading && items.length === 0">
      搜索结果为空,搜索其他商品试试吧~
    </view>

    <view class="loading" v-if="loading">正在加载...</view>
    <view class="nomore" v-if="finished && items.length > 0">没有更多了</view>
  </view>
</template>

<script>
import ProductCard from '@/components/ProductCard.vue'
import Skeleton from '@/components/Skeleton.vue'
import { searchProducts } from '../../api/index.js'

export default {
  components: { ProductCard, Skeleton },
  data() {
    return {
      keyword: '',
      category_name: '',
      items: [],
      page: 1,
      page_size: 20,
      total: 0,
      loading: true,
      finished: false
    }
  },
  computed: {
    totalPages() {
      const t = Number(this.total || 0)
      const ps = Number(this.page_size || 20)
      return t > 0 ? Math.ceil(t / ps) : 1
    },
    pageNumbers() {
      const n = this.totalPages
      return Array.from({ length: n }, (_, i) => i + 1)
    }
  },
  onLoad(query) {
    const q = decodeURIComponent(query?.q || '')
    const cname = decodeURIComponent(query?.category_name || '')
    this.keyword = q
    this.category_name = cname
    this.fetchPage(1, false)
  },
  // 小程序端下拉到底部加载更多
  onReachBottom() {
    if (this.loading || this.finished) return
    this.fetchPage(this.page + 1, true)
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
    fetchPage(nextPage = 1, append = false) {
      const q = (this.keyword || '').trim()
      if (!q) return
      this.loading = true
      searchProducts({ user_input: q, page: nextPage, page_size: this.page_size, sort_by: 'id', category_name: this.category_name })
        .then((res) => {
          const items = Array.isArray(res?.data?.items) ? res.data.items : []
          const total = Number(res?.data?.total ?? items.length)
          const list = this.normalize(items)
          this.total = total
          this.page = nextPage
          if (append) this.items = [...this.items, ...list]
          else this.items = list
          this.finished = this.page * this.page_size >= this.total
        })
        .catch(() => {})
        .finally(() => { this.loading = false })
    },
    goPrev() {
      if (this.page <= 1 || this.loading) return
      this.fetchPage(this.page - 1, false)
    },
    goNext() {
      if (this.page >= this.totalPages || this.loading) return
      this.fetchPage(this.page + 1, false)
    },
    goPage(n) {
      if (this.loading || n === this.page || n < 1 || n > this.totalPages) return
      this.fetchPage(n, false)
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

/* #ifdef MP-WEIXIN */
.page {
  background: url('/static/product_detail_background.jpg') no-repeat center center fixed;
  background-size: cover;
}
/* #endif */
.header {
  display: flex;
  align-items: baseline;
  padding: 20rpx;
}
.title { font-size: 32rpx; font-weight: 600; margin-right: 16rpx; }
.kw { font-size: 28rpx; color: #666; }

.grid2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 16rpx;
  padding: 20rpx;
}
.grid2-item { background: #fff; border-radius: 12rpx; overflow: hidden; }

.loading { text-align: center; color: #999; padding: 20rpx; }
.empty { height: 40vh; display: flex; align-items: center; justify-content: center; color: #999; }
.nomore { text-align: center; color: #999; padding: 12rpx; }

/* #ifdef H5 */
.grid2 { 
  grid-template-columns: repeat(8, minmax(0, 1fr)); 
  padding: 30rpx 100rpx;
  grid-gap: 50rpx;
}
.header {
  padding: 20rpx 80rpx;
}
.page {
  padding-bottom: 40rpx;
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
