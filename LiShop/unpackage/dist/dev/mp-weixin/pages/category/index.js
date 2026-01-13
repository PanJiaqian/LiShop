"use strict";
const common_vendor = require("../../common/vendor.js");
const api_index = require("../../api/index.js");
const common_assets = require("../../common/assets.js");
const FloatingNav = () => "../../components/FloatingNav.js";
const Skeleton = () => "../../components/Skeleton.js";
const _sfc_main = {
  components: { FloatingNav, Skeleton },
  data() {
    return {
      loading: true,
      activeIndex: 0,
      categories: [],
      pendingActiveName: "",
      pendingActiveId: "",
      rightChildren: []
    };
  },
  computed: {
    activeCategory() {
      return this.categories[this.activeIndex] || { name: "", children: [] };
    }
  },
  onShow() {
    try {
      api_index.getVisibleCategories({ page: 1, page_size: 50, sort_by: "id" }).then((res) => {
        var _a;
        const items = Array.isArray((_a = res == null ? void 0 : res.data) == null ? void 0 : _a.items) ? res.data.items : [];
        const mapped = items.map((it, i) => ({ name: (it == null ? void 0 : it.name) || "分类" + (i + 1), categories_id: (it == null ? void 0 : it.categories_id) || (it == null ? void 0 : it.id) || "", children: [] }));
        this.categories = mapped;
        if (this.pendingActiveId) {
          const idxById = this.categories.findIndex((c) => c.categories_id === this.pendingActiveId);
          if (idxById >= 0) {
            this.activeIndex = idxById;
            this.loadChildrenById(this.pendingActiveId);
          }
          this.pendingActiveId = "";
          this.pendingActiveName = "";
        } else if (this.pendingActiveName) {
          const idx = this.categories.findIndex((c) => c.name === this.pendingActiveName);
          if (idx >= 0) {
            this.activeIndex = idx;
            const id = this.categories[idx].categories_id;
            if (id)
              this.loadChildrenById(id);
          }
          this.pendingActiveName = "";
        } else {
          if (this.categories.length) {
            this.activeIndex = 0;
            const firstId = this.categories[0].categories_id;
            if (firstId)
              this.loadChildrenById(firstId);
          }
        }
        this.loading = false;
      }).catch(() => {
        this.loading = false;
      });
    } catch (e) {
      this.loading = false;
    }
  },
  onLoad(query) {
    const q = decodeURIComponent((query == null ? void 0 : query.active) || "");
    const aid = decodeURIComponent((query == null ? void 0 : query.active_id) || "");
    this.pendingActiveName = q;
    this.pendingActiveId = aid;
  },
  methods: {
    selectCategory(idx) {
      var _a;
      this.activeIndex = idx;
      const id = ((_a = this.categories[idx]) == null ? void 0 : _a.categories_id) || "";
      if (id)
        this.loadChildrenById(id);
    },
    loadChildrenById(id) {
      try {
        api_index.getVisibleCategories({ page: 1, page_size: 50, sort_by: "id", categories_id: id }).then((res) => {
          var _a;
          const items = Array.isArray((_a = res == null ? void 0 : res.data) == null ? void 0 : _a.items) ? res.data.items : [];
          const children = items.map((it, i) => ({
            name: (it == null ? void 0 : it.name) || "子分类" + (i + 1),
            icon: (typeof (it == null ? void 0 : it.image_url) === "string" ? it.image_url.replace(/`/g, "").trim() : "") || (typeof (it == null ? void 0 : it.thumbnail) === "string" ? it.thumbnail.replace(/`/g, "").trim() : "") || (typeof (it == null ? void 0 : it.icon) === "string" ? it.icon.replace(/`/g, "").trim() : ""),
            categories_id: (it == null ? void 0 : it.categories_id) || (it == null ? void 0 : it.id) || ""
          }));
          const idx = this.activeIndex;
          const cat = this.categories[idx];
          if (cat)
            this.$set(this.categories, idx, { ...cat, children });
          this.rightChildren = children;
        }).catch(() => {
        });
      } catch (e) {
      }
    },
    openList(sub) {
      var _a, _b;
      const parentId = ((_a = this.categories[this.activeIndex]) == null ? void 0 : _a.categories_id) || "";
      const cid = (sub == null ? void 0 : sub.categories_id) || "";
      const pname = ((_b = this.activeCategory) == null ? void 0 : _b.name) || "";
      if (!cid) {
        common_vendor.index.showToast({ title: "子分类缺少ID", icon: "none" });
        return;
      }
      const url = `/pages/category/list?parent_id=${encodeURIComponent(parentId)}&category_id=${encodeURIComponent(cid)}&active=${encodeURIComponent(pname)}`;
      common_vendor.index.navigateTo({ url });
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
      loading: $data.loading,
      showTitle: true,
      showGrid: true
    }),
    b: common_assets._imports_0,
    c: common_vendor.f($data.categories, (c, idx, i0) => {
      return {
        a: common_vendor.t(c.name),
        b: idx,
        c: common_vendor.n($data.activeIndex === idx ? "active" : ""),
        d: common_vendor.o(($event) => $options.selectCategory(idx), idx)
      };
    }),
    d: common_vendor.t($options.activeCategory.name),
    e: common_vendor.f($data.rightChildren, (s, i, i0) => {
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
