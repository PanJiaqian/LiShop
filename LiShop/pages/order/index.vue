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
        <view class="hero-copy">
          <text class="hero-label">订单详情</text>
          <text class="title">{{ order.orderNo || order.id }}</text>
          <text class="time" v-if="order.createdAt">下单时间 {{ formatTime(order.createdAt) }}</text>
        </view>
        <view class="hero-side">
          <text class="status-pill">{{ orderStatusLabel(order.status) }}</text>
          <view class="hero-total-block">
            <text class="hero-total-label">当前实付</text>
            <view class="order-total-inline">
              <text class="hero-total-value">¥{{ order.total.toFixed(2) }}</text>
              <text v-if="order.originalTotal > order.total" class="total-original">¥{{ order.originalTotal.toFixed(2) }}</text>
            </view>
          </view>
        </view>
      </view>
      <view class="logistics">
        <view class="section-top">
          <view>
            <text class="section-kicker">配送进度</text>
            <text class="section-title">物流信息</text>
          </view>
          <text class="section-tip" v-if="(order.tracking || []).length">实时更新</text>
        </view>
        <view class="log-header" v-if="order.waybillNo">
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
        <view v-else class="log-empty-state">
          <view class="log-empty-icon">📦</view>
          <text class="log-empty-title">物流信息待更新</text>
          <text class="log-empty-desc">{{ order.trackingMessage || '商家发货后，这里会显示物流轨迹和配送进度' }}</text>
        </view>
        <view v-if="(order.tracking || []).length > 1" class="log-toggle-center">
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
            <view class="room-title-wrap">
              <text class="room-kicker">空间</text>
              <text class="room-name">{{ r.name }}</text>
            </view>
            <text class="room-total">¥{{ r.roomTotal.toFixed(2) }}</text>
          </view>
          <view class="items">
            <view class="item" v-for="(x, index) in r.items" :key="x.id + '_' + index">
              <view class="meta">
                <text class="title">{{ x.available_product_name }}</text>
                <view class="spec-tags">
                  <text class="spec-tag" v-if="x.title">型号 {{ x.title }}</text>
                  <text class="spec-tag">色温 {{ x.specTemp || '-' }}</text>
                  <text class="spec-tag">长度 {{ x.specLength || '-' }}</text>
                  <text class="spec-tag" v-if="x.itemNumber">品号 {{ x.itemNumber }}</text>
                  <text class="spec-tag" v-if="x.nuomiItemNumber">诺米品号 {{ x.nuomiItemNumber }}</text>
                </view>
                <text class="spec note-line" v-if="x.productNote">备注：{{ x.productNote }}</text>
                <view class="item-flags" v-if="x.packageFee > 0 || x.couponDiscountAmount > 0">
                  <text class="flag-chip package-chip" v-if="x.packageFee > 0">包装费 ¥{{ Number(x.packageFee).toFixed(2) }}</text>
                  <text class="flag-chip discount-chip" v-if="x.couponDiscountAmount > 0">已优惠 ¥{{ x.couponDiscountAmount.toFixed(2) }}</text>
                </view>
              </view>
              <view class="price-row">
                <view class="price-inline">
                  <text class="price">¥{{ x.price.toFixed(2) }}</text>
                  <text class="inline-origin-price" v-if="x.showOriginalPrice">¥{{ x.originalUnitPrice.toFixed(2) }}</text>
                </view>
                <text class="quantity">× {{ x.quantity }}</text>
                <text class="line-total">小计 ¥{{ x.lineTotal.toFixed(2) }}</text>
                <!-- #ifndef H5 -->
                <!-- <text>＝ ¥{{ (x.price * x.quantity).toFixed(2) }}</text> -->
                <!-- #endif -->
              </view>
            </view>
          </view>
        </view>
      </view>
      <view class="ops">
        <view class="ops-summary">
          <view class="summary-row" v-if="order.originalTotal > order.total">
            <text class="summary-label">商品原价</text>
            <text class="summary-value summary-value-muted">¥{{ order.originalTotal.toFixed(2) }}</text>
          </view>
          <view class="summary-row" v-if="order.totalPackageFee > 0">
            <text class="summary-label">包装费</text>
            <text class="summary-value summary-value-warm">¥{{ Number(order.totalPackageFee).toFixed(2) }}</text>
          </view>
          <view class="summary-row" v-if="order.coupon_discount_amount > 0">
            <text class="summary-label">优惠抵扣</text>
            <text class="summary-value summary-value-discount">-¥{{ Number(order.coupon_discount_amount).toFixed(2) }}</text>
          </view>
          <view class="summary-row summary-row-total">
            <text class="summary-label total-text">合计实付</text>
            <view class="order-total-inline">
              <text class="hero-total-value">¥{{ order.total.toFixed(2) }}</text>
              <text v-if="order.originalTotal > order.total" class="total-original">¥{{ order.originalTotal.toFixed(2) }}</text>
            </view>
          </view>
        </view>
        <view class="btns">
          <button class="btn-action" v-if="isPendingReceipt(order.status)"
            @click="confirmReceipt(order.id)">确认收货</button>
          <button class="btn-action ghost" v-if="['pending_payment', 'pending_shipment'].includes(order.status)"
            @click="handleCancelOrder(order.id)">取消订单</button>
          <button class="btn subtle" @click="exportExcel(order)">导出Excel</button>
        </view>
      </view>
    </view>

    <!-- 订单列表 -->
    <view class="orders" v-else>
      <view v-if="orders.length" id="og-order-list" class="orders-list">
        <view class="order-card" v-for="o in orders" :key="o.id">
          <view class="card-hd">
            <view class="card-main">
              <text class="card-kicker">订单</text>
              <text class="id">订单号：{{ o.orderNo || o.id }}</text>
              <text class="time" v-if="o.createdAt">下单时间：{{ formatTime(o.createdAt) }}</text>
            </view>
          </view>
          <view class="card-body">
            <view class="thumbs">
              <image v-for="(src, i) in firstThumbs(o)" :key="i" :src="src" mode="aspectFill" class="thumb" />
            </view>
            <view class="card-side">
              <view class="card-amounts">
                <text class="status-pill small">{{ orderStatusLabel(o.status) }}</text>
                <view class="order-total-inline">
                  <text class="total">¥{{ o.total.toFixed(2) }}</text>
                  <text v-if="o.originalTotal > o.total" class="total-original">¥{{ o.originalTotal.toFixed(2) }}</text>
                </view>
                <view class="card-badges">
                  <text v-if="o.coupon_discount_amount > 0" class="mini-badge discount">已优惠 ¥{{ Number(o.coupon_discount_amount).toFixed(2) }}</text>
                  <text v-if="o.totalPackageFee > 0" class="mini-badge warm">含包装费 ¥{{ Number(o.totalPackageFee).toFixed(2) }}</text>
                </view>
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
    /**
     * 将订单状态转换为页面可读的中文标签。
     * @param {string} status 订单状态标识
     * @returns {string} 用于界面展示的订单状态文案
     * @example
     * this.orderStatusLabel('pending_receipt')
     */
    orderStatusLabel(status) {
      try {
        const raw = String(status || '').trim()
        if (!raw) return '订单处理中'
        const normalized = raw.replace(/^OrderStatus\./, '').toLowerCase()
        const mapping = {
          pending_payment: '待付款',
          pending_shipment: '待发货',
          pending_receipt: '待收货',
          cancelled: '已取消',
          canceled: '已取消',
          completed: '已完成',
          shipped: '运输中',
          paid: '已支付',
          processing: '订单处理中'
        }
        return mapping[normalized] || mapping[raw] || raw
      } catch (e) {
        return '订单处理中'
      }
    },
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
  background:
    radial-gradient(circle at top, rgba(196, 155, 111, 0.16), transparent 32%),
    linear-gradient(180deg, #131313 0%, #191919 38%, #111111 100%);
}

