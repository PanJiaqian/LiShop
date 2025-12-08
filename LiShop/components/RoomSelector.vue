<template>
  <view class="rs-mask" v-if="visible" @click="close" catchtouchmove="true">
    <view class="rs-content" @click.stop>
      <view class="rs-header">
        <text class="rs-title">选择房间</text>
        <view class="rs-close" @click="close">×</view>
      </view>
      
      <scroll-view scroll-y class="rs-body">
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
            <!-- <view class="rs-check-wrapper" v-if="selectedName === room.name">
               <text class="rs-check-icon">✓</text>
            </view> -->
          </view>
        </view>

        <view class="rs-create">
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
      </scroll-view>

      <view class="rs-footer">
        <button class="rs-btn cancel" @click="close">取消</button>
        <button class="rs-btn create" @click="confirmCreate">创建</button>
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
      newRoomName: ''
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.newRoomName = ''
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
    confirmCreate() {
      if (!this.newRoomName.trim()) {
        return
      }
      this.$emit('create', this.newRoomName.trim())
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
</style>
