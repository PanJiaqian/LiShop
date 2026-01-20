"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
if (!Math) {
  "./pages/home/index.js";
  "./pages/login/index.js";
  "./pages/announcement/index.js";
  "./pages/favorites/index.js";
  "./pages/category/index.js";
  "./pages/cart/index.js";
  "./pages/profile/index.js";
  "./pages/product/index.js";
  "./pages/order/index.js";
  "./pages/settings/index.js";
  "./pages/messages/index.js";
  "./pages/search/index.js";
  "./pages/category/list.js";
  "./pages/address/index.js";
  "./pages/address/edit.js";
  "./pages/webview/index.js";
}
const _sfc_main = {
  onLaunch: function() {
    console.log("App Launch");
    try {
      const allowed = /* @__PURE__ */ new Set(["/pages/search/index", "/pages/category/list"]);
      allowed.add("/pages/category/index");
      allowed.add("/pages/home/index");
      allowed.add("/pages/login/index");
      const isLoggedIn = () => {
        try {
          const u = common_vendor.index.getStorageSync("user") || null;
          const exp = common_vendor.index.getStorageSync("token_expiration") || 0;
          return !!u && (!exp || Date.now() < exp);
        } catch (e) {
          return false;
        }
      };
      const guard = (args) => {
        try {
          if (isLoggedIn())
            return true;
          const raw = args && args.url || "";
          const path = raw.split("?")[0];
          if (allowed.has(path))
            return true;
          common_vendor.index.showModal({
            title: "提示",
            content: "点击前往登陆的话就跳转到登陆页面",
            cancelText: "取消",
            confirmText: "去登录",
            success: (res) => {
              if (res && res.confirm) {
                try {
                  common_vendor.index.navigateTo({ url: "/pages/login/index" });
                } catch (e) {
                }
              }
            }
          });
          return false;
        } catch (e) {
          return false;
        }
      };
      if (common_vendor.index && typeof common_vendor.index.addInterceptor === "function") {
        common_vendor.index.addInterceptor("navigateTo", { invoke: guard });
        common_vendor.index.addInterceptor("switchTab", { invoke: guard });
        common_vendor.index.addInterceptor("reLaunch", { invoke: guard });
        common_vendor.index.addInterceptor("redirectTo", { invoke: guard });
      }
    } catch (e) {
    }
  },
  onShow: function() {
    console.log("App Show");
  },
  onHide: function() {
    console.log("App Hide");
  }
};
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
