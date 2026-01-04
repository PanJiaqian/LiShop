<template>
  <view class="page address-edit-page">
    <Skeleton :loading="loading" :showTitle="true" />
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
        <!-- #ifdef MP-WEIXIN -->
        <picker mode="region" @change="onRegionPickerChange">
          <view class="region-display">{{ regionDisplay }}</view>
        </picker>
        <!-- #endif -->
        <!-- #ifdef H5 -->
        <picker mode="multiSelector" :range="regionRange" :value="regionIndex" @columnchange="onH5RegionColumnChange" @change="onH5RegionChange">
          <view class="region-display">{{ regionDisplay }}</view>
        </picker>
        <!-- #endif -->
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
      <button class="btn-delete" v-if="id" @click="deleteAddressHandler">删除</button>
    </view>
  </view>
</template>

<script>
import Skeleton from '@/components/Skeleton.vue'
import { addAddress, updateAddress, getAddresses, deleteAddress } from '../../api/index.js'

export default {
  components: { Skeleton },
  data() {
    return {
      id: '',
      regionRange: [[], [], []],
      regionIndex: [0, 0, 0],
      form: {
        receiver: '',
        phone: '',
        province: '',
        city: '',
        district: '',
        detail_address: '',
        is_default: 0
      },
      loading: true,
      areaTree: {
        '北京市': { '北京市': ['东城区', '西城区', '朝阳区', '海淀区'] },
        '上海市': { '上海市': ['黄浦区', '徐汇区', '浦东新区'] },
        '广东省': { '广州市': ['天河区', '海珠区', '越秀区'], '深圳市': ['南山区', '福田区', '罗湖区'] },
        '浙江省': { '杭州市': ['西湖区', '上城区', '拱墅区'], '宁波市': ['海曙区', '江北区'] },
        '江苏省': { '南京市': ['玄武区', '秦淮区'], '苏州市': ['姑苏区', '吴中区'] },
        '四川省': { '成都市': ['锦江区', '青羊区', '武侯区'] },
        '湖北省': { '武汉市': ['江岸区', '武昌区'] },
        '山东省': { '济南市': ['历下区', '市中区'] },
        '河南省': { '郑州市': ['中原区', '二七区'] },
        '湖南省': { '长沙市': ['芙蓉区', '天心区'] },
        '重庆市': { '重庆市': ['渝中区', '江北区'] }
      }
    }
  },
  computed: {
    regionDisplay() {
      const { province, city, district } = this.form
      const arr = [province, city, district].filter(Boolean)
      return arr.length ? arr.join(' ') : '请选择省/市/区'
    }
  },
  onLoad(options) {
    if (options.id) {
      this.id = options.id
      this.loadAddress(options.id)
      uni.setNavigationBarTitle({ title: '编辑收货地址' })
    } else {
      uni.setNavigationBarTitle({ title: '新建收货地址' })
      this.loading = false
    }
    this.initH5Region()
  },
  methods: {
    onRegionPickerChange(e) {
      const val = e?.detail?.value || []
      this.form.province = val[0] || ''
      this.form.city = val[1] || ''
      this.form.district = val[2] || ''
    },
    initH5Region() {
      try {
        const isH5 = typeof window !== 'undefined'
        if (!isH5) return
        const provinces = Object.keys(this.areaTree || {})
        this.regionRange[0] = provinces
        const p = provinces[0] || ''
        const cities = Object.keys((this.areaTree && this.areaTree[p]) || {})
        this.regionRange[1] = cities
        const c = cities[0] || ''
        const areas = ((this.areaTree && this.areaTree[p] && this.areaTree[p][c]) || [])
        this.regionRange[2] = areas
        this.regionIndex = [0, 0, 0]
      } catch (e) {}
    },
    onH5RegionColumnChange(e) {
      const col = e.detail.column
      const idx = e.detail.value
      this.regionIndex[col] = idx
      const p = this.regionRange[0][this.regionIndex[0]] || ''
      if (col === 0) {
        const cities = Object.keys((this.areaTree && this.areaTree[p]) || {})
        this.regionRange[1] = cities
        this.regionIndex[1] = 0
        const c = cities[0] || ''
        const areas = ((this.areaTree && this.areaTree[p] && this.areaTree[p][c]) || [])
        this.regionRange[2] = areas
        this.regionIndex[2] = 0
      } else if (col === 1) {
        const c = this.regionRange[1][this.regionIndex[1]] || ''
        const areas = ((this.areaTree && this.areaTree[p] && this.areaTree[p][c]) || [])
        this.regionRange[2] = areas
        this.regionIndex[2] = 0
      }
    },
    onH5RegionChange(e) {
      this.regionIndex = e.detail.value
      const p = this.regionRange[0][this.regionIndex[0]] || ''
      const c = this.regionRange[1][this.regionIndex[1]] || ''
      const a = this.regionRange[2][this.regionIndex[2]] || ''
      this.form.province = p
      this.form.city = c
      this.form.district = a
    },
    loadAddress(id) {
      this.loading = true
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
          this.syncH5RegionByForm()
        }
      }).catch(err => {
        console.error(err)
        uni.showToast({ title: '获取地址详情失败', icon: 'none' })
      }).finally(() => { this.loading = false })
    },
    syncH5RegionByForm() {
      try {
        const isH5 = typeof window !== 'undefined'
        if (!isH5) return
        const pIdx = (this.regionRange[0] || []).indexOf(this.form.province)
        if (pIdx >= 0) {
          this.regionIndex[0] = pIdx
          const p = this.regionRange[0][pIdx]
          const cities = Object.keys((this.areaTree && this.areaTree[p]) || {})
          this.regionRange[1] = cities
          const cIdx = cities.indexOf(this.form.city)
          this.regionIndex[1] = cIdx >= 0 ? cIdx : 0
          const c = cities[this.regionIndex[1]] || ''
          const areas = ((this.areaTree && this.areaTree[p] && this.areaTree[p][c]) || [])
          this.regionRange[2] = areas
          const aIdx = areas.indexOf(this.form.district)
          this.regionIndex[2] = aIdx >= 0 ? aIdx : 0
        }
      } catch (e) {}
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
    },
    deleteAddressHandler() {
      if (!this.id) return
      uni.showModal({
        title: '提示',
        content: '确定要删除该收货地址吗？',
        success: (res) => {
          if (res.confirm) {
            const u = uni.getStorageSync('user')
            const token = (u && (u.token || (u.data && u.data.token))) || ''
            deleteAddress({ addresses_id: this.id, token }).then(res => {
              if (res && res.success) {
                uni.showToast({ title: '删除成功', icon: 'success' })
                setTimeout(() => { uni.navigateBack() }, 1200)
              } else {
                uni.showToast({ title: res?.message || '删除失败', icon: 'none' })
              }
            }).catch(() => {
              uni.showToast({ title: '删除失败', icon: 'none' })
            })
          }
        }
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

/* #ifdef MP-WEIXIN */
.page {
  background: url('/static/product_detail_background.jpg') no-repeat center center fixed;
  background-size: cover;
}
/* #endif */

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

.region-display {
  flex: 1;
  height: 64rpx;
  line-height: 64rpx;
  border: 1rpx solid #e6e6e6;
  border-radius: 12rpx;
  padding: 0 14rpx;
  font-size: 30rpx;
  color: #333;
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
  display: flex;
  gap: 12rpx;
}

.btn-save {
  flex: 1;
  height: 80rpx;
  background-color: #000;
  color: #fff;
  border-radius: 40rpx;
  font-size: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
}
.btn-delete {
  flex: 1;
  height: 80rpx;
  background-color: #434343;
  color: #fff;
  border-radius: 40rpx;
  font-size: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
}

.switch-item .label {
  width: 240rpx;
  /* Increase width to prevent wrapping */
}

/* #ifdef H5 */
.address-edit-page {
  padding-left: 600rpx;
  padding-right: 600rpx;
  box-sizing: border-box;
  padding-bottom: 140rpx;
  /* Add bottom padding to prevent content from being hidden */
}

.btn-save {
  width: auto;
  margin: 0;
  display: flex;
}
.btn-delete {
  width: auto;
  margin: 0;
  display: flex;
}

.footer {
  position: fixed;
  left: 300px;
  right: 300px;
  bottom: 0;
  /* background: #fff; */
  /* box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05); */
  z-index: 999;
}

/* #endif */
</style>
