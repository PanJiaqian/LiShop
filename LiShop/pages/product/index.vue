<template>
  <view class="page product-page" :class="{ 'no-scroll': mpSheet || roomSelectorVisible }" v-if="product">
    <!-- #ifdef H5 -->
    <view class="pd-grid">
      <!-- 左侧：可滚动，包含画廊 + 参数 + 图文详情 -->
      <view class="pd-left">
        <view class="pd-gallery">
          <video id="pd-video" v-if="isVideo(currentImage)" class="pd-main" :src="videoSrc" :poster="currentImage" :controls="true" :autoplay="false" playsinline webkit-playsinline crossorigin="anonymous" object-fit="contain" />
          <image v-else class="pd-main" :src="currentImage" mode="aspectFill" />
          <view class="pd-thumbs">
            <view v-for="(src, i) in images" :key="i" class="pd-thumb" :class="{ active: i === current }" @click="current = i" style="position: relative; overflow: hidden;">
              <image :src="isVideo(src) ? (product.image || '/static/logo.png') : src" mode="aspectFill" style="width: 100%; height: 100%; display: block;" />
              <view v-if="isVideo(src)" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
                <text style="color: #fff; font-size: 12px;">▶</text>
              </view>
            </view>
          </view>
        </view>

        <view class="pd-card pd-params">
          <text class="pd-section-title">参数信息</text>
          <view class="pd-param-grid">
            <view class="pd-param-item"><text class="key">型号</text><text class="val">{{ product.id || '默认款' }}</text></view>
            <view class="pd-param-item"><text class="key">名称</text><text class="val">{{ product.title }}</text></view>
            <view class="pd-param-item"><text class="key">规格</text><text class="val">默认规格</text></view>
            <view class="pd-param-item"><text class="key">产地</text><text class="val">{{ product.shipping_origin ? product.shipping_origin.replace(/省|市/g, '') : '—' }}</text></view>
            <view class="pd-param-item"><text class="key">单位</text><text class="val">件</text></view>
            <view class="pd-param-item"><text class="key">价格</text><text class="val">¥{{ product.price.toFixed(2) }}</text></view>
            <view class="pd-param-item"><text class="key">发货</text><text class="val">{{ product.shipping_time_hours ? (product.shipping_time_hours + '小时') : '待定' }}</text></view>
            <view class="pd-param-item"><text class="key">售后</text><text class="val">{{ product.support_no_reason_return_7d ? '七天无理由' : '无' }}</text></view>
          </view>
        </view>

        <view class="pd-card pd-detail">
          <text class="pd-section-title">图文详情</text>
          <image v-for="(src, i) in product.details_images" :key="'d' + i" class="pd-detail-img" :src="src" mode="widthFix" />
        </view>
      </view>

      <!-- 右侧：保持现有信息与按钮，不做其它改动 -->
      <view class="pd-right">
        <view class="pd-info">
          <text class="pd-title">{{ product.title }}</text>
          <view class="pd-price-row">
            <text class="pd-price">¥{{ product.price.toFixed(2) }}</text>
            <text class="pd-coupon">券后更低</text>
          </view>
          <view class="pd-meta">
            <text>{{ product.is_free_shipping ? '包邮' : '不包邮' }} ｜ {{ product.shipping_time_hours ? (product.shipping_time_hours + '小时内发货') : '发货时间待定' }} ｜ {{ product.support_no_reason_return_7d ? '七天无理由' : '不支持七天无理由' }}</text>
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
                    <text class="spec-price">¥{{ Number(it.price).toFixed(2) }}</text>
                    <text v-if="Number(it.original_price) > 0" class="spec-oprice">¥{{
                      Number(it.original_price).toFixed(2) }}</text>
                  </view>
                  <text class="spec-unit">单位：{{ it.unit || '—' }}</text>
                </view>
              </view>
            </view>
            <view v-else><text class="pd-meta">暂无规格数据</text></view>
          </view>

          <view class="pd-form">
            <view class="pd-field inline">
              <text class="label">房间</text>
              <view class="picker-display" @click="openRoomSheet">{{ roomName || '请选择房间' }}</view>
            </view>
            <!-- <view class="pd-field inline">
              <text class="label">色温</text>
              <input class="pd-input" v-model="specTemp" placeholder="如 3000K / 4000K" />
            </view> -->
            <view class="pd-field inline" v-if="selectedSpec && selectedSpec.has_length === 1">
              <text class="label">长度</text>
              <input class="pd-input" v-model="specLength" placeholder="填写阿拉伯数字" />
              <text v-if="selectedSpec.specification" style="font-size: 24rpx; color: #ff2d55; margin-left: 12rpx;">最长：{{ selectedSpec.specification }}</text>
            </view>
          </view>

          <view class="pd-qty">
            <text class="label">数量</text>
            <view class="qty-box">
              <view class="qty-btn" @click="decQty">-</view>
              <text class="qty-num">{{ qty }}</text>
              <view class="qty-btn" @click="incQty">+</view>
            </view>
          </view>

          <view class="pd-actions">
            <button class="btn-buy" @click="buyNow">立即购买</button>
            <button class="btn-cart" @click="addToCartWithQty">加入购物车</button>
          </view>
        </view>
      </view>
    </view>
    <!-- #endif -->

    <!-- #ifndef H5 -->
    <swiper class="cover" indicator-dots autoplay circular interval="3000">
      <swiper-item v-for="(item, index) in images" :key="index">
        <video v-if="isVideo(item)" :src="item" controls style="width: 100%; height: 100%;" object-fit="contain"></video>
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
        <view class="mp-param-item"><text class="key">型号</text><text class="val">{{ product.id || '默认款' }}</text></view>
        <view class="mp-param-item"><text class="key">名称</text><text class="val">{{ product.title }}</text></view>
        <view class="mp-param-item"><text class="key">规格</text><text class="val">默认规格</text></view>
        <view class="mp-param-row-inline">
          <view class="mp-param-item inline"><text class="key">产地</text><text class="val">{{ product.shipping_origin ? product.shipping_origin.replace(/省|市/g, '') :
              '—' }}</text></view>
          <view class="mp-param-item inline"><text class="key">单位</text><text class="val">件</text></view>
          <view class="mp-param-item inline"><text class="key">单位价格</text><text class="val">¥{{ product.price.toFixed(2)
              }}</text></view>
        </view>
      </view>
    </view>
    <view class="mp-section">
      <text class="mp-title">图文详情</text>
      <image v-for="(src, i) in product.details_images" :key="'md' + i" class="mp-detail-img" :src="src" mode="widthFix" />
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
    <view v-if="mpSheet" class="mp-mask" @click="closeSpecSheet" catchtouchmove="true" @touchmove.stop.prevent="() => { }">
      <view class="mp-sheet" @click.stop>
        <view class="mp-title">填写规格</view>
        <scroll-view scroll-y class="mp-scroll-view">
          <!-- 规格明细（适配 data.children），参考淘宝/京东样式 -->
          <view class="mp-title">规格明细</view>
          <view v-if="specsLoading" class="mp-param-grid">
            <view class="mp-param-item"><text class="key">加载中...</text><text class="val"></text></view>
          </view>
          <view v-else-if="specs && specs.length" class="specs-list">
            <view class="spec-item" v-for="(it, i) in (isSpecsCollapsed ? specs.slice(0, 2) : specs)" :key="'mpsp' + i"
              :class="{ active: selectedSpecIndex === i }" @click="selectSpec(i)">
              <image class="spec-thumb" :src="it.image_url || '/static/logo.png'" mode="aspectFill" />
              <view class="spec-info">
                <text class="spec-name">{{ it.name }}</text>
                <view class="spec-price-row">
                  <text class="spec-price">¥{{ Number(it.price).toFixed(2) }}</text>
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
            <input class="mp-input" v-model="mpLength" placeholder="填写阿拉伯数字" />
            <text v-if="selectedSpec.specification" style="font-size: 24rpx; color: #ff2d55; margin-left: 12rpx; white-space: nowrap;">最长：{{ selectedSpec.specification }}</text>
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
    <RoomSelector
      :visible="roomSelectorVisible"
      :rooms="roomsRaw"
      :selectedName="roomSelectorMode === 'mp' ? mpRoom : roomName"
      @close="closeRoomSheet"
      @select="onRoomSelect"
      @create="onRoomCreate"
    />
  </view>
