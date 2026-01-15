<template>
  <view class="og-mask">
    <view v-if="currentRect" class="og-highlight" :style="highlightStyle"></view>
    <view class="og-panel" :style="panelStyle" :class="['orient-' + orientation]">
      <view class="og-content">
        <text class="og-step-title">新手指引</text>
        <view class="og-step-body">
          <text class="og-step-text">{{ steps[current] }}</text>
        </view>
      </view>
      <view class="og-actions">
        <button class="og-btn" :disabled="current===0" @click="onPrev">上一步</button>
        <view class="og-index">{{ current+1 }}/{{ steps.length }}</view>
        <button v-if="current<steps.length-1" class="og-btn primary" @click="onNext">下一步</button>
        <button v-else class="og-btn primary" @click="finish">我知道了</button>
      </view>
    </view>
  </view>
</template>
<script>
export default {
  name: 'OnboardingGuide',
  props: {
    visible: { type: Boolean, default: false },
    initialIndex: { type: Number, default: 0 },
    targets: { type: Array, default: () => [] },
    steps: {
      type: Array,
      default() {
        return [
          '顶部搜索可快速查找商品与店铺',
          '左侧分类导航支持展开子分类',
          '轮播图可直达热门商品',
          '猜你喜欢展示为你推荐的商品',
          '我的与购物车位于右侧快捷入口',
          '商品卡片支持查看详情与加入购物车',
          '订单页面查看物流、支付与历史订单',
          '个人中心管理头像、地址与偏好设置'
        ]
      }
    }
  },
  data() {
    return { current: 0, winW: 360, winH: 640 }
  },
  watch: {
    initialIndex: {
      immediate: true,
      handler(val) {
        const i = Number(val || 0)
        if (i >= 0 && i < this.steps.length) this.current = i
      }
    }
  },
  mounted() {
    try {
      const s = typeof uni !== 'undefined' && uni.getSystemInfoSync ? uni.getSystemInfoSync() : null
      const ww = (s && (s.windowWidth || s.screenWidth)) || (typeof window !== 'undefined' ? window.innerWidth : this.winW)
      const wh = (s && (s.windowHeight || s.screenHeight)) || (typeof window !== 'undefined' ? window.innerHeight : this.winH)
      this.winW = ww || this.winW
      this.winH = wh || this.winH
    } catch (e) {}
  },
  computed: {
    currentRect() {
      const r = this.targets && this.targets[this.current]
      if (!r) return null
      const pad = 8
      return {
        left: Math.max(0, (r.left || 0) - pad),
        top: Math.max(0, (r.top || 0) - pad),
        width: (r.width || 0) + pad * 2,
        height: (r.height || 0) + pad * 2
      }
    },
    highlightStyle() {
      const r = this.currentRect
      if (!r) return {}
      return {
        left: r.left + 'px',
        top: r.top + 'px',
        width: r.width + 'px',
        height: r.height + 'px'
      }
    },
    orientation() {
      const r = this.currentRect
      if (!r) return 'bottom'
      const topSpace = r.top
      const bottomSpace = Math.max(0, this.winH - (r.top + r.height))
      const leftSpace = r.left
      const rightSpace = Math.max(0, this.winW - (r.left + r.width))
      const maxSpace = Math.max(topSpace, bottomSpace, leftSpace, rightSpace)
      if (maxSpace === bottomSpace) return 'bottom'
      if (maxSpace === topSpace) return 'top'
      if (maxSpace === rightSpace) return 'right'
      return 'left'
    },
    panelWidth() {
      const w = Math.min(320, Math.max(240, this.winW - 24))
      return w
    },
    panelHeight() {
      return 140
    },
    panelStyle() {
      const r = this.currentRect
      if (!r) {
        const fallbackLeft = Math.max(12, (this.winW - this.panelWidth) / 2)
        const fallbackTop = Math.max(12, this.winH - this.panelHeight - 20)
        return {
          position: 'fixed',
          left: fallbackLeft + 'px',
          top: fallbackTop + 'px',
          width: this.panelWidth + 'px',
          minHeight: this.panelHeight + 'px'
        }
      }
      const gap = 12
      let top = 0
      let left = 0
      if (this.orientation === 'bottom') {
        top = r.top + r.height + gap
        left = r.left + r.width / 2 - this.panelWidth / 2
      } else if (this.orientation === 'top') {
        top = r.top - this.panelHeight - gap
        left = r.left + r.width / 2 - this.panelWidth / 2
      } else if (this.orientation === 'right') {
        top = r.top + r.height / 2 - this.panelHeight / 2
        left = r.left + r.width + gap
      } else {
        top = r.top + r.height / 2 - this.panelHeight / 2
        left = r.left - this.panelWidth - gap
      }
      const clamp = (v, min, max) => Math.max(min, Math.min(v, max))
      left = clamp(left, 12, Math.max(12, this.winW - this.panelWidth - 12))
      top = clamp(top, 12, Math.max(12, this.winH - this.panelHeight - 12))
      return {
        position: 'fixed',
        left: left + 'px',
        top: top + 'px',
        width: this.panelWidth + 'px',
        minHeight: this.panelHeight + 'px'
      }
    }
  },
  methods: {
    onNext() { this.$emit('advance', this.current + 1) },
    onPrev() { this.$emit('back', this.current - 1) },
    finish() { this.$emit('close') }
  }
}
</script>
<style scoped>
.og-mask {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgba(0,0,0,0.35);
  display: block;
  z-index: 9999;
}
.og-highlight {
  position: fixed;
  border: 3px solid #ff4d4f;
  border-radius: 16px;
  box-shadow: 0 0 0 2000px rgba(0,0,0,0.35);
  pointer-events: none;
}
.og-panel {
  position: fixed;
  background: #ffffff;
  border-radius: 20rpx;
  box-shadow: 0 12rpx 40rpx rgba(0,0,0,0.18);
  padding: 16rpx 14rpx;
  border: 1px solid #f0f0f0;
}
.og-content {
  padding: 8rpx 6rpx 12rpx 6rpx;
}
.og-step-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #111;
  margin-bottom: 8rpx;
}
.og-step-body {
  min-height: 120rpx;
}
.og-step-text {
  font-size: 26rpx;
  color: #333;
  line-height: 1.6;
}
.og-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10rpx;
}
.og-index {
  font-size: 24rpx;
  color: #666;
}
.og-btn {
  height: 64rpx;
  line-height: 64rpx;
  padding: 0 20rpx;
  font-size: 24rpx;
  border-radius: 12rpx;
  background: #f7f7f7;
  color: #222;
}
.og-btn.primary {
  background: #000;
  color: #fff;
}
.og-panel::after {
  content: '';
  position: absolute;
  width: 16rpx;
  height: 16rpx;
  background: #ffffff;
  border: 1px solid #f0f0f0;
  box-shadow: 0 8rpx 20rpx rgba(0,0,0,0.12);
  transform: rotate(45deg);
}
.orient-bottom::after {
  top: -8rpx;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  border-right-color: transparent;
  border-top-color: transparent;
}
.orient-top::after {
  bottom: -8rpx;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  border-left-color: transparent;
  border-bottom-color: transparent;
}
.orient-right::after {
  left: -8rpx;
  top: 50%;
  transform: translateY(-50%) rotate(45deg);
  border-left-color: transparent;
  border-top-color: transparent;
}
.orient-left::after {
  right: -8rpx;
  top: 50%;
  transform: translateY(-50%) rotate(45deg);
  border-right-color: transparent;
  border-bottom-color: transparent;
}
</style>
