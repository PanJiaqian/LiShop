<template>
  <view class="page">
    <!-- #ifdef H5 -->
    <view class="cart-grid">
      <view class="cart-main">
        <view class="toolbar" v-if="cart.length">
          <view class="tool-left">
            <view class="chk all" @click="toggleAll">
              <view class="chk-ico" :class="{ on: isAllSelected }"></view>
              <text class="chk-txt">全选</text>
            </view>
          </view>
          <view class="tool-right">
            <button size="mini" class="btn-clear" @click="clearRemote">清空</button>
          </view>
        </view>

        <view v-if="cart.length" class="list h5">
          <view class="group" v-for="(grp, gi) in groups" :key="grp.name">
            <view class="group-header">
              <text class="room">{{ grp.name }}</text>
            </view>
            <view class="item" v-for="it in grp.items" :key="it.id">
            <view class="chk" @click="toggleById(it.id)">
              <view class="chk-ico" :class="{ on: it.selected }"></view>
            </view>
            <image class="cover" :src="it.image || '/static/logo.png'" mode="aspectFill" />
            <view class="meta">
              <view class="row-title">
                <text class="title">{{ it.title }}</text>
              </view>
              <view class="row-attr">
                <text class="attr-txt">{{ it.attr }}</text>
                <!-- <text class="attr-icon">﹀</text> -->
              </view>
              <view class="row-main">
                <view class="price-box">
                  <text class="price">¥{{ it.price.toFixed(2) }}</text>
                </view>
                <view class="qty-box">
                  <view class="qty-btn" @click.stop="decById(it.id)">-</view>
                  <text class="qty-num">{{ it.quantity }}</text>
                  <view class="qty-btn" @click.stop="incById(it.id)">+</view>
                </view>
                <view class="actions-col">
                  <!-- <text class="act-txt">移入收藏</text> -->
                  <text class="act-txt del" @click.stop="removeById(it.id)">删除</text>
                </view>
              </view>
            </view>
          </view>
          </view>
        </view>
        <view v-else class="empty">购物车空空如也~</view>
      </view>

      <view class="cart-aside">
        <view class="summary-card">
          <view class="sum-title">结算明细</view>
          <view class="sum-hint">实际优惠金额以下单页为准</view>
          <view v-if="selectedCount > 0" class="sum-body">
            <view class="thumbs">
              <image v-for="(src, i) in selectedThumbs" :key="i" :src="src" class="thumb" mode="aspectFill" />
            </view>
            <view class="rows">
              <view class="row">
                <text class="label">商品总价</text>
                <text class="value">¥{{ selectedTotal.toFixed(2) }}</text>
              </view>
              <view class="row">
                <text class="label">共减</text>
                <text class="value reduce">减 ¥{{ totalReduce.toFixed(2) }}</text>
              </view>
              <view class="row small">
                <text class="label">官方立减</text>
                <text class="value reduce">减 ¥{{ officialReduce.toFixed(2) }}</text>
              </view>
              <view class="row small">
                <text class="label">红包</text>
                <text class="value reduce">减 ¥{{ redReduce.toFixed(2) }}</text>
              </view>
            </view>
            <view class="coupon-bar">
              <text class="coupon-txt">消费券｜再实付{{ needForCoupon }}享满800减80</text>
              <text class="coupon-action">凑单›</text>
            </view>
            <view class="row total">
              <text class="label">合计：</text>
              <view class="total-box">
                <text class="pay">¥{{ payable.toFixed(2) }}</text>
                <text class="total-reduce">共减 ¥ {{ totalReduce.toFixed(2) }}</text>
              </view>
            </view>
            <button class="checkout" @click="checkout">结算({{ selectedCount }})</button>
          </view>
          <view v-else class="sum-empty">
            <view class="empty-ico">🛒</view>
            <view class="empty-tip">选择商品查看实际支付价格</view>
            <view class="row total">
              <text class="label">合计：</text>
              <view class="total-box">
                <text class="pay">¥0</text>
              </view>
            </view>
            <button class="checkout disabled">结算</button>
          </view>
        </view>
      </view>
    </view>
    <!-- #endif -->

    <!-- #ifndef H5 -->
    <view v-if="cart.length" class="list">
      <view class="group" v-for="(grp, gi) in groups" :key="grp.name">
        <view class="group-header">
          <text class="room" @click="openRoomPopup(grp)">{{ grp.name }} ▾</text>
        </view>
        <view class="item" v-for="it in grp.items" :key="it.id">
          <view class="chk" @click="toggleById(it.id)">
            <view class="chk-ico" :class="{ on: it.selected }"></view>
          </view>
          <image class="cover" :src="it.image || '/static/logo.png'" mode="aspectFill" />
          <view class="meta">
            <view class="row-title">
              <text class="title">{{ it.title }}</text>
            </view>
            <view class="row-attr">
              <text class="attr-txt">{{ it.attr }}</text>
            </view>
            <view class="row-main">
              <view class="price-box">
                <text class="price">¥{{ it.price.toFixed(2) }}</text>
              </view>
              <view class="qty-box">
                <view class="qty-btn" @click.stop="decById(it.id)">-</view>
                <text class="qty-num">{{ it.quantity }}</text>
                <view class="qty-btn" @click.stop="incById(it.id)">+</view>
              </view>
              <view class="actions-col">
                <text class="act-txt del" @click.stop="removeById(it.id)">删除</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
    <view v-else class="empty">购物车空空如也~</view>

    <view class="footer">
      <view class="actions-left" @click="toggleAll">
        <view class="chk">
          <view class="chk-ico" :class="{ on: isAllSelected }"></view>
          <text class="chk-txt">全选</text>
        </view>
      </view>
      <text>合计：<text class="sum">¥{{ selectedTotal.toFixed(2) }}</text></text>
      <view class="actions">
        <button size="mini" @click="clear">清空</button>
        <button size="mini" class="checkout" :disabled="selectedCount === 0" @click="checkout">去结算({{ selectedCount
          }})</button>
      </view>
    </view>

    <!-- 房间选择弹窗 -->
    <view v-if="showRoomModal" class="spec-modal-mask" @click="closeRoomPopup">
      <view class="spec-modal room-modal" @click.stop>
        <view class="spec-header">
          <text class="spec-title">选择房间</text>
          <view class="spec-close" @click="closeRoomPopup">✕</view>
        </view>
        <scroll-view scroll-y class="spec-body">
          <view class="spec-list">
             <text v-for="r in rooms" :key="r.id" class="spec-opt" :class="{ active: targetGroup && targetGroup.name === r.name }" @click="selectRoom(r)">{{ r.name }}</text>
          </view>
        </scroll-view>
      </view>
    </view>
    <!-- #endif -->

    <!-- #ifdef H5 -->
    <FloatingNav />
    <!-- #endif -->

    <!-- 规格选择弹窗 -->
    <view v-if="showSpecModal" class="spec-modal-mask" @click="closeSpecPopup">
      <view class="spec-modal" @click.stop>
        <view class="spec-header">
          <image class="spec-img" :src="editingItem.image || '/static/logo.png'" mode="aspectFill"></image>
          <view class="spec-info">
            <text class="spec-price">¥{{ editingItem.price }}</text>
            <text class="spec-selected">已选: {{ editingItem.attr }}</text>
          </view>
          <view class="spec-close" @click="closeSpecPopup">✕</view>
        </view>
        <scroll-view scroll-y class="spec-body">
          <view class="spec-group">
            <text class="spec-title">系列</text>
            <view class="spec-list">
              <text class="spec-opt active">苹果17系列钢化膜</text>
              <text class="spec-opt">苹果17系列手机壳</text>
              <text class="spec-opt">苹果16-15系列手机贴膜</text>
            </view>
          </view>
          <view class="spec-group">
            <text class="spec-title">颜色</text>
            <view class="spec-list">
              <text class="spec-opt">专业版-Asahi抑菌基材</text>
              <text class="spec-opt active">专业版2片装-Asahi基材</text>
              <text class="spec-opt">过滤蓝光版-护眼认证</text>
            </view>
          </view>
           <view class="spec-group">
            <text class="spec-title">版本</text>
            <view class="spec-list">
              <text class="spec-opt active">iPhone16ProMax</text>
              <text class="spec-opt">16Plus/15Plus/14ProMax</text>
            </view>
          </view>
        </scroll-view>
        <view class="spec-footer">
          <button class="spec-btn cancel" @click="closeSpecPopup">取消</button>
          <button class="spec-btn confirm" @click="closeSpecPopup">确认</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import FloatingNav from '@/components/FloatingNav.vue'
