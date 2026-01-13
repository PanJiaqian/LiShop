"use strict";
const common_vendor = require("../../common/vendor.js");
const api_index = require("../../api/index.js");
const common_assets = require("../../common/assets.js");
const Skeleton = () => "../../components/Skeleton.js";
const FloatingNav = () => "../../components/FloatingNav.js";
const _sfc_main = {
  components: { Skeleton, FloatingNav },
  data() {
    return {
      loading: true,
      announcement: null,
      showAnnContent: true
    };
  },
  computed: {
    displayTime() {
      var _a, _b;
      try {
        const t = ((_a = this.announcement) == null ? void 0 : _a.created_at) || ((_b = this.announcement) == null ? void 0 : _b.timestamp) || "";
        if (!t)
          return "";
        const d = new Date(t);
        if (isNaN(d.getTime()))
          return String(t);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        const h = String(d.getHours()).padStart(2, "0");
        const mm = String(d.getMinutes()).padStart(2, "0");
        return `${y}-${m}-${day} ${h}:${mm}`;
      } catch (e) {
        return "";
      }
    }
  },
  onShow() {
    this.fetch();
  },
  methods: {
    goBack() {
      if (typeof window !== "undefined" && window.history && window.history.length > 1) {
        window.history.back();
        return;
      }
      if (common_vendor.index && common_vendor.index.switchTab) {
        common_vendor.index.switchTab({ url: "/pages/home/index" });
        return;
      }
      if (common_vendor.index && common_vendor.index.navigateTo) {
        common_vendor.index.navigateTo({ url: "/pages/home/index" });
        return;
      }
    },
    fetch() {
      try {
        const u = common_vendor.index.getStorageSync("user") || null;
        const token = u && (u.token || u.data && u.data.token) || "";
        api_index.getCurrentAnnouncement({ token }).then((res) => {
          const ok = !!(res && res.success);
          const data = (res == null ? void 0 : res.data) || null;
          if (ok && data) {
            this.announcement = {
              id: data.announcement_id || data.id || "",
              title: data.title || "",
              content: data.content || "",
              created_at: data.created_at || res.timestamp || ""
            };
          } else {
            this.announcement = null;
          }
        }).catch(() => {
          this.announcement = null;
        });
      } catch (e) {
        this.announcement = null;
      } finally {
        this.loading = false;
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
    b: common_assets._imports_0,
    c: $data.announcement
  }, $data.announcement ? {
    d: common_vendor.t($data.announcement.title),
    e: common_vendor.t($options.displayTime),
    f: common_vendor.t($data.announcement.content)
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-da6a9367"]]);
wx.createPage(MiniProgramPage);
