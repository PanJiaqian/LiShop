<template>
  <view class="page product-page" :class="{ 'no-scroll': mpSheet || roomSelectorVisible }">
    <Skeleton :loading="!product" :showTitle="true" />
    <block v-if="product">
      <!-- #ifdef H5 -->
      <view class="h5-product-bg">
        <view class="h5-topbar">
          <button class="back-btn" @click="goBack">←</button>
        </view>
        <view class="h5-product-card">
          <view class="pd-grid">
            <!-- 左侧：可滚动，包含画廊 + 参数 + 图文详情 -->
            <view class="pd-left">
              <view class="pd-gallery">
                <video id="pd-video" v-if="isVideo(currentImage)" class="pd-main" :src="videoSrc" :poster="currentImage"
                  :controls="true" :autoplay="false" playsinline webkit-playsinline crossorigin="anonymous"
                  object-fit="contain" />
                <image v-else class="pd-main" :src="currentImage" mode="aspectFit" />
                <view class="pd-thumbs">
                  <view v-for="(src, i) in images" :key="i" class="pd-thumb" :class="{ active: i === current }"
                    @click="current = i" style="position: relative; overflow: hidden;">
                    <image :src="isVideo(src) ? (product.image || '/static/logo.png') : src" mode="aspectFill"
                      style="width: 100%; height: 100%; display: block;" />
                    <view v-if="isVideo(src)"
                      style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
                      <text style="color: #fff; font-size: 12px;">▶</text>
                    </view>
                  </view>
                </view>
              </view>

              <view class="pd-card pd-params">
                <text class="pd-section-title">参数信息</text>
                <view class="pd-param-grid">
                  <view class="pd-param-item"><text class="key">型号</text><text class="val">{{ product.id || '默认款'
                  }}</text></view>
                  <view class="pd-param-item"><text class="key">名称</text><text class="val">{{ product.title }}</text>
                  </view>
                  <view class="pd-param-item"><text class="key">规格</text><text class="val">默认规格</text></view>
                  <view class="pd-param-item"><text class="key">产地</text><text class="val">{{ product.shipping_origin ?
                    product.shipping_origin.replace(/省|市/g, '') : '—' }}</text></view>
                  <view class="pd-param-item"><text class="key">单位</text><text class="val">件</text></view>
                  <!-- <view class="pd-param-item"><text class="key">价格</text><text class="val">¥{{ product.price.toFixed(2)
                  }}</text></view> -->
                  <view class="pd-param-item"><text class="key">发货</text><text class="val">{{
                    product.shipping_time_hours ? (product.shipping_time_hours + '小时') : '待定' }}</text></view>
                  <!-- <view class="pd-param-item"><text class="key">售后</text><text class="val">{{
                    product.support_no_reason_return_7d ? '七天无理由' : '无' }}</text></view> -->
                </view>
              </view>

              <view class="pd-card pd-detail">
                <text class="pd-section-title">图文详情</text>
                <image v-for="(src, i) in product.details_images" :key="'d' + i" class="pd-detail-img" :src="src"
                  mode="widthFix" />
              </view>
            </view>

            <!-- 右侧：保持现有信息与按钮，不做其它改动 -->
            <view class="pd-right">
              <view class="pd-info">
                <text class="pd-title">{{ product.title }}</text>
                <view class="pd-meta">
                  <text>{{ product.is_free_shipping ? '包邮' : '不包邮' }} ｜ {{ product.shipping_time_hours ?
                    (product.shipping_time_hours + '小时内发货') : '发货时间待定' }} ｜ {{ product.support_no_reason_return_7d ?
                      '七天无理由' : '不支持七天无理由' }}</text>
                </view>
                <view class="pd-price-row">
                  <text class="pd-price">¥{{ displayTopPrice }}</text>
                  <text class="pd-coupon">券后更低</text>
                </view>


                <view>
                  <text class="pd-section-title">规格明细</text>
                  <view v-if="specsLoading"><text class="pd-meta">加载中...</text></view>
                  <view v-else-if="specs && specs.length" class="specs-list">
                    <view class="spec-item" v-for="(it, i) in specs" :key="'h5sp' + i"
                      :class="{ active: selectedSpecIndex === i }" @click="selectSpec(i)">
                      <image class="spec-thumb" :src="it.image_url || '/static/logo.png'" mode="aspectFill" />
                      <view class="spec-info">
                        <text class="spec-name">{{ it.name }}</text>
                        <view class="spec-price-row">
                          <text class="spec-price">¥{{ Number(it.price || 0).toFixed(2) }}</text>
                          <text v-if="Number(it.original_price) > 0" class="spec-oprice">¥{{
                            Number(it.original_price).toFixed(2) }}</text>
                        </view>
                        <text class="spec-unit">单位：{{ it.unit || '—' }}</text>
                      </view>
                    </view>
                  </view>
                  <view v-else><text class="pd-meta">暂无规格数据</text></view>
                </view>

                <view class="pd-address">
                  <text class="pd-section-title">收货地址</text>
                  <view class="address-card">
                    <view v-if="selectedAddress" class="addr-body">
                      <text class="addr-line">{{ selectedAddress.receiver }} {{ selectedAddress.phone }}</text>
                      <text class="addr-line">{{ selectedAddress.province }} {{ selectedAddress.city }} {{
                        selectedAddress.district }} {{ selectedAddress.detail_address }}</text>
                    </view>
                    <view v-else class="addr-empty">未选择收货地址</view>
                    <view class="addr-actions">
                      <button class="addr-btn" @click="openH5AddressSheet">选择地址</button>
                    </view>
                  </view>
                </view>

                <view class="pd-form">
                  <view class="pd-field inline">
                    <text class="pd-section-title">房间</text>
                    <view class="picker-display" @click="openRoomSheet">{{ roomName || '请选择房间' }}</view>
                  </view>
                  <!-- <view class="pd-field inline">
              <text class="label">色温</text>
              <input class="pd-input" v-model="specTemp" placeholder="如 3000K / 4000K" />
            </view> -->
                  <view class="pd-field inline" v-if="selectedSpec && selectedSpec.has_length === 1">
                    <text class="label">长度</text>
                    <input class="pd-input" v-model="specLength" placeholder="填写数字" />
                    <text class="unit-tip">{{ lengthUnitText }}</text>
                  </view>
                </view>

                <view class="pd-actions-row">
                  <view class="qty-box-large">
                    <view class="qty-btn" @click="decQty">-</view>
                    <text class="qty-num">{{ qty }}</text>
                    <view class="qty-btn" @click="incQty">+</view>
                  </view>
                  <button class="btn-action btn-cart" @click="addToCartWithQty">加入购物车</button>
                  <button class="btn-action btn-buy" @click="buyNow">立即购买</button>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
      <FloatingNav :hoverReveal="true" />
      <!-- #endif -->

      <!-- #ifdef MP-WEIXIN -->
      <!-- 背景图移除 -->
      <!-- #endif -->

      <!-- #ifndef H5 -->
      <swiper class="cover" indicator-dots autoplay circular interval="3000">
        <swiper-item v-for="(item, index) in images" :key="index">
          <video v-if="isVideo(item)" :src="item" controls style="width: 100%; height: 100%;"
            object-fit="contain"></video>
          <image v-else :src="item" mode="aspectFill" style="width: 100%; height: 100%;" />
        </swiper-item>
      </swiper>
      <view class="info mp-info-spacing">
        <text class="title">{{ product.title }}</text>
        <view class="mp-price-row">
          <text class="price">¥{{ product.price.toFixed(2) }}</text>
          <text class="sales">销量 {{ product.sales }}</text>
        </view>
      </view>
      <!-- MP 端参数信息与图文详情 -->
      <view class="mp-section mp-section-spacing">
        <text class="mp-title">参数信息</text>
        <view class="mp-param-grid">
          <view class="mp-param-item"><text class="key">型号</text><text class="val">{{ product.id || '默认款' }}</text>
          </view>
          <view class="mp-param-item"><text class="key">名称</text><text class="val">{{ product.title }}</text></view>
          <view class="mp-param-item"><text class="key">规格</text><text class="val">默认规格</text></view>
          <view class="mp-param-row-inline">
            <view class="mp-param-item inline"><text class="key">产地</text><text class="val">{{ product.shipping_origin ?
              product.shipping_origin.replace(/省|市/g, '') :
              '—' }}</text></view>
            <view class="mp-param-item inline"><text class="key">单位</text><text class="val">件</text></view>
            <view class="mp-param-item inline"><text class="key">单位价格</text><text class="val">¥{{
              product.price.toFixed(2)
            }}</text></view>
          </view>
        </view>
      </view>
      <view class="mp-section">
        <text class="mp-title">图文详情</text>
        <image v-for="(src, i) in product.details_images" :key="'md' + i" class="mp-detail-img" :src="src"
          mode="widthFix" />
      </view>
      <view class="footer">
        <!-- #ifdef MP-WEIXIN -->
        <button class="btn-cart" @click="openSpecSheet">加入购物车</button>
        <!-- #endif -->
        <!-- #ifndef MP-WEIXIN -->
        <button class="btn-cart" @click="addToCart">加入购物车</button>
        <!-- #endif -->
      </view>

      <!-- #ifdef MP-WEIXIN -->
      <view v-if="mpSheet" class="mp-mask" @click="closeSpecSheet" catchtouchmove="true"
        @touchmove.stop.prevent="() => { }">
        <view class="mp-sheet" @click.stop>
          <view class="mp-title">填写规格</view>
          <scroll-view scroll-y class="mp-scroll-view">
            <view class="mp-address-bar" @click="openMpAddressSheet">
              <view class="bar-left">
                <text class="addr-icon">📍</text>
                <view class="bar-info">
                  <text v-if="selectedAddress" class="bar-line">{{ selectedAddress.receiver }} {{ selectedAddress.phone
                  }}</text>
                  <text v-if="selectedAddress" class="bar-line">{{ selectedAddress.province }} {{ selectedAddress.city
                  }} {{ selectedAddress.district }} {{ selectedAddress.detail_address }}</text>
                  <text v-else class="bar-line">请选择收货地址</text>
                </view>
              </view>
              <button size="mini" class="bar-btn">选择收货地址</button>
            </view>
            <!-- 规格明细（适配 data.children），参考淘宝/京东样式 -->
            <view class="mp-title">规格明细</view>
            <view v-if="specsLoading" class="mp-param-grid">
              <view class="mp-param-item"><text class="key">加载中...</text><text class="val"></text></view>
            </view>
            <view v-else-if="specs && specs.length" class="specs-list">
              <view class="spec-item" v-for="(it, i) in (isSpecsCollapsed ? specs.slice(0, 2) : specs)"
                :key="'mpsp' + i" :class="{ active: selectedSpecIndex === i }" @click="selectSpec(i)">
                <image class="spec-thumb" :src="it.image_url || '/static/logo.png'" mode="aspectFill" />
                <view class="spec-info">
                  <text class="spec-name">{{ it.name }}</text>
                  <view class="spec-price-row">
                    <text class="spec-price">¥{{ Number(displaySpecPrice(it)).toFixed(2) }}</text>
                    <text v-if="Number(it.original_price) > 0" class="spec-oprice">¥{{
                      Number(it.original_price).toFixed(2) }}</text>
                  </view>
                  <text class="spec-unit">单位：{{ it.unit || '—' }}</text>
                </view>
              </view>
              <!-- 展开/收起按钮 -->
              <view v-if="specs.length > 3" class="specs-toggle" @click="isSpecsCollapsed = !isSpecsCollapsed">
                <text>{{ isSpecsCollapsed ? '展开更多' : '收起' }}</text>
                <text class="toggle-icon">{{ isSpecsCollapsed ? '▼' : '▲' }}</text>
              </view>
            </view>
            <view v-else class="mp-param-grid">
              <view class="mp-param-item"><text class="key">暂无规格数据</text><text class="val">—</text></view>
            </view>

            <view class="mp-field"><text class="label">房间</text>
              <view class="mp-input" @click="openMpRoomSheet">{{ mpRoom || '请选择房间' }}</view>
            </view>
            <!-- <view class="mp-field"><text class="label">色温</text><input class="mp-input" v-model="mpTemp"
              placeholder="如 3000K" /></view> -->
            <view class="mp-field" v-if="selectedSpec && selectedSpec.has_length === 1">
              <text class="label">长度</text>
              <input class="mp-input" v-model="mpLength" placeholder="填写数字" />
              <text v-if="selectedSpec.specification"
                style="font-size: 24rpx; color: #ff2d55; margin-left: 12rpx; white-space: nowrap;">最长：{{
                  selectedSpec.specification }}</text>
            </view>
            <view class="mp-field">
              <text class="label">数量</text>
              <view class="qty-stepper">
                <button class="step" @click="mpQty = Math.max(1, mpQty - 1)">-</button>
                <text class="count">{{ mpQty }}</text>
                <button class="step" @click="mpQty = mpQty + 1">+</button>
              </view>
            </view>
          </scroll-view>
          <view class="mp-actions">
            <button class="mp-btn ghost" @click="closeSpecSheet">取消</button>
            <button class="mp-btn primary" @click="confirmSpecToCart">确定加入</button>
          </view>
        </view>
      </view>
      <!-- MP Room Selection Modal -->
      <!-- #endif -->
      <!-- #endif -->
    </block>
    <RoomSelector :visible="roomSelectorVisible" :rooms="selectorRooms" :type="selectorType"
      :selectedName="selectorSelectedName" @close="closeRoomSheet" @select="onRoomSelect" @create="onRoomCreate"
      @createAddress="onCreateAddress" />
  </view>
