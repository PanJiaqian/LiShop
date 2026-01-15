<template>
  <view class="rs-mask" v-if="visible" @click="close" catchtouchmove="true">
    <view class="rs-content" @click.stop>
      <view id="og-room-modal-header" class="rs-header">
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

        <view id="og-room-modal-list" class="rs-list">
          <view
            class="rs-swipe"
            v-for="(room, index) in displayRooms"
            :key="index"
            @touchstart="onItemTouchStart($event, index)"
            @touchmove="onItemTouchMove($event, index)"
            @touchend="onItemTouchEnd"
            @touchcancel="onItemTouchEnd"
            @mousedown="onItemMouseDown($event, index)"
            @mousemove="onItemMouseMove($event, index)"
            @mouseup="onItemMouseUp"
            @mouseleave="onItemMouseUp"
          >
            <view 
              class="rs-item" 
              :class="{ active: selectedName === room.name, swiped: swipeIndex === index }"
              @click="onItemClick(room, index)"
            >
              <view class="rs-item-left">
                <view class="rs-icon-wrap">
                  <image src="/static/room.png" class="rs-icon-inner" mode="aspectFit" />
                </view>
                <text class="rs-name">{{ room.name }}</text>
              </view>
              <text class="rs-arrow">›</text>
            </view>
            <view 
              v-if="!isAddressMode"
              class="rs-delete" 
              :class="{ visible: swipeIndex === index }"
              @click.stop="onDelete(room, index)"
            >
              <text class="rs-del-icon">🗑</text>
            </view>
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
import { deleteRoom as apiDeleteRoom } from '../api/index.js'
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
      swipeIndex: -1,
      touchStartX: 0,
      touchStartY: 0,
      isSwiping: false,
      deleteWidth: 160,
      deletedIds: [],
      localRooms: [],
      addrRegionRange: [[], [], []],
      addrRegionIndex: [0, 0, 0],
      addrAreaTree: {
        '北京市': { '北京市': ['东城区', '西城区', '朝阳区', '海淀区', '丰台区', '石景山区', '通州区', '昌平区', '顺义区', '大兴区', '房山区'] },
        '上海市': { '上海市': ['黄浦区', '徐汇区', '长宁区', '静安区', '普陀区', '虹口区', '杨浦区', '浦东新区', '闵行区', '宝山区', '嘉定区', '青浦区', '松江区'] },
        '天津市': { '天津市': ['和平区', '河东区', '河西区', '南开区', '河北区', '红桥区', '东丽区', '西青区', '津南区', '北辰区', '滨海新区'] },
        '重庆市': { '重庆市': ['渝中区', '江北区', '南岸区', '沙坪坝区', '九龙坡区', '渝北区', '巴南区', '北碚区'] },
        '广东省': {
          '广州市': ['天河区', '海珠区', '越秀区', '白云区', '荔湾区', '番禺区', '黄埔区', '花都区'],
          '深圳市': ['南山区', '福田区', '罗湖区', '宝安区', '龙岗区', '盐田区', '龙华区', '光明区', '坪山区'],
          '佛山市': ['禅城区', '南海区', '顺德区']
        },
        '浙江省': { '杭州市': ['西湖区', '上城区', '拱墅区', '滨江区', '余杭区', '萧山区', '临平区'], '宁波市': ['海曙区', '江北区', '鄞州区'] },
        '江苏省': { '南京市': ['玄武区', '秦淮区', '鼓楼区', '建邺区', '栖霞区', '雨花台区'], '苏州市': ['姑苏区', '吴中区', '相城区', '虎丘区', '工业园区'] },
        '四川省': { '成都市': ['锦江区', '青羊区', '金牛区', '武侯区', '成华区', '高新区'] },
        '湖北省': { '武汉市': ['江岸区', '江汉区', '硚口区', '汉阳区', '武昌区', '青山区', '洪山区'] },
        '山东省': { '济南市': ['历下区', '市中区', '槐荫区', '天桥区'], '青岛市': ['市南区', '市北区', '黄岛区', '李沧区', '城阳区', '崂山区'] },
        '福建省': { '福州市': ['鼓楼区', '台江区', '仓山区', '晋安区'], '厦门市': ['思明区', '海沧区', '湖里区', '集美区', '翔安区'] },
        '安徽省': { '合肥市': ['蜀山区', '庐阳区', '瑶海区', '包河区'] },
        '河北省': { '石家庄市': ['长安区', '桥西区', '新华区', '裕华区'] },
        '辽宁省': { '沈阳市': ['和平区', '皇姑区', '大东区', '铁西区'] },
        '山西省': { '太原市': ['小店区', '迎泽区', '杏花岭区', '尖草坪区'] },
        '陕西省': { '西安市': ['未央区', '莲湖区', '新城区', '碑林区', '雁塔区', '高新区', '长安区'] },
        '吉林省': { '长春市': ['南关区', '朝阳区', '宽城区', '二道区'] },
        '黑龙江省': { '哈尔滨市': ['道里区', '南岗区', '道外区', '香坊区'] },
        '广西壮族自治区': { '南宁市': ['青秀区', '兴宁区', '西乡塘区', '江南区', '良庆区'] },
        '海南省': { '海口市': ['龙华区', '美兰区', '琼山区', '秀英区'] },
        '贵州省': { '贵阳市': ['云岩区', '南明区', '花溪区', '乌当区'] },
        '云南省': { '昆明市': ['五华区', '盘龙区', '官渡区', '西山区', '呈贡区'] },
        '甘肃省': { '兰州市': ['城关区', '七里河区', '西固区', '安宁区'] },
        '青海省': { '西宁市': ['城中区', '城西区', '城东区', '城北区'] },
        '宁夏回族自治区': { '银川市': ['兴庆区', '金凤区', '西夏区'] },
        '新疆维吾尔自治区': { '乌鲁木齐市': ['天山区', '沙依巴克区', '新市区', '水磨沟区'] },
        '西藏自治区': { '拉萨市': ['城关区'] },
        '河南省': { '郑州市': ['中原区', '二七区', '管城回族区', '金水区', '上街区', '惠济区'] },
        '湖南省': { '长沙市': ['芙蓉区', '天心区', '岳麓区', '开福区', '雨花区'] },
        '内蒙古自治区': { '呼和浩特市': ['新城区', '赛罕区', '回民区', '玉泉区'] }
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
    displayRooms() {
      if (this.isAddressMode) return this.rooms || []
      const ids = this.deletedIds || []
      const list = (this.rooms && Array.isArray(this.rooms)) ? this.rooms : []
      return list.filter(r => {
        const rid = r?.id || r?.room_id || r?.name || ''
        return rid && !ids.includes(rid)
      })
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
        this.swipeIndex = -1
        this.deletedIds = []
      }
    }
  },
  methods: {
    async ensureAddrAreaTree() {
      try {
        const isH5 = typeof window !== 'undefined'
        if (!isH5) return
        const cached = uni.getStorageSync('addr_area_tree_v2') || ''
        if (cached && typeof cached === 'object') {
          this.addrAreaTree = cached
          return
        }
        if (cached && typeof cached === 'string') {
          try { this.addrAreaTree = JSON.parse(cached) } catch (e) {}
          if (Object.keys(this.addrAreaTree || {}).length) return
        }
        const resp = await fetch('https://unpkg.com/province-city-china/dist/level.json', { method: 'GET' })
        const data = await resp.json()
        const tree = {}
        ;(Array.isArray(data) ? data : []).forEach((prov) => {
          const pname = String(prov?.name || '').trim()
          const cities = Array.isArray(prov?.children) ? prov.children : []
          const cmap = {}
          cities.forEach((city) => {
            const cname = String(city?.name || '').trim()
            const areas = (Array.isArray(city?.children) ? city.children : []).map(a => String(a?.name || '').trim()).filter(Boolean)
            if (cname) cmap[cname] = areas
          })
          if (pname && Object.keys(cmap).length) tree[pname] = cmap
        })
        if (Object.keys(tree).length) {
          this.addrAreaTree = tree
          try { uni.setStorageSync('addr_area_tree_v2', tree) } catch (e) {}
        }
      } catch (e) {}
    },
    close() {
      this.$emit('close')
    },
    select(room) {
      this.$emit('select', room)
    },
    onItemTouchStart(e, index) {
      try {
        const t = (e && e.touches && e.touches[0]) ? e.touches[0] : {}
        this.touchStartX = Number(t.clientX ?? t.pageX ?? 0) || 0
        this.touchStartY = Number(t.clientY ?? t.pageY ?? 0) || 0
        this.isSwiping = true
      } catch (err) { this.isSwiping = false }
    },
    onItemTouchMove(e, index) {
      if (!this.isSwiping) return
      try {
        const t = (e && e.touches && e.touches[0]) ? e.touches[0] : {}
        const x = Number(t.clientX ?? t.pageX ?? 0) || 0
        const y = Number(t.clientY ?? t.pageY ?? 0) || 0
        const dx = x - this.touchStartX
        const dy = y - this.touchStartY
        if (Math.abs(dy) > 20) return
        if (dx < -30) {
          this.swipeIndex = index
        } else if (dx > 30) {
          this.swipeIndex = -1
        }
      } catch (err) {}
    },
    onItemTouchEnd() {
      this.isSwiping = false
    },
    onItemMouseDown(e, index) {
      try {
        const isH5 = typeof window !== 'undefined'
        if (!isH5) return
        this.touchStartX = Number(e?.clientX ?? 0) || 0
        this.touchStartY = Number(e?.clientY ?? 0) || 0
        this.isSwiping = true
      } catch (err) { this.isSwiping = false }
    },
    onItemMouseMove(e, index) {
      const isH5 = typeof window !== 'undefined'
      if (!isH5 || !this.isSwiping) return
      try {
        const x = Number(e?.clientX ?? 0) || 0
        const y = Number(e?.clientY ?? 0) || 0
        const dx = x - this.touchStartX
        const dy = y - this.touchStartY
        if (Math.abs(dy) > 20) return
        if (dx < -30) this.swipeIndex = index
        else if (dx > 30) this.swipeIndex = -1
      } catch (err) {}
    },
    onItemMouseUp() {
      const isH5 = typeof window !== 'undefined'
      if (!isH5) return
      this.isSwiping = false
    },
    onItemClick(room, index) {
      const isH5 = typeof window !== 'undefined'
      if (isH5 && this.swipeIndex === index) return
      this.select(room)
    },
    onDelete(room, index) {
      try {
        const rid = room?.id || room?.room_id || ''
        if (!rid) { uni.showToast({ title: '房间ID缺失', icon: 'none' }); return }
        apiDeleteRoom({ room_id: rid, name: '葱测试' })
          .then((data) => {
            const ok = !!(data && data.success === true)
            if (ok) {
              uni.showToast({ title: (data && data.message) || '删除房间成功', icon: 'success' })
              const key = rid || room?.name || ''
              if (key) this.deletedIds = Array.from(new Set([key, ...this.deletedIds]))
              this.swipeIndex = -1
            } else {
              const msg = (data && (data.message || (data?.data && data.data.reason))) || '删除失败'
              uni.showToast({ title: msg, icon: 'none' })
            }
          })
          .catch(() => {
            uni.showToast({ title: '网络请求失败', icon: 'none' })
          })
      } catch (e) {
        uni.showToast({ title: '删除失败', icon: 'none' })
      }
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
    async initH5AddrRegion() {
      try {
        const isH5 = typeof window !== 'undefined'
        if (!isH5) return
        await this.ensureAddrAreaTree()
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

.rs-swipe {
  position: relative;
  overflow: visible;
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
  transition: transform 0.2s ease;
  transform: translateX(0);
  touch-action: pan-y;
  -ms-touch-action: pan-y;
  user-select: none;
  -webkit-user-select: none;
  position: relative;
  z-index: 1;
}

.rs-item.active {
  background: #f0f0f0;
  border-color: #e0e0e0;
}

.rs-item.swiped {
  transform: translateX(-200rpx);
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

.rs-delete {
  position: absolute;
  top: 50%;
  right: 80rpx;
  width: 80rpx;
  height: 80rpx;
  background: linear-gradient(135deg, #ff6b5b, #ff2d55);
  box-shadow: 0 8rpx 16rpx rgba(255, 45, 85, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
  border-radius: 50%;
  transform: translateY(-50%);
  z-index: 2;
}

.rs-delete.visible {
  opacity: 1;
  pointer-events: auto;
}

.rs-del-icon {
  font-size: 40rpx;
  color: #fff;
  font-weight: 700;
  letter-spacing: 2rpx;
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
