"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = {
  name: "OnboardingGuide",
  props: {
    visible: { type: Boolean, default: false },
    initialIndex: { type: Number, default: 0 },
    targets: { type: Array, default: () => [] },
    steps: {
      type: Array,
      default() {
        return [
          "顶部搜索可快速查找商品与店铺",
          "左侧分类导航支持展开子分类",
          "轮播图可直达热门商品",
          "猜你喜欢展示为你推荐的商品",
          "我的与购物车位于右侧快捷入口",
          "商品卡片支持查看详情与加入购物车",
          "订单页面查看物流、支付与历史订单",
          "个人中心管理头像、地址与偏好设置"
        ];
      }
    }
  },
  data() {
    return { current: 0, winW: 360, winH: 640 };
  },
  watch: {
    initialIndex: {
      immediate: true,
      handler(val) {
        const i = Number(val || 0);
        if (i >= 0 && i < this.steps.length)
          this.current = i;
      }
    }
  },
  mounted() {
    try {
      const s = typeof common_vendor.index !== "undefined" && common_vendor.index.getSystemInfoSync ? common_vendor.index.getSystemInfoSync() : null;
      const ww = s && (s.windowWidth || s.screenWidth) || (typeof window !== "undefined" ? window.innerWidth : this.winW);
      const wh = s && (s.windowHeight || s.screenHeight) || (typeof window !== "undefined" ? window.innerHeight : this.winH);
      this.winW = ww || this.winW;
      this.winH = wh || this.winH;
    } catch (e) {
    }
  },
  computed: {
    currentRect() {
      const r = this.targets && this.targets[this.current];
      if (!r)
        return null;
      const pad = 8;
      return {
        left: Math.max(0, (r.left || 0) - pad),
        top: Math.max(0, (r.top || 0) - pad),
        width: (r.width || 0) + pad * 2,
        height: (r.height || 0) + pad * 2
      };
    },
    highlightStyle() {
      const r = this.currentRect;
      if (!r)
        return {};
      return {
        left: r.left + "px",
        top: r.top + "px",
        width: r.width + "px",
        height: r.height + "px"
      };
    },
    orientation() {
      const r = this.currentRect;
      if (!r)
        return "bottom";
      const topSpace = r.top;
      const bottomSpace = Math.max(0, this.winH - (r.top + r.height));
      const leftSpace = r.left;
      const rightSpace = Math.max(0, this.winW - (r.left + r.width));
      const maxSpace = Math.max(topSpace, bottomSpace, leftSpace, rightSpace);
      if (maxSpace === bottomSpace)
        return "bottom";
      if (maxSpace === topSpace)
        return "top";
      if (maxSpace === rightSpace)
        return "right";
      return "left";
    },
    panelWidth() {
      const w = Math.min(320, Math.max(240, this.winW - 24));
      return w;
    },
    panelHeight() {
      return 140;
    },
    extraBottomMargin() {
      const isMp = typeof window === "undefined";
      const t = String(this.steps && this.steps[this.current] || "");
      const hit = t.indexOf("个人信息") >= 0 || t.indexOf("房间选择") >= 0;
      return isMp && hit ? 60 : 0;
    },
    panelStyle() {
      const r = this.currentRect;
      if (!r) {
        const fallbackLeft = Math.max(12, (this.winW - this.panelWidth) / 2);
        const fallbackTop = Math.max(12, this.winH - this.panelHeight - 20 - this.extraBottomMargin);
        return {
          position: "fixed",
          left: fallbackLeft + "px",
          top: fallbackTop + "px",
          width: this.panelWidth + "px",
          minHeight: this.panelHeight + "px"
        };
      }
      const gap = 12;
      let top = 0;
      let left = 0;
      if (this.orientation === "bottom") {
        top = r.top + r.height + gap;
        left = r.left + r.width / 2 - this.panelWidth / 2;
      } else if (this.orientation === "top") {
        top = r.top - this.panelHeight - gap;
        left = r.left + r.width / 2 - this.panelWidth / 2;
      } else if (this.orientation === "right") {
        top = r.top + r.height / 2 - this.panelHeight / 2;
        left = r.left + r.width + gap;
      } else {
        top = r.top + r.height / 2 - this.panelHeight / 2;
        left = r.left - this.panelWidth - gap;
      }
      const clamp = (v, min, max) => Math.max(min, Math.min(v, max));
      left = clamp(left, 12, Math.max(12, this.winW - this.panelWidth - 12));
      top = clamp(top, 12, Math.max(12, this.winH - this.panelHeight - 12 - this.extraBottomMargin));
      return {
        position: "fixed",
        left: left + "px",
        top: top + "px",
        width: this.panelWidth + "px",
        minHeight: this.panelHeight + "px"
      };
    }
  },
  methods: {
    onNext() {
      this.$emit("advance", this.current + 1);
    },
    onPrev() {
      this.$emit("back", this.current - 1);
    },
    finish() {
      this.$emit("close");
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $options.currentRect
  }, $options.currentRect ? {
    b: common_vendor.s($options.highlightStyle)
  } : {}, {
    c: common_vendor.t($props.steps[$data.current]),
    d: $data.current === 0,
    e: common_vendor.o((...args) => $options.onPrev && $options.onPrev(...args)),
    f: common_vendor.t($data.current + 1),
    g: common_vendor.t($props.steps.length),
    h: $data.current < $props.steps.length - 1
  }, $data.current < $props.steps.length - 1 ? {
    i: common_vendor.o((...args) => $options.onNext && $options.onNext(...args))
  } : {
    j: common_vendor.o((...args) => $options.finish && $options.finish(...args))
  }, {
    k: common_vendor.o((...args) => $options.finish && $options.finish(...args)),
    l: common_vendor.s($options.panelStyle),
    m: common_vendor.n("orient-" + $options.orientation)
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-b416fa2a"]]);
wx.createComponent(Component);
