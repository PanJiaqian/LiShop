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
              <view id="og-product-gallery" class="pd-gallery">
                <swiper class="pd-main" :current="current" :autoplay="false" circular interval="3000" @change="onSwiperChange">
                  <swiper-item v-for="(src, i) in images" :key="i">
                    <video
                      v-if="isVideo(src)"
                      :id="i === current ? 'pd-video' : ('pd-video-' + i)"
                      class="pd-main"
                      :src="i === current ? videoSrc : src"
                      :poster="product.image || '/static/logo.png'"
                      :controls="true"
                      :autoplay="false"
                      playsinline
                      webkit-playsinline
                      crossorigin="anonymous"
                      object-fit="contain"
                      :muted="true"
                      @play="pauseCarousel"
                      @ended="onVideoEnded"
                    />
                    <image v-else class="pd-main" :src="src" mode="aspectFit" @click="previewCurrentImage" />
                  </swiper-item>
                </swiper>
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
                <text class="pd-section-title" selectable="true">参数信息</text>
                <view class="pd-param-grid">
                  <view class="pd-param-item"><text class="key" selectable="true">型号</text><text class="val" selectable="true">{{ product.id || '默认款'
                  }}</text></view>
                  <view class="pd-param-item"><text class="key" selectable="true">名称</text><text class="val" selectable="true">{{ product.title }}</text>
                  </view>
                  <view class="pd-param-item"><text class="key" selectable="true">规格</text><text class="val" selectable="true">默认规格</text></view>
                  <view class="pd-param-item"><text class="key" selectable="true">产地</text><text class="val" selectable="true">{{ product.shipping_origin ?
                    product.shipping_origin.replace(/省|市/g, '') : '—' }}</text></view>
                  <view class="pd-param-item"><text class="key" selectable="true">单位</text><text class="val" selectable="true">件</text></view>
                  <!-- <view class="pd-param-item"><text class="key">价格</text><text class="val">¥{{ product.price.toFixed(2)
                  }}</text></view> -->
                  <view class="pd-param-item"><text class="key" selectable="true">发货</text><text class="val" selectable="true">{{
                    product.shipping_time_hours ? (product.shipping_time_hours + '小时') : '待定' }}</text></view>
                  <!-- <view class="pd-param-item"><text class="key">售后</text><text class="val">{{
                    product.support_no_reason_return_7d ? '七天无理由' : '无' }}</text></view> -->
                </view>
              </view>

              <view class="pd-card pd-detail">
                <text class="pd-section-title" selectable="true">图文详情</text>
                <image v-for="(src, i) in product.details_images" :key="'d' + i" class="pd-detail-img" :src="src"
                  mode="widthFix" @click="previewDetailImage(src)" />
              </view>
            </view>

            <!-- 右侧：保持现有信息与按钮，不做其它改动 -->
            <view class="pd-right">
              <view class="pd-info">
                <view class="pd-title-row">
                  <text class="pd-title" selectable="true">{{ product.title }}</text>
                  <text class="fav-star" :class="{ active: isFavorite }" @click="favProduct">{{ isFavorite ? '★' : '☆' }}</text>
                </view>
                <view class="pd-meta">
                  <text selectable="true">{{ product.is_free_shipping ? '包邮' : '不包邮' }} ｜ {{ product.shipping_time_hours ?
                    (product.shipping_time_hours + '小时内发货') : '发货时间待定' }} ｜ {{ product.support_no_reason_return_7d ?
                      '七天无理由' : '不支持七天无理由' }}</text>
                </view>
                <view class="pd-price-row">
                  <text class="pd-price" selectable="true">{{ displayTopPriceWithSymbol }}</text>
                  <text class="pd-coupon" selectable="true">券后更低</text>
                </view>


                <view>
                  <text class="pd-section-title" selectable="true">规格明细</text>
                  <view v-if="specsLoading"><text class="pd-meta">加载中...</text></view>
                  <view v-else-if="specs && specs.length">
                    <view class="specs-list">
                      <view class="spec-item" v-for="(it, i) in (isSpecsCollapsed ? specs.slice(0, 4) : specs)" :key="'h5sp' + i"
                        :class="{ active: selectedSpecIndex === i, disabled: isSpecDisabled(it) }" @click="onClickSpec(it, i)">
                        <!-- <image class="spec-thumb" :src="it.image_url || '/static/logo.png'" mode="aspectFill" /> -->
                        <view class="spec-info">
                          <text class="spec-name" selectable="true">{{ it.name }}</text>
                          <view class="spec-price-row">
                            <text class="spec-price" selectable="true">{{ formatPriceWithSymbol(it.price) }}</text>
                            <text v-if="Number(it.original_price) > 0" class="spec-oprice">¥{{
                              Number(it.original_price).toFixed(2) }}</text>
                          </view>
                          <text class="spec-unit" selectable="true">单位：{{ it.unit || '—' }}</text>
                          <view v-if="Number(it.package_price) > 0" class="spec-unit spec-package-fee">
                            <text selectable="true">包装费：¥{{ it.single_package_fee }}</text>
                            <view class="fee-icon-wrap">
                              <text class="fee-icon">!</text>
                              <view class="fee-tooltip">
                                包装容量：{{ it.package_capacity }} | 单位价格：¥{{ it.package_price_formatted }}
                              </view>
                            </view>
                          </view>
                        </view>
                        <view v-if="String(it.product_type || '').toLowerCase() === 'stagnant' && Number(it.inventory) === 0" class="spec-mask">
                          <image class="spec-mask-ico" src="/static/no.png" mode="aspectFit" />
                        </view>
                      </view>
                    </view>
                    <view v-if="specs.length > 4" class="specs-toggle h5-toggle" @click="isSpecsCollapsed = !isSpecsCollapsed">
                      <text>{{ isSpecsCollapsed ? '展开更多' : '收起' }}</text>
                      <text class="toggle-icon">{{ isSpecsCollapsed ? '▼' : '▲' }}</text>
                    </view>
                  </view>
                  <view v-else><text class="pd-meta">暂无规格数据</text></view>
                </view>

                <view class="pd-address">
                  <text class="pd-section-title" selectable="true">收货地址</text>
                  <view class="address-card">
                    <view v-if="selectedAddress" class="addr-body">
                      <text class="addr-line" selectable="true">{{ selectedAddress.receiver }} {{ selectedAddress.phone }}</text>
                      <text class="addr-line" selectable="true">{{ selectedAddress.province }} {{ selectedAddress.city }} {{
                        selectedAddress.district }} {{ selectedAddress.detail_address }}</text>
                    </view>
                    <view v-else class="addr-empty" selectable="true">未选择收货地址</view>
                    <view class="addr-actions">
                      <button class="addr-btn" @click="openH5AddressSheet">选择地址</button>
                    </view>
                  </view>
                </view>

                <view class="pd-form">
                  <view class="pd-field inline" @click="openCouponSheet">
                    <text class="label" selectable="true">优惠券</text>
                    <view class="picker-display coupon-display" :class="{'has-coupon': selectedCoupon}">
                      <text class="coupon-text">{{ selectedCoupon ? selectedCoupon.name : '不使用优惠券' }}</text>
                      <text class="coupon-arrow">›</text>
                    </view>
                  </view>
                  <view class="pd-field inline">
                    <text class="label" selectable="true">房间</text>
                    <view id="og-room-select" class="picker-display room-display" @click="openRoomSheet">
                      <text class="room-text">{{ roomName || '请选择房间' }}</text>
                      <text class="room-arrow">›</text>
                    </view>
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
                  <view class="pd-field inline">
                    <text class="label">备注</text>
                    <input class="pd-input" v-model="h5OrderNote" placeholder="填写备注" />
                  </view>
                </view>

                <view class="pd-actions-row">
                  <!-- <text class="label" selectable="true">数量</text> -->
                  <view class="qty-box-large">
                    <view class="qty-btn" @click="decQty">-</view>
                    <input class="qty-input" v-model="qty" type="number" placeholder="数量" @blur="normalizeQty" />
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
      <swiper class="cover" indicator-dots :current="current" :autoplay="false" circular interval="3000" @change="onSwiperChange">
        <swiper-item v-for="(item, index) in images" :key="index">
          <video
            v-if="isVideo(item)"
            :id="index === current ? 'mp-video' : ('mp-video-' + index)"
            :src="item"
            controls
            style="width: 100%; height: 100%;"
            object-fit="contain"
            :autoplay="false"
            @play="pauseCarousel"
            @ended="onVideoEnded"
          ></video>
          <image v-else :src="item" mode="aspectFill" style="width: 100%; height: 100%;" @click="previewMpImage(item)" />
        </swiper-item>
      </swiper>
      <view class="info mp-info-spacing">
        <view class="mp-title-row">
          <text class="title" selectable="true">{{ product.title }}</text>
          <text class="fav-star" :class="{ active: isFavorite }" @click="favProduct">{{ isFavorite ? '★' : '☆' }}</text>
        </view>
        <view class="mp-price-row">
          <text class="price" selectable="true">{{ displayTopPriceWithSymbol }}</text>
          <text class="sales" selectable="true">销量 {{ product.sales }}</text>
        </view>
      </view>
      <!-- MP 端参数信息与图文详情 -->
      <view class="mp-section mp-section-spacing">
        <text class="mp-title" selectable="true">参数信息</text>
        <view class="mp-param-grid">
          <view class="mp-param-item"><text class="key" selectable="true">型号</text><text class="val" selectable="true">{{ product.id || '默认款' }}</text>
          </view>
          <view class="mp-param-item"><text class="key" selectable="true">名称</text><text class="val" selectable="true">{{ product.title }}</text></view>
          <view class="mp-param-item"><text class="key" selectable="true">规格</text><text class="val" selectable="true">默认规格</text></view>
          <view class="mp-param-row-inline">
            <view class="mp-param-item inline"><text class="key" selectable="true">产地</text><text class="val" selectable="true">{{ product.shipping_origin ?
              product.shipping_origin.replace(/省|市/g, '') :
              '—' }}</text></view>
            <view class="mp-param-item inline"><text class="key" selectable="true">单位</text><text class="val" selectable="true">件</text></view>
            <view class="mp-param-item inline"><text class="key" selectable="true">单位价格</text><text class="val" selectable="true">¥{{
              product.price.toFixed(2)
            }}</text></view>
          </view>
        </view>
      </view>
      <view class="mp-section">
        <text class="mp-title" selectable="true">图文详情</text>
        <image v-for="(src, i) in product.details_images" :key="'md' + i" class="mp-detail-img" :src="src"
          mode="widthFix" @click="previewDetailImage(src)" />
      </view>
      <view class="footer">
        <!-- #ifdef MP-WEIXIN -->
        <button id="og-product-add" class="btn-cart" @click="openSpecSheet">加入购物车</button>
        <!-- #endif -->
        <!-- #ifndef MP-WEIXIN -->
        <button id="og-product-add" class="btn-cart" @click="addToCart">加入购物车</button>
        <!-- #endif -->
      </view>

      <!-- #ifdef MP-WEIXIN -->
      <view v-if="mpSheet" class="mp-mask" @click="closeSpecSheet" catchtouchmove="true"></view>
      <view v-if="mpSheet" class="mp-sheet">
        <view class="mp-title" selectable="true">填写规格</view>
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
          <view class="mp-title" selectable="true">规格明细</view>
          <view v-if="specsLoading" class="mp-param-grid">
            <view class="mp-param-item"><text class="key">加载中...</text><text class="val"></text></view>
          </view>
          <view v-else-if="specs && specs.length" class="specs-list">
            <view class="spec-item" v-for="(it, i) in (isSpecsCollapsed ? specs.slice(0, 4) : specs)"
              :key="'mpsp' + i" :class="{ active: selectedSpecIndex === i, disabled: isSpecDisabled(it) }" @click="onClickSpec(it, i)">
              <!-- <image class="spec-thumb" :src="it.image_url || '/static/logo.png'" mode="aspectFill" /> -->
              <view class="spec-info">
                <text class="spec-name" selectable="true">{{ it.name }}</text>
                <view class="spec-price-row">
                  <text class="spec-price" selectable="true">{{ formatPriceWithSymbol(it.price) }}</text>
                  <text v-if="Number(it.original_price) > 0" class="spec-oprice">¥{{
                    Number(it.original_price).toFixed(2) }}</text>
                </view>
                <text class="spec-unit" selectable="true">单位：{{ it.unit || '—' }}</text>
                <view v-if="Number(it.package_price) > 0" class="spec-unit spec-package-fee">
                  <text selectable="true">单个包装费：¥{{ it.single_package_fee }}</text>
                  <view class="fee-icon-wrap">
                    <text class="fee-icon">!</text>
                    <view class="fee-tooltip">
                      包装容量：{{ it.package_capacity }} | 包装总价：¥{{ it.package_price_formatted }}
                    </view>
                  </view>
                </view>
              </view>
              <view v-if="String(it.product_type || '').toLowerCase() === 'stagnant' && Number(it.inventory) === 0" class="spec-mask">
                <image class="spec-mask-ico" src="/static/no.png" mode="aspectFit" />
              </view>
            </view>
            <!-- 展开/收起按钮 -->
            <view v-if="specs.length > 4" class="specs-toggle" @click="isSpecsCollapsed = !isSpecsCollapsed">
              <text>{{ isSpecsCollapsed ? '展开更多' : '收起' }}</text>
              <text class="toggle-icon">{{ isSpecsCollapsed ? '▼' : '▲' }}</text>
            </view>
          </view>
          <view v-else class="mp-param-grid">
            <view class="mp-param-item"><text class="key">暂无规格数据</text><text class="val">—</text></view>
          </view>

          <view class="mp-field" @click="openCouponSheet">
            <text class="label">优惠券</text>
            <view class="mp-input coupon-display" :class="{'has-coupon': selectedCoupon}">
              <text class="coupon-text">{{ selectedCoupon ? selectedCoupon.name : '不使用优惠券' }}</text>
              <text class="coupon-arrow">›</text>
            </view>
          </view>
          <view class="mp-field"><text class="label">房间</text>
            <view id="og-mp-room-select" class="mp-input room-display" @click="openMpRoomSheet">
              <text class="room-text">{{ mpRoom || '请选择房间' }}</text>
              <text class="room-arrow">›</text>
            </view>
          </view>
          <!-- <view class="mp-field"><text class="label">色温</text><input class="mp-input" v-model="mpTemp"
            placeholder="如 3000K" /></view> -->
          <view class="mp-field" v-if="selectedSpec && selectedSpec.has_length === 1">
            <text class="label">长度</text>
            <input class="mp-input" v-model="mpLength" placeholder="填写数字" />
            <text v-if="selectedSpec.length_unit" class="unit-tip">{{ selectedSpec.length_unit }}</text>
          </view>
          <view class="mp-field">
            <text class="label">备注</text>
            <input class="mp-input" v-model="mpOrderNote" placeholder="填写备注" />
          </view>
          <view class="mp-field">
            <view class="qty-stepper">
              <button class="step" @click="mpQty = Math.max(1, Number(mpQty) - 1)">-</button>
              <input class="count-input" v-model="mpQty" type="number" placeholder="填写数量" @blur="normalizeMpQty" />
              <button class="step" @click="mpQty = Math.max(1, Number(mpQty) + 1)">+</button>
            </view>
          </view>
        </scroll-view>
        <view class="mp-actions">
          <button class="mp-btn ghost" @click="closeSpecSheet">取消</button>
          <button class="mp-btn primary" @click="confirmSpecToCart">确定加入</button>
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
  <OnboardingGuide
    v-if="showOnboarding"
    :steps="onboardingSteps"
    :targets="onboardingRects"
    :initialIndex="onboardingIndex"
    @advance="handleOnboardingNext"
    @back="handleOnboardingPrev"
    @close="closeOnboarding"
  />
  <LoginPrompt :visible="showLoginModal" @close="closeLoginModal" @confirm="goLogin" />
