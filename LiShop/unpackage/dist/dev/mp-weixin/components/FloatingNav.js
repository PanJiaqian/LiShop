"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = {
  name: "FloatingNav",
  props: {
    bottomSafe: { type: Number, default: 120 }
    // 与 tabBar 避让距离（rpx）
  },
  data() {
    return { cartCount: 0 };
  },
  computed: {
    styleFix() {
      return `bottom:${this.bottomSafe}rpx;`;
    }
  },
  mounted() {
    this.loadCart();
  },
  methods: {
    loadCart() {
      try {
        const c = common_vendor.index.getStorageSync("cart") || [];
        this.cartCount = c.reduce((s, it) => s + (it.quantity || 1), 0);
      } catch (e) {
      }
    },
    goHome() {
      common_vendor.index.switchTab ? common_vendor.index.switchTab({ url: "/pages/home/index" }) : common_vendor.index.navigateTo({ url: "/pages/home/index" });
    },
    goCart() {
      common_vendor.index.switchTab ? common_vendor.index.switchTab({ url: "/pages/cart/index" }) : common_vendor.index.navigateTo({ url: "/pages/cart/index" });
    },
    contact() {
      common_vendor.index.showToast({ title: "客服暂未接入", icon: "none" });
    },
    toTop() {
      common_vendor.index.pageScrollTo({ scrollTop: 0, duration: 300 });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.goHome && $options.goHome(...args)),
    b: $data.cartCount > 0
  }, $data.cartCount > 0 ? {
    c: common_vendor.t($data.cartCount)
  } : {}, {
    d: common_vendor.o((...args) => $options.goCart && $options.goCart(...args)),
    e: common_vendor.o((...args) => $options.contact && $options.contact(...args)),
    f: common_vendor.o((...args) => $options.toTop && $options.toTop(...args)),
    g: common_vendor.s($options.styleFix)
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-378faae9"]]);
wx.createComponent(Component);
