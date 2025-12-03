<template>
  <view class="page product-page" v-if="product">
    <!-- #ifdef H5 -->
    <view class="pd-grid">
      <!-- 左侧：可滚动，包含画廊 + 参数 + 图文详情 -->
      <view class="pd-left">
        <view class="pd-gallery">
          <image class="pd-main" :src="currentImage" mode="aspectFill" />
          <view class="pd-thumbs">
            <image v-for="(src, i) in images" :key="i" class="pd-thumb" :src="src" mode="aspectFill"
              :class="{ active: i === current }" @click="current = i" />
          </view>
        </view>

        <view class="pd-card pd-params">
          <text class="pd-section-title">参数信息</text>
          <view class="pd-param-grid">
            <view class="pd-param-item"><text class="key">型号</text><text class="val">{{ product.id || '默认款' }}</text>
            </view>
            <view class="pd-param-item"><text class="key">名称</text><text class="val">{{ product.title }}</text></view>
            <view class="pd-param-item"><text class="key">规格</text><text class="val">默认规格</text></view>
            <view class="pd-param-item inline-params">
              <view class="sub-item"><text class="key">产地</text><text class="val">{{ product.shipping_origin || '—' }}</text></view>
              <view class="sub-item"><text class="key">单位</text><text class="val">件</text></view>
              <view class="sub-item"><text class="key">单位价格</text><text class="val">¥{{ product.price.toFixed(2) }}</text></view>
            </view>
          </view>
        </view>

        <view class="pd-card pd-detail">
          <text class="pd-section-title">图文详情</text>
          <image v-for="(src, i) in images" :key="'d' + i" class="pd-detail-img" :src="src" mode="widthFix" />
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
            <text>包邮 ｜ 48小时内发货 ｜ 七天无理由</text>
          </view>

          <view>
            <text class="pd-section-title">规格明细</text>
            <view v-if="specsLoading"><text class="pd-meta">加载中...</text></view>
            <view v-else-if="specs && specs.length" class="specs-list">
              <view class="spec-item" v-for="(it,i) in specs" :key="'h5sp'+i" :class="{ active: selectedSpecIndex === i }" @click="selectSpec(i)">
                <image class="spec-thumb" :src="it.image_url || '/static/logo.png'" mode="aspectFill" />
                <view class="spec-info">
                  <text class="spec-name">{{ it.name }}</text>
                  <view class="spec-price-row">
                    <text class="spec-price">¥{{ Number(it.price).toFixed(2) }}</text>
                    <text v-if="Number(it.original_price) > 0" class="spec-oprice">¥{{ Number(it.original_price).toFixed(2) }}</text>
                  </view>
                  <text class="spec-unit">单位：{{ it.unit || '—' }}</text>
                </view>
              </view>
            </view>
            <view v-else><text class="pd-meta">暂无规格数据</text></view>
          </view>

          <view class="pd-form">
            <view class="pd-field inline">
              <text class="label">房间名</text>
              <view class="picker-display" @click="openRoomSheet">{{ roomName || '请选择房间' }}</view>
            </view>
            <view class="pd-field inline">
              <text class="label">色温</text>
              <input class="pd-input" v-model="specTemp" placeholder="如 3000K / 4000K" />
            </view>
            <view class="pd-field inline">
              <text class="label">长度</text>
              <input class="pd-input" v-model="specLength" placeholder="如 1m / 2m" />
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

          <!-- 房间选择弹窗（H5） -->
          <view v-if="roomSheet" class="h5-mask" @click="closeRoomSheet">
            <view class="h5-sheet" @click.stop>
              <view class="h5-title">选择房间</view>
              <view class="pd-field inline">
                <text class="label">新房间名</text>
                <input class="pd-input" v-model="roomInput" placeholder="输入新的房间名" />
              </view>
              <view class="rooms-list" v-if="roomsList && roomsList.length">
                <text class="rooms-title">已保存房间</text>
                <view class="rooms-grid">
                  <view class="room-item" v-for="(name,i) in roomsList" :key="'r'+i" @click="roomInput = name">
                    <text class="room-name">{{ name }}</text>
                  </view>
                </view>
              </view>
              <view class="h5-actions">
                <button class="h5-btn ghost" @click="closeRoomSheet">取消</button>
                <button class="h5-btn primary" @click="confirmRoomSelect">确定</button>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
    <!-- #endif -->

    <!-- #ifndef H5 -->
    <image class="cover" :src="product.image || '/static/logo.png'" mode="aspectFill" />
    <view class="info">
      <text class="title">{{ product.title }}</text>
      <text class="price">¥{{ product.price.toFixed(2) }}</text>
      <text class="sales">销量 {{ product.sales }}</text>
    </view>
    <!-- MP 端参数信息与图文详情 -->
    <view class="mp-section">
      <text class="mp-title">参数信息</text>
      <view class="mp-param-grid">
        <view class="mp-param-item"><text class="key">型号</text><text class="val">{{ product.id || '默认款' }}</text></view>
        <view class="mp-param-item"><text class="key">名称</text><text class="val">{{ product.title }}</text></view>
        <view class="mp-param-item"><text class="key">产地</text><text class="val">{{ product.shipping_origin || '—' }}</text></view>
        <view class="mp-param-item"><text class="key">规格</text><text class="val">默认规格</text></view>
        <view class="mp-param-item"><text class="key">单位</text><text class="val">件</text></view>
        <view class="mp-param-item"><text class="key">单位价格</text><text class="val">¥{{ product.price.toFixed(2)
        }}</text></view>
      </view>
    </view>
    <view class="mp-section">
      <text class="mp-title">图文详情</text>
      <image v-for="(src, i) in images" :key="'md' + i" class="mp-detail-img" :src="src" mode="widthFix" />
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
    <view v-if="mpSheet" class="mp-mask" @click="closeSpecSheet" @touchmove.stop.prevent="() => {}">
      <view class="mp-sheet" @click.stop>
        <view class="mp-title">填写规格</view>
        <scroll-view scroll-y class="mp-scroll-view">
        <!-- 规格明细（适配 data.children），参考淘宝/京东样式 -->
        <view class="mp-title">规格明细</view>
        <view v-if="specsLoading" class="mp-param-grid">
          <view class="mp-param-item"><text class="key">加载中...</text><text class="val"></text></view>
        </view>
        <view v-else-if="specs && specs.length" class="specs-list">
          <view class="spec-item" v-for="(it,i) in (isSpecsCollapsed ? specs.slice(0, 2) : specs)" :key="'mpsp'+i" :class="{ active: selectedSpecIndex === i }" @click="selectSpec(i)">
            <image class="spec-thumb" :src="it.image_url || '/static/logo.png'" mode="aspectFill" />
            <view class="spec-info">
              <text class="spec-name">{{ it.name }}</text>
              <view class="spec-price-row">
                <text class="spec-price">¥{{ Number(it.price).toFixed(2) }}</text>
                <text v-if="Number(it.original_price) > 0" class="spec-oprice">¥{{ Number(it.original_price).toFixed(2) }}</text>
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
        <view class="mp-field"><text class="label">房间名</text><view class="mp-input" @click="openMpRoomSheet">{{ mpRoom || '请选择房间' }}</view></view>
        <view class="mp-field"><text class="label">色温</text><input class="mp-input" v-model="mpTemp"
            placeholder="如 3000K" /></view>
        <view class="mp-field"><text class="label">长度</text><input class="mp-input" v-model="mpLength"
            placeholder="如 2m" /></view>
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
    <view v-if="mpRoomSheet" class="mp-mask" style="z-index: 10000;" @click="closeMpRoomSheet" @touchmove.stop.prevent="() => {}">
      <view class="mp-sheet room-sheet" @click.stop>
        <view class="mp-title">选择房间</view>
        <view class="mp-field">
            <text class="label">新房间名</text>
            <input class="mp-input" v-model="roomInput" placeholder="输入新的房间名" />
        </view>
        <scroll-view scroll-y class="mp-scroll-view">
            <view class="rooms-list" v-if="roomsList && roomsList.length">
                <text class="rooms-title">已保存房间</text>
                <view class="rooms-grid">
                  <view class="room-item" v-for="(name,i) in roomsList" :key="'mpr'+i" @click="roomInput = name">
                      <text class="room-name">{{ name }}</text>
                  </view>
                </view>
            </view>
        </scroll-view>
        <view class="mp-actions">
          <button class="mp-btn ghost" @click="closeMpRoomSheet">取消</button>
          <button class="mp-btn primary" @click="confirmMpRoomSelect">确定</button>
        </view>
      </view>
    </view>
    <!-- #endif -->
    <!-- #endif -->
  </view>