</template>

<script>
/**
 * 商品详情页面模块
 * - 负责拉取商品详情/规格、收藏状态，并提供加入购物车/下单等交互
 * - 同时兼容 H5 与小程序端的规格/房间/地址选择流程（通过条件编译与弹窗组件实现）
 */
import { getProductDetail, getProductSpecs, getRooms, createRoom, addCartItem, getCartItems, createOrderByIds, getAddresses, addAddress, createDirectOrder, addFavorite, deleteFavorite, getAvailableCoupons } from '../../api/index.js'
import RoomSelector from '../../components/RoomSelector.vue'
import FloatingNav from '@/components/FloatingNav.vue'
import Skeleton from '@/components/Skeleton.vue'
import OnboardingGuide from '@/components/OnboardingGuide.vue'
import LoginPrompt from '@/components/LoginPrompt.vue'

export default {
  components: { RoomSelector, FloatingNav, Skeleton, OnboardingGuide, LoginPrompt },
  data() { return { hls: null, product: null, shareProductId: '', current: 0, qty: 1, specTemp: '', specLength: '', roomName: '', roomId: '', roomsRaw: [], mpSheet: false, mpRoomSheet: false, mpTemp: '', mpLength: '', mpRoom: '', mpQty: 1, mpOrderNote: '', specs: [], specsLoading: false, roomSheet: false, roomsList: [], roomInput: '', selectedSpecIndex: -1, isSpecsCollapsed: true, lockScroll: false, lockScrollTop: 0, roomSelectorVisible: false, roomSelectorMode: 'h5', addresses: [], selectedAddress: null, h5OrderNote: '', isFavorite: false, swiperTimer: null, carouselInterval: 3000, lockCarousel: false, showOnboarding: false, onboardingRects: [], onboardingSteps: [], onboardingIndex: 0, showLoginModal: false, coupons: [], selectedCoupon: null, couponSheetVisible: false, packageFeeByProductId: {} } },
  onLoad(query) {
    const id = decodeURIComponent(query?.id || '')
    this.shareProductId = id
    if (!id) { this.product = { id: '', title: '商品', price: 0, sales: 0, image: '/static/logo.png', images: ['/static/logo.png'] }; return }
    this.fetchCoupons(id)
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
          type: d.type || d.product_type || '',
          comment: d.comment || '',
          shipping_origin: clean(d.shipping_origin) || '',
          main_media: [...main, ...videos].length ? [...main, ...videos] : ['/static/logo.png'],
          details_images: detailImgs,
          shipping_time_hours: d.shipping_time_hours || 0,
          support_no_reason_return_7d: d.support_no_reason_return_7d || 0,
          is_free_shipping: d.is_free_shipping || 0,
          image: main[0] || '/static/logo.png',
          images: [...main, ...videos].length ? [...main, ...videos] : ['/static/logo.png']
        }
        const childrenUnits = Array.isArray(d.children_units) ? d.children_units : []
        const packageFeeByProductId = {}
        childrenUnits.forEach((item) => {
          const pid = String(item?.product_id || '').trim()
          const fee = item?.package_fee_info || null
          if (!pid || !fee) return
          packageFeeByProductId[pid] = fee
        })
        this.packageFeeByProductId = packageFeeByProductId
        this.product = base
        this.isFavorite = (String(d.is_favorite) === '1') || (d.is_favorite === 1) || (d.is_favorite === true)
        this.fetchSpecs(base.id)
        this.resetCarouselTimer()
        this.$nextTick(() => {
          const src = this.currentImage
          if (this.isVideo(src)) {
            this.lockCarousel = true
            this.stopCarousel()
            try {
              const ctx1 = uni.createVideoContext('pd-video', this)
              const ctx2 = uni.createVideoContext('mp-video', this)
              if (ctx1 && typeof ctx1.play === 'function') ctx1.play()
              else if (ctx2 && typeof ctx2.play === 'function') ctx2.play()
            } catch (e) {}
          }
        })
      })
      .catch(() => {
        // 接口失败时保底展示
        this.packageFeeByProductId = {}
        this.product = { id, title: '商品 ' + id, price: 0, sales: 0, shipping_origin: '', image: '/static/logo.png', images: ['/static/logo.png'] }
        this.fetchSpecs(id)
        this.resetCarouselTimer()
        this.$nextTick(() => {
          const src = this.currentImage
          if (this.isVideo(src)) {
            this.lockCarousel = true
            this.stopCarousel()
            try {
              const ctx1 = uni.createVideoContext('pd-video', this)
              const ctx2 = uni.createVideoContext('mp-video', this)
              if (ctx1 && typeof ctx1.play === 'function') ctx1.play()
              else if (ctx2 && typeof ctx2.play === 'function') ctx2.play()
            } catch (e) {}
          }
        })
      })
  },
  onShow() {
    try {
      const uniAny = uni
      if (uniAny && typeof uniAny.showShareMenu === 'function') {
        uniAny.showShareMenu({ withShareTicket: true, menus: ['shareAppMessage', 'shareTimeline'] })
        return
      }
    } catch (e) {}
    try {
      const wxAny = typeof wx !== 'undefined' ? wx : null
      if (wxAny && typeof wxAny.showShareMenu === 'function') {
        wxAny.showShareMenu({ withShareTicket: true, menus: ['shareAppMessage', 'shareTimeline'] })
      }
    } catch (e) {}
  },
  created() {
    try {
      const h = () => { this.showLoginModal = true }
      this._globalLoginHandler = h
      uni.$on('global-login-prompt', h)
    } catch (e) {}
  },
  onUnload() {
    try {
      if (this._globalLoginHandler) uni.$off('global-login-prompt', this._globalLoginHandler)
      this._globalLoginHandler = null
    } catch (e) {}
  },
  onShareAppMessage() {
    let imageUrl = '/static/logo.png'
    try { imageUrl = uni.getStorageSync('share_image_url') || imageUrl } catch (e) {}
    return { title: '诺米灯光定制', path: '/pages/home/index', imageUrl }
  },
  onShareTimeline() {
    let imageUrl = '/static/logo.png'
    try { imageUrl = uni.getStorageSync('share_image_url') || imageUrl } catch (e) {}
    return { title: '诺米灯光定制', query: '', imageUrl }
  },
  computed: {
    selectorType() {
      return this.roomSelectorMode === 'addr' ? 'addr' : 'room'
    },
    isStagnantProduct() {
      const t = String(this.product?.type || this.product?.product_type || this.product?.category || '').toLowerCase()
      if (!t) {
        const c = String((this.product && this.product.comment) || '').toLowerCase()
        return c.includes('stagnant') || c.includes('呆滞')
      }
      return t.includes('stagnant') || t.includes('呆滞')
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
      if (src.includes('.m3u8')) return ''
      const hasQuery = src.includes('?')
      const t = Date.now()
      return hasQuery ? (src + '&t=' + t) : (src + '?t=' + t)
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
      const sel = this.selectedSpec || (this.specs && this.specs[0]) || null
      const formula = String(sel?.formula || '').trim()
      let isH5 = false
      try { isH5 = typeof window !== 'undefined' } catch (e) { isH5 = false }
      const lengthRaw = isH5 ? this.specLength : this.mpLength
      const lengthStr = String(lengthRaw || '').replace(/[^0-9.]/g, '')
      const lengthVal = lengthStr ? Number(lengthStr) : 1
      const qtyRaw = isH5 ? this.qty : this.mpQty
      const qty = Math.max(1, Number(qtyRaw || 1))
      const usesLength = /\blength\b/.test(formula) || Number(sel?.has_length || 0) === 1
      if (usesLength && lengthStr && isNaN(lengthVal)) return '-'
      const fallbackNum = Number(sel?.price ?? sel?.unit_price ?? this.product?.price ?? 0)
      if (!formula) {
        if (isNaN(fallbackNum)) return '-'
        const defaultText = fallbackNum.toFixed(2)
        if (usesLength && !lengthStr) return `${defaultText}/m`
        return defaultText
      }
      const ctx = {
        unit_price: sel?.unit_price ?? sel?.price ?? this.product?.price ?? 0,
        additional_price: sel?.additional_price ?? 0,
        discount: sel?.discount ?? 1,
        price: sel?.price ?? this.product?.price ?? 0,
        original_price: sel?.original_price ?? 0,
        length: lengthVal,
        quantity: qty,
        package_price: sel?.package_price ?? 0,
        package_capacity: sel?.package_capacity ?? 0
      }
      const val = this.evaluateFormula(formula, ctx)
      if (isH5) {
        try {
          console.log('[价格计算]', {
            formula,
            lengthRaw,
            lengthVal,
            qty,
            context: ctx,
            result: val
          })
        } catch (e) {}
      }
      if (val === null) {
        if (isNaN(fallbackNum)) return '-'
        const defaultText = fallbackNum.toFixed(2)
        if (usesLength && !lengthStr) return `${defaultText}/m`
        return defaultText
      }
      const numText = Number(val).toFixed(2)
      if (usesLength && !lengthStr) return `${numText}/m`
      return numText
    },
    displayTopPriceWithSymbol() {
      const s = this.displayTopPrice
      if (s === '-') return '-'
      return '¥' + s
    }
  },
  watch: {
    currentImage: {
      handler(val) { this.initHls(val) },
      immediate: true
    }
    ,
    current(val) {
      const src = (this.images || [])[val]
      if (this.isVideo(src)) {
        this.$nextTick(() => {
          try {
            const ctx1 = uni.createVideoContext('pd-video', this)
            const ctx2 = uni.createVideoContext('mp-video', this)
            if (ctx1 && typeof ctx1.play === 'function') ctx1.play()
            else if (ctx2 && typeof ctx2.play === 'function') ctx2.play()
          } catch (e) { }
        })
        this.lockCarousel = true
      } else {
        this.lockCarousel = false
        this.resetCarouselTimer()
      }
    }
  },
  beforeDestroy() {
    if (this.hls) {
      this.hls.destroy()
      this.hls = null
    }
    this.stopCarousel()
  },
  onShow() {
    this.loadAddresses()
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
          let isH5 = false
          try { isH5 = typeof window !== 'undefined' } catch (e) { isH5 = false }
          if (sel === '#og-room-modal' || sel === '#og-room-modal-list') {
            if (isH5) this.openRoomSheet()
            else this.openMpRoomSheet()
            setTimeout(() => { this.tryShowOnboarding('#og-room-modal-list', 10) }, 220)
          } else {
            this.tryShowOnboarding(sel, 8)
          }
        })
      }
    } catch (e) {}
  },
  methods: {
    fetchCoupons(productId) {
      let token = ''
      try {
        const u = uni.getStorageSync('user') || null
        token = (u && (u.token || (u.data && u.data.token))) || ''
      } catch (e) {}
      if (!token || !productId) return
      getAvailableCoupons({ product_id: productId, token }).then(res => {
        // 后端返回了专门筛选好的 items
        if (res.success && res.data && res.data.items) {
          this.coupons = res.data.items
        }
      }).catch(() => {})
    },
    openCouponSheet() {
      if (!this.coupons || this.coupons.length === 0) {
        uni.showToast({ title: '暂无可用优惠券', icon: 'none' })
        return
      }
      const list = ['不使用优惠券', ...this.coupons.map(c => c.name)]
      uni.showActionSheet({
        itemList: list,
        success: (res) => {
          if (res.tapIndex === 0) {
            this.selectedCoupon = null
          } else {
            this.selectedCoupon = this.coupons[res.tapIndex - 1]
          }
        }
      })
    },
    tryShowOnboarding(sel, tries) {
      const max = Math.max(1, Number(tries || 6))
      const attempt = (left) => {
        let isH5 = false
        try { isH5 = typeof window !== 'undefined' } catch (e) { isH5 = false }
        if (isH5) {
          const el = typeof document !== 'undefined' ? document.querySelector(sel) : null
          if (el) {
            this.refreshOnboardingRect(sel)
            return
          }
        } else {
          const q = uni.createSelectorQuery().in(this)
          q.select(sel).boundingClientRect()
          q.exec(res => {
            const r = (res || [])[0]
            if (r) {
              this.refreshOnboardingRect(sel)
              return
            }
          })
        }
        if (!this.showOnboarding) this.showOnboarding = true
        if (left > 0) { setTimeout(() => attempt(left - 1), 160) }
      }
      attempt(max)
    },
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
          const hasQuery = src.includes('?')
          const bust = hasQuery ? (src + '&t=' + Date.now()) : (src + '?t=' + Date.now())
          this.hls.loadSource(bust)
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
          const hasQuery = src.includes('?')
          el.src = hasQuery ? (src + '&t=' + Date.now()) : (src + '?t=' + Date.now())
        }
      })
      // #endif
    },
    isVideo(src) {
      if (!src) return false
      return src.includes('.mp4') || src.includes('.m3u8')
    },
    onSwiperChange(e) {
      try {
        const idx = (e && e.detail && typeof e.detail.current === 'number') ? e.detail.current : 0
        this.current = idx
        const src = (this.images || [])[idx]
        if (this.isVideo(src)) {
          this.lockCarousel = true
          this.stopCarousel()
          this.$nextTick(() => {
            try {
              const ctx1 = uni.createVideoContext('pd-video', this)
              const ctx2 = uni.createVideoContext('mp-video', this)
              if (ctx1 && typeof ctx1.play === 'function') ctx1.play()
              else if (ctx2 && typeof ctx2.play === 'function') ctx2.play()
            } catch (e) { }
          })
        } else {
          this.lockCarousel = false
          this.resetCarouselTimer()
        }
      } catch (e) {}
    },
    pauseCarousel() {
      this.lockCarousel = true
      this.stopCarousel()
    },
    onVideoEnded() {
      this.lockCarousel = false
      const n = (this.images || []).length || 1
      setTimeout(() => {
        this.current = (this.current + 1) % n
        this.resetCarouselTimer()
      }, 1000)
    },
    startCarousel() {
      if (this.swiperTimer) return
      const interval = Number(this.carouselInterval) || 3000
      this.swiperTimer = setInterval(() => {
        try {
          if (this.lockCarousel) return
          const n = (this.images || []).length || 1
          this.current = (this.current + 1) % n
        } catch (e) {}
      }, interval)
    },
    stopCarousel() {
      try {
        if (this.swiperTimer) { clearInterval(this.swiperTimer); this.swiperTimer = null }
      } catch (e) {}
    },
    resetCarouselTimer() {
      this.stopCarousel()
      this.startCarousel()
    },
    refreshOnboardingRect(sel) {
      let isH5 = false
      try { isH5 = typeof window !== 'undefined' } catch (e) { isH5 = false }
      const total = this.onboardingSteps.length || 0
      const arr = new Array(total).fill(null)
      if (isH5) {
        const el = typeof document !== 'undefined' ? document.querySelector(sel) : null
        if (el) {
          const r = el.getBoundingClientRect()
          arr[this.onboardingIndex] = { left: r.left, top: r.top, width: r.width, height: r.height }
          this.onboardingRects = arr
          this.showOnboarding = true
        }
      } else {
        const q = uni.createSelectorQuery().in(this)
        q.select(sel).boundingClientRect()
        q.exec(res => {
          const r = (res || [])[0]
          if (r) {
            arr[this.onboardingIndex] = { left: r.left, top: r.top, width: r.width, height: r.height }
            this.onboardingRects = arr
            this.showOnboarding = true
          }
        })
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
      } catch (e) {}
      try {
        uni.setStorageSync('onboarding_continue', true)
        const isH5 = typeof window !== 'undefined'
        if (isH5) {
          if (idx <= 4) {
            const map = ['#og-search', '#og-cate', '#og-banner', '#og-guess', '#og-quick']
            const sel = map[idx] || '#og-search'
            uni.setStorageSync('onboarding_target_selector', sel)
            if (uni.switchTab) uni.switchTab({ url: '/pages/home/index' })
            else uni.navigateTo({ url: '/pages/home/index' })
          } else if (idx === 5) {
            this.$nextTick(() => { this.refreshOnboardingRect('#og-product-add') })
          } else if (idx === 6) {
            this.openRoomSheet()
            setTimeout(() => { this.refreshOnboardingRect('#og-room-modal-list') }, 220)
          } else if (idx === 7) {
            uni.setStorageSync('onboarding_target_selector', '#og-order-tabs')
            uni.setStorageSync('onboarding_step_text', '订单标签切换与查看')
            uni.navigateTo({ url: '/pages/order/index' })
          } else if (idx === 8) {
            uni.setStorageSync('onboarding_target_selector', '#og-profile-info')
            uni.setStorageSync('onboarding_step_text', '个人信息管理')
            if (uni.switchTab) uni.switchTab({ url: '/pages/profile/index' })
            else uni.navigateTo({ url: '/pages/profile/index' })
          } else if (idx === 9) {
            uni.setStorageSync('onboarding_target_selector', '#og-profile-menu')
            uni.setStorageSync('onboarding_step_text', '功能区')
            if (uni.switchTab) uni.switchTab({ url: '/pages/profile/index' })
            else uni.navigateTo({ url: '/pages/profile/index' })
          } else if (idx === 10) {
            uni.setStorageSync('onboarding_target_selector', '#og-profile-addr')
            uni.setStorageSync('onboarding_step_text', '收货地址管理')
            if (uni.switchTab) uni.switchTab({ url: '/pages/profile/index' })
            else uni.navigateTo({ url: '/pages/profile/index' })
          }
        } else {
          if (idx <= 3) {
            const map = ['#og-search', '#og-mp-cate', '#og-banner', '#og-mp-guess']
            const sel = map[idx] || '#og-search'
            uni.setStorageSync('onboarding_target_selector', sel)
            if (uni.switchTab) uni.switchTab({ url: '/pages/home/index' })
            else uni.navigateTo({ url: '/pages/home/index' })
          } else if (idx === 4) {
            this.$nextTick(() => { this.refreshOnboardingRect('#og-product-add') })
          } else if (idx === 5) {
            this.openMpRoomSheet()
            setTimeout(() => { this.refreshOnboardingRect('#og-room-modal-list') }, 220)
          } else if (idx === 6) {
            uni.setStorageSync('onboarding_target_selector', '#og-order-tabs')
            uni.setStorageSync('onboarding_step_text', '订单标签切换与查看')
            uni.navigateTo({ url: '/pages/order/index' })
          } else if (idx === 7) {
            uni.setStorageSync('onboarding_target_selector', '#og-profile-info')
            uni.setStorageSync('onboarding_step_text', '个人信息管理')
            if (uni.switchTab) uni.switchTab({ url: '/pages/profile/index' })
            else uni.navigateTo({ url: '/pages/profile/index' })
          } else if (idx === 8) {
            uni.setStorageSync('onboarding_target_selector', '#og-profile-menu')
            uni.setStorageSync('onboarding_step_text', '功能区')
            if (uni.switchTab) uni.switchTab({ url: '/pages/profile/index' })
            else uni.navigateTo({ url: '/pages/profile/index' })
          } else if (idx === 9) {
            uni.setStorageSync('onboarding_target_selector', '#og-profile-addr')
            uni.setStorageSync('onboarding_step_text', '收货地址管理')
            if (uni.switchTab) uni.switchTab({ url: '/pages/profile/index' })
            else uni.navigateTo({ url: '/pages/profile/index' })
          }
        }
      } catch (e) {}
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
          this.$nextTick(() => { this.refreshOnboardingRect('#og-product-add') })
          return
        }
        if (idx === 6) {
          this.openRoomSheet()
          setTimeout(() => { this.refreshOnboardingRect('#og-room-modal-list') }, 220)
          return
        }
        if (idx === 7) {
          uni.setStorageSync('onboarding_target_selector', '#og-order-tabs')
          uni.navigateTo({ url: '/pages/order/index' })
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
          this.$nextTick(() => { this.refreshOnboardingRect('#og-product-add') })
          return
        }
        if (idx === 5) {
          this.openMpRoomSheet()
          setTimeout(() => { this.refreshOnboardingRect('#og-room-modal-list') }, 220)
          return
        }
        if (idx === 6) {
          uni.setStorageSync('onboarding_target_selector', '#og-order-tabs')
          uni.navigateTo({ url: '/pages/order/index' })
          return
        }
        if (idx === 7) {
          uni.setStorageSync('onboarding_target_selector', '#og-profile-info')
          if (uni.switchTab) uni.switchTab({ url: '/pages/profile/index' })
          else uni.navigateTo({ url: '/pages/profile/index' })
          return
        }
        if (idx === 8) {
          uni.setStorageSync('onboarding_target_selector', '#og-profile-menu')
          if (uni.switchTab) uni.switchTab({ url: '/pages/profile/index' })
          else uni.navigateTo({ url: '/pages/profile/index' })
          return
        }
        if (idx === 9) {
          uni.setStorageSync('onboarding_target_selector', '#og-profile-addr')
          if (uni.switchTab) uni.switchTab({ url: '/pages/profile/index' })
          else uni.navigateTo({ url: '/pages/profile/index' })
          return
        }
      }
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
          this.specs = (children || []).map((it) => {
            const pid = String(it.product_id || '').trim()
            const detailPackageFee = this.packageFeeByProductId[pid] || null
            const detailPackageCapacity = Number(detailPackageFee?.max_capacity || 0) || 0
            const detailPackagePrice = Number(detailPackageFee?.price || 0) || 0
            const packageCapacity = Number(it.package_capacity || 0) || detailPackageCapacity
            const packagePrice = Number(it.package_price || 0) || detailPackagePrice
            return ({
            product_id: it.product_id || '',
            name: it.name || '',
            unit: it.unit || '',
            length_unit: it.length_unit || '',
            unit_price: (it.unit_price === undefined || it.unit_price === null || it.unit_price === '') ? 0 : it.unit_price,
            additional_price: (it.additional_price === undefined || it.additional_price === null || it.additional_price === '') ? 0 : it.additional_price,
            discount: (it.discount === undefined || it.discount === null || it.discount === '') ? 1 : it.discount,
            price: (it.price === undefined || it.price === null || it.price === '') ? '-' : it.price,
            original_price: (it.original_price === undefined || it.original_price === null || it.original_price === '') ? 0 : (Number(it.original_price) || 0),
            formula: it.formula || '',
            image_url: clean(it.image_url) || '',
            inventory: it.inventory || 0,
            has_length: it.has_length || 0,
            specification: it.specification || '',
            product_type: it.product_type || it.type || '',
            message: it.message || '',
            product_category: it.product_category || '',
            color: it.color || '',
            model: it.model || '',
            color_temperature: it.color_temperature || '',
            package_capacity: packageCapacity,
            package_price: packagePrice,
            package_price_formatted: packagePrice.toFixed(2),
            single_package_fee: packagePrice.toFixed(2),
            has_custom_params: it.has_custom_params || 0,
            custom_param1_name: it.custom_param1_name || '',
            custom_param2_name: it.custom_param2_name || '',
            custom_param1_value: it.custom_param1_value || '',
            custom_param2_value: it.custom_param2_value || ''
          })
          })
        })
        .catch(() => { this.specs = [] })
        .finally(() => {
          this.specsLoading = false
          const idx = this.firstSelectableSpecIndex()
          this.selectedSpecIndex = idx
        })
    },
    selectSpec(index) {
      if (this.selectedSpecIndex === index) return
      this.selectedSpecIndex = index
    },
    isSpecDisabled(it) {
      try {
        const t = String(it?.product_type || '').toLowerCase()
        if (t === 'stagnant' && Number(it?.inventory) === 0) return true
        return false
      } catch (e) { return false }
    },
    onClickSpec(it, i) {
      if (this.isSpecDisabled(it)) return
      this.selectSpec(i)
    },
    firstSelectableSpecIndex() {
      try {
        const arr = Array.isArray(this.specs) ? this.specs : []
        for (let i = 0; i < arr.length; i++) {
          if (!this.isSpecDisabled(arr[i])) return i
        }
        return -1
      } catch (e) { return -1 }
    },
    previewCurrentImage() {
      try {
        const arr = (this.images || []).filter(u => !this.isVideo(u))
        const cur = this.currentImage
        const idx = arr.findIndex(u => u === cur)
        const current = idx >= 0 ? arr[idx] : (arr[0] || '')
        if (!current) return
        uni.previewImage({ urls: arr.length ? arr : [current], current })
      } catch (e) {}
    },
    previewDetailImage(src) {
      try {
        const arr = (this.product?.details_images || []).filter(u => typeof u === 'string')
        const current = arr.includes(src) ? src : (arr[0] || '')
        if (!current) return
        uni.previewImage({ urls: arr.length ? arr : [current], current })
      } catch (e) {}
    },
    previewMpImage(item) {
      try {
        if (this.isVideo(item)) return
        const arr = (this.images || []).filter(u => !this.isVideo(u))
        const current = arr.includes(item) ? item : (arr[0] || '')
        if (!current) return
        uni.previewImage({ urls: arr.length ? arr : [current], current })
      } catch (e) {}
    },
    ensureLoggedIn() {
      try {
        const u = uni.getStorageSync('user') || null
        const exp = uni.getStorageSync('token_expiration') || 0
        const ok = !!u && (!exp || Date.now() < exp)
        if (ok) return true
        this.showLoginModal = true
        return false
      } catch (e) { return false }
    },
    closeLoginModal() { this.showLoginModal = false },
    goLogin() { this.showLoginModal = false; uni.navigateTo({ url: '/pages/login/index' }) },
    addToCart() {
      if (!this.ensureLoggedIn()) return
      const spec = (this.selectedSpecIndex >= 0 && this.specs[this.selectedSpecIndex]) ? this.specs[this.selectedSpecIndex] : null
      const pid = spec ? spec.product_id : (this.product?.id || '')
      const cid = this.selectedCoupon ? this.selectedCoupon.record_id : ''
      addCartItem({ product_id: pid, quantity: 1, coupon_record_id: cid })
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
    incQty() { this.qty = Math.max(1, Number(this.qty || 0) + 1) },
    decQty() { this.qty = Math.max(1, Number(this.qty || 0) - 1) },
    normalizeQty() {
      const n = Number(this.qty)
      this.qty = isNaN(n) ? 1 : Math.max(1, Math.floor(n))
    },
    addToCartWithQty() {
      if (!this.ensureLoggedIn()) return
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
      const q = Math.max(1, Number(this.qty || 1))
      const cid = this.selectedCoupon ? this.selectedCoupon.record_id : ''
      addCartItem({ room_id: this.roomId, product_id: pid, length: lengthNum, quantity: q, color: this.specTemp || '', note: this.h5OrderNote || '', coupon_record_id: cid })
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
      if (!this.ensureLoggedIn()) return
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
        const lenMeters = !needLength ? '' : lenNum

        const u = uni.getStorageSync('user') || null
        const token = (u && (u.token || (u.data && u.data.token))) || ''
        const cid = this.selectedCoupon ? this.selectedCoupon.record_id : ''

        uni.showLoading({ title: '下单中' })
        createDirectOrder({ product_id: pid, address_id: addrId, note, length: lenMeters, quantity: qty, room_id: roomId, coupon_record_id: cid, token })
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
      const mq = Math.max(1, Number(this.mpQty || 1))
      const cid = this.selectedCoupon ? this.selectedCoupon.record_id : ''
      addCartItem({ room_id: rid, product_id: pid, length: lengthVal, quantity: mq, color: this.mpTemp || '', note: this.mpOrderNote || '', coupon_record_id: cid })
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
    normalizeMpQty() {
      const n = Number(this.mpQty)
      this.mpQty = isNaN(n) ? 1 : Math.max(1, Math.floor(n))
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
    evaluateFormula(formula, context) {
      try {
        const raw = String(formula || '')
        if (!raw) return null
        if (!/^[0-9+\-*/().\s_a-zA-Z]+$/.test(raw)) return null
        const expr = raw.replace(/\b[a-zA-Z_][a-zA-Z0-9_]*\b/g, (key) => {
          if (Object.prototype.hasOwnProperty.call(context, key)) {
            const v = Number(context[key])
            return isNaN(v) ? '0' : String(v)
          }
          return '0'
        })
        if (!/^[0-9+\-*/().\s]+$/.test(expr)) return null
        const val = Function(`"use strict"; return (${expr})`)()
        if (typeof val !== 'number' || isNaN(val)) return null
        return val
      } catch (e) { return null }
    },
    formatPriceWithSymbol(val) {
      try {
        if (val === '-' || val === '—') return '-'
        const n = Number(val)
        if (isNaN(n)) return '-'
        return '¥' + n.toFixed(2)
      } catch (e) { return '-' }
    },
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
    favProduct() {
      try {
        const pid = this.product?.id || ''
        const u = uni.getStorageSync('user') || null
        const token = (u && (u.token || (u.data && u.data.token))) || ''
        if (!pid) { uni.showToast({ title: '商品信息缺失', icon: 'none' }); return }
        if (!token) { uni.showToast({ title: '请先登录', icon: 'none' }); return }
        if (!this.isFavorite) {
          addFavorite({ product_id: pid, token }).then((res) => {
            if (res && res.success) { this.isFavorite = true; uni.showToast({ title: '已收藏', icon: 'success' }) }
            else { uni.showToast({ title: res?.message || '收藏失败', icon: 'none' }) }
          }).catch(() => { uni.showToast({ title: '收藏失败', icon: 'none' }) })
        } else {
          deleteFavorite({ product_id: pid, token }).then((res) => {
            if (res && res.success) { this.isFavorite = false; uni.showToast({ title: '已取消收藏', icon: 'success' }) }
            else { uni.showToast({ title: res?.message || '取消失败', icon: 'none' }) }
          }).catch(() => { uni.showToast({ title: '取消失败', icon: 'none' }) })
        }
      } catch (e) { uni.showToast({ title: '收藏失败', icon: 'none' }) }
    }
  }
}
</script>

<style scoped>
.page {
  background: #1a1a1a;
  min-height: 100vh;
  padding-bottom: 120rpx;
}

/* #ifdef MP-WEIXIN */
.product-page { position: relative; z-index: 1; }
.cover { background: #1a1a1a; }
.info { background: #1a1a1a; }
.title { color: #ffffff; }
/* #endif */

.cover {
  width: 100%;
  height: 500rpx;
  background: #2c2c2c;
}

.info {
  background: #322f2f;
  padding: 20rpx;
}

.title {
  font-size: 32rpx;
  display: block;
  color: #ffffff;
}

.pd-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
}

.mp-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
}

.fav-star {
  font-size: 48rpx;
  color: #777;
}
.fav-star.active {
  /* background: #ffec99; */
  color: #e3b609;
  border-radius: 8rpx;
  padding: 2rpx 8rpx;
}

.price {
  color: #ffffff;
  font-size: 34rpx;
  margin-top: 8rpx;
  display: block;
}

.sales {
  color: #999999;
  font-size: 26rpx;
  margin-top: 8rpx;
  display: block;
}

.footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: #2c2c2c;
  box-shadow: 0 -8rpx 20rpx rgba(0, 0, 0, .3);
  padding: 20rpx;
}

.btn-cart {
  width: 100%;
  /* #ifndef H5 */
  background: #e1251b;
  /* #endif */
  /* #ifdef H5 */
  background: #e1251b;
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

.login-mask {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}
.login-modal {
  width: 720rpx;
  max-width: 90vw;
  background: #2c2c2c;
  border-radius: 24rpx;
  padding: 48rpx 40rpx;
  box-shadow: 0 20rpx 40rpx rgba(0,0,0,0.3);
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}
.login-title {
  font-size: 34rpx;
  font-weight: 700;
  color: #ffffff;
  text-align: center;
}
.login-desc {
  font-size: 28rpx;
  color: #aaaaaa;
  text-align: center;
}
.login-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24rpx;
}
.btn-pill {
  min-width: 240rpx;
  height: 72rpx;
  line-height: 72rpx;
  padding: 0 40rpx;
  border-radius: 999rpx;
  text-align: center;
  font-size: 28rpx;
  font-weight: 600;
}
.btn-pill.confirm {
  background: #e1251b;
  color: #fff;
  box-shadow: 0 8rpx 20rpx rgba(225, 37, 27, 0.2);
}
.btn-pill.cancel {
  background: #333333;
  color: #999999;
  border: 2rpx solid #444444;
}

.spec-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 12rpx;
  border: 1rpx solid #444444;
  border-radius: 12rpx;
  /* background: #fafafa; */
  transition: all .2s;
  position: relative;
}

