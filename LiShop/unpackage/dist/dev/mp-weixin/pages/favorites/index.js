"use strict";
const common_vendor = require("../../common/vendor.js");
const api_index = require("../../api/index.js");
const Skeleton = () => "../../components/Skeleton.js";
const _sfc_main = {
  components: { Skeleton },
  data() {
    return {
      loading: true,
      favorites: []
    };
  },
  onShow() {
    try {
      const u = common_vendor.index.getStorageSync("user") || null;
      const token = u && (u.token || u.data && u.data.token) || "";
      if (!token) {
        this.loading = false;
        return;
      }
      api_index.getFavorites({ token }).then((res) => {
        var _a, _b, _c;
        const raw = Array.isArray((_a = res == null ? void 0 : res.data) == null ? void 0 : _a.items) ? res.data.items : Array.isArray(res == null ? void 0 : res.items) ? res.items : Array.isArray((_b = res == null ? void 0 : res.data) == null ? void 0 : _b.children) ? res.data.children : Array.isArray((_c = res == null ? void 0 : res.data) == null ? void 0 : _c.list) ? res.data.list : Array.isArray(res == null ? void 0 : res.data) ? res.data : [];
        this.favorites = (raw || []).map((it, i) => {
          const img = (typeof (it == null ? void 0 : it.main_image) === "string" ? it.main_image.replace(/`/g, "").trim() : "") || (typeof (it == null ? void 0 : it.image) === "string" ? it.image.replace(/`/g, "").trim() : "") || (typeof (it == null ? void 0 : it.thumbnail) === "string" ? it.thumbnail.replace(/`/g, "").trim() : "") || "/static/logo.png";
          return {
            id: (it == null ? void 0 : it.available_product_id) || (it == null ? void 0 : it.product_id) || (it == null ? void 0 : it.id) || "f" + i,
            title: (it == null ? void 0 : it.name) || (it == null ? void 0 : it.title) || "收藏 " + (i + 1),
            price: Number((it == null ? void 0 : it.price) ?? 0) || 0,
            image: img
          };
        });
      }).catch(() => {
        this.favorites = [];
      }).finally(() => {
        this.loading = false;
      });
    } catch (e) {
      this.loading = false;
      this.favorites = [];
    }
  },
  methods: {
    goBack() {
      try {
        if (typeof window !== "undefined" && window.history && window.history.length > 1) {
          window.history.back();
          return;
        }
      } catch (e) {
      }
      if (common_vendor.index && common_vendor.index.switchTab) {
        common_vendor.index.switchTab({ url: "/pages/home/index" });
        return;
      }
      if (common_vendor.index && common_vendor.index.navigateTo) {
        common_vendor.index.navigateTo({ url: "/pages/home/index" });
        return;
      }
      try {
        const base = typeof location !== "undefined" && location.href ? location.href.split("#")[0] : "";
        if (base)
          location.href = base + "#/pages/home/index";
      } catch (e) {
      }
    },
    openProduct(id) {
      if (!id)
        return;
      const url = "/pages/product/index?id=" + encodeURIComponent(id);
      if (typeof window !== "undefined" && window.open) {
        const base = typeof location !== "undefined" && location.href ? location.href.split("#")[0] : "";
        const full = base ? base + "#/pages/product/index?id=" + encodeURIComponent(id) : url;
        window.open(full, "_blank");
      } else if (common_vendor.index && common_vendor.index.navigateTo) {
        common_vendor.index.navigateTo({ url });
      }
    }
  }
};
if (!Array) {
  const _component_Skeleton = common_vendor.resolveComponent("Skeleton");
  _component_Skeleton();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.p({
      loading: $data.loading,
      showTitle: true
    }),
    b: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    c: $data.favorites.length
  }, $data.favorites.length ? {
    d: common_vendor.f($data.favorites, (it, i, i0) => {
      return {
        a: it.image,
        b: common_vendor.t(it.title),
        c: common_vendor.t(it.price.toFixed(2)),
        d: i,
        e: common_vendor.o(($event) => $options.openProduct(it.id), i)
      };
    })
  } : !$data.loading ? {} : {}, {
    e: !$data.loading
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-bbc2a813"]]);
wx.createPage(MiniProgramPage);
