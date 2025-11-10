"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = {
  name: "CategoryGrid",
  props: {
    categories: { type: Array, default: () => [] }
  },
  methods: {
    go(cat) {
      if (common_vendor.index.switchTab) {
        common_vendor.index.switchTab({ url: "/pages/category/index" });
      } else {
        common_vendor.index.navigateTo({ url: "/pages/category/index" });
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.f($props.categories, (cat, idx, i0) => {
      return {
        a: cat.icon || "/static/logo.png",
        b: common_vendor.t(cat.name),
        c: idx,
        d: common_vendor.o(($event) => $options.go(cat), idx)
      };
    })
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-0f220ffa"]]);
wx.createComponent(Component);
