<template>
  <view class="page">
    <!-- #ifdef H5 -->
    <view class="h5-nav-bar">
      <view class="nav-back" @click="goBack">
        <view class="back-arrow"></view>
      </view>
      <text class="nav-title">个人中心</text>
    </view>
    <!-- #endif -->
    <view class="header">
      <image class="avatar" src="/static/logo.png" />
      <view class="user">
        <text class="name">{{ loggedIn ? displayName : '未登录' }}</text>
        <button size="mini" class="login" @click="onAuthButton">{{ loggedIn ? '退出登录' : '登录' }}</button>
      </view>
    </view>

    <!-- 信息卡片：公司信息与账号信息（H5/小程序通用） -->
    <view class="info-card">
      <view class="card-header">
        <text class="card-title">个人信息</text>
        <view class="card-actions" v-if="loggedIn">
          <text v-if="!isEditing" class="btn-edit" @click="handleEdit">编辑</text>
          <template v-else>
            <text class="btn-cancel" @click="handleCancel">取消</text>
            <text class="btn-save" @click="handleSave">保存</text>
          </template>
        </view>
      </view>
      <view class="info-row">
        <text class="label">用户名</text>
        <input v-if="isEditing" class="input" v-model="editForm.username" placeholder="请输入用户名" />
        <text v-else class="value">{{ profile.username }}</text>
      </view>
      <view class="info-row">
        <text class="label">手机号</text>
        <text class="value">{{ profile.phone }}</text>
        <text v-if="loggedIn" class="btn-link" @click="openSecurityModal('phone')">修改</text>
      </view>
      <view class="info-row">
        <text class="label">邮箱</text>
        <text class="value">{{ profile.email }}</text>
        <text v-if="loggedIn" class="btn-link" @click="openSecurityModal('email')">修改</text>
      </view>
      <view class="info-row">
        <text class="label">登录密码</text>
        <text class="value">********</text>
        <text v-if="loggedIn" class="btn-link" @click="openSecurityModal('password')">修改</text>
      </view>
      <view class="info-row">
        <text class="label">公司名称</text>
        <input v-if="isEditing" class="input" v-model="editForm.company_name" placeholder="请输入公司名称" />
        <text v-else class="value">{{ profile.companyName }}</text>
      </view>
      <view class="info-row">
        <text class="label">联系人</text>
        <input v-if="isEditing" class="input" v-model="editForm.contact_name" placeholder="请输入联系人" />
        <text v-else class="value">{{ profile.contactName }}</text>
      </view>
      <view class="info-row">
        <text class="label">地区</text>
        <input v-if="isEditing" class="input" v-model="editForm.region" placeholder="请输入地区" />
        <text v-else class="value">{{ profile.region }}</text>
      </view>
    </view>

    <view class="menu">
      <navigator url="/pages/order/index" class="menu-item">
        <text>我的订单</text>
        <text class="arrow">›</text>
      </navigator>
      <navigator url="/pages/cart/index" open-type="switchTab" class="menu-item">
        <text>我的购物车</text>
        <text class="arrow">›</text>
      </navigator>
      <navigator url="/pages/settings/index" class="menu-item">
        <text>设置</text>
        <text class="arrow">›</text>
      </navigator>
      <navigator url="/pages/messages/index" class="menu-item">
        <text>消息</text>
        <text class="arrow">›</text>
      </navigator>
      <navigator url="/pages/address/index" class="menu-item" hover-class="none">
        <text>收货地址</text>
        <text class="arrow">›</text>
      </navigator>
    </view>
    <!-- #ifdef H5 -->
    <FloatingNav />
    <!-- #endif -->

    <!-- 安全验证弹窗 -->
    <view v-if="showSecurityModal" class="modal-mask" @click="closeSecurityModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ securityTitle }}</text>
        </view>
        <view class="modal-body">
          <input class="modal-input" v-model="securityForm.value" :placeholder="securityPlaceholder" />
          <view class="code-box">
            <input class="modal-input code" v-model="securityForm.code" placeholder="请输入验证码" />
            <button size="mini" class="btn-code" :disabled="countdown > 0" @click="sendCode">
              {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
            </button>
          </view>
        </view>
        <view class="modal-footer">
          <button class="modal-btn cancel" @click="closeSecurityModal">取消</button>
          <button class="modal-btn confirm" @click="confirmSecurityEdit">确认</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import FloatingNav from '@/components/FloatingNav.vue'
import { getUserProfile, updateUserProfile, sendSecurityCode, updateUserPhone, updateUserEmail } from '../../api/index.js'
export default {
  components: { FloatingNav },
  data() { return { 
    loggedIn: false, displayName: '', fetchedProfile: {}, isEditing: false, editForm: {},
    showSecurityModal: false, securityType: '', securityForm: { value: '', code: '' }, countdown: 0, timer: null
  } },
  computed: {
    profile() {
      try {
        const u = this.fetchedProfile.user_id ? this.fetchedProfile : (uni.getStorageSync('user') || null)
        return {
          username: u?.username || '未设置',
          phone: u?.phone || '未设置',
          email: u?.email || '未设置',
          companyName: u?.company_name || u?.companyName || '未设置',
          contactName: u?.contact_name || u?.contactName || '未设置',
          region: u?.region || '未设置'
        }
      } catch (e) { return { username: '未设置', phone: '未设置', email: '未设置', companyName: '未设置', contactName: '未设置', region: '未设置' } }
    },
    securityTitle() {
      const map = { phone: '更换手机号', email: '更换邮箱', password: '修改登录密码' }
      return map[this.securityType] || '安全验证'
    },
    securityPlaceholder() {
      const map = { phone: '请输入新手机号', email: '请输入新邮箱', password: '请输入新密码' }
      return map[this.securityType] || ''
    }
  },
  onShow() {
    // #ifdef H5
    try { uni.hideTabBar({ animation: false }) } catch (e) { }
    // #endif
    try {
      const u = uni.getStorageSync('user') || null
      this.loggedIn = !!u
      this.displayName = u?.username || ''
      if (this.loggedIn) {
        const token = (u && (u.token || (u.data && u.data.token))) || ''
        this.loadUserProfile(token)
      }
    } catch (e) { }
  },
  methods: {
    goBack() {
      const pages = getCurrentPages()
      if (pages.length > 1) {
        uni.navigateBack()
      } else {
        uni.switchTab({ url: '/pages/home/index' })
      }
    },
    loadUserProfile(token) {
      if (!token) return
      getUserProfile({ token }).then(res => {
        if (res && res.success) {
          this.fetchedProfile = res.data
          if (res.data.username) this.displayName = res.data.username
        }
      }).catch(err => {
        console.error('Fetch user profile failed', err)
      })
    },
    login() {
      uni.navigateTo({ url: '/pages/login/index' })
    },
    logout() {
      try { uni.removeStorageSync('user') } catch (e) { }
      this.loggedIn = false
      this.displayName = ''
      this.fetchedProfile = {}
      uni.showToast({ title: '已退出登录', icon: 'success' })
    },
    onAuthButton() {
      if (this.loggedIn) this.logout()
      else this.login()
    },
    handleEdit() {
      this.editForm = {
        username: this.profile.username,
        company_name: this.profile.companyName,
        contact_name: this.profile.contactName,
        region: this.profile.region,
        phone: this.profile.phone // Pass phone as required by some APIs, though not edited
      }
      this.isEditing = true
    },
    handleCancel() {
      this.isEditing = false
      this.editForm = {}
    },
    handleSave() {
      const u = uni.getStorageSync('user')
      const token = (u && (u.token || (u.data && u.data.token))) || ''
      if (!token) {
        uni.showToast({ title: '请先登录', icon: 'none' })
        return
      }
      
      uni.showLoading({ title: '保存中' })
      updateUserProfile({
        ...this.editForm,
        token: token
      }).then(res => {
        uni.hideLoading()
        if (res && res.success) {
            uni.showToast({ title: '更新成功', icon: 'success' })
            this.isEditing = false
            
            // 更新本地 fetchedProfile
            this.fetchedProfile = {
              ...this.fetchedProfile,
              username: this.editForm.username,
              company_name: this.editForm.company_name,
              contact_name: this.editForm.contact_name,
              region: this.editForm.region
            }
            
            // 重新获取最新信息
            this.loadUserProfile(token)
        } else {
            uni.showToast({ title: res.message || '更新失败', icon: 'none' })
        }
      }).catch(err => {
        uni.hideLoading()
        console.error(err)
        uni.showToast({ title: '更新出错', icon: 'none' })
      })
    },
    openSecurityModal(type) {
      this.securityType = type
      this.securityForm = { value: '', code: '' }
      this.showSecurityModal = true
    },
    closeSecurityModal() {
      this.showSecurityModal = false
      this.securityForm = { value: '', code: '' }
      if (this.timer) { clearInterval(this.timer); this.timer = null }
      this.countdown = 0
    },
    sendCode() {
      if (this.countdown > 0) return
      const u = uni.getStorageSync('user')
      const token = (u && (u.token || (u.data && u.data.token))) || ''
      if (!token) { uni.showToast({ title: '请先登录', icon: 'none' }); return }
      
      // 验证手机号或邮箱格式
      const val = this.securityForm.value
      if (this.securityType === 'phone') {
        if (!/^1[3-9]\d{9}$/.test(val)) {
          uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
          return
        }
      } else if (this.securityType === 'email') {
        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val)) {
          uni.showToast({ title: '请输入正确的邮箱', icon: 'none' })
          return
        }
      }

      uni.showLoading({ title: '发送中' })
      sendSecurityCode({ token }).then(res => {
        uni.hideLoading()
        if (res && res.success) {
          uni.showToast({ title: '已发送至安全邮箱', icon: 'none', duration: 2000 })
          this.countdown = 60
          this.timer = setInterval(() => {
            this.countdown--
            if (this.countdown <= 0) { clearInterval(this.timer); this.timer = null }
          }, 1000)
        } else {
          uni.showToast({ title: res.message || '发送失败', icon: 'none' })
        }
      }).catch(err => {
        uni.hideLoading()
        console.error(err)
        uni.showToast({ title: '发送出错', icon: 'none' })
      })
    },
    confirmSecurityEdit() {
      const { value, code } = this.securityForm
      if (!value) { uni.showToast({ title: this.securityPlaceholder, icon: 'none' }); return }
      if (!code) { uni.showToast({ title: '请输入验证码', icon: 'none' }); return }
      
      const u = uni.getStorageSync('user')
      const token = (u && (u.token || (u.data && u.data.token))) || ''
      if (!token) { uni.showToast({ title: '请先登录', icon: 'none' }); return }

      uni.showLoading({ title: '提交中' })
      let promise
      if (this.securityType === 'phone') {
        promise = updateUserPhone({ new_phone: value, code, token })
      } else if (this.securityType === 'email') {
        promise = updateUserEmail({ new_email: value, code, token })
      } else if (this.securityType === 'password') {
        // Placeholder for password update
        promise = Promise.reject({ message: '暂无修改密码接口' })
      }

      if (promise) {
        promise.then(res => {
          uni.hideLoading()
          if (res && res.success) {
            uni.showToast({ title: '修改成功', icon: 'success' })
            this.closeSecurityModal()
            this.loadUserProfile(token)
          } else {
            uni.showToast({ title: res.message || '修改失败', icon: 'none' })
          }
        }).catch(err => {
          uni.hideLoading()
          console.error(err)
          uni.showToast({ title: (err && err.message) || '修改出错', icon: 'none' })
        })
      }
    }
  }
}
</script>

