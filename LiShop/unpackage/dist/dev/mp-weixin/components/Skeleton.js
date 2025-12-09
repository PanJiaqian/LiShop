"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = {
  name: "Skeleton",
  props: {
    loading: { type: Boolean, default: false },
    rows: { type: Number, default: 4 },
    showTitle: { type: Boolean, default: false },
    showGrid: { type: Boolean, default: false }
  },
  methods: {
    randomWidth() {
      return 50 + Math.random() * 50 + "%";
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $props.loading
  }, $props.loading ? common_vendor.e({
    b: $props.showTitle
  }, $props.showTitle ? {} : {}, {
    c: common_vendor.f($props.rows, (i, k0, i0) => {
      return {
        a: i
      };
    }),
    d: $options.randomWidth(),
    e: $props.showGrid
  }, $props.showGrid ? {
    f: common_vendor.f(4, (j, k0, i0) => {
      return {
        a: "g" + j
      };
    })
  } : {}) : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-bb68c843"]]);
wx.createComponent(Component);
