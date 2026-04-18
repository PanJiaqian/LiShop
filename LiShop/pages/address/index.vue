<template>
  <view class="page address-list-page">
    <Skeleton :loading="loading" :showTitle="true" />
    <view class="address-list" v-if="addressList.length > 0">
      <view class="address-item" v-for="(item, index) in addressList" :key="item.addresses_id"
        @click="editAddress(item.addresses_id)">
        <view class="info">
          <view class="user-info">
            <text class="name">{{ item.receiver }}</text>
            <text class="phone">{{ item.phone }}</text>
            <text v-if="item.is_default === 1" class="tag">默认</text>
          </view>
          <view class="address-detail">
            {{ item.province }}{{ item.city }}{{ item.district }}{{ item.detail_address }}
          </view>
        </view>
        <view class="actions">
          <text class="btn-edit" @click.stop="editAddress(item.addresses_id)">编辑</text>
          <text class="btn-delete" @click.stop="handleDelete(item.addresses_id)">删除</text>
        </view>
      </view>
    </view>
    <view v-else class="empty-state">
      <text>暂无收货地址</text>
    </view>

    <view class="footer">
      <button class="btn-add" @click="addAddress">新建收货地址</button>
    </view>
  </view>
</template>

<script>
/**
 * 地址列表页面模块
 * - 登录态下加载收货地址列表
 * - 提供新增/编辑/删除地址入口
 */
import Skeleton from '@/components/Skeleton.vue'
import { getAddresses, deleteAddress } from '../../api/index.js'

export default {
  components: { Skeleton },
  data() {
    return {
      addressList: [],
      loading: true
    }
  },
  onShow() {
    this.loadAddresses()
  },
  methods: {
    loadAddresses() {
      this.loading = true
      const u = uni.getStorageSync('user')
      const token = (u && (u.token || (u.data && u.data.token))) || ''
      if (!token) {
        uni.showToast({ title: '请先登录', icon: 'none' })
        setTimeout(() => uni.navigateTo({ url: '/pages/login/index' }), 1500)
        this.loading = false
        return
      }

      getAddresses({ token }).then(res => {
        if (res && res.success) {
          this.addressList = res.data.items || []
        }
      }).catch(err => {
        console.error(err)
        uni.showToast({ title: '获取地址失败', icon: 'none' })
      }).finally(() => { this.loading = false })
    },
    addAddress() {
      uni.navigateTo({ url: '/pages/address/edit' })
    },
    editAddress(id) {
      uni.navigateTo({ url: `/pages/address/edit?id=${id}` })
    },
    handleDelete(id) {
      uni.showModal({
        title: '提示',
        content: '确定要删除该地址吗？',
        success: (res) => {
          if (res.confirm) {
            const u = uni.getStorageSync('user')
            const token = (u && (u.token || (u.data && u.data.token))) || ''
            deleteAddress({ addresses_id: id, token }).then(resp => {
              if (resp && resp.success) {
                uni.showToast({ title: '删除成功', icon: 'success' })
                this.loadAddresses()
              } else {
                uni.showToast({ title: resp.message || '删除失败', icon: 'none' })
              }
            }).catch(err => {
              uni.showToast({ title: '删除失败', icon: 'none' })
            })
          }
        }
      })
    }
  }
}
</script>

<style>
.page {
  padding-bottom: 100rpx;
  background-color: #1a1a1a;
  min-height: 100vh;
}

/* #ifdef MP-WEIXIN */
.page {
  /* background: url('/static/product_detail_background.jpg') no-repeat center center fixed; */
  /* background-size: cover; */
  background-color: #1a1a1a;
}
/* #endif */

.address-list {
  padding: 20rpx;
}

.address-item {
  background-color: #2c2c2c;
  border-radius: 10rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info {
  flex: 1;
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 10rpx;
}

.name {
  font-size: 32rpx;
  font-weight: bold;
  margin-right: 20rpx;
  color: #ffffff;
}

.phone {
  color: #aaaaaa;
  font-size: 28rpx;
  margin-right: 20rpx;
}

.tag {
  background-color: #e1251b;
  color: #fff;
  font-size: 20rpx;
  padding: 2rpx 10rpx;
  border-radius: 4rpx;
  margin-left: 10rpx;
}

.address-detail {
  color: #dddddd;
  font-size: 28rpx;
  line-height: 1.4;
}

.actions {
  display: flex;
  flex-direction: column;
  margin-left: 20rpx;
  align-items: flex-end;
}

.btn-edit,
.btn-delete {
  display: inline-block;
  padding: 10rpx 30rpx;
  border-radius: 30rpx;
  border: 1rpx solid #444444;
  margin-bottom: 10rpx;
  text-align: center;
  font-size: 26rpx;
}

.btn-edit {
  color: #dddddd;
  border-color: #444444;
}

.btn-delete {
  color: #e1251b;
  border-color: #e1251b;
  margin-top: 10rpx;
}

.empty-state {
  padding: 100rpx;
  text-align: center;
  color: #777777;
}

.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx;
  background-color: #2c2c2c;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.3);
}

.btn-add {
  background-color: #e1251b;
  color: #fff;
  border-radius: 40rpx;
  font-size: 32rpx;
}

/* #ifdef H5 */
.address-list-page {
  padding-left: 600rpx;
  padding-right: 600rpx;
  box-sizing: border-box;
}

.footer {
  padding-left: 170rpx;
  /* 150 + 20 original */
  padding-right: 170rpx;
}

.btn-add {
  width: 30%;
  /* Reduce width */
  margin: 0 auto;
}

/* #endif */
</style>
