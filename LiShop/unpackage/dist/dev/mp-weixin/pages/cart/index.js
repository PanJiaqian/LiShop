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
    },
    selectedTotal() {
      return this.cart.reduce((s, it) => s + (it.selected ? it.price * (it.quantity || 1) : 0), 0);
    },
    selectedCount() {
      return this.cart.filter((it) => it.selected).length;
    },
    isAllSelected() {
      return this.cart.length > 0 && this.selectedCount === this.cart.length;
    },
    selectedThumbs() {
      return this.cart.filter((it) => it.selected).slice(0, 2).map((it) => it.image || "/static/logo.png");
    },
    officialReduce() {
      return this.cart.reduce((s, it) => s + (it.selected ? it.officialReduce || 0 : 0), 0);
    },
    redReduce() {
      return this.cart.reduce((s, it) => s + (it.selected ? it.redReduce || 0 : 0), 0);
    },
    extraReduce() {
      return this.cart.reduce((s, it) => s + (it.selected ? it.reduce || 0 : 0), 0);
    },
    totalReduce() {
      return this.officialReduce + this.redReduce + this.extraReduce;
    },
    payable() {
      return Math.max(0, this.selectedTotal - this.totalReduce);
    },
    needForCoupon() {
      const need = Math.max(0, 800 - this.payable);
      return need.toFixed(2);
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
      this.cart = (this.cart || []).map((it) => ({
        ...it,
        quantity: it.quantity || 1,
        selected: !!it.selected
      }));
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
    removeSelected() {
      this.cart = this.cart.filter((it) => !it.selected);
      this.sync();
    },
    toggle(i) {
      this.cart[i].selected = !this.cart[i].selected;
      this.sync();
    },
    toggleAll() {
      const makeSelected = !(this.selectedCount === this.cart.length && this.cart.length > 0);
      this.cart.forEach((it) => it.selected = makeSelected);
      this.sync();
    },
    clear() {
      this.cart = [];
      this.sync();
    },
    checkout() {
      if (this.selectedCount === 0) {
        common_vendor.index.showToast({ title: "请选择商品", icon: "none" });
        return;
      }
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
