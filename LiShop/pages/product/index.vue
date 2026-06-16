<template>
  <view class="page product-page" :class="{ 'no-scroll': mpSheet || roomSelectorVisible || couponSheetVisible }">
    <Skeleton :loading="pageLoading && !product" :showTitle="true" />
    <view v-if="pageLoading && !product" class="detail-skeleton">
      <view class="detail-skeleton-main"></view>
      <view class="detail-skeleton-side">
        <view class="detail-skeleton-line w-80"></view>
        <view class="detail-skeleton-line w-50"></view>
        <view class="detail-skeleton-price"></view>
        <view class="detail-skeleton-group">
          <view class="detail-skeleton-chip" v-for="i in 4" :key="'chip' + i"></view>
        </view>
        <view class="detail-skeleton-line w-70"></view>
        <view class="detail-skeleton-box"></view>
        <view class="detail-skeleton-actions">
          <view class="detail-skeleton-btn detail-skeleton-btn-light"></view>
          <view class="detail-skeleton-btn detail-skeleton-btn-dark"></view>
        </view>
      </view>
    </view>
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
                      :src="getH5VideoRenderSrc(src, i)"
                      :poster="product.image || '/static/logo.png'"
                      :controls="true"
                      :autoplay="false"
                      playsinline
                      webkit-playsinline
                      object-fit="contain"
                      :muted="true"
                      @play="pauseCarousel"
                      @ended="onVideoEnded"
                    />
                    <image v-else class="pd-main" :src="normalizeMediaUrl(src)" mode="aspectFit" @click="previewCurrentImage" />
                  </swiper-item>
                </swiper>
                <view class="pd-thumbs">
                  <view v-for="(src, i) in images" :key="i" class="pd-thumb" :class="{ active: i === current }"
                    @click="current = i" style="position: relative; overflow: hidden;">
                    <image :src="isVideo(src) ? (product.image || '/static/logo.png') : normalizeMediaUrl(src)" mode="aspectFill"
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
                <image v-for="(src, i) in product.details_images" :key="'d' + i" class="pd-detail-img" :src="src" lazy-load
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
                <!-- <view class="pd-meta">
                  <text selectable="true">{{ product.is_free_shipping ? '包邮' : '不包邮' }} ｜ {{ product.shipping_time_hours ?
                    (product.shipping_time_hours + '小时内发货') : '发货时间待定' }} ｜ {{ product.support_no_reason_return_7d ?
                      '七天无理由' : '不支持七天无理由' }}</text>
                </view> -->
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
                          <!-- <view v-if="Number(it.package_price) > 0" class="spec-unit spec-package-fee">
                            <text selectable="true">包装费：¥{{ it.single_package_fee }}</text>
                            <view class="fee-icon-wrap">
                              <text class="fee-icon">!</text>
                              <view class="fee-tooltip">
                                包装容量：{{ it.package_capacity }} | 单位价格：¥{{ it.package_price_formatted }}
                              </view>
                            </view>
                          </view> -->
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
                  <view class="pd-field inline pd-field-length" v-if="selectedSpec && selectedSpec.has_length === 1">
                    <text class="label">长度</text>
                    <view class="length-input-wrap">
                      <input class="pd-input" v-model="specLength" placeholder="填写数字" @input="onSpecLengthInput" />
                      <view v-if="lengthLimitTip" class="length-limit-bubble">{{ lengthLimitTip }}</view>
                    </view>
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
            v-if="isPlayableVideo(item)"
            :id="index === current ? 'mp-video' : ('mp-video-' + index)"
            :src="getMpVideoRenderSrc(item)"
            controls
            style="width: 100%; height: 100%;"
            object-fit="contain"
            :autoplay="false"
            @play="pauseCarousel"
            @ended="onVideoEnded"
          ></video>
          <view v-else-if="isVideo(item)" class="cover unsupported-video" @click="handleUnsupportedVideo(item)">
            <image :src="product.image || '/static/logo.png'" mode="aspectFit" style="width: 100%; height: 100%;" />
            <view class="unsupported-video-mask">
              <text class="unsupported-video-icon">▶</text>
              <text class="unsupported-video-text">当前端暂不支持该视频格式播放</text>
            </view>
          </view>
          <image v-else :src="normalizeMediaUrl(item)" mode="aspectFill" style="width: 100%; height: 100%;" @click="previewMpImage(item)" />
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
        <image v-for="(src, i) in product.details_images" :key="'md' + i" class="mp-detail-img" :src="src" lazy-load
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
  <view v-if="couponSheetVisible" class="coupon-modal-mask" @click="closeCouponSheet" catchtouchmove="true">
    <view class="coupon-modal-sheet" @click.stop>
      <view class="coupon-modal-header">
        <view class="coupon-modal-title-wrap">
          <text class="coupon-modal-eyebrow">Coupon</text>
          <text class="coupon-modal-title">选择优惠券</text>
          <text class="coupon-modal-subtitle">为当前规格挑一张更合适的优惠券</text>
        </view>
        <view class="coupon-modal-close" @click="closeCouponSheet">×</view>
      </view>
      <scroll-view scroll-y class="coupon-modal-list">
        <view v-if="coupons && coupons.length">
          <view v-for="c in coupons" :key="c.record_id" class="coupon-option coupon-option-card" :class="{ active: selectedCoupon && selectedCoupon.record_id === c.record_id }" @click="selectCouponOption(c)">
            <view class="coupon-card-amount">
              <text class="coupon-card-amount-prefix">{{ Number(c?.rule?.discount_type || 0) === 2 ? '¥' : '' }}</text>
              <text class="coupon-card-amount-value">{{ couponDiscountPrimaryText(c) }}</text>
              <text class="coupon-card-amount-suffix">{{ couponDiscountSuffixText(c) }}</text>
            </view>
            <view class="coupon-card-body">
              <view class="coupon-card-top">
                <text class="coupon-card-name">{{ c.name || '优惠券' }}</text>
                <text class="coupon-card-tag">{{ couponThresholdText(c) }}</text>
              </view>
              <text class="coupon-card-rule">{{ couponRuleSummaryText(c) }}</text>
              <text class="coupon-card-validity">{{ couponValidityText(c) }}</text>
            </view>
            <view class="coupon-card-check">{{ selectedCoupon && selectedCoupon.record_id === c.record_id ? '已选' : '使用' }}</view>
          </view>
        </view>

        <view v-else class="coupon-empty-state">
          <text class="coupon-empty-icon">%</text>
          <text class="coupon-empty-title">暂无可用优惠券</text>
          <text class="coupon-empty-desc">当前规格暂时没有可用优惠券，后续可再回来看看</text>
        </view>
      </scroll-view>
      <view class="coupon-modal-footer">
        <text class="coupon-modal-footer-text">{{ selectedCoupon ? ('已选择：' + selectedCoupon.name) : '未选择优惠券' }}</text>
        <button class="coupon-modal-btn" @click="closeCouponSheet">完成</button>
      </view>
    </view>
  </view>
