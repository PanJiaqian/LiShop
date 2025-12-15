<template>
  <view class="page">
    <Skeleton :loading="loading" :showTitle="true" />
    <!-- #ifdef H5 -->
    <view class="cart-grid">
      <view class="cart-main">
        <view class="toolbar">
          <text class="review-title">购物车</text>
          <view class="tool-right">
            <view class="chk all btn-style" @click="toggleAll">
              <view class="chk-ico" :class="{ on: isAllSelected }"></view>
              <text class="chk-txt">选择全部</text>
            </view>
            <!-- <view class="chk btn-style" @click="removeSelected">
              <text class="chk-txt">Remove Selected 🗑️</text>
            </view> -->
          </view>
        </view>

        <view v-if="cart.length" class="list h5">
          <view class="group" v-for="(grp, gi) in groups" :key="grp.name">
            <view class="group-header">
              <!-- <text class="store-icon">🏠</text> -->
              <text class="room">{{ grp.name }}</text>
              <!-- <text class="arrow">></text> -->
            </view>
            <view class="item h5-row" v-for="it in grp.items" :key="it.id" :class="{ 'out-of-stock': it.isOutOfStock }">
              <view class="out-stock-mask" v-if="it.isOutOfStock"></view>
              <view class="chk" @click="toggleById(it.id)">
                <view class="chk-ico" :class="{ on: it.selected, disabled: it.isOutOfStock }"></view>
              </view>
              <image class="cover" :src="it.image || '/static/logo.png'" mode="aspectFill" />
              <text class="title">{{ it.title }}</text>
              <text class="attr-txt">{{ it.attr }}</text>
              <text class="price">¥{{ it.price.toFixed(2) }}</text>
              <view class="qty-box">
                  <view class="qty-btn" @click.stop="decById(it.id)">-</view>
                  <text class="qty-num">{{ it.quantity }}</text>
                  <view class="qty-btn" @click.stop="incById(it.id)">+</view>
              </view>
              <!-- <text class="del-btn" @click.stop="removeById(it.id)">删除</text> -->
              <view class="stock-tip" v-if="it.isOutOfStock">无货</view>
            </view>
          </view>
        </view>
        <view v-else class="empty">购物车空空如也~</view>
      </view>

      <view class="cart-aside">
        <view class="summary-card">
          <view class="sum-title">订单详情</view>
          
          <view class="addr-section">
            <view class="addr-label">收货地址</view>
            <view v-if="selectedAddress" class="addr-content">
              <view class="addr-top-row">
                <text class="addr-name">{{ selectedAddress.receiver }} {{ selectedAddress.phone }}</text>
                <button size="mini" class="btn-select-addr" @click="openAddressPicker">选择地址</button>
              </view>
              <text class="addr-detail">{{ selectedAddress.full }}</text>
            </view>
            <view v-else class="addr-empty">
               <text>请选择收货地址</text>
               <button size="mini" class="btn-select-addr" @click="openAddressPicker">选择地址</button>
            </view>
          </view>

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
            </view>
            <view class="row total">
              <text class="label">合计</text>
              <view class="total-box">
                <text class="pay">¥{{ payable.toFixed(2) }}</text>
              </view>
            </view>
            <view class="action-buttons">
              <button class="checkout" @click="checkout">结算</button>
            </view>
          </view>
          <view v-else class="sum-empty">
            <view class="empty-ico">🛒</view>
            <view class="empty-tip">选择商品查看实际支付价格</view>
            <view class="row total">
              <text class="label">合计</text>
              <view class="total-box">
                <text class="pay">¥ 0</text>
              </view>
            </view>
            <button class="checkout disabled">结算</button>
          </view>
        </view>
      </view>
    </view>
    <!-- #endif -->

    <!-- #ifndef H5 -->
    <view class="mp-address-bar">
      <view class="bar-left">
        <text class="addr-icon">📍</text>
        <view class="bar-info">
          <text v-if="selectedAddress" class="bar-line">{{ selectedAddress.receiver }} {{ selectedAddress.phone }}</text>
          <text v-if="selectedAddress" class="bar-line">{{ selectedAddress.full }}</text>
          <text v-else class="bar-line">未选择收货地址</text>
        </view>
      </view>
      <button size="mini" class="bar-btn" @click="openAddressPicker">选择收货地址</button>
    </view>
    <view v-if="cart.length" class="list">
      <view class="group" v-for="(grp, gi) in groups" :key="grp.name">
        <view class="group-header">
          <text class="room mp-room" @click="openRoomPopup(grp)">{{ grp.name }} ▾</text>
        </view>
        <view class="item" v-for="it in grp.items" :key="it.id" :class="{ 'out-of-stock': it.isOutOfStock }">
          <view class="out-stock-mask" v-if="it.isOutOfStock"></view>
          <view class="chk" @click="toggleById(it.id)">
            <view class="chk-ico" :class="{ on: it.selected, disabled: it.isOutOfStock }"></view>
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
              <view class="qty-box mp-qty-box">
                <view class="qty-btn mp-qty-btn" @click.stop="decById(it.id)">-</view>
                <text class="qty-num">{{ it.quantity }}</text>
                <view class="qty-btn mp-qty-btn" @click.stop="incById(it.id)">+</view>
              </view>
              <view class="actions-col">
                <!-- <text class="act-txt del" @click.stop="removeById(it.id)">删除</text> -->
              </view>
            </view>
            <view class="stock-tip" v-if="it.isOutOfStock">无货</view>
          </view>
        </view>
      </view>
    </view>
    <view v-else class="empty">购物车空空如也~</view>

    <view class="footer">
      <view class="actions-left" @click="toggleAll">
        <view class="chk btn-style">
          <view class="chk-ico" :class="{ on: isAllSelected }"></view>
          <text class="chk-txt">全选</text>
        </view>
      </view>
      <text>合计：<text class="sum">¥{{ selectedTotal.toFixed(2) }}</text></text>
      <view class="actions">
        <view class="footer-btn" @click="clear">清空</view>
        <!-- <view class="footer-btn" @click="handleExportExcel">导出Excel</view> -->
        <view class="footer-btn" :class="{ disabled: selectedCount === 0 }" @click="checkout">去结算({{ selectedCount }})</view>
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
    <view class="floating-back" @click="goBack">←</view>
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
    
    <RoomSelector 
      :visible="showAddressSelector" 
      :rooms="addressRooms" 
      type="addr"
      :selectedName="selectedAddress ? (selectedAddress.receiver + ' ' + selectedAddress.phone + ' ' + selectedAddress.full).trim() : ''"
      @close="showAddressSelector = false" 
      @select="onAddressSelect" 
      @createAddress="onCreateAddress"
    />
  </view>
