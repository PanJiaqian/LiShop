<template>
  <movable-area class="floating-area">
    <movable-view
      class="floating-ball"
      :class="{ dragging }"
      direction="all"
      :x="posX"
      :y="posY"
      :out-of-bounds="false"
      @change="handleMove"
      @touchstart.stop="handleDragStart"
      @touchend.stop="handleDragEnd"
      @tap.stop="handleTap"
    >
      <!-- <icon type="info" size="26" color="#ffffff" /> -->
      <image 
        src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyNCAyNCcgZmlsbD0nI2ZmZmZmZic+PHBhdGggZD0nTTEyIDIyYzEuMSAwIDItLjkgMi0yaC00YzAgMS4xLjkgMiAyIDJ6bTYtNnYtNWMwLTMuMDctMS42My01LjY0LTQuNS02LjMyVjRjMC0uODMtLjY3LTEuNS0xLjUtMS41cy0xLjUuNjctMS41IDEuNXYuNjhDNy42NCA1LjM2IDYgNy45MiA2IDExdjVsLTIgMnYxaDE2di0xbC0yLTJ6bS0yIDFIOHYtNmMwLTIuNDggMS41MS00LjUgNC00LjVzNCAyLjAyIDQgNC41djZ6Jy8+PC9zdmc+"
        style="width: 48rpx; height: 48rpx;"
        mode="aspectFit"
      />
    </movable-view>
  </movable-area>
</template>

