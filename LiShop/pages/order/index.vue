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
            <view class="item" v-for="(x, index) in r.items" :key="x.id + '_' + index">
              <view class="meta">
                <text class="title">{{ x.available_product_name }}</text>
                <text class="spec">型号：{{ x.title }}｜色温：{{ x.specTemp || '-' }}｜长度：{{ x.specLength || '-' }}</text>
                <text class="spec" v-if="x.itemNumber || x.nuomiItemNumber">品号：{{ x.itemNumber || '-' }}｜诺米品号：{{ x.nuomiItemNumber || '-' }}</text>
                <text class="spec" v-if="x.productNote">备注：{{ x.productNote }}</text>
                <text class="spec" v-if="x.packageFee > 0">同系列包装费：¥{{ Number(x.packageFee).toFixed(2) }}</text>
                <text class="spec original-line" v-if="x.showOriginalPrice">原价：¥{{ x.originalUnitPrice.toFixed(2) }} × {{ x.quantity }} = ¥{{ x.originalLineTotal.toFixed(2) }}</text>
                <text class="spec discount-line" v-if="x.couponDiscountAmount > 0">优惠券抵扣：-¥{{ x.couponDiscountAmount.toFixed(2) }}</text>
              </view>
              <view class="price-row">
                <text class="price">¥{{ x.price.toFixed(2) }}</text>
                <text class="quantity">× {{ x.quantity }}</text>
                <text>＝ ¥{{ x.lineTotal.toFixed(2) }}</text>
                <!-- #ifndef H5 -->
                <!-- <text>＝ ¥{{ (x.price * x.quantity).toFixed(2) }}</text> -->
                <!-- #endif -->
              </view>
            </view>
          </view>
        </view>
      </view>
      <view class="ops">
        <view style="display:flex; flex-direction:column; align-items:flex-end;">
          <text v-if="order.originalTotal > order.total" class="total-original">原总价：¥{{ order.originalTotal.toFixed(2) }}</text>
          <text class="total-text">合计：¥{{ order.total.toFixed(2) }}</text>
          <text v-if="order.totalPackageFee > 0" style="color:#faa21b; font-size:24rpx; margin-top:8rpx;">(其中包装费 ¥{{ Number(order.totalPackageFee).toFixed(2) }})</text>
          <text v-if="order.coupon_discount_amount > 0" style="color:#ff4d4f; font-size:24rpx; margin-top:8rpx;">(已使用优惠券抵扣 ¥{{ Number(order.coupon_discount_amount).toFixed(2) }})</text>
        </view>
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
            <view style="display:flex; flex-direction:column; align-items:flex-end;">
              <text class="total">¥{{ o.total.toFixed(2) }}</text>
              <text v-if="o.coupon_discount_amount > 0" style="color:#ff4d4f; font-size:20rpx;">已优惠 ¥{{ Number(o.coupon_discount_amount).toFixed(2) }}</text>
            </view>
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
/**
 * 订单页面模块
 * - 列表模式：按状态拉取订单列表（待付款/待发货/待收货/历史）
 * - 详情模式：展示单个订单详情、物流信息与相关操作（确认收货/取消等）
 */
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
    /**
     * 将时间值格式化为订单页面统一显示格式。
     * @param {string|number|Date} t 原始时间值
     * @returns {string} 格式化后的时间字符串
     * @example
     * this.formatTime('2026-06-08T14:29:56')
     */
    formatTime(t) {
      try {
        const date = this.parseDateValue(t)
        if (!date) return t
        return this.formatDateObject(date)
      } catch (e) {
        return t
      }
    },
    /**
     * 解析接口返回的时间值，兼容 ISO 字符串与无时区时间字符串。
     * @param {string|number|Date} value 原始时间值
     * @returns {Date|null} 解析后的时间对象，失败时返回 null
     * @example
     * const date = this.parseDateValue('2026-06-08T14:29:56')
     */
    parseDateValue(value) {
      try {
        if (!value) return null
        if (value instanceof Date) {
          return isNaN(value.getTime()) ? null : value
        }
        const raw = String(value).split('`').join('').trim()
        if (!raw) return null
        const directDate = new Date(raw)
        if (!isNaN(directDate.getTime())) return directDate
        const match = raw.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[T\s](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?(?:\.(\d{1,3}))?)?$/)
        if (!match) return null
        const year = match[1]
        const month = match[2]
        const day = match[3]
        const hour = match[4] || '0'
        const minute = match[5] || '0'
        const second = match[6] || '0'
        const millisecond = match[7] || '0'
        const msText = String(millisecond)
        const normalizedMs = (msText + '000').slice(0, 3)
        const parsedDate = new Date(
          Number(year),
          Number(month) - 1,
          Number(day),
          Number(hour),
          Number(minute),
          Number(second),
          Number(normalizedMs)
        )
        return isNaN(parsedDate.getTime()) ? null : parsedDate
      } catch (e) {
        return null
      }
    },
    /**
     * 将时间对象格式化为 yyyy-MM-dd HH:mm:ss。
     * @param {Date} date 时间对象
     * @returns {string} 格式化后的字符串
     * @example
     * this.formatDateObject(new Date())
     */
    formatDateObject(date) {
      const pad = function(num) {
        return num < 10 ? '0' + num : String(num)
      }
      return [
        date.getFullYear(),
        pad(date.getMonth() + 1),
        pad(date.getDate())
      ].join('-') + ' ' + [
        pad(date.getHours()),
        pad(date.getMinutes()),
        pad(date.getSeconds())
      ].join(':')
    },
    /**
     * 对金额执行两位小数舍入，避免浮点误差污染展示结果。
     * @param {number|string} amount 原始金额
     * @returns {number} 舍入后的金额
     * @example
     * this.roundCurrency(10.005)
     */
    roundCurrency(amount) {
      const num = Number(amount || 0)
      if (isNaN(num)) return 0
      return Math.round(num * 100) / 100
    },
    /**
     * 获取对象自身可枚举属性值数组，兼容较旧的运行环境。
     * @param {Object} obj 原始对象
     * @returns {Array} 属性值数组
     * @example
     * const values = this.getObjectValues({ a: 1, b: 2 })
     */
    getObjectValues(obj) {
      const result = []
      const source = obj || {}
      for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          result.push(source[key])
        }
      }
      return result
    },
    /**
     * 将房间小计与订单总额做轻量对齐，修正前端逐项求和带来的分角差。
     * @param {Array} rooms 房间列表
     * @param {number|string} totalPrice 订单总额
     * @returns {void} 直接修改 rooms 中的 roomTotal
     * @example
     * this.reconcileRoomTotals(order.rooms, order.total)
     */
    reconcileRoomTotals(rooms, totalPrice) {
      if (!Array.isArray(rooms) || !rooms.length) return
      const safeTotal = this.roundCurrency(totalPrice)
      const currentTotal = this.roundCurrency(rooms.reduce((sum, room) => sum + Number(room.roomTotal || 0), 0))
      const diff = this.roundCurrency(safeTotal - currentTotal)
      if (!diff || Math.abs(diff) > 0.1) return
      const targetRoom = rooms[rooms.length - 1]
      targetRoom.roomTotal = this.roundCurrency(Number(targetRoom.roomTotal || 0) + diff)
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
                    try { if (typeof wx !== 'undefined' && typeof wx.openDocument === 'function') wx.openDocument({ filePath, showMenu: true }) } catch (e) { }
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
            uni.downloadFile({
              url,
              success: (dres) => {
                const filePath = dres && dres.tempFilePath
                if (filePath) {
                  try { if (typeof wx !== 'undefined' && typeof wx.openDocument === 'function') wx.openDocument({ filePath, showMenu: true }) } catch (e) { }
                } else {
                  uni.setClipboardData({ data: url, success: () => uni.showToast({ title: '下载链接已复制', icon: 'none' }) })
                }
              },
              fail: () => {
                uni.setClipboardData({ data: url, success: () => uni.showToast({ title: '下载链接已复制', icon: 'none' }) })
              }
            })
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

    /**
     * 将后端订单接口数据转换为前端页面展示结构。
     * @param {Object} apiOrder 后端返回的订单对象
     * @returns {Object} 前端展示使用的订单对象
     * @example
     * const order = this.mapApiOrderToLocal(res.data)
     */
    mapApiOrderToLocal(apiOrder) {
      const roomsMap = {};
      const orderTotal = this.roundCurrency(apiOrder.total_amount ?? apiOrder.total_price ?? 0);
      const orderOriginalTotal = this.roundCurrency(apiOrder.original_total_amount ?? (apiOrder.total_price || 0));
      const items = apiOrder.items || [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const roomName = item.room_name || '默认房间';
        if (!roomsMap[roomName]) {
          roomsMap[roomName] = { name: roomName, roomTotal: 0, items: [] };
        }
        const quantity = Number(item.quantity || 0) || 0;
        const lineTotal = this.roundCurrency(item.detail_total_price ?? item.line_total_price ?? 0);
        const fallbackUnitPrice = quantity > 0 ? this.roundCurrency(lineTotal / quantity) : 0;
        const price = this.roundCurrency(item.unit_price ?? item.price ?? fallbackUnitPrice);
        const originalLineTotal = this.roundCurrency(item.original_detail_total_price ?? item.original_price ?? lineTotal);
        const fallbackOriginalUnitPrice = quantity > 0 ? this.roundCurrency(originalLineTotal / quantity) : 0;
        const originalUnitPrice = this.roundCurrency(item.original_unit_price ?? fallbackOriginalUnitPrice);
        const couponDiscountAmount = this.roundCurrency(item.coupon_discount_amount ?? Math.max(0, originalLineTotal - lineTotal));
        const localItem = {
          title: item.product_name || item.available_product_name,
          available_product_name: item.available_product_name || '',
          id: item.product_id || item.available_product_id,
          specTemp: (item.color_temperature && item.color_temperature !== 'None' && item.color_temperature !== '无') ? item.color_temperature : '',
          specLength: item.length,
          price: price,
          quantity: quantity,
          lineTotal: this.roundCurrency(lineTotal || (price * quantity) || 0),
          originalUnitPrice: originalUnitPrice,
          originalLineTotal: originalLineTotal,
          couponDiscountAmount: couponDiscountAmount,
          showOriginalPrice: originalLineTotal > this.roundCurrency(lineTotal || 0),
          image: String(item.main_picture || '').split('`').join('').trim(),
          productNote: item.product_note || '',
          itemNumber: item.item_number || '',
          nuomiItemNumber: item.nuomi_item_number || '',
          packageFee: Number(item.package_fee || 0),
          packageFeeGroupKey: item.package_fee_group_key || '',
          packageFeeSelectedPackageId: item.package_fee_selected_package_id || '',
          packageFeeIsGroupOwner: Number(item.package_fee_is_group_owner || 0) || 0
        };
        roomsMap[roomName].items.push(localItem);
        roomsMap[roomName].roomTotal = this.roundCurrency(roomsMap[roomName].roomTotal + lineTotal);
      }
      const rooms = this.getObjectValues(roomsMap);
      this.reconcileRoomTotals(rooms, orderTotal);
      const roomsOriginalTotal = this.roundCurrency(rooms.reduce((sum, room) => {
        const roomItems = Array.isArray(room.items) ? room.items : []
        return sum + roomItems.reduce((itemSum, current) => itemSum + Number(current.originalLineTotal || 0), 0)
      }, 0));
      const tracking = [];
      let rawList = [];
      let trackingMessage = '';
      let mapUrl = ''
      try {
        const last = apiOrder && apiOrder.logistics_data && apiOrder.logistics_data.lastResult
        rawList = last && Array.isArray(last.data) ? last.data : [];
        trackingMessage = (last && (last.message || last.msg)) || (apiOrder && apiOrder.logistics_message) || ''
        mapUrl = (last && last.trailUrl) ? String(last.trailUrl).split('`').join('').trim() : ''
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
        createdAt: apiOrder.created_at || null,
        total: orderTotal,
        originalTotal: orderOriginalTotal > 0 ? orderOriginalTotal : (roomsOriginalTotal > 0 ? roomsOriginalTotal : orderTotal),
        totalPackageFee: Number(apiOrder.total_package_fee || 0),
        coupon_record_id: apiOrder.coupon_record_id || '',
        coupon_discount_amount: Number(apiOrder.coupon_discount_amount || 0),
        waybillNo: (apiOrder && apiOrder.tracking_number) || (apiOrder && apiOrder.logistics_data && apiOrder.logistics_data.lastResult && apiOrder.logistics_data.lastResult.nu) || '',
        tracking: tracking,
        trackingMessage: tracking.length ? '' : (trackingMessage || ''),
        mapUrl: mapUrl,
        status: apiOrder.status || 'unknown',
        rooms: rooms
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
                try {
                  const mapped = this.mapApiOrderToLocal(o)
                  if (mapped) allOrders.push(mapped)
                } catch (mapErr) {
                  console.error('Map order error:', o.order_id, mapErr)
                }
              }
            })
          }
        } catch (e) {
          console.error('fetchOrders error:', e)
        }
      }
      this.orders = allOrders
      this.loading = false
    },
    async fetchDetail(id) {
      this.loading = true
      try {
        const res = await getOrderDetail({ order_id: id })
        if (res.success && res.data) {
          try {
            this.order = this.mapApiOrderToLocal(res.data)
            if (this.order && (!this.order.status || this.order.status === 'unknown') && this.detailStatusHint) {
              this.order.status = this.detailStatusHint
            }
          } catch (err) {
            console.error('Detail map error:', err)
          }
        }
      } catch (e) {
        console.error('fetchDetail error:', e)
      }
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
  background-color: #1a1a1a;
}

