"use strict";
const common_vendor = require("../../common/vendor.js");
const Skeleton = () => "../../components/Skeleton.js";
const _sfc_main = {
  components: { Skeleton },
  data() {
    return { messages: [], loading: true };
  },
  onShow() {
    try {
      this.messages = common_vendor.index.getStorageSync("messages") || [];
    } catch (e) {
      this.messages = [];
    }
    this.loading = false;
  }
};
if (!Array) {
  const _component_Skeleton = common_vendor.resolveComponent("Skeleton");
  _component_Skeleton();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.p({
      loading: $data.loading,
      showTitle: true
    }),
    b: $data.messages && $data.messages.length
  }, $data.messages && $data.messages.length ? {
    c: common_vendor.f($data.messages, (m, i, i0) => {
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
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/messages/index.js.map
