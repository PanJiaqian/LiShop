"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = {
  name: "LoginPrompt",
  props: {
    visible: { type: Boolean, default: false },
    title: { type: String, default: "提示" },
    desc: { type: String, default: "登录即可查看" },
    cancelText: { type: String, default: "取消" },
    confirmText: { type: String, default: "立即登录" }
  },
  computed: {
    isMp() {
      try {
        return typeof window === "undefined";
      } catch (e) {
        return true;
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $props.visible
  }, $props.visible ? {
    b: common_vendor.t($props.title),
    c: common_vendor.t($props.desc),
    d: common_vendor.t($props.cancelText),
    e: $options.isMp ? 1 : "",
    f: common_vendor.o(($event) => _ctx.$emit("close")),
    g: common_vendor.t($props.confirmText),
    h: $options.isMp ? 1 : "",
    i: common_vendor.o(($event) => _ctx.$emit("confirm")),
    j: $options.isMp ? 1 : "",
    k: common_vendor.o(() => {
    }),
    l: $options.isMp ? 1 : "",
    m: common_vendor.o(($event) => _ctx.$emit("close"))
  } : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-58c6c595"]]);
wx.createComponent(Component);
