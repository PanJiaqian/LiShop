"use strict";
const common_vendor = require("../../common/vendor.js");
const FloatingNav = () => "../../components/FloatingNav.js";
const _sfc_main = {
  components: { FloatingNav },
  data() {
    return {
      activeIndex: 0,
      categories: [
        {
          name: "灯光",
          children: [
            { name: "嵌入式灯光" },
            { name: "后口层板灯" },
            { name: "玻璃层板灯" },
            { name: "明装层板灯" },
            { name: "电源" },
            { name: "开关" },
            { name: "配件" }
          ]
        }
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
