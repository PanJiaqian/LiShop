"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = {
  name: "BannerSwiper",
  props: {
    images: { type: Array, default: () => ["/static/logo.png", "/static/logo.png"] }
  },
  methods: {
    onClick(item) {
      const id = item.id || "";
      if (id) {
        common_vendor.index.navigateTo({ url: "/pages/product/index?id=" + id });
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.f($props.images, (item, idx, i0) => {
      return {
        a: item.image || item,
        b: idx,
        c: common_vendor.o(($event) => $options.onClick(item), idx)
      };
    })
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-0577c1c5"]]);
wx.createComponent(Component);
