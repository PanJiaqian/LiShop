<template>
  <view class="page">
    <!-- 顶部导航 -->
    <view class="nav" v-if="!order">
      <view class="nav-item" :class="{ active: activeTab === 'all' }" @click="switchTab('all')">全部订单</view>
      <view class="nav-item" :class="{ active: activeTab === 'pending_payment' }" @click="switchTab('pending_payment')">待付款</view>
      <view class="nav-item" :class="{ active: activeTab === 'pending_shipment' }" @click="switchTab('pending_shipment')">待发货</view>
      <view class="nav-item" :class="{ active: activeTab === 'pending_receipt' }" @click="switchTab('pending_receipt')">待收货</view>
      <!-- <view class="nav-item" :class="{ active: activeTab === 'history' }" @click="switchTab('history')">历史订单</view> -->
    </view>

    <!-- 订单详情 -->
    <view class="order" v-if="order">
      <view class="header">
        <text class="title">订单号：{{ order.orderNo || order.id }}</text>
        <text class="time" v-if="order.createdAt">下单时间：{{ formatTime(order.createdAt) }}</text>
        <!-- Total moved to footer for H5 and MP -->
        <!-- #ifndef H5 -->
        <!-- <text class="total">合计：¥{{ order.total.toFixed(2) }}</text> -->
        <!-- #endif -->
      </view>
      <view class="waybill" v-if="order.waybillNo">
        <text>运单号：{{ order.waybillNo }}</text>
        <button size="mini" class="copy" @click="copyWaybill(order.waybillNo)">复制运单号</button>
      </view>
      <view class="logistics" v-if="(order.tracking||[]).length">
        <view class="log-item" v-for="(ev,i) in order.tracking" :key="i">
          <view class="dot">•</view>
          <view class="log-meta">
            <text class="log-status">{{ ev.status }}</text>
            <text class="log-desc">{{ ev.desc }}</text>
            <text class="log-time">{{ formatTime(ev.time) }}</text>
            <text class="log-place" v-if="ev.place">{{ ev.place }}</text>
          </view>
        </view>
      </view>
      <view class="rooms">
        <view class="room" v-for="r in order.rooms" :key="r.name">
          <view class="room-hd">
            <text class="room-name">{{ r.name }}</text>
            <text class="room-total">小计：¥{{ r.roomTotal.toFixed(2) }}</text>
          </view>
          <view class="items">
            <view class="item" v-for="x in r.items" :key="x.id + '_' + x.specLength + '_' + x.specTemp">
              <view class="meta">
                <text class="title">{{ x.title }}</text>
                <text class="spec">型号：{{ x.id }}｜色温：{{ x.specTemp || '-' }}｜长度：{{ x.specLength || '-' }}</text>
              </view>
              <view class="price-row">
                <text class="price">¥{{ x.price.toFixed(2) }}</text>
                <text>× {{ x.quantity }}</text>
                <!-- #ifndef H5 -->
                <!-- <text>＝ ¥{{ (x.price * x.quantity).toFixed(2) }}</text> -->
                <!-- #endif -->
              </view>
            </view>
          </view>
        </view>
      </view>
      <view class="ops">
        <text class="total-text">合计：¥{{ order.total.toFixed(2) }}</text>
        <view class="btns">
            <button class="btn" v-if="order.status === 'pending_receipt'" @click="confirmReceipt(order.id)">确认收货</button>
            <button class="btn" v-if="['pending_payment', 'pending_shipment'].includes(order.status)" @click="handleCancelOrder(order.id)">取消订单</button>
            <button class="btn" @click="exportExcel(order)">导出Excel</button>
        </view>
      </view>
    </view>

    <!-- 订单列表 -->
    <view class="orders" v-else>
      <view v-if="orders.length" class="orders-list">
        <view class="order-card" v-for="o in orders" :key="o.id">
          <view class="card-hd">
            <text class="id">订单号：{{ o.orderNo || o.id }}</text>
            <text class="time" v-if="o.createdAt">下单时间：{{ formatTime(o.createdAt) }}</text>
            <text class="total">¥{{ o.total.toFixed(2) }}</text>
          </view>
          <view class="card-body">
            <view class="thumbs">
              <image v-for="(src,i) in firstThumbs(o)" :key="i" :src="src" mode="aspectFill" class="thumb" />
            </view>
            <view class="actions">
              <button size="mini" class="btn-action" v-if="o.status === 'pending_receipt'" @click.stop="confirmReceipt(o.orderNo || o.id)">确认收货</button>
              <button size="mini" class="btn-action" v-if="['pending_payment', 'pending_shipment'].includes(o.status)" @click.stop="handleCancelOrder(o.orderNo || o.id)">取消订单</button>
              <button size="mini" class="btn-action primary" @click.stop="openDetail(o.id)">查看详情</button>
            </view>
          </view>
        </view>
      </view>
      <view v-else class="empty">暂无订单</view>
    </view>
  </view>
