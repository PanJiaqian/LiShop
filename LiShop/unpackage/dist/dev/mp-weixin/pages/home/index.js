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
const OnboardingGuide = () => "../../components/OnboardingGuide.js";
const _sfc_main = {
  components: { SearchBar, BannerSwiper, CategoryGrid, ProductCard, FloatingNav, Skeleton, OnboardingGuide },
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
      leaveTimer: null,
      showAnnouncementModal: false,
      announcementLoading: false,
      announcement: null,
      showAnnContent: false,
      showOnboarding: false,
      onboardingStepIndex: 0,
      onboardingRects: [],
      onboardingSteps: [
        "顶部搜索可快速查找商品与店铺",
        "左侧分类导航支持展开子分类",
        "轮播图可直达热门商品",
        "猜你喜欢展示为你推荐的商品",
        "我的与购物车提供快捷入口",
        "商品详情页查看规格与加入购物车",
        "房间选择，购物车根据房间名进行分组",
        "订单页面查看物流与支付进度",
        "个人信息管理",
        "功能区",
        "收货地址管理"
      ],
      onboardingStepsMp: [
        "顶部搜索定位商品",
        "横向分类导航查看子分类",
        "轮播图快捷入口",
        "猜你喜欢推荐区",
        "商品详情页查看规格与加入购物车",
        "房间选择，购物车根据房间名进行分组",
        "订单页面查看物流与支付进度",
        "个人信息管理",
        "功能区",
        "收货地址管理"
      ]
    };
  },
  onLoad() {
    try {
      const isH5 = typeof window !== "undefined";
      if (!isH5) {
        this.onboardingSteps = this.onboardingStepsMp;
      }
      const jl = !!common_vendor.index.getStorageSync("just_logged_in");
      if (jl) {
        this.triggerOnboarding();
        common_vendor.index.removeStorageSync("just_logged_in");
      }
    } catch (e) {
    }
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
    try {
      const cont = !!common_vendor.index.getStorageSync("onboarding_continue");
      const idx = Number(common_vendor.index.getStorageSync("onboarding_index") || 0);
      const stepsStored = common_vendor.index.getStorageSync("onboarding_steps") || [];
      const jl = !!common_vendor.index.getStorageSync("just_logged_in");
      if (cont && Array.isArray(stepsStored) && stepsStored.length && idx <= 4) {
        this.onboardingSteps = stepsStored;
        this.onboardingStepIndex = idx;
        this.showOnboarding = true;
        this.$nextTick(() => {
          this.refreshOnboardingTargets();
        });
      } else if (jl) {
        this.triggerOnboarding();
        common_vendor.index.removeStorageSync("just_logged_in");
      }
    } catch (e) {
    }
    try {
      const p1 = api_index.getVisibleCategories({ page: 1, page_size: 20, sort_by: "id" }).then((res) => {
        var _a;
        const items = Array.isArray((_a = res == null ? void 0 : res.data) == null ? void 0 : _a.items) ? res.data.items : [];
        const mapped = items.map((it, i) => ({
          name: (it == null ? void 0 : it.name) || "分类" + (i + 1),
          icon: (typeof (it == null ? void 0 : it.image_url) === "string" ? it.image_url.replace(/`/g, "").trim() : "") || (typeof (it == null ? void 0 : it.thumbnail) === "string" ? it.thumbnail.replace(/`/g, "").trim() : "") || (typeof (it == null ? void 0 : it.icon) === "string" ? it.icon.replace(/`/g, "").trim() : ""),
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
          image: (typeof (it == null ? void 0 : it.main_image) === "string" ? it.main_image.replace(/`/g, "").trim() : "") || (typeof (it == null ? void 0 : it.thumbnail) === "string" ? it.thumbnail.replace(/`/g, "").trim() : "") || "/static/logo.png"
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
  onHide() {
    this.showOnboarding = false;
  },
  methods: {
    triggerOnboarding() {
      this.showOnboarding = true;
      this.onboardingStepIndex = 0;
      try {
        common_vendor.index.setStorageSync("onboarding_steps", this.onboardingSteps);
        common_vendor.index.setStorageSync("onboarding_index", 0);
      } catch (e) {
      }
      this.$nextTick(() => {
        this.refreshOnboardingTargets();
        setTimeout(() => {
          this.refreshOnboardingTargets();
        }, 120);
      });
    },
    refreshOnboardingTargets() {
      try {
        let isH5 = false;
        try {
          isH5 = typeof window !== "undefined";
        } catch (e) {
          isH5 = false;
        }
        if (isH5) {
          const sel = (s) => typeof document !== "undefined" ? document.querySelector(s) : null;
          const baseEl = typeof document !== "undefined" ? document.getElementById("app") || document.querySelector(".uni-app") || document.body : null;
          const baseRect = baseEl && baseEl.getBoundingClientRect ? baseEl.getBoundingClientRect() : { left: 0, top: 0 };
          const ox = baseRect.left || 0;
          const oy = baseRect.top || 0;
          const rectOf = (el) => {
            if (!el)
              return null;
            const r = el.getBoundingClientRect();
            return { left: r.left - ox, top: r.top - oy, width: r.width, height: r.height };
          };
          const rects = [
            rectOf(sel(".search-input-field")) || rectOf(sel("#og-search")),
            rectOf(sel("#og-cate")),
            rectOf(sel(".center-content")),
            rectOf(sel("#og-guess .guess-title")) || rectOf(sel("#og-guess")),
            rectOf(sel("#og-quick"))
          ].filter(Boolean);
          this.onboardingRects = rects;
        } else {
          const q = common_vendor.index.createSelectorQuery().in(this);
          q.select("#og-search").boundingClientRect();
          q.select("#og-mp-cate").boundingClientRect();
          q.select("#og-banner").boundingClientRect();
          q.select("#og-mp-guess").boundingClientRect();
          q.exec((res) => {
            const rects = (res || []).filter(Boolean).map((r) => ({ left: r.left, top: r.top, width: r.width, height: r.height }));
            this.onboardingRects = rects;
          });
        }
      } catch (e) {
        this.onboardingRects = [];
      }
    },
    handleOnboardingNext(nextIndex) {
      const idx = Number(nextIndex || 0);
      this.onboardingStepIndex = idx;
      try {
        common_vendor.index.setStorageSync("onboarding_steps", this.onboardingSteps);
        common_vendor.index.setStorageSync("onboarding_index", idx);
      } catch (e) {
      }
      const isH5 = typeof window !== "undefined";
      if (!isH5) {
        if (idx === 4) {
          this.openFirstProductFromOnboarding();
        } else if (idx === 5) {
          this.goRoomSelectFromOnboarding();
        } else if (idx === 6) {
          this.goOrderFromOnboarding();
        } else if (idx === 7) {
          this.goProfileInfoFromOnboarding();
        } else if (idx === 8) {
          this.goProfileFeatureFromOnboarding();
        } else if (idx === 9) {
          this.goProfileAddressFromOnboarding();
        } else {
          this.$nextTick(() => {
            this.refreshOnboardingTargets();
          });
        }
      } else {
        if (idx === 5) {
          this.openFirstProductFromOnboarding();
        } else if (idx === 6) {
          this.goRoomSelectFromOnboarding();
        } else if (idx === 7) {
          this.goOrderFromOnboarding();
        } else if (idx === 8) {
          this.goProfileInfoFromOnboarding();
        } else if (idx === 9) {
          this.goProfileFeatureFromOnboarding();
        } else if (idx === 10) {
          this.goProfileAddressFromOnboarding();
        } else {
          this.$nextTick(() => {
            this.refreshOnboardingTargets();
          });
        }
      }
    },
    handleOnboardingPrev(prevIndex) {
      const idx = Number(prevIndex || 0);
      if (idx < 0)
        return;
      this.onboardingStepIndex = idx;
      try {
        common_vendor.index.setStorageSync("onboarding_index", idx);
      } catch (e) {
      }
      this.$nextTick(() => {
        this.refreshOnboardingTargets();
      });
    },
    handleOnboardingClose() {
      this.showOnboarding = false;
      try {
        common_vendor.index.removeStorageSync("onboarding_continue");
        common_vendor.index.removeStorageSync("onboarding_target_selector");
        common_vendor.index.removeStorageSync("onboarding_step_text");
        common_vendor.index.removeStorageSync("onboarding_steps");
        common_vendor.index.removeStorageSync("onboarding_index");
      } catch (e) {
      }
      try {
        if (common_vendor.index && common_vendor.index.reLaunch) {
          common_vendor.index.reLaunch({ url: "/pages/home/index" });
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
      } catch (e) {
      }
    },
    goHomeFromOnboarding() {
      try {
        if (common_vendor.index && common_vendor.index.switchTab)
          common_vendor.index.switchTab({ url: "/pages/home/index" });
      } catch (e) {
      }
      this.$nextTick(() => {
        this.refreshOnboardingTargets();
      });
    },
    openFirstProductFromOnboarding() {
      try {
        this.showOnboarding = false;
        const first = this.recommendList && this.recommendList[0] || null;
        if (!first)
          return;
        const id = encodeURIComponent(first.id || "");
        try {
          common_vendor.index.setStorageSync("onboarding_continue", true);
          common_vendor.index.setStorageSync("onboarding_target_selector", "#og-product-add");
          common_vendor.index.setStorageSync("onboarding_step_text", "商品详情页查看规格与加入购物车");
          common_vendor.index.setStorageSync("onboarding_steps", this.onboardingSteps);
          common_vendor.index.setStorageSync("onboarding_index", this.onboardingStepIndex);
        } catch (e) {
        }
        if (common_vendor.index && common_vendor.index.navigateTo)
          common_vendor.index.navigateTo({ url: "/pages/product/index?id=" + id });
      } catch (e) {
      }
    },
    goRoomSelectFromOnboarding() {
      try {
        this.showOnboarding = false;
        common_vendor.index.setStorageSync("onboarding_continue", true);
        common_vendor.index.setStorageSync("onboarding_target_selector", "#og-room-modal-list");
        common_vendor.index.setStorageSync("onboarding_step_text", "房间选择，购物车根据房间名进行分组");
        common_vendor.index.setStorageSync("onboarding_steps", this.onboardingSteps);
        common_vendor.index.setStorageSync("onboarding_index", this.onboardingStepIndex);
      } catch (e) {
      }
      try {
        if (common_vendor.index && common_vendor.index.navigateTo)
          common_vendor.index.navigateTo({ url: "/pages/product/index" });
      } catch (e) {
      }
    },
    goOrderFromOnboarding() {
      try {
        this.showOnboarding = false;
        common_vendor.index.setStorageSync("onboarding_continue", true);
        common_vendor.index.setStorageSync("onboarding_target_selector", "#og-order-tabs");
        common_vendor.index.setStorageSync("onboarding_step_text", "订单标签切换与查看");
        common_vendor.index.setStorageSync("onboarding_steps", this.onboardingSteps);
        common_vendor.index.setStorageSync("onboarding_index", this.onboardingStepIndex);
      } catch (e) {
      }
      try {
        if (common_vendor.index && common_vendor.index.navigateTo)
          common_vendor.index.navigateTo({ url: "/pages/order/index" });
      } catch (e) {
      }
    },
    goProfileInfoFromOnboarding() {
      try {
        this.showOnboarding = false;
        common_vendor.index.setStorageSync("onboarding_continue", true);
        common_vendor.index.setStorageSync("onboarding_target_selector", "#og-profile-info");
        common_vendor.index.setStorageSync("onboarding_step_text", "个人信息管理");
        common_vendor.index.setStorageSync("onboarding_steps", this.onboardingSteps);
        common_vendor.index.setStorageSync("onboarding_index", this.onboardingStepIndex);
        if (common_vendor.index && common_vendor.index.switchTab)
          common_vendor.index.switchTab({ url: "/pages/profile/index" });
        else if (common_vendor.index && common_vendor.index.navigateTo)
          common_vendor.index.navigateTo({ url: "/pages/profile/index" });
      } catch (e) {
      }
    },
    goProfileFeatureFromOnboarding() {
      try {
        this.showOnboarding = false;
        common_vendor.index.setStorageSync("onboarding_continue", true);
        common_vendor.index.setStorageSync("onboarding_target_selector", "#og-profile-menu");
        common_vendor.index.setStorageSync("onboarding_step_text", "功能区");
        common_vendor.index.setStorageSync("onboarding_steps", this.onboardingSteps);
        common_vendor.index.setStorageSync("onboarding_index", this.onboardingStepIndex);
        if (common_vendor.index && common_vendor.index.switchTab)
          common_vendor.index.switchTab({ url: "/pages/profile/index" });
        else if (common_vendor.index && common_vendor.index.navigateTo)
          common_vendor.index.navigateTo({ url: "/pages/profile/index" });
      } catch (e) {
      }
    },
    goProfileAddressFromOnboarding() {
      try {
        this.showOnboarding = false;
        common_vendor.index.setStorageSync("onboarding_continue", true);
        common_vendor.index.setStorageSync("onboarding_target_selector", "#og-profile-addr");
        common_vendor.index.setStorageSync("onboarding_step_text", "收货地址管理");
        common_vendor.index.setStorageSync("onboarding_steps", this.onboardingSteps);
        common_vendor.index.setStorageSync("onboarding_index", this.onboardingStepIndex);
        if (common_vendor.index && common_vendor.index.switchTab)
          common_vendor.index.switchTab({ url: "/pages/profile/index" });
        else if (common_vendor.index && common_vendor.index.navigateTo)
          common_vendor.index.navigateTo({ url: "/pages/profile/index" });
      } catch (e) {
      }
    },
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
    openAnnouncementModalH5() {
      this.announcementLoading = true;
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
        }).finally(() => {
          this.announcementLoading = false;
          this.showAnnouncementModal = true;
          this.showAnnContent = true;
        });
      } catch (e) {
        this.announcement = null;
        this.announcementLoading = false;
        this.showAnnouncementModal = true;
        this.showAnnContent = true;
      }
    },
    closeAnnouncementModal() {
      this.showAnnouncementModal = false;
      this.showAnnContent = false;
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
  const _component_OnboardingGuide = common_vendor.resolveComponent("OnboardingGuide");
  (_component_Skeleton + _component_SearchBar + _component_BannerSwiper + _component_ProductCard + _component_OnboardingGuide)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
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
    }),
    i: $data.showOnboarding
  }, $data.showOnboarding ? {
    j: common_vendor.o($options.handleOnboardingNext),
    k: common_vendor.o($options.handleOnboardingPrev),
    l: common_vendor.o($options.handleOnboardingClose),
    m: common_vendor.p({
      steps: $data.onboardingSteps,
      targets: $data.onboardingRects,
      initialIndex: $data.onboardingStepIndex
    })
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-4978fed5"]]);
wx.createPage(MiniProgramPage);
