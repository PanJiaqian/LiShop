"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return { product: null, current: 0, qty: 1 };
  },
  onLoad(query) {
    const id = decodeURIComponent((query == null ? void 0 : query.id) || "");
    const base = { id, title: "商品 " + (id || "X"), price: 199, sales: 100, image: "/static/logo.png", images: ["/static/logo.png", "/static/logo.png", "/static/logo.png"] };
    this.product = base;
  },
  methods: {
    addToCart() {
      try {
        const cart = common_vendor.index.getStorageSync("cart") || [];
        const i = cart.findIndex((it) => it.id === this.product.id);
        if (i >= 0)
          cart[i].quantity = (cart[i].quantity || 1) + 1;
        else
          cart.push({ ...this.product, quantity: 1 });
        common_vendor.index.setStorageSync("cart", cart);
        common_vendor.index.showToast({ title: "已加入购物车", icon: "success" });
      } catch (e) {
        console.error(e);
      }
    },
    incQty() {
      this.qty += 1;
    },
    decQty() {
      this.qty = Math.max(1, this.qty - 1);
    },
    addToCartWithQty() {
      try {
        const cart = common_vendor.index.getStorageSync("cart") || [];
        const i = cart.findIndex((it) => it.id === this.product.id);
        if (i >= 0)
          cart[i].quantity = (cart[i].quantity || 1) + this.qty;
        else
          cart.push({ ...this.product, quantity: this.qty });
        common_vendor.index.setStorageSync("cart", cart);
        common_vendor.index.showToast({ title: "已加入购物车", icon: "success" });
      } catch (e) {
        console.error(e);
      }
    },
    buyNow() {
      common_vendor.index.showToast({ title: "暂未接入下单", icon: "none" });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.product
  }, $data.product ? {
    b: $data.product.image || "/static/logo.png",
    c: common_vendor.t($data.product.title),
    d: common_vendor.t($data.product.price.toFixed(2)),
    e: common_vendor.t($data.product.sales),
    f: common_vendor.o((...args) => $options.addToCart && $options.addToCart(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-a911e391"]]);
wx.createPage(MiniProgramPage);