/* #ifdef H5 */
.page {
  background:
    radial-gradient(circle at top, rgba(196, 155, 111, 0.16), transparent 32%),
    linear-gradient(180deg, #131313 0%, #191919 38%, #111111 100%);
}

/* #endif */

.nav {
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: rgba(29, 29, 29, 0.82);
  height: 96rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.06);
  border-radius: 28rpx;
  margin-bottom: 28rpx;
  position: sticky;
  top: 0;
  z-index: 99;
  backdrop-filter: blur(20rpx);
  box-shadow: 0 12rpx 30rpx rgba(0, 0, 0, 0.18);
}

.nav-item {
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.58);
  padding: 0 16rpx;
}

.nav-item.active {
  color: #ffffff;
  font-weight: 600;
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
  background: linear-gradient(90deg, #c8a06b 0%, #f2dbb4 100%);
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
  background: rgba(255, 255, 255, 0.96);
  border-radius: 28rpx;
  padding: 28rpx;
  position: relative;
  box-shadow: 0 24rpx 56rpx rgba(0, 0, 0, 0.18);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24rpx;
  margin-bottom: 24rpx;
  padding: 8rpx 4rpx 12rpx;
}

.hero-copy {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.hero-label {
  font-size: 22rpx;
  letter-spacing: 6rpx;
  color: #9b7b56;
}

.hero-side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 14rpx;
}

.hero-total-block {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8rpx;
}

.hero-total-label {
  font-size: 22rpx;
  color: #8c8c8c;
}

.hero-total-value {
  font-size: 36rpx;
  font-weight: 700;
  color: #1f1f1f;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 52rpx;
  padding: 0 22rpx;
  border-radius: 999rpx;
  background: rgba(201, 163, 118, 0.14);
  color: #8b673f;
  font-size: 24rpx;
  font-weight: 600;
  border: 1rpx solid rgba(201, 163, 118, 0.22);
}

.status-pill.small {
  min-height: 44rpx;
  padding: 0 18rpx;
  font-size: 20rpx;
}

.title {
  font-size: 34rpx;
  font-weight: 700;
  color: #171717;
  line-height: 1.35;
  word-break: break-all;
}

.time {
  color: #909090;
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
  margin-top: 18rpx;
  background: linear-gradient(180deg, #ffffff 0%, #fbfbfb 100%);
  border: 1rpx solid #f2f2f2;
  border-radius: 22rpx;
  padding: 16rpx;
  box-shadow: 0 8rpx 24rpx rgba(17, 17, 17, 0.05);
}

.room-hd {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(90deg, rgba(245, 245, 245, 0.9), rgba(255, 255, 255, 0.6));
  padding: 16rpx 18rpx;
  border-radius: 18rpx;
  color: #333333;
}

.room-title-wrap {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.room-kicker {
  font-size: 20rpx;
  color: #9d9d9d;
}

.room-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #222222;
}

.room-total {
  font-size: 30rpx;
  font-weight: 700;
  color: #202020;
}

.items {
  margin-top: 14rpx;
}

.item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20rpx;
  padding: 18rpx 8rpx;
  border-bottom: 1rpx solid #f2f2f2;
}

.item:last-child {
  border-bottom: none;
}

.meta {
  flex: 1;
  max-width: 62%;
}

.meta .title {
  display: block;
  font-size: 28rpx;
  color: #222222;
  margin-bottom: 14rpx;
}

.meta .spec {
  display: block;
  font-size: 22rpx;
  color: #8c8c8c;
  margin-top: 8rpx;
}

.spec-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.spec-tag {
  display: inline-flex;
  align-items: center;
  padding: 8rpx 14rpx;
  border-radius: 999rpx;
  background: #f7f7f7;
  border: 1rpx solid #efefef;
  color: #666666;
  font-size: 20rpx;
  line-height: 1.2;
}

.note-line {
  line-height: 1.6;
}

.item-flags {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-top: 12rpx;
}

.flag-chip {
  display: inline-flex;
  align-items: center;
  padding: 8rpx 14rpx;
  border-radius: 999rpx;
  font-size: 20rpx;
  font-weight: 500;
}

.package-chip {
  background: rgba(250, 162, 27, 0.12);
  color: #c07a0d;
}

.discount-chip {
  background: rgba(225, 37, 27, 0.1);
  color: #d94841;
}

.price-row {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10rpx;
  color: #333333;
  flex-wrap: wrap;
  min-width: 180rpx;
}

.price-inline {
  display: inline-flex;
  align-items: baseline;
  justify-content: flex-end;
  gap: 12rpx;
  flex-wrap: wrap;
}

.inline-origin-price {
  font-size: 22rpx;
  color: #999999;
  text-decoration: line-through;
}

.order-total-inline {
  display: inline-flex;
  align-items: baseline;
  gap: 10rpx;
  flex-wrap: wrap;
}

.price-row .price {
  font-size: 34rpx;
  font-weight: 700;
  color: #1e1e1e;
}

.price-row .quantity {
  font-size: 22rpx;
  color: #666666;
}

.line-total {
  font-size: 22rpx;
  color: #8c8c8c;
}

.ops {
  margin-top: 24rpx;
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  gap: 20rpx;
  padding: 12rpx 0 0;
}

.ops-summary {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.summary-row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 14rpx;
  flex-wrap: wrap;
}

.summary-row-total {
  margin-top: 6rpx;
  padding-top: 14rpx;
}

.summary-row-total .order-total-inline {
  gap: 12rpx;
}

.summary-label {
  font-size: 24rpx;
  color: #888888;
}

.summary-value {
  font-size: 24rpx;
  color: #333333;
  font-weight: 500;
}

.summary-value-muted {
  color: #b0b0b0;
  text-decoration: line-through;
}

.summary-value-warm {
  color: #f3be63;
}

.summary-value-discount {
  color: #ff8f87;
}

.total-text {
  font-size: 26rpx;
  font-weight: 600;
  color: #333333;
}

.total-original {
  font-size: 24rpx;
  color: rgba(119, 119, 119, 0.8);
  text-decoration: line-through;
}

.btns {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
  gap: 20rpx;
}

.btn {
  background: #f4f4f4;
  color: #333333;
  border-radius: 100rpx;
  margin: 0;
  padding: 0 34rpx;
  height: 64rpx;
  line-height: 64rpx;
  font-size: 24rpx;
  border: 1rpx solid #e6e6e6;
}

.btn.subtle {
  background: #f4f4f4;
}

.empty {
  padding: 80rpx 40rpx;
  text-align: center;
  color: rgba(255, 255, 255, 0.58);
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
  background: rgba(255, 255, 255, 0.96);
  border-radius: 24rpx;
  padding: 22rpx;
  box-shadow: 0 18rpx 40rpx rgba(0, 0, 0, 0.18);
  border: 1rpx solid rgba(255, 255, 255, 0.52);
}

.card-hd {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 18rpx;
}

.card-main {
  flex: 1;
  min-width: 0;
}

.card-kicker {
  display: block;
  margin-bottom: 8rpx;
  font-size: 20rpx;
  letter-spacing: 4rpx;
  color: #9b7b56;
}

.card-amounts {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex-shrink: 0;
  gap: 8rpx;
}

.card-hd .id {
  font-weight: 600;
  color: #333333;
  display: block;
  white-space: normal;
  word-break: break-all;
}

.card-hd .total {
  color: #1f1f1f;
  font-weight: 700;
}

.card-badges {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8rpx;
}

.mini-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6rpx 14rpx;
  border-radius: 999rpx;
  font-size: 20rpx;
}

