"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return { messages: [] };
  },
  onShow() {
    try {
      this.messages = common_vendor.index.getStorageSync("messages") || [];
    } catch (e) {
      this.messages = [];
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.messages && $data.messages.length
  }, $data.messages && $data.messages.length ? {
    b: common_vendor.f($data.messages, (m, i, i0) => {
      return {
        a: common_vendor.t(m.time),
        b: common_vendor.t(m.text),
        c: i
      };
    })
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-aedce2fc"]]);
wx.createPage(MiniProgramPage);