import { getCartItems, deleteCartItem, clearCart, updateCartItem, getRooms } from '../../api/index.js'
export default {
  components: { FloatingNav },
  data() {
    return {
      cart: [],
      showSpecModal: false,
      editingItem: {},
      // 房间选择相关
      rooms: [],
      showRoomModal: false,
      targetGroup: null
    }
  },
  computed: {
    total() { return this.cart.reduce((s, it) => s + (it.price * (it.quantity || 1)), 0) },
    selectedTotal() { return this.cart.reduce((s, it) => s + (it.selected ? it.price * (it.quantity || 1) : 0), 0) },
    selectedCount() { return this.cart.filter(it => it.selected).length },
    isAllSelected() { return this.cart.length > 0 && this.selectedCount === this.cart.length },
    selectedThumbs() { return this.cart.filter(it => it.selected).slice(0, 2).map(it => it.image || '/static/logo.png') },
    officialReduce() { return this.cart.reduce((s, it) => s + (it.selected ? (it.officialReduce || 0) : 0), 0) },
    redReduce() { return this.cart.reduce((s, it) => s + (it.selected ? (it.redReduce || 0) : 0), 0) },
    extraReduce() { return this.cart.reduce((s, it) => s + (it.selected ? (it.reduce || 0) : 0), 0) },
    totalReduce() { return this.officialReduce + this.redReduce + this.extraReduce },
    payable() { return Math.max(0, this.selectedTotal - this.totalReduce) },
    needForCoupon() { const need = Math.max(0, 800 - this.payable); return need.toFixed(2) },
    groups: function () {
      try {
        const map = {};
        (this.cart || []).forEach(it => {
          const key = it.roomName || '默认房间'
          if (!map[key]) map[key] = []
          map[key].push(it)
        })
        return Object.keys(map).map(name => ({ name, items: map[name] }))
      } catch (e) {
        console.error('groups computed error', e)
        return []
      }
    }
  },
  onShow() {
    this.load()
    // #ifdef H5
    try { uni.hideTabBar({ animation: false }) } catch (e) { }
    // #endif
  },
  methods: {
    load() {
      getCartItems()
        .then((res) => {
          const isEmpty = typeof res === 'string' && (res.includes('空') || res === '当前购物车为空')
          if (isEmpty) { this.cart = []; return }

          const payload = res && res.data && typeof res.data === 'object' ? res.data : res
          const groups = Array.isArray(payload?.groups) ? payload.groups : []
          const list = []
          for (const g of groups) {
            const roomName = g && g.room_name ? g.room_name : ''
            const items = Array.isArray(g && g.items) ? g.items : []
            for (const x of items) {
              list.push({
                id: (x && x.id) ? x.id : '',
                title: (x && x.product_id) ? x.product_id : '',
                productId: (x && x.product_id) ? x.product_id : '',
                price: Number((x && x.price) !== undefined ? x.price : 0) || 0,
                quantity: Number((x && x.quantity) !== undefined ? x.quantity : 1) || 1,
                image: '/static/logo.png',
                roomName: roomName || '默认房间',
                roomId: g.room_id || '',
                length: x.length || 1,
                color: x.color || '暖白',
                note: x.note || '',
                attr: ((x && x.length) ? ('长度 ' + x.length) : '') + ((x && x.note) ? (' ｜ ' + x.note) : ''),
                selected: false
              })
            }
          }
          this.cart = list
        })
        .catch((err) => {
          console.error('Get cart failed', err)
          try { this.cart = uni.getStorageSync('cart') || [] } catch (e) { this.cart = [] }
          this.cart = (this.cart || []).map(it => ({
            ...it,
            quantity: it.quantity || 1,
            selected: !!it.selected
          }))
        })
    },
    sync() { uni.setStorageSync('cart', this.cart) },
    findIndexById(id) { return this.cart.findIndex(it => it.id === id) },
    incById(id) {
      const i = this.findIndexById(id)
      if (i >= 0) {
        const item = this.cart[i]
        this.updateItemQuantity(item, item.quantity + 1)
      }
    },
    decById(id) {
      const i = this.findIndexById(id)
      if (i >= 0) {
        const item = this.cart[i]
        if (item.quantity > 1) {
          this.updateItemQuantity(item, item.quantity - 1)
        }
      }
    },
    updateItemQuantity(item, quantity) {
      updateCartItem({
        id: item.id,
        room_id: item.roomId,
        product_id: item.productId,
        length: item.length,
        quantity: quantity,
        color: item.color,
        note: item.note
      }).then(res => {
        if (res && res.success) {
          item.quantity = quantity
          this.sync()
        } else {
          uni.showToast({ title: '更新失败', icon: 'none' })
        }
      }).catch((err) => {
        console.error(err)
        uni.showToast({ title: '更新出错', icon: 'none' })
      })
    },
    removeById(id) {
      deleteCartItem({ id })
        .then(() => {
          const i = this.findIndexById(id); if (i >= 0) { this.cart.splice(i, 1); this.sync() }
          uni.showToast({ title: '已删除', icon: 'success' })
        })
        .catch(() => {
          const i = this.findIndexById(id); if (i >= 0) { this.cart.splice(i, 1); this.sync() }
          uni.showToast({ title: '本地删除', icon: 'none' })
        })
    },
    removeSelected() { this.cart = this.cart.filter(it => !it.selected); this.sync() },
    clearRemote() {
      clearCart()
        .then((res) => {
          if (res && res.success) {
            this.cart = []
            this.sync()
            uni.showToast({ title: '已清空', icon: 'success' })
          } else {
            uni.showToast({ title: (res && res.message) ? res.message : '清空失败', icon: 'none' })
          }
        })
        .catch(() => {
          uni.showToast({ title: '清空失败', icon: 'none' })
        })
    },
    toggleById(id) { const i = this.findIndexById(id); if (i >= 0) { this.cart[i].selected = !this.cart[i].selected; this.sync() } },
    toggleAll() {
      const makeSelected = !(this.selectedCount === this.cart.length && this.cart.length > 0)
      this.cart.forEach(it => it.selected = makeSelected)
      this.sync()
    },
    clear() { this.cart = []; this.sync() },
    checkout() {
      if (this.selectedCount === 0) { uni.showToast({ title: '请选择商品', icon: 'none' }); return }
      // 生成订单
      const selected = this.cart.filter(it => it.selected)
      const groupMap = {}
      selected.forEach(it => {
        const key = it.roomName || '默认房间'
        if (!groupMap[key]) groupMap[key] = []
        groupMap[key].push({
          id: it.id, title: it.title, price: it.price, quantity: it.quantity,
          specTemp: it.specTemp || '', specLength: it.specLength || '', roomName: key
        })
      })
      const rooms = Object.keys(groupMap).map(name => {
        const items = groupMap[name]
        const roomTotal = items.reduce((s, x) => s + x.price * x.quantity, 0)
        return { name, items, roomTotal }
      })
      const now = new Date()
      const id = Date.now()
      const orderNo = `JD${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(id).slice(-6)}`
      const waybillNo = `WB${Math.floor(Math.random() * 1e10).toString().padStart(10, '0')}`
      const baseTime = now.getTime()
      const tracking = [
        { time: new Date(baseTime).toISOString(), status: '已下单', desc: '订单已提交，等待商家处理', place: '系统' },
        { time: new Date(baseTime + 5 * 60 * 1000).toISOString(), status: '拣货中', desc: '商家正在为您拣货', place: '仓库' },
        { time: new Date(baseTime + 30 * 60 * 1000).toISOString(), status: '已揽收', desc: '快递已揽收包裹', place: '揽收点' }
      ]
      const order = { id, orderNo, waybillNo, createdAt: now.toISOString(), rooms, total: rooms.reduce((s, r) => s + r.roomTotal, 0), tracking }
      try {
        const orders = uni.getStorageSync('orders') || []
        uni.setStorageSync('orders', [order, ...orders])
        // 移除已选商品
        this.cart = this.cart.filter(it => !it.selected); this.sync()
        // 导出Excel（H5端下载）
        this.exportExcel(order)
        uni.showToast({ title: '已生成订单', icon: 'success' })
        uni.navigateTo({ url: '/pages/order/index?id=' + order.id })
      } catch (e) { console.error(e) }
    },
    exportExcel(order) {
      // 生成简单的Excel（HTML表格）
      try {
        const header = ['房间', '商品', '型号', '色温', '长度', '单价', '数量', '金额']
        let html = '<table border="1" cellspacing="0" cellpadding="4"><tr>' + header.map(h => `<th>${h}</th>`).join('') + '</tr>'
        order.rooms.forEach(r => {
          r.items.forEach(x => {
            const row = [r.name, x.title, x.id, x.specTemp || '', x.specLength || '', x.price.toFixed(2), x.quantity, (x.price * x.quantity).toFixed(2)]
            html += '<tr>' + row.map(v => `<td>${v}</td>`).join('') + '</tr>'
          })
        })
        html += '</table>'
        const blob = new Blob([`\ufeff${html}`], { type: 'application/vnd.ms-excel' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `订单_${order.id}.xls`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url)
      } catch (e) { /* 非H5端或环境不支持下载忽略 */ }
    },
    openSpecPopup(item) {
      this.editingItem = item
      this.showSpecModal = true
    },
    closeSpecPopup() {
      this.showSpecModal = false
      this.editingItem = {}
    },
    // 房间选择逻辑
    loadRooms() {
      getRooms().then(res => {
        const items = Array.isArray(res?.data?.items) ? res.data.items : []
        this.rooms = items.map(r => ({
          id: r.room_id,
          name: r.name
        }))
      }).catch(err => {
        console.error('Get rooms failed', err)
        this.rooms = (uni.getStorageSync('rooms') || []).map(n => ({ id: n, name: n }))
      })
    },
    openRoomPopup(group) {
      this.targetGroup = group
      this.showRoomModal = true
      if (this.rooms.length === 0) {
        this.loadRooms()
      }
    },
    closeRoomPopup() {
      this.showRoomModal = false
      this.targetGroup = null
    },
    selectRoom(room) {
      if (!this.targetGroup || !this.targetGroup.items) return
      const items = this.targetGroup.items
      // 批量更新该组下的商品到新房间
      // 由于API是单个更新，循环调用（优化：如果有批量接口更好，这里只能循环）
      uni.showLoading({ title: '移动中' })
      const promises = items.map(item => {
        return updateCartItem({
          id: item.id,
          room_id: room.id,
          product_id: item.productId,
          length: item.length,
          quantity: item.quantity,
          color: item.color,
          note: item.note
        })
      })

      Promise.all(promises).then(() => {
        uni.hideLoading()
        uni.showToast({ title: '已移动到 ' + room.name, icon: 'success' })
        this.closeRoomPopup()
        this.load() // 重新加载购物车
      }).catch(() => {
        uni.hideLoading()
        uni.showToast({ title: '移动部分失败', icon: 'none' })
        this.closeRoomPopup()
        this.load()
      })
    }
  }
}
</script>

<style scoped>
.page {
  background: #f7f7f7;
  min-height: 100vh;
  padding-bottom: 120rpx;
}

.list {
  background: #fff;
}

.item {
  display: flex;
  padding: 20rpx;
  border-bottom: 1px solid #f0f0f0;
}

.cover {
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
  background: #f5f5f5;
}

.meta {
  flex: 1;
  margin-left: 16rpx;
}

.title {
  font-size: 28rpx;
  color: #333;
  display: block;
}

.price {
  color: #e1251b;
  font-size: 30rpx;
  margin-top: 8rpx;
  display: block;
}

.qty {
  display: flex;
  align-items: center;
  margin-top: 12rpx;
}

.count {
  margin: 0 16rpx;
}

.del {
  margin-left: 12rpx;
}

.empty {
  padding: 60rpx;
  text-align: center;
  color: #999;
}

.footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  box-shadow: 0 -8rpx 20rpx rgba(0, 0, 0, .06);
  padding: 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sum {
  color: #e1251b;
  font-weight: 600;
}

.checkout {
  background: #ff5500;
  color: #fff;
}

/* 小程序端勾选样式 */
.actions-left {
  display: flex;
  align-items: center;
}

.actions-left .chk-ico {
  display: none;
}

.chk {
  width: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chk-ico {
  width: 28rpx;
  height: 28rpx;
  border-radius: 50%;
  border: 2rpx solid #ccc;
}

.chk-ico.on {
  background: #ff5500;
  border-color: #ff5500;
}

.chk-txt {
  margin-left: 8rpx;
  color: #333;
}

/* #ifdef H5 */
.footer {
  display: none;
}

.cart-grid {
  display: grid;
  grid-template-columns: 1fr 900rpx;
  grid-gap: 20rpx;
  padding: 20rpx;
}

.cart-main {
  background: #fff;
  border-radius: 12rpx;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 20rpx;
  border-bottom: 1px solid #f0f0f0;
}

.toolbar .chk {
  display: inline-flex;
  align-items: center;
  gap: 10rpx;
}

.toolbar .chk-ico {
  display: none;
}


.toolbar .chk-ico.on {
  background: #ff5500;
  border-color: #ff5500;
  box-shadow: 0 0 0 6rpx rgba(255, 85, 0, .12) inset;
}

.toolbar .chk-txt {
  font-size: 26rpx;
  color: #333;
  white-space: nowrap;
}

.btn-clear {
  background: #ff5500;
  color: #fff;
  border: none;
  border-radius: 999rpx;
  padding: 0 20rpx;
}

.list.h5 .item {
  display: flex;
  align-items: flex-start;
  padding: 20rpx;
  border-bottom: 1px solid #f0f0f0;
}

.list.h5 .cover {
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
  background: #f5f5f5;
}

.list.h5 .meta {
  flex: 1;
  margin-left: 16rpx;
  display: flex;
  flex-direction: column;
}

.cart-aside {}

.summary-card {
  position: relative;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, .06);
  border: 1rpx solid #eee;
}

.group-header {
  display: flex;
  align-items: center;
  padding: 12rpx 20rpx;
  background: #fff9f5;
  color: #ff7b2b;
  border-bottom: 1px solid #f0f0f0;
}

.group-header .room {
  font-weight: 600;
}

.sum-title {
  font-weight: 600;
  color: #333;
  font-size: 28rpx;
}

.sum-hint {
  position: absolute;
  right: 24rpx;
  top: 24rpx;
  color: #999;
  font-size: 22rpx;
}

.thumbs {
  display: flex;
  gap: 12rpx;
  margin-top: 16rpx;
}

.thumb {
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
  background: #f5f5f5;
  border: 1rpx solid #eee;
}

.rows {
  margin-top: 16rpx;
}

.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12rpx 0;
}