</template>

<script>
import { getProductDetail, getProductSpecs, getRooms, createRoom, addCartItem, getCartItems, createOrderByIds, getAddresses, addAddress, createDirectOrder } from '../../api/index.js'
import RoomSelector from '../../components/RoomSelector.vue'
import FloatingNav from '@/components/FloatingNav.vue'
import Skeleton from '@/components/Skeleton.vue'

export default {
  components: { RoomSelector, FloatingNav, Skeleton },
  data() { return { hls: null, product: null, current: 0, qty: 1, specTemp: '', specLength: '', roomName: '', roomId: '', roomsRaw: [], mpSheet: false, mpRoomSheet: false, mpTemp: '', mpLength: '', mpRoom: '', mpQty: 1, specs: [], specsLoading: false, roomSheet: false, roomsList: [], roomInput: '', selectedSpecIndex: -1, isSpecsCollapsed: true, lockScroll: false, lockScrollTop: 0, roomSelectorVisible: false, roomSelectorMode: 'h5', addresses: [], selectedAddress: null, h5OrderNote: '' } },
  onLoad(query) {
    const id = decodeURIComponent(query?.id || '')
    if (!id) { this.product = { id: '', title: '商品', price: 0, sales: 0, image: '/static/logo.png', images: ['/static/logo.png'] }; return }
    getProductDetail({ available_product_id: id })
      .then((res) => {
        const d = res?.data || {}
        const clean = (u) => typeof u === 'string' ? u.replace(/`/g, '').trim() : ''
        const arr = (x) => Array.isArray(x) ? x.map(clean).filter(Boolean) : []
        const main = arr(d.main_image)
        const videos = arr(d.video_url)
        const detailImgs = arr(d.images)
        const price = Number(d.price ?? 0) || 0
        const base = {
          id: d.available_product_id || id,
          title: d.name || ('商品 ' + id),
          price,
          sales: 0,
          shipping_origin: clean(d.shipping_origin) || '',
          main_media: [...main, ...videos].length ? [...main, ...videos] : ['/static/logo.png'],
          details_images: detailImgs,
          shipping_time_hours: d.shipping_time_hours || 0,
          support_no_reason_return_7d: d.support_no_reason_return_7d || 0,
          is_free_shipping: d.is_free_shipping || 0,
          image: main[0] || '/static/logo.png',
          images: [...main, ...videos].length ? [...main, ...videos] : ['/static/logo.png']
        }
        this.product = base
        this.fetchSpecs(base.id)
      })
      .catch(() => {
        // 接口失败时保底展示
        this.product = { id, title: '商品 ' + id, price: 0, sales: 0, shipping_origin: '', image: '/static/logo.png', images: ['/static/logo.png'] }
        this.fetchSpecs(id)
      })
  },
  computed: {
    selectorType() {
      return this.roomSelectorMode === 'addr' ? 'addr' : 'room'
    },
    images() {
      const imgs = (this.product && this.product.main_media) || []
      return imgs.length ? imgs : [this.product?.image || '/static/logo.png']
    },
    currentImage() {
      const arr = this.images
      return arr[this.current] || arr[0]
    },
    videoSrc() {
      const src = this.currentImage
      if (!this.isVideo(src)) return ''
      return src && !src.includes('.m3u8') ? src : ''
    },
    selectedSpec() {
      return (this.selectedSpecIndex >= 0 && this.specs[this.selectedSpecIndex]) ? this.specs[this.selectedSpecIndex] : null
    },
    addressRooms() {
      return (this.addresses || []).map(a => ({ name: `${a.receiver} ${a.phone} ${[a.province, a.city, a.district, a.detail_address].filter(Boolean).join(' ')}`.trim(), raw: a }))
    },
    selectorRooms() {
      return this.roomSelectorMode === 'addr' ? this.addressRooms : this.roomsRaw
    },
    selectorSelectedName() {
      if (this.roomSelectorMode === 'mp') return this.mpRoom || ''
      if (this.roomSelectorMode === 'h5') return this.roomName || ''
      const a = this.selectedAddress
      return a ? `${a.receiver} ${a.phone} ${[a.province, a.city, a.district, a.detail_address].filter(Boolean).join(' ')}`.trim() : ''
    },
    mpAddressDisplay() {
      const a = this.selectedAddress
      return a ? `${a.receiver} ${a.phone} ${[a.province, a.city, a.district, a.detail_address].filter(Boolean).join(' ')}`.trim() : ''
    },
    lengthUnitText() {
      try {
        const u = String(this.selectedSpec?.length_unit || '').toLowerCase()
        if (u.includes('mm')) return 'mm'
        if (u.includes('cm')) return 'cm'
        if (u.includes('dm')) return 'dm'
        if (u.includes('m')) return 'm'
        return 'm'
      } catch (e) { return 'm' }
    },
    displayTopPrice() {
      const sel = this.selectedSpec
      const basePerM = sel ? (Number(sel.price || 0) || 0) : (Number(this.product?.price || 0) || 0)
      if (sel && sel.has_length === 1) {
        const rawStr = (this.specLength || '').replace(/[^0-9.]/g, '')
        const raw = rawStr ? Number(rawStr) : 0
        if (raw > 0) {
          const meters = this.toMeters(raw, this.lengthUnitText)
          return (basePerM * meters).toFixed(2)
        }
        return `${basePerM.toFixed(2)}/m`
      }
      return basePerM.toFixed(2)
    }
  },
  watch: {
    currentImage: {
      handler(val) { this.initHls(val) },
      immediate: true
    }
  },
  beforeDestroy() {
    if (this.hls) {
      this.hls.destroy()
      this.hls = null
    }
  },
  onShow() {
    this.loadAddresses()
  },
  methods: {
    goBack() {
      if (typeof window !== 'undefined' && window.history && window.history.length > 1) { window.history.back(); return }
      if (uni && uni.switchTab) { uni.switchTab({ url: '/pages/home/index' }); return }
      if (uni && uni.navigateTo) { uni.navigateTo({ url: '/pages/home/index' }); return }
    },
    initHls(src) {
      // #ifdef H5
      if (this.hls) {
        this.hls.destroy()
        this.hls = null
      }
      if (!src || !this.isVideo(src)) return
      if (!src.includes('.m3u8')) return

      this.$nextTick(() => {
        let el = document.querySelector('#pd-video video') || document.querySelector('#pd-video')
        if (el && el.tagName !== 'VIDEO') el = el.querySelector('video')
        if (!el) return
        try { el.setAttribute('crossorigin', 'anonymous') } catch (e) { }

        if (window.Hls && Hls.isSupported()) {
          this.hls = new Hls()
          this.hls.loadSource(src)
          this.hls.attachMedia(el)
          this.hls.on(Hls.Events.ERROR, (event, data) => {
            if (data && data.fatal) {
              try { this.hls.destroy() } catch (e) { }
              this.hls = null
              try { uni.showToast({ title: '视频资源未找到', icon: 'none' }) } catch (e) { }
              const imgs = (this.images || []).filter(u => !this.isVideo(u))
              if (imgs.length) {
                const idx = (this.images || []).findIndex(u => u === imgs[0])
                this.current = idx >= 0 ? idx : 0
              } else {
                this.current = 0
              }
            }
          })
        } else if (el && el.canPlayType && el.canPlayType('application/vnd.apple.mpegurl')) {
          el.src = src
        }
      })
      // #endif
    },
    isVideo(src) {
      if (!src) return false
      return src.includes('.mp4') || src.includes('.m3u8')
    },
    // 获取规格明细（按产品ID），适配返回 data.children
    fetchSpecs(availId) {
      if (!availId) return
      this.specsLoading = true
      const clean = (u) => typeof u === 'string' ? u.replace(/`/g, '').trim() : ''
      getProductSpecs({ available_product_id: availId })
        .then((res) => {
          if (res && res.message && res.message.includes('库存')) uni.showToast({ title: res.message, icon: 'none' })
          const children = (res && res.data && Array.isArray(res.data.children)) ? res.data.children : (Array.isArray(res?.children) ? res.children : [])
          this.specs = (children || []).map((it) => ({
            product_id: it.product_id || '',
            name: it.name || '',
            unit: it.unit || '',
            length_unit: it.length_unit || '',
            price: Number(it.price ?? 0) || 0,
            original_price: Number(it.original_price ?? 0) || 0,
            image_url: clean(it.image_url) || '',
            inventory: it.inventory || 0,
            has_length: it.has_length || 0,
            specification: it.specification || ''
          }))
        })
        .catch(() => { this.specs = [] })
        .finally(() => { this.specsLoading = false; this.selectedSpecIndex = (Array.isArray(this.specs) && this.specs.length > 0) ? 0 : -1 })
    },
    selectSpec(index) {
      if (this.selectedSpecIndex === index) return
      this.selectedSpecIndex = index
    },
    addToCart() {
      const spec = (this.selectedSpecIndex >= 0 && this.specs[this.selectedSpecIndex]) ? this.specs[this.selectedSpecIndex] : null
      const pid = spec ? spec.product_id : (this.product?.id || '')
      addCartItem({ product_id: pid, quantity: 1 })
        .then((res) => {
          if (res && res.success) uni.showToast({ title: '已加入购物车', icon: 'success' })
          else {
            const tip = typeof res?.data === 'string' ? res.data : (res?.data?.reason || '')
            const msg = tip || res?.message || '加入失败'
            uni.showToast({ title: msg, icon: 'none' })
          }
        })
        .catch(() => { uni.showToast({ title: '加入购物车失败', icon: 'none' }) })
    },
    incQty() { this.qty += 1 },
    decQty() { this.qty = Math.max(1, this.qty - 1) },
    addToCartWithQty() {
      const chosen = (this.roomName || '').trim()
      if (!chosen) { uni.showToast({ title: '请先填写房间名', icon: 'none' }); return }
      const lengthNum = (this.specLength || '').replace(/[^0-9.]/g, '')
      const lengthVal = lengthNum ? Number(lengthNum) : undefined
      const needLength = this.selectedSpec && this.selectedSpec.has_length === 1
      if (needLength && (!lengthVal || Number(lengthVal) <= 0)) {
        uni.showToast({ title: '请填写长度', icon: 'none' })
        return
      }
      if (!this.qty || this.qty <= 0) {
        uni.showToast({ title: '请填写数量', icon: 'none' })
        return
      }

      const spec = (this.selectedSpecIndex >= 0 && this.specs[this.selectedSpecIndex]) ? this.specs[this.selectedSpecIndex] : null
      if (spec && spec.specification && lengthVal) {
        const max = parseFloat(spec.specification)
        if (!isNaN(max) && lengthVal > max) {
          uni.showModal({ title: '提示', content: '长度不能超过 ' + spec.specification, showCancel: false })
          return
        }
      }

      const pid = spec ? spec.product_id : (this.product?.id || '')
      addCartItem({ room_id: this.roomId, product_id: pid, length: lengthVal, quantity: this.qty, color: this.specTemp || '', note: '' })
        .then((res) => {
          if (res && res.success) uni.showToast({ title: `已加入房间：${chosen}`, icon: 'success' })
          else {
            const tip = typeof res?.data === 'string' ? res.data : (res?.data?.reason || '')
            const msg = tip || res?.message || '加入失败'
            uni.showToast({ title: msg, icon: 'none' })
          }
        })
        .catch(() => { uni.showToast({ title: '加入购物车失败', icon: 'none' }) })
    },
    buyNow() {
      try {
        const spec = this.selectedSpec
        const pid = spec ? (spec.product_id || this.product?.id || '') : (this.product?.id || '')
        const addrId = this.selectedAddress?.id || ''
        const roomName = (this.roomName || '').trim()
        if (!roomName) {
          uni.showToast({ title: '请填写房间名', icon: 'none' })
          return
        }
        const needLength = spec && spec.has_length === 1
        const rawLen = (this.specLength || '').replace(/[^0-9.]/g, '')
        const lenNum = rawLen ? Number(rawLen) : 0
        if (needLength && (!lenNum || lenNum <= 0)) {
          uni.showToast({ title: '请填写长度', icon: 'none' })
          return
        }
        if (!addrId) {
          uni.showToast({ title: '请先选择收货地址', icon: 'none' })
          return
        }
        const roomId = this.roomId || ''
        const qty = this.qty || 1
        const note = this.h5OrderNote || ''
        const lenMeters = !needLength ? '' : this.toMeters(lenNum, this.lengthUnitText)

        const u = uni.getStorageSync('user') || null
        const token = (u && (u.token || (u.data && u.data.token))) || ''

        uni.showLoading({ title: '下单中' })
        createDirectOrder({ product_id: pid, address_id: addrId, note, length: lenMeters, quantity: qty, room_id: roomId, token })
          .then((data) => {
            uni.hideLoading()
            if (data && data.success) {
              uni.showToast({ title: '下单成功', icon: 'success' })
              const orderId = (data && data.data && (data.data.order_id || data.data.id)) || ''
              if (orderId) { uni.navigateTo({ url: '/pages/order/index?id=' + orderId }) }
            } else {
              const tip = typeof data?.data === 'string' ? data.data : (data?.data?.reason || '')
              const msg = tip || (data && data.message) || '下单失败'
              uni.showToast({ title: msg, icon: 'none' })
            }
          })
          .catch(() => { uni.hideLoading(); uni.showToast({ title: '网络错误', icon: 'none' }) })
      } catch (e) { uni.showToast({ title: '下单失败', icon: 'none' }) }
    },
    // MP-WEIXIN 规格填写
    openSpecSheet() {
      this.mpSheet = true
      const pid = this.product?.id || ''
      this.fetchSpecs(pid)
      this.lockScroll = false
    },
    closeSpecSheet() { this.mpSheet = false; this.lockScroll = false },
    // H5 房间选择弹窗
    openRoomSheet() {
      this.roomSelectorMode = 'h5'
      this.roomSelectorVisible = true
      this.fetchRooms()
    },
    closeRoomSheet() { this.roomSelectorVisible = false },
    openH5AddressSheet() {
      this.roomSelectorMode = 'addr'
      this.roomSelectorVisible = true
      this.loadAddresses()
    },

    fetchRooms() {
      getRooms()
        .then((res) => {
          const raw = Array.isArray(res?.data?.items) ? res.data.items
            : (Array.isArray(res?.items) ? res.items
              : (Array.isArray(res?.data?.children) ? res.data.children
                : (Array.isArray(res?.data?.list) ? res.data.list
                  : (Array.isArray(res?.data) ? res.data : []))))
          this.roomsRaw = (raw || []).map((it) => (typeof it === 'string') ? { id: '', name: it } : { id: (it?.id || it?.room_id || ''), name: (it?.name || it?.room_name || '') })
          this.roomsList = this.roomsRaw.map(it => it.name).filter((x) => !!x)
        })
        .catch(() => { this.roomsList = [] })
    },

    loadAddresses() {
      getAddresses().then(res => {
        const raw = Array.isArray(res?.data?.items) ? res.data.items : (Array.isArray(res?.items) ? res.items : [])
        this.addresses = raw.map(a => ({
          id: a.addresses_id || a.id || '',
          receiver: a.receiver || '',
          phone: a.phone || '',
          province: a.province || '',
          city: a.city || '',
          district: a.district || '',
          detail_address: a.detail_address || '',
          is_default: a.is_default === 1
        }))
        const cached = uni.getStorageSync('selected_address_id') || ''
        let pick = this.addresses.find(x => x.id === cached) || this.addresses.find(x => x.is_default) || this.addresses[0]
        this.selectedAddress = pick || null
        if (this.roomSelectorMode === 'addr' && this.roomSelectorVisible && this.addresses.length === 0) {
          try { uni.showToast({ title: '暂无收货地址，去创建吧', icon: 'none' }) } catch (e) { }
        }
      }).catch(() => { this.addresses = []; this.selectedAddress = null })
    },

    onRoomSelect(room) {
      if (this.roomSelectorMode === 'addr') {
        if (room && room.raw) {
          this.selectedAddress = room.raw
          try { uni.setStorageSync('selected_address_id', this.selectedAddress.id) } catch (e) { }
        }
      } else if (this.roomSelectorMode === 'mp') {
        this.mpRoom = room.name
      } else {
        this.roomName = room.name
        this.roomId = room.id
      }
      this.roomSelectorVisible = false
    },

    onRoomCreate(name) {
      if (!name) return
      createRoom({ name })
        .then((res) => {
          uni.showToast({ title: '房间已创建', icon: 'success' })
          const rid = (res && res.data && (res.data.room_id || res.data.id)) || (res && (res.room_id || res.id)) || ''
          if (this.roomSelectorMode === 'mp') {
            this.mpRoom = name
            if (rid) {
              const exist = (this.roomsRaw || []).find(r => r.id === rid)
              if (!exist) this.roomsRaw = [{ id: rid, name }, ...this.roomsRaw]
            }
          } else {
            this.roomName = name
            this.roomId = rid || this.roomId
            if (rid) {
              const exist = (this.roomsRaw || []).find(r => r.id === rid)
              if (!exist) this.roomsRaw = [{ id: rid, name }, ...this.roomsRaw]
            }
          }
          this.roomSelectorVisible = false
          if (!rid) this.fetchRooms()
        })
        .catch(() => {
          uni.showToast({ title: '创建房间失败', icon: 'none' })
        })
    },

    onCreateAddress(payload) {
      const u = uni.getStorageSync('user')
      const token = (u && (u.token || (u.data && u.data.token))) || ''
      const data = { receiver: payload.receiver, phone: payload.phone, province: payload.province, city: payload.city, district: payload.district, detail_address: payload.detail_address, is_default: payload.is_default }
      addAddress({ ...data, token }).then(res => {
        if (res && res.success) {
          const id = (res && res.data && (res.data.addresses_id || res.data.id)) || ''
          const item = { id, receiver: data.receiver, phone: data.phone, province: data.province, city: data.city, district: data.district, detail_address: data.detail_address, is_default: data.is_default === 1 }
          this.addresses = [item, ...this.addresses]
          this.selectedAddress = item
          try { uni.setStorageSync('selected_address_id', id) } catch (e) { }
          uni.showToast({ title: '已保存', icon: 'success' })
          this.roomSelectorVisible = false
        } else {
          const tip = typeof res?.data === 'string' ? res.data : (res?.data?.reason || '')
          const msg = tip || (res && res.message) || '保存失败'
          uni.showToast({ title: msg, icon: 'none' })
        }
      }).catch(() => {
        uni.showToast({ title: '保存失败', icon: 'none' })
      })
    },

    confirmSpecToCart() {
      const needLength = this.selectedSpec && this.selectedSpec.has_length === 1
      if (!this.mpRoom || (needLength && !this.mpLength) || !this.mpQty) {
        uni.showToast({ title: '请填写房间名、长度、数量', icon: 'none' })
        return
      }
      const chosen = (this.mpRoom || '').trim()
      const found = (this.roomsRaw || []).find(it => it.name === chosen)
      const rid = found ? found.id : ''

      const lengthNum = (this.mpLength || '').replace(/[^0-9.]/g, '')
      const lengthVal = lengthNum ? Number(lengthNum) : undefined
      const spec = (this.selectedSpecIndex >= 0 && this.specs[this.selectedSpecIndex]) ? this.specs[this.selectedSpecIndex] : null

      if (spec && spec.specification && lengthVal) {
        const max = parseFloat(spec.specification)
        if (!isNaN(max) && lengthVal > max) {
          uni.showModal({ title: '提示', content: '长度不能超过 ' + spec.specification, showCancel: false })
          return
        }
      }

      const pid = spec ? spec.product_id : (this.product?.id || '')
      addCartItem({ room_id: rid, product_id: pid, length: lengthVal, quantity: this.mpQty, color: this.mpTemp || '', note: '' })
        .then((res) => {
          if (res && res.success) {
            this.mpSheet = false
            uni.showToast({ title: `已加入房间：${chosen}`, icon: 'success' })
          } else {
            const tip = typeof res?.data === 'string' ? res.data : (res?.data?.reason || '')
            const msg = tip || res?.message || '加入失败'
            uni.showToast({ title: msg, icon: 'none' })
          }
        })
        .catch(() => { uni.showToast({ title: '加入购物车失败', icon: 'none' }) })
    },
    // MP Room Sheet Methods
    openMpRoomSheet() {
      this.roomSelectorMode = 'mp'
      this.roomSelectorVisible = true
      this.fetchRooms()
    },
    openMpAddressSheet() {
      this.roomSelectorMode = 'addr'
      this.roomSelectorVisible = true
      this.loadAddresses()
    },
    closeMpRoomSheet() { this.roomSelectorVisible = false; this.lockScroll = false },
    displaySpecPrice(it) {
      if (!it) return 0
      const base = Number(it.price || 0) || 0
      if (it.has_length !== 1) return base
      const spec = String(it.specification || '').toLowerCase()
      const unit = this.parseLengthUnit(it.length_unit || it.unit, spec)
      const mult = this.unitMultiplier(unit)
      return base * mult
    },
    parseLengthUnit(unit, spec) {
      const u = String(unit || '').toLowerCase()
      const s = String(spec || '').toLowerCase()
      if (u.includes('mm') || /(^|[^a-z])mm([^a-z]|$)/.test(s)) return 'mm'
      if (u.includes('cm') || /(^|[^a-z])cm([^a-z]|$)/.test(s)) return 'cm'
      if (u.includes('dm') || /(^|[^a-z])dm([^a-z]|$)/.test(s)) return 'dm'
      if (u.includes('m') || /(^|[^a-z])m([^a-z]|$)/.test(s)) return 'm'
      return 'm'
    },
    unitMultiplier(unit) {
      if (unit === 'mm') return 1000
      if (unit === 'cm') return 100
      if (unit === 'dm') return 10
      return 1
    },
    toMeters(len, unit) {
      const u = unit || 'm'
      if (u === 'mm') return Number(len) / 1000
      if (u === 'cm') return Number(len) / 100
      if (u === 'dm') return Number(len) / 10
      return Number(len)
    },
  }
}
</script>

<style scoped>
.page {
  background: #f7f7f7;
  min-height: 100vh;
  padding-bottom: 120rpx;
}

/* #ifdef MP-WEIXIN */
.product-page { position: relative; z-index: 1; }
/* 背景图样式已移除 */
/* #endif */

.cover {
  width: 100%;
  height: 500rpx;
  background: #f5f5f5;
}

.info {
  background: #fff;
  padding: 20rpx;
}

.title {
  font-size: 32rpx;
  display: block;
}

.price {
  /* #ifndef H5 */
  color: #333;
  /* #endif */
  /* #ifdef H5 */
  color: #e1251b;
  /* #endif */
  font-size: 34rpx;
  margin-top: 8rpx;
  display: block;
}

.sales {
  color: #999;
  font-size: 26rpx;
  margin-top: 8rpx;
  display: block;
}

.footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  box-shadow: 0 -8rpx 20rpx rgba(0, 0, 0, .06);
  padding: 20rpx;
}

