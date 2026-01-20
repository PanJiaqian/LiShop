"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = {
  name: "ProductCard",
  props: {
    product: { type: Object, required: true }
  },
  emits: ["add-to-cart"],
  computed: {
    priceDisplay() {
      try {
        const v = this.product && this.product.price;
        if (v === "-" || v === "—")
          return "-";
        const n = Number(v);
        if (isNaN(n))
          return "-";
        return "¥" + n.toFixed(2);
      } catch (e) {
        return "-";
      }
    }
  },
  methods: {
    ensureLoggedIn() {
      try {
        const u = common_vendor.index.getStorageSync("user") || null;
        const exp = common_vendor.index.getStorageSync("token_expiration") || 0;
        const ok = !!u && (!exp || Date.now() < exp);
        if (ok)
          return true;
        common_vendor.index.showModal({
          title: "提示",
          content: "点击前往登陆的话就跳转到登陆页面",
          cancelText: "取消",
          confirmText: "去登录",
          success: (res) => {
            if (res && res.confirm) {
              try {
                common_vendor.index.navigateTo({ url: "/pages/login/index" });
              } catch (e) {
              }
            }
          }
        });
        return false;
      } catch (e) {
        return false;
      }
    },
    add() {
      this.$emit("add-to-cart", this.product);
    },
    openDetail() {
      var _a;
      if (!this.ensureLoggedIn())
        return;
      const id = ((_a = this.product) == null ? void 0 : _a.id) ?? "";
      const url = "/pages/product/index?id=" + encodeURIComponent(id);
      if (typeof window !== "undefined" && window.open) {
        const base = typeof location !== "undefined" && location.href ? location.href.split("#")[0] : "";
        const full = base ? base + "#/pages/product/index?id=" + encodeURIComponent(id) : url;
        window.open(full, "_blank");
      } else {
        common_vendor.index.navigateTo({ url });
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $props.product.image || "/static/logo.png",
    b: common_vendor.t($props.product.title),
    c: common_vendor.t($options.priceDisplay),
    d: common_vendor.t($props.product.sales),
    e: common_vendor.o((...args) => $options.openDetail && $options.openDetail(...args))
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-fe52aa40"]]);
wx.createComponent(Component);
