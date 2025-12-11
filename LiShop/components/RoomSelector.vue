<template>
  <view class="rs-mask" v-if="visible" @click="close" catchtouchmove="true">
    <view class="rs-content" @click.stop>
      <view class="rs-header">
        <text class="rs-title" v-if="isAddressMode">选择地址</text>
        <text class="rs-title" v-else>选择房间</text>
        <view class="rs-close" @click="close">×</view>
      </view>
      
  <scroll-view scroll-y class="rs-body">
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
            <view class="region-inputs">
              <input class="input region-input" v-model="addrForm.province" placeholder="省" />
              <input class="input region-input" v-model="addrForm.city" placeholder="市" />
              <input class="input region-input" v-model="addrForm.district" placeholder="区" />
            </view>
          </view>
          <view class="form-item">
            <text class="label">详细地址</text>
            <textarea class="textarea" v-model="addrForm.detail_address" placeholder="街道、楼牌号等" />
          </view>
          <view class="form-item switch-item">
            <text class="label">设为默认地址</text>
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
              <image src="/static/room.png" class="rs-icon" mode="aspectFit" />
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
    selectedName: { type: String, default: '' }
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
      }
    }
  },
  computed: {
    isAddressMode() {
      const list = this.rooms || []
      if (Array.isArray(list) && list.length > 0) {
        const a = list[0]
        return !!(a && a.raw)
      }
      return false
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.newRoomName = ''
        this.createAddressMode = false
        this.addrForm = { receiver: '', phone: '', province: '', city: '', district: '', detail_address: '', is_default: 0 }
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
  color: #999;
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

.rs-icon {
  width: 44rpx;
  height: 44rpx;
}

.rs-name {
  font-size: 30rpx;
  color: #333;
}

.rs-arrow {
  font-size: 30rpx;
  color: #999;
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
.textarea { flex: 1; height: 120rpx; font-size: 28rpx; padding-top: 10rpx; }
.switch-item { justify-content: space-between; }

/* #ifdef H5 */
.addr-form { width: 600rpx; }
.rs-content { width: 720rpx; }
/* #endif */
</style>