.btn-cart {
  width: 100%;
  /* #ifndef H5 */
  background: #000;
  /* #endif */
  /* #ifdef H5 */
  background: #ff8c3a;
  /* #endif */
  color: #fff;
  border-radius: 999rpx;
  height: 80rpx;
  line-height: 80rpx;
  font-size: 30rpx;
  font-weight: bold;
}

/* 通用：规格列表（H5 与 MP 共用） */
.specs-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.spec-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 12rpx;
  border: 1rpx solid #eee;
  border-radius: 12rpx;
  /* background: #fafafa; */
  transition: all .2s;
}

.spec-item.active {
  border-color: #8d8a8a;
  /* background: #fff5f0; */
}

.spec-thumb {
  width: 120rpx;
  height: 120rpx;
  border-radius: 10rpx;
  background: #f5f5f5;
}

.spec-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.spec-name {
  font-size: 28rpx;
  color: #333;
  line-height: 1.4;
}

.spec-price-row {
  display: flex;
  align-items: baseline;
  gap: 10rpx;
}

.spec-price {
  color: #333;
  font-size: 32rpx;
  font-weight: 700;
}

.spec-oprice {
  color: #999;
  font-size: 24rpx;
  text-decoration: line-through;
}

.spec-unit {
  color: #666;
  font-size: 24rpx;
}