.spec-item.active {
  border-color: #e1251b;
  /* background: #fff5f0; */
}

.spec-item.disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.spec-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.3);
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  padding: 12rpx;
  border-radius: 12rpx;
}

.spec-mask-ico {
  width: 140rpx;
  height: 140rpx;
}
.spec-thumb {
  width: 120rpx;
  height: 120rpx;
  border-radius: 10rpx;
  background: #333333;
}

.spec-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.spec-name {
  font-size: 28rpx;
  color: #333333;
  line-height: 1.4;
}

.spec-price-row {
  display: flex;
  align-items: baseline;
  gap: 10rpx;
}

.spec-price {
  color: #e1251b;
  font-size: 32rpx;
  font-weight: 700;
}

.spec-oprice {
  color: #777777;
  font-size: 24rpx;
  text-decoration: line-through;
}

.spec-unit {
  color: #aaaaaa;
  font-size: 24rpx;
}

.spec-package-fee {
  display: flex;
  align-items: center;
  position: relative;
}

.fee-icon-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
  border: 2rpx solid #999;
  margin-left: 8rpx;
  cursor: pointer;
}

.fee-icon {
  font-size: 16rpx;
  color: #999;
  line-height: 1;
}

.fee-tooltip {
  display: none;
  position: absolute;
  bottom: 150%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  font-size: 24rpx;
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  white-space: nowrap;
  z-index: 100;
}