</template>

<script>
/**
 * 商品详情页面模块
 * - 负责拉取商品详情/规格、收藏状态，并提供加入购物车/下单等交互
 * - 同时兼容 H5 与小程序端的规格/房间/地址选择流程（通过条件编译与弹窗组件实现）
 */
import { getProductDetail, getProductSpecs, getRooms, createRoom, addCartItem, getCartItems, createOrderByIds, getAddresses, addAddress, createDirectOrder, calculateDirectPrice, addFavorite, deleteFavorite, getAvailableCoupons } from '../../api/index.js'
import RoomSelector from '../../components/RoomSelector.vue'
import FloatingNav from '@/components/FloatingNav.vue'
import Skeleton from '@/components/Skeleton.vue'
import OnboardingGuide from '@/components/OnboardingGuide.vue'
import LoginPrompt from '@/components/LoginPrompt.vue'
import { getCachedProductPreview } from '@/utils/product-preview.js'

const HLS_SCRIPT_URL = 'https://cdn.jsdelivr.net/npm/hls.js@1'
let hlsScriptPromise = null

export default {
  components: { RoomSelector, FloatingNav, Skeleton, OnboardingGuide, LoginPrompt },
  data() { return { hasUserInteracted: false, hls: null, product: null, pageLoading: true, shareProductId: '', current: 0, qty: 1, specTemp: '', specLength: '', lengthLimitTip: '', roomName: '', roomId: '', roomsRaw: [], mpSheet: false, mpRoomSheet: false, mpTemp: '', mpLength: '', mpRoom: '', mpQty: 1, mpOrderNote: '', specs: [], specsLoading: false, roomSheet: false, roomsList: [], roomInput: '', selectedSpecIndex: -1, isSpecsCollapsed: true, lockScroll: false, lockScrollTop: 0, roomSelectorVisible: false, roomSelectorMode: 'h5', addresses: [], selectedAddress: null, h5OrderNote: '', isFavorite: false, swiperTimer: null, carouselInterval: 3000, lockCarousel: false, showOnboarding: false, onboardingRects: [], onboardingSteps: [], onboardingIndex: 0, showLoginModal: false, coupons: [], selectedCoupon: null, couponSheetVisible: false, packageFeeByProductId: {}, realTimePriceData: null } },
  onLoad(query) {
    const id = decodeURIComponent(query?.id || '')
    this.pageLoading = true
    this.shareProductId = id
    if (!id) {
      this.product = { id: '', title: '商品', price: 0, sales: 0, image: '/static/logo.png', images: ['/static/logo.png'], main_media: ['/static/logo.png'], details_images: [] }
      this.pageLoading = false
      return
    }
    this.hydratePreviewProduct(id)
    this.fetchProductDetailData(id)
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
      if (this.isM3u8Video(src)) return ''
      return this.withCacheBust(src)
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
      let isH5 = false
      try { isH5 = typeof window !== 'undefined' } catch (e) { isH5 = false }
      const lengthRaw = isH5 ? this.specLength : this.mpLength
      const lengthStr = String(lengthRaw || '').replace(/[^0-9.]/g, '')
      const lengthVal = lengthStr ? Number(lengthStr) : 1
      const formula = String(sel?.formula || '').trim()
      const usesLength = /\blength\b/.test(formula) || Number(sel?.has_length || 0) === 1

      if (this.realTimePriceData && typeof this.realTimePriceData.total_amount !== 'undefined') {
        const numText = Number(this.realTimePriceData.total_amount).toFixed(2)
        if (usesLength && !lengthStr) return `${numText}/m`
        return numText
      }

      const qtyRaw = isH5 ? this.qty : this.mpQty
      const qty = Math.max(1, Number(qtyRaw || 1))
      if (usesLength && lengthStr && isNaN(lengthVal)) return '-'
      const fallbackNum = Number(sel?.price ?? sel?.unit_price ?? this.product?.price ?? 0)
      if (isNaN(fallbackNum)) return '-'
      const defaultText = fallbackNum.toFixed(2)
      if (usesLength && !lengthStr) return `${defaultText}/m`
      return defaultText
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
      if (this.isPlayableVideo(src)) {
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
    },
    selectedSpecIndex(newVal, oldVal) {
      this.validateSpecLengthLimit(this.specLength)
      if (oldVal !== -1 && oldVal !== undefined) {
        this.hasUserInteracted = true
      }
      this.fetchCoupons()
      this.triggerRealTimePriceCalc()
    },
    qty(newVal, oldVal) {
      if (oldVal !== undefined) this.hasUserInteracted = true
      this.triggerRealTimePriceCalc()
    },
    specLength(newVal, oldVal) {
      if (oldVal !== undefined) this.hasUserInteracted = true
      this.triggerRealTimePriceCalc()
    },
    mpLength(newVal, oldVal) {
      if (oldVal !== undefined) this.hasUserInteracted = true
      this.triggerRealTimePriceCalc()
    },
    mpQty(newVal, oldVal) {
      if (oldVal !== undefined) this.hasUserInteracted = true
      this.triggerRealTimePriceCalc()
    },
    mpRoom(newVal, oldVal) {
      if (oldVal !== undefined) this.hasUserInteracted = true
      this.triggerRealTimePriceCalc()
    },
    selectedCoupon(newVal, oldVal) {
      if (oldVal !== undefined) this.hasUserInteracted = true
      this.triggerRealTimePriceCalc()
    },
    roomId(newVal, oldVal) {
      if (oldVal !== undefined && oldVal !== '') this.hasUserInteracted = true
      this.triggerRealTimePriceCalc()
    },
    selectedAddress() {
      this.triggerRealTimePriceCalc()
    }
  },
  beforeDestroy() {
    if (this.hls) {
      this.hls.destroy()
      this.hls = null
    }
    try {
      if (this._detailDeferredTimer) {
        clearTimeout(this._detailDeferredTimer)
        this._detailDeferredTimer = null
      }
    } catch (e) {}
    this.stopCarousel()
  },
  onShow() {
    this.showShareMenus()
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
    /**
     * 显示当前端支持的分享菜单。
     * @description
     * 合并原先分散的 onShow 逻辑，避免生命周期重复定义导致其中一段逻辑失效。
     * @returns {void}
     * @example
     * this.showShareMenus()
     */
    showShareMenus() {
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
    /**
     * 使用列表页预取缓存快速填充详情页首屏。
     * @description
     * 新标签页首次打开时先展示轻量商品数据，减少接口返回前的空白等待。
     * @param {string} productId 商品 ID
     * @returns {void}
     * @example
     * this.hydratePreviewProduct('1001')
     */
    hydratePreviewProduct(productId) {
      const preview = getCachedProductPreview(productId)
      if (!preview) return
      this.product = {
        id: preview.id || productId,
        title: preview.title || ('商品 ' + productId),
        price: preview.price === '-' ? 0 : (Number(preview.price ?? 0) || 0),
        sales: Number(preview.sales ?? 0) || 0,
        type: '',
        comment: '',
        shipping_origin: '',
        main_media: Array.isArray(preview.main_media) && preview.main_media.length ? preview.main_media : (Array.isArray(preview.images) && preview.images.length ? preview.images : ['/static/logo.png']),
        details_images: Array.isArray(preview.details_images) ? preview.details_images : [],
        shipping_time_hours: 0,
        support_no_reason_return_7d: 0,
        is_free_shipping: 0,
        image: preview.image || '/static/logo.png',
        images: Array.isArray(preview.images) && preview.images.length ? preview.images : ['/static/logo.png']
      }
    },
    /**
     * 拉取完整商品详情数据。
     * @description
     * 获取后端详情数据后更新首屏展示，并将非首屏必要请求延后到下一帧后执行。
     * @param {string} productId 商品 ID
     * @returns {void}
     * @example
     * this.fetchProductDetailData('1001')
     */
    fetchProductDetailData(productId) {
      getProductDetail({ available_product_id: productId })
        .then((res) => {
          const d = res?.data || {}
          const main = this.collectMediaUrls(d.main_image)
          const videos = this.collectMediaUrls(d.video, d.video_url)
          const detailImgs = this.collectMediaUrls(d.images)
          const mediaList = [...main, ...videos]
          const childrenUnits = Array.isArray(d.children_units) ? d.children_units : []
          const packageFeeByProductId = {}
          childrenUnits.forEach((item) => {
            const pid = String(item?.product_id || '').trim()
            const fee = item?.package_fee_info || null
            if (!pid || !fee) return
            packageFeeByProductId[pid] = fee
          })
          this.packageFeeByProductId = packageFeeByProductId
          this.product = {
            id: d.available_product_id || productId,
            title: d.name || ('商品 ' + productId),
            price: Number(d.price ?? 0) || 0,
            sales: Number(d.order_count ?? 0) || 0,
            type: d.type || d.product_type || '',
            comment: d.comment || '',
            shipping_origin: this.normalizeMediaUrl(d.shipping_origin) || '',
            main_media: mediaList.length ? mediaList : ['/static/logo.png'],
            details_images: detailImgs,
            shipping_time_hours: d.shipping_time_hours || 0,
            support_no_reason_return_7d: d.support_no_reason_return_7d || 0,
            is_free_shipping: d.is_free_shipping || 0,
            image: main[0] || '/static/logo.png',
            images: mediaList.length ? mediaList : ['/static/logo.png']
          }
          this.isFavorite = (String(d.is_favorite) === '1') || (d.is_favorite === 1) || (d.is_favorite === true)
          this.fetchSpecs(this.product.id)
        })
        .catch((err) => {
          this.packageFeeByProductId = {}
          const errData = err?.data || err || {}
          const msg = errData?.message || ''
          const statusCode = err?.statusCode || 0
          const isNotFound = statusCode === 404 || msg.includes('不存在') || msg.includes('not found')
          if (isNotFound) {
            this.product = null
            this.pageLoading = false
            uni.showToast({ title: '商品不存在', icon: 'none' })
            setTimeout(() => {
              try { uni.navigateBack() } catch (e) {
                uni.switchTab({ url: '/pages/home/index' })
              }
            }, 1500)
            return
          }
          if (!this.product) {
            this.product = { id: productId, title: '商品 ' + productId, price: 0, sales: 0, shipping_origin: '', image: '/static/logo.png', images: ['/static/logo.png'], main_media: ['/static/logo.png'], details_images: [] }
          }
          this.fetchSpecs(productId)
        })
        .finally(() => {
          this.pageLoading = false
          this.resetCarouselTimer()
          this.$nextTick(() => { this.startMediaAutoplayIfNeeded() })
          this.deferDetailSideRequests()
        })
    },
    /**
     * 启动当前轮播项的视频自动播放逻辑。
     * @description
     * 仅当当前轮播项是可播放视频时执行，避免重复散落在多个请求回调中。
     * @returns {void}
     * @example
     * this.startMediaAutoplayIfNeeded()
     */
    startMediaAutoplayIfNeeded() {
      const src = this.currentImage
      if (!this.isPlayableVideo(src)) return
      this.lockCarousel = true
      this.stopCarousel()
      try {
        const ctx1 = uni.createVideoContext('pd-video', this)
        const ctx2 = uni.createVideoContext('mp-video', this)
        if (ctx1 && typeof ctx1.play === 'function') ctx1.play()
        else if (ctx2 && typeof ctx2.play === 'function') ctx2.play()
      } catch (e) {}
    },
    /**
     * 按需加载 HLS 播放库，避免首页等非视频页面首屏额外下载脚本。
     * @returns {Promise<any>}
     * @example
     * this.ensureHlsLibrary().then((Hls) => { if (Hls) console.log('ready') })
     */
    ensureHlsLibrary() {
      // #ifdef H5
      if (typeof window === 'undefined') return Promise.resolve(null)
      if (window.Hls) return Promise.resolve(window.Hls)
      if (hlsScriptPromise) return hlsScriptPromise
      hlsScriptPromise = new Promise((resolve, reject) => {
        try {
          const script = document.createElement('script')
          script.src = HLS_SCRIPT_URL
          script.async = true
          script.onload = () => resolve(window.Hls || null)
          script.onerror = () => {
            hlsScriptPromise = null
            reject(new Error('HLS script load failed'))
          }
          document.head.appendChild(script)
        } catch (e) {
          hlsScriptPromise = null
          reject(e)
        }
      })
      return hlsScriptPromise
      // #endif
      return Promise.resolve(null)
    },
    /**
     * 延后加载非首屏必要数据。
     * @description
     * 将优惠券与地址请求放到首屏渲染之后，减少新标签页刚打开时的网络竞争。
     * @param {string} productId 商品 ID
     * @returns {void}
     * @example
     * this.deferDetailSideRequests()
     */
    deferDetailSideRequests() {
      try {
        if (this._detailDeferredTimer) clearTimeout(this._detailDeferredTimer)
      } catch (e) {}
      this._detailDeferredTimer = setTimeout(() => {
        this.loadAddresses()
      }, 120)
    },
    triggerRealTimePriceCalc(force = false) {
      if (!this.hasUserInteracted && !force) return
      if (this._calcTimer) clearTimeout(this._calcTimer)
      this._calcTimer = setTimeout(() => {
        this.doCalculateRealTimePrice()
      }, 300)
    },
    doCalculateRealTimePrice() {
      const spec = this.selectedSpec
      if (!spec) {
        this.realTimePriceData = null
        return
      }
      
      let isH5 = false
      try { isH5 = typeof window !== 'undefined' } catch (e) { isH5 = false }
      
      const pid = spec.product_id || this.product?.id || ''
      const rawLen = isH5 ? this.specLength : this.mpLength
      const lenStr = String(rawLen || '').replace(/[^0-9.]/g, '')
      const lenNum = lenStr ? Number(lenStr) : null
      
      const needLength = spec.has_length === 1
      const qtyRaw = isH5 ? this.qty : this.mpQty
      const qty = Math.max(1, Number(qtyRaw || 1))
      
      const cid = this.selectedCoupon ? this.selectedCoupon.record_id : ''
      const mpChosen = String(this.mpRoom || '').trim()
      const mpRoomId = mpChosen
        ? (((this.roomsRaw || []).find(it => it && it.name === mpChosen) || {}).id || '')
        : ''
      const roomId = isH5 ? (this.roomId || '') : mpRoomId
      const addrId = this.selectedAddress?.id || ''
      
      let token = ''
      try {
        const u = uni.getStorageSync('user') || null
        token = (u && (u.token || (u.data && u.data.token))) || ''
      } catch (e) {}
      
      calculateDirectPrice({
        product_id: pid,
        length: needLength ? lenNum : null,
        quantity: qty,
        coupon_record_id: cid,
        room_id: roomId,
        address_id: addrId,
        token
      }).then(res => {
        if (res && res.success && res.data) {
          this.realTimePriceData = res.data
        } else {
          this.realTimePriceData = null
          const errMsg = (res && typeof res.data === 'string' ? res.data : '') || (res && res.message) || ''
          if (errMsg && errMsg.includes('长度')) {
            this.lengthLimitTip = errMsg
          }
        }
      }).catch(err => {
        console.error('实时计价失败', err)
        this.realTimePriceData = null
        const errMsg = (err && typeof err.data === 'string' ? err.data : '') || (err && err.message) || ''
        if (errMsg && errMsg.includes('长度')) {
          this.lengthLimitTip = errMsg
        }
      })
    },
    /**
     * 获取当前规格可用优惠券。
     * @description
     * 优惠券接口要求传入明细商品 ID，因此这里始终使用当前选中的规格 `product_id`。
     * 当规格尚未完成初始化或用户未登录时，直接清空优惠券状态，避免误传母商品 ID。
     * @returns {void}
     * @example
     * this.fetchCoupons()
     */
    fetchCoupons() {
      let token = ''
      try {
        const u = uni.getStorageSync('user') || null
        token = (u && (u.token || (u.data && u.data.token))) || ''
      } catch (e) {}
      const detailProductId = String(this.selectedSpec?.product_id || '').trim()
      if (!token || !detailProductId) {
        this.coupons = []
        this.selectedCoupon = null
        return
      }
      getAvailableCoupons({ product_id: detailProductId, token }).then(res => {
        // 后端返回了专门筛选好的 items
        if (res.success && res.data && res.data.items) {
          this.coupons = res.data.items
          const selectedRecordId = String(this.selectedCoupon?.record_id || '').trim()
          if (selectedRecordId && !this.coupons.some(c => String(c?.record_id || '').trim() === selectedRecordId)) {
            this.selectedCoupon = null
          }
        }
      }).catch(() => {
        this.coupons = []
        this.selectedCoupon = null
      })
    },
    /**
     * 关闭优惠券弹层。
     * @returns {void}
     * @example
     * this.closeCouponSheet()
     */
    closeCouponSheet() {
      this.couponSheetVisible = false
    },
    /**
     * 选择优惠券并保留弹层，等待用户确认完成。
     * @param {Object|null} coupon 当前选择的优惠券对象
     * @returns {void}
     * @example
     * this.selectCouponOption(coupon)
     */
    selectCouponOption(coupon) {
      this.hasUserInteracted = true
      this.selectedCoupon = coupon || null
    },
    openCouponSheet() {
      this.couponSheetVisible = true
    },
    /**
     * 获取优惠券主视觉数值文本。
     * @param {Object} coupon 优惠券对象
     * @returns {string}
     * @example
     * this.couponDiscountPrimaryText(coupon)
     */
    couponDiscountPrimaryText(coupon) {
      const rule = coupon?.rule || {}
      const discountType = Number(rule.discount_type || 0)
      const discountValue = Number(rule.discount_value || 0)
      if (discountType === 1) return String(Number(discountValue || 0))
      return discountValue.toFixed(0)
    },
    /**
     * 获取优惠券优惠值后缀。
     * @param {Object} coupon 优惠券对象
     * @returns {string}
     * @example
     * this.couponDiscountSuffixText(coupon)
     */
    couponDiscountSuffixText(coupon) {
      const rule = coupon?.rule || {}
      return Number(rule.discount_type || 0) === 1 ? '%' : ''
    },
    /**
     * 获取优惠券门槛文案。
     * @param {Object} coupon 优惠券对象
     * @returns {string}
     * @example
     * this.couponThresholdText(coupon)
     */
    couponThresholdText(coupon) {
      const minAmount = Number(coupon?.rule?.min_order_amount || 0)
      if (minAmount > 0) return `满¥${minAmount.toFixed(2)}可用`
      return '无门槛'
    },
    /**
     * 获取优惠券规则摘要文案。
     * @param {Object} coupon 优惠券对象
     * @returns {string}
     * @example
     * this.couponRuleSummaryText(coupon)
     */
    couponRuleSummaryText(coupon) {
      const rule = coupon?.rule || {}
      const discountType = Number(rule.discount_type || 0)
      const discountValue = Number(rule.discount_value || 0)
      const categories = Array.isArray(rule.applicable_categories) ? rule.applicable_categories : []
      const scopeText = categories.includes('ALL') ? '全场商品可用' : '指定分类可用'
      if (discountType === 1) return `${scopeText}，下单可享 ${discountValue}% 优惠`
      return `${scopeText}，下单立减 ¥${discountValue.toFixed(2)}`
    },
    /**
     * 获取优惠券有效期文案。
     * @param {Object} coupon 优惠券对象
     * @returns {string}
     * @example
     * this.couponValidityText(coupon)
     */
    couponValidityText(coupon) {
      const start = String(coupon?.valid_start_time || '').replace('T', ' ').slice(0, 16)
      const end = String(coupon?.valid_end_time || '').replace('T', ' ').slice(0, 16)
      if (start && end) return `${start} - ${end}`
      if (end) return `有效期至 ${end}`
      return '长期可用'
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
      const normalizedSrc = this.normalizeMediaUrl(src)
      if (!normalizedSrc || !this.isM3u8Video(normalizedSrc)) return

      this.$nextTick(() => {
        this.ensureHlsLibrary()
          .then((Hls) => {
            const latestSrc = this.normalizeMediaUrl(this.currentImage)
            if (latestSrc !== normalizedSrc) return

            let el = document.querySelector('#pd-video video') || document.querySelector('#pd-video')
            if (el && el.tagName !== 'VIDEO') el = el.querySelector('video')
            if (!el) return

            if (Hls && Hls.isSupported()) {
              this.hls = new Hls()
              const bust = this.withCacheBust(normalizedSrc)
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
            } else if (el.canPlayType && el.canPlayType('application/vnd.apple.mpegurl')) {
              el.src = this.withCacheBust(normalizedSrc)
            }
          })
          .catch(() => {})
      })
      // #endif
    },
    /**
     * 规范化媒体地址，统一去除空白、引号与无效占位值。
     * @param {string|number|null|undefined} raw 原始媒体地址
     * @returns {string} 清洗后的媒体地址
     * @example
     * const url = this.normalizeMediaUrl(' `https://a.com/demo.mp4` ')
     */
    normalizeMediaUrl(raw) {
      try {
        let s = String(raw ?? '').trim()
        s = s.replace(/`/g, '').trim()
        s = s.replace(/^"+|"+$/g, '')
        s = s.replace(/^'+|'+$/g, '')
        s = s.trim()
        if (!s) return ''
        const lower = s.toLowerCase()
        if (lower === 'null' || lower === 'undefined' || lower === 'none') return ''
        return s
      } catch (e) {
        return ''
      }
    },
    /**
     * 汇总并清洗媒体地址，兼容单值、数组及多个字段来源。
     * @param {...any} sources 可能来自后端不同字段的媒体数据
     * @returns {string[]} 清洗后的媒体地址数组
     * @example
     * const videos = this.collectMediaUrls(data.video, data.video_url)
     */
    collectMediaUrls(...sources) {
      const result = []
      const seen = new Set()
      ;(sources || []).forEach((source) => {
        const list = Array.isArray(source) ? source : [source]
        list.forEach((item) => {
          const url = this.normalizeMediaUrl(item)
          if (url && !seen.has(url)) {
            seen.add(url)
            result.push(url)
          }
        })
      })
      return result
    },
    /**
     * 为媒体地址追加时间戳，避免浏览器或容器读取旧缓存。
     * @param {string} url 原始媒体地址
     * @returns {string} 带时间戳的媒体地址
     * @example
     * const src = this.withCacheBust('https://a.com/demo.mp4')
     */
    withCacheBust(url) {
      const normalized = this.normalizeMediaUrl(url)
      if (!normalized) return ''
      const t = Date.now()
      return normalized.includes('?') ? (normalized + '&t=' + t) : (normalized + '?t=' + t)
    },
    /**
     * 判断当前运行环境是否为 H5。
     * @returns {boolean} H5 返回 true，其它端返回 false
     * @example
     * if (this.isH5Platform()) { ... }
     */
    isH5Platform() {
      try {
        return typeof window !== 'undefined'
      } catch (e) {
        return false
      }
    },
    /**
     * 判断媒体地址是否为 m3u8 视频。
     * @param {string} src 媒体地址
     * @returns {boolean} 是否为 m3u8 视频
     * @example
     * const isHls = this.isM3u8Video(url)
     */
    isM3u8Video(src) {
      const s = this.normalizeMediaUrl(src).toLowerCase()
      return /\.m3u8(\?.*)?$/.test(s)
    },
    /**
     * 判断媒体地址是否为可直接原生播放的 mp4 视频。
     * @param {string} src 媒体地址
     * @returns {boolean} 是否为 mp4 视频
     * @example
     * const isMp4 = this.isMp4Video(url)
     */
    isMp4Video(src) {
      const s = this.normalizeMediaUrl(src).toLowerCase()
      return /\.mp4(\?.*)?$/.test(s)
    },
    isVideo(src) {
      const s = this.normalizeMediaUrl(src).toLowerCase()
      if (!s) return false
      return /\.(mp4|m3u8)(\?.*)?$/.test(s)
    },
    /**
     * 判断当前端是否可以直接播放该视频。
     * - H5 端支持 mp4 与 m3u8。
     * - 非 H5 端仅直接播放 mp4，m3u8 交由降级提示处理。
     * @param {string} src 媒体地址
     * @returns {boolean} 当前端是否可直接播放
     * @example
     * if (this.isPlayableVideo(url)) { ... }
     */
    isPlayableVideo(src) {
      if (!this.isVideo(src)) return false
      if (this.isH5Platform()) return true
      return this.isMp4Video(src)
    },
    /**
     * 获取 H5 端视频节点使用的渲染地址。
     * @param {string} src 媒体地址
     * @param {number} index 当前轮播项索引
     * @returns {string} 可用于 video 标签的 src
     * @example
     * const renderSrc = this.getH5VideoRenderSrc(url, 0)
     */
    getH5VideoRenderSrc(src, index) {
      const normalized = this.normalizeMediaUrl(src)
      if (!this.isVideo(normalized)) return ''
      if (this.isM3u8Video(normalized)) return ''
      return normalized
    },
    /**
     * 获取非 H5 端视频节点使用的渲染地址。
     * @param {string} src 媒体地址
     * @returns {string} 可用于 video 标签的 src
     * @example
     * const renderSrc = this.getMpVideoRenderSrc(url)
     */
    getMpVideoRenderSrc(src) {
      const normalized = this.normalizeMediaUrl(src)
      if (!this.isMp4Video(normalized)) return ''
      return normalized
    },
    /**
     * 处理当前端无法直接播放的视频格式提示。
     * @param {string} src 媒体地址
     * @returns {void}
     * @example
     * this.handleUnsupportedVideo(url)
     */
    handleUnsupportedVideo(src) {
      const tip = this.isM3u8Video(src)
        ? '当前端暂不支持 m3u8 直播流播放，请优先使用 MP4 视频'
        : '当前视频格式暂不支持播放'
      uni.showToast({ title: tip, icon: 'none' })
    },
    onSwiperChange(e) {
      try {
        const idx = (e && e.detail && typeof e.detail.current === 'number') ? e.detail.current : 0
        this.current = idx
        const src = (this.images || [])[idx]
        if (this.isPlayableVideo(src)) {
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
            min_length: it.min_length || '',
            min_specification: it.min_specification || '',
            specification_min: it.specification_min || '',
            length_min: it.length_min || '',
            minimum_length: it.minimum_length || '',
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
        if (this.isVideo(item)) {
          if (!this.isPlayableVideo(item)) this.handleUnsupportedVideo(item)
          return
        }
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
      this.addToCartWithQty()
    },
    incQty() { this.qty = Math.max(1, Number(this.qty || 0) + 1) },
    decQty() { this.qty = Math.max(1, Number(this.qty || 0) - 1) },
    normalizeQty() {
      const n = Number(this.qty)
      this.qty = isNaN(n) ? 1 : Math.max(1, Math.floor(n))
    },
    /**
     * 处理 H5 长度输入框的实时输入，并同步触发上限校验。
     * @param {Object} e 输入事件对象
     * @param {Object} e.detail 输入事件详情
     * @param {string|number} e.detail.value 当前输入值
     * @returns {void}
     * @example
     * onSpecLengthInput({ detail: { value: '3.5' } })
     */
    onSpecLengthInput(e) {
      const value = e?.detail?.value ?? this.specLength
      this.specLength = value
      this.validateSpecLengthLimit(value)
    },
    /**
     * 将长度限制原始值解析为数值。
     * @param {string|number} value 长度限制原始值
     * @returns {number|null} 解析成功返回数值，失败返回 null
     * @example
     * const n = this.parseLengthLimitValue('3.5m')
     */
    parseLengthLimitValue(value) {
      const s = String(value ?? '').trim()
      if (!s) return null
      const matched = s.match(/\d+(\.\d+)?/g)
      if (!matched || !matched.length) return null
      const n = Number(matched[0])
      return isNaN(n) ? null : n
    },
    /**
     * 获取当前规格的长度上下限（兼容后端不同字段命名）。
     * @param {Object|null} spec 当前规格对象
     * @returns {{min:number|null,max:number|null,minText:string,maxText:string}} 规格长度区间
     * @example
     * const limits = this.getSpecLengthLimitRange(this.selectedSpec)
     */
    getSpecLengthLimitRange(spec) {
      const parse = (v) => this.parseLengthLimitValue(v)
      const minRaw = [spec?.min_length, spec?.min_specification, spec?.specification_min, spec?.length_min, spec?.minimum_length].find(v => String(v ?? '').trim() !== '')
      const maxRaw = spec?.specification
      const min = parse(minRaw)
      const max = parse(maxRaw)
      return {
        min: (typeof min === 'number' && !isNaN(min)) ? min : null,
        max: (typeof max === 'number' && !isNaN(max)) ? max : null,
        minText: (minRaw !== undefined && minRaw !== null && String(minRaw).trim() !== '') ? String(minRaw) : ((min === null) ? '' : String(min)),
        maxText: (maxRaw !== undefined && maxRaw !== null && String(maxRaw).trim() !== '') ? String(maxRaw) : ((max === null) ? '' : String(max))
      }
    },
    /**
     * 校验长度是否在当前规格限制区间内，并维护输入框右上角提示气泡。
     * @param {string|number} rawLength 用户输入的长度原始值
     * @returns {boolean} true 表示合法，false 表示不合法
     * @example
     * const ok = this.validateSpecLengthLimit('5')
     */
    validateSpecLengthLimit(rawLength) {
      const spec = (this.selectedSpecIndex >= 0 && this.specs[this.selectedSpecIndex]) ? this.specs[this.selectedSpecIndex] : null
      if (!spec || Number(spec.has_length) !== 1) {
        this.lengthLimitTip = ''
        return true
      }
      const lengthNum = String(rawLength ?? '').replace(/[^0-9.]/g, '')
      if (!lengthNum) {
        this.lengthLimitTip = ''
        return true
      }
      const lengthVal = Number(lengthNum)
      if (isNaN(lengthVal)) {
        this.lengthLimitTip = ''
        return true
      }
      const limits = this.getSpecLengthLimitRange(spec)
      if (limits.min !== null && lengthVal < limits.min) {
        this.lengthLimitTip = '当前长度最短不得少于' + (limits.minText || limits.min)
        return false
      }
      if (limits.max !== null && lengthVal > limits.max) {
        this.lengthLimitTip = '长度不能超过' + (limits.maxText || limits.max)
        return false
      }
      this.lengthLimitTip = ''
      return true
    },
    addToCartWithQty() {
      if (!this.ensureLoggedIn()) return
      const chosen = (this.roomName || '').trim()
      if (!chosen) { uni.showToast({ title: '请先填写房间名', icon: 'none' }); return }
      if (!this.roomId) { uni.showToast({ title: '请先选择房间', icon: 'none' }); return }
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
      if (!this.validateSpecLengthLimit(lengthNum || this.specLength)) return

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
        if (!roomId) {
          uni.showToast({ title: '请先选择房间', icon: 'none' })
          return
        }
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
      let token = ''
      try {
        const u = uni.getStorageSync('user') || null
        token = (u && (u.token || (u.data && u.data.token))) || ''
      } catch (e) {}
      if (!token) {
        this.addresses = []
        this.selectedAddress = null
        return
      }
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
      this.hasUserInteracted = true
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
          this.hasUserInteracted = true
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
      if (!rid) {
        uni.showToast({ title: '请先选择房间', icon: 'none' })
        return
      }

      const lengthNum = (this.mpLength || '').replace(/[^0-9.]/g, '')
      const lengthVal = lengthNum ? Number(lengthNum) : undefined
      const spec = (this.selectedSpecIndex >= 0 && this.specs[this.selectedSpecIndex]) ? this.specs[this.selectedSpecIndex] : null

      const limits = this.getSpecLengthLimitRange(spec)
      if (lengthVal && limits.min !== null && lengthVal < limits.min) {
        uni.showToast({ title: '当前长度最短不得少于' + (limits.minText || limits.min), icon: 'none' })
        return
      }
      if (lengthVal && limits.max !== null && lengthVal > limits.max) {
        uni.showToast({ title: '长度不能超过' + (limits.maxText || limits.max), icon: 'none' })
        return
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

.detail-skeleton {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
  padding: 40rpx;
}

.detail-skeleton-main,
.detail-skeleton-side,
.detail-skeleton-line,
.detail-skeleton-price,
.detail-skeleton-chip,
.detail-skeleton-box,
.detail-skeleton-btn {
  position: relative;
  overflow: hidden;
  background: #2a2a2a;
}

.detail-skeleton-main::after,
.detail-skeleton-side::after,
.detail-skeleton-line::after,
.detail-skeleton-price::after,
.detail-skeleton-chip::after,
.detail-skeleton-box::after,
.detail-skeleton-btn::after {
  content: '';
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0));
  animation: detailSkeletonShimmer 1.4s infinite;
}

.detail-skeleton-main {
  min-height: 980rpx;
  border-radius: 24rpx;
}

.detail-skeleton-side {
  min-height: 760rpx;
  border-radius: 24rpx;
  padding: 36rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.detail-skeleton-line {
  height: 32rpx;
  border-radius: 999rpx;
}

.detail-skeleton-line.w-80 { width: 80%; }
.detail-skeleton-line.w-70 { width: 70%; }
.detail-skeleton-line.w-50 { width: 50%; }

.detail-skeleton-price {
  width: 46%;
  height: 72rpx;
  border-radius: 20rpx;
}

.detail-skeleton-group {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
}

.detail-skeleton-chip {
  height: 104rpx;
  border-radius: 16rpx;
}

.detail-skeleton-box {
  height: 180rpx;
  border-radius: 18rpx;
}

.detail-skeleton-actions {
  display: flex;
  gap: 16rpx;
  margin-top: auto;
}

.detail-skeleton-btn {
  flex: 1;
  height: 88rpx;
  border-radius: 999rpx;
}

.detail-skeleton-btn-light {
  background: #3a3a3a;
}

.detail-skeleton-btn-dark {
  background: #4a4a4a;
}

/* #ifdef H5 */
.detail-skeleton {
  display: grid;
  grid-template-columns: minmax(0, 3fr) minmax(320rpx, 2fr);
}
/* #endif */

@keyframes detailSkeletonShimmer {
  100% {
    transform: translateX(100%);
  }
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

.unsupported-video {
  position: relative;
  overflow: hidden;
}

.unsupported-video-mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  padding: 24rpx;
}

.unsupported-video-icon {
  color: #ffffff;
  font-size: 48rpx;
}

.unsupported-video-text {
  color: #ffffff;
  font-size: 24rpx;
  text-align: center;
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
.product-page.no-scroll {
  height: 100vh;
  overflow: hidden;
}

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

.pd-field-length {
  overflow: visible;
}

.length-input-wrap {
  position: relative;
  flex: none;
  width: 480rpx;
}

.length-input-wrap .pd-input {
  width: 100%;
}

.length-limit-bubble {
  position: absolute;
  right: 0;
  top: -52rpx;
  max-width: 100%;
  padding: 6rpx 14rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
  line-height: 1.2;
  color: #ffffff;
  background: #ff4d4f;
  white-space: nowrap;
  z-index: 10;
}

.length-limit-bubble::after {
  content: '';
  position: absolute;
  right: 16rpx;
  bottom: -10rpx;
  width: 0;
  height: 0;
  border-left: 8rpx solid transparent;
  border-right: 8rpx solid transparent;
  border-top: 10rpx solid #ff4d4f;
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

.coupon-modal-mask {
  position: fixed;
  inset: 0;
  z-index: 10020;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32rpx;
  background: rgba(7, 10, 20, 0.48);
  backdrop-filter: blur(14rpx);
}

.coupon-modal-sheet {
  width: 760rpx;
  max-width: calc(100vw - 64rpx);
  max-height: calc(100vh - 96rpx);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 30rpx;
  background: linear-gradient(180deg, #fffaf6 0%, #ffffff 26%);
  box-shadow: 0 24rpx 60rpx rgba(16, 24, 40, 0.22);
}

.coupon-modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20rpx;
  padding: 32rpx 32rpx 20rpx;
}

.coupon-modal-title-wrap {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.coupon-modal-eyebrow {
  font-size: 22rpx;
  font-weight: 700;
  letter-spacing: 3rpx;
  text-transform: uppercase;
  color: #ff7a45;
}

.coupon-modal-title {
  font-size: 38rpx;
  font-weight: 700;
  line-height: 1.2;
  color: #1f2329;
}

.coupon-modal-subtitle {
  font-size: 24rpx;
  line-height: 1.5;
  color: #8a919f;
}

.coupon-modal-close {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(31, 35, 41, 0.06);
  color: #666f7c;
  font-size: 40rpx;
  line-height: 1;
  flex-shrink: 0;
  cursor: pointer;
}

.coupon-modal-list {
  flex: 1;
  min-height: 0;
  padding: 8rpx 32rpx 0;
  box-sizing: border-box;
}

.coupon-option {
  position: relative;
  display: flex;
  align-items: center;
  gap: 18rpx;
  margin-bottom: 20rpx;
  border-radius: 24rpx;
  cursor: pointer;
  transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;
}

.coupon-option:hover {
  transform: translateY(-2rpx);
}

.coupon-option.active {
  box-shadow: 0 14rpx 30rpx rgba(255, 106, 0, 0.14);
}

.coupon-option-check,
.coupon-card-check {
  flex-shrink: 0;
  min-width: 84rpx;
  height: 48rpx;
  padding: 0 18rpx;
  border-radius: 999rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(31, 35, 41, 0.06);
  color: #667085;
  font-size: 22rpx;
  font-weight: 600;
}

.coupon-option.active .coupon-option-check,
.coupon-option.active .coupon-card-check {
  background: linear-gradient(135deg, #ff8f5a 0%, #ff5a3d 100%);
  color: #ffffff;
}

.coupon-option-card {
  align-items: stretch;
  padding: 0;
  border: 1rpx solid rgba(255, 122, 69, 0.2);
  background: #ffffff;
  overflow: hidden;
}

.coupon-card-amount {
  width: 182rpx;
  min-height: 180rpx;
  padding: 24rpx 18rpx;
  box-sizing: border-box;
  display: flex;
  align-items: baseline;
  justify-content: center;
  background: linear-gradient(180deg, #ff8858 0%, #ff5d3d 100%);
  color: #ffffff;
}

.coupon-card-amount-prefix {
  font-size: 28rpx;
  font-weight: 700;
}

.coupon-card-amount-value {
  font-size: 56rpx;
  font-weight: 800;
  line-height: 1;
}

.coupon-card-amount-suffix {
  font-size: 24rpx;
  margin-left: 4rpx;
  font-weight: 700;
}

.coupon-card-body {
  flex: 1;
  min-width: 0;
  padding: 24rpx 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10rpx;
}

.coupon-card-top {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding-right: 18rpx;
}

.coupon-card-name {
  flex: 1;
  min-width: 0;
  font-size: 30rpx;
  font-weight: 700;
  color: #1f2329;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.coupon-card-tag {
  flex-shrink: 0;
  padding: 4rpx 14rpx;
  border-radius: 999rpx;
  background: rgba(255, 122, 69, 0.12);
  color: #ff6a3d;
  font-size: 20rpx;
  font-weight: 700;
}

.coupon-card-rule,
.coupon-card-validity {
  padding-right: 18rpx;
  font-size: 24rpx;
  line-height: 1.5;
}

.coupon-card-rule {
  color: #4d5761;
}

.coupon-card-validity {
  color: #98a2b3;
}

.coupon-card-check {
  align-self: center;
  margin-right: 22rpx;
}

.coupon-empty-state {
  min-height: 360rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 24rpx 20rpx 32rpx;
}

.coupon-empty-icon {
  width: 96rpx;
  height: 96rpx;
  margin-bottom: 18rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(255, 143, 90, 0.18) 0%, rgba(255, 90, 61, 0.1) 100%);
  color: #ff6a3d;
  font-size: 42rpx;
  font-weight: 800;
}

.coupon-empty-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #1f2329;
}

.coupon-empty-desc {
  max-width: 520rpx;
  margin-top: 10rpx;
  font-size: 24rpx;
  line-height: 1.6;
  color: #98a2b3;
}

.coupon-modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  padding: 24rpx 32rpx 30rpx;
  background: #ffffff;
  border-top: 1rpx solid rgba(15, 23, 42, 0.06);
}

.coupon-modal-footer-text {
  flex: 1;
  min-width: 0;
  font-size: 24rpx;
  color: #667085;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.coupon-modal-btn {
  min-width: 180rpx;
  height: 72rpx;
  padding: 0 28rpx;
  border: none;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #ff8f5a 0%, #ff5a3d 100%);
  color: #ffffff;
  font-size: 28rpx;
  font-weight: 700;
  line-height: 72rpx;
  box-shadow: 0 10rpx 24rpx rgba(255, 106, 61, 0.25);
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

.coupon-modal-mask {
  position: fixed;
  inset: 0;
  z-index: 10020;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32rpx;
  background: rgba(7, 10, 20, 0.56);
}

.coupon-modal-sheet {
  width: 690rpx;
  max-width: calc(100vw - 48rpx);
  max-height: calc(100vh - 120rpx);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 28rpx;
  background: linear-gradient(180deg, #fff9f4 0%, #ffffff 28%);
  box-shadow: 0 20rpx 54rpx rgba(16, 24, 40, 0.24);
}

.coupon-modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20rpx;
  padding: 30rpx 28rpx 18rpx;
}

.coupon-modal-title-wrap {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.coupon-modal-eyebrow {
  font-size: 22rpx;
  font-weight: 700;
  letter-spacing: 3rpx;
  color: #ff7a45;
}

.coupon-modal-title {
  font-size: 36rpx;
  font-weight: 700;
  line-height: 1.2;
  color: #1f2329;
}

.coupon-modal-subtitle {
  font-size: 24rpx;
  line-height: 1.5;
  color: #8a919f;
}

.coupon-modal-close {
  width: 58rpx;
  height: 58rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(31, 35, 41, 0.06);
  color: #667085;
  font-size: 40rpx;
  line-height: 1;
  flex-shrink: 0;
}

.coupon-modal-list {
  flex: 1;
  min-height: 0;
  padding: 8rpx 28rpx 0;
  box-sizing: border-box;
}

.coupon-option {
  position: relative;
  display: flex;
  align-items: center;
  gap: 18rpx;
  margin-bottom: 20rpx;
  border-radius: 24rpx;
}

.coupon-option.active {
  box-shadow: 0 12rpx 26rpx rgba(255, 106, 0, 0.16);
}

.coupon-option-check,
.coupon-card-check {
  flex-shrink: 0;
  min-width: 84rpx;
  height: 48rpx;
  padding: 0 18rpx;
  border-radius: 999rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(31, 35, 41, 0.06);
  color: #667085;
  font-size: 22rpx;
  font-weight: 600;
}

.coupon-option.active .coupon-option-check,
.coupon-option.active .coupon-card-check {
  background: linear-gradient(135deg, #ff8f5a 0%, #ff5a3d 100%);
  color: #ffffff;
}

.coupon-option-card {
  align-items: stretch;
  padding: 0;
  border: 1rpx solid rgba(255, 122, 69, 0.22);
  background: #ffffff;
  overflow: hidden;
}

.coupon-card-amount {
  width: 176rpx;
  min-height: 176rpx;
  padding: 22rpx 16rpx;
  box-sizing: border-box;
  display: flex;
  align-items: baseline;
  justify-content: center;
  background: linear-gradient(180deg, #ff8858 0%, #ff5d3d 100%);
  color: #ffffff;
}

.coupon-card-amount-prefix {
  font-size: 28rpx;
  font-weight: 700;
}

.coupon-card-amount-value {
  font-size: 54rpx;
  font-weight: 800;
  line-height: 1;
}

.coupon-card-amount-suffix {
  margin-left: 4rpx;
  font-size: 24rpx;
  font-weight: 700;
}

.coupon-card-body {
  flex: 1;
  min-width: 0;
  padding: 24rpx 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10rpx;
}

.coupon-card-top {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding-right: 16rpx;
}

.coupon-card-name {
  flex: 1;
  min-width: 0;
  font-size: 30rpx;
  font-weight: 700;
  color: #1f2329;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.coupon-card-tag {
  flex-shrink: 0;
  padding: 4rpx 14rpx;
  border-radius: 999rpx;
  background: rgba(255, 122, 69, 0.12);
  color: #ff6a3d;
  font-size: 20rpx;
  font-weight: 700;
}

.coupon-card-rule,
.coupon-card-validity {
  padding-right: 16rpx;
  font-size: 24rpx;
  line-height: 1.5;
}

.coupon-card-rule {
  color: #4d5761;
}

.coupon-card-validity {
  color: #98a2b3;
}

.coupon-card-check {
  align-self: center;
  margin-right: 18rpx;
}

.coupon-empty-state {
  min-height: 340rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 24rpx 20rpx 32rpx;
}

.coupon-empty-icon {
  width: 96rpx;
  height: 96rpx;
  margin-bottom: 18rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(255, 143, 90, 0.18) 0%, rgba(255, 90, 61, 0.1) 100%);
  color: #ff6a3d;
  font-size: 42rpx;
  font-weight: 800;
}

.coupon-empty-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #1f2329;
}

.coupon-empty-desc {
  max-width: 500rpx;
  margin-top: 10rpx;
  font-size: 24rpx;
  line-height: 1.6;
  color: #98a2b3;
}

.coupon-modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  padding: 22rpx 28rpx calc(24rpx + env(safe-area-inset-bottom));
  background: #ffffff;
  border-top: 1rpx solid rgba(15, 23, 42, 0.06);
}

.coupon-modal-footer-text {
  flex: 1;
  min-width: 0;
  font-size: 24rpx;
  color: #667085;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.coupon-modal-btn {
  min-width: 180rpx;
  height: 72rpx;
  padding: 0 28rpx;
  border: none;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #ff8f5a 0%, #ff5a3d 100%);
  color: #ffffff;
  font-size: 28rpx;
  font-weight: 700;
  line-height: 72rpx;
  box-shadow: 0 10rpx 24rpx rgba(255, 106, 61, 0.25);
}

.coupon-modal-btn::after {
  border: none;
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