/* #ifdef H5 */
.page {
  /* background: url('/static/product_detail_background.jpg') no-repeat center center fixed; */
  /* background-size: cover; */
  background-color: #1a1a1a;
}

/* #endif */

.nav {
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: #2c2c2c;
  height: 88rpx;
  border-bottom: 1rpx solid #444444;
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
  color: #aaaaaa;
  padding: 0 10rpx;
}

.nav-item.active {
  color: #ffffff;
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
  background: #e1251b;
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
  background: #ffffff;
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
  color: #333333;
}

.time {
  color: #aaaaaa;
  font-size: 24rpx;
  /* #ifdef MP-WEIXIN */
  white-space: nowrap;
  /* #endif */
}

.total {
  color: #333333;
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
  background: #f8f8f8;
  padding: 12rpx;
  border-radius: 10rpx;
  color: #333333;
}

.items {
  margin-top: 10rpx;
}

.item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12rpx 8rpx;
  border-bottom: 1rpx solid #eeeeee;
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
  color: #333333;
  margin-bottom: 10rpx;
}

.meta .spec {
  display: block;
  font-size: 22rpx;
  color: #aaaaaa;
  margin-top: 4rpx;
}

.meta .spec.original-line {
  color: #999999;
  text-decoration: line-through;
}

.meta .spec.discount-line {
  color: #ff4d4f;
}