.fee-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 8rpx solid transparent;
  border-top-color: rgba(0, 0, 0, 0.8);
}

.fee-icon-wrap:hover .fee-tooltip {
  display: block;
}

.specs-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16rpx;
  font-size: 24rpx;
  color: #aaaaaa;
  background: #333333;
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
  color: #aaaaaa;
  font-size: 26rpx;
  margin-bottom: 8rpx;
}

.room-item {
  padding: 12rpx 14rpx;
  border: 1rpx solid #444444;
  border-radius: 10rpx;
  background: #333333;
  display: flex;
  align-items: center;
}

.room-name {
  color: #dddddd;
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
  background-color: #1a1a1a;
  /* background-image: url('/static/product_detail_background.jpg'); */
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
  color: #ffffff;
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
  background: #333333;
  border-radius: 6rpx;
  height: 60rpx;
}

.qty-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 36rpx;
  cursor: pointer;
}

.qty-num {
  padding: 0 12rpx;
  font-size: 24rpx;
  color: #ffffff;
}

.pd-left {
  height: 100%;
  background: #ffffff;
  /* border: 1rpx solid rgba(255,255,255,0.35); */
  border-radius: 16rpx;
  padding: 24rpx;
  box-sizing: border-box;
  /* box-shadow: 0 12rpx 40rpx rgba(0,0,0,0.08); */
  /* -webkit-backdrop-filter: saturate(120%) blur(8px); */
  /* backdrop-filter: saturate(120%) blur(8px); */
}

