"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
if (!Math) {
  "./pages/login/index.js";
  "./pages/home/index.js";
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
}
const _sfc_main = {
  onLaunch: function() {
    console.log("App Launch");
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
