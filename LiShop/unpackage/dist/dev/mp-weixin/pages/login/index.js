"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return { username: "", password: "" };
  },
  methods: {
    login() {
      if (!this.username || !this.password) {
        common_vendor.index.showToast({ title: "请输入账号和密码", icon: "none" });
        return;
      }
      const user = { username: this.username, token: "mock-" + Date.now() };
      try {
        common_vendor.index.setStorageSync("user", user);
      } catch (e) {
      }
      common_vendor.index.showToast({ title: "登录成功", icon: "success" });
      setTimeout(() => {
        if (common_vendor.index.switchTab)
          common_vendor.index.switchTab({ url: "/pages/profile/index" });
        else
          common_vendor.index.navigateTo({ url: "/pages/profile/index" });
      }, 300);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_assets._imports_0,
    b: $data.username,
    c: common_vendor.o(($event) => $data.username = $event.detail.value),
    d: $data.password,
    e: common_vendor.o(($event) => $data.password = $event.detail.value),
    f: common_vendor.o((...args) => $options.login && $options.login(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-d08ef7d4"]]);
wx.createPage(MiniProgramPage);