.pd-right {
  height: 100%;
  background: #ffffff;
  border: 1rpx solid #eeeeee;
  border-radius: 16rpx;
  padding: 24rpx;
  box-sizing: border-box;
  box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.05);
  /* -webkit-backdrop-filter: saturate(120%) blur(8px); */
  /* backdrop-filter: saturate(120%) blur(8px); */
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
  border: 1rpx solid #444444;
  box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.3);
}

.pd-main {
  width: 100%;
  height: 520rpx;
  border-radius: 8rpx;
  background: #1a1a1a;
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
  background: #333333;
  border: 1rpx solid #444444;
}

.pd-thumb.active {
  outline: 3rpx solid #e1251b;
}

.pd-card {
  background: #ffffff;
  border-radius: 12rpx;
  padding: 20rpx;
  border: 1rpx solid #eeeeee;
  box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.05);
  /* -webkit-backdrop-filter: saturate(120%) blur(8px); */
  /* backdrop-filter: saturate(120%) blur(8px); */
}

.pd-section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333333;
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
  color: #aaaaaa;
  font-size: 24rpx;
  min-width: 80rpx;
}

.pd-param-item .val {
  color: #333333;
  font-size: 26rpx;
  margin-top: 0rpx;
  flex: 1;
}
.pd-param-grid, .pd-param-item .key, .pd-param-item .val, .mp-param-grid, .mp-param-item .key, .mp-param-item .val {
  user-select: text;
  -webkit-user-select: text;
}
.product-page, .product-page * {
  user-select: text;
  -webkit-user-select: text;
}