<script>
export default {
  name: 'AnnouncementFloatingBall',
  data() {
    return {
      dragging: false,
      posX: 0,
      posY: 0,
      startX: 0,
      startY: 0,
      lastTapTime: 0,
      sys: null,
      bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0 },
      ballPx: 0,
      snapPx: 0
    }
  },
  mounted() {
    this.initPosition()
  },
  methods: {
    initPosition() {
      let sys = null
      try {
        if (typeof wx !== 'undefined' && typeof wx.getSystemInfoSync === 'function') sys = wx.getSystemInfoSync()
        else if (typeof uni !== 'undefined' && typeof uni.getSystemInfoSync === 'function') sys = uni.getSystemInfoSync()
      } catch (e) { sys = null }
      this.sys = sys

      const windowWidth = Number(sys?.windowWidth || 0) || 375
      const windowHeight = Number(sys?.windowHeight || 0) || 667
      const safeArea = sys?.safeArea || { left: 0, top: 0, right: windowWidth, bottom: windowHeight }

      let capsuleBottom = 0
      try {
        if (typeof wx !== 'undefined' && typeof wx.getMenuButtonBoundingClientRect === 'function') {
          const rect = wx.getMenuButtonBoundingClientRect()
          capsuleBottom = Number(rect?.bottom || 0) || 0
        }
      } catch (e) { capsuleBottom = 0 }

      const rpx2px = (rpx) => (Number(rpx || 0) * windowWidth) / 750
      const ballPx = rpx2px(72)
      const snapPx = rpx2px(20)
      const topInset = Math.max(Number(safeArea.top || 0) || 0, capsuleBottom ? capsuleBottom + rpx2px(8) : 0)
      const bottomInset = Number(windowHeight - (safeArea.bottom || windowHeight)) || 0

      const minX = Number(safeArea.left || 0) || 0
      const maxX = Math.max(minX, (Number(safeArea.right || windowWidth) || windowWidth) - ballPx)
      const minY = topInset
      const maxY = Math.max(minY, (Number(safeArea.bottom || windowHeight) || windowHeight) - bottomInset - ballPx)

      this.ballPx = ballPx
      this.snapPx = snapPx
      this.bounds = { minX, maxX, minY, maxY }

      const cached = this.readCachedPos()
      if (cached) {
        const x = this.clamp(Number(cached.x || 0), minX, maxX)
        const y = this.clamp(Number(cached.y || 0), minY, maxY)
        this.posX = x
        this.posY = y
        this._lastX = x
        this._lastY = y
        this.syncGlobalPos(x, y)
        return
      }

      const defaultX = maxX
      const defaultY = this.clamp((Number(safeArea.top || 0) || 0) + ((Number(safeArea.bottom || windowHeight) || windowHeight) - (Number(safeArea.top || 0) || 0) - ballPx) / 2, minY, maxY)
      this.posX = defaultX
      this.posY = defaultY
      this._lastX = defaultX
      this._lastY = defaultY
      this.syncGlobalPos(defaultX, defaultY)
    },
    readCachedPos() {
      try {
        const app = typeof getApp === 'function' ? getApp() : null
        const gd = app && app.globalData ? app.globalData : null
        const gpos = gd && gd.floatingBallPos ? gd.floatingBallPos : null
        if (gpos && (gpos.x !== undefined) && (gpos.y !== undefined)) return gpos
      } catch (e) {}

      try {
        if (typeof wx !== 'undefined' && typeof wx.getStorageSync === 'function') return wx.getStorageSync('floatingBallPos') || null
        if (typeof uni !== 'undefined' && typeof uni.getStorageSync === 'function') return uni.getStorageSync('floatingBallPos') || null
      } catch (e) {}
      return null
    },
    persistPos(x, y) {
      const px = this.clamp(Number(x ?? this.posX ?? 0), this.bounds.minX, this.bounds.maxX)
      const py = this.clamp(Number(y ?? this.posY ?? 0), this.bounds.minY, this.bounds.maxY)
      try {
        if (typeof wx !== 'undefined' && typeof wx.setStorageSync === 'function') wx.setStorageSync('floatingBallPos', { x: px, y: py })
        else if (typeof uni !== 'undefined' && typeof uni.setStorageSync === 'function') uni.setStorageSync('floatingBallPos', { x: px, y: py })
      } catch (e) {}
      this.syncGlobalPos(px, py)
    },
    syncGlobalPos(x, y) {
      try {
        const app = typeof getApp === 'function' ? getApp() : null
        if (app && app.globalData) app.globalData.floatingBallPos = { x, y }
      } catch (e) {}
    },
    clamp(v, min, max) {
      const n = Number(v || 0) || 0
      if (n < min) return min
      if (n > max) return max
      return n
    },
    handleMove(e) {
      const detail = e?.detail || {}
      if (detail.x !== undefined) this._lastX = detail.x
      if (detail.y !== undefined) this._lastY = detail.y
    },
    handleDragStart() {
      this.dragging = true
      this.startX = this.posX
      this.startY = this.posY
      this._lastX = this.posX
      this._lastY = this.posY
    },
    handleDragEnd() {
      this.dragging = false
      const endX = Number(this._lastX ?? this.posX ?? 0)
      const endY = Number(this._lastY ?? this.posY ?? 0)
      const dist = Math.hypot(endX - this.startX, endY - this.startY)
      if (dist < 5) {
        // 视为点击
        this.handleTap()
        return
      }

      const { minX, maxX } = this.bounds
      const x = this.clamp(endX, minX, maxX)
      const y = this.clamp(endY, this.bounds.minY, this.bounds.maxY)

      const nearLeft = x - minX <= this.snapPx
      const nearRight = maxX - x <= this.snapPx
      const snappedX = nearLeft ? minX : (nearRight ? maxX : x)

      this.posX = snappedX
      this.posY = y
      this._lastX = snappedX
      this._lastY = y
      this.persistPos(snappedX, y)
    },
    handleTap() {
      const now = Date.now()
      if (this.lastTapTime && (now - this.lastTapTime < 500)) return
      this.lastTapTime = now

      try {
        const pages = (typeof getCurrentPages === 'function') ? getCurrentPages() : []
        const cur = pages && pages.length ? pages[pages.length - 1] : null
        const route = cur?.route || ''
        if (route.includes('announcement')) return
      } catch (e) {}

      try {
        if (typeof uni !== 'undefined' && typeof uni.navigateTo === 'function') {
          uni.navigateTo({ 
            url: '/pages/announcement/index',
            fail: (err) => {
              console.error('Floating ball navigation failed:', err)
              // 尝试 switchTab 以防它是 tabbar 页面（虽然 pages.json 显示不是）
              uni.switchTab({ url: '/pages/announcement/index' })
            }
          })
        }
      } catch (e) {}
    }
  }
}
</script>

<style scoped>
.floating-area {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  z-index: 10000;
  pointer-events: none;
}

.floating-ball {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  transform: scale(1);
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.18);
  transition: transform 160ms ease, box-shadow 160ms ease;
}

.floating-ball.dragging {
  transform: scale(0.95);
  box-shadow: 0 14rpx 34rpx rgba(0, 0, 0, 0.28);
}
</style>
