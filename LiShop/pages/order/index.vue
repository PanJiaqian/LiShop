<template>
  <view class="page">
    <Skeleton :loading="loading" :showTitle="true" />
    <!-- #ifdef MP-WEIXIN -->
    <image class="page-bg" src="/static/product_detail_background.jpg" mode="aspectFill" />
    <!-- #endif -->
    <!-- 顶部导航 -->
    <view id="og-order-tabs" class="nav" v-if="!order">
      <view class="nav-item" :class="{ active: activeTab === 'all' }" @click="switchTab('all')">全部订单</view>
      <view class="nav-item" :class="{ active: activeTab === 'pending_payment' }" @click="switchTab('pending_payment')">
        待付款</view>
      <view class="nav-item" :class="{ active: activeTab === 'pending_shipment' }"
        @click="switchTab('pending_shipment')">待发货</view>
      <view class="nav-item" :class="{ active: activeTab === 'pending_receipt' }" @click="switchTab('pending_receipt')">
        待收货</view>
      <!-- <view class="nav-item" :class="{ active: activeTab === 'history' }" @click="switchTab('history')">历史订单</view> -->
    </view>

    <!-- 订单详情 -->
    <view class="order" v-if="order">
      <view class="header">
        <text class="title">订单号：{{ order.orderNo || order.id }}</text>
        <text class="log-title">物流信息</text>
        <text class="time" v-if="order.createdAt">下单时间：{{ formatTime(order.createdAt) }}</text>
        <!-- Total moved to footer for H5 and MP -->
        <!-- #ifndef H5 -->
        <!-- <text class="total">合计：¥{{ order.total.toFixed(2) }}</text> -->
        <!-- #endif -->
      </view>
      <view class="logistics">
        <view class="log-header">
          <view class="waybill" v-if="order.waybillNo">
            <text>运单号：{{ order.waybillNo }}</text>
            <button size="mini" class="copy" @click="copyWaybill(order.waybillNo)">复制运单号</button>
          </view>

        </view>
        <view v-if="(order.tracking || []).length">
          <view class="log-item"
            v-for="(ev, i) in (logisticsCollapsed ? (order.tracking || []).slice(0, 1) : order.tracking)" :key="i">
            <view class="dot">•</view>
            <view class="log-meta">
              <view class="log-row">
                <text class="log-status">{{ ev.status }}</text>
                <text class="log-time">{{ formatTime(ev.time) }}</text>
              </view>
              <text class="log-desc">{{ ev.desc }}</text>
            </view>
          </view>
        </view>
        <view v-else class="log-empty">{{ order.trackingMessage || '暂无物流信息' }}</view>
        <view class="log-toggle-center">
          <text class="toggle-icon" @click="toggleLogistics">{{ logisticsCollapsed ? '展开更多物流明细 ▼' : '收起物流明细 ▲' }}</text>
        </view>
        <view v-if="order.mapUrl" class="logistics-map">
          <view v-if="isH5" class="map-frame">
            <iframe class="map-iframe" :src="order.mapUrl" frameborder="0"></iframe>
          </view>
          <!-- #ifdef MP-WEIXIN -->
          <view v-else>
            <map v-if="hasMapCoords(order.tracking)" class="map-canvas" :latitude="mapCenter(order.tracking).latitude"
              :longitude="mapCenter(order.tracking).longitude" :markers="mapMarkers(order.tracking)"
              :polyline="mapPolyline(order.tracking)" scale="12"></map>
            <image v-else-if="isImageLink(order.mapUrl)" class="map-image"
              :src="mapError ? '/static/logo.png' : order.mapUrl" mode="widthFix" @click="openMap(order.mapUrl)"
              @error="onMapError" />
            <view v-else class="map-link-row">
              <text class="map-link" @click="openMap(order.mapUrl)">查看物流地图</text>
            </view>
          </view>
          <!-- #endif -->
          <!-- #ifndef MP-WEIXIN -->
          <!-- <view v-else class="map-link-row">
            <text class="map-link" @click="openMap(order.mapUrl)">查看物流地图</text>
          </view> -->
          <!-- #endif -->
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
                <text class="title">{{ x.available_product_name }}</text>
                <text class="spec">型号：{{ x.title }}｜色温：{{ x.specTemp || '-' }}｜长度：{{ x.specLength || '-' }}</text>
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
          <button class="btn-action" v-if="isPendingReceipt(order.status)"
            @click="confirmReceipt(order.id)">确认收货</button>
          <button class="btn-action" v-if="['pending_payment', 'pending_shipment'].includes(order.status)"
            @click="handleCancelOrder(order.id)">取消订单</button><button class="btn"
            @click="exportExcel(order)">导出Excel</button>
        </view>
      </view>
    </view>

    <!-- 订单列表 -->
    <view class="orders" v-else>
      <view v-if="orders.length" id="og-order-list" class="orders-list">
        <view class="order-card" v-for="o in orders" :key="o.id">
          <view class="card-hd">
            <text class="id">订单号：{{ o.orderNo || o.id }}</text>
            <text class="time" v-if="o.createdAt">下单时间：{{ formatTime(o.createdAt) }}</text>
            <text class="total">¥{{ o.total.toFixed(2) }}</text>
          </view>
          <view class="card-body">
            <view class="thumbs">
              <image v-for="(src, i) in firstThumbs(o)" :key="i" :src="src" mode="aspectFill" class="thumb" />
            </view>
            <view class="actions">
              <button size="mini" class="btn-action" v-if="o.status === 'pending_receipt'"
                @click.stop="confirmReceipt(o.orderNo || o.id)">确认收货</button>
              <button size="mini" class="btn-action" v-if="['pending_payment', 'pending_shipment'].includes(o.status)"
                @click.stop="handleCancelOrder(o.orderNo || o.id)">取消订单</button>
              <button size="mini" class="btn-action primary" @click.stop="openDetail(o.id, o.status)">查看详情</button>
            </view>
          </view>
        </view>
      </view>
      <view v-else class="empty">暂无订单</view>
    </view>
    <!-- #ifdef H5 -->
    <FloatingNav />
    <view class="floating-back" @click="goBack">←</view>
    <!-- #endif -->
    <OnboardingGuide
      v-if="showOnboarding"
      :steps="onboardingSteps"
      :targets="onboardingRects"
      :initialIndex="onboardingIndex"
      @advance="handleOnboardingNext"
      @back="handleOnboardingPrev"
      @close="closeOnboarding"
    />
  </view>