.price-row {
  display: flex;
  gap: 12rpx;
  align-items: center;
  color: #333333;
}

.price-row .quantity {
  font-size: 22rpx;
  color: #666666;
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
  color: #333333;
}

.total-original {
  font-size: 24rpx;
  color: #999999;
  text-decoration: line-through;
  margin-bottom: 6rpx;
}

.btns {
  display: flex;
  gap: 20rpx;
}

.btn {
  background: #444444;
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
  color: #777777;
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
  background: #ffffff;
  border-radius: 12rpx;
  padding: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, .3);
}

.card-hd {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-hd .id {
  font-weight: 600;
  color: #333333;
}

.card-hd .total {
  color: #333333;
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
  background: #1a1a1a;
}

.actions {
  display: flex;
  gap: 16rpx;
}

.btn-action {
  margin: 0;
  background: #444444;
  /* border: 1rpx solid #ddd; */
  color: #ffffff;
  border-radius: 100rpx;
  padding: 0 24rpx;
  height: 56rpx;
  line-height: 54rpx;
  font-size: 24rpx;
}

.btn-action.primary {
  /* border-color: #333; */
  background-color: #e1251b;
  color: #fff;
}

/* 运单与物流 */
.waybill {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  border-radius: 10rpx;
  padding: 12rpx;
  margin: 10rpx 0;
  border: 1rpx solid #eeeeee;
}

.waybill .copy {
  background: #f0f0f0;
  color: #333333;
  margin: 0;
}

.logistics {
  background: #ffffff;
  border-radius: 10rpx;
  padding: 12rpx;
  margin-bottom: 8rpx;
  border: 1rpx solid #eeeeee;
}

.log-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 8rpx;
  border-bottom: 1rpx solid #eeeeee;
}

