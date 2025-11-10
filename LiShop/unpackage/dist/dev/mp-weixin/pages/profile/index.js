"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const FloatingNav = () => "../../components/FloatingNav.js";
const _sfc_main = {
  components: { FloatingNav },
  data() {
    return { loggedIn: false, displayName: "" };
  },
  computed: {
    profile() {
      try {
        const u = common_vendor.index.getStorageSync("user") || null;
        return {
          companyName: (u == null ? void 0 : u.companyName) || "未设置",
          contactName: (u == null ? void 0 : u.contactName) || (u == null ? void 0 : u.username) || "未设置",
          power: (u == null ? void 0 : u.power) || "未设置",
          address: (u == null ? void 0 : u.address) || "未设置",
          level: (u == null ? void 0 : u.level) || "未设置",
          priceGroup: (u == null ? void 0 : u.priceGroup) || "未设置",
          status: (u == null ? void 0 : u.status) || (this.loggedIn ? "正常" : "未登录"),
          region: (u == null ? void 0 : u.region) || "未设置"
        };
      } catch (e) {
        return { companyName: "未设置", contactName: "未设置", power: "未设置", address: "未设置", level: "未设置", priceGroup: "未设置", status: this.loggedIn ? "正常" : "未登录", region: "未设置" };
      }
    }
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
  } : {}, {
    e: common_vendor.t($options.profile.companyName),
    f: common_vendor.t($options.profile.contactName),
    g: common_vendor.t($options.profile.power),
    h: common_vendor.t($options.profile.address),
    i: common_vendor.t($options.profile.level),
    j: common_vendor.t($options.profile.priceGroup),
    k: common_vendor.t($options.profile.status),
    l: common_vendor.t($options.profile.region)
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-201c0da5"]]);
wx.createPage(MiniProgramPage);
