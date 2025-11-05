"use strict";
const common_vendor = require("../../common/vendor.js");
const FloatingNav = () => "../../components/FloatingNav.js";
const _sfc_main = {
  components: { FloatingNav },
  data() {
    return { cart: [] };
  },
  computed: {
    total() {
      return this.cart.reduce((s, it) => s + it.price * (it.quantity || 1), 0);
    }
  },
  onShow() {
    this.load();
  },
  methods: {
    load() {
      try {
        this.cart = common_vendor.index.getStorageSync("cart") || [];
      } catch (e) {
        this.cart = [];
      }
    },
    sync() {
      common_vendor.index.setStorageSync("cart", this.cart);
    },
    inc(i) {
      this.cart[i].quantity += 1;
      this.sync();
    },
    dec(i) {
      this.cart[i].quantity = Math.max(1, (this.cart[i].quantity || 1) - 1);
      this.sync();
    },
    remove(i) {
      this.cart.splice(i, 1);
      this.sync();
    },
    clear() {
      this.cart = [];
      this.sync();
    },
    checkout() {
      common_vendor.index.showToast({ title: "暂未接入支付", icon: "none" });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.cart.length
  }, $data.cart.length ? {
    b: common_vendor.f($data.cart, (it, idx, i0) => {
      return {
        a: it.image || "/static/logo.png",
        b: common_vendor.t(it.title),
        c: common_vendor.t(it.price.toFixed(2)),
        d: common_vendor.o(($event) => $options.dec(idx), it.id),
        e: common_vendor.t(it.quantity),
        f: common_vendor.o(($event) => $options.inc(idx), it.id),
        g: common_vendor.o(($event) => $options.remove(idx), it.id),
        h: it.id
      };
    })
  } : {}, {
    c: common_vendor.t($options.total.toFixed(2)),
    d: common_vendor.o((...args) => $options.clear && $options.clear(...args)),
    e: common_vendor.o((...args) => $options.checkout && $options.checkout(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-8039fbf1"]]);
wx.createPage(MiniProgramPage);