.specs-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16rpx;
  font-size: 24rpx;
  color: #666;
  background: #fafafa;
  border-radius: 0 0 12rpx 12rpx;
}

.toggle-icon {
  margin-left: 8rpx;
  font-size: 20rpx;
}

.rooms-list {
  margin-top: 12rpx;
}

.rooms-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-gap: 12rpx;
}

.rooms-title {
  color: #666;
  font-size: 26rpx;
  margin-bottom: 8rpx;
}

.room-item {
  padding: 12rpx 14rpx;
  border: 1rpx solid #eee;
  border-radius: 10rpx;
  background: #fafafa;
  display: flex;
  align-items: center;
}

.room-name {
  color: #333;
  font-size: 28rpx;
}

/* #ifdef H5 */
/* Hide scrollbars */
.product-page ::-webkit-scrollbar {
  display: none;
  width: 0 !important;
  height: 0 !important;
  -webkit-appearance: none;
  background: transparent;
}

.footer {
  display: none;
}

/* H5 Card Layout */
.h5-product-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('/static/product_detail_background.jpg');
  background-size: cover;
  background-position: center;
  z-index: 0;
  overflow-y: auto;
  padding: 40rpx;
}

.h5-topbar {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  height: 100rpx;
  padding: 20rpx;
}

.back-btn {
  height: 60rpx;
  width: 60rpx;
  line-height: 60rpx;
  padding: 0;
  border: none !important;
  border-radius: 0;
  background: transparent !important;
  box-shadow: none !important;
  outline: none;
  color: #000;
  font-size: 44rpx;
  transition: background .2s, transform .2s, color .2s;
}

