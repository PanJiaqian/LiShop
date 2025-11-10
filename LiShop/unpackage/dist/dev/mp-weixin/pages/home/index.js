"use strict";
const common_vendor = require("../../common/vendor.js");
const SearchBar = () => "../../components/SearchBar.js";
const BannerSwiper = () => "../../components/BannerSwiper.js";
const CategoryGrid = () => "../../components/CategoryGrid.js";
const ProductCard = () => "../../components/ProductCard.js";
const FloatingNav = () => "../../components/FloatingNav.js";
const _sfc_main = {
  components: { SearchBar, BannerSwiper, CategoryGrid, ProductCard, FloatingNav },
  data() {
    return {
      keyword: "",
      roomName: "",
      user: null,
      banners: ["/static/logo.png", "/static/logo.png", "/static/logo.png"],
      topCategories: [{ name: "灯光" }],
      subCategoryList: [
        { name: "嵌入式灯光" },
        { name: "后口层板灯" },
        { name: "玻璃层板灯" },
        { name: "明装层板灯" },
        { name: "电源" },
        { name: "开关" },
        { name: "配件" }
      ],
      seckillList: [
        { id: "s1", title: "爆款秒杀1", price: 99, image: "/static/logo.png" },
        { id: "s2", title: "爆款秒杀2", price: 129, image: "/static/logo.png" },
        { id: "s3", title: "爆款秒杀3", price: 59, image: "/static/logo.png" }
      ],
      recommendList: [
        { id: "p1", title: "店铺热销商品 A 旗舰款", price: 299, sales: 1234, image: "/static/logo.png" },
        { id: "p2", title: "人气爆款 B 限时优惠", price: 89, sales: 5678, image: "/static/logo.png" },
        { id: "p3", title: "超值 C 套装", price: 179, sales: 345, image: "/static/logo.png" },
        { id: "p4", title: "家电 D 新品", price: 999, sales: 98, image: "/static/logo.png" },
        { id: "p4", title: "家电 D 新品", price: 999, sales: 98, image: "/static/logo.png" },
        { id: "p4", title: "家电 D 新品", price: 999, sales: 98, image: "/static/logo.png" },
        { id: "p4", title: "家电 D 新品", price: 999, sales: 98, image: "/static/logo.png" },
        { id: "p4", title: "家电 D 新品", price: 999, sales: 98, image: "/static/logo.png" }
      ]
    };
  },
  onShow() {
  },
  onPullDownRefresh() {
    setTimeout(() => {
      common_vendor.index.stopPullDownRefresh();
    }, 600);
  },
  methods: {
    onSearch(val) {
      common_vendor.index.showToast({ title: "搜索：" + (val || this.keyword), icon: "none" });
    },
    openCategory(cat) {
      if (common_vendor.index.switchTab) {
        common_vendor.index.switchTab({ url: "/pages/category/index" });
      } else {
        common_vendor.index.navigateTo({ url: "/pages/category/index" });
      }
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
    }
  }
};
if (!Array) {
  const _component_SearchBar = common_vendor.resolveComponent("SearchBar");
  const _component_BannerSwiper = common_vendor.resolveComponent("BannerSwiper");
  const _component_CategoryGrid = common_vendor.resolveComponent("CategoryGrid");
  const _component_ProductCard = common_vendor.resolveComponent("ProductCard");
  (_component_SearchBar + _component_BannerSwiper + _component_CategoryGrid + _component_ProductCard)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o($options.onSearch),
    b: common_vendor.o(($event) => $data.keyword = $event),
    c: common_vendor.p({
      modelValue: $data.keyword
    }),
    d: common_vendor.p({
      images: $data.banners
    }),
    e: common_vendor.p({
      categories: $data.subCategoryList
    }),
    f: common_vendor.f($data.seckillList, (item, idx, i0) => {
      return {
        a: item.image || "/static/logo.png",
        b: common_vendor.t(item.price),
        c: idx
      };
    }),
    g: common_vendor.f($data.recommendList, (p, idx, i0) => {
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
