<template>
  <view class="rs-mask" v-if="visible" @click="close" catchtouchmove="true">
    <view class="rs-content" @click.stop>
      <view class="rs-header">
        <text class="rs-title" v-if="isAddressMode">选择地址</text>
        <text class="rs-title" v-else>选择房间</text>
        <view class="rs-close" @click="close">×</view>
      </view>
      
      <scroll-view scroll-y class="rs-body">
        <view v-if="isAddressMode && rooms.length === 0" class="addr-empty-tip">暂无收货地址，去创建吧</view>
        <view class="rs-create" v-if="!isAddressMode">
          <text class="rs-subtitle">新建房间</text>
          <view class="rs-input-box">
            <input 
              class="rs-input" 
              v-model="newRoomName" 
              placeholder="请输入房间名称" 
              :cursor-spacing="20"
            />
          </view>
        </view>

        <view v-if="isAddressMode && createAddressMode" class="addr-form">
          <view class="form-item">
            <text class="label">收货人</text>
            <input class="input" v-model="addrForm.receiver" placeholder="请填写收货人" />
          </view>
          <view class="form-item">
            <text class="label">手机号码</text>
            <input class="input" type="number" maxlength="11" v-model="addrForm.phone" placeholder="请填写手机号" />
          </view>
          <view class="form-item">
            <text class="label">所在地区</text>
            <!-- #ifdef MP-WEIXIN -->
            <picker mode="region" @change="onAddrRegionChange">
              <view class="region-display">{{ addrRegionDisplay }}</view>
            </picker>
            <!-- #endif -->
            <!-- #ifdef H5 -->
            <picker mode="multiSelector" :range="addrRegionRange" :value="addrRegionIndex" @columnchange="onH5AddrRegionColumnChange" @change="onH5AddrRegionChange">
              <view class="region-display">{{ addrRegionDisplay }}</view>
            </picker>
            <!-- #endif -->
          </view>
          <view class="form-item">
            <text class="label">详细地址</text>
            <textarea class="textarea" v-model="addrForm.detail_address" placeholder="街道、楼牌号等" />
          </view>
          <view class="form-item switch-item">
            <text class="label" style="white-space: nowrap;">设为默认收货地址</text>
            <switch :checked="addrForm.is_default === 1" color="#e1251b" @change="onAddrSwitchChange" />
          </view>
        </view>

        <view class="rs-list">
          <view 
            class="rs-item" 
            v-for="(room, index) in rooms" 
            :key="index"
            :class="{ active: selectedName === room.name }"
            @click="select(room)"
          >
            <view class="rs-item-left">
              <view class="rs-icon-wrap">
                <image src="/static/room.png" class="rs-icon-inner" mode="aspectFit" />
              </view>
              <text class="rs-name">{{ room.name }}</text>
            </view>
            <text class="rs-arrow">›</text>
          </view>
        </view>
      </scroll-view>

      <view class="rs-footer">
        <button class="rs-btn cancel" @click="close">取消</button>
        <button class="rs-btn create" v-if="!isAddressMode" @click="confirmCreate">创建</button>
        <button class="rs-btn create" v-if="isAddressMode && !createAddressMode" @click="toggleCreateAddress">新建收货地址</button>
        <button class="rs-btn create" v-if="isAddressMode && createAddressMode" @click="saveAddress">保存</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'RoomSelector',
  props: {
    visible: { type: Boolean, default: false },
    rooms: { type: Array, default: () => [] },
    selectedName: { type: String, default: '' },
    type: { type: String, default: '' }
  },
  data() {
    return {
      newRoomName: '',
      createAddressMode: false,
      addrForm: {
        receiver: '',
        phone: '',
        province: '',
        city: '',
        district: '',
        detail_address: '',
        is_default: 0
      },
      addrRegionRange: [[], [], []],
      addrRegionIndex: [0, 0, 0],
      addrAreaTree: {
        '北京市': { '北京市': ['东城区', '西城区', '朝阳区', '海淀区'] },
        '上海市': { '上海市': ['黄浦区', '徐汇区', '浦东新区'] },
        '广东省': { '广州市': ['天河区', '海珠区', '越秀区'], '深圳市': ['南山区', '福田区', '罗湖区'] },
        '浙江省': { '杭州市': ['西湖区', '上城区', '拱墅区'], '宁波市': ['海曙区', '江北区'] },
        '江苏省': { '南京市': ['玄武区', '秦淮区'], '苏州市': ['姑苏区', '吴中区'] },
        '重庆市': { '重庆市': ['渝中区', '江北区'] }
      }
    }
  },
  computed: {
    isAddressMode() {
      if (this.type === 'addr') return true
      if (this.type === 'room') return false
      const list = this.rooms || []
      if (Array.isArray(list) && list.length > 0) {
        const a = list[0]
        return !!(a && a.raw)
      }
      return false
    },
    addrRegionDisplay() {
      const { province, city, district } = this.addrForm
      const arr = [province, city, district].filter(Boolean)
      return arr.length ? arr.join(' ') : '请选择省/市/区'
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.newRoomName = ''
        this.createAddressMode = false
        this.addrForm = { receiver: '', phone: '', province: '', city: '', district: '', detail_address: '', is_default: 0 }
        this.initH5AddrRegion()
      }
    }
  },
  methods: {
    close() {
      this.$emit('close')
    },
    select(room) {
      this.$emit('select', room)
    },
    confirmSelect() {
      const list = this.rooms || []
      const picked = list.find(r => r && r.name === this.selectedName)
      if (picked) {
        this.$emit('select', picked)
        this.$emit('close')
      }
    },
    confirmCreate() {
      if (!this.newRoomName.trim()) {
        return
      }
      this.$emit('create', this.newRoomName.trim())
    },
    toggleCreateAddress() {
      this.createAddressMode = true
    },
    onAddrSwitchChange(e) {
      this.addrForm.is_default = e.detail.value ? 1 : 0
    },
    onAddrRegionChange(e) {
      const val = e?.detail?.value || []
      this.addrForm.province = val[0] || ''
      this.addrForm.city = val[1] || ''
      this.addrForm.district = val[2] || ''
    },
    initH5AddrRegion() {
      try {
        const isH5 = typeof window !== 'undefined'
        if (!isH5) return
        const provinces = Object.keys(this.addrAreaTree || {})
        const p = provinces[0] || ''
        const cities = Object.keys((this.addrAreaTree && this.addrAreaTree[p]) || {})
        const c = cities[0] || ''
        const areas = ((this.addrAreaTree && this.addrAreaTree[p] && this.addrAreaTree[p][c]) || [])
        this.addrRegionRange = [provinces, cities, areas]
        this.addrRegionIndex = [0, 0, 0]
      } catch (e) {}
    },
    onH5AddrRegionColumnChange(e) {
      const col = e.detail.column
      const idx = e.detail.value
      this.addrRegionIndex[col] = idx
      const p = this.addrRegionRange[0][this.addrRegionIndex[0]] || ''
      if (col === 0) {
        const cities = Object.keys((this.addrAreaTree && this.addrAreaTree[p]) || {})
        const c = cities[0] || ''
        const areas = ((this.addrAreaTree && this.addrAreaTree[p] && this.addrAreaTree[p][c]) || [])
        this.addrRegionRange = [this.addrRegionRange[0], cities, areas]
        this.addrRegionIndex[1] = 0
        this.addrRegionIndex[2] = 0
      } else if (col === 1) {
        const c = this.addrRegionRange[1][this.addrRegionIndex[1]] || ''
        const areas = ((this.addrAreaTree && this.addrAreaTree[p] && this.addrAreaTree[p][c]) || [])
        this.addrRegionRange = [this.addrRegionRange[0], this.addrRegionRange[1], areas]
        this.addrRegionIndex[2] = 0
      }
    },
    onH5AddrRegionChange(e) {
      this.addrRegionIndex = e.detail.value
      const p = this.addrRegionRange[0][this.addrRegionIndex[0]] || ''
      const c = this.addrRegionRange[1][this.addrRegionIndex[1]] || ''
      const a = this.addrRegionRange[2][this.addrRegionIndex[2]] || ''
      this.addrForm.province = p
      this.addrForm.city = c
      this.addrForm.district = a
    },
    saveAddress() {
      const f = this.addrForm
      if (!f.receiver || !f.phone || !f.province || !f.city || !f.district || !f.detail_address) {
        try { uni.showToast({ title: '请填写完整地址信息', icon: 'none' }) } catch (e) {}
        return
      }
      this.$emit('createAddress', { ...f })
    }
  }
}
</script>