</template>

<script>
import { getProductDetail, getProductSpecs, getRooms, createRoom, addCartItem } from '../../api/index.js'
import RoomSelector from '../../components/RoomSelector.vue'

export default {
  components: { RoomSelector },
  data() { return { hls: null, product: null, current: 0, qty: 1, specTemp: '', specLength: '', roomName: '', roomId: '', roomsRaw: [], mpSheet: false, mpRoomSheet: false, mpTemp: '', mpLength: '', mpRoom: '', mpQty: 1, specs: [], specsLoading: false, roomSheet: false, roomsList: [], roomInput: '', selectedSpecIndex: -1, isSpecsCollapsed: true, lockScroll: false, lockScrollTop: 0, roomSelectorVisible: false, roomSelectorMode: 'h5' } },
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
  methods: {
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
        try { el.setAttribute('crossorigin', 'anonymous') } catch (e) {}

        if (window.Hls && Hls.isSupported()) {
          this.hls = new Hls()
          this.hls.loadSource(src)
          this.hls.attachMedia(el)
          this.hls.on(Hls.Events.ERROR, (event, data) => {
            if (data && data.fatal) {
              try { this.hls.destroy() } catch (e) {}
              this.hls = null
              try { uni.showToast({ title: '视频资源未找到', icon: 'none' }) } catch (e) {}
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
            price: Number(it.price ?? 0) || 0,
            original_price: Number(it.original_price ?? 0) || 0,
            image_url: clean(it.image_url) || '',
            inventory: it.inventory || 0,
            has_length: it.has_length || 0,
            specification: it.specification || ''
          }))
        })
        .catch(() => { this.specs = [] })
        .finally(() => { this.specsLoading = false; this.selectedSpecIndex = -1 })
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
          else uni.showToast({ title: res?.message || '加入失败', icon: 'none' })
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
          else uni.showToast({ title: res?.message || '加入失败', icon: 'none' })
        })
        .catch(() => { uni.showToast({ title: '加入购物车失败', icon: 'none' }) })
    },
    buyNow() { uni.showToast({ title: '暂未接入下单', icon: 'none' }) },
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

    onRoomSelect(room) {
      if (this.roomSelectorMode === 'mp') {
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
          if (this.roomSelectorMode === 'mp') {
            this.mpRoom = name
          } else {
            this.roomName = name
            // Try to find ID if returned, otherwise leave empty or refetch
            // For now, just set name as per old logic
          }
          this.roomSelectorVisible = false
          this.fetchRooms()
        })
        .catch(() => {
          uni.showToast({ title: '创建房间失败', icon: 'none' })
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
            uni.showToast({ title: res?.message || '加入失败', icon: 'none' })
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
    closeMpRoomSheet() { this.roomSelectorVisible = false; this.lockScroll = false },
  }
}
</script>