</template>

<script>
import FloatingNav from '@/components/FloatingNav.vue'
import RoomSelector from '@/components/RoomSelector.vue'
import Skeleton from '@/components/Skeleton.vue'
import { getCartItems, deleteCartItem, clearCart, updateCartItem, getRooms, getCartItemsByIDs, createOrderByIds, exportOrderExcel, getAddresses, addAddress } from '../../api/index.js'
export default {
  components: { FloatingNav, RoomSelector, Skeleton },
  data() {
    return {
      loading: true,
      cart: [],
      showSpecModal: false,
      editingItem: {},
      // 房间选择相关
      rooms: [],
      showRoomModal: false,
      targetGroup: null,
      addresses: [],
      selectedAddress: null,
      showAddressSelector: false,
      summaryData: {
        total_price: 0,
        total_original: 0,
        is_free_shipping: 0
      }
    }
  },
  computed: {
    total() { return this.cart.reduce((s, it) => s + (it.price * (it.quantity || 1)), 0) },
    // selectedTotal() { return this.cart.reduce((s, it) => s + (it.selected ? it.price * (it.quantity || 1) : 0), 0) },
    selectedTotal() { return this.summaryData.total_price || 0 }, // 使用API返回的总价
    selectedCount() { return this.cart.filter(it => it.selected).length },
    isAllSelected() { 
        const validItems = this.cart.filter(it => !it.isOutOfStock)
        return validItems.length > 0 && validItems.every(it => it.selected)
    },
    selectedThumbs() { return this.cart.filter(it => it.selected).slice(0, 4).map(it => it.image || '/static/logo.png') },
    // officialReduce() { return this.cart.reduce((s, it) => s + (it.selected ? (it.officialReduce || 0) : 0), 0) },
    // redReduce() { return this.cart.reduce((s, it) => s + (it.selected ? (it.redReduce || 0) : 0), 0) },
    // extraReduce() { return this.cart.reduce((s, it) => s + (it.selected ? (it.reduce || 0) : 0), 0) },
    // totalReduce() { return this.officialReduce + this.redReduce + this.extraReduce },
    totalReduce() { return Math.max(0, (this.summaryData.total_original || 0) - (this.summaryData.total_price || 0)) },
    payable() { return this.summaryData.total_price || 0 },
    needForCoupon() { const need = Math.max(0, 800 - this.payable); return need.toFixed(2) },
    addressRooms() {
      return this.addresses.map(a => ({
        name: `${a.receiver} ${a.phone} ${a.full}`.trim(),
        raw: a
      }))
    },
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
    this.loadAddresses()
    // #ifdef H5
    try { uni.hideTabBar({ animation: false }) } catch (e) { }
    try {
      const cur = (typeof location !== 'undefined' && location.href) ? location.href : ''
      const ref = (typeof document !== 'undefined' && document.referrer) ? document.referrer : ''
      if (ref && (!cur || ref !== cur)) {
        uni.setStorageSync('last_cart_back', ref)
      }
    } catch (e) {}
    // #endif
  },
  methods: {
    goHome() {
      if (uni && uni.switchTab) { uni.switchTab({ url: '/pages/home/index' }); return }
      if (uni && uni.navigateTo) { uni.navigateTo({ url: '/pages/home/index' }); return }
    },
    goBack() { this.goHome() },
    loadAddresses() {
      getAddresses().then(res => {
        const raw = Array.isArray(res?.data?.items) ? res.data.items : (Array.isArray(res?.items) ? res.items : [])
        this.addresses = raw.map(a => ({
          id: a.addresses_id || a.id || '',
          receiver: a.receiver || '',
          phone: a.phone || '',
          full: [a.province, a.city, a.district, a.detail_address].filter(Boolean).join(' '),
          is_default: a.is_default === 1
        }))
        const cached = uni.getStorageSync('selected_address_id') || ''
        let pick = this.addresses.find(x => x.id === cached) || this.addresses.find(x => x.is_default) || this.addresses[0]
        this.selectedAddress = pick || null
        if (this.showAddressSelector && this.addresses.length === 0) {
          try { uni.showToast({ title: '暂无收货地址，去创建吧', icon: 'none' }) } catch (e) {}
        }
      }).catch(() => { this.addresses = []; this.selectedAddress = null })
    },
    openAddressPicker() {
      this.showAddressSelector = true
      this.loadAddresses()
    },
    onAddressSelect(room) {
      if (room && room.raw) {
        this.selectedAddress = room.raw
        uni.setStorageSync('selected_address_id', room.raw.id)
        this.showAddressSelector = false
      }
    },
    onCreateAddress(payload) {
      const u = uni.getStorageSync('user')
      const token = (u && (u.token || (u.data && u.data.token))) || ''
      const data = { receiver: payload.receiver, phone: payload.phone, province: payload.province, city: payload.city, district: payload.district, detail_address: payload.detail_address, is_default: payload.is_default }
      addAddress({ ...data, token }).then(res => {
        if (res && res.success) {
          const id = (res && res.data && (res.data.addresses_id || res.data.id)) || ''
          const item = { id, receiver: data.receiver, phone: data.phone, full: [data.province, data.city, data.district, data.detail_address].filter(Boolean).join(' '), is_default: data.is_default === 1 }
          this.addresses = [item, ...this.addresses]
          this.selectedAddress = item
          try { uni.setStorageSync('selected_address_id', id) } catch (e) {}
          uni.showToast({ title: '已保存', icon: 'success' })
          this.showAddressSelector = false
        } else {
          uni.showToast({ title: (res && res.message) ? res.message : '保存失败', icon: 'none' })
        }
      }).catch(() => {
        uni.showToast({ title: '保存失败', icon: 'none' })
      })
    },
    toAddressPage() { uni.navigateTo({ url: '/pages/address/index' }) },
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
              const isOutOfStock = (x.inventory === 0 || x.available_product_status === 0)
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
                selected: false,
                inventory: x.inventory,
                status: x.status,
                available: x.available_product_status,
                stockMessage: x.message || (isOutOfStock ? '该商品已无库存' : ''),
                isOutOfStock: isOutOfStock
              })
            }
          }
          this.cart = list
          this.fetchSummary()
          this.loading = false
        })
        .catch((err) => {
          console.error('Get cart failed', err)
          try { this.cart = uni.getStorageSync('cart') || [] } catch (e) { this.cart = [] }
          this.cart = (this.cart || []).map(it => ({
            ...it,
            quantity: it.quantity || 1,
            selected: !!it.selected
          }))
          this.loading = false
        })
    },
    fetchSummary() {
        const selectedIds = this.cart.filter(it => it.selected).map(it => it.id)
        if (selectedIds.length === 0) {
            this.summaryData = { total_price: 0, total_original: 0, is_free_shipping: 0 }
            return
        }
        getCartItemsByIDs({ ids: selectedIds }).then(res => {
            if (res && res.success && res.data) {
                this.summaryData = res.data
            }
        }).catch(e => console.error(e))
    },
    sync() { uni.setStorageSync('cart', this.cart) },
    findIndexById(id) { return this.cart.findIndex(it => it.id === id) },
    incById(id) {
      const i = this.findIndexById(id)
      if (i >= 0) {
        const item = this.cart[i]
        if (item.isOutOfStock) return
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
          this.refreshItemPrice(item.id)
        } else {
          uni.showToast({ title: '更新失败', icon: 'none' })
        }
      }).catch((err) => {
        console.error(err)
        uni.showToast({ title: '更新出错', icon: 'none' })
      })
    },
    refreshItemPrice(id) {
      getCartItems()
        .then((res) => {
          const payload = res && res.data && typeof res.data === 'object' ? res.data : res
          const groups = Array.isArray(payload?.groups) ? payload.groups : []
          let found = null
          for (const g of groups) {
            const items = Array.isArray(g && g.items) ? g.items : []
            const x = items.find(xx => xx && xx.id === id)
            if (x) { found = x; break }
          }
          if (found) {
            const i = this.findIndexById(id)
            if (i >= 0) {
              const it = this.cart[i]
              it.price = Number(found.price !== undefined ? found.price : it.price) || it.price
              it.quantity = Number(found.quantity !== undefined ? found.quantity : it.quantity) || it.quantity
              it.inventory = found.inventory
              it.available = found.available_product_status
              it.isOutOfStock = (found.inventory === 0 || found.available_product_status === 0)
            }
          }
        })
        .finally(() => { this.fetchSummary() })
    },
    removeById(id) {
      deleteCartItem({ id })
        .then(() => {
          const i = this.findIndexById(id); if (i >= 0) { this.cart.splice(i, 1); this.sync(); this.fetchSummary() }
          uni.showToast({ title: '已删除', icon: 'success' })
        })
        .catch(() => {
          const i = this.findIndexById(id); if (i >= 0) { this.cart.splice(i, 1); this.sync(); this.fetchSummary() }
          uni.showToast({ title: '本地删除', icon: 'none' })
        })
    },
    removeSelected() { this.cart = this.cart.filter(it => !it.selected); this.sync(); this.fetchSummary() },
    clearRemote() {
      clearCart()
        .then((res) => {
          if (res && res.success) {
            this.cart = []
            this.sync()
            this.fetchSummary()
            uni.showToast({ title: '已清空', icon: 'success' })
          } else {
            uni.showToast({ title: (res && res.message) ? res.message : '清空失败', icon: 'none' })
          }
        })
        .catch(() => {
          uni.showToast({ title: '清空失败', icon: 'none' })
        })
    },
    toggleById(id) { 
        const i = this.findIndexById(id); 
        if (i >= 0) { 
            if (this.cart[i].isOutOfStock) return
            this.cart[i].selected = !this.cart[i].selected; 
            this.sync() 
            this.fetchSummary()
        } 
    },
    toggleAll() {
      const validItems = this.cart.filter(it => !it.isOutOfStock)
      if (validItems.length === 0) return
      
      const makeSelected = !this.isAllSelected
      
      this.cart.forEach(it => {
          if (!it.isOutOfStock) it.selected = makeSelected
          else it.selected = false
      })
      this.sync()
      this.fetchSummary()
    },
    clear() { this.cart = []; this.sync(); this.fetchSummary() },
    async checkout() {
      if (this.selectedCount === 0) { uni.showToast({ title: '请选择商品', icon: 'none' }); return }
      const selectedIds = this.cart.filter(it => it.selected).map(it => it.id)
      const addressId = this.selectedAddress?.id || ''
      if (!addressId) { uni.showToast({ title: '请先选择收货地址', icon: 'none' }); return }
      if (!addressId) { uni.showToast({ title: '地址选择异常', icon: 'none' }); return }

      createOrderByIds({ ids: selectedIds, address_id: addressId }).then(res => {
          if (res && res.success) {
             uni.showToast({ title: '下单成功', icon: 'success' })
             // 移除已选商品
             this.cart = this.cart.filter(it => !it.selected); this.sync(); this.fetchSummary()
             
             // 如果返回了订单ID，跳转到订单页
             const orderId = res.data?.order_id || res.data?.id
             if (orderId) {
                 setTimeout(() => {
                    uni.navigateTo({ url: '/pages/order/index?id=' + orderId })
                 }, 1000)
             } else {
                 setTimeout(() => {
                    uni.navigateTo({ url: '/pages/order/index' })
                 }, 1000)
             }
          } else {
             uni.showToast({ title: res.message || '下单失败', icon: 'none' })
          }
      }).catch(err => {
          uni.showToast({ title: '下单出错', icon: 'none' })
          console.error(err)
      })
    },
    handleExportExcel() {
      if (this.selectedCount === 0) {
        uni.showToast({ title: '请选择商品', icon: 'none' })
        return
      }
      
      const selectedIds = this.cart.filter(it => it.selected).map(it => it.id)
      
      uni.showModal({
        title: '导出提示',
        content: '导出Excel将为您自动生成订单，确认继续？',
        success: (res) => {
          if (res.confirm) {
            // #ifdef MP-WEIXIN
            uni.showModal({ title: '提示', content: '小程序暂不支持导出', showCancel: false })
            return
            // #endif
            uni.showLoading({ title: '正在导出...' })
            createOrderByIds({ ids: selectedIds, address_id: (this.selectedAddress && this.selectedAddress.id) || '' }).then(res => {
              if (res && res.success) {
                const orderId = res.data?.order_id || res.data?.id
                if (orderId) {
                   exportOrderExcel({ order_id: orderId }).then(exportRes => {
                     uni.hideLoading()
                     // #ifdef H5
                     if (exportRes && exportRes.blob) {
                       try {
                         const url = URL.createObjectURL(exportRes.blob)
                         const a = document.createElement('a')
                         a.href = url
                         a.download = exportRes.filename || '订单导出.xlsx'
                         document.body.appendChild(a)
                         a.click()
                         a.remove()
                         try { URL.revokeObjectURL(url) } catch (e) {}
                         this.cart = this.cart.filter(it => !it.selected); this.sync(); this.fetchSummary()
                         return
                       } catch (e) {}
                     }
                     // #endif
                     const possibleUrl = (exportRes && exportRes.url) || (exportRes && exportRes.data && exportRes.data.url) || (exportRes && exportRes.data && typeof exportRes.data === 'string' ? exportRes.data : '')
                     if (possibleUrl && typeof possibleUrl === 'string') {
                       this.cart = this.cart.filter(it => !it.selected); this.sync(); this.fetchSummary()
                       // #ifdef H5
                       try { window.open(possibleUrl, '_blank') } catch (e) { window.location.href = possibleUrl }
                       // #endif
                       // #ifndef H5
                       uni.setClipboardData({ data: possibleUrl, success: () => uni.showToast({ title: '下载链接已复制', icon: 'none' }) })
                       // #endif
                     } else {
                       uni.showToast({ title: '未获取到导出链接', icon: 'none' })
                     }
                   }).catch(e => {
                     uni.hideLoading()
                     uni.showToast({ title: '导出请求失败', icon: 'none' })
                   })
                } else {
                   uni.hideLoading()
                   uni.showToast({ title: '订单创建异常', icon: 'none' })
                }
              } else {
                uni.hideLoading()
                uni.showToast({ title: res.message || '生成订单失败', icon: 'none' })
              }
            }).catch(e => {
              uni.hideLoading()
              uni.showToast({ title: '网络请求失败', icon: 'none' })
            })
          }
        }
      })
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
  background: url('/static/product_detail_background.jpg') no-repeat center center fixed;
  background-size: cover;
  min-height: 100vh;
  padding-bottom: 120rpx;
}

