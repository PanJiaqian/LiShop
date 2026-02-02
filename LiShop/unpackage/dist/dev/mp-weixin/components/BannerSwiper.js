"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = {
  name: "BannerSwiper",
  props: {
    images: { type: Array, default: () => ["/static/logo.png", "/static/logo.png"] }
  },
  data() {
    return {
      dragging: false,
      justEndedSwipe: false,
      startX: 0,
      startY: 0,
      threshold: 8
    };
  },
  methods: {
    getPoint(e) {
      try {
        if (e && e.touches && e.touches[0]) {
          return { x: e.touches[0].clientX || e.touches[0].pageX || 0, y: e.touches[0].clientY || e.touches[0].pageY || 0 };
        }
        if (e && e.changedTouches && e.changedTouches[0]) {
          return { x: e.changedTouches[0].clientX || e.changedTouches[0].pageX || 0, y: e.changedTouches[0].clientY || e.changedTouches[0].pageY || 0 };
        }
        return { x: (e == null ? void 0 : e.clientX) || (e == null ? void 0 : e.pageX) || 0, y: (e == null ? void 0 : e.clientY) || (e == null ? void 0 : e.pageY) || 0 };
      } catch (err) {
        return { x: 0, y: 0 };
      }
    },
    onTouchStart(e) {
      const p = this.getPoint(e);
      this.startX = p.x;
      this.startY = p.y;
      this.dragging = false;
      this.justEndedSwipe = false;
    },
    onTouchMove(e) {
      const p = this.getPoint(e);
      const dx = Math.abs((p.x || 0) - (this.startX || 0));
      const dy = Math.abs((p.y || 0) - (this.startY || 0));
      if (dx > this.threshold || dy > this.threshold) {
        this.dragging = true;
      }
    },
    onTouchEnd() {
      if (this.dragging) {
        this.justEndedSwipe = true;
        setTimeout(() => {
          this.justEndedSwipe = false;
        }, 300);
      }
    },
    onMouseDown(e) {
      const p = this.getPoint(e);
      this.startX = p.x;
      this.startY = p.y;
      this.dragging = false;
      this.justEndedSwipe = false;
    },
    onMouseMove(e) {
      const p = this.getPoint(e);
      const dx = Math.abs((p.x || 0) - (this.startX || 0));
      const dy = Math.abs((p.y || 0) - (this.startY || 0));
      if (dx > this.threshold || dy > this.threshold) {
        this.dragging = true;
      }
    },
    onMouseUp() {
      if (this.dragging) {
        this.justEndedSwipe = true;
        setTimeout(() => {
          this.justEndedSwipe = false;
        }, 300);
      }
    },
    onClick(item) {
      if (this.dragging || this.justEndedSwipe)
        return;
      const id = item.id || "";
      if (id) {
        common_vendor.index.navigateTo({ url: "/pages/product/index?id=" + id });
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.f($props.images, (item, idx, i0) => {
      return {
        a: item.image || item,
        b: idx,
        c: common_vendor.o(($event) => $options.onClick(item), idx)
      };
    }),
    b: common_vendor.o((...args) => $options.onTouchStart && $options.onTouchStart(...args)),
    c: common_vendor.o((...args) => $options.onTouchMove && $options.onTouchMove(...args)),
    d: common_vendor.o((...args) => $options.onTouchEnd && $options.onTouchEnd(...args)),
    e: common_vendor.o((...args) => $options.onMouseDown && $options.onMouseDown(...args)),
    f: common_vendor.o((...args) => $options.onMouseMove && $options.onMouseMove(...args)),
    g: common_vendor.o((...args) => $options.onMouseUp && $options.onMouseUp(...args))
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-0577c1c5"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/BannerSwiper.js.map