<style scoped>
.page {
  background: #f7f7f7;
  min-height: 100vh;
  padding-bottom: 120rpx;
}

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
  color: #e1251b;
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
  background: #ff5500;
  color: #fff;
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
  background: #fafafa;
  transition: all .2s;
}

.spec-item.active {
  border-color: #ff5500;
  background: #fff5f0;
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
  color: #e1251b;
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

.pd-grid {
  display: grid;
  grid-template-columns: 3fr 2fr;
  grid-gap: 24rpx;
  padding: 20rpx 160rpx;
  height: calc(100vh - 40rpx);
  align-items: start;
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

.pd-left,
.pd-right {
  height: 100%;
}

/* 右侧卡片置顶且自适应高度，仅影响 H5 */
.pd-right {
  height: auto;
  position: sticky;
  top: 20rpx;
  align-self: start;
}

.pd-left {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  padding-right: 6rpx;
}

.pd-gallery {
  background: #fff;
  border-radius: 12rpx;
  padding: 20rpx;
  position: relative;
}

.pd-main {
  width: 100%;
  height: 520rpx;
  border-radius: 8rpx;
  background: #f5f5f5;
}

.pd-thumbs {
  position: absolute;
  left: 20rpx;
  top: 20rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  margin-left: 30rpx;
}

.pd-thumb {
  width: 88rpx;
  height: 88rpx;
  border-radius: 8rpx;
  background: #f5f5f5;
  border: 1rpx solid #eee;
}

.pd-thumb.active {
  outline: 3rpx solid #ff5500;
}

.pd-card {
  background: #fff;
  border-radius: 12rpx;
  padding: 20rpx;
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
  background: #fafafa;
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
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 8rpx 28rpx rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  gap: 20rpx;
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
.pd-param-item { display: inline-flex; align-items: center; gap: 8rpx; white-space: nowrap; }
.pd-param-item .key, .pd-param-item .val { white-space: nowrap; }
.pd-param-item.inline-params { display: inline-flex; align-items: center; gap: 16rpx; }
.pd-param-item.inline-params .sub-item { display: inline-flex; align-items: center; gap: 8rpx; white-space: nowrap; }
.pd-param-item.inline-params .sub-item .val { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 40vw; }

.picker-display {
  flex: 1;
  min-height: 64rpx;
  line-height: 64rpx;
  background: #f7f7f7;
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
  background: #f7f7f7;
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

.pd-title {
  font-size: 40rpx;
  color: #222;
  font-weight: 700;
  display: block;
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
  background: #fff2e8;
  color: #ff7b2b;
  padding: 8rpx 12rpx;
  border-radius: 6rpx;
  font-size: 24rpx;
}

.pd-meta {
  color: #777;
  font-size: 24rpx;
  margin-top: 12rpx;
}

.pd-qty {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20rpx;
  padding: 12rpx;
  background: #fafafa;
  border: 1rpx solid #eee;
  border-radius: 10rpx;
}

.pd-qty .label {
  color: #333;
  margin-right: 16rpx;
}

.qty-stepper {
  display: flex;
  align-items: center;
}

.qty-stepper .step {
  width: 56rpx;
  height: 56rpx;
  border-radius: 10rpx;
  background: #fff;
  border: 1rpx solid #ddd;
  color: #333;
}

.qty-stepper .count {
  width: 80rpx;
  text-align: center;
}

.pd-actions {
  display: flex;
  gap: 16rpx;
  margin-top: 24rpx;
}

.btn-buy {
  flex: 0 0 220rpx;
  background: linear-gradient(135deg, #ff6a00, #ff2d55);
  color: #fff;
  border-radius: 10rpx;
}

.pd-info .btn-cart {
  flex: 1;
  background: #ff8c3a;
  color: #fff;
  border-radius: 10rpx;
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
.mp-scroll-view::-webkit-scrollbar { width: 0; height: 0; display: none; }

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
  background: linear-gradient(135deg, #ff6a00, #ff2d55);
  color: #fff;
  box-shadow: 0 6rpx 16rpx rgba(255, 106, 0, 0.35);
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
</style>