.pd-detail-img {
  width: 100%;
  border-radius: 8rpx;
  background: #1a1a1a;
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
  background: #f8f8f8;
  border: 1rpx solid #eeeeee;
  border-radius: 10rpx;
}

.pd-address .addr-line {
  display: block;
  color: #333333;
  font-size: 24rpx;
}

.pd-address .addr-btn {
  background: #ffffff;
  color: #333333;
  border: 1rpx solid #cccccc;
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
  background: #ffffff;
  border: 1rpx solid #cccccc;
  border-radius: 10rpx;
  padding: 0 14rpx;
  color: #333333;
  max-width: 30%;
}

.pd-input {
  width: 100%;
  height: 64rpx;
  line-height: 64rpx;
  background: #ffffff;
  border: 1rpx solid #cccccc;
  border-radius: 10rpx;
  padding: 0 14rpx;
  max-width: 30%;
  color: #333333;
}

/* H5 内联字段输入宽度缩小 */
.pd-field.inline .pd-input,
.pd-field.inline .picker-display {
  flex: none;
  width: 480rpx;
  max-width: none;
}

/* 统一 Label 宽度与两端对齐 */
.pd-field.inline .label,
.mp-field .label {
  width: 90rpx;
  text-align: justify;
  text-align-last: justify;
  display: inline-block;
  font-size: 28rpx;
  font-weight: 600;
}
.pd-field.inline .label {
  color: #333333;
}