.review-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.addr-sub-title {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 10rpx;
}

.list {
  background: #fff;
}

.item {
  display: flex;
  padding: 20rpx;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
}

.out-stock-mask {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(255,255,255,0.6);
  z-index: 5;
  pointer-events: none;
}

.stock-tip {
  position: absolute;
  right: 20rpx;
  bottom: 20rpx;
  background: rgba(0,0,0,0.6);
  color: #fff;
  padding: 4rpx 12rpx;
  font-size: 24rpx;
  border-radius: 4rpx;
  z-index: 6;
}

.chk-ico.disabled {
  background: #eee;
  border-color: #ddd;
}

.item.out-of-stock .chk { pointer-events: none; }

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

.action-buttons {
  display: flex;
  gap: 20rpx;
  margin-top: 20rpx;
}
.action-buttons .checkout {
  flex: 1;
  margin: 0;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
}
.action-buttons .export-btn {
  flex: 1;
  margin: 0;
  background: #fff;
  color: #333;
  border: 1px solid #ddd;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
}
.action-buttons .export-btn::after { border: none; }

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

.chk.btn-style {
  width: auto;
  padding: 10rpx 20rpx;
  background: #fff;
  border: 1rpx solid #ddd;
  border-radius: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  margin-right: 10rpx;
}
.chk.btn-style .chk-txt {
  margin-left: 0;
  font-size: 26rpx;
  line-height: 1;
}

