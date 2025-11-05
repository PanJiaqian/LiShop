"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = {
  name: "BannerSwiper",
  props: {
    images: { type: Array, default: () => ["/static/logo.png", "/static/logo.png"] }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.f($props.images, (img, idx, i0) => {
      return {
        a: img,
        b: idx
      };
    })
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-0577c1c5"]]);
wx.createComponent(Component);
