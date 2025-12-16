<template>
  <view class="page">
    <Skeleton :loading="loading" :showTitle="true" :showGrid="true" />
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
    // 拉取分类列表用于左侧分类栏
    try {
      getVisibleCategories({ page: 1, page_size: 50, sort_by: 'id' })
        .then((res) => {
          const items = Array.isArray(res?.data?.items) ? res.data.items : []
          const mapped = items.map((it, i) => ({ name: it?.name || ('分类' + (i + 1)), categories_id: it?.categories_id || it?.id || '', children: [] }))
          this.categories = mapped
          if (this.pendingActiveId) {
            const idxById = this.categories.findIndex(c => c.categories_id === this.pendingActiveId)
            if (idxById >= 0) {
              this.activeIndex = idxById
              this.loadChildrenById(this.pendingActiveId)
            }
            this.pendingActiveId = ''
            this.pendingActiveName = ''
          } else if (this.pendingActiveName) {
            const idx = this.categories.findIndex(c => c.name === this.pendingActiveName)
            if (idx >= 0) {
              this.activeIndex = idx
              const id = this.categories[idx].categories_id
              if (id) this.loadChildrenById(id)
            }
            this.pendingActiveName = ''
          } else {
            // 默认加载第一个分类的子分类（用于小程序端首次进入渲染右侧）
            if (this.categories.length) {
              this.activeIndex = 0
              const firstId = this.categories[0].categories_id
              if (firstId) this.loadChildrenById(firstId)
            }
          }
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
      if (id) this.loadChildrenById(id)
    },
    loadChildrenById(id) {
      try {
        getVisibleCategories({ page: 1, page_size: 50, sort_by: 'id', categories_id: id })
          .then((res) => {
            const items = Array.isArray(res?.data?.items) ? res.data.items : []
            const children = items.map((it, i) => ({ name: it?.name || ('子分类' + (i + 1)), icon: '', categories_id: it?.categories_id || it?.id || '' }))
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

/* #ifndef H5 */
.page {
  background: url('/static/product_detail_background.jpg') no-repeat center center fixed;
  background-size: cover;
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
  background: #fff;
  border-left-color: #e1251b;
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
