"use strict";
const common_vendor = require("../../common/vendor.js");
const api_index = require("../../api/index.js");
const common_assets = require("../../common/assets.js");
const ProductCard = () => "../../components/ProductCard.js";
const FloatingNav = () => "../../components/FloatingNav.js";
const Skeleton = () => "../../components/Skeleton.js";
const _sfc_main = {
  components: { ProductCard, FloatingNav, Skeleton },
  data() {
    return {
      keyword: "",
      parentId: "",
      activeChildId: "",
      activeName: "",
      subChildren: [],
      items: [],
      page: 1,
      page_size: 32,
      total: 0,
      loading: true
    };
  },
  computed: {
    totalPages() {
      const t = Number(this.total || 0);
      const ps = Number(this.page_size || 32);
      return t > 0 ? Math.ceil(t / ps) : 1;
    },
    activeChildTitle() {
      const s = (this.subChildren || []).find((it) => it.categories_id === this.activeChildId);
      return s ? s.name || "" : "";
    }
  },
  onLoad(query) {
    this.parentId = decodeURIComponent((query == null ? void 0 : query.parent_id) || "");
    this.activeChildId = decodeURIComponent((query == null ? void 0 : query.category_id) || "");
    this.activeName = decodeURIComponent((query == null ? void 0 : query.active) || "");
  },
  onReachBottom() {
    if (this.page >= this.totalPages || this.loading)
      return;
    this.fetchPage(this.page + 1, true);
  },
  onShow() {
    if (!this.parentId && !this.activeChildId)
      return;
    this.loadSubChildren().then(() => {
      if (!this.activeChildId && this.subChildren.length) {
        this.activeChildId = this.subChildren[0].categories_id || "";
        this.activeName = this.subChildren[0].name || "";
      }
      if (this.activeChildId)
        this.fetchPage(1);
    });
    try {
      common_vendor.index.setNavigationBarTitle({ title: this.activeName || "分类商品" });
    } catch (e) {
    }
  },
  methods: {
    onSearch(val) {
      const q = (val || this.keyword || "").trim();
      if (!q) {
        common_vendor.index.showToast({ title: "请输入关键字", icon: "none" });
        return;
      }
      common_vendor.index.navigateTo({ url: "/pages/search/index?q=" + encodeURIComponent(q) + "&category_name=" + encodeURIComponent(this.activeName || "") });
    },
    goBack() {
      if (typeof window !== "undefined" && window.history && window.history.length > 1) {
        window.history.back();
        return;
      }
      try {
        const pid = this.parentId || "";
        if (pid)
          common_vendor.index.setStorageSync("category_pending_active_id", pid);
      } catch (e) {
      }
      if (common_vendor.index && common_vendor.index.switchTab) {
        common_vendor.index.switchTab({ url: "/pages/category/index" });
        return;
      }
      if (common_vendor.index && common_vendor.index.navigateTo) {
        common_vendor.index.navigateTo({ url: "/pages/category/index" });
        return;
      }
    },
    cleanImage(url) {
      if (typeof url !== "string")
        return "/static/logo.png";
      const s = url.replace(/`/g, "").trim();
      return s || "/static/logo.png";
    },
    normalize(rows = []) {
      return rows.map((it, i) => ({
        id: (it == null ? void 0 : it.available_product_id) || "p" + i,
        title: (it == null ? void 0 : it.name) || "商品 " + (i + 1),
        price: (it == null ? void 0 : it.price) === "-" || (it == null ? void 0 : it.price) === "—" ? "-" : Number((it == null ? void 0 : it.price) ?? 0) || 0,
        sales: 0,
        image: this.cleanImage(it == null ? void 0 : it.main_image) || this.cleanImage(it == null ? void 0 : it.thumbnail)
      }));
    },
    async loadSubChildren() {
      var _a;
      try {
        const res = await api_index.getVisibleCategories({ page: 1, page_size: 50, sort_by: "id", categories_id: this.parentId || this.activeChildId });
        const items = Array.isArray((_a = res == null ? void 0 : res.data) == null ? void 0 : _a.items) ? res.data.items : [];
        this.subChildren = items.map((it, i) => ({ name: (it == null ? void 0 : it.name) || "子分类" + (i + 1), categories_id: (it == null ? void 0 : it.categories_id) || (it == null ? void 0 : it.id) || "" }));
      } catch (e) {
        this.subChildren = [];
      }
    },
    async fetchPage(nextPage = 1, append = false) {
      var _a, _b;
      if (!this.activeChildId)
        return;
      this.loading = true;
      try {
        const res = await api_index.getVisibleProducts({ page: nextPage, page_size: this.page_size, sort_by: "id", category_id: this.activeChildId });
        const rows = Array.isArray((_a = res == null ? void 0 : res.data) == null ? void 0 : _a.items) ? res.data.items : [];
        const total = Number(((_b = res == null ? void 0 : res.data) == null ? void 0 : _b.total) ?? rows.length);
        const newItems = this.normalize(rows);
        if (append) {
          this.items = [...this.items, ...newItems];
        } else {
          this.items = newItems;
        }
        this.total = total;
        this.page = nextPage;
      } catch (e) {
      } finally {
        this.loading = false;
      }
    },
    selectChild(s) {
      this.activeChildId = s.categories_id;
      this.activeName = s.name || "";
      this.fetchPage(1);
    },
    goPrev() {
      if (this.page <= 1 || this.loading)
        return;
      this.fetchPage(this.page - 1);
    },
    goNext() {
      if (this.page >= this.totalPages || this.loading)
        return;
      this.fetchPage(this.page + 1);
    }
  }
};
if (!Array) {
  const _component_Skeleton = common_vendor.resolveComponent("Skeleton");
  const _component_ProductCard = common_vendor.resolveComponent("ProductCard");
  (_component_Skeleton + _component_ProductCard)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.p({
      loading: $data.loading,
      showTitle: true,
      showGrid: true
    }),
    b: common_assets._imports_0,
    c: common_vendor.f($data.subChildren, (s, i, i0) => {
      return {
        a: common_vendor.t(s.name),
        b: i,
        c: common_vendor.n(s.categories_id === $data.activeChildId ? "active" : ""),
        d: common_vendor.o(($event) => $options.selectChild(s), i)
      };
    }),
    d: common_vendor.f($data.items, (p, idx, i0) => {
      return {
        a: "17e22e15-1-" + i0,
        b: common_vendor.p({
          product: p
        }),
        c: idx
      };
    }),
    e: !$data.loading && $data.items.length === 0
  }, !$data.loading && $data.items.length === 0 ? {} : {}, {
    f: $data.loading
  }, $data.loading ? {} : {}, {
    g: !$data.loading && $data.page >= $options.totalPages && $data.items.length > 0
  }, !$data.loading && $data.page >= $options.totalPages && $data.items.length > 0 ? {} : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-17e22e15"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/category/list.js.map