<style scoped>
.page {
  background: linear-gradient(180deg, #fff4f2 0%, #f7f7f7 45%, #f7f7f7 100%);
  min-height: 100vh;
  padding-bottom: 40rpx;
  /* #ifndef H5 */
  padding-left: 30rpx;
  padding-right: 30rpx;
  box-sizing: border-box;
  /* #endif */
}

.header {
  display: flex;
  align-items: center;
  padding: 40rpx 24rpx;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, .06);
  margin: 20rpx 0 0 0;
  box-sizing: border-box;
  width: 100%;
  /* #ifdef MP-WEIXIN */
  margin-top: 20rpx;
  /* #endif */
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: #f0f0f0;
}

.user {
  margin-left: 20rpx;
}

.name {
  font-size: 34rpx;
  display: block;
  font-weight: 600;
}

.login {
  margin-top: 10rpx;
  height: 60rpx;
  line-height: 60rpx;
  background: linear-gradient(90deg, #ff6b4b, #e1251b);
  color: #fff;
  border-radius: 12rpx;
  padding: 0 24rpx;
  box-shadow: 0 6rpx 16rpx rgba(225, 37, 27, .25);
}

.menu {
  margin: 24rpx 0;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, .06);
}

.info-card {
  margin: 24rpx 0;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, .06);
}