.mini-badge.discount {
  background: rgba(225, 37, 27, 0.1);
  color: #d94841;
}

.mini-badge.warm {
  background: rgba(250, 162, 27, 0.12);
  color: #c07a0d;
}

.card-body {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 18rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid #f3f3f3;
}

.card-side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16rpx;
}

.thumbs {
  display: flex;
  gap: 12rpx;
}

.thumb {
  width: 120rpx;
  height: 120rpx;
  border-radius: 16rpx;
  background: #f2f2f2;
  border: 1rpx solid #efefef;
}

.actions {
  display: flex;
  gap: 16rpx;
}

.btn-action {
  margin: 0;
  background: linear-gradient(135deg, #242424 0%, #3a3a3a 100%);
  color: #ffffff;
  border-radius: 100rpx;
  padding: 0 24rpx;
  height: 60rpx;
  line-height: 58rpx;
  font-size: 24rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.08);
}

.btn-action.ghost {
  background: #f4f4f4;
  color: #333333;
  border-color: #e6e6e6;
}

.btn-action.primary {
  background-color: #e1251b;
  color: #fff;
  border-color: rgba(225, 37, 27, 0.28);
}

/* 运单与物流 */
.waybill {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #f8f8f8 0%, #ffffff 100%);
  border-radius: 18rpx;
  padding: 16rpx 18rpx;
  margin: 10rpx 0;
  border: 1rpx solid #efefef;
}