.footer .actions {
  display: flex;
  align-items: center;
}

.footer-btn {
  width: auto;
  padding: 10rpx 20rpx;
  background: #fff;
  border: 1rpx solid #ddd;
  border-radius: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  color: #333;
  margin-left: 10rpx;
}

.footer-btn.disabled {
  color: #999;
  border-color: #eee;
  background: #f5f5f5;
}

/* #ifdef H5 */
.footer {
  display: none;
}

.h5-nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 88rpx; /* Standard nav height */
  padding: 0 40rpx;
  background: #ffffff;
  display: flex;
  align-items: center;
  z-index: 100;
  box-shadow: 0 1rpx 0 #f0f0f0;
  box-sizing: border-box;
}
.nav-title {
  flex: 1;
  text-align: center;
  font-size: 34rpx;
  font-weight: bold;
  color: #333;
  margin-right: 80rpx; /* Balance the back button width */
}
.nav-back {
  display: inline-flex;
  align-items: center;
  justify-content: center; /* Center the arrow */
  font-size: 32rpx;
  color: #333;
  cursor: pointer;
  width: 80rpx; /* Fixed width for balance */
  height: 100%;
}
.back-arrow {
  width: 20rpx;
  height: 20rpx;
  border-left: 4rpx solid #333;
  border-bottom: 4rpx solid #333;
  transform: rotate(45deg);
}

