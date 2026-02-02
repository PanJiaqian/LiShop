<template>
  <view class="page">
    <Skeleton :loading="loading" :showTitle="true" :showGrid="true" />
    <!-- #ifdef MP-WEIXIN -->
    <image class="page-bg" src="/static/product_detail_background.jpg" mode="aspectFill" />
    <!-- #endif -->
    <view class="container">
      <scroll-view class="left" scroll-y>
        <view v-for="(c, idx) in categories" :key="idx" :class="['left-item', activeIndex === idx ? 'active' : '']"
          @click="selectCategory(idx)">
          <text>{{ c.name }}</text>
        </view>
      </scroll-view>
      <scroll-view class="right" scroll-y>
        <view class="right-wrap">
          <view class="sub-title">{{ activeCategory.name }}</view>
          <view class="sub-grid">
            <view class="sub-item" v-for="(s, i) in rightChildren" :key="i" @click="openList(s)">
              <image class="sub-icon" :src="s.icon || '/static/logo.png'" mode="aspectFill" />
              <text class="sub-name">{{ s.name }}</text>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>
    <!-- #ifdef H5 -->
    <FloatingNav />
    <!-- #endif -->
  </view>
</template>

<script>
import FloatingNav from '@/components/FloatingNav.vue'
import Skeleton from '@/components/Skeleton.vue'
import { getVisibleCategories } from '../../api/index.js'
export default {
  components: { FloatingNav, Skeleton },
  data() {
    return {
      loading: true,
      activeIndex: 0,
      categories: [],
      pendingActiveName: '',
      pendingActiveId: '',
      lastActiveId: '',
      rightChildren: []
    }
  },
  computed: {
    activeCategory() { return this.categories[this.activeIndex] || { name: '', children: [] } }
  },
  onShow() {
    // #ifdef H5
    try { uni.hideTabBar({ animation: false }) } catch (e) { }
    // #endif
    let rememberedId = ''
    // #ifndef H5
    try {
      const pid = uni.getStorageSync('category_pending_active_id') || ''
      if (pid) {
        this.pendingActiveId = pid
        try { uni.removeStorageSync('category_pending_active_id') } catch (e) {}
      }
    } catch (e) {}
    rememberedId = this.pendingActiveId || this.lastActiveId || (this.categories[this.activeIndex]?.categories_id || '')
    // #endif
    // 拉取分类列表用于左侧分类栏
    try {
      getVisibleCategories({ page: 1, page_size: 50, sort_by: 'id' })
        .then((res) => {
          const items = Array.isArray(res?.data?.items) ? res.data.items : []
          const mapped = items.map((it, i) => ({ name: it?.name || ('分类' + (i + 1)), categories_id: it?.categories_id || it?.id || '', children: [] }))
          this.categories = mapped
          let selectedId = ''
          if (this.pendingActiveId) {
            const idxById = this.categories.findIndex(c => c.categories_id === this.pendingActiveId)
            if (idxById >= 0) {
              this.activeIndex = idxById
              selectedId = this.pendingActiveId
            }
            this.pendingActiveId = ''
            this.pendingActiveName = ''
          } else if (this.pendingActiveName) {
            const idx = this.categories.findIndex(c => c.name === this.pendingActiveName)
            if (idx >= 0) {
              this.activeIndex = idx
              selectedId = this.categories[idx].categories_id || ''
            }
            this.pendingActiveName = ''
          } else {
            // #ifndef H5
            if (rememberedId) {
              const idxById = this.categories.findIndex(c => c.categories_id === rememberedId)
              if (idxById >= 0) {
                this.activeIndex = idxById
                selectedId = rememberedId
              }
            }
            // #endif
            if (!selectedId && this.categories.length) {
              this.activeIndex = 0
              selectedId = this.categories[0].categories_id || ''
            }
          }
          if (selectedId) this.loadChildrenById(selectedId)
          // #ifndef H5
          if (selectedId) this.lastActiveId = selectedId
          // #endif
          this.loading = false
        })
        .catch(() => { this.loading = false })
    } catch (e) { this.loading = false }
  },
  onLoad(query) {
    const q = decodeURIComponent(query?.active || '')
    const aid = decodeURIComponent(query?.active_id || '')
    this.pendingActiveName = q
    this.pendingActiveId = aid
  },
  methods: {
    selectCategory(idx) {
      this.activeIndex = idx
      const id = this.categories[idx]?.categories_id || ''
      // #ifndef H5
      this.lastActiveId = id || ''
      // #endif
      if (id) this.loadChildrenById(id)
    },
    loadChildrenById(id) {
      try {
        getVisibleCategories({ page: 1, page_size: 50, sort_by: 'id', categories_id: id })
          .then((res) => {
            const items = Array.isArray(res?.data?.items) ? res.data.items : []
            const children = items.map((it, i) => ({
              name: it?.name || ('子分类' + (i + 1)),
              icon: (typeof it?.image_url === 'string' ? it.image_url.replace(/`/g, '').trim() : '')
                || (typeof it?.thumbnail === 'string' ? it.thumbnail.replace(/`/g, '').trim() : '')
                || (typeof it?.icon === 'string' ? it.icon.replace(/`/g, '').trim() : ''),
              categories_id: it?.categories_id || it?.id || ''
            }))
            const idx = this.activeIndex
            const cat = this.categories[idx]
            if (cat) this.$set(this.categories, idx, { ...cat, children })
            this.rightChildren = children
          })
          .catch(() => {})
      } catch (e) {}
    },
    openList(sub) {
      const parentId = this.categories[this.activeIndex]?.categories_id || ''
      const cid = sub?.categories_id || ''
      const pname = this.activeCategory?.name || ''
      if (!cid) { uni.showToast({ title: '子分类缺少ID', icon: 'none' }); return }
      const url = `/pages/category/list?parent_id=${encodeURIComponent(parentId)}&category_id=${encodeURIComponent(cid)}&active=${encodeURIComponent(pname)}`
      uni.navigateTo({ url })
    }
  }
}
</script>

<style scoped>
.page {
  background: #f7f7f7;
  min-height: 100vh;
}

/* #ifdef MP-WEIXIN */
.page { position: relative; z-index: 1; }
.page-bg {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
}
/* #endif */

.container {
  display: flex;
  height: calc(100vh - 88rpx);
}

.left {
  width: 220rpx;
  background: #f5f5f5;
}

.left-item {
  padding: 24rpx;
  border-left: 6rpx solid transparent;
}

.left-item.active {
  background: #ddd;
  /* border-left-color: #333; */
  border-radius: 10px;
  font-weight: 600;
}

.right {
  flex: 1;
  background: #fff;
}

.right-wrap {
  padding: 20rpx 40rpx;
}

.sub-title {
  font-size: 33rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 12rpx;
}

.sub-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 16rpx;
}

.sub-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.sub-icon {
  width: 140rpx;
  height: 140rpx;
  border-radius: 12rpx;
  background: #f5f5f5;
}

.sub-name {
  margin-top: 12rpx;
  font-size: 26rpx;
}

/* #ifdef MP-WEIXIN */
.left-item, .sub-title, .sub-name {
  font-size: 28rpx !important;
}
/* #endif */
</style>
