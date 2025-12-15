"use strict";
const common_vendor = require("../../common/vendor.js");
const api_index = require("../../api/index.js");
const common_assets = require("../../common/assets.js");
const Skeleton = () => "../../components/Skeleton.js";
const _sfc_main = {
  components: { Skeleton },
  data() {
    return { username: "", password: "", loading: false };
  },
  onShow() {
    try {
      const u = common_vendor.index.getStorageSync("user") || null;
      const exp = common_vendor.index.getStorageSync("token_expiration") || 0;
      const valid = !!u && (!exp || Date.now() < exp);
      if (valid) {
        if (common_vendor.index && common_vendor.index.switchTab) {
          common_vendor.index.switchTab({ url: "/pages/home/index" });
          return;
        }
        if (common_vendor.index && common_vendor.index.navigateTo) {
          common_vendor.index.navigateTo({ url: "/pages/home/index" });
          return;
        }
      }
    } catch (e) {
    }
  },
  methods: {
    login() {
      if (!this.username || !this.password) {
        common_vendor.index.showToast({ title: "Please enter username and password", icon: "none" });
        return;
      }
      const payload = { phone: this.username, password: this.password };
      common_vendor.index.showLoading({ title: "Logging in...", mask: true });
      api_index.loginAdmin(payload).then((dataRaw) => {
        let data = dataRaw;
        if (typeof data === "string") {
          try {
            data = JSON.parse(data);
          } catch (e) {
          }
        }
        const user = { username: this.username, ...data || {} };
        try {
          common_vendor.index.setStorageSync("user", user);
          common_vendor.index.setStorageSync("token_expiration", Date.now() + 4 * 24 * 60 * 60 * 1e3);
        } catch (e) {
        }
        setTimeout(() => {
          common_vendor.index.switchTab({ url: "/pages/home/index" });
        }, 300);
      }).catch((err) => {
        console.error("login error", err);
        common_vendor.index.showToast({ title: "账号或密码错误", icon: "none" });
      }).finally(() => {
        try {
          common_vendor.index.hideLoading();
        } catch (e) {
        }
      });
    }
  }
};
if (!Array) {
  const _component_Skeleton = common_vendor.resolveComponent("Skeleton");
  _component_Skeleton();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.p({
      loading: $data.loading
    }),
    b: common_assets._imports_0,
    c: common_assets._imports_1,
    d: $data.username,
    e: common_vendor.o(($event) => $data.username = $event.detail.value),
    f: $data.password,
    g: common_vendor.o(($event) => $data.password = $event.detail.value),
    h: common_vendor.o((...args) => $options.login && $options.login(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-d08ef7d4"]]);
wx.createPage(MiniProgramPage);