</template>

<script>
import { getProductDetail, getProductSpecs, getRooms, createRoom, addCartItem } from '../../api/index.js'
export default {
  data() { return { product: null, current: 0, qty: 1, specTemp: '', specLength: '', roomName: '', roomId: '', roomsRaw: [], mpSheet: false, mpRoomSheet: false, mpTemp: '', mpLength: '', mpRoom: '', mpQty: 1, specs: [], specsLoading: false, roomSheet: false, roomsList: [], roomInput: '', selectedSpecIndex: -1, isSpecsCollapsed: true } },
  onLoad(query) {
    const id = decodeURIComponent(query?.id || '')
    if (!id) { this.product = { id: '', title: '商品', price: 0, sales: 0, image: '/static/logo.png', images: ['/static/logo.png'] }; return }
    getProductDetail({ available_product_id: id })
      .then((res) => {
        const d = res?.data || {}
        const clean = (u) => typeof u === 'string' ? u.replace(/`/g, '').trim() : ''
        const arr = (x) => Array.isArray(x) ? x.map(clean).filter(Boolean) : []
        const main = arr(d.main_image)
        const imgs = arr(d.images)
        const price = Number(d.price ?? 0) || 0
        const base = {
          id: d.available_product_id || id,
          title: d.name || ('商品 ' + id),
          price,
          sales: 0,
          shipping_origin: clean(d.shipping_origin) || '',
          image: main[0] || '/static/logo.png',
          images: imgs.length ? imgs : (main.length ? main : ['/static/logo.png'])
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
      const imgs = (this.product && this.product.images) || []
      return imgs.length ? imgs : [this.product?.image || '/static/logo.png']
    },
    currentImage() {
      const arr = this.images
      return arr[this.current] || arr[0]
    }
  },
  methods: {
    // 获取规格明细（按产品ID），适配返回 data.children
    fetchSpecs(availId) {
      if (!availId) return
      this.specsLoading = true
      const clean = (u) => typeof u === 'string' ? u.replace(/`/g, '').trim() : ''
      getProductSpecs({ available_product_id: availId })
        .then((res) => {
          const children = (res && res.data && Array.isArray(res.data.children)) ? res.data.children : (Array.isArray(res?.children) ? res.children : [])
          this.specs = (children || []).map((it) => ({
            product_id: it.product_id || '',
            name: it.name || '',
            unit: it.unit || '',
            price: Number(it.price ?? 0) || 0,
            original_price: Number(it.original_price ?? 0) || 0,
            image_url: clean(it.image_url) || ''
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
    },
    closeSpecSheet() { this.mpSheet = false },
    // H5 房间选择弹窗
    openRoomSheet() {
      this.roomInput = (this.roomName || '')
      this.roomSheet = true
      // 通过接口获取房间列表
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
    closeRoomSheet() { this.roomSheet = false },
    confirmRoomSelect() {
      const name = (this.roomInput || '').trim()
      if (!name) { uni.showToast({ title: '请填写房间名', icon: 'none' }); return }
      const isNew = !this.roomsList.includes(name)
      if (isNew) {
        // 输入了新的房间名：调用创建接口
        createRoom({ name })
          .then(() => {
            this.roomName = name
            this.roomSheet = false
            uni.showToast({ title: '房间已创建', icon: 'success' })
          })
          .catch(() => {
            uni.showToast({ title: '创建房间失败', icon: 'none' })
          })
      } else {
        // 已存在：直接选择
        this.roomName = name
        const found = (this.roomsRaw || []).find(it => it.name === name)
        this.roomId = found ? found.id : ''
        this.roomSheet = false
      }
    },
    confirmSpecToCart() {
      if (!this.mpRoom || !this.mpTemp || !this.mpLength || !this.mpQty) {
        uni.showToast({ title: '请填写房间名、色温、长度、数量', icon: 'none' })
        return
      }
      const chosen = (this.mpRoom || '').trim()
      const found = (this.roomsRaw || []).find(it => it.name === chosen)
      const rid = found ? found.id : ''

      const lengthNum = (this.mpLength || '').replace(/[^0-9.]/g, '')
      const lengthVal = lengthNum ? Number(lengthNum) : undefined
      const spec = (this.selectedSpecIndex >= 0 && this.specs[this.selectedSpecIndex]) ? this.specs[this.selectedSpecIndex] : null
      const pid = spec ? spec.product_id : (this.product?.id || '')
      addCartItem({ room_id: rid, room_name: chosen, product_id: pid, length: lengthVal, quantity: this.mpQty, color: this.mpTemp || '', note: '' })
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
      this.roomInput = (this.mpRoom || '')
      this.mpRoomSheet = true
      // Reuse fetch rooms logic
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
    closeMpRoomSheet() { this.mpRoomSheet = false },
    confirmMpRoomSelect() {
      const name = (this.roomInput || '').trim()
      if (!name) { uni.showToast({ title: '请填写房间名', icon: 'none' }); return }
      const isNew = !this.roomsList.includes(name)
      if (isNew) {
        createRoom({ name })
          .then(() => {
            this.mpRoom = name
            this.mpRoomSheet = false
            uni.showToast({ title: '房间已创建', icon: 'success' })
          })
          .catch(() => {
            uni.showToast({ title: '创建房间失败', icon: 'none' })
          })
      } else {
        this.mpRoom = name
        this.mpRoomSheet = false
      }
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
.toggle-icon { margin-left: 8rpx; font-size: 20rpx; }

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
.room-name { color: #333; font-size: 28rpx; }

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
  display: flex;
  justify-content: space-between;
  gap: 10rpx;
  padding: 10rpx;
}

.pd-param-item.inline-params .sub-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10rpx;
}

/* Qty Stepper matching cart */
.qty-box {
  display: flex;
  align-items: center;
  background: #f7f7f7;
  border-radius: 6rpx;
  height: 44rpx;
}
.qty-btn { width: 44rpx; height: 44rpx; display: flex; align-items: center; justify-content: center; color: #333; font-size: 28rpx; cursor: pointer; }
.qty-num { padding: 0 12rpx; font-size: 24rpx; color: #333; }

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
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  background: #fafafa;
  border-radius: 10rpx;
}

.pd-param-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  border: none;
  padding: 10rpx;
}

.pd-param-item .key {
  color: #666;
  font-size: 24rpx;
}

.pd-param-item .val {
  color: #333;
  font-size: 26rpx;
  margin-top: 0rpx;
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

/* H5 规格列表左图右文排版：一行三列 */
.specs-list { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); grid-gap: 12rpx; }
.spec-item { flex-direction: row; align-items: center; box-shadow: 0 6rpx 16rpx rgba(0,0,0,0.05); }
.spec-thumb { width: 120rpx; height: 120rpx; }
.spec-info { flex: 1; }
.spec-price-row { justify-content: flex-start; gap: 10rpx; }

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

.picker-display {
  flex: 1;
  min-height: 64rpx;
  line-height: 64rpx;
  background: #f7f7f7;
  border: 1rpx solid #e5e5e5;
  border-radius: 10rpx;
  padding: 0 14rpx;
  color: #666;
  max-width: 20%;
}

.pd-input {
  width: 100%;
  height: 64rpx;
  line-height: 64rpx;
  background: #f7f7f7;
  border: 1rpx solid #e5e5e5;
  border-radius: 10rpx;
  padding: 0 14rpx;
  max-width: 25%;
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
  left: 0; right: 0; top: 0; bottom: 0;
  background: rgba(0,0,0,.45);
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
  box-shadow: 0 12rpx 28rpx rgba(0,0,0,0.12);
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
.h5-btn { flex: 1; height: 72rpx; border-radius: 999rpx; font-size: 28rpx; }
.h5-btn.ghost { background: #f7f7f7; color: #333; border: 1rpx solid #e6e6e6; }
.h5-btn.primary { background: linear-gradient(135deg, #ff6a00, #ff2d55); color: #fff; box-shadow: 0 6rpx 16rpx rgba(255,106,0,0.35); }

/* #endif */

/* #ifdef MP-WEIXIN */
.mp-mask {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgba(0, 0, 0, .55);
  display: flex;
  align-items: flex-end; /* 底部弹窗 */
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
  box-shadow: 0 -8rpx 24rpx rgba(0,0,0,0.08);
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
}

.mp-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #333;
  padding-bottom: 12rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.mp-field {
  display: flex;
  align-items: center;
  justify-content: space-between;
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
  margin-top: auto; /* 固定在底部 */
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
  box-shadow: 0 6rpx 16rpx rgba(255,106,0,0.35);
}

/* 使数量步进器横向排列 */
.mp-sheet .qty-stepper {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12rpx;
}

/* 淘宝风格：步进器在弹窗内的样式适配 */
.mp-sheet .qty-stepper .step {
  width: 56rpx;
  height: 56rpx;
  border-radius: 12rpx;
  background: #fff;
  border: 1rpx solid #ddd;
}
.mp-sheet .qty-stepper .count {
  width: 80rpx;
  text-align: center;
}

@keyframes mpSlideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
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
</style>