.log-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333333;
}

.log-toggle {
  margin: 0;
  background: #f0f0f0;
  color: #333333;
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
  background: #eeeeee;
}

.log-empty {
  padding: 16rpx 8rpx;
  color: #777777;
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
  background: #1a1a1a;
}

.map-iframe {
  width: 100%;
  height: 100%;
  border: 0;
}

.map-image {
  width: 100%;
  border-radius: 10rpx;
  background: #1a1a1a;
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
  color: #e1251b;
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
  color: #333333;
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
  color: #ffffff;
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
  background: #777777;
  margin: 8rpx 0 0 0;
  font-size: 0;
  line-height: 16rpx;
}

.log-item:first-child .dot {
  background: #e1251b;
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
  color: #333333;
}

.log-time {
  font-size: 26rpx;
  color: #666666;
}

.log-desc {
  font-size: 26rpx;
  color: #666666;
  line-height: 1.5;
}

.log-item:first-child .log-status {
  color: #e1251b ;
  font-size: 32rpx;
}

.log-item:first-child .log-time {
  color: #e1251b ;
}

.log-item:first-child .log-desc {
  color: #333333;
}

.log-status {
  font-weight: 600;
}

/* #ifdef H5 */
.waybill {
  position: static;
  margin: 10rpx 0;
  background: #ffffff;
  padding: 12rpx;
  border-radius: 10rpx;
  flex-direction: row;
  align-items: center;
  gap: 20rpx;
  justify-content: flex-start;
  border: 1rpx solid #eeeeee;
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

.price-row .quantity {
  font-size: 28rpx;
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
  color: #e1251b;
}

.price-row .quantity {
  font-size: 20rpx;
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
  opacity: 0.2;
}

/* #endif */
</style>
