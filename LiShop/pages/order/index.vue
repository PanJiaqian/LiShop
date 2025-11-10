<template>
  <view class="page">
    <!-- 订单详情 -->
    <view class="order" v-if="order">
      <view class="header">
        <text class="title">订单号：{{ order.orderNo || order.id }}</text>
        <text class="time">下单时间：{{ formatTime(order.createdAt) }}</text>
        <text class="total">合计：¥{{ order.total.toFixed(2) }}</text>
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
                <text>¥{{ x.price.toFixed(2) }}</text>
                <text>× {{ x.quantity }}</text>
                <text>＝ ¥{{ (x.price * x.quantity).toFixed(2) }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      <view class="ops">
        <button class="btn" @click="exportExcel(order)">导出Excel</button>
      </view>
    </view>

    <!-- 订单列表（像淘宝一样展示列表与总额） -->
    <view class="orders" v-else>
      <view v-if="orders.length" class="orders-list">
        <view class="order-card" v-for="o in orders" :key="o.id">
          <view class="card-hd">
            <text class="id">订单号：{{ o.orderNo || o.id }}</text>
            <text class="time">下单时间：{{ formatTime(o.createdAt) }}</text>
            <text class="total">¥{{ o.total.toFixed(2) }}</text>
          </view>
          <view class="card-body">
            <view class="thumbs">
              <image v-for="(src,i) in firstThumbs(o)" :key="i" :src="src" mode="aspectFill" class="thumb" />
            </view>
            <view class="actions">
              <button size="mini" @click="openDetail(o.id)">查看详情</button>
            </view>
          </view>
        </view>
      </view>
      <view v-else class="empty">暂无订单</view>
    </view>
  </view>
</template>

<script>
export default {
  data() { return { order: null, orders: [] } },
  onLoad(query) {
    const id = Number(query?.id)
    const list = uni.getStorageSync('orders') || []
    if (id) {
      this.order = list.find(o => o.id === id) || null
    } else {
      this.orders = list
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
        return imgs.slice(0, 3)
      } catch { return [] }
    },
    exportExcel(order) {
      try {
        const header = ['房间','商品','型号','色温','长度','单价','数量','金额']
        let html = '<table border="1" cellspacing="0" cellpadding="4"><tr>' + header.map(h=>`<th>${h}</th>`).join('') + '</tr>'
        order.rooms.forEach(r => {
          r.items.forEach(x => {
            const row = [r.name, x.title, x.id, x.specTemp||'', x.specLength||'', x.price.toFixed(2), x.quantity, (x.price*x.quantity).toFixed(2)]
            html += '<tr>' + row.map(v=>`<td>${v}</td>`).join('') + '</tr>'
          })
        })
        html += '</table>'
        const blob = new Blob([`\ufeff${html}`], { type: 'application/vnd.ms-excel' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `订单_${order.id}.xls`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url)
        uni.showToast({ title: '已导出Excel', icon: 'success' })
      } catch (e) { uni.showToast({ title: '导出仅支持H5', icon: 'none' }) }
    }
  }
}
</script>

<style scoped>
.page { background: #f7f7f7; min-height: 100vh; }
.order { margin: 20rpx; background: #fff; border-radius: 12rpx; padding: 20rpx; }
.header { display:flex; justify-content:space-between; align-items:center; margin-bottom: 10rpx; }
.title { font-size: 28rpx; font-weight: 600; }
.time { color:#999; font-size: 24rpx; }
.total { color:#e1251b; font-size: 28rpx; font-weight: 600; }
.room { margin-top: 12rpx; }
.room-hd { display:flex; justify-content:space-between; align-items:center; background:#fff9f5; padding:12rpx; border-radius: 10rpx; color:#ff7b2b; }
.items { margin-top: 10rpx; }
.item { display:flex; justify-content:space-between; align-items:center; padding:12rpx 8rpx; border-bottom: 1rpx solid #f0f0f0; }
.item:last-child { border-bottom:none; }
.meta .title { display:block; font-size:26rpx; color:#333; }
.meta .spec { display:block; font-size:22rpx; color:#777; margin-top:4rpx; }
.price-row { display:flex; gap:12rpx; align-items:center; color:#333; }
.ops { margin-top: 16rpx; display:flex; justify-content:flex-end; }
.btn { background:#ff8c3a; color:#fff; border-radius: 8rpx; }
.empty { padding: 40rpx; text-align:center; color:#999; }

/* 列表样式 */
.orders { padding: 20rpx; }
.orders-list { display: grid; gap: 16rpx; }
.order-card { background:#fff; border-radius:12rpx; padding:16rpx; box-shadow:0 4rpx 12rpx rgba(0,0,0,.04); }
.card-hd { display:flex; justify-content:space-between; align-items:center; }
.card-hd .id { font-weight:600; }
.card-hd .total { color:#e1251b; font-weight:700; }
.card-body { display:flex; justify-content:space-between; align-items:center; margin-top:12rpx; }
.thumbs { display:flex; gap:12rpx; }
.thumb { width:120rpx; height:120rpx; border-radius:8rpx; background:#f5f5f5; }
.actions { }

/* 运单与物流 */
.waybill { display:flex; align-items:center; justify-content:space-between; background:#fff; border-radius:10rpx; padding:12rpx; margin: 10rpx 0; }
.waybill .copy { background:#eee; }
.logistics { background:#fff; border-radius:10rpx; padding:12rpx; margin-bottom: 8rpx; }
.log-item { display:flex; align-items:flex-start; gap:10rpx; padding:8rpx 0; border-bottom:1rpx solid #f0f0f0; }
.log-item:last-child { border-bottom:none; }
.dot { color:#ff7b2b; font-weight:700; line-height: 1.6; }
.log-status { font-weight:600; }
.log-desc { display:block; color:#555; }
.log-time { color:#999; font-size:22rpx; }
.log-place { color:#999; font-size:22rpx; }
</style>