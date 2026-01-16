<template>
  <view class="page">
    <Skeleton :loading="loading" :showTitle="true" :showGrid="true" />
    <!-- H5 三栏布局（包含分类、我的、商品） -->
    <!-- #ifdef H5 -->
    <image class="page-bg" src="/static/product_detail_background.jpg" mode="aspectFill" />
    <view class="h5-container">
      <!-- 顶部 Header -->
      <view class="h5-header">
        <view class="h5-logo-area">
          <image src="/static/logo.png?v=20251211" style="width:260rpx;height:100rpx;margin-right:20rpx;"
            mode="aspectFit" />
          <!-- <text class="logo-text">SHOP</text> -->
        </view>
        <view class="h5-search-wrapper">
          <view class="search-bar-box">
            <view class="search-type">宝贝<text class="arrow-down">∨</text></view>
            <view class="divider-v"></view>
            <input id="og-search" class="search-input-field" v-model="keyword" confirm-type="search"
              @confirm="onSearch(null)" />
            <button class="search-btn-black" @click="onSearch(null)">搜索</button>
          </view>
        </view>
      </view>

      <view class="h5-middle-layout">
        <view class="side-user">
          <view class="side-cate">
            <view class="cate-title">
              <text style="color:#000;margin-right:8rpx;font-weight:900;">☰</text>分类
            </view>
            <view id="og-cate" class="cate-list" @mouseleave="onCateListLeave">
              <view class="cate-item" v-for="(c, i) in topCategories" :key="i" @mouseenter="hoverCategory(c, $event)">
                <text class="cate-dot">●</text>
                <text class="cate-name">{{ c.name }}</text>
              </view>
            </view>
          </view>

        </view>


        <view class="center-content">
          <view id="og-banner" style="height:100%">
            <BannerSwiper :images="banners" class="full-height-banner" />
          </view>

          <view v-if="activeCateId" class="sub-panel"
            :style="{ top: panelTop + 'px', left: panelLeft + 'px', right: panelRight + 'px' }"
            @mouseenter="onPanelEnter" @mouseleave="onPanelLeave">
            <view class="panel-title">
              <text>{{ activeCateName || '二级分类' }}</text>
            </view>
            <view class="panel-columns">
              <view class="panel-link" v-for="(s, si) in leftChildren" :key="si" @click="goSubList(s)">
                <text class="sub-icon">●</text>
                {{ s.name }}
              </view>
            </view>
            <view v-if="!leftChildren || leftChildren.length === 0" class="sub-empty">暂无子分类</view>
          </view>
        </view>

        <view class="side-user">
          <view class="user-card-new">
            <view class="uc-header">
              <!-- <image class="uc-avatar" :src="user?.avatar || '/static/logo.png'" @click="onAvatarClick" /> -->
              <view class="uc-info">
                <text class="uc-greet">下午好 {{ user?.username || 'XXX' }}</text>
              </view>
            </view>

            <view id="og-quick" class="uc-links">
              <navigator class="uc-link-item" url="/pages/profile/index" open-type="switchTab">
                <text class="uc-icon">👤</text>
                <text>我的</text>
              </navigator>
              <navigator class="uc-link-item" url="/pages/cart/index" open-type="switchTab">
                <text class="uc-icon">🛒</text>
                <text>我的购物车</text>
              </navigator>
              <navigator class="uc-link-item" url="/pages/order/index">
                <text class="uc-icon">📋</text>
                <text>我的订单</text>
              </navigator>
              <navigator class="uc-link-item" url="/pages/favorites/index">
                <text class="uc-icon" style="margin-left: 5px;">★</text>
                <text style="margin-left: 1px;">我的收藏</text>
              </navigator>
              <view class="uc-link-item" @click="openAnnouncementModalH5">
                <text class="uc-icon">📣</text>
                <text>公告</text>
              </view>
              <view class="uc-link-item" @click="triggerOnboarding">
                <text class="uc-icon">🎓</text>
                <text>新手教程</text>
              </view>
              <!-- <navigator class="uc-link-item" url="/pages/messages/index">
                   <text class="uc-icon">💬</text>
                  <text>信息</text>
               </navigator>
               <navigator class="uc-link-item" url="/pages/settings/index">
                   <text class="uc-icon">⚙️</text>
                  <text>设置</text>
               </navigator> -->
            </view>

            <button v-if="!user" class="uc-login-btn" @click="goLogin">立即登录</button>
            <button v-else class="uc-login-btn" @click="logout">退出登录</button>
          </view>
        </view>
      </view>

      <view class="h5-bottom-section">
        <view id="og-guess" class="guess-header">
          <view class="guess-icon">❤</view>
          <text class="guess-title">猜你喜欢</text>
        </view>
        <view class="grid2">
          <view class="grid2-item" v-for="(p, idx) in recommendList" :key="idx">
            <ProductCard :product="p" />
          </view>
        </view>
      </view>
    </view>
    <FloatingNav />
    <view v-if="showAnnouncementModal" class="h5-mask" @click="closeAnnouncementModal">
      <view class="h5-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">公告</text>
          <view class="modal-close" @click="closeAnnouncementModal">✕</view>
        </view>
        <view v-if="announcement" class="modal-body">
          <view class="modal-body-two">
            <view class="two-left" @click="showAnnContent = true">
              <text class="two-label">公告标题</text>
              <view class="two-title">{{ announcement.title }}</view>
            </view>
            <view class="two-right">
              <view v-if="showAnnContent">
                <text class="a-title">{{ announcement.title }}</text>
                <text class="a-time">{{ displayTime }}</text>
                <view class="a-content">{{ announcement.content }}</view>
              </view>
              <view v-else class="two-hint">点击右侧显示公告内容</view>
            </view>
          </view>
        </view>
        <view v-else class="modal-body">
          <text>暂无公告</text>
        </view>
      </view>
    </view>
    <!-- #endif -->

    <!-- 其他平台保持原布局 -->
    <!-- #ifndef H5 -->
    <image class="page-bg" src="/static/product_detail_background.jpg" mode="aspectFill" />
    <view id="og-search">
      <SearchBar v-model="keyword" @search="onSearch" />
    </view>
    <view id="og-banner">
      <BannerSwiper :images="banners" />
    </view>
    <scroll-view id="og-mp-cate" class="mp-cate-nav" scroll-x>
      <view class="mp-cate-item" v-for="(c, i) in subCategoryList" :key="'mc' + i" @click="openCategory(c)">
        <image class="mp-cate-thumb" :src="c.icon || '/static/logo.png'" mode="aspectFill" />
        <text class="mp-cate-name">{{ c.name }}</text>
      </view>
    </scroll-view>
    <!-- 京东秒杀模块（非 H5，小程序端）已按要求注释 -->
    <!--
    <view class="block">
      <view class="block-title">
        <text>京东秒杀</text>
        <navigator url="/pages/category/index" open-type="switchTab" class="more">更多</navigator>
      </view>
      <scroll-view class="seckill" scroll-x>
        <view class="sk-item" v-for="(item, idx) in seckillList" :key="idx">
          <image class="sk-img" :src="item.image || '/static/logo.png'" mode="aspectFill" />
          <text class="sk-price">¥{{ item.price }}</text>
        </view>
      </scroll-view>
    </view>
    -->

    <view class="block">
      <view id="og-mp-guess" class="block-title">
        <text>猜你喜欢</text>
      </view>
      <view class="grid2">
        <view class="grid2-item" v-for="(p, idx) in recommendList" :key="idx">
          <ProductCard :product="p" />
        </view>
      </view>
    </view>
    <!-- #endif -->
    <OnboardingGuide v-if="showOnboarding" :steps="onboardingSteps" :targets="onboardingRects"
      :initialIndex="onboardingStepIndex" @advance="handleOnboardingNext" @back="handleOnboardingPrev"
      @close="handleOnboardingClose" />
  </view>
