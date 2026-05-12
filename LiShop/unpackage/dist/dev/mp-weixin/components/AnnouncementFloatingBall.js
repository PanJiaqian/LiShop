"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = {
  name: "AnnouncementFloatingBall",
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
    };
  },
  mounted() {
    this.initPosition();
  },
  methods: {
    initPosition() {
      let sys = null;
      try {
        if (typeof common_vendor.wx$1 !== "undefined" && typeof common_vendor.wx$1.getSystemInfoSync === "function")
          sys = common_vendor.wx$1.getSystemInfoSync();
        else if (typeof common_vendor.index !== "undefined" && typeof common_vendor.index.getSystemInfoSync === "function")
          sys = common_vendor.index.getSystemInfoSync();
      } catch (e) {
        sys = null;
      }
      this.sys = sys;
      const windowWidth = Number((sys == null ? void 0 : sys.windowWidth) || 0) || 375;
      const windowHeight = Number((sys == null ? void 0 : sys.windowHeight) || 0) || 667;
      const safeArea = (sys == null ? void 0 : sys.safeArea) || { left: 0, top: 0, right: windowWidth, bottom: windowHeight };
      let capsuleBottom = 0;
      try {
        if (typeof common_vendor.wx$1 !== "undefined" && typeof common_vendor.wx$1.getMenuButtonBoundingClientRect === "function") {
          const rect = common_vendor.wx$1.getMenuButtonBoundingClientRect();
          capsuleBottom = Number((rect == null ? void 0 : rect.bottom) || 0) || 0;
        }
      } catch (e) {
        capsuleBottom = 0;
      }
      const rpx2px = (rpx) => Number(rpx || 0) * windowWidth / 750;
      const ballPx = rpx2px(72);
      const snapPx = rpx2px(20);
      const topInset = Math.max(Number(safeArea.top || 0) || 0, capsuleBottom ? capsuleBottom + rpx2px(8) : 0);
      const bottomInset = Number(windowHeight - (safeArea.bottom || windowHeight)) || 0;
      const minX = Number(safeArea.left || 0) || 0;
      const maxX = Math.max(minX, (Number(safeArea.right || windowWidth) || windowWidth) - ballPx);
      const minY = topInset;
      const maxY = Math.max(minY, (Number(safeArea.bottom || windowHeight) || windowHeight) - bottomInset - ballPx);
      this.ballPx = ballPx;
      this.snapPx = snapPx;
      this.bounds = { minX, maxX, minY, maxY };
      const cached = this.readCachedPos();
      if (cached) {
        const x = this.clamp(Number(cached.x || 0), minX, maxX);
        const y = this.clamp(Number(cached.y || 0), minY, maxY);
        this.posX = x;
        this.posY = y;
        this._lastX = x;
        this._lastY = y;
        this.syncGlobalPos(x, y);
        return;
      }
      const defaultX = maxX;
      const defaultY = this.clamp((Number(safeArea.top || 0) || 0) + ((Number(safeArea.bottom || windowHeight) || windowHeight) - (Number(safeArea.top || 0) || 0) - ballPx) / 2, minY, maxY);
      this.posX = defaultX;
      this.posY = defaultY;
      this._lastX = defaultX;
      this._lastY = defaultY;
      this.syncGlobalPos(defaultX, defaultY);
    },
    readCachedPos() {
      try {
        const app = typeof getApp === "function" ? getApp() : null;
        const gd = app && app.globalData ? app.globalData : null;
        const gpos = gd && gd.floatingBallPos ? gd.floatingBallPos : null;
        if (gpos && gpos.x !== void 0 && gpos.y !== void 0)
          return gpos;
      } catch (e) {
      }
      try {
        if (typeof common_vendor.wx$1 !== "undefined" && typeof common_vendor.wx$1.getStorageSync === "function")
          return common_vendor.wx$1.getStorageSync("floatingBallPos") || null;
        if (typeof common_vendor.index !== "undefined" && typeof common_vendor.index.getStorageSync === "function")
          return common_vendor.index.getStorageSync("floatingBallPos") || null;
      } catch (e) {
      }
      return null;
    },
    persistPos(x, y) {
      const px = this.clamp(Number(x ?? this.posX ?? 0), this.bounds.minX, this.bounds.maxX);
      const py = this.clamp(Number(y ?? this.posY ?? 0), this.bounds.minY, this.bounds.maxY);
      try {
        if (typeof common_vendor.wx$1 !== "undefined" && typeof common_vendor.wx$1.setStorageSync === "function")
          common_vendor.wx$1.setStorageSync("floatingBallPos", { x: px, y: py });
        else if (typeof common_vendor.index !== "undefined" && typeof common_vendor.index.setStorageSync === "function")
          common_vendor.index.setStorageSync("floatingBallPos", { x: px, y: py });
      } catch (e) {
      }
      this.syncGlobalPos(px, py);
    },
    syncGlobalPos(x, y) {
      try {
        const app = typeof getApp === "function" ? getApp() : null;
        if (app && app.globalData)
          app.globalData.floatingBallPos = { x, y };
      } catch (e) {
      }
    },
    clamp(v, min, max) {
      const n = Number(v || 0) || 0;
      if (n < min)
        return min;
      if (n > max)
        return max;
      return n;
    },
    handleMove(e) {
      const detail = (e == null ? void 0 : e.detail) || {};
      if (detail.x !== void 0)
        this._lastX = detail.x;
      if (detail.y !== void 0)
        this._lastY = detail.y;
    },
    handleDragStart() {
      this.dragging = true;
      this.startX = this.posX;
      this.startY = this.posY;
      this._lastX = this.posX;
      this._lastY = this.posY;
    },
    handleDragEnd() {
      this.dragging = false;
      const endX = Number(this._lastX ?? this.posX ?? 0);
      const endY = Number(this._lastY ?? this.posY ?? 0);
      const dist = Math.hypot(endX - this.startX, endY - this.startY);
      if (dist < 5) {
        this.handleTap();
        return;
      }
      const { minX, maxX } = this.bounds;
      const x = this.clamp(endX, minX, maxX);
      const y = this.clamp(endY, this.bounds.minY, this.bounds.maxY);
      const nearLeft = x - minX <= this.snapPx;
      const nearRight = maxX - x <= this.snapPx;
      const snappedX = nearLeft ? minX : nearRight ? maxX : x;
      this.posX = snappedX;
      this.posY = y;
      this._lastX = snappedX;
      this._lastY = y;
      this.persistPos(snappedX, y);
    },
    handleTap() {
      const now = Date.now();
      if (this.lastTapTime && now - this.lastTapTime < 500)
        return;
      this.lastTapTime = now;
      try {
        const pages = typeof getCurrentPages === "function" ? getCurrentPages() : [];
        const cur = pages && pages.length ? pages[pages.length - 1] : null;
        const route = (cur == null ? void 0 : cur.route) || "";
        if (route.includes("announcement"))
          return;
      } catch (e) {
      }
      try {
        if (typeof common_vendor.index !== "undefined" && typeof common_vendor.index.navigateTo === "function") {
          common_vendor.index.navigateTo({
            url: "/pages/announcement/index",
            fail: (err) => {
              common_vendor.index.__f__("error", "at components/AnnouncementFloatingBall.vue:190", "Floating ball navigation failed:", err);
              common_vendor.index.switchTab({ url: "/pages/announcement/index" });
            }
          });
        }
      } catch (e) {
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $data.dragging ? 1 : "",
    b: $data.posX,
    c: $data.posY,
    d: common_vendor.o((...args) => $options.handleMove && $options.handleMove(...args)),
    e: common_vendor.o((...args) => $options.handleDragStart && $options.handleDragStart(...args)),
    f: common_vendor.o((...args) => $options.handleDragEnd && $options.handleDragEnd(...args)),
    g: common_vendor.o((...args) => $options.handleTap && $options.handleTap(...args))
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-d63be157"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/AnnouncementFloatingBall.js.map
