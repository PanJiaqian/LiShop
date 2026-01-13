"use strict";
const api_index = require("../../api/index.js");
const common_vendor = require("../../common/vendor.js");
const ProductCard = () => "../../components/ProductCard.js";
const Skeleton = () => "../../components/Skeleton.js";
const _sfc_main = {
  components: { ProductCard, Skeleton },
  data() {
    return {
      keyword: "",
      category_name: "",
      items: [],
      page: 1,
      page_size: 20,
      total: 0,
      loading: true,
      finished: false
    };
  },
  computed: {
    totalPages() {
      const t = Number(this.total || 0);
      const ps = Number(this.page_size || 20);
      return t > 0 ? Math.ceil(t / ps) : 1;
    },
    pageNumbers() {
      const n = this.totalPages;
      return Array.from({ length: n }, (_, i) => i + 1);
    }
  },
  onLoad(query) {
    const q = decodeURIComponent((query == null ? void 0 : query.q) || "");
    const cname = decodeURIComponent((query == null ? void 0 : query.category_name) || "");
    this.keyword = q;
    this.category_name = cname;
    this.fetchPage(1, false);
  },
  // 小程序端下拉到底部加载更多
  onReachBottom() {
    if (this.loading || this.finished)
      return;
    this.fetchPage(this.page + 1, true);
  },
  methods: {
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
        price: Number((it == null ? void 0 : it.price) ?? 0) || 0,
        sales: 0,
        image: this.cleanImage(it == null ? void 0 : it.thumbnail)
      }));
    },
    fetchPage(nextPage = 1, append = false) {
      const q = (this.keyword || "").trim();
      if (!q)
        return;
      this.loading = true;
      api_index.searchProducts({ user_input: q, page: nextPage, page_size: this.page_size, sort_by: "id", category_name: this.category_name }).then((res) => {
        var _a, _b;
        const items = Array.isArray((_a = res == null ? void 0 : res.data) == null ? void 0 : _a.items) ? res.data.items : [];
        const total = Number(((_b = res == null ? void 0 : res.data) == null ? void 0 : _b.total) ?? items.length);
        const list = this.normalize(items);
        this.total = total;
        this.page = nextPage;
        if (append)
          this.items = [...this.items, ...list];
        else
          this.items = list;
        this.finished = this.page * this.page_size >= this.total;
      }).catch(() => {
      }).finally(() => {
        this.loading = false;
      });
    },
    goPrev() {
      if (this.page <= 1 || this.loading)
        return;
      this.fetchPage(this.page - 1, false);
    },
    goNext() {
      if (this.page >= this.totalPages || this.loading)
        return;
      this.fetchPage(this.page + 1, false);
    },
    goPage(n) {
      if (this.loading || n === this.page || n < 1 || n > this.totalPages)
        return;
      this.fetchPage(n, false);
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
    b: common_vendor.t($data.keyword),
    c: common_vendor.f($data.items, (p, idx, i0) => {
      return {
        a: "2dab939d-1-" + i0,
        b: common_vendor.p({
          product: p
        }),
        c: idx
      };
    }),
    d: !$data.loading && $data.items.length === 0
  }, !$data.loading && $data.items.length === 0 ? {} : {}, {
    e: $data.loading
  }, $data.loading ? {} : {}, {
    f: $data.finished && $data.items.length > 0
  }, $data.finished && $data.items.length > 0 ? {} : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-2dab939d"]]);
wx.createPage(MiniProgramPage);
