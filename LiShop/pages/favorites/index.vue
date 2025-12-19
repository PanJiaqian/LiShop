<template>
  <view class="page">
    <Skeleton :loading="loading" :showTitle="true" />
    <view class="header">
      <text class="title">我的收藏</text>
    </view>
    <view v-if="favorites.length" class="grid">
      <view class="item" v-for="(it, i) in favorites" :key="i" @click="openProduct(it.id)">
        <image class="thumb" :src="it.image" mode="aspectFill" />
        <view class="info">
          <text class="name">{{ it.title }}</text>
          <text class="price">¥{{ it.price.toFixed(2) }}</text>
        </view>
      </view>
    </view>
    <view v-else-if="!loading" class="empty">暂无收藏</view>
  </view>
</template>

<script>
import Skeleton from '@/components/Skeleton.vue'
import { getFavorites } from '../../api/index.js'
export default {
  components: { Skeleton },
  data() {
    return {
      loading: true,
      favorites: []
    }
  },
  onShow() {
    try {
      const u = uni.getStorageSync('user') || null
      const token = (u && (u.token || (u.data && u.data.token))) || ''
      if (!token) { this.loading = false; return }
      getFavorites({ token }).then((res) => {
        const raw = Array.isArray(res?.data?.items) ? res.data.items
          : (Array.isArray(res?.items) ? res.items
            : (Array.isArray(res?.data?.children) ? res.data.children
              : (Array.isArray(res?.data?.list) ? res.data.list
                : (Array.isArray(res?.data) ? res.data : []))))
        this.favorites = (raw || []).map((it, i) => {
          const img = (typeof it?.main_image === 'string' ? it.main_image.replace(/`/g, '').trim() : '')
            || (typeof it?.image === 'string' ? it.image.replace(/`/g, '').trim() : '')
            || (typeof it?.thumbnail === 'string' ? it.thumbnail.replace(/`/g, '').trim() : '')
            || '/static/logo.png'
          return {
            id: it?.available_product_id || it?.product_id || it?.id || ('f' + i),
            title: it?.name || it?.title || ('收藏 ' + (i + 1)),
            price: Number(it?.price ?? 0) || 0,
            image: img
          }
        })
      }).catch(() => {
        this.favorites = []
      }).finally(() => { this.loading = false })
    } catch (e) { this.loading = false; this.favorites = [] }
  },
  methods: {
    openProduct(id) {
      if (!id) return
      const url = '/pages/product/index?id=' + encodeURIComponent(id)
      if (uni && uni.navigateTo) uni.navigateTo({ url })
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 20rpx;
  box-sizing: border-box;
  background: #f7f7f7;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}
.title {
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
}
.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 20rpx;
}
.item {
  background: #fff;
  border: 1rpx solid #eee;
  border-radius: 12rpx;
  overflow: hidden;
}
.thumb {
  width: 100%;
  height: 300rpx;
  background: #f5f5f5;
}
.info {
  padding: 16rpx;
}
.name {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 12rpx;
}
.price {
  display: block;
  font-size: 26rpx;
  color: #e1251b;
}
.empty {
  text-align: center;
  color: #999;
  font-size: 28rpx;
  padding: 60rpx 0;
}
</style>