.unit-tip {
  margin-left: 12rpx;
  font-size: 24rpx;
  color: #aaaaaa;
}

.coupon-display,
.room-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}

.coupon-text,
.room-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.coupon-arrow,
.room-arrow {
  color: #999999;
  font-size: 32rpx;
  margin-left: 12rpx;
  line-height: 1;
}

.coupon-display.has-coupon {
  border-color: #ff4d4f !important;
  color: #ff4d4f !important;
  background: rgba(255, 77, 79, 0.05) !important;
  font-weight: 600;
}
.coupon-display.has-coupon .coupon-text,
.coupon-display.has-coupon .coupon-arrow {
  color: #ff4d4f !important;
}

.pd-title {
  font-size: 40rpx;
  color: #333333;
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
  color: #e1251b;
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
  color: #777777;
  font-size: 24rpx;
  /* margin-top: 12rpx; */
}

.pd-qty-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20rpx;
  padding: 12rpx;
  background: #f8f8f8;
  border: 1rpx solid #eeeeee;
  border-radius: 10rpx;
}

.qty-wrapper {
  display: flex;
  align-items: center;
}

.pd-qty-row .label {
  color: #333333;
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
  background: rgba(0, 0, 0, .7);
  display: flex;
  align-items: flex-end;
  /* 底部弹窗 */
  justify-content: center;
  z-index: 9999;
}

