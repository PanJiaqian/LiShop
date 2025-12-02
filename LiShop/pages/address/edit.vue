<template>
  <view class="page">
    <view class="form">
      <view class="form-item">
        <text class="label">收货人</text>
        <input class="input" v-model="form.receiver" placeholder="请填写收货人姓名" />
      </view>
      <view class="form-item">
        <text class="label">手机号码</text>
        <input class="input" type="number" v-model="form.phone" placeholder="请填写收货人手机号" maxlength="11" />
      </view>
      <view class="form-item">
        <text class="label">所在地区</text>
        <!-- For simplicity, we use simple inputs. In a real app, use a picker. -->
        <view class="region-inputs">
            <input class="input region-input" v-model="form.province" placeholder="省" />
            <input class="input region-input" v-model="form.city" placeholder="市" />
            <input class="input region-input" v-model="form.district" placeholder="区" />
        </view>
      </view>
      <view class="form-item">
        <text class="label">详细地址</text>
        <textarea class="textarea" v-model="form.detail_address" placeholder="街道、楼牌号等" />
      </view>
      <view class="form-item switch-item">
        <text class="label">设为默认地址</text>
        <switch :checked="form.is_default === 1" color="#e1251b" @change="onSwitchChange" />
      </view>
    </view>

    <view class="footer">
      <button class="btn-save" @click="saveAddress">保存</button>
    </view>
  </view>
</template>

<script>
import { addAddress, updateAddress, getAddresses } from '../../api/index.js'

export default {
  data() {
    return {
      id: '',
      form: {
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
  onLoad(options) {
    if (options.id) {
      this.id = options.id
      this.loadAddress(options.id)
      uni.setNavigationBarTitle({ title: '编辑收货地址' })
    } else {
      uni.setNavigationBarTitle({ title: '新建收货地址' })
    }
  },
  methods: {
    loadAddress(id) {
      const u = uni.getStorageSync('user')
      const token = (u && (u.token || (u.data && u.data.token))) || ''
      getAddresses({ addresses_id: id, token }).then(res => {
        if (res && res.success && res.data) {
          const addr = res.data
          this.form = {
            receiver: addr.receiver,
            phone: addr.phone,
            province: addr.province,
            city: addr.city,
            district: addr.district,
            detail_address: addr.detail_address,
            is_default: addr.is_default
          }
        }
      }).catch(err => {
        console.error(err)
        uni.showToast({ title: '获取地址详情失败', icon: 'none' })
      })
    },
    onSwitchChange(e) {
      this.form.is_default = e.detail.value ? 1 : 0
    },
    saveAddress() {
      if (!this.form.receiver) return uni.showToast({ title: '请填写收货人', icon: 'none' })
      if (!this.form.phone) return uni.showToast({ title: '请填写手机号', icon: 'none' })
      if (!this.form.province || !this.form.city || !this.form.district) return uni.showToast({ title: '请填写完整地区', icon: 'none' })
      if (!this.form.detail_address) return uni.showToast({ title: '请填写详细地址', icon: 'none' })

      const u = uni.getStorageSync('user')
      const token = (u && (u.token || (u.data && u.data.token))) || ''
      
      const payload = { ...this.form, token }
      
      let p
      if (this.id) {
        payload.addresses_id = this.id
        p = updateAddress(payload)
      } else {
        p = addAddress(payload)
      }

      p.then(res => {
        if (res && res.success) {
          uni.showToast({ title: '保存成功', icon: 'success' })
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        } else {
          uni.showToast({ title: res.message || '保存失败', icon: 'none' })
        }
      }).catch(err => {
        console.error(err)
        uni.showToast({ title: '保存失败', icon: 'none' })
      })
    }
  }
}
</script>

<style>
.page {
  background-color: #f7f7f7;
  min-height: 100vh;
  padding-top: 20rpx;
}
.form {
  background-color: #fff;
  padding: 0 30rpx;
}
.form-item {
  display: flex;
  align-items: center;
  border-bottom: 1rpx solid #eee;
  padding: 30rpx 0;
}
.form-item:last-child {
  border-bottom: none;
}
.label {
  width: 160rpx;
  font-size: 30rpx;
  color: #333;
}
.input {
  flex: 1;
  font-size: 30rpx;
}
.region-inputs {
    flex: 1;
    display: flex;
    gap: 10rpx;
}
.region-input {
    flex: 1;
}
.textarea {
  flex: 1;
  height: 120rpx;
  font-size: 30rpx;
  padding-top: 10rpx;
}
.switch-item {
  justify-content: space-between;
}
.footer {
  margin-top: 60rpx;
  padding: 30rpx;
}
.btn-save {
  background-color: #e1251b;
  color: #fff;
  border-radius: 40rpx;
  font-size: 32rpx;
}
</style>