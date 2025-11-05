"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const FloatingNav = () => "../../components/FloatingNav.js";
const _sfc_main = {
  components: { FloatingNav },
  data() {
    return { loggedIn: false, displayName: "" };
  },
  onShow() {
    try {
      const u = common_vendor.index.getStorageSync("user") || null;
      this.loggedIn = !!u;
      this.displayName = (u == null ? void 0 : u.username) || "";
    } catch (e) {
    }
  },
  methods: {
    login() {
      common_vendor.index.navigateTo({ url: "/pages/login/index" });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_assets._imports_0,
    b: common_vendor.t($data.loggedIn ? $data.displayName : "未登录"),
    c: !$data.loggedIn
  }, !$data.loggedIn ? {
    d: common_vendor.o((...args) => $options.login && $options.login(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-201c0da5"]]);
wx.createPage(MiniProgramPage);