.row.small {
  color: #666;
}

.label {
  color: #333;
}

.value {
  color: #333;
}

.value.reduce {
  color: #ff5500;
}

.coupon-bar {
  margin-top: 12rpx;
  background: #ffe9ee;
  color: #e1242b;
  border-radius: 8rpx;
  padding: 12rpx 16rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.coupon-action {
  color: #e1242b;
}

.row.total {
  margin-top: 12rpx;
}

.total-box {
  text-align: right;
}

.pay {
  color: #e1251b;
  font-weight: 700;
  font-size: 34rpx;
}

.total-reduce {
  display: block;
  color: #999;
  font-size: 22rpx;
}

.sum-row {
  margin-top: 12rpx;
  color: #555;
}

.sum {
  color: #e1251b;
  font-weight: 600;
}

.summary-card .checkout {
  margin-top: 16rpx;
  width: 100%;
  background: linear-gradient(90deg, #ff7b2b, #ff5500);
  color: #fff;
  border-radius: 12rpx;
  height: 80rpx;
  font-size: 28rpx;
  box-shadow: 0 8rpx 16rpx rgba(255, 85, 0, .24);
}

.summary-card .checkout.disabled {
  opacity: .6;
  pointer-events: none;
}

.empty-ico {
  width: 140rpx;
  height: 140rpx;
  border-radius: 16rpx;
  background: #f8f8f8;
  display: grid;
  place-items: center;
  color: #cfcfcf;
  font-size: 60rpx;
  margin: 20rpx auto;
}

.cart-aside {
  position: sticky;
  top: 20rpx;
}

@media (max-width: 1024px) {
  .cart-grid {
    grid-template-columns: 1fr 400rpx;
  }
}

@media (max-width: 768px) {
  .cart-grid {
    grid-template-columns: 1fr;
  }

  .cart-aside {
    order: -1;
  }
}
/* #endif */

/* 新版商品卡片样式 */
.row-title {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  font-size: 26rpx;
  line-height: 36rpx;
  color: #333;
}
.tag {
  display: inline-block;
  background: #00c853;
  color: #fff;
  font-size: 20rpx;
  padding: 0 6rpx;
  border-radius: 4rpx;
  margin-right: 8rpx;
  vertical-align: middle;
}
.title { vertical-align: middle; }

.row-attr {
  background: #f7f7f7;
  border-radius: 8rpx;
  padding: 4rpx 12rpx;
  margin-top: 12rpx;
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  max-width: 100%;
}
.attr-txt { font-size: 22rpx; color: #666; margin-right: 8rpx; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.attr-icon { font-size: 20rpx; color: #999; }

.row-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16rpx;
}
.price-box { flex: 1; }
.price { color: #e1251b; font-size: 32rpx; font-weight: 700; }

.qty-box {
  display: flex;
  align-items: center;
  background: #f7f7f7;
  border-radius: 6rpx;
  height: 44rpx;
}
.qty-btn { width: 44rpx; height: 44rpx; display: flex; align-items: center; justify-content: center; color: #333; }
.qty-num { padding: 0 12rpx; font-size: 24rpx; color: #333; }

.actions-col {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-left: 20rpx;
}
.act-txt { font-size: 22rpx; color: #666; margin-bottom: 8rpx; }
.act-txt.del { margin-bottom: 0; }

.row-service {
  margin-top: 12rpx;
  display: flex;
  align-items: center;
}
.svc-tag { color: #e1251b; font-size: 20rpx; border: 1rpx solid #e1251b; padding: 0 4rpx; border-radius: 4rpx; margin-right: 8rpx; }
.svc-txt { color: #666; font-size: 22rpx; }

/* 规格弹窗样式 */
.spec-modal-mask {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}
.spec-modal {
  width: 600rpx;
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 80vh;
}
.spec-header {
  padding: 24rpx;
  display: flex;
  gap: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
  position: relative;
}
.spec-img { width: 120rpx; height: 120rpx; border-radius: 8rpx; background: #f5f5f5; }
.spec-info { display: flex; flex-direction: column; justify-content: center; }
.spec-price { color: #e1251b; font-size: 32rpx; font-weight: 700; margin-bottom: 8rpx; }
.spec-selected { color: #666; font-size: 24rpx; }
.spec-close {
  position: absolute;
  top: 20rpx; right: 24rpx;
  font-size: 36rpx; color: #999; padding: 10rpx;
}
.spec-body {
  padding: 24rpx;
  flex: 1;
  overflow-y: auto;
}
.spec-group { margin-bottom: 32rpx; }
.spec-title { font-size: 28rpx; color: #333; font-weight: 700; margin-bottom: 16rpx; display: block; }
.spec-list { display: flex; flex-wrap: wrap; gap: 16rpx; }
.spec-opt {
  padding: 10rpx 24rpx;
  background: #f7f7f7;
  border-radius: 8rpx;
  font-size: 24rpx;
  color: #333;
  border: 1rpx solid transparent;
}
.spec-opt.active {
  background: #fff5f5;
  color: #e1251b;
  border-color: #e1251b;
}
.spec-footer {
  padding: 20rpx;
  border-top: 1rpx solid #f0f0f0;
  display: flex;
  gap: 20rpx;
}
.spec-btn { flex: 1; font-size: 28rpx; border-radius: 999rpx; }
.spec-btn.cancel { background: #fff; border: 1rpx solid #ddd; color: #333; }
.spec-btn.confirm { background: #e1251b; color: #fff; border: none; }

</style>