.cart-grid {
  display: grid;
  grid-template-columns: 3fr 1.2fr;
  grid-gap: 80rpx;
  padding-right: 130rpx;
  padding-left: 130rpx;
  padding-top: 108rpx; /* 88rpx header + 20rpx space */
  /* padding: 20rpx; */
}

.cart-main {
  background: #fff;
  border-radius: 12rpx;
  height: calc(100vh - 220rpx);
  overflow: auto;
  margin-bottom: 60rpx;
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
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.05);
  height: calc(100vh - 300rpx);
  display: flex;
  flex-direction: column;
  margin-bottom: 60rpx;
}

.sum-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 24rpx;
}

/* Address Section in Summary Card */
.addr-section {
  margin-bottom: 30rpx;
  padding-bottom: 20rpx;
  /* border-bottom: 1px solid #f0f0f0; */
}
.addr-label {
  font-size: 24rpx;
  color: #434343;
  margin-bottom: 16rpx;
  font-weight: 600;
}
.addr-content {
  display: flex;
  flex-direction: column;
}
.addr-top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}
.addr-name {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}
.btn-select-addr {
  font-size: 22rpx;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 24rpx;
  padding: 0 20rpx;
  line-height: 44rpx;
  height: 44rpx;
  margin: 0;
  color: #666;
}
.addr-detail {
  font-size: 24rpx;
  color: #666;
  line-height: 1.4;
}
.addr-empty {
  font-size: 24rpx;
  color: #999;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.group-header {
  background: transparent;
  border-bottom: none;
  padding: 20rpx 20rpx 0 20rpx;
  display: flex;
  align-items: center;
}

