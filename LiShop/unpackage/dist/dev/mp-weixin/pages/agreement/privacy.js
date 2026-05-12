"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {};
  },
  computed: {
    isH5() {
      try {
        return typeof window !== "undefined";
      } catch (e) {
        return false;
      }
    }
  },
  methods: {
    goBack() {
      try {
        if (typeof window !== "undefined" && window.history && window.history.length > 1) {
          window.history.back();
          return;
        }
      } catch (e) {
      }
      if (common_vendor.index && common_vendor.index.navigateBack) {
        common_vendor.index.navigateBack({ delta: 1 });
        return;
      }
      if (common_vendor.index && common_vendor.index.switchTab) {
        common_vendor.index.switchTab({ url: "/pages/home/index" });
        return;
      }
      if (common_vendor.index && common_vendor.index.navigateTo) {
        common_vendor.index.navigateTo({ url: "/pages/home/index" });
        return;
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $options.isH5
  }, $options.isH5 ? {
    b: common_vendor.o((...args) => $options.goBack && $options.goBack(...args))
  } : {}, {
    c: $options.isH5 ? 1 : ""
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-d015f332"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/agreement/privacy.js.map
