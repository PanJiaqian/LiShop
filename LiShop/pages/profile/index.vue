<template>
  <view class="page">
    <Skeleton :loading="loading" :showTitle="true" />
    <view class="profile-grid">
      <view class="profile-main">
        <view class="info-card">
          <view class="card-header-row">
            <text class="card-title">个人信息</text>
          </view>
          
          <view class="user-brief">
             <image class="avatar" src="/static/logo.png" />
             <!-- <text class="name">{{ loggedIn ? displayName : '未登录' }}</text> -->
          </view>

          <view class="form-grid">
            <view class="form-item">
              <text class="label">姓名</text>
              <input v-if="isEditing" class="input-box" v-model="editForm.username" />
              <view v-else class="input-box static">{{ profile.username }}</view>
            </view>
            <view class="form-item">
              <text class="label">手机号</text>
              <view class="input-box static">{{ profile.phone }} <text v-if="loggedIn" class="link" @click="openSecurityModal('phone')">修改</text></view>
            </view>
            <view class="form-item">
              <text class="label">邮箱</text>
              <view class="input-box static">{{ profile.email }} <text v-if="loggedIn" class="link" @click="openSecurityModal('email')">修改</text></view>
            </view>
            <view class="form-item">
              <text class="label">登录密码</text>
              <view class="input-box static">******** <text v-if="loggedIn" class="link" @click="openSecurityModal('password')">修改</text></view>
            </view>
            <view class="form-item">
              <text class="label">公司名称</text>
              <input v-if="isEditing" class="input-box" v-model="editForm.company_name" />
              <view v-else class="input-box static">{{ profile.companyName }}</view>
            </view>
            <view class="form-item">
              <text class="label">联系人</text>
              <input v-if="isEditing" class="input-box" v-model="editForm.contact_name" />
              <view v-else class="input-box static">{{ profile.contactName }}</view>
            </view>
            <!-- <view class="form-item">
              <text class="label">Phone Number 待定</text>
              <view class="input-box static">{{ profile.phone }}</view>
            </view> -->
            <view class="form-item">
              <text class="label">地区</text>
              <input v-if="isEditing" class="input-box" v-model="editForm.region" />
              <view v-else class="input-box static">{{ profile.region }}</view>
            </view>
          </view>

          <view class="form-actions" v-if="loggedIn">
             <text class="hint">修改资料/保存设置</text>
             <view class="btns">
               <button class="btn-save" @click="isEditing ? handleSave() : handleEdit()">{{ isEditing ? '保存修改' : '编辑资料' }}</button>
               <button class="btn-cancel" @click="isEditing ? handleCancel() : logout()">{{ isEditing ? '取消' : '退出登录' }}</button>
             </view>
          </view>
          <view class="form-actions" v-else>
             <button class="btn-save" @click="login">登录</button>
          </view>
        </view>
      </view>

      <view class="profile-aside">
        <view class="right-card">
          <view class="preferences-section">
            <view class="card-header">
              <text class="card-title">功能</text>
            </view>
            <view class="menu-list">
              <navigator url="/pages/order/index" class="menu-row">
                <text>我的订单</text>
                <text class="arrow">›</text>
              </navigator>
              <navigator url="/pages/cart/index" open-type="switchTab" class="menu-row">
                <text>我的购物车</text>
                <text class="arrow">›</text>
              </navigator>
              <navigator url="/pages/settings/index" class="menu-row">
                <text>设置</text>
                <text class="arrow">›</text>
              </navigator>
              <navigator url="/pages/messages/index" class="menu-row">
                <text>消息</text>
                <text class="arrow">›</text>
              </navigator>
            </view>
          </view>

          <view class="addresses-section">
            <view class="card-header">
              <text class="card-title">收货地址</text>
              <button size="mini" class="btn-add-addr" @click="goCreateAddress">添加地址</button>
            </view>
            <view class="addr-list">
               <view class="addr-item" v-for="addr in addresses" :key="addr.id" @click="editAddress(addr)">
                 <view class="addr-info">
                   <text class="addr-txt">{{ addr.full }}</text>
                   <text class="addr-sub">{{ addr.receiver }} {{ addr.phone }}</text>
                 </view>
                 <text class="arrow">›</text>
               </view>
               <view v-if="addresses.length === 0" class="empty-addr">暂无地址</view>
            </view>
          </view>
        </view>
      </view>
    </view>
    <!-- #ifdef H5 -->
    <FloatingNav />
    <view class="floating-back" @click="goBack">←</view>
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
import Skeleton from '@/components/Skeleton.vue'
import { getUserProfile, updateUserProfile, sendSecurityCode, updateUserPhone, updateUserEmail, getAddresses } from '../../api/index.js'
export default {
  components: { FloatingNav, Skeleton },
  data() { return { 
    loading: true,
    loggedIn: false, displayName: '', fetchedProfile: {}, isEditing: false, editForm: {},
    showSecurityModal: false, securityType: '', securityForm: { value: '', code: '' }, countdown: 0, timer: null,
    addresses: []
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
    this.loadAddresses()
    // #ifdef H5
    try { uni.hideTabBar({ animation: false }) } catch (e) { }
    try {
      const cur = (typeof location !== 'undefined' && location.href) ? location.href : ''
      const ref = (typeof document !== 'undefined' && document.referrer) ? document.referrer : ''
      if (ref && (!cur || ref !== cur)) {
        uni.setStorageSync('last_profile_back', ref)
      }
    } catch (e) {}
    // #endif
    try {
      const u = uni.getStorageSync('user') || null
      this.loggedIn = !!u
      this.displayName = u?.username || ''
      if (this.loggedIn) {
        const token = (u && (u.token || (u.data && u.data.token))) || ''
        this.loadUserProfile(token).finally(() => this.loading = false)
      } else {
        this.loading = false
      }
    } catch (e) { this.loading = false }
  },
  methods: {
    goHome() {
      if (uni && uni.switchTab) { uni.switchTab({ url: '/pages/home/index' }); return }
      if (uni && uni.navigateTo) { uni.navigateTo({ url: '/pages/home/index' }); return }
    },
    goBack() { this.goHome() },
    loadAddresses() {
      const u = uni.getStorageSync('user')
      const token = (u && (u.token || (u.data && u.data.token))) || ''
      if (!token) return
      getAddresses({ token }).then(res => {
        const raw = Array.isArray(res?.data?.items) ? res.data.items : (Array.isArray(res?.items) ? res.items : [])
        this.addresses = raw.map(a => ({
          id: a.addresses_id || a.id || '',
          receiver: a.receiver || '',
          phone: a.phone || '',
          full: [a.province, a.city, a.district, a.detail_address].filter(Boolean).join(' '),
          is_default: a.is_default === 1
        }))
      }).catch(() => { this.addresses = [] })
    },
    goCreateAddress() {
      uni.navigateTo({ url: '/pages/address/edit?mode=create' })
    },
    editAddress(addr) {
      const id = (addr && (addr.id || addr.addresses_id)) || ''
      uni.navigateTo({ url: '/pages/address/edit' + (id ? ('?id=' + id) : '') })
    },
    loadUserProfile(token) {
      if (!token) return Promise.resolve()
      return getUserProfile({ token }).then(res => {
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
      setTimeout(() => {
        uni.navigateTo({ url: '/pages/login/index' })
      }, 500)
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
  min-height: 100vh;
  background: url('/static/product_detail_background.jpg') no-repeat center center fixed;
  background-size: cover;
  padding: 40rpx;
  box-sizing: border-box;
}

.profile-grid {
  display: grid;
  grid-template-columns: 1.6fr 1.3fr;
  grid-gap: 30rpx;
  max-width: 1800rpx;
  margin: 0 auto;
  align-items: start;
}

@media (max-width: 768px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }
}

.info-card, .right-card {
  background: rgba(255,255,255,0.6);
  border: 1rpx solid rgba(255,255,255,0.7);
  border-radius: 20rpx;
  padding: 40rpx;
  box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.12);
  -webkit-backdrop-filter: saturate(180%) blur(12px);
  backdrop-filter: saturate(180%) blur(12px);
  margin-bottom: 30rpx;
  height: calc(100vh - 220rpx);
  display: flex;
  flex-direction: column;
  overflow: auto;
}

.profile-main, .profile-aside { align-self: stretch; }

.preferences-section {
  margin-bottom: 60rpx;
}

.card-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 0;
}

.card-header-row {
  margin-bottom: 40rpx;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 20rpx;
}

.user-brief {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 60rpx;
}

.avatar {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  background: #f0f0f0;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 40rpx;
  margin-bottom: 40rpx;
}

.form-item {
  display: flex;
  flex-direction: column;
}

.label {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 16rpx;
  font-weight: 500;
}

.input-box {
  border: 1px solid #eee;
  background: #f9f9f9;
  padding: 14rpx 20rpx;
  border-radius: 8rpx;
  font-size: 28rpx;
  color: #333;
  min-height: 40rpx;
}
.input-box.static {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.link {
  color: #007aff;
  margin-left: auto;
  font-size: 24rpx;
  cursor: pointer;
}

.form-actions {
  border-top: 1px solid #f0f0f0;
  padding-top: 30rpx;
  text-align: right;
}

.hint {
  display: block;
  font-size: 24rpx;
  color: #999;
  margin-bottom: 20rpx;
}

.btns {
  display: flex;
  justify-content: flex-end;
  gap: 20rpx;
}

.btn-save {
  background: #000;
  color: #fff;
  padding: 0 60rpx;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  margin: 0;
}

.btn-cancel {
  background: #f5f5f5;
  color: #333;
  padding: 0 60rpx;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  margin: 0;
}

/* Right Side */
.menu-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18rpx 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 28rpx;
  color: #333;
  cursor: pointer;
}

.menu-row:last-child {
  border-bottom: none;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 20rpx;
}

.btn-add-addr {
  font-size: 24rpx;
  background: #f0f0f0;
  color: #333;
  margin: 0;
  padding: 0 20rpx;
  height: 50rpx;
  line-height: 50rpx;
}

.addr-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18rpx 0;
  border-bottom: 1px solid #f0f0f0;
}

.addr-item:last-child {
  border-bottom: none;
}

.addr-info {
  display: flex;
  flex-direction: column;
}

.addr-txt {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.addr-sub {
  font-size: 24rpx;
  color: #999;
}

.arrow {
  color: #ccc;
  font-size: 28rpx;
  margin-left: 20rpx;
}

.empty-addr {
  text-align: center;
  color: #999;
  font-size: 24rpx;
  padding: 40rpx 0;
}

.floating-back {
  position: fixed;
  left: 40rpx;
  top: 40rpx;
  width: 80rpx;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  /* border-radius: 50%; */
  /* background: rgba(255,255,255,0.7); */
  /* box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.12); */
  color: #333;
  font-size: 36rpx;
  z-index: 999;
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
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

/* .page {
  padding-left: 300rpx;
  padding-right: 300rpx;
  box-sizing: border-box;
  padding-top: 88rpx;
} */
/* #endif */
</style>