.waybill .copy {
  background: #f0f0f0;
  color: #333333;
  margin: 0;
}

.logistics {
  background: linear-gradient(180deg, #ffffff 0%, #fbfbfb 100%);
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 18rpx;
  border: 1rpx solid #f1f1f1;
  box-shadow: 0 10rpx 28rpx rgba(0, 0, 0, 0.05);
}

.section-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
  margin-bottom: 10rpx;
}

.section-kicker {
  display: block;
  font-size: 20rpx;
  letter-spacing: 4rpx;
  color: #9b7b56;
  margin-bottom: 8rpx;
}

.section-title {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: #1f1f1f;
}

.section-tip {
  display: inline-flex;
  align-items: center;
  min-height: 44rpx;
  padding: 0 16rpx;
  border-radius: 999rpx;
  background: rgba(201, 163, 118, 0.14);
  color: #8b673f;
  font-size: 20rpx;
}

.log-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 14rpx;
  margin-bottom: 8rpx;
  border-bottom: 1rpx solid #f5f5f5;
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
  padding: 16rpx 0;
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

.log-empty-state {
  min-height: 220rpx;
  border-radius: 18rpx;
  background: linear-gradient(180deg, #fafafa 0%, #f5f5f5 100%);
  border: 1rpx dashed #e5e7eb;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  padding: 24rpx;
  text-align: center;
}

.log-empty-icon {
  font-size: 48rpx;
  line-height: 1;
}

.log-empty-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333333;
}

