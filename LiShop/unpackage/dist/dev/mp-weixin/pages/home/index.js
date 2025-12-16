"use strict";
const common_vendor = require("../../common/vendor.js");
const api_index = require("../../api/index.js");
const common_assets = require("../../common/assets.js");
const SearchBar = () => "../../components/SearchBar.js";
const BannerSwiper = () => "../../components/BannerSwiper.js";
const CategoryGrid = () => "../../components/CategoryGrid.js";
const ProductCard = () => "../../components/ProductCard.js";
const FloatingNav = () => "../../components/FloatingNav.js";
const Skeleton = () => "../../components/Skeleton.js";
const _sfc_main = {
  components: { SearchBar, BannerSwiper, CategoryGrid, ProductCard, FloatingNav, Skeleton },
  data() {
    return {
      loading: true,
      keyword: "",
      roomName: "",
      user: null,
      banners: ["/static/logo.png", "/static/logo.png", "/static/logo.png"],
      topCategories: [],
      activeCateId: "",
      activeCateName: "",
      leftChildren: [],
      subCategoryList: [],
      seckillList: [
        { id: "s1", title: "爆款秒杀1", price: 99, image: "/static/logo.png" },
        { id: "s2", title: "爆款秒杀2", price: 129, image: "/static/logo.png" },
        { id: "s3", title: "爆款秒杀3", price: 59, image: "/static/logo.png" }
      ],
      recommendList: [],
      panelTop: 20,
      panelLeft: 0,
      panelRight: 0,
      hoveringPanel: false,
      leaveTimer: null
    };
  },
  onShow() {
    try {
      const p1 = api_index.getVisibleCategories({ page: 1, page_size: 20, sort_by: "id" }).then((res) => {
        var _a;
        const items = Array.isArray((_a = res == null ? void 0 : res.data) == null ? void 0 : _a.items) ? res.data.items : [];
        const mapped = items.map((it, i) => ({
          name: (it == null ? void 0 : it.name) || "分类" + (i + 1),
          icon: (typeof (it == null ? void 0 : it.thumbnail) === "string" ? it.thumbnail.replace(/`/g, "").trim() : "") || (typeof (it == null ? void 0 : it.icon) === "string" ? it.icon.replace(/`/g, "").trim() : ""),
          categories_id: (it == null ? void 0 : it.categories_id) || (it == null ? void 0 : it.id) || ""
        }));
        this.topCategories = mapped;
        this.subCategoryList = mapped;
      }).catch(() => {
      });
      const p2 = api_index.getCarousel().then((res) => {
        var _a;
        const items = Array.isArray((_a = res == null ? void 0 : res.data) == null ? void 0 : _a.items) ? res.data.items : [];
        this.banners = items.map((it, i) => ({
          image: (typeof (it == null ? void 0 : it.image) === "string" ? it.image.replace(/`/g, "").trim() : "") || "/static/logo.png",
          id: (it == null ? void 0 : it.available_product_id) || ""
        }));
        if (this.banners.length === 0)
          this.banners = ["/static/logo.png", "/static/logo.png"];
      }).catch(() => {
      });
      const p3 = api_index.getRecommendedProducts({ page: 1, page_size: 30, sort_by: "id" }).then((res) => {
        var _a;
        const list = Array.isArray((_a = res == null ? void 0 : res.data) == null ? void 0 : _a.items) ? res.data.items : [];
        this.recommendList = list.map((it, i) => ({
          id: (it == null ? void 0 : it.available_product_id) || (it == null ? void 0 : it.id) || "p" + i,
          title: (it == null ? void 0 : it.name) || "推荐商品 " + (i + 1),
          price: Number((it == null ? void 0 : it.price) ?? 0) || 0,
          sales: Number((it == null ? void 0 : it.order_count) ?? (it == null ? void 0 : it.sales) ?? 0) || 0,
          image: (typeof (it == null ? void 0 : it.thumbnail) === "string" ? it.thumbnail.replace(/`/g, "").trim() : "") || "/static/logo.png"
        }));
      }).catch(() => {
      });
      Promise.allSettled([p1, p2, p3]).then(() => {
        this.loading = false;
      });
    } catch (e) {
      this.loading = false;
    }
  },
  onPullDownRefresh() {
    setTimeout(() => {
      common_vendor.index.stopPullDownRefresh();
    }, 600);
  },
  methods: {
    hoverCategory(cat, e) {
      const id = (cat == null ? void 0 : cat.categories_id) || "";
      if (!id) {
        common_vendor.index.showToast({ title: "分类缺少ID", icon: "none" });
        return;
      }
      if (this.activeCateId === id && (this.leftChildren && this.leftChildren.length))
        return;
      this.activeCateId = id;
      this.activeCateName = (cat == null ? void 0 : cat.name) || "";
      try {
        api_index.getVisibleCategories({ page: 1, page_size: 50, sort_by: "id", categories_id: id }).then((res) => {
          var _a;
          const items = Array.isArray((_a = res == null ? void 0 : res.data) == null ? void 0 : _a.items) ? res.data.items : [];
          this.leftChildren = items.map((it, i) => ({ name: (it == null ? void 0 : it.name) || "子分类" + (i + 1), categories_id: (it == null ? void 0 : it.categories_id) || (it == null ? void 0 : it.id) || "", icon: (typeof (it == null ? void 0 : it.thumbnail) === "string" ? it.thumbnail.replace(/`/g, "").trim() : "") || (typeof (it == null ? void 0 : it.icon) === "string" ? it.icon.replace(/`/g, "").trim() : "") }));
        }).catch(() => {
          this.leftChildren = [];
        });
      } catch (e2) {
        this.leftChildren = [];
      }
    },
    onCateListLeave() {
      try {
        if (this.leaveTimer) {
          clearTimeout(this.leaveTimer);
        }
      } catch (e) {
      }
      this.leaveTimer = setTimeout(() => {
        if (!this.hoveringPanel)
          this.closeCategory();
      }, 120);
    },
    onPanelEnter() {
      this.hoveringPanel = true;
      try {
        if (this.leaveTimer) {
          clearTimeout(this.leaveTimer);
        }
      } catch (e) {
      }
    },
    onPanelLeave() {
      this.hoveringPanel = false;
      this.closeCategory();
    },
    closeCategory() {
      this.activeCateId = "";
      this.activeCateName = "";
      this.leftChildren = [];
    },
    onSearch(val) {
      const q = (val || this.keyword || "").trim();
      if (!q) {
        common_vendor.index.showToast({ title: "请输入关键字", icon: "none" });
        return;
      }
      common_vendor.index.navigateTo({ url: "/pages/search/index?q=" + encodeURIComponent(q) });
    },
    openCategory(cat) {
      const aid = encodeURIComponent((cat == null ? void 0 : cat.categories_id) || "");
      const aname = encodeURIComponent((cat == null ? void 0 : cat.name) || "");
      const url = `/pages/category/index?active=${aname}&active_id=${aid}`;
      if (common_vendor.index.switchTab) {
        common_vendor.index.switchTab({ url });
      } else {
        common_vendor.index.navigateTo({ url });
      }
    },
    goSubList(sub) {
      const pid = encodeURIComponent(this.activeCateId || "");
      const cid = encodeURIComponent((sub == null ? void 0 : sub.categories_id) || "");
      const pname = encodeURIComponent(this.activeCateName || "");
      if (!cid) {
        common_vendor.index.showToast({ title: "子分类缺少ID", icon: "none" });
        return;
      }
      const url = `/pages/category/list?parent_id=${pid}&category_id=${cid}&active=${pname}`;
      this.closeCategory();
      common_vendor.index.navigateTo({ url });
    },
    addToCart(product) {
      try {
        const cart = common_vendor.index.getStorageSync("cart") || [];
        const i = cart.findIndex((it) => it.id === product.id);
        if (i >= 0)
          cart[i].quantity = (cart[i].quantity || 1) + 1;
        else
          cart.push({ ...product, quantity: 1 });
        common_vendor.index.setStorageSync("cart", cart);
        common_vendor.index.showToast({ title: "已加入购物车", icon: "success" });
      } catch (e) {
        console.error(e);
      }
    },
    goLogin() {
      common_vendor.index.navigateTo({ url: "/pages/login/index" });
    },
    onAvatarClick() {
      if (this.user) {
        if (common_vendor.index.switchTab)
          common_vendor.index.switchTab({ url: "/pages/profile/index" });
        else
          common_vendor.index.navigateTo({ url: "/pages/profile/index" });
      } else {
        common_vendor.index.navigateTo({ url: "/pages/login/index" });
      }
    },
    saveRoom() {
      try {
        const name = (this.roomName || "").trim();
        if (!name)
          return;
        common_vendor.index.setStorageSync("currentRoom", name);
        const rooms = common_vendor.index.getStorageSync("rooms") || [];
        if (!rooms.includes(name)) {
          rooms.push(name);
          common_vendor.index.setStorageSync("rooms", rooms);
        }
        common_vendor.index.showToast({ title: "房间名已保存", icon: "success" });
      } catch (e) {
      }
    },
    logout() {
      try {
        common_vendor.index.removeStorageSync("user");
      } catch (e) {
      }
      this.user = null;
      setTimeout(() => {
        common_vendor.index.navigateTo({ url: "/pages/login/index" });
      }, 500);
    }
  }
};
if (!Array) {
  const _component_Skeleton = common_vendor.resolveComponent("Skeleton");
  const _component_SearchBar = common_vendor.resolveComponent("SearchBar");
  const _component_BannerSwiper = common_vendor.resolveComponent("BannerSwiper");
  const _component_ProductCard = common_vendor.resolveComponent("ProductCard");
  (_component_Skeleton + _component_SearchBar + _component_BannerSwiper + _component_ProductCard)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.p({
      loading: $data.loading,
      showTitle: true,
      showGrid: true
    }),
    b: common_assets._imports_0,
    c: common_vendor.o($options.onSearch),
    d: common_vendor.o(($event) => $data.keyword = $event),
    e: common_vendor.p({
      modelValue: $data.keyword
    }),
    f: common_vendor.p({
      images: $data.banners
    }),
    g: common_vendor.f($data.subCategoryList, (c, i, i0) => {
      return {
        a: c.icon || "/static/logo.png",
        b: common_vendor.t(c.name),
        c: "mc" + i,
        d: common_vendor.o(($event) => $options.openCategory(c), "mc" + i)
      };
    }),
    h: common_vendor.f($data.recommendList, (p, idx, i0) => {
      return {
        a: "4978fed5-3-" + i0,
        b: common_vendor.p({
          product: p
        }),
        c: idx
      };
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-4978fed5"]]);
wx.createPage(MiniProgramPage);