<style scoped>
.rs-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rs-content {
  width: 720rpx;
  max-width: 95vw;
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 80vh;
}

/* #ifdef H5 */
.rs-mask { z-index: 100; }
.rs-content { z-index: 101; }
/* #endif */

.rs-header {
  padding: 30rpx 30rpx 20rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.rs-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #000;
}

.rs-close {
  font-size: 40rpx;
  color: #000;
  padding: 10rpx;
  line-height: 1;
}

.rs-body {
  flex: 1;
  overflow-y: auto;
  padding: 0 30rpx 20rpx;
}

.rs-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  margin-bottom: 30rpx;
}

.rs-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  padding: 32rpx 24rpx;
  background: #fff;
  border-radius: 16rpx;
  border: 1rpx solid #f0f0f0;
  width: 600rpx;
  /* margin: 0 auto; */
}

.rs-item.active {
  background: #f0f0f0;
  border-color: #e0e0e0;
}

.rs-item-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.rs-icon-wrap {
  width: 44rpx;
  height: 44rpx;
  overflow: hidden;
  position: relative;
  flex-shrink: 0;
}

.rs-icon-inner {
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  filter: drop-shadow(44rpx 0 0 #333);
  transform: translateX(-44rpx);
}

.rs-name {
  font-size: 30rpx;
  color: #333;
}

.rs-arrow {
  font-size: 30rpx;
  color: #000;
}

.rs-check-wrapper {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rs-check-icon {
  font-size: 24rpx;
  color: #fff;
}

.rs-create {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

/* #ifdef MP-WEIXIN */
.rs-create {
  gap: 0;
}
/* #endif */

.rs-subtitle {
  font-size: 30rpx;
  color: #333;
  font-weight: 500;
}

.rs-input-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f7f7f7;
  border-radius: 16rpx;
  padding: 20rpx 24rpx;
  width: 600rpx;
  /* margin: 0 auto; */
}

.rs-input {
  flex: 1;
  font-size: 30rpx;
  color: #333;
}

.rs-footer {
  padding: 40rpx;
  display: flex;
  gap: 20rpx;
}

.rs-btn {
  flex: 1;
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  border-radius: 16rpx;
  font-size: 30rpx;
  font-weight: 600;
  border: none;
  margin: 0;
}

.rs-btn::after {
  border: none;
}

.rs-btn.cancel {
  background: #fff;
  color: #333;
  border: 1rpx solid #eee;
}

.rs-btn.create {
  background: #000;
  color: #fff;
}

.addr-empty-tip { text-align: center; color: #999; padding: 20rpx; }

.addr-form {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.form-item {
  display: flex;
  align-items: center;
  border-bottom: 1rpx solid #eee;
  padding: 20rpx 0;
}

.form-item:last-child { border-bottom: none; }

.label { width: 160rpx; font-size: 28rpx; color: #333; }
.input { flex: 1; font-size: 28rpx; }
.region-inputs { flex: 1; display: flex; gap: 10rpx; }
.region-input { flex: 1; }
.region-display {
  flex: 1;
  height: 64rpx;
  line-height: 64rpx;
  border: 1rpx solid #e6e6e6;
  border-radius: 12rpx;
  padding: 0 14rpx;
  font-size: 28rpx;
  color: #333;
}
.textarea { flex: 1; height: 120rpx; font-size: 28rpx; padding-top: 10rpx; }
.switch-item { justify-content: space-between; }

/* #ifdef H5 */
.addr-form { width: 600rpx; }
.rs-content { width: 720rpx; }
/* #endif */
</style>
