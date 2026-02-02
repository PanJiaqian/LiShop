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
    common_vendor.index.__f__("log", "at App.vue:4", "App Launch");
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
          try {
            common_vendor.index.$emit("global-login-prompt", { from: path, ts: Date.now() });
          } catch (e) {
          }
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
    common_vendor.index.__f__("log", "at App.vue:36", "App Show");
  },
  onHide: function() {
    common_vendor.index.__f__("log", "at App.vue:39", "App Hide");
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
//# sourceMappingURL=../.sourcemap/mp-weixin/app.js.map
