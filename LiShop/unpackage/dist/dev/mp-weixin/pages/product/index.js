"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return { product: null, current: 0, qty: 1, specTemp: "", specLength: "", roomName: "", mpSheet: false, mpTemp: "", mpLength: "", mpRoom: "", mpQty: 1 };
  },
  onLoad(query) {
    const id = decodeURIComponent((query == null ? void 0 : query.id) || "");
    const base = { id, title: "商品 " + (id || "X"), price: 199, sales: 100, image: "/static/logo.png", images: ["/static/logo.png", "/static/logo.png", "/static/logo.png"] };
    this.product = base;
  },
  computed: {
    images() {
      var _a;
      const imgs = this.product && this.product.images || [];
      return imgs.length ? imgs : [((_a = this.product) == null ? void 0 : _a.image) || "/static/logo.png"];
    },
    currentImage() {
      const arr = this.images;
      return arr[this.current] || arr[0];
    }
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
      const chosen = (this.roomName || "").trim();
      if (!chosen) {
        common_vendor.index.showToast({ title: "请先填写房间名", icon: "none" });
        return;
      }
      try {
        const cart = common_vendor.index.getStorageSync("cart") || [];
        const i = cart.findIndex((it) => it.id === this.product.id);
        if (i >= 0) {
          cart[i].quantity = (cart[i].quantity || 1) + this.qty;
          cart[i].specTemp = this.specTemp;
          cart[i].specLength = this.specLength;
          cart[i].roomName = chosen;
        } else {
          cart.push({ ...this.product, quantity: this.qty, specTemp: this.specTemp, specLength: this.specLength, roomName: chosen });
        }
        const rooms = common_vendor.index.getStorageSync("rooms") || [];
        if (!rooms.includes(chosen)) {
          rooms.push(chosen);
          common_vendor.index.setStorageSync("rooms", rooms);
        }
        common_vendor.index.setStorageSync("cart", cart);
        common_vendor.index.showToast({ title: `已加入房间：${chosen}`, icon: "success" });
      } catch (e) {
        console.error(e);
      }
    },
    buyNow() {
      common_vendor.index.showToast({ title: "暂未接入下单", icon: "none" });
    },
    // MP-WEIXIN 规格填写
    openSpecSheet() {
      this.mpSheet = true;
    },
    closeSpecSheet() {
      this.mpSheet = false;
    },
    confirmSpecToCart() {
      if (!this.mpRoom || !this.mpTemp || !this.mpLength || !this.mpQty) {
        common_vendor.index.showToast({ title: "请填写房间名、色温、长度、数量", icon: "none" });
        return;
      }
      const chosen = (this.mpRoom || "").trim();
      try {
        const cart = common_vendor.index.getStorageSync("cart") || [];
        const i = cart.findIndex((it) => it.id === this.product.id);
        if (i >= 0) {
          cart[i].quantity = (cart[i].quantity || 1) + this.mpQty;
          cart[i].specTemp = this.mpTemp;
          cart[i].specLength = this.mpLength;
          cart[i].roomName = chosen;
        } else {
          cart.push({ ...this.product, quantity: this.mpQty, specTemp: this.mpTemp, specLength: this.mpLength, roomName: chosen });
        }
        const rooms = common_vendor.index.getStorageSync("rooms") || [];
        if (!rooms.includes(chosen)) {
          rooms.push(chosen);
          common_vendor.index.setStorageSync("rooms", rooms);
        }
        common_vendor.index.setStorageSync("cart", cart);
        this.mpSheet = false;
        common_vendor.index.showToast({ title: `已加入房间：${chosen}`, icon: "success" });
      } catch (e) {
        console.error(e);
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.product
  }, $data.product ? common_vendor.e({
    b: $data.product.image || "/static/logo.png",
    c: common_vendor.t($data.product.title),
    d: common_vendor.t($data.product.price.toFixed(2)),
    e: common_vendor.t($data.product.sales),
    f: common_vendor.t($data.product.id || "默认款"),
    g: common_vendor.t($data.product.title),
    h: common_vendor.t($data.product.price.toFixed(2)),
    i: common_vendor.f($options.images, (src, i, i0) => {
      return {
        a: "md" + i,
        b: src
      };
    }),
    j: common_vendor.o((...args) => $options.openSpecSheet && $options.openSpecSheet(...args)),
    k: $data.mpSheet
  }, $data.mpSheet ? {
    l: $data.mpRoom,
    m: common_vendor.o(($event) => $data.mpRoom = $event.detail.value),
    n: $data.mpTemp,
    o: common_vendor.o(($event) => $data.mpTemp = $event.detail.value),
    p: $data.mpLength,
    q: common_vendor.o(($event) => $data.mpLength = $event.detail.value),
    r: common_vendor.o(($event) => $data.mpQty = Math.max(1, $data.mpQty - 1)),
    s: common_vendor.t($data.mpQty),
    t: common_vendor.o(($event) => $data.mpQty = $data.mpQty + 1),
    v: common_vendor.o((...args) => $options.closeSpecSheet && $options.closeSpecSheet(...args)),
    w: common_vendor.o((...args) => $options.confirmSpecToCart && $options.confirmSpecToCart(...args)),
    x: common_vendor.o(() => {
    }),
    y: common_vendor.o((...args) => $options.closeSpecSheet && $options.closeSpecSheet(...args))
  } : {}) : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-a911e391"]]);
wx.createPage(MiniProgramPage);