.group-header .store-icon {
  font-size: 32rpx;
  margin-right: 12rpx;
}

.group-header .room {
  background: #ddd;
  padding: 5px;
  border-radius: 5px;
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  display: inline-block;
}

.group-header .arrow {
  color: #ccc;
  margin-left: 10rpx;
  font-size: 24rpx;
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
  flex-wrap: wrap;
}

.thumb {
  width: 100rpx;
  height: 100rpx;
  border-radius: 8rpx;
  background: #f5f5f5;
  border: 1rpx solid #eee;
}

.rows {
  margin-top: 30rpx;
  border-top: 1px solid #f0f0f0;
  padding-top: 20rpx;
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
  color: #666;
  font-size: 28rpx;
}

.value {
  color: #333;
  font-weight: 500;
}

.value.reduce {
  color: #333;
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
  margin-top: 20rpx;
  align-items: flex-end;
}

.row.total .label {
  font-size: 32rpx;
  font-weight: bold;
  color: #000;
  margin-bottom: 4rpx;
}

.total-box {
  text-align: right;
}

.pay {
  color: #000;
  font-weight: 800;
  font-size: 44rpx;
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

.sum-body, .sum-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.summary-card .checkout {
  margin-top: auto;
  margin-bottom: 40rpx;
  width: 100%;
  background: #000;
  color: #fff;
  border-radius: 50rpx;
  height: 90rpx;
  line-height: 90rpx;
  font-size: 30rpx;
  font-weight: bold;
  box-shadow: none;
}

.summary-card .checkout.disabled {
  background: #ccc;
  opacity: 1;
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

.floating-back {
  position: fixed;
  left: 40rpx;
  top: 40rpx;
  width: 80rpx;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  /* border-radius: 50%; */
  /* background: rgba(255,255,255,0.7); */
  /* box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.12); */
  color: #333;
  font-size: 36rpx;
  z-index: 999;
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
}

/* 
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
*/
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

/* #ifdef H5 */
.h5-row {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
  justify-content: space-between;
}
.h5-row .chk {
  margin-right: 20rpx;
  flex-shrink: 0;
  align-self: center;
}
.h5-row .cover {
  width: 100rpx !important; /* Make image smaller */
  height: 100rpx !important;
  margin-right: 20rpx;
  flex-shrink: 0;
  align-self: center;
}
.h5-row .title {
  flex: 1;
  font-size: 26rpx;
  color: #333;
  margin: 0 10rpx;
  text-align: center;
  align-self: center;
}
.h5-row .attr-txt {
  flex: 1;
  font-size: 24rpx;
  color: #999;
  margin: 0 10rpx;
  text-align: center;
  background: none;
  padding: 0;
  margin-top: 0;
  align-self: center;
}
.h5-row .price {
  width: 140rpx;
  font-size: 36rpx;
  font-weight: 700;
  color: #e1251b;
  text-align: center;
  flex-shrink: 0;
  align-self: center;
}
.h5-row .qty-box {
  margin: 0 20rpx;
  flex-shrink: 0;
  align-self: center;
  height: 60rpx;
}
.h5-row .qty-box .qty-btn {
  width: 60rpx;
  height: 60rpx;
  font-size: 32rpx;
}
.h5-row .del-btn {
  font-size: 26rpx;
  color: #999;
  cursor: pointer;
  width: 80rpx;
  text-align: center;
  flex-shrink: 0;
  align-self: center;
}
.h5-row .del-btn:hover {
  color: #e1251b;
}
/* #endif */

/* #ifndef H5 */
.mp-address-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 20rpx;
  background: #fff;
  border-bottom: 1rpx solid #f0f0f0;
}
.bar-left { display: flex; align-items: center; gap: 12rpx; }
.addr-icon { font-size: 28rpx; }
.bar-info { display: flex; flex-direction: column; font-size: 24rpx; color: #555; }
.bar-line { white-space: nowrap; }
.bar-btn { background: #fff; border: 1rpx solid #ddd; color: #333; border-radius: 999rpx; }
.mp-room {
  margin: 0 30rpx;
  background: #fff9f5;
  color: #ff7b2b;
  padding: 16rpx;
  border-radius: 8rpx;
  display: block;
  font-size: 30rpx;
  font-weight: 600;
}

.mp-qty-box {
  height: 60rpx;
  background: #f8f8f8;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
}

.mp-qty-btn {
  width: 60rpx;
  height: 60rpx;
  font-size: 36rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mp-qty-box .count {
  font-size: 32rpx;
  font-weight: bold;
  margin: 0 10rpx;
}

.act-txt.del {
  font-size: 32rpx;
  margin-top: 10rpx;
}
/* #endif */
</style>
