"use strict";
const common_vendor = require("../../common/vendor.js");
const api_index = require("../../api/index.js");
const common_assets = require("../../common/assets.js");
const RoomSelector = () => "../../components/RoomSelector.js";
const FloatingNav = () => "../../components/FloatingNav.js";
const Skeleton = () => "../../components/Skeleton.js";
const OnboardingGuide = () => "../../components/OnboardingGuide.js";
const _sfc_main = {
  components: { RoomSelector, FloatingNav, Skeleton, OnboardingGuide },
  data() {
    return { hls: null, product: null, current: 0, qty: 1, specTemp: "", specLength: "", roomName: "", roomId: "", roomsRaw: [], mpSheet: false, mpRoomSheet: false, mpTemp: "", mpLength: "", mpRoom: "", mpQty: 1, mpOrderNote: "", specs: [], specsLoading: false, roomSheet: false, roomsList: [], roomInput: "", selectedSpecIndex: -1, isSpecsCollapsed: true, lockScroll: false, lockScrollTop: 0, roomSelectorVisible: false, roomSelectorMode: "h5", addresses: [], selectedAddress: null, h5OrderNote: "", isFavorite: false, swiperTimer: null, carouselInterval: 3e3, lockCarousel: false, showOnboarding: false, onboardingRects: [], onboardingSteps: [], onboardingIndex: 0 };
  },
  onLoad(query) {
    const id = decodeURIComponent((query == null ? void 0 : query.id) || "");
    if (!id) {
      this.product = { id: "", title: "商品", price: 0, sales: 0, image: "/static/logo.png", images: ["/static/logo.png"] };
      return;
    }
    api_index.getProductDetail({ available_product_id: id }).then((res) => {
      const d = (res == null ? void 0 : res.data) || {};
      const clean = (u) => typeof u === "string" ? u.replace(/`/g, "").trim() : "";
      const arr = (x) => Array.isArray(x) ? x.map(clean).filter(Boolean) : [];
      const main = arr(d.main_image);
      const videos = arr(d.video_url);
      const detailImgs = arr(d.images);
      const price = Number(d.price ?? 0) || 0;
      const base = {
        id: d.available_product_id || id,
        title: d.name || "商品 " + id,
        price,
        sales: 0,
        type: d.type || d.product_type || "",
        comment: d.comment || "",
        shipping_origin: clean(d.shipping_origin) || "",
        main_media: [...main, ...videos].length ? [...main, ...videos] : ["/static/logo.png"],
        details_images: detailImgs,
        shipping_time_hours: d.shipping_time_hours || 0,
        support_no_reason_return_7d: d.support_no_reason_return_7d || 0,
        is_free_shipping: d.is_free_shipping || 0,
        image: main[0] || "/static/logo.png",
        images: [...main, ...videos].length ? [...main, ...videos] : ["/static/logo.png"]
      };
      this.product = base;
      this.isFavorite = String(d.is_favorite) === "1" || d.is_favorite === 1 || d.is_favorite === true;
      this.fetchSpecs(base.id);
      this.resetCarouselTimer();
      this.$nextTick(() => {
        const src = this.currentImage;
        if (this.isVideo(src)) {
          this.lockCarousel = true;
          this.stopCarousel();
          try {
            const ctx1 = common_vendor.index.createVideoContext("pd-video", this);
            const ctx2 = common_vendor.index.createVideoContext("mp-video", this);
            if (ctx1 && typeof ctx1.play === "function")
              ctx1.play();
            else if (ctx2 && typeof ctx2.play === "function")
              ctx2.play();
          } catch (e) {
          }
        }
      });
    }).catch(() => {
      this.product = { id, title: "商品 " + id, price: 0, sales: 0, shipping_origin: "", image: "/static/logo.png", images: ["/static/logo.png"] };
      this.fetchSpecs(id);
      this.resetCarouselTimer();
      this.$nextTick(() => {
        const src = this.currentImage;
        if (this.isVideo(src)) {
          this.lockCarousel = true;
          this.stopCarousel();
          try {
            const ctx1 = common_vendor.index.createVideoContext("pd-video", this);
            const ctx2 = common_vendor.index.createVideoContext("mp-video", this);
            if (ctx1 && typeof ctx1.play === "function")
              ctx1.play();
            else if (ctx2 && typeof ctx2.play === "function")
              ctx2.play();
          } catch (e) {
          }
        }
      });
    });
  },
  computed: {
    selectorType() {
      return this.roomSelectorMode === "addr" ? "addr" : "room";
    },
    isStagnantProduct() {
      var _a, _b, _c;
      const t = String(((_a = this.product) == null ? void 0 : _a.type) || ((_b = this.product) == null ? void 0 : _b.product_type) || ((_c = this.product) == null ? void 0 : _c.category) || "").toLowerCase();
      if (!t) {
        const c = String(this.product && this.product.comment || "").toLowerCase();
        return c.includes("stagnant") || c.includes("呆滞");
      }
      return t.includes("stagnant") || t.includes("呆滞");
    },
    images() {
      var _a;
      const imgs = this.product && this.product.main_media || [];
      return imgs.length ? imgs : [((_a = this.product) == null ? void 0 : _a.image) || "/static/logo.png"];
    },
    currentImage() {
      const arr = this.images;
      return arr[this.current] || arr[0];
    },
    videoSrc() {
      const src = this.currentImage;
      if (!this.isVideo(src))
        return "";
      if (src.includes(".m3u8"))
        return "";
      const hasQuery = src.includes("?");
      const t = Date.now();
      return hasQuery ? src + "&t=" + t : src + "?t=" + t;
    },
    selectedSpec() {
      return this.selectedSpecIndex >= 0 && this.specs[this.selectedSpecIndex] ? this.specs[this.selectedSpecIndex] : null;
    },
    addressRooms() {
      return (this.addresses || []).map((a) => ({ name: `${a.receiver} ${a.phone} ${[a.province, a.city, a.district, a.detail_address].filter(Boolean).join(" ")}`.trim(), raw: a }));
    },
    selectorRooms() {
      return this.roomSelectorMode === "addr" ? this.addressRooms : this.roomsRaw;
    },
    selectorSelectedName() {
      if (this.roomSelectorMode === "mp")
        return this.mpRoom || "";
      if (this.roomSelectorMode === "h5")
        return this.roomName || "";
      const a = this.selectedAddress;
      return a ? `${a.receiver} ${a.phone} ${[a.province, a.city, a.district, a.detail_address].filter(Boolean).join(" ")}`.trim() : "";
    },
    mpAddressDisplay() {
      const a = this.selectedAddress;
      return a ? `${a.receiver} ${a.phone} ${[a.province, a.city, a.district, a.detail_address].filter(Boolean).join(" ")}`.trim() : "";
    },
    lengthUnitText() {
      var _a;
      try {
        const u = String(((_a = this.selectedSpec) == null ? void 0 : _a.length_unit) || "").toLowerCase();
        if (u.includes("mm"))
          return "mm";
        if (u.includes("cm"))
          return "cm";
        if (u.includes("dm"))
          return "dm";
        if (u.includes("m"))
          return "m";
        return "m";
      } catch (e) {
        return "m";
      }
    },
    displayTopPrice() {
      var _a;
      const sel = this.selectedSpec;
      const rawBase = sel ? sel.price : (_a = this.product) == null ? void 0 : _a.price;
      if (rawBase === "-" || rawBase === "—")
        return "-";
      const basePerM = Number(rawBase || 0) || 0;
      if (sel && sel.has_length === 1) {
        const rawStr = (this.specLength || "").replace(/[^0-9.]/g, "");
        const raw = rawStr ? Number(rawStr) : 0;
        if (raw > 0) {
          const meters = this.toMeters(raw, this.lengthUnitText);
          return (basePerM * meters).toFixed(2);
        }
        return `${basePerM.toFixed(2)}/m`;
      }
      return basePerM.toFixed(2);
    },
    displayTopPriceWithSymbol() {
      const s = this.displayTopPrice;
      if (s === "-")
        return "-";
      return "¥" + s;
    }
  },
  watch: {
    currentImage: {
      handler(val) {
        this.initHls(val);
      },
      immediate: true
    },
    current(val) {
      const src = (this.images || [])[val];
      if (this.isVideo(src)) {
        this.$nextTick(() => {
          try {
            const ctx1 = common_vendor.index.createVideoContext("pd-video", this);
            const ctx2 = common_vendor.index.createVideoContext("mp-video", this);
            if (ctx1 && typeof ctx1.play === "function")
              ctx1.play();
            else if (ctx2 && typeof ctx2.play === "function")
              ctx2.play();
          } catch (e) {
          }
        });
        this.lockCarousel = true;
      } else {
        this.lockCarousel = false;
        this.resetCarouselTimer();
      }
    }
  },
  beforeDestroy() {
    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }
    this.stopCarousel();
  },
  onShow() {
    this.loadAddresses();
    try {
      const cont = !!common_vendor.index.getStorageSync("onboarding_continue");
      const sel = common_vendor.index.getStorageSync("onboarding_target_selector") || "";
      const idx = Number(common_vendor.index.getStorageSync("onboarding_index") || 0);
      const stepsStored = common_vendor.index.getStorageSync("onboarding_steps") || [];
      if (cont && sel) {
        if (Array.isArray(stepsStored) && stepsStored.length)
          this.onboardingSteps = stepsStored;
        const safeIdx = Math.max(0, Math.min(idx, this.onboardingSteps.length - 1));
        this.onboardingIndex = safeIdx;
        this.$nextTick(() => {
          let isH5 = false;
          try {
            isH5 = typeof window !== "undefined";
          } catch (e) {
            isH5 = false;
          }
          if (sel === "#og-room-modal" || sel === "#og-room-modal-list") {
            if (isH5)
              this.openRoomSheet();
            else
              this.openMpRoomSheet();
            setTimeout(() => {
              this.tryShowOnboarding("#og-room-modal-list", 10);
            }, 220);
          } else {
            this.tryShowOnboarding(sel, 8);
          }
        });
      }
    } catch (e) {
    }
  },
  methods: {
    tryShowOnboarding(sel, tries) {
      const max = Math.max(1, Number(tries || 6));
      const attempt = (left) => {
        let isH5 = false;
        try {
          isH5 = typeof window !== "undefined";
        } catch (e) {
          isH5 = false;
        }
        if (isH5) {
          const el = typeof document !== "undefined" ? document.querySelector(sel) : null;
          if (el) {
            this.refreshOnboardingRect(sel);
            return;
          }
        } else {
          const q = common_vendor.index.createSelectorQuery().in(this);
          q.select(sel).boundingClientRect();
          q.exec((res) => {
            const r = (res || [])[0];
            if (r) {
              this.refreshOnboardingRect(sel);
              return;
            }
          });
        }
        if (!this.showOnboarding)
          this.showOnboarding = true;
        if (left > 0) {
          setTimeout(() => attempt(left - 1), 160);
        }
      };
      attempt(max);
    },
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
    initHls(src) {
    },
    isVideo(src) {
      if (!src)
        return false;
      return src.includes(".mp4") || src.includes(".m3u8");
    },
    onSwiperChange(e) {
      try {
        const idx = e && e.detail && typeof e.detail.current === "number" ? e.detail.current : 0;
        this.current = idx;
        const src = (this.images || [])[idx];
        if (this.isVideo(src)) {
          this.lockCarousel = true;
          this.stopCarousel();
          this.$nextTick(() => {
            try {
              const ctx1 = common_vendor.index.createVideoContext("pd-video", this);
              const ctx2 = common_vendor.index.createVideoContext("mp-video", this);
              if (ctx1 && typeof ctx1.play === "function")
                ctx1.play();
              else if (ctx2 && typeof ctx2.play === "function")
                ctx2.play();
            } catch (e2) {
            }
          });
        } else {
          this.lockCarousel = false;
          this.resetCarouselTimer();
        }
      } catch (e2) {
      }
    },
    pauseCarousel() {
      this.lockCarousel = true;
      this.stopCarousel();
    },
    onVideoEnded() {
      this.lockCarousel = false;
      const n = (this.images || []).length || 1;
      setTimeout(() => {
        this.current = (this.current + 1) % n;
        this.resetCarouselTimer();
      }, 1e3);
    },
    startCarousel() {
      if (this.swiperTimer)
        return;
      const interval = Number(this.carouselInterval) || 3e3;
      this.swiperTimer = setInterval(() => {
        try {
          if (this.lockCarousel)
            return;
          const n = (this.images || []).length || 1;
          this.current = (this.current + 1) % n;
        } catch (e) {
        }
      }, interval);
    },
    stopCarousel() {
      try {
        if (this.swiperTimer) {
          clearInterval(this.swiperTimer);
          this.swiperTimer = null;
        }
      } catch (e) {
      }
    },
    resetCarouselTimer() {
      this.stopCarousel();
      this.startCarousel();
    },
    refreshOnboardingRect(sel) {
      let isH5 = false;
      try {
        isH5 = typeof window !== "undefined";
      } catch (e) {
        isH5 = false;
      }
      const total = this.onboardingSteps.length || 0;
      const arr = new Array(total).fill(null);
      if (isH5) {
        const el = typeof document !== "undefined" ? document.querySelector(sel) : null;
        if (el) {
          const r = el.getBoundingClientRect();
          arr[this.onboardingIndex] = { left: r.left, top: r.top, width: r.width, height: r.height };
          this.onboardingRects = arr;
          this.showOnboarding = true;
        }
      } else {
        const q = common_vendor.index.createSelectorQuery().in(this);
        q.select(sel).boundingClientRect();
        q.exec((res) => {
          const r = (res || [])[0];
          if (r) {
            arr[this.onboardingIndex] = { left: r.left, top: r.top, width: r.width, height: r.height };
            this.onboardingRects = arr;
            this.showOnboarding = true;
          }
        });
      }
    },
    handleOnboardingNext(nextIndex) {
      const idx = Number(nextIndex || 0);
      this.onboardingIndex = idx;
      try {
        common_vendor.index.setStorageSync("onboarding_index", idx);
        if (Array.isArray(this.onboardingSteps) && this.onboardingSteps.length) {
          common_vendor.index.setStorageSync("onboarding_steps", this.onboardingSteps);
        }
      } catch (e) {
      }
      try {
        common_vendor.index.setStorageSync("onboarding_continue", true);
        const isH5 = typeof window !== "undefined";
        if (isH5) {
          if (idx <= 4) {
            const map = ["#og-search", "#og-cate", "#og-banner", "#og-guess", "#og-quick"];
            const sel = map[idx] || "#og-search";
            common_vendor.index.setStorageSync("onboarding_target_selector", sel);
            if (common_vendor.index.switchTab)
              common_vendor.index.switchTab({ url: "/pages/home/index" });
            else
              common_vendor.index.navigateTo({ url: "/pages/home/index" });
          } else if (idx === 5) {
            this.$nextTick(() => {
              this.refreshOnboardingRect("#og-product-add");
            });
          } else if (idx === 6) {
            this.openRoomSheet();
            setTimeout(() => {
              this.refreshOnboardingRect("#og-room-modal-list");
            }, 220);
          } else if (idx === 7) {
            common_vendor.index.setStorageSync("onboarding_target_selector", "#og-order-tabs");
            common_vendor.index.setStorageSync("onboarding_step_text", "订单标签切换与查看");
            common_vendor.index.navigateTo({ url: "/pages/order/index" });
          } else if (idx === 8) {
            common_vendor.index.setStorageSync("onboarding_target_selector", "#og-profile-info");
            common_vendor.index.setStorageSync("onboarding_step_text", "个人信息管理");
            if (common_vendor.index.switchTab)
              common_vendor.index.switchTab({ url: "/pages/profile/index" });
            else
              common_vendor.index.navigateTo({ url: "/pages/profile/index" });
          } else if (idx === 9) {
            common_vendor.index.setStorageSync("onboarding_target_selector", "#og-profile-menu");
            common_vendor.index.setStorageSync("onboarding_step_text", "功能区");
            if (common_vendor.index.switchTab)
              common_vendor.index.switchTab({ url: "/pages/profile/index" });
            else
              common_vendor.index.navigateTo({ url: "/pages/profile/index" });
          } else if (idx === 10) {
            common_vendor.index.setStorageSync("onboarding_target_selector", "#og-profile-addr");
            common_vendor.index.setStorageSync("onboarding_step_text", "收货地址管理");
            if (common_vendor.index.switchTab)
              common_vendor.index.switchTab({ url: "/pages/profile/index" });
            else
              common_vendor.index.navigateTo({ url: "/pages/profile/index" });
          }
        } else {
          if (idx <= 3) {
            const map = ["#og-search", "#og-mp-cate", "#og-banner", "#og-mp-guess"];
            const sel = map[idx] || "#og-search";
            common_vendor.index.setStorageSync("onboarding_target_selector", sel);
            if (common_vendor.index.switchTab)
              common_vendor.index.switchTab({ url: "/pages/home/index" });
            else
              common_vendor.index.navigateTo({ url: "/pages/home/index" });
          } else if (idx === 4) {
            this.$nextTick(() => {
              this.refreshOnboardingRect("#og-product-add");
            });
          } else if (idx === 5) {
            this.openMpRoomSheet();
            setTimeout(() => {
              this.refreshOnboardingRect("#og-room-modal-list");
            }, 220);
          } else if (idx === 6) {
            common_vendor.index.setStorageSync("onboarding_target_selector", "#og-order-tabs");
            common_vendor.index.setStorageSync("onboarding_step_text", "订单标签切换与查看");
            common_vendor.index.navigateTo({ url: "/pages/order/index" });
          } else if (idx === 7) {
            common_vendor.index.setStorageSync("onboarding_target_selector", "#og-profile-info");
            common_vendor.index.setStorageSync("onboarding_step_text", "个人信息管理");
            if (common_vendor.index.switchTab)
              common_vendor.index.switchTab({ url: "/pages/profile/index" });
            else
              common_vendor.index.navigateTo({ url: "/pages/profile/index" });
          } else if (idx === 8) {
            common_vendor.index.setStorageSync("onboarding_target_selector", "#og-profile-menu");
            common_vendor.index.setStorageSync("onboarding_step_text", "功能区");
            if (common_vendor.index.switchTab)
              common_vendor.index.switchTab({ url: "/pages/profile/index" });
            else
              common_vendor.index.navigateTo({ url: "/pages/profile/index" });
          } else if (idx === 9) {
            common_vendor.index.setStorageSync("onboarding_target_selector", "#og-profile-addr");
            common_vendor.index.setStorageSync("onboarding_step_text", "收货地址管理");
            if (common_vendor.index.switchTab)
              common_vendor.index.switchTab({ url: "/pages/profile/index" });
            else
              common_vendor.index.navigateTo({ url: "/pages/profile/index" });
          }
        }
      } catch (e) {
      }
    },
    handleOnboardingPrev(prevIndex) {
      const idx = Number(prevIndex || 0);
      if (idx < 0)
        return;
      this.onboardingIndex = idx;
      try {
        common_vendor.index.setStorageSync("onboarding_index", idx);
        common_vendor.index.setStorageSync("onboarding_continue", true);
      } catch (e) {
      }
      const isH5 = typeof window !== "undefined";
      if (isH5) {
        if (idx <= 4) {
          const map = ["#og-search", "#og-cate", "#og-banner", "#og-guess", "#og-quick"];
          const sel = map[idx] || "#og-search";
          common_vendor.index.setStorageSync("onboarding_target_selector", sel);
          if (common_vendor.index.switchTab)
            common_vendor.index.switchTab({ url: "/pages/home/index" });
          else
            common_vendor.index.navigateTo({ url: "/pages/home/index" });
          return;
        }
        if (idx === 5) {
          this.$nextTick(() => {
            this.refreshOnboardingRect("#og-product-add");
          });
          return;
        }
        if (idx === 6) {
          this.openRoomSheet();
          setTimeout(() => {
            this.refreshOnboardingRect("#og-room-modal-list");
          }, 220);
          return;
        }
        if (idx === 7) {
          common_vendor.index.setStorageSync("onboarding_target_selector", "#og-order-tabs");
          common_vendor.index.navigateTo({ url: "/pages/order/index" });
          return;
        }
        if (idx === 8) {
          common_vendor.index.setStorageSync("onboarding_target_selector", "#og-profile-info");
          if (common_vendor.index.switchTab)
            common_vendor.index.switchTab({ url: "/pages/profile/index" });
          else
            common_vendor.index.navigateTo({ url: "/pages/profile/index" });
          return;
        }
        if (idx === 9) {
          common_vendor.index.setStorageSync("onboarding_target_selector", "#og-profile-menu");
          if (common_vendor.index.switchTab)
            common_vendor.index.switchTab({ url: "/pages/profile/index" });
          else
            common_vendor.index.navigateTo({ url: "/pages/profile/index" });
          return;
        }
        if (idx === 10) {
          common_vendor.index.setStorageSync("onboarding_target_selector", "#og-profile-addr");
          if (common_vendor.index.switchTab)
            common_vendor.index.switchTab({ url: "/pages/profile/index" });
          else
            common_vendor.index.navigateTo({ url: "/pages/profile/index" });
          return;
        }
      } else {
        if (idx <= 3) {
          const map = ["#og-search", "#og-mp-cate", "#og-banner", "#og-mp-guess"];
          const sel = map[idx] || "#og-search";
          common_vendor.index.setStorageSync("onboarding_target_selector", sel);
          if (common_vendor.index.switchTab)
            common_vendor.index.switchTab({ url: "/pages/home/index" });
          else
            common_vendor.index.navigateTo({ url: "/pages/home/index" });
          return;
        }
        if (idx === 4) {
          this.$nextTick(() => {
            this.refreshOnboardingRect("#og-product-add");
          });
          return;
        }
        if (idx === 5) {
          this.openMpRoomSheet();
          setTimeout(() => {
            this.refreshOnboardingRect("#og-room-modal-list");
          }, 220);
          return;
        }
        if (idx === 6) {
          common_vendor.index.setStorageSync("onboarding_target_selector", "#og-order-tabs");
          common_vendor.index.navigateTo({ url: "/pages/order/index" });
          return;
        }
        if (idx === 7) {
          common_vendor.index.setStorageSync("onboarding_target_selector", "#og-profile-info");
          if (common_vendor.index.switchTab)
            common_vendor.index.switchTab({ url: "/pages/profile/index" });
          else
            common_vendor.index.navigateTo({ url: "/pages/profile/index" });
          return;
        }
        if (idx === 8) {
          common_vendor.index.setStorageSync("onboarding_target_selector", "#og-profile-menu");
          if (common_vendor.index.switchTab)
            common_vendor.index.switchTab({ url: "/pages/profile/index" });
          else
            common_vendor.index.navigateTo({ url: "/pages/profile/index" });
          return;
        }
        if (idx === 9) {
          common_vendor.index.setStorageSync("onboarding_target_selector", "#og-profile-addr");
          if (common_vendor.index.switchTab)
            common_vendor.index.switchTab({ url: "/pages/profile/index" });
          else
            common_vendor.index.navigateTo({ url: "/pages/profile/index" });
          return;
        }
      }
    },
    closeOnboarding() {
      this.showOnboarding = false;
      try {
        common_vendor.index.removeStorageSync("onboarding_continue");
        common_vendor.index.removeStorageSync("onboarding_target_selector");
        common_vendor.index.removeStorageSync("onboarding_step_text");
        common_vendor.index.removeStorageSync("onboarding_steps");
        common_vendor.index.removeStorageSync("onboarding_index");
        common_vendor.index.reLaunch({ url: "/pages/home/index" });
      } catch (e) {
      }
    },
    // 获取规格明细（按产品ID），适配返回 data.children
    fetchSpecs(availId) {
      if (!availId)
        return;
      this.specsLoading = true;
      const clean = (u) => typeof u === "string" ? u.replace(/`/g, "").trim() : "";
      api_index.getProductSpecs({ available_product_id: availId }).then((res) => {
        if (res && res.message && res.message.includes("库存"))
          common_vendor.index.showToast({ title: res.message, icon: "none" });
        const children = res && res.data && Array.isArray(res.data.children) ? res.data.children : Array.isArray(res == null ? void 0 : res.children) ? res.children : [];
        this.specs = (children || []).map((it) => ({
          product_id: it.product_id || "",
          name: it.name || "",
          unit: it.unit || "",
          length_unit: it.length_unit || "",
          price: Number(it.price ?? 0) || 0,
          original_price: Number(it.original_price ?? 0) || 0,
          image_url: clean(it.image_url) || "",
          inventory: it.inventory || 0,
          has_length: it.has_length || 0,
          specification: it.specification || "",
          product_type: it.product_type || it.type || ""
        }));
      }).catch(() => {
        this.specs = [];
      }).finally(() => {
        this.specsLoading = false;
        const idx = this.firstSelectableSpecIndex();
        this.selectedSpecIndex = idx;
      });
    },
    selectSpec(index) {
      if (this.selectedSpecIndex === index)
        return;
      this.selectedSpecIndex = index;
    },
    isSpecDisabled(it) {
      try {
        const t = String((it == null ? void 0 : it.product_type) || "").toLowerCase();
        if (t === "stagnant" && Number(it == null ? void 0 : it.inventory) === 0)
          return true;
        return false;
      } catch (e) {
        return false;
      }
    },
    onClickSpec(it, i) {
      if (this.isSpecDisabled(it))
        return;
      this.selectSpec(i);
    },
    firstSelectableSpecIndex() {
      try {
        const arr = Array.isArray(this.specs) ? this.specs : [];
        for (let i = 0; i < arr.length; i++) {
          if (!this.isSpecDisabled(arr[i]))
            return i;
        }
        return -1;
      } catch (e) {
        return -1;
      }
    },
    previewCurrentImage() {
      try {
        const arr = (this.images || []).filter((u) => !this.isVideo(u));
        const cur = this.currentImage;
        const idx = arr.findIndex((u) => u === cur);
        const current = idx >= 0 ? arr[idx] : arr[0] || "";
        if (!current)
          return;
        common_vendor.index.previewImage({ urls: arr.length ? arr : [current], current });
      } catch (e) {
      }
    },
    previewDetailImage(src) {
      var _a;
      try {
        const arr = (((_a = this.product) == null ? void 0 : _a.details_images) || []).filter((u) => typeof u === "string");
        const current = arr.includes(src) ? src : arr[0] || "";
        if (!current)
          return;
        common_vendor.index.previewImage({ urls: arr.length ? arr : [current], current });
      } catch (e) {
      }
    },
    previewMpImage(item) {
      try {
        if (this.isVideo(item))
          return;
        const arr = (this.images || []).filter((u) => !this.isVideo(u));
        const current = arr.includes(item) ? item : arr[0] || "";
        if (!current)
          return;
        common_vendor.index.previewImage({ urls: arr.length ? arr : [current], current });
      } catch (e) {
      }
    },
    ensureLoggedIn() {
      try {
        const u = common_vendor.index.getStorageSync("user") || null;
        const exp = common_vendor.index.getStorageSync("token_expiration") || 0;
        const ok = !!u && (!exp || Date.now() < exp);
        if (ok)
          return true;
        common_vendor.index.showModal({
          title: "提示",
          content: "点击前往登陆的话就跳转到登陆页面",
          cancelText: "取消",
          confirmText: "去登录",
          success: (res) => {
            if (res && res.confirm) {
              try {
                common_vendor.index.navigateTo({ url: "/pages/login/index" });
              } catch (e) {
              }
            }
          }
        });
        return false;
      } catch (e) {
        return false;
      }
    },
    addToCart() {
      var _a;
      if (!this.ensureLoggedIn())
        return;
      const spec = this.selectedSpecIndex >= 0 && this.specs[this.selectedSpecIndex] ? this.specs[this.selectedSpecIndex] : null;
      const pid = spec ? spec.product_id : ((_a = this.product) == null ? void 0 : _a.id) || "";
      api_index.addCartItem({ product_id: pid, quantity: 1 }).then((res) => {
        var _a2;
        if (res && res.success)
          common_vendor.index.showToast({ title: "已加入购物车", icon: "success" });
        else {
          const tip = typeof (res == null ? void 0 : res.data) === "string" ? res.data : ((_a2 = res == null ? void 0 : res.data) == null ? void 0 : _a2.reason) || "";
          const msg = tip || (res == null ? void 0 : res.message) || "加入失败";
          common_vendor.index.showToast({ title: msg, icon: "none" });
        }
      }).catch(() => {
        common_vendor.index.showToast({ title: "加入购物车失败", icon: "none" });
      });
    },
    incQty() {
      this.qty = Math.max(1, Number(this.qty || 0) + 1);
    },
    decQty() {
      this.qty = Math.max(1, Number(this.qty || 0) - 1);
    },
    normalizeQty() {
      const n = Number(this.qty);
      this.qty = isNaN(n) ? 1 : Math.max(1, Math.floor(n));
    },
    addToCartWithQty() {
      var _a;
      if (!this.ensureLoggedIn())
        return;
      const chosen = (this.roomName || "").trim();
      if (!chosen) {
        common_vendor.index.showToast({ title: "请先填写房间名", icon: "none" });
        return;
      }
      const lengthNum = (this.specLength || "").replace(/[^0-9.]/g, "");
      const lengthVal = lengthNum ? Number(lengthNum) : void 0;
      const needLength = this.selectedSpec && this.selectedSpec.has_length === 1;
      if (needLength && (!lengthVal || Number(lengthVal) <= 0)) {
        common_vendor.index.showToast({ title: "请填写长度", icon: "none" });
        return;
      }
      if (!this.qty || this.qty <= 0) {
        common_vendor.index.showToast({ title: "请填写数量", icon: "none" });
        return;
      }
      const spec = this.selectedSpecIndex >= 0 && this.specs[this.selectedSpecIndex] ? this.specs[this.selectedSpecIndex] : null;
      if (spec && spec.specification && lengthVal) {
        const max = parseFloat(spec.specification);
        if (!isNaN(max) && lengthVal > max) {
          common_vendor.index.showModal({ title: "提示", content: "长度不能超过 " + spec.specification, showCancel: false });
          return;
        }
      }
      const pid = spec ? spec.product_id : ((_a = this.product) == null ? void 0 : _a.id) || "";
      const q = Math.max(1, Number(this.qty || 1));
      api_index.addCartItem({ room_id: this.roomId, product_id: pid, length: lengthNum, quantity: q, color: this.specTemp || "", note: this.h5OrderNote || "" }).then((res) => {
        var _a2;
        if (res && res.success)
          common_vendor.index.showToast({ title: `已加入房间：${chosen}`, icon: "success" });
        else {
          const tip = typeof (res == null ? void 0 : res.data) === "string" ? res.data : ((_a2 = res == null ? void 0 : res.data) == null ? void 0 : _a2.reason) || "";
          const msg = tip || (res == null ? void 0 : res.message) || "加入失败";
          common_vendor.index.showToast({ title: msg, icon: "none" });
        }
      }).catch(() => {
        common_vendor.index.showToast({ title: "加入购物车失败", icon: "none" });
      });
    },
    buyNow() {
      var _a, _b, _c;
      if (!this.ensureLoggedIn())
        return;
      try {
        const spec = this.selectedSpec;
        const pid = spec ? spec.product_id || ((_a = this.product) == null ? void 0 : _a.id) || "" : ((_b = this.product) == null ? void 0 : _b.id) || "";
        const addrId = ((_c = this.selectedAddress) == null ? void 0 : _c.id) || "";
        const roomName = (this.roomName || "").trim();
        if (!roomName) {
          common_vendor.index.showToast({ title: "请填写房间名", icon: "none" });
          return;
        }
        const needLength = spec && spec.has_length === 1;
        const rawLen = (this.specLength || "").replace(/[^0-9.]/g, "");
        const lenNum = rawLen ? Number(rawLen) : 0;
        if (needLength && (!lenNum || lenNum <= 0)) {
          common_vendor.index.showToast({ title: "请填写长度", icon: "none" });
          return;
        }
        if (!addrId) {
          common_vendor.index.showToast({ title: "请先选择收货地址", icon: "none" });
          return;
        }
        const roomId = this.roomId || "";
        const qty = this.qty || 1;
        const note = this.h5OrderNote || "";
        const lenMeters = !needLength ? "" : lenNum;
        const u = common_vendor.index.getStorageSync("user") || null;
        const token = u && (u.token || u.data && u.data.token) || "";
        common_vendor.index.showLoading({ title: "下单中" });
        api_index.createDirectOrder({ product_id: pid, address_id: addrId, note, length: lenMeters, quantity: qty, room_id: roomId, token }).then((data) => {
          var _a2;
          common_vendor.index.hideLoading();
          if (data && data.success) {
            common_vendor.index.showToast({ title: "下单成功", icon: "success" });
            const orderId = data && data.data && (data.data.order_id || data.data.id) || "";
            if (orderId) {
              common_vendor.index.navigateTo({ url: "/pages/order/index?id=" + orderId });
            }
          } else {
            const tip = typeof (data == null ? void 0 : data.data) === "string" ? data.data : ((_a2 = data == null ? void 0 : data.data) == null ? void 0 : _a2.reason) || "";
            const msg = tip || data && data.message || "下单失败";
            common_vendor.index.showToast({ title: msg, icon: "none" });
          }
        }).catch(() => {
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({ title: "网络错误", icon: "none" });
        });
      } catch (e) {
        common_vendor.index.showToast({ title: "下单失败", icon: "none" });
      }
    },
    // MP-WEIXIN 规格填写
    openSpecSheet() {
      var _a;
      this.mpSheet = true;
      const pid = ((_a = this.product) == null ? void 0 : _a.id) || "";
      this.fetchSpecs(pid);
      this.lockScroll = false;
    },
    closeSpecSheet() {
      this.mpSheet = false;
      this.lockScroll = false;
    },
    // H5 房间选择弹窗
    openRoomSheet() {
      this.roomSelectorMode = "h5";
      this.roomSelectorVisible = true;
      this.fetchRooms();
    },
    closeRoomSheet() {
      this.roomSelectorVisible = false;
    },
    openH5AddressSheet() {
      this.roomSelectorMode = "addr";
      this.roomSelectorVisible = true;
      this.loadAddresses();
    },
    fetchRooms() {
      api_index.getRooms().then((res) => {
        var _a, _b, _c;
        const raw = Array.isArray((_a = res == null ? void 0 : res.data) == null ? void 0 : _a.items) ? res.data.items : Array.isArray(res == null ? void 0 : res.items) ? res.items : Array.isArray((_b = res == null ? void 0 : res.data) == null ? void 0 : _b.children) ? res.data.children : Array.isArray((_c = res == null ? void 0 : res.data) == null ? void 0 : _c.list) ? res.data.list : Array.isArray(res == null ? void 0 : res.data) ? res.data : [];
        this.roomsRaw = (raw || []).map((it) => typeof it === "string" ? { id: "", name: it } : { id: (it == null ? void 0 : it.id) || (it == null ? void 0 : it.room_id) || "", name: (it == null ? void 0 : it.name) || (it == null ? void 0 : it.room_name) || "" });
        this.roomsList = this.roomsRaw.map((it) => it.name).filter((x) => !!x);
      }).catch(() => {
        this.roomsList = [];
      });
    },
    loadAddresses() {
      api_index.getAddresses().then((res) => {
        var _a;
        const raw = Array.isArray((_a = res == null ? void 0 : res.data) == null ? void 0 : _a.items) ? res.data.items : Array.isArray(res == null ? void 0 : res.items) ? res.items : [];
        this.addresses = raw.map((a) => ({
          id: a.addresses_id || a.id || "",
          receiver: a.receiver || "",
          phone: a.phone || "",
          province: a.province || "",
          city: a.city || "",
          district: a.district || "",
          detail_address: a.detail_address || "",
          is_default: a.is_default === 1
        }));
        const cached = common_vendor.index.getStorageSync("selected_address_id") || "";
        let pick = this.addresses.find((x) => x.id === cached) || this.addresses.find((x) => x.is_default) || this.addresses[0];
        this.selectedAddress = pick || null;
        if (this.roomSelectorMode === "addr" && this.roomSelectorVisible && this.addresses.length === 0) {
          try {
            common_vendor.index.showToast({ title: "暂无收货地址，去创建吧", icon: "none" });
          } catch (e) {
          }
        }
      }).catch(() => {
        this.addresses = [];
        this.selectedAddress = null;
      });
    },
    onRoomSelect(room) {
      if (this.roomSelectorMode === "addr") {
        if (room && room.raw) {
          this.selectedAddress = room.raw;
          try {
            common_vendor.index.setStorageSync("selected_address_id", this.selectedAddress.id);
          } catch (e) {
          }
        }
      } else if (this.roomSelectorMode === "mp") {
        this.mpRoom = room.name;
      } else {
        this.roomName = room.name;
        this.roomId = room.id;
      }
      this.roomSelectorVisible = false;
    },
    onRoomCreate(name) {
      if (!name)
        return;
      api_index.createRoom({ name }).then((res) => {
        common_vendor.index.showToast({ title: "房间已创建", icon: "success" });
        const rid = res && res.data && (res.data.room_id || res.data.id) || res && (res.room_id || res.id) || "";
        if (this.roomSelectorMode === "mp") {
          this.mpRoom = name;
          if (rid) {
            const exist = (this.roomsRaw || []).find((r) => r.id === rid);
            if (!exist)
              this.roomsRaw = [{ id: rid, name }, ...this.roomsRaw];
          }
        } else {
          this.roomName = name;
          this.roomId = rid || this.roomId;
          if (rid) {
            const exist = (this.roomsRaw || []).find((r) => r.id === rid);
            if (!exist)
              this.roomsRaw = [{ id: rid, name }, ...this.roomsRaw];
          }
        }
        this.roomSelectorVisible = false;
        if (!rid)
          this.fetchRooms();
      }).catch(() => {
        common_vendor.index.showToast({ title: "创建房间失败", icon: "none" });
      });
    },
    onCreateAddress(payload) {
      const u = common_vendor.index.getStorageSync("user");
      const token = u && (u.token || u.data && u.data.token) || "";
      const data = { receiver: payload.receiver, phone: payload.phone, province: payload.province, city: payload.city, district: payload.district, detail_address: payload.detail_address, is_default: payload.is_default };
      api_index.addAddress({ ...data, token }).then((res) => {
        var _a;
        if (res && res.success) {
          const id = res && res.data && (res.data.addresses_id || res.data.id) || "";
          const item = { id, receiver: data.receiver, phone: data.phone, province: data.province, city: data.city, district: data.district, detail_address: data.detail_address, is_default: data.is_default === 1 };
          this.addresses = [item, ...this.addresses];
          this.selectedAddress = item;
          try {
            common_vendor.index.setStorageSync("selected_address_id", id);
          } catch (e) {
          }
          common_vendor.index.showToast({ title: "已保存", icon: "success" });
          this.roomSelectorVisible = false;
        } else {
          const tip = typeof (res == null ? void 0 : res.data) === "string" ? res.data : ((_a = res == null ? void 0 : res.data) == null ? void 0 : _a.reason) || "";
          const msg = tip || res && res.message || "保存失败";
          common_vendor.index.showToast({ title: msg, icon: "none" });
        }
      }).catch(() => {
        common_vendor.index.showToast({ title: "保存失败", icon: "none" });
      });
    },
    confirmSpecToCart() {
      var _a;
      const needLength = this.selectedSpec && this.selectedSpec.has_length === 1;
      if (!this.mpRoom || needLength && !this.mpLength || !this.mpQty) {
        common_vendor.index.showToast({ title: "请填写房间名、长度、数量", icon: "none" });
        return;
      }
      const chosen = (this.mpRoom || "").trim();
      const found = (this.roomsRaw || []).find((it) => it.name === chosen);
      const rid = found ? found.id : "";
      const lengthNum = (this.mpLength || "").replace(/[^0-9.]/g, "");
      const lengthVal = lengthNum ? Number(lengthNum) : void 0;
      const spec = this.selectedSpecIndex >= 0 && this.specs[this.selectedSpecIndex] ? this.specs[this.selectedSpecIndex] : null;
      if (spec && spec.specification && lengthVal) {
        const max = parseFloat(spec.specification);
        if (!isNaN(max) && lengthVal > max) {
          common_vendor.index.showModal({ title: "提示", content: "长度不能超过 " + spec.specification, showCancel: false });
          return;
        }
      }
      const pid = spec ? spec.product_id : ((_a = this.product) == null ? void 0 : _a.id) || "";
      const mq = Math.max(1, Number(this.mpQty || 1));
      api_index.addCartItem({ room_id: rid, product_id: pid, length: lengthVal, quantity: mq, color: this.mpTemp || "", note: this.mpOrderNote || "" }).then((res) => {
        var _a2;
        if (res && res.success) {
          this.mpSheet = false;
          common_vendor.index.showToast({ title: `已加入房间：${chosen}`, icon: "success" });
        } else {
          const tip = typeof (res == null ? void 0 : res.data) === "string" ? res.data : ((_a2 = res == null ? void 0 : res.data) == null ? void 0 : _a2.reason) || "";
          const msg = tip || (res == null ? void 0 : res.message) || "加入失败";
          common_vendor.index.showToast({ title: msg, icon: "none" });
        }
      }).catch(() => {
        common_vendor.index.showToast({ title: "加入购物车失败", icon: "none" });
      });
    },
    normalizeMpQty() {
      const n = Number(this.mpQty);
      this.mpQty = isNaN(n) ? 1 : Math.max(1, Math.floor(n));
    },
    // MP Room Sheet Methods
    openMpRoomSheet() {
      this.roomSelectorMode = "mp";
      this.roomSelectorVisible = true;
      this.fetchRooms();
    },
    openMpAddressSheet() {
      this.roomSelectorMode = "addr";
      this.roomSelectorVisible = true;
      this.loadAddresses();
    },
    closeMpRoomSheet() {
      this.roomSelectorVisible = false;
      this.lockScroll = false;
    },
    formatPriceWithSymbol(val) {
      try {
        if (val === "-" || val === "—")
          return "-";
        const n = Number(val);
        if (isNaN(n))
          return "-";
        return "¥" + n.toFixed(2);
      } catch (e) {
        return "-";
      }
    },
    displaySpecPrice(it) {
      if (!it)
        return 0;
      const base = Number(it.price || 0) || 0;
      if (it.has_length !== 1)
        return base;
      const spec = String(it.specification || "").toLowerCase();
      const unit = this.parseLengthUnit(it.length_unit || it.unit, spec);
      const mult = this.unitMultiplier(unit);
      return base * mult;
    },
    parseLengthUnit(unit, spec) {
      const u = String(unit || "").toLowerCase();
      const s = String(spec || "").toLowerCase();
      if (u.includes("mm") || /(^|[^a-z])mm([^a-z]|$)/.test(s))
        return "mm";
      if (u.includes("cm") || /(^|[^a-z])cm([^a-z]|$)/.test(s))
        return "cm";
      if (u.includes("dm") || /(^|[^a-z])dm([^a-z]|$)/.test(s))
        return "dm";
      if (u.includes("m") || /(^|[^a-z])m([^a-z]|$)/.test(s))
        return "m";
      return "m";
    },
    unitMultiplier(unit) {
      if (unit === "mm")
        return 1e3;
      if (unit === "cm")
        return 100;
      if (unit === "dm")
        return 10;
      return 1;
    },
    toMeters(len, unit) {
      const u = unit || "m";
      if (u === "mm")
        return Number(len) / 1e3;
      if (u === "cm")
        return Number(len) / 100;
      if (u === "dm")
        return Number(len) / 10;
      return Number(len);
    },
    favProduct() {
      var _a;
      try {
        const pid = ((_a = this.product) == null ? void 0 : _a.id) || "";
        const u = common_vendor.index.getStorageSync("user") || null;
        const token = u && (u.token || u.data && u.data.token) || "";
        if (!pid) {
          common_vendor.index.showToast({ title: "商品信息缺失", icon: "none" });
          return;
        }
        if (!token) {
          common_vendor.index.showToast({ title: "请先登录", icon: "none" });
          return;
        }
        if (!this.isFavorite) {
          api_index.addFavorite({ product_id: pid, token }).then((res) => {
            if (res && res.success) {
              this.isFavorite = true;
              common_vendor.index.showToast({ title: "已收藏", icon: "success" });
            } else {
              common_vendor.index.showToast({ title: (res == null ? void 0 : res.message) || "收藏失败", icon: "none" });
            }
          }).catch(() => {
            common_vendor.index.showToast({ title: "收藏失败", icon: "none" });
          });
        } else {
          api_index.deleteFavorite({ product_id: pid, token }).then((res) => {
            if (res && res.success) {
              this.isFavorite = false;
              common_vendor.index.showToast({ title: "已取消收藏", icon: "success" });
            } else {
              common_vendor.index.showToast({ title: (res == null ? void 0 : res.message) || "取消失败", icon: "none" });
            }
          }).catch(() => {
            common_vendor.index.showToast({ title: "取消失败", icon: "none" });
          });
        }
      } catch (e) {
        common_vendor.index.showToast({ title: "收藏失败", icon: "none" });
      }
    }
  }
};
if (!Array) {
  const _component_Skeleton = common_vendor.resolveComponent("Skeleton");
  const _component_RoomSelector = common_vendor.resolveComponent("RoomSelector");
  const _component_OnboardingGuide = common_vendor.resolveComponent("OnboardingGuide");
  (_component_Skeleton + _component_RoomSelector + _component_OnboardingGuide)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.p({
      loading: !$data.product,
      showTitle: true
    }),
    b: $data.product
  }, $data.product ? common_vendor.e({
    c: common_vendor.f($options.images, (item, index, i0) => {
      return common_vendor.e({
        a: $options.isVideo(item)
      }, $options.isVideo(item) ? {
        b: index === $data.current ? "mp-video" : "mp-video-" + index,
        c: item,
        d: common_vendor.o((...args) => $options.pauseCarousel && $options.pauseCarousel(...args), index),
        e: common_vendor.o((...args) => $options.onVideoEnded && $options.onVideoEnded(...args), index)
      } : {
        f: item,
        g: common_vendor.o(($event) => $options.previewMpImage(item), index)
      }, {
        h: index
      });
    }),
    d: $data.current,
    e: common_vendor.o((...args) => $options.onSwiperChange && $options.onSwiperChange(...args)),
    f: common_vendor.t($data.product.title),
    g: common_vendor.t($data.isFavorite ? "★" : "☆"),
    h: $data.isFavorite ? 1 : "",
    i: common_vendor.o((...args) => $options.favProduct && $options.favProduct(...args)),
    j: common_vendor.t($options.formatPriceWithSymbol($data.product.price)),
    k: common_vendor.t($data.product.sales),
    l: common_vendor.t($data.product.id || "默认款"),
    m: common_vendor.t($data.product.title),
    n: common_vendor.t($data.product.shipping_origin ? $data.product.shipping_origin.replace(/省|市/g, "") : "—"),
    o: common_vendor.t($data.product.price.toFixed(2)),
    p: common_vendor.f($data.product.details_images, (src, i, i0) => {
      return {
        a: "md" + i,
        b: src,
        c: common_vendor.o(($event) => $options.previewDetailImage(src), "md" + i)
      };
    }),
    q: common_vendor.o((...args) => $options.openSpecSheet && $options.openSpecSheet(...args)),
    r: $data.mpSheet
  }, $data.mpSheet ? common_vendor.e({
    s: $data.selectedAddress
  }, $data.selectedAddress ? {
    t: common_vendor.t($data.selectedAddress.receiver),
    v: common_vendor.t($data.selectedAddress.phone)
  } : {}, {
    w: $data.selectedAddress
  }, $data.selectedAddress ? {
    x: common_vendor.t($data.selectedAddress.province),
    y: common_vendor.t($data.selectedAddress.city),
    z: common_vendor.t($data.selectedAddress.district),
    A: common_vendor.t($data.selectedAddress.detail_address)
  } : {}, {
    B: common_vendor.o((...args) => $options.openMpAddressSheet && $options.openMpAddressSheet(...args)),
    C: $data.specsLoading
  }, $data.specsLoading ? {} : $data.specs && $data.specs.length ? common_vendor.e({
    E: common_vendor.f($data.isSpecsCollapsed ? $data.specs.slice(0, 2) : $data.specs, (it, i, i0) => {
      return common_vendor.e({
        a: common_vendor.t(it.name),
        b: common_vendor.t($options.formatPriceWithSymbol(it.price)),
        c: Number(it.original_price) > 0
      }, Number(it.original_price) > 0 ? {
        d: common_vendor.t(Number(it.original_price).toFixed(2))
      } : {}, {
        e: common_vendor.t(it.unit || "—"),
        f: String(it.product_type || "").toLowerCase() === "stagnant" && Number(it.inventory) === 0
      }, String(it.product_type || "").toLowerCase() === "stagnant" && Number(it.inventory) === 0 ? {
        g: common_assets._imports_0$1
      } : {}, {
        h: "mpsp" + i,
        i: $data.selectedSpecIndex === i ? 1 : "",
        j: $options.isSpecDisabled(it) ? 1 : "",
        k: common_vendor.o(($event) => $options.onClickSpec(it, i), "mpsp" + i)
      });
    }),
    F: $data.specs.length >= 3
  }, $data.specs.length >= 3 ? {
    G: common_vendor.t($data.isSpecsCollapsed ? "展开更多" : "收起"),
    H: common_vendor.t($data.isSpecsCollapsed ? "▼" : "▲"),
    I: common_vendor.o(($event) => $data.isSpecsCollapsed = !$data.isSpecsCollapsed)
  } : {}) : {}, {
    D: $data.specs && $data.specs.length,
    J: common_vendor.t($data.mpRoom || "请选择房间"),
    K: common_vendor.o((...args) => $options.openMpRoomSheet && $options.openMpRoomSheet(...args)),
    L: $options.selectedSpec && $options.selectedSpec.has_length === 1
  }, $options.selectedSpec && $options.selectedSpec.has_length === 1 ? common_vendor.e({
    M: $data.mpLength,
    N: common_vendor.o(($event) => $data.mpLength = $event.detail.value),
    O: $options.selectedSpec.length_unit
  }, $options.selectedSpec.length_unit ? {
    P: common_vendor.t($options.selectedSpec.length_unit)
  } : {}) : {}, {
    Q: $data.mpOrderNote,
    R: common_vendor.o(($event) => $data.mpOrderNote = $event.detail.value),
    S: common_vendor.o(($event) => $data.mpQty = Math.max(1, Number($data.mpQty) - 1)),
    T: common_vendor.o((...args) => $options.normalizeMpQty && $options.normalizeMpQty(...args)),
    U: $data.mpQty,
    V: common_vendor.o(($event) => $data.mpQty = $event.detail.value),
    W: common_vendor.o(($event) => $data.mpQty = Math.max(1, Number($data.mpQty) + 1)),
    X: common_vendor.o((...args) => $options.closeSpecSheet && $options.closeSpecSheet(...args)),
    Y: common_vendor.o((...args) => $options.confirmSpecToCart && $options.confirmSpecToCart(...args)),
    Z: common_vendor.o(() => {
    }),
    aa: common_vendor.o((...args) => $options.closeSpecSheet && $options.closeSpecSheet(...args)),
    ab: common_vendor.o(() => {
    })
  }) : {}) : {}, {
    ac: common_vendor.o($options.closeRoomSheet),
    ad: common_vendor.o($options.onRoomSelect),
    ae: common_vendor.o($options.onRoomCreate),
    af: common_vendor.o($options.onCreateAddress),
    ag: common_vendor.p({
      visible: $data.roomSelectorVisible,
      rooms: $options.selectorRooms,
      type: $options.selectorType,
      selectedName: $options.selectorSelectedName
    }),
    ah: $data.mpSheet || $data.roomSelectorVisible ? 1 : "",
    ai: $data.showOnboarding
  }, $data.showOnboarding ? {
    aj: common_vendor.o($options.handleOnboardingNext),
    ak: common_vendor.o($options.handleOnboardingPrev),
    al: common_vendor.o($options.closeOnboarding),
    am: common_vendor.p({
      steps: $data.onboardingSteps,
      targets: $data.onboardingRects,
      initialIndex: $data.onboardingIndex
    })
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-a911e391"]]);
wx.createPage(MiniProgramPage);