.mp-sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10000;
  width: 100vw;
  max-width: none;
  background: #2c2c2c;
  border-top-left-radius: 24rpx;
  border-top-right-radius: 24rpx;
  padding: 24rpx;
  box-shadow: 0 -8rpx 24rpx rgba(0, 0, 0, 0.3);
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
  color: #ffffff;
}
.count-input {
  width: 72rpx;
  height: 80rpx;
  line-height: 80rpx;
  border: none;
  border-radius: 0;
  text-align: center;
  font-size: 30rpx;
  background: transparent;
  color: #ffffff;
  margin: 0 12rpx;
}
  /* padding-bottom: 12rpx;
  border-bottom: 1rpx solid #f0f0f0;
  margin-bottom: 20rpx;
} */

.mp-field {
  display: flex;
  align-items: center;
  /* justify-content: space-between; */
  gap: 12rpx;
  margin: 16rpx 0;
}

.mp-input {
  flex: none;
  width: 480rpx;
  height: 64rpx;
  line-height: 64rpx;
  background: #333333;
  border: 1rpx solid #444444;
  border-radius: 12rpx;
  padding: 0 14rpx;
  color: #ffffff;
}

.mp-actions {
  display: flex;
  gap: 12rpx;
  margin-top: auto;
  /* 固定在底部 */
  padding-top: 16rpx;
  border-top: 1rpx solid #444444;
}

.mp-btn {
  flex: 1;
  height: 72rpx;
  border-radius: 999rpx;
  font-size: 28rpx;
}

.mp-btn.ghost {
  background: #333333;
  color: #dddddd;
  border: 1rpx solid #444444;
}

.mp-btn.primary {
  background: #e1251b;
  color: #fff;
}

/* 使数量步进器横向排列 */
.mp-sheet .qty-stepper {
  display: flex;
  flex-direction: row;
  align-items: center;
  background: #333333;
  border-radius: 40rpx;
  height: 80rpx;
  padding: 0 4rpx;
}

/* 淘宝风格：步进器在弹窗内的样式适配 */
.mp-sheet .qty-stepper .step {
  width: 64rpx;
  height: 100%;
  border-radius: 0;
  background: transparent;
  border: none;
  color: #ffffff;
  font-size: 40rpx;
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
  color: #ffffff;
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
  background: #ffffff;
  border-radius: 12rpx;
  padding: 20rpx;
  margin: 20rpx;
}

.mp-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 12rpx;
}

.mp-param-grid {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  border-radius: 10rpx;
  background: #f8f8f8;
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
  color: #666666;
  font-size: 24rpx;
}

.mp-param-item .val {
  color: #333333;
  font-size: 26rpx;
  margin-top: 0rpx;
}

.mp-detail-img {
  width: 100%;
  border-radius: 8rpx;
  background: #f8f8f8;
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
  border-top: 1rpx solid #444444;
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
  color: #333333;
  font-size: 28rpx;
}

.address-card .addr-body {
  margin-top: 8rpx;
  color: #666666;
  font-size: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.address-card .addr-line {
  font-size: 26rpx;
  color: #333333;
}

.address-card .addr-empty {
  margin-top: 8rpx;
  color: #777777;
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
  background: #333333;
  border: 1rpx solid #555555;
  color: #dddddd;
  border-radius: 999rpx;
  font-size: 24rpx;
  padding: 0 20rpx;
  height: 50rpx;
  line-height: 48rpx;
}

/* MP Address Bar Style from Cart Page */
.mp-address-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx;
  /* background: #fff; */
  border: 1rpx solid #eeeeee;
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
  color: #333333;
  flex-shrink: 0;
}

.bar-info {
  display: flex;
  flex-direction: column;
  font-size: 24rpx;
  color: #666666;
  flex: 1;
  overflow: hidden;
}

.bar-line {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bar-btn {
  background: #ffffff;
  border: 1rpx solid #cccccc;
  color: #333333;
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
  background: #f0f0f0;
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
  color: #333333;
}

.qty-box-large .qty-num {
  font-size: 30rpx;
  font-weight: 600;
  color: #333333;
}
.qty-box-large .qty-input {
  width: 72rpx;
  height: 100%;
  border: none;
  background: transparent;
  text-align: center;
  font-size: 30rpx;
  color: #333333;
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
  background: #444444;
  color: #ffffff;
}

.btn-action.btn-buy {
  background: #e1251b;
  color: #fff;
}

/* #ifdef MP-WEIXIN */
.mp-sheet .spec-name { color: #ffffff !important; }
.mp-sheet .spec-unit { color: #cccccc !important; }
.mp-sheet .addr-icon { color: #ffffff !important; }
.mp-sheet .bar-info { color: #dddddd !important; }
.mp-sheet .bar-line { color: #ffffff !important; }
.mp-sheet .bar-btn { color: #ffffff !important; background: #444444 !important; border-color: #666666 !important; }
.mp-sheet .mp-param-item .key { color: #aaaaaa !important; }
.mp-sheet .mp-param-item .val { color: #ffffff !important; }
.mp-sheet .label { color: #ffffff !important; }
.mp-sheet .unit-tip { color: #cccccc !important; }
.mp-sheet .spec-item { border-color: #555555 !important; background: transparent !important; }
.mp-sheet .spec-item.active { border-color: #ff6b35 !important; border-width: 2rpx !important; box-shadow: 0 0 8rpx 2rpx rgba(255, 107, 53, 0.5) !important; }
.mp-sheet .mp-address-bar { border-color: #555555 !important; }
.mp-sheet .mp-title { color: #ffffff !important; }
/* #endif */

/* #ifdef H5 */
.h5-toggle {
  background: #f7f7f7 !important;
  color: #666 !important;
  border-radius: 8rpx;
  margin-top: 12rpx;
  cursor: pointer;
  border: 1rpx solid #eeeeee;
}
.h5-toggle:hover {
  background: #eeeeee !important;
}
/* #endif */
</style>