.log-empty-desc {
  font-size: 24rpx;
  color: #8c8c8c;
  line-height: 1.6;
}

.logistics-map {
  margin-top: 12rpx;
}

.map-frame {
  width: 100%;
  height: 420rpx;
  border-radius: 18rpx;
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
  border-radius: 18rpx;
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 52rpx;
  padding: 0 22rpx;
  border-radius: 999rpx;
  background: #f5f5f5;
  font-size: 24rpx;
  color: #555555;
  font-weight: 600;
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
  background: #c5c5c5;
  margin: 8rpx 0 0 0;
  font-size: 0;
  line-height: 16rpx;
}

.log-item:first-child .dot {
  background: #c79c66;
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
  color: #9b7b56;
  font-size: 32rpx;
}

.log-item:first-child .log-time {
  color: #9b7b56;
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
  background: linear-gradient(135deg, #f8f8f8 0%, #ffffff 100%);
  padding: 16rpx 18rpx;
  border-radius: 18rpx;
  flex-direction: row;
  align-items: center;
  gap: 20rpx;
  justify-content: flex-start;
  border: 1rpx solid #efefef;
}

.item {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
}

.meta {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0;
  flex: 1;
  margin: 0;
  max-width: 62%;
}

.meta .title {
  margin-bottom: 14rpx;
  width: 100%;
  text-align: left;
}

.meta .spec {
  margin-top: 8rpx;
  margin-left: 0;
  width: 100%;
  text-align: left;
}

.price-row {
  font-size: 36rpx;
  font-weight: bold;
  align-items: flex-end;
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
.header {
  flex-direction: column;
  gap: 18rpx;
}

.hero-side {
  width: 100%;
  align-items: flex-start;
}

.hero-total-block {
  align-items: flex-start;
}

.logistics {
  border-radius: 20rpx;
  padding: 24rpx;
}

.log-empty-state {
  min-height: 240rpx;
  gap: 16rpx;
}

.log-empty-icon {
  font-size: 56rpx;
}

.log-empty-title {
  font-size: 30rpx;
}

.log-empty-desc {
  font-size: 24rpx;
}

.card-main {
  width: 100%;
}

.card-hd {
  display: block;
}

.card-side {
  flex-shrink: 0;
  min-width: 240rpx;
  align-items: flex-end;
}

.card-amounts {
  width: auto;
  align-items: flex-end;
  gap: 6rpx;
}

.card-hd .id {
  font-size: 32rpx;
  line-height: 1.4;
}

.card-hd .total {
  font-size: 32rpx;
}

.card-hd .total-original {
  font-size: 22rpx;
  margin-bottom: 0;
}

.card-hd .time {
  display: block;
  margin-top: 6rpx;
  font-size: 22rpx;
  color: #999999;
  white-space: normal;
  word-break: break-all;
}

.card-body {
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20rpx;
}

.thumbs {
  width: 0;
  flex: 1;
  flex-wrap: wrap;
  gap: 10rpx;
  align-items: flex-start;
  align-content: flex-start;
}

.actions {
  width: auto;
  flex-shrink: 0;
  justify-content: flex-end;
  align-items: flex-end;
  flex-wrap: nowrap;
  gap: 12rpx;
  margin-top: auto;
}

.btn-action {
  min-width: 160rpx;
}

.actions .btn-action {
  min-width: 148rpx;
}

.actions .btn-action.primary {
  background-color: #e1251b;
  color: #ffffff;
  border-color: rgba(225, 37, 27, 0.28);
}

.actions .btn-action:not(.primary) {
  background: linear-gradient(135deg, #242424 0%, #3a3a3a 100%);
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.08);
}

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
  margin-bottom: 0;
  display: block;
}

.meta .title {
  display: block;
  margin-bottom: 14rpx;
}

.meta .spec {
  display: block;
  margin-top: 8rpx;
}

.total {
  font-size: 36rpx;
}

.price-row .quantity {
  font-size: 20rpx;
}

.ops {
  flex-direction: column;
}

.btns {
  width: 100%;
  align-items: stretch;
}

.btn,
.btn-action {
  width: 100%;
  text-align: center;
}

.actions .btn-action {
  width: auto;
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
