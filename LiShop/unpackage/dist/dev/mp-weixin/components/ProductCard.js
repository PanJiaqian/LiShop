"use strict";
const common_vendor = require("../common/vendor.js");
const LoginPrompt = () => "./LoginPrompt.js";
const _sfc_main = {
  name: "ProductCard",
  props: {
    product: { type: Object, required: true }
  },
  emits: ["add-to-cart"],
  data() {
    return { showLoginModal: false };
  },
  components: { LoginPrompt },
  computed: {
    priceDisplay() {
      try {
        const v = this.product && this.product.price;
        if (v === "-" || v === "—")
          return "登录可查看售价";
        const n = Number(v);
        if (isNaN(n))
          return "---";
        return "¥" + n.toFixed(2);
      } catch (e) {
        return "---";
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
        this.showLoginModal = true;
        return false;
      } catch (e) {
        return false;
      }
    },
    closeLoginModal() {
      this.showLoginModal = false;
    },
    goLogin() {
      this.showLoginModal = false;
      common_vendor.index.navigateTo({ url: "/pages/login/index" });
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
if (!Array) {
  const _component_LoginPrompt = common_vendor.resolveComponent("LoginPrompt");
  _component_LoginPrompt();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o($options.closeLoginModal),
    b: common_vendor.o($options.goLogin),
    c: common_vendor.p({
      visible: $data.showLoginModal
    }),
    d: $props.product.image || "/static/logo.png",
    e: common_vendor.t($props.product.title),
    f: common_vendor.t($options.priceDisplay),
    g: common_vendor.t($props.product.sales),
    h: common_vendor.o((...args) => $options.openDetail && $options.openDetail(...args))
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-fe52aa40"]]);
wx.createComponent(Component);