</template>

<script>
import { getPendingPaymentOrders, getPendingShipmentOrders, getPendingReceiptOrders, getHistoryOrders, getOrderDetail, confirmOrderReceipt, cancelOrder, exportOrderExcel } from '../../api/index.js'
export default {
  data() { return { order: null, orders: [], activeTab: 'all' } },
  onLoad(query) {
    const id = query?.id
    if (id) {
      this.fetchDetail(id)
    } else {
      this.fetchOrders()
    }
  },
  methods: {
    formatTime(t) { try { return new Date(t).toLocaleString() } catch { return t } },
    copyWaybill(no) { try { uni.setClipboardData({ data: String(no) }); uni.showToast({ title: '已复制运单号', icon: 'success' }) } catch (e) {} },
    openDetail(id) { uni.navigateTo({ url: '/pages/order/index?id=' + id }) },
    firstThumbs(o) {
      try {
        const imgs = []
        o.rooms.forEach(r => r.items.forEach(x => imgs.push(x.image || '/static/logo.png')))
        return imgs.slice(0, 2)
      } catch { return [] }
    },
    async exportExcel(order) {
      try {
        // #ifdef MP-WEIXIN
        uni.showModal({ title: '提示', content: '小程序暂不支持导出', showCancel: false })
        return
        // #endif
        uni.showLoading({ title: '请求导出' })
        const res = await exportOrderExcel({ order_id: order.id })
        uni.hideLoading()
        if (res.success) {
            const msg = res.message || '导出请求已发送'
            uni.showToast({ title: msg, icon: 'success' })
            // #ifdef H5
            if (res.blob) {
                try {
                  const url = URL.createObjectURL(res.blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = res.filename || '订单导出.xlsx'
                  document.body.appendChild(a)
                  a.click()
                  a.remove()
                  try { URL.revokeObjectURL(url) } catch (e) {}
                  return
                } catch (e) {}
            }
            // #endif
            const possibleUrl = (res && res.url) || (res && res.data && res.data.url) || (res && res.data && typeof res.data === 'string' ? res.data : '')
            if (possibleUrl && typeof possibleUrl === 'string') {
                const url = possibleUrl
                // #ifdef H5
                try { window.open(url, '_blank') } catch (e) { window.location.href = url }
                // #endif
                // #ifndef H5
                uni.setClipboardData({ data: url, success: () => uni.showToast({ title: '下载链接已复制', icon: 'none' }) })
                // #endif
            } else {
                uni.showToast({ title: '未获取到导出链接', icon: 'none' })
            }
        } else {
            uni.showToast({ title: res.message || '导出失败', icon: 'none' })
        }
      } catch (e) {
        uni.hideLoading()
        uni.showToast({ title: '导出出错', icon: 'none' })
      }
    },
    
    mapApiOrderToLocal(apiOrder) {
      const roomsMap = {};
      (apiOrder.items || []).forEach(item => {
        const roomName = item.room_name || '默认房间';
        if (!roomsMap[roomName]) {
          roomsMap[roomName] = { name: roomName, roomTotal: 0, items: [] };
        }
        const localItem = {
          title: item.product_name || item.available_product_name,
          id: item.product_id || item.available_product_id,
          specTemp: item.color_temperature !== 'None' ? item.color_temperature : '',
          specLength: item.length,
          price: item.price,
          quantity: item.quantity,
          image: item.main_picture
        };
        roomsMap[roomName].items.push(localItem);
        roomsMap[roomName].roomTotal += (item.price * item.quantity);
      });
      return {
        id: apiOrder.order_id,
        orderNo: apiOrder.order_id,
        createdAt: null, // API doesn't provide created time in list
        total: apiOrder.total_price,
        waybillNo: apiOrder['tracking number'],
        tracking: apiOrder['logistics data'],
        status: apiOrder.status || 'unknown',
        rooms: Object.values(roomsMap)
      };
    },
    switchTab(tab) {
      this.activeTab = tab
      this.fetchOrders()
    },
    async fetchOrders() {
        uni.showLoading({ title: '加载中' })
        this.orders = []
        
        const allEndpoints = [
          { fn: getPendingPaymentOrders, status: 'pending_payment' },
          { fn: getPendingShipmentOrders, status: 'pending_shipment' },
          { fn: getPendingReceiptOrders, status: 'pending_receipt' },
          { fn: getHistoryOrders, status: '' }
        ]
        
        let endpoints = []
        if (this.activeTab === 'all') {
          endpoints = allEndpoints
        } else {
          const map = {
            'pending_payment': { fn: getPendingPaymentOrders, status: 'pending_payment' },
            'pending_shipment': { fn: getPendingShipmentOrders, status: 'pending_shipment' },
            'pending_receipt': { fn: getPendingReceiptOrders, status: 'pending_receipt' },
            'history': { fn: getHistoryOrders, status: '' }
          }
          if (map[this.activeTab]) endpoints = [map[this.activeTab]]
        }

        const seenIds = new Set()
        const allOrders = []
        for (const { fn, status } of endpoints) {
          try {
            const res = await fn()
            if (res.success && res.data && res.data.orders) {
              res.data.orders.forEach(o => {
                if (!seenIds.has(o.order_id)) {
                  seenIds.add(o.order_id)
                  if (status && !o.status) o.status = status
                  allOrders.push(this.mapApiOrderToLocal(o))
                }
              })
            }
          } catch (e) {}
        }
        this.orders = allOrders
        uni.hideLoading()
    },
    async fetchDetail(id) {
        try {
            const res = await getOrderDetail({ order_id: id })
            if (res.success && res.data) {
                this.order = this.mapApiOrderToLocal(res.data)
            }
        } catch (e) {}
    },
    async confirmReceipt(id) {
        try {
            const res = await confirmOrderReceipt({ order_id: id })
            if (res.success) {
                uni.showToast({ title: '确认收货成功', icon: 'success' })
                if (this.order && (this.order.id === id || this.order.orderNo === id)) {
                    this.fetchDetail(id)
                } else {
                    this.fetchOrders()
                }
            }
        } catch (e) {}
    },
    async handleCancelOrder(id) {
        uni.showModal({
            title: '提示',
            content: '确定要取消该订单吗？',
            success: async (res) => {
                if (res.confirm) {
                    try {
                        const res = await cancelOrder({ order_id: id })
                        if (res.success) {
                            uni.showToast({ title: '订单已取消', icon: 'success' })
                            if (this.order && (this.order.id === id || this.order.orderNo === id)) {
                                this.fetchDetail(id)
                            } else {
                                this.fetchOrders()
                            }
                        }
                    } catch (e) {
                         uni.showToast({ title: '取消失败', icon: 'none' })
                    }
                }
            }
        })
    }
  }
}
</script>

<style scoped>
.page { background: #f7f7f7; min-height: 100vh; }
.nav { 
  display: flex; 
  justify-content: space-around; 
  align-items: center; 
  background: #fff; 
  height: 88rpx; 
  border-bottom: 1rpx solid #f5f5f5; 
  margin-bottom: 20rpx;
  position: sticky;
  top: 0;
  z-index: 99;
}
.nav-item { position: relative; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 28rpx; color: #333; padding: 0 10rpx; }
.nav-item.active { color: #ff5000; font-weight: bold; font-size: 30rpx; }
.nav-item.active::after { content: ''; position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 40rpx; height: 4rpx; background: #ff5000; border-radius: 4rpx; }
/* #ifdef H5 */
.page { padding: 40rpx 600rpx; box-sizing: border-box; }
/* #endif */
/* #ifndef H5 */
.page { padding: 30rpx; box-sizing: border-box; }
/* #endif */
.order { margin: 20rpx 0; background: #fff; border-radius: 12rpx; padding: 20rpx; position: relative; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10rpx; }
.title { font-size: 28rpx; font-weight: 600; }
.time {
  color: #999;
  font-size: 24rpx;
  /* #ifdef MP-WEIXIN */
  white-space: nowrap;
  /* #endif */
}
.total { color: #e1251b; font-size: 28rpx; font-weight: 600; }
.room { margin-top: 12rpx; }
.room-hd { display: flex; justify-content: space-between; align-items: center; background: #fff9f5; padding: 12rpx; border-radius: 10rpx; color: #ff7b2b; }
.items { margin-top: 10rpx; }
.item { display: flex; justify-content: space-between; align-items: center; padding: 12rpx 8rpx; border-bottom: 1rpx solid #f0f0f0; }
.item:last-child { border-bottom: none; }
.meta { flex: 1; max-width: 50%; }
.meta .title { display: block; font-size: 26rpx; color: #333; }
.meta .spec { display: block; font-size: 22rpx; color: #777; margin-top: 4rpx; }
.price-row { display: flex; gap: 12rpx; align-items: center; color: #333; }
.ops { margin-top: 16rpx; display: flex; justify-content: flex-end; align-items: center; gap: 20rpx; }
.total-text { font-size: 28rpx; font-weight: 600; color: #e1251b; }
.btns { display: flex; gap: 20rpx; }
.btn { background: #ff8c3a; color: #fff; border-radius: 100rpx; margin: 0; padding: 0 30rpx; height: 60rpx; line-height: 60rpx; font-size: 26rpx; }
.empty { padding: 40rpx; text-align: center; color: #999; }

/* 列表样式 */
.orders { padding: 20rpx 0; }
.orders-list { display: grid; gap: 16rpx; }
.order-card { background: #fff; border-radius: 12rpx; padding: 16rpx; box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, .04); }
.card-hd { display: flex; justify-content: space-between; align-items: center; }
.card-hd .id { font-weight: 600; }
.card-hd .total { color: #e1251b; font-weight: 700; }
.card-body { display: flex; justify-content: space-between; align-items: center; margin-top: 12rpx; }
.thumbs { display: flex; gap: 12rpx; }
.thumb { width: 120rpx; height: 120rpx; border-radius: 8rpx; background: #f5f5f5; }
.actions { display: flex; gap: 16rpx; }
.btn-action { margin: 0; background: #fff; border: 1rpx solid #ddd; color: #666; border-radius: 100rpx; padding: 0 24rpx; height: 56rpx; line-height: 54rpx; font-size: 24rpx; }
.btn-action.primary { border-color: #ff5000; color: #ff5000; }

/* 运单与物流 */
.waybill { display: flex; align-items: center; justify-content: space-between; background: #fff; border-radius: 10rpx; padding: 12rpx; margin: 10rpx 0; }
.waybill .copy { background: #eee; margin: 0; }
.logistics { background: #fff; border-radius: 10rpx; padding: 12rpx; margin-bottom: 8rpx; }
.log-item { display: flex; align-items: flex-start; gap: 10rpx; padding: 8rpx 0; border-bottom: 1rpx solid #f0f0f0; }
.log-item:last-child { border-bottom: none; }
.dot { color: #ff7b2b; font-weight: 700; line-height: 1.6; }
.log-status { font-weight: 600; }

/* #ifdef H5 */
.waybill {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  margin: 0;
  background: transparent;
  padding: 0;
  flex-direction: column;
  align-items: flex-end;
  gap: 8rpx;
}
.item {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
.meta {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 20rpx;
  flex: 1;
}
.meta .title { margin-bottom: 0; }
.meta .spec { margin-top: 0; margin-left: 20rpx; }
.price-row { font-size: 36rpx; font-weight: bold; }
/* #endif */
</style>