</template>

<script>
import SearchBar from '@/components/SearchBar.vue'
import BannerSwiper from '@/components/BannerSwiper.vue'
import CategoryGrid from '@/components/CategoryGrid.vue'
import ProductCard from '@/components/ProductCard.vue'
import FloatingNav from '@/components/FloatingNav.vue'
import Skeleton from '@/components/Skeleton.vue'
import OnboardingGuide from '@/components/OnboardingGuide.vue'
import { getRecommendedProducts, getVisibleCategories, searchProducts, getCarousel, getCurrentAnnouncement } from '../../api/index.js'

export default {
  components: { SearchBar, BannerSwiper, CategoryGrid, ProductCard, FloatingNav, Skeleton, OnboardingGuide },
  data() {
    return {
      loading: true,
      keyword: '',
      roomName: '',
      user: null,
      banners: ['/static/logo.png', '/static/logo.png', '/static/logo.png'],
      topCategories: [],
      activeCateId: '',
      activeCateName: '',
      leftChildren: [],
      subCategoryList: [],
      seckillList: [
        { id: 's1', title: '爆款秒杀1', price: 99, image: '/static/logo.png' },
        { id: 's2', title: '爆款秒杀2', price: 129, image: '/static/logo.png' },
        { id: 's3', title: '爆款秒杀3', price: 59, image: '/static/logo.png' }
      ],
      recommendList: []
      , panelTop: 20
      , panelLeft: 0
      , panelRight: 0
      , hoveringPanel: false
      , leaveTimer: null
      , showAnnouncementModal: false
      , announcementLoading: false
      , announcement: null
      , showAnnContent: false
      , showOnboarding: false
      , onboardingStepIndex: 0
      , onboardingRects: []
      , onboardingSteps: [
        '顶部搜索可快速查找商品与店铺',
        '左侧分类导航支持展开子分类',
        '轮播图可直达热门商品',
        '猜你喜欢展示为你推荐的商品',
        '我的与购物车提供快捷入口',
        '商品详情页查看规格与加入购物车',
        '房间选择，购物车根据房间名进行分组',
        '订单页面查看物流与支付进度',
        '个人信息管理',
        '功能区',
        '收货地址管理'
      ]
      , onboardingStepsMp: [
        '顶部搜索定位商品',
        '横向分类导航查看子分类',
        '轮播图快捷入口',
        '猜你喜欢推荐区',
        '商品详情页查看规格与加入购物车',
        '房间选择，购物车根据房间名进行分组',
        '订单页面查看物流与支付进度',
        '个人信息管理',
        '功能区',
        '收货地址管理'
      ]
    }
  },
  onLoad() {
    try {
      const isH5 = typeof window !== 'undefined'
      if (!isH5) {
        this.onboardingSteps = this.onboardingStepsMp
      }
      const jl = !!uni.getStorageSync('just_logged_in')
      if (jl) {
        this.triggerOnboarding()
        uni.removeStorageSync('just_logged_in')
      }
    } catch (e) { }
  },
  computed: {
    displayTime() {
      try {
        const t = this.announcement?.created_at || this.announcement?.timestamp || ''
        if (!t) return ''
        const d = new Date(t)
        if (isNaN(d.getTime())) return String(t)
        const y = d.getFullYear()
        const m = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        const h = String(d.getHours()).padStart(2, '0')
        const mm = String(d.getMinutes()).padStart(2, '0')
        return `${y}-${m}-${day} ${h}:${mm}`
      } catch (e) { return '' }
    }
  },
  onShow() {
    // #ifdef H5
    try {
      const p = uni.hideTabBar({ animation: false })
      if (p && typeof p.then === 'function') { p.catch(() => { }) }
    } catch (e) { }
    try { this.user = uni.getStorageSync('user') || null } catch (e) { }
    try { this.roomName = uni.getStorageSync('currentRoom') || '' } catch (e) { }
    // #endif
    try {
      const cont = !!uni.getStorageSync('onboarding_continue')
      const idx = Number(uni.getStorageSync('onboarding_index') || 0)
      const stepsStored = uni.getStorageSync('onboarding_steps') || []
      const jl = !!uni.getStorageSync('just_logged_in')
      if (cont && Array.isArray(stepsStored) && stepsStored.length && idx <= 4) {
        this.onboardingSteps = stepsStored
        this.onboardingStepIndex = idx
        this.showOnboarding = true
        this.$nextTick(() => { this.refreshOnboardingTargets() })
      } else if (jl) {
        this.triggerOnboarding()
        uni.removeStorageSync('just_logged_in')
      }
    } catch (e) { }
    // 拉取分类与推荐商品（最小接入，不影响现有交互）
    try {
      const p1 = getVisibleCategories({ page: 1, page_size: 20, sort_by: 'id' })
        .then((res) => {
          const items = Array.isArray(res?.data?.items) ? res.data.items : []
          const mapped = items.map((it, i) => ({
            name: it?.name || ('分类' + (i + 1)),
            icon: (typeof it?.image_url === 'string' ? it.image_url.replace(/`/g, '').trim() : '')
              || (typeof it?.thumbnail === 'string' ? it.thumbnail.replace(/`/g, '').trim() : '')
              || (typeof it?.icon === 'string' ? it.icon.replace(/`/g, '').trim() : ''),
            categories_id: it?.categories_id || it?.id || ''
          }))
          this.topCategories = mapped
          this.subCategoryList = mapped
        })
        .catch(() => { })

      const p2 = getCarousel()
        .then((res) => {
          const items = Array.isArray(res?.data?.items) ? res.data.items : []
          this.banners = items.map((it, i) => ({
            image: (typeof it?.image === 'string' ? it.image.replace(/`/g, '').trim() : '') || '/static/logo.png',
            id: it?.available_product_id || ''
          }))
          if (this.banners.length === 0) this.banners = ['/static/logo.png', '/static/logo.png']
        })
        .catch(() => { })

      const p3 = getRecommendedProducts({ page: 1, page_size: 30, sort_by: 'id' })
        .then((res) => {
          const list = Array.isArray(res?.data?.items) ? res.data.items : []
          this.recommendList = list.map((it, i) => ({
            id: it?.available_product_id || it?.id || ('p' + i),
            title: it?.name || ('推荐商品 ' + (i + 1)),
            price: Number(it?.price ?? 0) || 0,
            sales: Number(it?.order_count ?? it?.sales ?? 0) || 0,
            image: (typeof it?.main_image === 'string' ? it.main_image.replace(/`/g, '').trim() : '')
              || (typeof it?.thumbnail === 'string' ? it.thumbnail.replace(/`/g, '').trim() : '')
              || '/static/logo.png'
          }))
        })
        .catch(() => { })

      Promise.allSettled([p1, p2, p3]).then(() => {
        this.loading = false
      })
    } catch (e) { this.loading = false }
  },
  onPullDownRefresh() {
    setTimeout(() => { uni.stopPullDownRefresh() }, 600)
  },
  onHide() {
    this.showOnboarding = false
  },
  methods: {
    triggerOnboarding() {
      this.showOnboarding = true
      this.onboardingStepIndex = 0
      try {
        uni.setStorageSync('onboarding_steps', this.onboardingSteps)
        uni.setStorageSync('onboarding_index', 0)
      } catch (e) { }
      this.$nextTick(() => {
        this.refreshOnboardingTargets()
        setTimeout(() => { this.refreshOnboardingTargets() }, 120)
      })
    },
    refreshOnboardingTargets() {
      try {
        let isH5 = false
        try { isH5 = typeof window !== 'undefined' } catch (e) { isH5 = false }
        if (isH5) {
          const sel = s => typeof document !== 'undefined' ? document.querySelector(s) : null
          const baseEl = (typeof document !== 'undefined' ? (document.getElementById('app') || document.querySelector('.uni-app') || document.body) : null)
          const baseRect = baseEl && baseEl.getBoundingClientRect ? baseEl.getBoundingClientRect() : { left: 0, top: 0 }
          const ox = baseRect.left || 0
          const oy = baseRect.top || 0
          const rectOf = el => {
            if (!el) return null
            const r = el.getBoundingClientRect()
            return { left: r.left - ox, top: r.top - oy, width: r.width, height: r.height }
          }
          const rects = [
            rectOf(sel('.search-input-field')) || rectOf(sel('#og-search')),
            rectOf(sel('#og-cate')),
            rectOf(sel('.center-content')),
            rectOf(sel('#og-guess .guess-title')) || rectOf(sel('#og-guess')),
            rectOf(sel('#og-quick'))
          ].filter(Boolean)
          this.onboardingRects = rects
        } else {
          const q = uni.createSelectorQuery().in(this)
          q.select('#og-search').boundingClientRect()
          q.select('#og-mp-cate').boundingClientRect()
          q.select('#og-banner').boundingClientRect()
          q.select('#og-mp-guess').boundingClientRect()
          q.exec(res => {
            const rects = (res || []).filter(Boolean).map(r => ({ left: r.left, top: r.top, width: r.width, height: r.height }))
            this.onboardingRects = rects
          })
        }
      } catch (e) { this.onboardingRects = [] }
    },
    handleOnboardingNext(nextIndex) {
      const idx = Number(nextIndex || 0)
      this.onboardingStepIndex = idx
      try {
        uni.setStorageSync('onboarding_steps', this.onboardingSteps)
        uni.setStorageSync('onboarding_index', idx)
      } catch (e) { }
      const isH5 = typeof window !== 'undefined'
      if (!isH5) {
        if (idx === 4) {
          this.openFirstProductFromOnboarding()
        } else if (idx === 5) {
          this.goRoomSelectFromOnboarding()
        } else if (idx === 6) {
          this.goOrderFromOnboarding()
        } else if (idx === 7) {
          this.goProfileInfoFromOnboarding()
        } else if (idx === 8) {
          this.goProfileFeatureFromOnboarding()
        } else if (idx === 9) {
          this.goProfileAddressFromOnboarding()
        } else {
          this.$nextTick(() => { this.refreshOnboardingTargets() })
        }
      } else {
        if (idx === 5) {
          this.openFirstProductFromOnboarding()
        } else if (idx === 6) {
          this.goRoomSelectFromOnboarding()
        } else if (idx === 7) {
          this.goOrderFromOnboarding()
        } else if (idx === 8) {
          this.goProfileInfoFromOnboarding()
        } else if (idx === 9) {
          this.goProfileFeatureFromOnboarding()
        } else if (idx === 10) {
          this.goProfileAddressFromOnboarding()
        } else {
          this.$nextTick(() => { this.refreshOnboardingTargets() })
        }
      }
    },
    handleOnboardingPrev(prevIndex) {
      const idx = Number(prevIndex || 0)
      if (idx < 0) return
      this.onboardingStepIndex = idx
      try { uni.setStorageSync('onboarding_index', idx) } catch (e) { }
      this.$nextTick(() => { this.refreshOnboardingTargets() })
    },
    handleOnboardingClose() {
      this.showOnboarding = false
      try {
        uni.removeStorageSync('onboarding_continue')
        uni.removeStorageSync('onboarding_target_selector')
        uni.removeStorageSync('onboarding_step_text')
        uni.removeStorageSync('onboarding_steps')
        uni.removeStorageSync('onboarding_index')
      } catch (e) { }
      try {
        if (uni && uni.reLaunch) { uni.reLaunch({ url: '/pages/home/index' }); return }
        if (uni && uni.switchTab) { uni.switchTab({ url: '/pages/home/index' }); return }
        if (uni && uni.navigateTo) { uni.navigateTo({ url: '/pages/home/index' }); return }
      } catch (e) { }
    },
    goHomeFromOnboarding() {
      try { if (uni && uni.switchTab) uni.switchTab({ url: '/pages/home/index' }) } catch (e) { }
      this.$nextTick(() => { this.refreshOnboardingTargets() })
    },
    openFirstProductFromOnboarding() {
      try {
        this.showOnboarding = false
        const first = (this.recommendList && this.recommendList[0]) || null
        if (!first) return
        const id = encodeURIComponent(first.id || '')
        try {
          uni.setStorageSync('onboarding_continue', true)
          uni.setStorageSync('onboarding_target_selector', '#og-product-add')
          uni.setStorageSync('onboarding_step_text', '商品详情页查看规格与加入购物车')
          uni.setStorageSync('onboarding_steps', this.onboardingSteps)
          uni.setStorageSync('onboarding_index', this.onboardingStepIndex)
        } catch (e) { }
        if (uni && uni.navigateTo) uni.navigateTo({ url: '/pages/product/index?id=' + id })
      } catch (e) { }
    },
    goRoomSelectFromOnboarding() {
      try {
        this.showOnboarding = false
        uni.setStorageSync('onboarding_continue', true)
        uni.setStorageSync('onboarding_target_selector', '#og-room-modal-list')
        uni.setStorageSync('onboarding_step_text', '房间选择，购物车根据房间名进行分组')
        uni.setStorageSync('onboarding_steps', this.onboardingSteps)
        uni.setStorageSync('onboarding_index', this.onboardingStepIndex)
      } catch (e) { }
      try { if (uni && uni.navigateTo) uni.navigateTo({ url: '/pages/product/index' }) } catch (e) { }
    },
    goOrderFromOnboarding() {
      try {
        this.showOnboarding = false
        uni.setStorageSync('onboarding_continue', true)
        uni.setStorageSync('onboarding_target_selector', '#og-order-tabs')
        uni.setStorageSync('onboarding_step_text', '订单标签切换与查看')
        uni.setStorageSync('onboarding_steps', this.onboardingSteps)
        uni.setStorageSync('onboarding_index', this.onboardingStepIndex)
      } catch (e) { }
      try { if (uni && uni.navigateTo) uni.navigateTo({ url: '/pages/order/index' }) } catch (e) { }
    },
    goProfileInfoFromOnboarding() {
      try {
        this.showOnboarding = false
        uni.setStorageSync('onboarding_continue', true)
        uni.setStorageSync('onboarding_target_selector', '#og-profile-info')
        uni.setStorageSync('onboarding_step_text', '个人信息管理')
        uni.setStorageSync('onboarding_steps', this.onboardingSteps)
        uni.setStorageSync('onboarding_index', this.onboardingStepIndex)
        if (uni && uni.switchTab) uni.switchTab({ url: '/pages/profile/index' })
        else if (uni && uni.navigateTo) uni.navigateTo({ url: '/pages/profile/index' })
      } catch (e) { }
    },
    goProfileFeatureFromOnboarding() {
      try {
        this.showOnboarding = false
        uni.setStorageSync('onboarding_continue', true)
        uni.setStorageSync('onboarding_target_selector', '#og-profile-menu')
        uni.setStorageSync('onboarding_step_text', '功能区')
        uni.setStorageSync('onboarding_steps', this.onboardingSteps)
        uni.setStorageSync('onboarding_index', this.onboardingStepIndex)
        if (uni && uni.switchTab) uni.switchTab({ url: '/pages/profile/index' })
        else if (uni && uni.navigateTo) uni.navigateTo({ url: '/pages/profile/index' })
      } catch (e) { }
    },
    goProfileAddressFromOnboarding() {
      try {
        this.showOnboarding = false
        uni.setStorageSync('onboarding_continue', true)
        uni.setStorageSync('onboarding_target_selector', '#og-profile-addr')
        uni.setStorageSync('onboarding_step_text', '收货地址管理')
        uni.setStorageSync('onboarding_steps', this.onboardingSteps)
        uni.setStorageSync('onboarding_index', this.onboardingStepIndex)
        if (uni && uni.switchTab) uni.switchTab({ url: '/pages/profile/index' })
        else if (uni && uni.navigateTo) uni.navigateTo({ url: '/pages/profile/index' })
      } catch (e) { }
    },
    hoverCategory(cat, e) {
      const id = cat?.categories_id || ''
      if (!id) { uni.showToast({ title: '分类缺少ID', icon: 'none' }); return }
      if (this.activeCateId === id && (this.leftChildren && this.leftChildren.length)) return
      this.activeCateId = id
      this.activeCateName = cat?.name || ''
      // #ifdef H5
      try {
        const main = document.querySelector('.center-content')
        const header = document.querySelector('.h5-header')
        const headerBottom = header ? header.getBoundingClientRect().bottom : 100
        if (main && e && e.clientY != null) {
          const rect = main.getBoundingClientRect()
          const y = e.clientY
          const offset = 160
          this.panelTop = Math.max(headerBottom + 10, y - offset)
          const w = Math.min(560, rect.width * 0.6)
          this.panelLeft = Math.max(0, rect.left - 20)
          this.panelRight = Math.max(0, document.documentElement.clientWidth - (this.panelLeft + w))
        }
      } catch (err) { }
      // #endif
      try {
        getVisibleCategories({ page: 1, page_size: 50, sort_by: 'id', categories_id: id })
          .then((res) => {
            const items = Array.isArray(res?.data?.items) ? res.data.items : []
            this.leftChildren = items.map((it, i) => ({ name: it?.name || ('子分类' + (i + 1)), categories_id: it?.categories_id || it?.id || '', icon: (typeof it?.thumbnail === 'string' ? it.thumbnail.replace(/`/g, '').trim() : '') || (typeof it?.icon === 'string' ? it.icon.replace(/`/g, '').trim() : '') }))
          })
          .catch(() => { this.leftChildren = [] })
      } catch (e) { this.leftChildren = [] }
    },
    onCateListLeave() {
      try { if (this.leaveTimer) { clearTimeout(this.leaveTimer) } } catch (e) { }
      this.leaveTimer = setTimeout(() => { if (!this.hoveringPanel) this.closeCategory() }, 120)
    },
    onPanelEnter() {
      this.hoveringPanel = true
      try { if (this.leaveTimer) { clearTimeout(this.leaveTimer) } } catch (e) { }
    },
    onPanelLeave() {
      this.hoveringPanel = false
      this.closeCategory()
    },
    closeCategory() {
      this.activeCateId = ''
      this.activeCateName = ''
      this.leftChildren = []
    },
    onSearch(val) {
      const q = (val || this.keyword || '').trim()
      if (!q) { uni.showToast({ title: '请输入关键字', icon: 'none' }); return }
      // #ifdef H5
      uni.navigateTo({ url: '/pages/search/index?q=' + encodeURIComponent(q) })
      // #endif
      // #ifndef H5
      uni.navigateTo({ url: '/pages/search/index?q=' + encodeURIComponent(q) })
      // #endif
    },
    openAnnouncementModalH5() {
      this.announcementLoading = true
      try {
        const u = uni.getStorageSync('user') || null
        const token = (u && (u.token || (u.data && u.data.token))) || ''
        getCurrentAnnouncement({ token }).then(res => {
          const ok = !!(res && res.success)
          const data = res?.data || null
          if (ok && data) {
            this.announcement = {
              id: data.announcement_id || data.id || '',
              title: data.title || '',
              content: data.content || '',
              created_at: data.created_at || res.timestamp || ''
            }
          } else {
            this.announcement = null
          }
        }).catch(() => { this.announcement = null })
          .finally(() => {
            this.announcementLoading = false
            this.showAnnouncementModal = true
            this.showAnnContent = true
          })
      } catch (e) {
        this.announcement = null
        this.announcementLoading = false
        this.showAnnouncementModal = true
        this.showAnnContent = true
      }
    },
    closeAnnouncementModal() {
      this.showAnnouncementModal = false
      this.showAnnContent = false
    },
    openCategory(cat) {
      // #ifdef H5
      const id = cat?.categories_id || ''
      if (!id) { uni.showToast({ title: '分类缺少ID', icon: 'none' }); return }
      // 再次点击同一一级分类时收缩关闭展开框
      if (this.activeCateId === id) {
        this.activeCateId = ''
        this.activeCateName = ''
        this.leftChildren = []
        return
      }
      // 展开并加载子分类
      this.activeCateId = id
      this.activeCateName = cat?.name || ''
      try {
        getVisibleCategories({ page: 1, page_size: 50, sort_by: 'id', categories_id: id })
          .then((res) => {
            const items = Array.isArray(res?.data?.items) ? res.data.items : []
            this.leftChildren = items.map((it, i) => ({ name: it?.name || ('子分类' + (i + 1)), categories_id: it?.categories_id || it?.id || '' }))
          })
          .catch(() => { this.leftChildren = [] })
      } catch (e) { this.leftChildren = [] }
      // #endif
      // #ifndef H5
      const aid = encodeURIComponent(cat?.categories_id || '')
      const aname = encodeURIComponent(cat?.name || '')
      const url = `/pages/category/index?active=${aname}&active_id=${aid}`
      if (uni.switchTab) { uni.switchTab({ url }) } else { uni.navigateTo({ url }) }
      // #endif
    },
    goSubList(sub) {
      // 仅 H5 展开面板内点击：跳转到子分类商品列表新页面
      // 传递父分类ID与当前子分类ID以用于顶部导航和内容加载
      const pid = encodeURIComponent(this.activeCateId || '')
      const cid = encodeURIComponent(sub?.categories_id || '')
      const pname = encodeURIComponent(this.activeCateName || '')
      if (!cid) { uni.showToast({ title: '子分类缺少ID', icon: 'none' }); return }
      const url = `/pages/category/list?parent_id=${pid}&category_id=${cid}&active=${pname}`
      this.closeCategory()
      uni.navigateTo({ url })
    },
    addToCart(product) {
      try {
        const cart = uni.getStorageSync('cart') || []
        const i = cart.findIndex(it => it.id === product.id)
        if (i >= 0) cart[i].quantity = (cart[i].quantity || 1) + 1
        else cart.push({ ...product, quantity: 1 })
        uni.setStorageSync('cart', cart)
        uni.showToast({ title: '已加入购物车', icon: 'success' })
      } catch (e) {
        console.error(e)
      }
    },
    goLogin() {
      uni.navigateTo({ url: '/pages/login/index' })
    },
    onAvatarClick() {
      if (this.user) {
        if (uni.switchTab) uni.switchTab({ url: '/pages/profile/index' })
        else uni.navigateTo({ url: '/pages/profile/index' })
      } else {
        uni.navigateTo({ url: '/pages/login/index' })
      }
    },
    saveRoom() {
      try {
        const name = (this.roomName || '').trim()
        if (!name) return
        uni.setStorageSync('currentRoom', name)
        const rooms = uni.getStorageSync('rooms') || []
        if (!rooms.includes(name)) { rooms.push(name); uni.setStorageSync('rooms', rooms) }
        uni.showToast({ title: '房间名已保存', icon: 'success' })
      } catch (e) { }
    },
    logout() {
      try {
        uni.removeStorageSync('user')
      } catch (e) { }
      this.user = null
      // uni.showToast({ title: '已退出登录', icon: 'success' })
      setTimeout(() => {
        uni.navigateTo({ url: '/pages/login/index' })
      }, 500)
    }
  }
}
</script>

