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
  data() {
    return {
      rowWidths: []
    };
  },
  watch: {
    rows: {
      immediate: true,
      handler() {
        this.rowWidths = this.buildRowWidths();
      }
    }
  },
  methods: {
    /**
     * 生成稳定的骨架行宽。
     * @description
     * 使用固定序列替代渲染期随机值，避免页面刷新或状态更新时骨架布局抖动。
     * @returns {string[]} 每一行骨架的宽度数组
     * @example
     * const widths = this.buildRowWidths()
     */
    buildRowWidths() {
      const presets = ["92%", "78%", "86%", "64%", "88%", "72%"];
      return Array.from({ length: Number(this.rows || 0) }, (_, index) => presets[index % presets.length]);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $props.loading
  }, $props.loading ? common_vendor.e({
    b: $props.showTitle
  }, $props.showTitle ? {} : {}, {
    c: common_vendor.f($data.rowWidths, (width, index, i0) => {
      return {
        a: index,
        b: width
      };
    }),
    d: $props.showGrid
  }, $props.showGrid ? {
    e: common_vendor.f(4, (j, k0, i0) => {
      return {
        a: "g" + j
      };
    })
  } : {}) : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-bb68c843"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/Skeleton.js.map
