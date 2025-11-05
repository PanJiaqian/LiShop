"use strict";
const common_vendor = require("../../common/vendor.js");
const FloatingNav = () => "../../components/FloatingNav.js";
const _sfc_main = {
  components: { FloatingNav },
  data() {
    return {
      activeIndex: 0,
      categories: [
        { name: "手机数码", children: [{ name: "手机", icon: "" }, { name: "耳机" }, { name: "充电器" }] },
        { name: "家用电器", children: [{ name: "冰箱" }, { name: "洗衣机" }, { name: "电视" }] },
        { name: "美妆个护", children: [{ name: "面膜" }, { name: "口红" }, { name: "洗发水" }] },
        { name: "服饰鞋包", children: [{ name: "男装" }, { name: "女装" }, { name: "运动鞋" }] },
        { name: "生鲜食品", children: [{ name: "水果" }, { name: "肉类" }, { name: "海鲜" }] }
      ]
    };
  },
  computed: {
    activeCategory() {
      return this.categories[this.activeIndex] || { name: "", children: [] };
    }
  },
  onShow() {
  },
  onLoad(query) {
    const q = decodeURIComponent((query == null ? void 0 : query.active) || "");
    const idx = this.categories.findIndex((c) => c.name === q);
    if (idx >= 0)
      this.activeIndex = idx;
  },
  methods: {
    openList(sub) {
      common_vendor.index.showToast({ title: sub.name, icon: "none" });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.f($data.categories, (c, idx, i0) => {
      return {
        a: common_vendor.t(c.name),
        b: idx,
        c: common_vendor.n($data.activeIndex === idx ? "active" : ""),
        d: common_vendor.o(($event) => $data.activeIndex = idx, idx)
      };
    }),
    b: common_vendor.t($options.activeCategory.name),
    c: common_vendor.f($options.activeCategory.children, (s, i, i0) => {
      return {
        a: s.icon || "/static/logo.png",
        b: common_vendor.t(s.name),
        c: i,
        d: common_vendor.o(($event) => $options.openList(s), i)
      };
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-3cdc7548"]]);
wx.createPage(MiniProgramPage);