.back-btn::after {
  border: none !important;
}

.back-btn:hover {
  transform: translateY(0.3rpx);
  font-weight: 500;
}

.h5-product-card {
  max-width: 1400px;
  margin: 0 auto;
  /* background: rgba(255, 255, 255, 0.95); */
  border-radius: 24rpx;
  /* box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.1); */
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.pd-grid {
  display: grid;
  grid-template-columns: 3fr 2fr;
  grid-gap: 80rpx;
  padding: 60rpx;
  align-items: start;
  margin-top: 100rpx;
}

/* New styles for inline params */
.pd-param-item.inline-params {
  display: contents;
}

.pd-param-item.inline-params .sub-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 10rpx;
}

/* Qty Stepper matching cart */
.qty-box {
  display: flex;
  align-items: center;
  background: #f7f7f7;
  border-radius: 6rpx;
  height: 60rpx;
}

.qty-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333;
  font-size: 36rpx;
  cursor: pointer;
}

.qty-num {
  padding: 0 12rpx;
  font-size: 24rpx;
  color: #333;
}

.pd-left {
  height: 100%;
  background: transparent;
  /* border: 1rpx solid rgba(255,255,255,0.35); */
  border-radius: 16rpx;
  padding: 24rpx;
  box-sizing: border-box;
  /* box-shadow: 0 12rpx 40rpx rgba(0,0,0,0.08); */
  -webkit-backdrop-filter: saturate(120%) blur(8px);
  backdrop-filter: saturate(120%) blur(8px);
}