<style scoped>
.page {
  /* background: white; */

  /* #ifdef H5 */
  min-height: 100vh;
  /* #endif */
  /* #ifndef H5 */
  min-height: 100vh;
  padding-bottom: 20rpx;
  /* #endif */
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
}

/* H5 New Layout Styles */
/* #ifdef H5 */
.h5-container {
  max-width: 1350px;
  margin: 0 auto;
  padding: 0 100rpx;
  min-height: 100vh;
  background-color: #fff;
  padding-bottom: 60rpx;
}

/* Header */
.h5-header {
  display: flex;
  align-items: center;
  height: 140rpx;
  /* Increased height for better top spacing */
  padding: 30rpx 0;
  /* margin-bottom: 20rpx; */
}

.h5-logo-area {
  width: 300px;
  /* Match side-cate width */
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-text {
  font-size: 48rpx;
  font-weight: bold;
  font-family: serif;
  color: #000;
  letter-spacing: 2rpx;
}

.h5-search-wrapper {
  flex: 1;
  display: flex;
  justify-content: flex-start;
  padding-left: 20rpx;
  /* Align with gap */
  padding-right: 120rpx;
}

.search-bar-box {
  display: flex;
  align-items: center;
  width: 100%;
  height: 80rpx;
  border: 3rpx solid #000;
  border-radius: 40rpx;
  padding: 4rpx;
  background: #fff;
}

.search-type {
  padding: 0 30rpx;
  font-size: 30rpx;
  color: #333;
  font-weight: 500;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.arrow-down {
  font-size: 20rpx;
  margin-left: 10rpx;
  color: #666;
}

.divider-v {
  width: 2rpx;
  height: 30rpx;
  background: #ddd;
  margin-right: 16rpx;
}

.search-input-field {
  flex: 1;
  height: 100%;
  font-size: 30rpx;
}

.search-btn-black {
  background: #000;
  color: #fff;
  border-radius: 36rpx;
  font-size: 30rpx;
  font-weight: bold;
  height: 70rpx;
  line-height: 70rpx;
  padding: 0 50rpx;
  margin-right: 4rpx;
}

/* Middle Layout */
.h5-middle-layout {
  display: grid;
  grid-template-columns: 300px 1fr 300px;
  gap: 20rpx;
  height: 720rpx;
  margin-bottom: 40rpx;
  align-items: stretch;
}

.side-cate {
  background: #f8f8f8;
  border-radius: 12rpx;
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  width: 60%;
  /* align-items: center; */
  /* text-align: center; */
  height: 100%;
  box-sizing: border-box;
}

.cate-title {
  font-size: 32rpx;
  font-weight: bold;
  padding-bottom: 20rpx;
  display: flex;
  /* align-items: center; */
  /* justify-content: center; */
  color: #000;
  border-bottom: 1rpx solid #eee;
  margin-bottom: 10rpx;
}

.cate-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  /* justify-content: space-between; */
  overflow-y: auto;
}

.cate-item {
  display: flex;
  align-items: center;
  padding: 16rpx 0;
  cursor: pointer;
  color: #333;
  font-size: 32rpx;
  /* 分类字体加大 */
  transition: all 0.2s;
  /* justify-content: center; */
}

.cate-item:hover {
  color: #000;
  font-weight: bold;
}

.cate-dot {
  margin-right: 12rpx;
  font-size: 24rpx;
  color: #000;
}

.cate-name {
  font-size: 32rpx;
}

/* Center Banner */
.center-content {
  position: relative;
  border-radius: 12rpx;
  overflow: hidden;
  height: 100%;
  box-sizing: border-box;
}

.full-height-banner {
  height: 100%;
}

.center-content :deep(.banner),
.center-content :deep(.swiper) {
  height: 100% !important;
  padding: 0 !important;
}

.center-content :deep(.uni-swiper-wrapper) {
  border-radius: 12rpx;
}

/* User Card */
.side-user {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.user-card-new {
  background: #f8f8f8;
  border-radius: 24rpx;
  height: 100%;
  padding: 40rpx 30rpx;
  display: flex;
  flex-direction: column;
  box-shadow: none;
  box-sizing: border-box;
}

.uc-header {
  display: flex;
  align-items: center;
  margin-bottom: 50rpx;
}

.uc-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 20rpx;
  background: #fff;
  border: 2rpx solid #fff;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.uc-info {
  flex: 1;
}

.uc-greet {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  line-height: 1.4;
}

.uc-links {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.uc-link-item {
  display: flex;
  align-items: center;
  font-size: 30rpx;
  color: #333;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
}

.uc-link-item:hover {
  color: #000;
}

.uc-icon {
  margin-right: 24rpx;
  font-size: 36rpx;
  width: 40rpx;
  text-align: center;
  filter: grayscale(100%) brightness(0);
  opacity: 1;
}

.uc-link-item:hover .uc-icon {
  filter: grayscale(100%) brightness(0);
  opacity: 0.8;
}

.uc-login-btn {
  background: #000;
  color: #fff;
  border-radius: 999rpx;
  width: 100%;
  font-size: 32rpx;
  font-weight: bold;
  height: 80rpx;
  line-height: 80rpx;
  margin-top: auto;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.2);
}

.uc-login-btn:active {
  transform: scale(0.98);
}

/* Bottom Section */
.h5-bottom-section {
  margin-top: 70rpx;
  padding-left: 110rpx;
  padding-right: 110rpx;
}

.guess-header {
  display: flex;
  align-items: center;
  margin-bottom: 40rpx;
  padding-left: 20rpx;
}

.guess-icon {
  width: 64rpx;
  height: 64rpx;
  background: #000;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  margin-right: 24rpx;
  font-size: 32rpx;
}

.guess-title {
  font-size: 40rpx;
  font-weight: 900;
  color: #333;
}

.grid2 {
  display: grid;
  grid-template-columns: repeat(6, 1fr) !important;
  gap: 30rpx;
}

/* Sub Panel */
.sub-panel {
  position: fixed;
  z-index: 999;
  background: rgba(255, 255, 255, 0.98);
  border: 1rpx solid #eee;
  padding: 40rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
  border-radius: 12rpx;
  min-width: 600rpx;
  margin-left: -90rpx;
  /* margin-top: 80rpx; */
}

.panel-title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 30rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.panel-columns {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20rpx;
}

.panel-link {
  color: #666;
  font-size: 28rpx;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.panel-link:hover {
  color: #333;
  font-weight: 600;
}

/* Responsive */
/* @media (max-width: 1200px) {
  .grid2 { grid-template-columns: repeat(4, 1fr); }
  .h5-middle-layout { grid-template-columns: 220rpx 1fr 260rpx; }
} */

/* Hide original components overrides */
.main :deep(.search-bar),
.main :deep(.banner) {
  display: none;
}

/* #endif */

.block {
  margin-top: 20rpx;
  background: #fff;
}

.block-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  font-weight: 500;
  font-size: 35rpx;
  margin-left: 10rpx;
}

.more {
  color: #999;
  font-size: 26rpx;
}

.seckill {
  white-space: nowrap;
  padding: 0 20rpx 20rpx;
}

.sk-item {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  width: 220rpx;
  margin-right: 16rpx;
}

.sk-img {
  width: 220rpx;
  height: 220rpx;
  border-radius: 12rpx;
  background: #f5f5f5;
}

.sk-price {
  color: #e1251b;
  font-size: 28rpx;
  margin-top: 8rpx;
}

.grid2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 40rpx;
  padding: 0 20rpx 20rpx;
}

