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
  onLaunch: function(args) {
    common_vendor.index.__f__("log", "at App.vue:4", "App Launch");
    try {
      const scene = Number(args && args.scene) || 0;
      const fromShare = scene === 1007 || scene === 1008 || scene === 1044 || scene === 1096 || scene === 1154 || scene === 1155;
      if (fromShare) {
        try {
          common_vendor.index.reLaunch({ url: "/pages/home/index" });
        } catch (e) {
        }
      }
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
      const guard = (args2) => {
        try {
          if (isLoggedIn())
            return true;
          const raw = args2 && args2.url || "";
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
  onShow: function(args) {
    common_vendor.index.__f__("log", "at App.vue:41", "App Show");
    try {
      const scene = Number(args && args.scene) || 0;
      const fromShare = scene === 1007 || scene === 1008 || scene === 1044 || scene === 1096 || scene === 1154 || scene === 1155;
      if (fromShare) {
        try {
          common_vendor.index.reLaunch({ url: "/pages/home/index" });
        } catch (e) {
        }
      }
    } catch (e) {
    }
  },
  onHide: function() {
    common_vendor.index.__f__("log", "at App.vue:51", "App Hide");
  }
};
const SHARE_TITLE = "诺米灯光定制";
const SHARE_PATH = "/pages/home/index";
const SHARE_QUERY = "";
const FALLBACK_SHARE_IMAGE_URL = "/static/logo.png";
const SHARE_IMAGE_STORAGE_KEY = "share_image_url";
const cleanUrl = (u) => typeof u === "string" ? u.replace(/`/g, "").trim() : "";
const getShareImageUrl = () => {
  try {
    const cached = common_vendor.index.getStorageSync(SHARE_IMAGE_STORAGE_KEY);
    if (cached)
      return cached;
  } catch (e) {
  }
  return FALLBACK_SHARE_IMAGE_URL;
};
try {
  if (typeof common_vendor.index !== "undefined" && typeof common_vendor.index.request === "function") {
    common_vendor.index.request({
      url: "https://www.nuomi-light.com:6149/api/carousel",
      method: "GET",
      success: (res) => {
        var _a;
        try {
          let existing = "";
          try {
            existing = common_vendor.index.getStorageSync(SHARE_IMAGE_STORAGE_KEY) || "";
          } catch (e) {
            existing = "";
          }
          const hasLocalPoster = typeof existing === "string" && (existing.startsWith("wxfile://") || existing.startsWith("file://"));
          if (hasLocalPoster)
            return;
          let data = res == null ? void 0 : res.data;
          if (typeof data === "string") {
            try {
              data = JSON.parse(data);
            } catch (e) {
            }
          }
          const items = Array.isArray((_a = data == null ? void 0 : data.data) == null ? void 0 : _a.items) ? data.data.items : Array.isArray(data == null ? void 0 : data.items) ? data.items : [];
          const first = items && items.length ? items[0] : null;
          const img = cleanUrl((first == null ? void 0 : first.image) || (first == null ? void 0 : first.thumbnail) || (first == null ? void 0 : first.url) || "");
          if (img) {
            try {
              common_vendor.index.setStorageSync(SHARE_IMAGE_STORAGE_KEY, img);
            } catch (e) {
            }
          }
        } catch (e) {
        }
      }
    });
  }
} catch (e) {
}
const shareMixin = {
  onShow() {
    if (typeof common_vendor.index !== "undefined" && typeof common_vendor.index.showShareMenu === "function") {
      common_vendor.index.showShareMenu({
        withShareTicket: true,
        menus: ["shareAppMessage", "shareTimeline"]
      });
    }
  },
  onShareAppMessage() {
    return { title: SHARE_TITLE, path: SHARE_PATH, imageUrl: getShareImageUrl() };
  },
  onShareTimeline() {
    return { title: SHARE_TITLE, query: SHARE_QUERY, imageUrl: getShareImageUrl() };
  }
};
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  app.mixin(shareMixin);
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
//# sourceMappingURL=../.sourcemap/mp-weixin/app.js.map