.pd-right {
  height: 100%;
  background: transparent;
  border: 1rpx solid rgba(255, 255, 255, 0.35);
  border-radius: 16rpx;
  padding: 24rpx;
  box-sizing: border-box;
  box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.08);
  -webkit-backdrop-filter: saturate(120%) blur(8px);
  backdrop-filter: saturate(120%) blur(8px);
}

/* 右侧卡片置顶且自适应高度，仅影响 H5 */
.pd-right {
  height: auto;
  position: sticky;
  margin-top: 80rpx;
  align-self: start;
}

.pd-left {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 50rpx;
  padding-right: 6rpx;
}

.pd-gallery {
  /* background: #fff; */
  border-radius: 12rpx;
  /* padding: 20rpx; */
  position: relative;
  border: 1rpx solid rgba(255, 255, 255, 0.35);
  box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.08);
}

.pd-main {
  width: 100%;
  height: 520rpx;
  border-radius: 8rpx;
  background: #f5f5f5;
}

.pd-thumbs {
  position: static;
  display: flex;
  flex-direction: row;
  gap: 12rpx;
  /* margin-top: 12rpx; */
  overflow-x: auto;
  -ms-overflow-style: none;
  scrollbar-width: none;
  /* background: rgba(255,255,255,0.5); */
  border-radius: 12rpx;
  padding: 20rpx;
  /* box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.06); */
}

