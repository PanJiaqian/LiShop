"use strict";
const common_vendor = require("../../common/vendor.js");
const api_index = require("../../api/index.js");
const common_assets = require("../../common/assets.js");
const Skeleton = () => "../../components/Skeleton.js";
const _sfc_main = {
  components: { Skeleton },
  data() {
    return { username: "", password: "", loading: true, agree: false };
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
    this.loading = false;
  },
  methods: {
    toggleAgree() {
      this.agree = !this.agree;
    },
    openAgreement(type) {
      const map = {
        service: "/pages/agreement/service",
        privacy: "/pages/agreement/privacy"
      };
      const url = map[type] || map.service;
      if (common_vendor.index && common_vendor.index.navigateTo) {
        common_vendor.index.navigateTo({ url });
        return;
      }
      try {
        const base = typeof location !== "undefined" && location.href ? location.href.split("#")[0] : "";
        if (base)
          location.href = base + "#" + url;
      } catch (e) {
      }
    },
    login() {
      if (!this.username || !this.password) {
        common_vendor.index.showToast({ title: "Please enter username and password", icon: "none" });
        return;
      }
      if (!this.agree) {
        common_vendor.index.showToast({ title: "请先阅读并同意协议", icon: "none" });
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
          common_vendor.index.setStorageSync("just_logged_in", true);
        } catch (e) {
        }
        setTimeout(() => {
          try {
            if (common_vendor.index && common_vendor.index.switchTab) {
              common_vendor.index.switchTab({ url: "/pages/home/index" });
              return;
            }
            if (common_vendor.index && common_vendor.index.reLaunch) {
              common_vendor.index.reLaunch({ url: "/pages/home/index" });
              return;
            }
            if (common_vendor.index && common_vendor.index.navigateTo) {
              common_vendor.index.navigateTo({ url: "/pages/home/index" });
              return;
            }
          } catch (e) {
            try {
              common_vendor.index.navigateTo({ url: "/pages/home/index" });
            } catch (e2) {
            }
          }
        }, 300);
      }).catch((err) => {
        common_vendor.index.__f__("error", "at pages/login/index.vue:112", "login error", err);
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
    h: $data.agree ? 1 : "",
    i: common_vendor.o((...args) => $options.toggleAgree && $options.toggleAgree(...args)),
    j: common_vendor.o(($event) => $options.openAgreement("service")),
    k: common_vendor.o(($event) => $options.openAgreement("privacy")),
    l: !$data.agree ? 1 : "",
    m: !$data.agree,
    n: common_vendor.o((...args) => $options.login && $options.login(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-d08ef7d4"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/login/index.js.map