.grid2-item {}

/* 首页隐藏商品卡片中的加入购物车按钮 */
:deep(.actions),
:deep(.btn-cart) {
  display: none !important;
}

.h5-mask {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgba(0, 0, 0, .45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.h5-modal {
  width: 820rpx;
  max-width: 90vw;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 12rpx 28rpx rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  height: 60vh;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12rpx;
  border-bottom: 1rpx solid #f0f0f0;
  margin-bottom: 16rpx;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #333;
}

.modal-close {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  color: #999;
  cursor: pointer;
}

.modal-close:active {
  color: #333;
}

.modal-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.modal-body-two {
  display: flex;
  gap: 16rpx;
  height: 100%;
}

.two-left {
  width: 280rpx;
  flex-shrink: 0;
  padding-right: 16rpx;
  border-right: 1rpx solid #f0f0f0;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.two-left {
  cursor: pointer;
}

.two-label {
  font-size: 24rpx;
  color: #999;
}

.two-title {
  font-size: 30rpx;
  color: #333;
  font-weight: 600;
}

.two-right {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-left: 16rpx;
}

.two-hint {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 26rpx;
}

.a-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
  display: block;
}

.a-time {
  font-size: 24rpx;
  color: #999;
  display: block;
  margin-top: 8rpx;
  margin-bottom: 16rpx;
}

.a-content {
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
  white-space: pre-wrap;
}

/* 房间名输入样式（H5和小程序通用） */
.room-block {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx 20rpx;
  background: #ffffff;
}

.room-label {
  color: #333;
}

.room-input {
  flex: 1;
  height: 64rpx;
  line-height: 64rpx;
  background: #f7f7f7;
  border: 1rpx solid #e6e6e6;
  border-radius: 12rpx;
  padding: 0 16rpx;
}

/* H5：右侧展开的子分类面板样式 */
.sub-panel {
  position: fixed;
  z-index: 1000;
  background-color: #fff;
  border-radius: 12rpx;
  box-shadow: 0 6rpx 18rpx rgba(0, 0, 0, 0.08);
  border: 1.5rpx solid #000;
  height: clamp(200rpx, 30vh, 480rpx);
  max-height: 50vh;
  overflow-y: auto;
  padding: 30rpx 60rpx 60rpx;
}

.panel-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 12rpx;
}

.panel-columns {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30rpx 25rpx;
}

.panel-link {
  font-size: 32rpx;
  color: #333;
  line-height: 48rpx;
  display: flex;
  align-items: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.panel-link:hover {
  color: #333;
  font-weight: 600;
}

.sub-icon {
  margin-right: 12rpx;
  font-size: 28rpx;
}

.sub-empty {
  font-size: 24rpx;
  color: #888;
  text-align: center;
  padding: 20rpx 0;
}
</style>
<style scoped>
.mp-cate-nav {
  white-space: nowrap;
  padding: 12rpx 20rpx;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 50;
}

.mp-cate-item {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 14rpx 18rpx;
  margin-right: 12rpx;
  border-radius: 16rpx;
  background: #fff;
  color: #333;
  font-size: 26rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, .04);
}

.mp-cate-thumb {
  width: 96rpx;
  height: 96rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
}

.mp-cate-name {
  margin-top: 8rpx;
}

.mp-cate-item.active {
  background: #ffe9e3;
  color: #ff5000;
}
</style>