</template>

<script>
import { getPendingPaymentOrders, getPendingShipmentOrders, getPendingReceiptOrders, getHistoryOrders, getOrderDetail, confirmOrderReceipt, cancelOrder, exportOrderExcel } from '../../api/index.js'
import FloatingNav from '../../components/FloatingNav.vue'
import Skeleton from '@/components/Skeleton.vue'
import OnboardingGuide from '@/components/OnboardingGuide.vue'

export default {
  components: { FloatingNav, Skeleton, OnboardingGuide },
  data() { return { order: null, orders: [], activeTab: 'all', loading: true, logisticsCollapsed: true, isH5: false, mapError: false, detailStatusHint: '', showOnboarding: false, onboardingRects: [], onboardingSteps: [], onboardingIndex: 0 } },
  onLoad(query) {
    const id = query?.id
    try { this.isH5 = typeof window !== 'undefined' } catch (e) { this.isH5 = false }
    const status = query?.status
    if (status) { this.detailStatusHint = String(status) }
    if (id) {
      this.fetchDetail(id)
    } else {
      this.fetchOrders()
    }
  },
  onShow() {
    try {
      if (this.isH5) {
        const cur = (typeof location !== 'undefined' && location.href) ? location.href : ''
        const ref = (typeof document !== 'undefined' && document.referrer) ? document.referrer : ''
        if (ref && (!cur || ref !== cur)) {
          try { uni.setStorageSync('last_order_back', ref) } catch (e) { }
        }
      }
    } catch (e) { }
    try {
      const cont = !!uni.getStorageSync('onboarding_continue')
      const sel = uni.getStorageSync('onboarding_target_selector') || ''
      const idx = Number(uni.getStorageSync('onboarding_index') || 0)
      const stepsStored = uni.getStorageSync('onboarding_steps') || []
      if (cont && sel) {
        if (Array.isArray(stepsStored) && stepsStored.length) this.onboardingSteps = stepsStored
        const safeIdx = Math.max(0, Math.min(idx, this.onboardingSteps.length - 1))
        this.onboardingIndex = safeIdx
        this.$nextTick(() => {
          this.refreshOnboardingRect(sel)
        })
      }
    } catch (e) {}
  },
  methods: {
    refreshOnboardingRect(sel) {
      const total = this.onboardingSteps.length || 0
      const arr = new Array(total).fill(null)
      if (this.isH5) {
        const el = typeof document !== 'undefined' ? document.querySelector(sel) : null
        if (el) {
          const r = el.getBoundingClientRect()
          arr[this.onboardingIndex] = { left: r.left, top: r.top, width: r.width, height: r.height }
          this.onboardingRects = arr
          this.showOnboarding = true
        }
      } else {
        const tryMp = (attempt = 0) => {
          const q = uni.createSelectorQuery().in(this)
          q.select(sel).boundingClientRect()
          q.exec(res => {
            const r = (res || [])[0]
            if (r) {
              arr[this.onboardingIndex] = { left: r.left, top: r.top, width: r.width, height: r.height }
              this.onboardingRects = arr
              this.showOnboarding = true
            } else if (attempt < 3) {
              setTimeout(() => tryMp(attempt + 1), 140)
            }
          })
        }
        tryMp(0)
      }
    },
    handleOnboardingNext(nextIndex) {
      const idx = Number(nextIndex || 0)
      this.onboardingIndex = idx
      try {
        uni.setStorageSync('onboarding_index', idx)
        if (Array.isArray(this.onboardingSteps) && this.onboardingSteps.length) {
          uni.setStorageSync('onboarding_steps', this.onboardingSteps)
        }
        uni.setStorageSync('onboarding_continue', true)
      } catch (e) {}
      const isH5 = typeof window !== 'undefined'
      if (isH5) {
        if (idx <= 4) {
          const map = ['#og-search', '#og-cate', '#og-banner', '#og-guess', '#og-quick']
          const sel = map[idx] || '#og-search'
          uni.setStorageSync('onboarding_target_selector', sel)
          if (uni.switchTab) uni.switchTab({ url: '/pages/home/index' })
          else uni.navigateTo({ url: '/pages/home/index' })
          return
        }
        if (idx === 5) {
          uni.setStorageSync('onboarding_target_selector', '#og-product-add')
          uni.navigateTo({ url: '/pages/product/index' })
          return
        }
        if (idx === 6) {
          uni.setStorageSync('onboarding_target_selector', '#og-room-modal-list')
          uni.navigateTo({ url: '/pages/product/index' })
          return
        }
        if (idx === 7) {
          this.$nextTick(() => { this.refreshOnboardingRect('#og-order-tabs') })
          return
        }
        if (idx === 8) {
          uni.setStorageSync('onboarding_target_selector', '#og-profile-info')
          if (uni.switchTab) uni.switchTab({ url: '/pages/profile/index' })
          else uni.navigateTo({ url: '/pages/profile/index' })
          return
        }
        if (idx === 9) {
          uni.setStorageSync('onboarding_target_selector', '#og-profile-menu')
          if (uni.switchTab) uni.switchTab({ url: '/pages/profile/index' })
          else uni.navigateTo({ url: '/pages/profile/index' })
          return
        }
        if (idx === 10) {
          uni.setStorageSync('onboarding_target_selector', '#og-profile-addr')
          if (uni.switchTab) uni.switchTab({ url: '/pages/profile/index' })
          else uni.navigateTo({ url: '/pages/profile/index' })
          return
        }
      } else {
        if (idx <= 3) {
          const map = ['#og-search', '#og-mp-cate', '#og-banner', '#og-mp-guess']
          const sel = map[idx] || '#og-search'
          uni.setStorageSync('onboarding_target_selector', sel)
          if (uni.switchTab) uni.switchTab({ url: '/pages/home/index' })
          else uni.navigateTo({ url: '/pages/home/index' })
          return
        }
        if (idx === 4) {
          uni.setStorageSync('onboarding_target_selector', '#og-product-add')
          uni.navigateTo({ url: '/pages/product/index' })
          return
        }
        if (idx === 5) {
          uni.setStorageSync('onboarding_target_selector', '#og-room-modal-list')
          uni.navigateTo({ url: '/pages/product/index' })
          return
        }
        if (idx === 6) {
          uni.setStorageSync('onboarding_target_selector', '#og-profile-info')
          if (uni.switchTab) uni.switchTab({ url: '/pages/profile/index' })
          else uni.navigateTo({ url: '/pages/profile/index' })
          return
        }
        if (idx === 7) {
          uni.setStorageSync('onboarding_target_selector', '#og-profile-menu')
          if (uni.switchTab) uni.switchTab({ url: '/pages/profile/index' })
          else uni.navigateTo({ url: '/pages/profile/index' })
          return
        }
        if (idx === 8) {
          uni.setStorageSync('onboarding_target_selector', '#og-profile-addr')
          if (uni.switchTab) uni.switchTab({ url: '/pages/profile/index' })
          else uni.navigateTo({ url: '/pages/profile/index' })
          return
        }
      }
    },
    handleOnboardingPrev(prevIndex) {
      const idx = Number(prevIndex || 0)
      if (idx < 0) return
      this.onboardingIndex = idx
      try {
        uni.setStorageSync('onboarding_index', idx)
        uni.setStorageSync('onboarding_continue', true)
      } catch (e) {}
      const isH5 = typeof window !== 'undefined'
      if (isH5) {
        if (idx <= 4) {
          const map = ['#og-search', '#og-cate', '#og-banner', '#og-guess', '#og-quick']
          const sel = map[idx] || '#og-search'
          uni.setStorageSync('onboarding_target_selector', sel)
          if (uni.switchTab) uni.switchTab({ url: '/pages/home/index' })
          else uni.navigateTo({ url: '/pages/home/index' })
          return
        }
        if (idx === 5) {
          uni.setStorageSync('onboarding_target_selector', '#og-product-add')
          uni.navigateTo({ url: '/pages/product/index' })
          return
        }
        if (idx === 6) {
          uni.setStorageSync('onboarding_target_selector', '#og-room-modal-list')
          uni.navigateTo({ url: '/pages/product/index' })
          return
        }
        if (idx === 7) {
          this.$nextTick(() => { this.refreshOnboardingRect('#og-order-tabs') })
          return
        }
        if (idx === 8) {
          uni.setStorageSync('onboarding_target_selector', '#og-profile-info')
          if (uni.switchTab) uni.switchTab({ url: '/pages/profile/index' })
          else uni.navigateTo({ url: '/pages/profile/index' })
          return
        }
        if (idx === 9) {
          uni.setStorageSync('onboarding_target_selector', '#og-profile-menu')
          if (uni.switchTab) uni.switchTab({ url: '/pages/profile/index' })
          else uni.navigateTo({ url: '/pages/profile/index' })
          return
        }
        if (idx === 10) {
          uni.setStorageSync('onboarding_target_selector', '#og-profile-addr')
          if (uni.switchTab) uni.switchTab({ url: '/pages/profile/index' })
          else uni.navigateTo({ url: '/pages/profile/index' })
          return
        }
      } else {
        if (idx <= 3) {
          const map = ['#og-search', '#og-mp-cate', '#og-banner', '#og-mp-guess']
          const sel = map[idx] || '#og-search'
          uni.setStorageSync('onboarding_target_selector', sel)
          if (uni.switchTab) uni.switchTab({ url: '/pages/home/index' })
          else uni.navigateTo({ url: '/pages/home/index' })
          return
        }
        if (idx === 4) {
          uni.setStorageSync('onboarding_target_selector', '#og-product-add')
          uni.navigateTo({ url: '/pages/product/index' })
          return
        }
        if (idx === 5) {
          uni.setStorageSync('onboarding_target_selector', '#og-room-modal-list')
          uni.navigateTo({ url: '/pages/product/index' })
          return
        }
        if (idx === 6) {
          uni.setStorageSync('onboarding_target_selector', '#og-profile-info')
          if (uni.switchTab) uni.switchTab({ url: '/pages/profile/index' })
          else uni.navigateTo({ url: '/pages/profile/index' })
          return
        }
        if (idx === 7) {
          uni.setStorageSync('onboarding_target_selector', '#og-profile-menu')
          if (uni.switchTab) uni.switchTab({ url: '/pages/profile/index' })
          else uni.navigateTo({ url: '/pages/profile/index' })
          return
        }
        if (idx === 8) {
          uni.setStorageSync('onboarding_target_selector', '#og-profile-addr')
          if (uni.switchTab) uni.switchTab({ url: '/pages/profile/index' })
          else uni.navigateTo({ url: '/pages/profile/index' })
          return
        }
      }
    },
    isImageLink(url) {
      try { return /\.(png|jpg|jpeg|gif|bmp|webp)(\?.*)?$/i.test(String(url || '')) } catch (e) { return false }
    },
    onMapError() { this.mapError = true; try { uni.showToast({ title: '物流地图加载失败', icon: 'none' }) } catch (e) { } },
    isPendingReceipt(status) {
      try {
        const s = String(status || '')
        return s === 'pending_receipt' || s.includes('待收货')
      } catch (e) { return false }
    },
    formatTime(t) {
      try {
        let dateStr = t;
        if (typeof dateStr === 'string') {
          dateStr = dateStr.replace(/-/g, '/')
        }
        return new Date(dateStr).toLocaleString()
      } catch { return t }
    },
    copyWaybill(no) { try { uni.setClipboardData({ data: String(no) }); uni.showToast({ title: '已复制运单号', icon: 'success' }) } catch (e) { } },
    openDetail(id, status) {
      const qs = status ? ('&status=' + encodeURIComponent(status)) : ''
      uni.navigateTo({ url: '/pages/order/index?id=' + id + qs })
    },
    firstThumbs(o) {
      try {
        const imgs = []
        o.rooms.forEach(r => r.items.forEach(x => imgs.push(x.image || '/static/logo.png')))
        return imgs.slice(0, 2)
      } catch { return [] }
    },
    async exportExcel(order) {
      try {
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
              try { URL.revokeObjectURL(url) } catch (e) { }
              return
            } catch (e) { }
          }
          // #endif
          // #ifndef H5
          if (res.blob) {
            try {
              const fs = (typeof wx !== 'undefined' && typeof wx.getFileSystemManager === 'function') ? wx.getFileSystemManager() : null
              const base = (typeof wx !== 'undefined' && wx.env && wx.env.USER_DATA_PATH) ? wx.env.USER_DATA_PATH : ((uni && uni.env && uni.env.USER_DATA_PATH) ? uni.env.USER_DATA_PATH : '')
              const fname = res.filename || '订单导出.xlsx'
              const filePath = base ? (base + '/' + fname) : fname
              if (fs && filePath) {
                fs.writeFile({
                  filePath,
                  data: res.blob,
                  success: () => {
                    uni.showToast({ title: '文件已保存', icon: 'success' })
                    try { if (typeof wx !== 'undefined' && typeof wx.openDocument === 'function') wx.openDocument({ filePath }) } catch (e) { }
                  },
                  fail: () => {
                    uni.showToast({ title: '文件保存失败', icon: 'none' })
                  }
                })
                return
              }
            } catch (e) { }
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
        const price = Number(item.price || 0);
        const localItem = {
          title: item.product_name || item.available_product_name,
          available_product_name: item.available_product_name || '',
          id: item.product_id || item.available_product_id,
          specTemp: (item.color_temperature && item.color_temperature !== 'None' && item.color_temperature !== '无') ? item.color_temperature : '',
          specLength: item.length,
          price: price,
          quantity: item.quantity,
          image: item.main_picture
        };
        roomsMap[roomName].items.push(localItem);
        roomsMap[roomName].roomTotal += (price * (item.quantity || 0));
      });
      const tracking = [];
      let rawList = [];
      let trackingMessage = '';
      let mapUrl = ''
      try {
        const last = apiOrder && apiOrder.logistics_data && apiOrder.logistics_data.lastResult
        rawList = last && Array.isArray(last.data) ? last.data : [];
        trackingMessage = (last && (last.message || last.msg)) || (apiOrder && apiOrder.logistics_message) || ''
        mapUrl = (last && last.trailUrl) ? String(last.trailUrl).replace(/`/g, '').trim() : ''
      } catch (e) { rawList = [] }
      rawList.forEach(ev => {
        let lat = null
        let lng = null
        const ac = ev.areaCenter || ev.area_center || ''
        if (ac) {
          const parts = String(ac).split(',')
          if (parts.length >= 2) {
            lng = Number(parts[0])
            lat = Number(parts[1])
          }
        }
        tracking.push({
          status: ev.status || '',
          desc: ev.context || '',
          time: ev.ftime || ev.time || '',
          place: ev.areaName || ev.location || '',
          lat: lat,
          lng: lng
        })
      })
      return {
        id: apiOrder.order_id,
        orderNo: apiOrder.order_id,
        createdAt: null,
        total: Number(apiOrder.total_price || 0),
        waybillNo: (apiOrder && apiOrder.tracking_number) || (apiOrder && apiOrder.logistics_data && apiOrder.logistics_data.lastResult && apiOrder.logistics_data.lastResult.nu) || '',
        tracking: tracking,
        trackingMessage: tracking.length ? '' : (trackingMessage || ''),
        mapUrl: mapUrl,
        status: apiOrder.status || 'unknown',
        rooms: Object.values(roomsMap)
      };
    },
    switchTab(tab) {
      this.activeTab = tab
      this.fetchOrders()
    },
    async fetchOrders() {
      this.loading = true
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
        } catch (e) { }
      }
      this.orders = allOrders
      this.loading = false
    },
    async fetchDetail(id) {
      this.loading = true
      try {
        const res = await getOrderDetail({ order_id: id })
        if (res.success && res.data) {
          this.order = this.mapApiOrderToLocal(res.data)
          if (this.order && (!this.order.status || this.order.status === 'unknown') && this.detailStatusHint) {
            this.order.status = this.detailStatusHint
          }
        }
      } catch (e) { }
      this.loading = false
    },
    goHome() {
      if (uni && uni.switchTab) { uni.switchTab({ url: '/pages/home/index' }); return }
      if (uni && uni.navigateTo) { uni.navigateTo({ url: '/pages/home/index' }); return }
    },
    goBack() {
      if (this.order) {
        try { uni.navigateTo({ url: '/pages/order/index' }); return } catch (e) { }
        this.goHome()
      } else {
        this.goHome()
      }
    },
    toggleLogistics() { this.logisticsCollapsed = !this.logisticsCollapsed },
    openMap(url) {
      if (!url) return
      try {
        if (this.isH5 && typeof window !== 'undefined') {
          window.open(url, '_blank')
          return
        }
      } catch (e) { }

      if (url.indexOf('http') === 0) {
        uni.navigateTo({ url: '/pages/webview/index?url=' + encodeURIComponent(url) })
        return
      }

      try { uni.setClipboardData({ data: String(url) }); uni.showToast({ title: '链接已复制', icon: 'none' }) } catch (e) { }
    },
    hasMapCoords(list) {
      try { return Array.isArray(list) && list.some(it => it && typeof it.lat === 'number' && typeof it.lng === 'number') } catch (e) { return false }
    },
    mapCenter(list) {
      try {
        const arr = (Array.isArray(list) ? list : []).filter(it => typeof it.lat === 'number' && typeof it.lng === 'number')
        if (!arr.length) return { latitude: 0, longitude: 0 }
        const last = arr[arr.length - 1]
        return { latitude: last.lat, longitude: last.lng }
      } catch (e) { return { latitude: 0, longitude: 0 } }
    },
    mapMarkers(list) {
      try {
        const arr = (Array.isArray(list) ? list : []).filter(it => typeof it.lat === 'number' && typeof it.lng === 'number')
        return arr.map((it, i) => ({ id: i, latitude: it.lat, longitude: it.lng }))
      } catch (e) { return [] }
    },
    mapPolyline(list) {
      try {
        const pts = (Array.isArray(list) ? list : []).filter(it => typeof it.lat === 'number' && typeof it.lng === 'number').map(it => ({ latitude: it.lat, longitude: it.lng }))
        return pts.length > 1 ? [{ points: pts, color: '#FF4D4F', width: 4 }] : []
      } catch (e) { return [] }
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
      } catch (e) { }
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
    },
    closeOnboarding() {
      this.showOnboarding = false
      try {
        uni.removeStorageSync('onboarding_continue')
        uni.removeStorageSync('onboarding_target_selector')
        uni.removeStorageSync('onboarding_step_text')
        uni.removeStorageSync('onboarding_steps')
        uni.removeStorageSync('onboarding_index')
        uni.reLaunch({ url: '/pages/home/index' })
      } catch (e) {}
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
}

/* #ifdef H5 */
.page {
  background: url('/static/product_detail_background.jpg') no-repeat center center fixed;
  background-size: cover;
}

/* #endif */

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

.nav-item {
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #333;
  padding: 0 10rpx;
}

.nav-item.active {
  color: #333;
  font-weight: bold;
  font-size: 30rpx;
}

.nav-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40rpx;
  height: 4rpx;
  background: #ff5000;
  border-radius: 4rpx;
}

/* #ifdef H5 */
.page {
  padding: 40rpx 600rpx;
  box-sizing: border-box;
}

/* #endif */
/* #ifndef H5 */
.page {
  padding: 30rpx;
  box-sizing: border-box;
}

/* #endif */
.order {
  margin: 20rpx 0;
  background: #fff;
  border-radius: 12rpx;
  padding: 20rpx;
  position: relative;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25rpx;
}

.title {
  font-size: 28rpx;
  font-weight: 600;
}

.time {
  color: #999;
  font-size: 24rpx;
  /* #ifdef MP-WEIXIN */
  white-space: nowrap;
  /* #endif */
}

.total {
  color: #333;
  font-size: 28rpx;
  font-weight: 600;
}

.room {
  margin-top: 12rpx;
}

.room-hd {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ddd;
  padding: 12rpx;
  border-radius: 10rpx;
  color: #333;
}

.items {
  margin-top: 10rpx;
}

.item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12rpx 8rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.item:last-child {
  border-bottom: none;
}

.meta {
  flex: 1;
  max-width: 50%;
}

.meta .title {
  display: block;
  font-size: 26rpx;
  color: #333;
  margin-bottom: 10rpx;
}

.meta .spec {
  display: block;
  font-size: 22rpx;
  color: #777;
  margin-top: 4rpx;
}

.price-row {
  display: flex;
  gap: 12rpx;
  align-items: center;
  color: #333;
}

.ops {
  margin-top: 16rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20rpx;
}

.total-text {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.btns {
  display: flex;
  gap: 20rpx;
}

.btn {
  background: #333;
  color: #fff;
  border-radius: 100rpx;
  margin: 0;
  padding: 0 30rpx;
  height: 60rpx;
  line-height: 60rpx;
  font-size: 26rpx;
}

.empty {
  padding: 40rpx;
  text-align: center;
  color: #999;
}

/* 列表样式 */
.orders {
  padding: 20rpx 0;
}

.orders-list {
  display: grid;
  gap: 16rpx;
}

.order-card {
  background: #fff;
  border-radius: 12rpx;
  padding: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, .04);
}

.card-hd {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-hd .id {
  font-weight: 600;
}

.card-hd .total {
  color: #333;
  font-weight: 700;
}

.card-body {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12rpx;
}

.thumbs {
  display: flex;
  gap: 12rpx;
}

.thumb {
  width: 120rpx;
  height: 120rpx;
  border-radius: 8rpx;
  background: #f5f5f5;
}

.actions {
  display: flex;
  gap: 16rpx;
}

.btn-action {
  margin: 0;
  background: #ddd;
  /* border: 1rpx solid #ddd; */
  color: #333;
  border-radius: 100rpx;
  padding: 0 24rpx;
  height: 56rpx;
  line-height: 54rpx;
  font-size: 24rpx;
}

.btn-action.primary {
  /* border-color: #333; */
  background-color: #333;
  color: #fff;
}

/* 运单与物流 */
.waybill {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-radius: 10rpx;
  padding: 12rpx;
  margin: 10rpx 0;
}

.waybill .copy {
  background: #eee;
  margin: 0;
}

.logistics {
  background: #fff;
  border-radius: 10rpx;
  padding: 12rpx;
  margin-bottom: 8rpx;
}

.log-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 8rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.log-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.log-toggle {
  margin: 0;
  background: #eee;
  color: #333;
  border-radius: 100rpx;
  padding: 0 20rpx;
  height: 50rpx;
  line-height: 50rpx;
  font-size: 24rpx;
}

.log-item {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  padding: 14rpx 0;
  position: relative;
}

.log-item::before {
  content: '';
  position: absolute;
  left: 8rpx;
  top: 36rpx;
  bottom: 0;
  width: 2rpx;
  background: #eee;
}

.log-empty {
  padding: 16rpx 8rpx;
  color: #999;
  font-size: 26rpx;
}

.logistics-map {
  margin-top: 12rpx;
}

.map-frame {
  width: 100%;
  height: 420rpx;
  border-radius: 10rpx;
  overflow: hidden;
  background: #f5f5f5;
}

.map-iframe {
  width: 100%;
  height: 100%;
  border: 0;
}

.map-image {
  width: 100%;
  border-radius: 10rpx;
  background: #f5f5f5;
}

.map-webview {
  width: 100%;
  height: 420rpx;
  border-radius: 10rpx;
  overflow: hidden;
}

.map-link-row {
  display: flex;
  justify-content: center;
  padding: 12rpx 0;
}

.map-link {
  color: #007aff;
  font-size: 26rpx;
}

.log-toggle-center {
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 8rpx;
}

.toggle-icon {
  font-size: 28rpx;
  color: #333;
  font-weight: 700;
}

.floating-back {
  position: fixed;
  left: 40rpx;
  top: 40rpx;
  width: 80rpx;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  color: #333;
  font-size: 36rpx;
  z-index: 999;
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
}

.log-item:last-child {
  border-bottom: none;
}

.dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: #bbb;
  margin: 8rpx 0 0 0;
  font-size: 0;
  line-height: 16rpx;
}

.log-item:first-child .dot {
  background: #333;
}

.log-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.log-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  flex-wrap: wrap;
}

.log-status {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.log-time {
  font-size: 26rpx;
  color: #999;
}

.log-desc {
  font-size: 26rpx;
  color: #999;
  line-height: 1.5;
}

.log-item:first-child .log-status {
  color: #54D1F4 ;
  font-size: 32rpx;
}

.log-item:first-child .log-time {
  color: #54D1F4 ;
}

.log-item:first-child .log-desc {
  color: #333;
}

.log-status {
  font-weight: 600;
}

/* #ifdef H5 */
.waybill {
  position: static;
  margin: 10rpx 0;
  background: #fff;
  padding: 12rpx;
  border-radius: 10rpx;
  flex-direction: row;
  align-items: center;
  gap: 20rpx;
  justify-content: flex-start;
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
  margin: 0;
  max-width: 50%;
}

.meta .title {
  margin-bottom: 0;
  width: 100%;
  text-align: left;
}

.meta .spec {
  margin-top: 0;
  margin-left: 0;
  width: 100%;
  text-align: center;
}

.price-row {
  font-size: 36rpx;
  font-weight: bold;
}

.header .title,
.ops .total-text,
.card-hd .id,
.card-hd .total {
  font-size: 36rpx;
  font-weight: bold;
}
.log-title {
  font-size: 36rpx;
  font-weight: bold;
}

.btn,
.btn-action {
  height: 80rpx;
  line-height: 80rpx;
  padding: 0 40rpx;
  font-size: 30rpx;
  border-radius: 40rpx;
}

/* #endif */

/* #ifdef MP-WEIXIN */
.waybill {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12rpx;
}

.waybill .copy {
  width: 300rpx;
  height: 64rpx;
  line-height: 64rpx;
  padding: 0 40rpx;
  border-radius: 40rpx;
}

.header .title {
  font-size: 28rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  display: block;
}
.log-title {
  font-size: 28rpx;
}

.meta .title {
  display: block;
  margin-bottom: 10rpx;
}

.meta .spec {
  display: block;
  margin-top: 10rpx;
}

.total {
  font-size: 36rpx;
}

.price-row .price {
  color: #000;
}

/* #endif */
/* #ifdef MP-WEIXIN */
.page {
  position: relative;
}

.page-bg {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  pointer-events: none;
}

/* #endif */
</style>