.card-header {
  padding: 24rpx;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-weight: 600;
  font-size: 30rpx;
  color: #333;
}

.card-actions {
  display: flex;
  gap: 20rpx;
}

.btn-edit, .btn-cancel {
  color: #666;
  font-size: 26rpx;
}

.btn-save {
  color: #e1251b;
  font-size: 26rpx;
  font-weight: 600;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  border-bottom: 1px solid #f0f0f0;
}

.info-row:last-child {
  border-bottom: none;
}

.label {
  color: #666;
  min-width: 140rpx;
}

.value {
  color: #333;
  font-weight: 600;
  text-align: right;
  flex: 1;
}

.input {
  flex: 1;
  text-align: right;
  font-size: 28rpx;
  color: #333;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 24rpx;
  border-bottom: 1px solid #f0f0f0;
}

.arrow {
  color: #a0a0a0;
}

.btn-link {
  color: #007aff;
  font-size: 26rpx;
  margin-left: 16rpx;
}

/* Modal Styles */
.modal-mask {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-content {
  width: 600rpx;
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
}
.modal-header {
  padding: 30rpx;
  text-align: center;
  border-bottom: 1rpx solid #eee;
}
.modal-title {
  font-weight: 600;
  font-size: 32rpx;
  color: #333;
}
.modal-body {
  padding: 40rpx 30rpx;
}
.modal-input {
  background: #f5f5f5;
  height: 80rpx;
  border-radius: 8rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 20rpx;
}
.code-box {
  display: flex;
  gap: 20rpx;
}
.code-box .code {
  flex: 1;
  margin-bottom: 0;
}
.btn-code {
  height: 80rpx;
  line-height: 80rpx;
  font-size: 24rpx;
  padding: 0 20rpx;
  background: #e1251b;
  color: #fff;
  border-radius: 8rpx;
}
.btn-code[disabled] {
  background: #ccc;
  color: #fff;
}
.modal-footer {
  display: flex;
  border-top: 1rpx solid #eee;
}
.modal-btn {
  flex: 1;
  height: 100rpx;
  line-height: 100rpx;
  text-align: center;
  font-size: 30rpx;
  background: #fff;
  border-radius: 0;
}
.modal-btn::after { border: none; }
.modal-btn.cancel { color: #666; border-right: 1rpx solid #eee; }
.modal-btn.confirm { color: #e1251b; font-weight: 600; }

/* #ifdef H5 */
.h5-nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 88rpx;
  padding: 0 600rpx;
  z-index: 100;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  background: #ffffff;
  box-shadow: 0 1rpx 0 #f0f0f0;
}
.nav-title {
  flex: 1;
  text-align: center;
  font-size: 34rpx;
  font-weight: bold;
  color: #333;
  margin-right: 80rpx;
}
.nav-back {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  color: #333;
  cursor: pointer;
  width: 80rpx;
  height: 100%;
}
.back-arrow {
  width: 20rpx;
  height: 20rpx;
  border-left: 4rpx solid #333;
  border-bottom: 4rpx solid #333;
  transform: rotate(45deg);
}

.page {
  padding-left: 600rpx;
  padding-right: 600rpx;
  box-sizing: border-box;
  padding-top: 88rpx; /* Make space for fixed header */
}
/* #endif */
</style>