.pd-thumbs::-webkit-scrollbar {
  width: 0;
  height: 0;
  display: none;
}

.pd-thumb {
  width: 88rpx;
  height: 88rpx;
  border-radius: 8rpx;
  background: #f5f5f5;
  border: 1rpx solid #eee;
}

.pd-thumb.active {
  outline: 3rpx solid #333;
}

.pd-card {
  background: transparent;
  border-radius: 12rpx;
  padding: 20rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.35);
  box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.08);
  -webkit-backdrop-filter: saturate(120%) blur(8px);
  backdrop-filter: saturate(120%) blur(8px);
}

.pd-section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 12rpx;
}

.pd-param-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx 40rpx;
  /* background: #fafafa; */
  border-radius: 10rpx;
  padding: 20rpx;
}

.pd-param-item {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 20rpx;
  border: none;
  padding: 4rpx 0;
}

.pd-param-item .key {
  color: #999;
  font-size: 24rpx;
  min-width: 80rpx;
}

.pd-param-item .val {
  color: #333;
  font-size: 26rpx;
  margin-top: 0rpx;
  flex: 1;
}

.pd-detail-img {
  width: 100%;
  border-radius: 8rpx;
  background: #f5f5f5;
  margin-top: 12rpx;
}

.pd-info {
  background: transparent;
  padding: 0;
  box-shadow: none;
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.pd-address .addr-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
  padding: 12rpx;
  background: #fafafa;
  border: 1rpx solid #eee;
  border-radius: 10rpx;
}

.pd-address .addr-line {
  display: block;
  color: #333;
  font-size: 24rpx;
}

.pd-address .addr-btn {
  background: #f7f7f7;
  color: #333;
  border: 1rpx solid #e6e6e6;
  border-radius: 8rpx;
}

/* H5 规格列表左图右文排版：一行两列 */
.specs-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-gap: 12rpx;
}

.spec-item {
  flex-direction: row;
  align-items: center;
  box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.05);
}

.spec-thumb {
  width: 120rpx;
  height: 120rpx;
}

.spec-info {
  flex: 1;
}

.spec-price-row {
  justify-content: flex-start;
  gap: 10rpx;
}

.pd-form {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-top: 16rpx;
}

.pd-field {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8rpx;
}

.pd-field.inline {
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 20rpx;
}

/* .pd-param-grid { display: flex; align-items: center; gap: 20rpx; white-space: nowrap; overflow: hidden; } */
.pd-param-item {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  white-space: nowrap;
}

.pd-param-item .key,
.pd-param-item .val {
  white-space: nowrap;
}

.pd-param-item.inline-params {
  display: inline-flex;
  align-items: center;
  gap: 16rpx;
}

.pd-param-item.inline-params .sub-item {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  white-space: nowrap;
}

.pd-param-item.inline-params .sub-item .val {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 40vw;
}

.picker-display {
  flex: 1;
  min-height: 64rpx;
  line-height: 64rpx;
  background: white;
  border: 1rpx solid #e5e5e5;
  border-radius: 10rpx;
  padding: 0 14rpx;
  color: #666;
  max-width: 30%;
}

.pd-input {
  width: 100%;
  height: 64rpx;
  line-height: 64rpx;
  background: white;
  border: 1rpx solid #e5e5e5;
  border-radius: 10rpx;
  padding: 0 14rpx;
  max-width: 30%;
}

/* H5 内联字段输入宽度缩小 */
.pd-field.inline .pd-input,
.pd-field.inline .picker-display {
  flex: 1;
  /* width: 60%; */
}

.unit-tip {
  margin-left: 12rpx;
  font-size: 24rpx;
  color: #666;
}

.pd-title {
  font-size: 40rpx;
  color: #222;
  font-weight: 700;
  display: block;
  padding: 10rpx;
}

.pd-price-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-top: 10rpx;
}

.pd-price {
  color: #333;
  font-size: 50rpx;
  font-weight: 700;
}

.pd-coupon {
  background: #18FAE0;
  color: #000;
  padding: 8rpx 12rpx;
  border-radius: 6rpx;
  font-size: 24rpx;
}

.pd-meta {
  color: #777;
  font-size: 24rpx;
  /* margin-top: 12rpx; */
}

.pd-qty-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20rpx;
  padding: 12rpx;
  background: #fafafa;
  border: 1rpx solid #eee;
  border-radius: 10rpx;
}

.qty-wrapper {
  display: flex;
  align-items: center;
}

.pd-qty-row .label {
  color: #333;
  margin-right: 16rpx;
}

