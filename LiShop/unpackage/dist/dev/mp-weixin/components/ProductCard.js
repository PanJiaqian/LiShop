"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = {
  name: "ProductCard",
  props: {
    product: { type: Object, required: true }
  },
  emits: ["add-to-cart"],
  methods: {
    add() {
      this.$emit("add-to-cart", this.product);
    },
    openDetail() {
      var _a;
      const id = ((_a = this.product) == null ? void 0 : _a.id) ?? "";
      common_vendor.index.navigateTo({ url: "/pages/product/index?id=" + encodeURIComponent(id) });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $props.product.image || "/static/logo.png",
    b: common_vendor.t($props.product.title),
    c: common_vendor.t($props.product.price.toFixed(2)),
    d: common_vendor.t($props.product.sales),
    e: common_vendor.o((...args) => $options.openDetail && $options.openDetail(...args))
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-fe52aa40"]]);
wx.createComponent(Component);