.actions-wrapper {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.actions-wrapper .btn-buy {
  width: auto;
  min-width: 140rpx;
  height: 60rpx;
  line-height: 60rpx;
  font-size: 26rpx;
  background: linear-gradient(135deg, #ff6a00, #ff2d55);
  color: #fff;
  border-radius: 30rpx;
  padding: 0 20rpx;
  margin: 0;
}

.pd-info .actions-wrapper .btn-cart {
  flex: none;
  width: auto;
  min-width: 140rpx;
  height: 60rpx;
  line-height: 60rpx;
  font-size: 26rpx;
  background: #ff8c3a;
  color: #fff;
  border-radius: 30rpx;
  padding: 0 20rpx;
  margin: 0;
}

/* H5 房间选择弹窗 */
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

.h5-sheet {
  width: 820rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 12rpx 28rpx rgba(0, 0, 0, 0.12);
}

.h5-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #333;
  padding-bottom: 12rpx;
  border-bottom: 1rpx solid #f0f0f0;
  margin-bottom: 16rpx;
}

.h5-actions {
  display: flex;
  gap: 12rpx;
  margin-top: 16rpx;
}

.h5-btn {
  flex: 1;
  height: 72rpx;
  border-radius: 999rpx;
  font-size: 28rpx;
}

.h5-btn.ghost {
  background: #f7f7f7;
  color: #333;
  border: 1rpx solid #e6e6e6;
}

.h5-btn.primary {
  background: linear-gradient(135deg, #ff6a00, #ff2d55);
  color: #fff;
  box-shadow: 0 6rpx 16rpx rgba(255, 106, 0, 0.35);
}

/* #endif */

/* #ifdef MP-WEIXIN */
.product-page.no-scroll {
  height: 100vh;
  overflow: hidden;
}

.mp-mask {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgba(0, 0, 0, .55);
  display: flex;
  align-items: flex-end;
  /* 底部弹窗 */
  justify-content: center;
  z-index: 9999;
}

.mp-sheet {
  width: 100vw;
  max-width: none;
  background: #fff;
  border-top-left-radius: 24rpx;
  border-top-right-radius: 24rpx;
  padding: 24rpx;
  box-shadow: 0 -8rpx 24rpx rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  max-height: 80vh;
  overflow: hidden;
  animation: mpSlideUp .22s ease-out;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
}

.mp-scroll-view {
  flex: 1;
  min-height: 0;
  margin-bottom: 16rpx;
  height: 60vh;
  overflow-y: scroll;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.mp-scroll-view::-webkit-scrollbar {
  width: 0;
  height: 0;
  display: none;
}

.mp-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #333;
  padding-bottom: 12rpx;
  border-bottom: 1rpx solid #f0f0f0;
  margin-bottom: 20rpx;
}

.mp-field {
  display: flex;
  align-items: center;
  /* justify-content: space-between; */
  gap: 12rpx;
  margin: 16rpx 0;
}

.mp-input {
  width: 60%;
  height: 64rpx;
  line-height: 64rpx;
  background: #fff;
  border: 1rpx solid #e6e6e6;
  border-radius: 12rpx;
  padding: 0 14rpx;
}

.mp-actions {
  display: flex;
  gap: 12rpx;
  margin-top: auto;
  /* 固定在底部 */
  padding-top: 16rpx;
  border-top: 1rpx solid #f0f0f0;
}

.mp-btn {
  flex: 1;
  height: 72rpx;
  border-radius: 999rpx;
  font-size: 28rpx;
}

.mp-btn.ghost {
  background: #f7f7f7;
  color: #333;
  border: 1rpx solid #e6e6e6;
}

.mp-btn.primary {
  background: #000;
  color: #fff;
}

/* 使数量步进器横向排列 */
.mp-sheet .qty-stepper {
  display: flex;
  flex-direction: row;
  align-items: center;
  background: #f7f7f7;
  border-radius: 6rpx;
  height: 60rpx;
  /* Match Cart */
}

/* 淘宝风格：步进器在弹窗内的样式适配 */
.mp-sheet .qty-stepper .step {
  width: 60rpx;
  /* Match Cart */
  height: 60rpx;
  /* Match Cart */
  border-radius: 0;
  /* Remove individual radius */
  background: transparent;
  border: none;
  color: #333;
  font-size: 32rpx;
  /* Match Cart */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
}

.mp-sheet .qty-stepper .step::after {
  border: none;
}

/* Remove button border */

.mp-sheet .qty-stepper .count {
  width: 80rpx;
  text-align: center;
  font-size: 28rpx;
  color: #333;
}

@keyframes mpSlideUp {
  from {
    transform: translateY(100%);
  }

  to {
    transform: translateY(0);
  }
}

/* 参数与图文详情样式 */
.mp-section {
  background: #fff;
  border-radius: 12rpx;
  padding: 20rpx;
  margin: 20rpx;
}

.mp-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 12rpx;
}

.mp-param-grid {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  border-radius: 10rpx;
  background: #fafafa;
}

.mp-param-item {
  border: none;
  padding: 10rpx;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.mp-param-item .key {
  color: #666;
  font-size: 24rpx;
}

.mp-param-item .val {
  color: #333;
  font-size: 26rpx;
  margin-top: 0rpx;
}

.mp-detail-img {
  width: 100%;
  border-radius: 8rpx;
  background: #f5f5f5;
  margin-top: 12rpx;
}

/* #endif */

/* MP Modifications */
.mp-info-spacing {
  padding: 20rpx 40rpx;
}

.mp-section-spacing {
  padding: 20rpx 20rpx;
}

.mp-price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12rpx;
}

.mp-param-row-inline {
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-top: 12rpx;
  border-top: 1rpx solid #eee;
  padding-top: 12rpx;
}

.mp-param-item.inline {
  flex: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  border: none;
  padding: 0 10rpx;
  gap: 4rpx;
}

.mp-param-item.inline .key {
  margin-bottom: 0;
  white-space: nowrap;
}

.mp-param-item.inline .val {
  margin-top: 0;
  text-align: center;
  white-space: nowrap;
}

/* #ifdef MP-WEIXIN */
.mp-param-grid {
  width: 100%;
  margin: 0 auto;
}

.mp-param-item .key {
  min-width: 120rpx;
  display: inline-block;
}

.pd-section-title {
  margin-bottom: 16rpx;
}

/* #endif */

/* Address Card Style from Cart Page (H5) */
.address-card {
  position: relative;
  /* background: #fff; */
  border-radius: 16rpx;
  padding: 20rpx;
  padding-right: 180rpx;
  /* box-shadow: 0 4rpx 16rpx rgba(0,0,0,.06); */
  /* border: 1rpx solid #eee; */
  margin-bottom: 20rpx;
}

.address-card .addr-title {
  font-weight: 600;
  color: #333;
  font-size: 28rpx;
}

.address-card .addr-body {
  margin-top: 8rpx;
  color: #555;
  font-size: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.address-card .addr-line {
  font-size: 26rpx;
  color: #333;
}

.address-card .addr-empty {
  margin-top: 8rpx;
  color: #999;
  font-size: 24rpx;
}

.address-card .addr-actions {
  position: absolute;
  right: 20rpx;
  top: 50%;
  transform: translateY(-50%);
  margin-top: 0;
  display: flex;
  gap: 12rpx;
}

.address-card .addr-btn {
  background: #fff;
  border: 1rpx solid #ddd;
  color: #333;
  border-radius: 999rpx;
  font-size: 24rpx;
  padding: 0 20rpx;
  height: 50rpx;
  line-height: 48rpx;
}

.address-card .addr-btn {
  background: #fff;
  border: 1rpx solid #ddd;
  color: #333;
  border-radius: 999rpx;
  font-size: 30rpx;
  padding: 0 40rpx;
  height: 72rpx;
  line-height: 70rpx;
}

.address-card {
  padding-right: 220rpx;
}

/* MP Address Bar Style from Cart Page */
.mp-address-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx;
  /* background: #fff; */
  border: 1rpx solid #e6e6e6;
  border-radius: 12rpx;
  margin: 16rpx 0;
}

.bar-left {
  display: flex;
  align-items: center;
  gap: 12rpx;
  flex: 1;
  overflow: hidden;
}

.addr-icon {
  font-size: 28rpx;
  color: #000;
  flex-shrink: 0;
}

.bar-info {
  display: flex;
  flex-direction: column;
  font-size: 24rpx;
  color: #555;
  flex: 1;
  overflow: hidden;
}

.bar-line {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bar-btn {
  background: #fff;
  border: 1rpx solid #ddd;
  color: #333;
  border-radius: 999rpx;
  margin: 0;
  font-size: 24rpx;
  padding: 0 24rpx;
  height: 50rpx;
  line-height: 48rpx;
  flex-shrink: 0;
}

/* H5 Actions Row (3 buttons layout) */
.pd-actions-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-top: 24rpx;
}

.qty-box-large {
  width: 200rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 80rpx;
  background: #f7f7f7;
  border-radius: 40rpx;
  padding: 0 4rpx;
}

.qty-box-large .qty-btn {
  width: 64rpx;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  color: #333;
}

.qty-box-large .qty-num {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.btn-action {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
  font-weight: 600;
}

.btn-action.btn-cart {
  background: #d9d9d9;
  color: #333;
}

.btn-action.btn-buy {
  background: #000;
  color: #fff;
}
</style>
