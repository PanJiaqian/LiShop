"use strict";
const common_vendor = require("../../common/vendor.js");
const api_index = require("../../api/index.js");
const utils_productPreview = require("../../utils/product-preview.js");
const common_assets = require("../../common/assets.js");
const RoomSelector = () => "../../components/RoomSelector.js";
const FloatingNav = () => "../../components/FloatingNav.js";
const Skeleton = () => "../../components/Skeleton.js";
const OnboardingGuide = () => "../../components/OnboardingGuide.js";
const LoginPrompt = () => "../../components/LoginPrompt.js";
const _sfc_main = {
  components: { RoomSelector, FloatingNav, Skeleton, OnboardingGuide, LoginPrompt },
  data() {
    return { hasUserInteracted: false, hls: null, product: null, pageLoading: true, shareProductId: "", current: 0, qty: 1, specTemp: "", specLength: "", lengthLimitTip: "", roomName: "", roomId: "", roomsRaw: [], mpSheet: false, mpRoomSheet: false, mpTemp: "", mpLength: "", mpRoom: "", mpQty: 1, mpOrderNote: "", specs: [], specsLoading: false, roomSheet: false, roomsList: [], roomInput: "", selectedSpecIndex: -1, isSpecsCollapsed: true, lockScroll: false, lockScrollTop: 0, roomSelectorVisible: false, roomSelectorMode: "h5", addresses: [], selectedAddress: null, h5OrderNote: "", isFavorite: false, swiperTimer: null, carouselInterval: 3e3, lockCarousel: false, showOnboarding: false, onboardingRects: [], onboardingSteps: [], onboardingIndex: 0, showLoginModal: false, coupons: [], selectedCoupon: null, couponSheetVisible: false, packageFeeByProductId: {}, realTimePriceData: null };
  },
  onLoad(query) {
    const id = decodeURIComponent((query == null ? void 0 : query.id) || "");
    this.pageLoading = true;
    this.shareProductId = id;
    if (!id) {
      this.product = { id: "", title: "商品", price: 0, sales: 0, image: "/static/logo.png", images: ["/static/logo.png"], main_media: ["/static/logo.png"], details_images: [] };
      this.pageLoading = false;
      return;
    }
    this.hydratePreviewProduct(id);
    this.fetchProductDetailData(id);
  },
  created() {
    try {
      const h = () => {
        this.showLoginModal = true;
      };
      this._globalLoginHandler = h;
      common_vendor.index.$on("global-login-prompt", h);
    } catch (e) {
    }
  },
  onUnload() {
    try {
      if (this._globalLoginHandler)
        common_vendor.index.$off("global-login-prompt", this._globalLoginHandler);
      this._globalLoginHandler = null;
    } catch (e) {
    }
  },
  onShareAppMessage() {
    let imageUrl = "/static/logo.png";
    try {
      imageUrl = common_vendor.index.getStorageSync("share_image_url") || imageUrl;
    } catch (e) {
    }
    return { title: "诺米灯光定制", path: "/pages/home/index", imageUrl };
  },
  onShareTimeline() {
    let imageUrl = "/static/logo.png";
    try {
      imageUrl = common_vendor.index.getStorageSync("share_image_url") || imageUrl;
    } catch (e) {
    }
    return { title: "诺米灯光定制", query: "", imageUrl };
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
      if (this.isM3u8Video(src))
        return "";
      return this.withCacheBust(src);
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
      const sel = this.selectedSpec || this.specs && this.specs[0] || null;
      let isH5 = false;
      try {
        isH5 = typeof window !== "undefined";
      } catch (e) {
        isH5 = false;
      }
      const lengthRaw = isH5 ? this.specLength : this.mpLength;
      const lengthStr = String(lengthRaw || "").replace(/[^0-9.]/g, "");
      const lengthVal = lengthStr ? Number(lengthStr) : 1;
      const formula = String((sel == null ? void 0 : sel.formula) || "").trim();
      const usesLength = /\blength\b/.test(formula) || Number((sel == null ? void 0 : sel.has_length) || 0) === 1;
      if (this.realTimePriceData && typeof this.realTimePriceData.total_amount !== "undefined") {
        const numText = Number(this.realTimePriceData.total_amount).toFixed(2);
        if (usesLength && !lengthStr)
          return `${numText}/m`;
        return numText;
      }
      isH5 ? this.qty : this.mpQty;
      if (usesLength && lengthStr && isNaN(lengthVal))
        return "-";
      const fallbackNum = Number((sel == null ? void 0 : sel.price) ?? (sel == null ? void 0 : sel.unit_price) ?? ((_a = this.product) == null ? void 0 : _a.price) ?? 0);
      if (isNaN(fallbackNum))
        return "-";
      const defaultText = fallbackNum.toFixed(2);
      if (usesLength && !lengthStr)
        return `${defaultText}/m`;
      return defaultText;
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
      if (this.isPlayableVideo(src)) {
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
    },
    selectedSpecIndex(newVal, oldVal) {
      this.validateSpecLengthLimit(this.specLength);
      if (oldVal !== -1 && oldVal !== void 0) {
        this.hasUserInteracted = true;
      }
      this.triggerRealTimePriceCalc();
    },
    qty(newVal, oldVal) {
      if (oldVal !== void 0)
        this.hasUserInteracted = true;
      this.triggerRealTimePriceCalc();
    },
    specLength(newVal, oldVal) {
      if (oldVal !== void 0)
        this.hasUserInteracted = true;
      this.triggerRealTimePriceCalc();
    },
    mpLength(newVal, oldVal) {
      if (oldVal !== void 0)
        this.hasUserInteracted = true;
      this.triggerRealTimePriceCalc();
    },
    mpQty(newVal, oldVal) {
      if (oldVal !== void 0)
        this.hasUserInteracted = true;
      this.triggerRealTimePriceCalc();
    },
    selectedCoupon(newVal, oldVal) {
      if (oldVal !== void 0)
        this.hasUserInteracted = true;
      this.triggerRealTimePriceCalc();
    },
    roomId(newVal, oldVal) {
      if (oldVal !== void 0 && oldVal !== "")
        this.hasUserInteracted = true;
      this.triggerRealTimePriceCalc();
    },
    selectedAddress() {
      this.triggerRealTimePriceCalc();
    }
  },
  beforeDestroy() {
    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }
    try {
      if (this._detailDeferredTimer) {
        clearTimeout(this._detailDeferredTimer);
        this._detailDeferredTimer = null;
      }
    } catch (e) {
    }
    this.stopCarousel();
  },
  onShow() {
    this.showShareMenus();
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
    /**
     * 显示当前端支持的分享菜单。
     * @description
     * 合并原先分散的 onShow 逻辑，避免生命周期重复定义导致其中一段逻辑失效。
     * @returns {void}
     * @example
     * this.showShareMenus()
     */
    showShareMenus() {
      try {
        const uniAny = common_vendor.index;
        if (uniAny && typeof uniAny.showShareMenu === "function") {
          uniAny.showShareMenu({ withShareTicket: true, menus: ["shareAppMessage", "shareTimeline"] });
          return;
        }
      } catch (e) {
      }
      try {
        const wxAny = typeof common_vendor.wx$1 !== "undefined" ? common_vendor.wx$1 : null;
        if (wxAny && typeof wxAny.showShareMenu === "function") {
          wxAny.showShareMenu({ withShareTicket: true, menus: ["shareAppMessage", "shareTimeline"] });
        }
      } catch (e) {
      }
    },
    /**
     * 使用列表页预取缓存快速填充详情页首屏。
     * @description
     * 新标签页首次打开时先展示轻量商品数据，减少接口返回前的空白等待。
     * @param {string} productId 商品 ID
     * @returns {void}
     * @example
     * this.hydratePreviewProduct('1001')
     */
    hydratePreviewProduct(productId) {
      const preview = utils_productPreview.getCachedProductPreview(productId);
      if (!preview)
        return;
      this.product = {
        id: preview.id || productId,
        title: preview.title || "商品 " + productId,
        price: preview.price === "-" ? 0 : Number(preview.price ?? 0) || 0,
        sales: Number(preview.sales ?? 0) || 0,
        type: "",
        comment: "",
        shipping_origin: "",
        main_media: Array.isArray(preview.main_media) && preview.main_media.length ? preview.main_media : Array.isArray(preview.images) && preview.images.length ? preview.images : ["/static/logo.png"],
        details_images: Array.isArray(preview.details_images) ? preview.details_images : [],
        shipping_time_hours: 0,
        support_no_reason_return_7d: 0,
        is_free_shipping: 0,
        image: preview.image || "/static/logo.png",
        images: Array.isArray(preview.images) && preview.images.length ? preview.images : ["/static/logo.png"]
      };
    },
    /**
     * 拉取完整商品详情数据。
     * @description
     * 获取后端详情数据后更新首屏展示，并将非首屏必要请求延后到下一帧后执行。
     * @param {string} productId 商品 ID
     * @returns {void}
     * @example
     * this.fetchProductDetailData('1001')
     */
    fetchProductDetailData(productId) {
      api_index.getProductDetail({ available_product_id: productId }).then((res) => {
        const d = (res == null ? void 0 : res.data) || {};
        const main = this.collectMediaUrls(d.main_image);
        const videos = this.collectMediaUrls(d.video, d.video_url);
        const detailImgs = this.collectMediaUrls(d.images);
        const mediaList = [...main, ...videos];
        const childrenUnits = Array.isArray(d.children_units) ? d.children_units : [];
        const packageFeeByProductId = {};
        childrenUnits.forEach((item) => {
          const pid = String((item == null ? void 0 : item.product_id) || "").trim();
          const fee = (item == null ? void 0 : item.package_fee_info) || null;
          if (!pid || !fee)
            return;
          packageFeeByProductId[pid] = fee;
        });
        this.packageFeeByProductId = packageFeeByProductId;
        this.product = {
          id: d.available_product_id || productId,
          title: d.name || "商品 " + productId,
          price: Number(d.price ?? 0) || 0,
          sales: Number(d.order_count ?? 0) || 0,
          type: d.type || d.product_type || "",
          comment: d.comment || "",
          shipping_origin: this.normalizeMediaUrl(d.shipping_origin) || "",
          main_media: mediaList.length ? mediaList : ["/static/logo.png"],
          details_images: detailImgs,
          shipping_time_hours: d.shipping_time_hours || 0,
          support_no_reason_return_7d: d.support_no_reason_return_7d || 0,
          is_free_shipping: d.is_free_shipping || 0,
          image: main[0] || "/static/logo.png",
          images: mediaList.length ? mediaList : ["/static/logo.png"]
        };
        this.isFavorite = String(d.is_favorite) === "1" || d.is_favorite === 1 || d.is_favorite === true;
        this.fetchSpecs(this.product.id);
      }).catch(() => {
        this.packageFeeByProductId = {};
        if (!this.product) {
          this.product = { id: productId, title: "商品 " + productId, price: 0, sales: 0, shipping_origin: "", image: "/static/logo.png", images: ["/static/logo.png"], main_media: ["/static/logo.png"], details_images: [] };
        }
        this.fetchSpecs(productId);
      }).finally(() => {
        this.pageLoading = false;
        this.resetCarouselTimer();
        this.$nextTick(() => {
          this.startMediaAutoplayIfNeeded();
        });
        this.deferDetailSideRequests(productId);
      });
    },
    /**
     * 启动当前轮播项的视频自动播放逻辑。
     * @description
     * 仅当当前轮播项是可播放视频时执行，避免重复散落在多个请求回调中。
     * @returns {void}
     * @example
     * this.startMediaAutoplayIfNeeded()
     */
    startMediaAutoplayIfNeeded() {
      const src = this.currentImage;
      if (!this.isPlayableVideo(src))
        return;
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
    },
    /**
     * 延后加载非首屏必要数据。
     * @description
     * 将优惠券与地址请求放到首屏渲染之后，减少新标签页刚打开时的网络竞争。
     * @param {string} productId 商品 ID
     * @returns {void}
     * @example
     * this.deferDetailSideRequests('1001')
     */
    deferDetailSideRequests(productId) {
      try {
        if (this._detailDeferredTimer)
          clearTimeout(this._detailDeferredTimer);
      } catch (e) {
      }
      this._detailDeferredTimer = setTimeout(() => {
        this.fetchCoupons(productId);
        this.loadAddresses();
      }, 120);
    },
    triggerRealTimePriceCalc(force = false) {
      if (!this.hasUserInteracted && !force)
        return;
      if (this._calcTimer)
        clearTimeout(this._calcTimer);
      this._calcTimer = setTimeout(() => {
        this.doCalculateRealTimePrice();
      }, 300);
    },
    doCalculateRealTimePrice() {
      var _a, _b;
      const spec = this.selectedSpec;
      if (!spec) {
        this.realTimePriceData = null;
        return;
      }
      let isH5 = false;
      try {
        isH5 = typeof window !== "undefined";
      } catch (e) {
        isH5 = false;
      }
      const pid = spec.product_id || ((_a = this.product) == null ? void 0 : _a.id) || "";
      const rawLen = isH5 ? this.specLength : this.mpLength;
      const lenStr = String(rawLen || "").replace(/[^0-9.]/g, "");
      const lenNum = lenStr ? Number(lenStr) : null;
      const needLength = spec.has_length === 1;
      const qtyRaw = isH5 ? this.qty : this.mpQty;
      const qty = Math.max(1, Number(qtyRaw || 1));
      const cid = this.selectedCoupon ? this.selectedCoupon.record_id : "";
      const roomId = this.roomId || "";
      const addrId = ((_b = this.selectedAddress) == null ? void 0 : _b.id) || "";
      let token = "";
      try {
        const u = common_vendor.index.getStorageSync("user") || null;
        token = u && (u.token || u.data && u.data.token) || "";
      } catch (e) {
      }
      api_index.calculateDirectPrice({
        product_id: pid,
        length: needLength ? lenNum : null,
        quantity: qty,
        coupon_record_id: cid,
        room_id: roomId,
        address_id: addrId,
        token
      }).then((res) => {
        if (res && res.success && res.data) {
          this.realTimePriceData = res.data;
        } else {
          this.realTimePriceData = null;
          const errMsg = (res && typeof res.data === "string" ? res.data : "") || res && res.message || "";
          if (errMsg && errMsg.includes("长度")) {
            this.lengthLimitTip = errMsg;
          }
        }
      }).catch((err) => {
        common_vendor.index.__f__("error", "at pages/product/index.vue:832", "实时计价失败", err);
        this.realTimePriceData = null;
        const errMsg = (err && typeof err.data === "string" ? err.data : "") || err && err.message || "";
        if (errMsg && errMsg.includes("长度")) {
          this.lengthLimitTip = errMsg;
        }
      });
    },
    fetchCoupons(productId) {
      let token = "";
      try {
        const u = common_vendor.index.getStorageSync("user") || null;
        token = u && (u.token || u.data && u.data.token) || "";
      } catch (e) {
      }
      if (!token || !productId)
        return;
      api_index.getAvailableCoupons({ product_id: productId, token }).then((res) => {
        if (res.success && res.data && res.data.items) {
          this.coupons = res.data.items;
        }
      }).catch(() => {
      });
    },
    openCouponSheet() {
      if (!this.coupons || this.coupons.length === 0) {
        common_vendor.index.showToast({ title: "暂无可用优惠券", icon: "none" });
        return;
      }
      const list = ["不使用优惠券", ...this.coupons.map((c) => c.name)];
      common_vendor.index.showActionSheet({
        itemList: list,
        success: (res) => {
          this.hasUserInteracted = true;
          if (res.tapIndex === 0) {
            this.selectedCoupon = null;
          } else {
            this.selectedCoupon = this.coupons[res.tapIndex - 1];
          }
        }
      });
    },
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
    /**
     * 规范化媒体地址，统一去除空白、引号与无效占位值。
     * @param {string|number|null|undefined} raw 原始媒体地址
     * @returns {string} 清洗后的媒体地址
     * @example
     * const url = this.normalizeMediaUrl(' `https://a.com/demo.mp4` ')
     */
    normalizeMediaUrl(raw) {
      try {
        let s = String(raw ?? "").trim();
        s = s.replace(/`/g, "").trim();
        s = s.replace(/^"+|"+$/g, "");
        s = s.replace(/^'+|'+$/g, "");
        s = s.trim();
        if (!s)
          return "";
        const lower = s.toLowerCase();
        if (lower === "null" || lower === "undefined" || lower === "none")
          return "";
        return s;
      } catch (e) {
        return "";
      }
    },
    /**
     * 汇总并清洗媒体地址，兼容单值、数组及多个字段来源。
     * @param {...any} sources 可能来自后端不同字段的媒体数据
     * @returns {string[]} 清洗后的媒体地址数组
     * @example
     * const videos = this.collectMediaUrls(data.video, data.video_url)
     */
    collectMediaUrls(...sources) {
      const result = [];
      const seen = /* @__PURE__ */ new Set();
      (sources || []).forEach((source) => {
        const list = Array.isArray(source) ? source : [source];
        list.forEach((item) => {
          const url = this.normalizeMediaUrl(item);
          if (url && !seen.has(url)) {
            seen.add(url);
            result.push(url);
          }
        });
      });
      return result;
    },
    /**
     * 为媒体地址追加时间戳，避免浏览器或容器读取旧缓存。
     * @param {string} url 原始媒体地址
     * @returns {string} 带时间戳的媒体地址
     * @example
     * const src = this.withCacheBust('https://a.com/demo.mp4')
     */
    withCacheBust(url) {
      const normalized = this.normalizeMediaUrl(url);
      if (!normalized)
        return "";
      const t = Date.now();
      return normalized.includes("?") ? normalized + "&t=" + t : normalized + "?t=" + t;
    },
    /**
     * 判断当前运行环境是否为 H5。
     * @returns {boolean} H5 返回 true，其它端返回 false
     * @example
     * if (this.isH5Platform()) { ... }
     */
    isH5Platform() {
      try {
        return typeof window !== "undefined";
      } catch (e) {
        return false;
      }
    },
    /**
     * 判断媒体地址是否为 m3u8 视频。
     * @param {string} src 媒体地址
     * @returns {boolean} 是否为 m3u8 视频
     * @example
     * const isHls = this.isM3u8Video(url)
     */
    isM3u8Video(src) {
      const s = this.normalizeMediaUrl(src).toLowerCase();
      return /\.m3u8(\?.*)?$/.test(s);
    },
    /**
     * 判断媒体地址是否为可直接原生播放的 mp4 视频。
     * @param {string} src 媒体地址
     * @returns {boolean} 是否为 mp4 视频
     * @example
     * const isMp4 = this.isMp4Video(url)
     */
    isMp4Video(src) {
      const s = this.normalizeMediaUrl(src).toLowerCase();
      return /\.mp4(\?.*)?$/.test(s);
    },
    isVideo(src) {
      const s = this.normalizeMediaUrl(src).toLowerCase();
      if (!s)
        return false;
      return /\.(mp4|m3u8)(\?.*)?$/.test(s);
    },
    /**
     * 判断当前端是否可以直接播放该视频。
     * - H5 端支持 mp4 与 m3u8。
     * - 非 H5 端仅直接播放 mp4，m3u8 交由降级提示处理。
     * @param {string} src 媒体地址
     * @returns {boolean} 当前端是否可直接播放
     * @example
     * if (this.isPlayableVideo(url)) { ... }
     */
    isPlayableVideo(src) {
      if (!this.isVideo(src))
        return false;
      if (this.isH5Platform())
        return true;
      return this.isMp4Video(src);
    },
    /**
     * 获取 H5 端视频节点使用的渲染地址。
     * @param {string} src 媒体地址
     * @param {number} index 当前轮播项索引
     * @returns {string} 可用于 video 标签的 src
     * @example
     * const renderSrc = this.getH5VideoRenderSrc(url, 0)
     */
    getH5VideoRenderSrc(src, index) {
      const normalized = this.normalizeMediaUrl(src);
      if (!this.isVideo(normalized))
        return "";
      if (this.isM3u8Video(normalized))
        return "";
      return normalized;
    },
    /**
     * 获取非 H5 端视频节点使用的渲染地址。
     * @param {string} src 媒体地址
     * @returns {string} 可用于 video 标签的 src
     * @example
     * const renderSrc = this.getMpVideoRenderSrc(url)
     */
    getMpVideoRenderSrc(src) {
      const normalized = this.normalizeMediaUrl(src);
      if (!this.isMp4Video(normalized))
        return "";
      return normalized;
    },
    /**
     * 处理当前端无法直接播放的视频格式提示。
     * @param {string} src 媒体地址
     * @returns {void}
     * @example
     * this.handleUnsupportedVideo(url)
     */
    handleUnsupportedVideo(src) {
      const tip = this.isM3u8Video(src) ? "当前端暂不支持 m3u8 直播流播放，请优先使用 MP4 视频" : "当前视频格式暂不支持播放";
      common_vendor.index.showToast({ title: tip, icon: "none" });
    },
    onSwiperChange(e) {
      try {
        const idx = e && e.detail && typeof e.detail.current === "number" ? e.detail.current : 0;
        this.current = idx;
        const src = (this.images || [])[idx];
        if (this.isPlayableVideo(src)) {
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
        this.specs = (children || []).map((it) => {
          const pid = String(it.product_id || "").trim();
          const detailPackageFee = this.packageFeeByProductId[pid] || null;
          const detailPackageCapacity = Number((detailPackageFee == null ? void 0 : detailPackageFee.max_capacity) || 0) || 0;
          const detailPackagePrice = Number((detailPackageFee == null ? void 0 : detailPackageFee.price) || 0) || 0;
          const packageCapacity = Number(it.package_capacity || 0) || detailPackageCapacity;
          const packagePrice = Number(it.package_price || 0) || detailPackagePrice;
          return {
            product_id: it.product_id || "",
            name: it.name || "",
            unit: it.unit || "",
            length_unit: it.length_unit || "",
            unit_price: it.unit_price === void 0 || it.unit_price === null || it.unit_price === "" ? 0 : it.unit_price,
            additional_price: it.additional_price === void 0 || it.additional_price === null || it.additional_price === "" ? 0 : it.additional_price,
            discount: it.discount === void 0 || it.discount === null || it.discount === "" ? 1 : it.discount,
            price: it.price === void 0 || it.price === null || it.price === "" ? "-" : it.price,
            original_price: it.original_price === void 0 || it.original_price === null || it.original_price === "" ? 0 : Number(it.original_price) || 0,
            formula: it.formula || "",
            image_url: clean(it.image_url) || "",
            inventory: it.inventory || 0,
            has_length: it.has_length || 0,
            specification: it.specification || "",
            min_length: it.min_length || "",
            min_specification: it.min_specification || "",
            specification_min: it.specification_min || "",
            length_min: it.length_min || "",
            minimum_length: it.minimum_length || "",
            product_type: it.product_type || it.type || "",
            message: it.message || "",
            product_category: it.product_category || "",
            color: it.color || "",
            model: it.model || "",
            color_temperature: it.color_temperature || "",
            package_capacity: packageCapacity,
            package_price: packagePrice,
            package_price_formatted: packagePrice.toFixed(2),
            single_package_fee: packagePrice.toFixed(2),
            has_custom_params: it.has_custom_params || 0,
            custom_param1_name: it.custom_param1_name || "",
            custom_param2_name: it.custom_param2_name || "",
            custom_param1_value: it.custom_param1_value || "",
            custom_param2_value: it.custom_param2_value || ""
          };
        });
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
        if (this.isVideo(item)) {
          if (!this.isPlayableVideo(item))
            this.handleUnsupportedVideo(item);
          return;
        }
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
        this.showLoginModal = true;
        return false;
      } catch (e) {
        return false;
      }
    },
    closeLoginModal() {
      this.showLoginModal = false;
    },
    goLogin() {
      this.showLoginModal = false;
      common_vendor.index.navigateTo({ url: "/pages/login/index" });
    },
    addToCart() {
      var _a;
      if (!this.ensureLoggedIn())
        return;
      const spec = this.selectedSpecIndex >= 0 && this.specs[this.selectedSpecIndex] ? this.specs[this.selectedSpecIndex] : null;
      const pid = spec ? spec.product_id : ((_a = this.product) == null ? void 0 : _a.id) || "";
      const cid = this.selectedCoupon ? this.selectedCoupon.record_id : "";
      api_index.addCartItem({ product_id: pid, quantity: 1, coupon_record_id: cid }).then((res) => {
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
    /**
     * 处理 H5 长度输入框的实时输入，并同步触发上限校验。
     * @param {Object} e 输入事件对象
     * @param {Object} e.detail 输入事件详情
     * @param {string|number} e.detail.value 当前输入值
     * @returns {void}
     * @example
     * onSpecLengthInput({ detail: { value: '3.5' } })
     */
    onSpecLengthInput(e) {
      var _a;
      const value = ((_a = e == null ? void 0 : e.detail) == null ? void 0 : _a.value) ?? this.specLength;
      this.specLength = value;
      this.validateSpecLengthLimit(value);
    },
    /**
     * 将长度限制原始值解析为数值。
     * @param {string|number} value 长度限制原始值
     * @returns {number|null} 解析成功返回数值，失败返回 null
     * @example
     * const n = this.parseLengthLimitValue('3.5m')
     */
    parseLengthLimitValue(value) {
      const s = String(value ?? "").trim();
      if (!s)
        return null;
      const matched = s.match(/\d+(\.\d+)?/g);
      if (!matched || !matched.length)
        return null;
      const n = Number(matched[0]);
      return isNaN(n) ? null : n;
    },
    /**
     * 获取当前规格的长度上下限（兼容后端不同字段命名）。
     * @param {Object|null} spec 当前规格对象
     * @returns {{min:number|null,max:number|null,minText:string,maxText:string}} 规格长度区间
     * @example
     * const limits = this.getSpecLengthLimitRange(this.selectedSpec)
     */
    getSpecLengthLimitRange(spec) {
      const parse = (v) => this.parseLengthLimitValue(v);
      const minRaw = [spec == null ? void 0 : spec.min_length, spec == null ? void 0 : spec.min_specification, spec == null ? void 0 : spec.specification_min, spec == null ? void 0 : spec.length_min, spec == null ? void 0 : spec.minimum_length].find((v) => String(v ?? "").trim() !== "");
      const maxRaw = spec == null ? void 0 : spec.specification;
      const min = parse(minRaw);
      const max = parse(maxRaw);
      return {
        min: typeof min === "number" && !isNaN(min) ? min : null,
        max: typeof max === "number" && !isNaN(max) ? max : null,
        minText: minRaw !== void 0 && minRaw !== null && String(minRaw).trim() !== "" ? String(minRaw) : min === null ? "" : String(min),
        maxText: maxRaw !== void 0 && maxRaw !== null && String(maxRaw).trim() !== "" ? String(maxRaw) : max === null ? "" : String(max)
      };
    },
    /**
     * 校验长度是否在当前规格限制区间内，并维护输入框右上角提示气泡。
     * @param {string|number} rawLength 用户输入的长度原始值
     * @returns {boolean} true 表示合法，false 表示不合法
     * @example
     * const ok = this.validateSpecLengthLimit('5')
     */
    validateSpecLengthLimit(rawLength) {
      const spec = this.selectedSpecIndex >= 0 && this.specs[this.selectedSpecIndex] ? this.specs[this.selectedSpecIndex] : null;
      if (!spec || Number(spec.has_length) !== 1) {
        this.lengthLimitTip = "";
        return true;
      }
      const lengthNum = String(rawLength ?? "").replace(/[^0-9.]/g, "");
      if (!lengthNum) {
        this.lengthLimitTip = "";
        return true;
      }
      const lengthVal = Number(lengthNum);
      if (isNaN(lengthVal)) {
        this.lengthLimitTip = "";
        return true;
      }
      const limits = this.getSpecLengthLimitRange(spec);
      if (limits.min !== null && lengthVal < limits.min) {
        this.lengthLimitTip = "当前长度最短不得少于" + (limits.minText || limits.min);
        return false;
      }
      if (limits.max !== null && lengthVal > limits.max) {
        this.lengthLimitTip = "长度不能超过" + (limits.maxText || limits.max);
        return false;
      }
      this.lengthLimitTip = "";
      return true;
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
      if (!this.validateSpecLengthLimit(lengthNum || this.specLength))
        return;
      const pid = spec ? spec.product_id : ((_a = this.product) == null ? void 0 : _a.id) || "";
      const q = Math.max(1, Number(this.qty || 1));
      const cid = this.selectedCoupon ? this.selectedCoupon.record_id : "";
      api_index.addCartItem({ room_id: this.roomId, product_id: pid, length: lengthNum, quantity: q, color: this.specTemp || "", note: this.h5OrderNote || "", coupon_record_id: cid }).then((res) => {
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
        const cid = this.selectedCoupon ? this.selectedCoupon.record_id : "";
        common_vendor.index.showLoading({ title: "下单中" });
        api_index.createDirectOrder({ product_id: pid, address_id: addrId, note, length: lenMeters, quantity: qty, room_id: roomId, coupon_record_id: cid, token }).then((data) => {
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
      let token = "";
      try {
        const u = common_vendor.index.getStorageSync("user") || null;
        token = u && (u.token || u.data && u.data.token) || "";
      } catch (e) {
      }
      if (!token) {
        this.addresses = [];
        this.selectedAddress = null;
        return;
      }
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
      this.hasUserInteracted = true;
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
          this.hasUserInteracted = true;
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
      const limits = this.getSpecLengthLimitRange(spec);
      if (lengthVal && limits.min !== null && lengthVal < limits.min) {
        common_vendor.index.showToast({ title: "当前长度最短不得少于" + (limits.minText || limits.min), icon: "none" });
        return;
      }
      if (lengthVal && limits.max !== null && lengthVal > limits.max) {
        common_vendor.index.showToast({ title: "长度不能超过" + (limits.maxText || limits.max), icon: "none" });
        return;
      }
      const pid = spec ? spec.product_id : ((_a = this.product) == null ? void 0 : _a.id) || "";
      const mq = Math.max(1, Number(this.mpQty || 1));
      const cid = this.selectedCoupon ? this.selectedCoupon.record_id : "";
      api_index.addCartItem({ room_id: rid, product_id: pid, length: lengthVal, quantity: mq, color: this.mpTemp || "", note: this.mpOrderNote || "", coupon_record_id: cid }).then((res) => {
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
  const _component_LoginPrompt = common_vendor.resolveComponent("LoginPrompt");
  (_component_Skeleton + _component_RoomSelector + _component_OnboardingGuide + _component_LoginPrompt)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.p({
      loading: $data.pageLoading && !$data.product,
      showTitle: true
    }),
    b: $data.pageLoading && !$data.product
  }, $data.pageLoading && !$data.product ? {
    c: common_vendor.f(4, (i, k0, i0) => {
      return {
        a: "chip" + i
      };
    })
  } : {}, {
    d: $data.product
  }, $data.product ? common_vendor.e({
    e: common_vendor.f($options.images, (item, index, i0) => {
      return common_vendor.e({
        a: $options.isPlayableVideo(item)
      }, $options.isPlayableVideo(item) ? {
        b: index === $data.current ? "mp-video" : "mp-video-" + index,
        c: $options.getMpVideoRenderSrc(item),
        d: common_vendor.o((...args) => $options.pauseCarousel && $options.pauseCarousel(...args), index),
        e: common_vendor.o((...args) => $options.onVideoEnded && $options.onVideoEnded(...args), index)
      } : $options.isVideo(item) ? {
        g: $data.product.image || "/static/logo.png",
        h: common_vendor.o(($event) => $options.handleUnsupportedVideo(item), index)
      } : {
        i: $options.normalizeMediaUrl(item),
        j: common_vendor.o(($event) => $options.previewMpImage(item), index)
      }, {
        f: $options.isVideo(item),
        k: index
      });
    }),
    f: $data.current,
    g: common_vendor.o((...args) => $options.onSwiperChange && $options.onSwiperChange(...args)),
    h: common_vendor.t($data.product.title),
    i: common_vendor.t($data.isFavorite ? "★" : "☆"),
    j: $data.isFavorite ? 1 : "",
    k: common_vendor.o((...args) => $options.favProduct && $options.favProduct(...args)),
    l: common_vendor.t($options.displayTopPriceWithSymbol),
    m: common_vendor.t($data.product.sales),
    n: common_vendor.t($data.product.id || "默认款"),
    o: common_vendor.t($data.product.title),
    p: common_vendor.t($data.product.shipping_origin ? $data.product.shipping_origin.replace(/省|市/g, "") : "—"),
    q: common_vendor.t($data.product.price.toFixed(2)),
    r: common_vendor.f($data.product.details_images, (src, i, i0) => {
      return {
        a: "md" + i,
        b: src,
        c: common_vendor.o(($event) => $options.previewDetailImage(src), "md" + i)
      };
    }),
    s: common_vendor.o((...args) => $options.openSpecSheet && $options.openSpecSheet(...args)),
    t: $data.mpSheet
  }, $data.mpSheet ? {
    v: common_vendor.o((...args) => $options.closeSpecSheet && $options.closeSpecSheet(...args))
  } : {}, {
    w: $data.mpSheet
  }, $data.mpSheet ? common_vendor.e({
    x: $data.selectedAddress
  }, $data.selectedAddress ? {
    y: common_vendor.t($data.selectedAddress.receiver),
    z: common_vendor.t($data.selectedAddress.phone)
  } : {}, {
    A: $data.selectedAddress
  }, $data.selectedAddress ? {
    B: common_vendor.t($data.selectedAddress.province),
    C: common_vendor.t($data.selectedAddress.city),
    D: common_vendor.t($data.selectedAddress.district),
    E: common_vendor.t($data.selectedAddress.detail_address)
  } : {}, {
    F: common_vendor.o((...args) => $options.openMpAddressSheet && $options.openMpAddressSheet(...args)),
    G: $data.specsLoading
  }, $data.specsLoading ? {} : $data.specs && $data.specs.length ? common_vendor.e({
    I: common_vendor.f($data.isSpecsCollapsed ? $data.specs.slice(0, 4) : $data.specs, (it, i, i0) => {
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
        g: common_assets._imports_0$2
      } : {}, {
        h: "mpsp" + i,
        i: $data.selectedSpecIndex === i ? 1 : "",
        j: $options.isSpecDisabled(it) ? 1 : "",
        k: common_vendor.o(($event) => $options.onClickSpec(it, i), "mpsp" + i)
      });
    }),
    J: $data.specs.length > 4
  }, $data.specs.length > 4 ? {
    K: common_vendor.t($data.isSpecsCollapsed ? "展开更多" : "收起"),
    L: common_vendor.t($data.isSpecsCollapsed ? "▼" : "▲"),
    M: common_vendor.o(($event) => $data.isSpecsCollapsed = !$data.isSpecsCollapsed)
  } : {}) : {}, {
    H: $data.specs && $data.specs.length,
    N: common_vendor.t($data.selectedCoupon ? $data.selectedCoupon.name : "不使用优惠券"),
    O: $data.selectedCoupon ? 1 : "",
    P: common_vendor.o((...args) => $options.openCouponSheet && $options.openCouponSheet(...args)),
    Q: common_vendor.t($data.mpRoom || "请选择房间"),
    R: common_vendor.o((...args) => $options.openMpRoomSheet && $options.openMpRoomSheet(...args)),
    S: $options.selectedSpec && $options.selectedSpec.has_length === 1
  }, $options.selectedSpec && $options.selectedSpec.has_length === 1 ? common_vendor.e({
    T: $data.mpLength,
    U: common_vendor.o(($event) => $data.mpLength = $event.detail.value),
    V: $options.selectedSpec.length_unit
  }, $options.selectedSpec.length_unit ? {
    W: common_vendor.t($options.selectedSpec.length_unit)
  } : {}) : {}, {
    X: $data.mpOrderNote,
    Y: common_vendor.o(($event) => $data.mpOrderNote = $event.detail.value),
    Z: common_vendor.o(($event) => $data.mpQty = Math.max(1, Number($data.mpQty) - 1)),
    aa: common_vendor.o((...args) => $options.normalizeMpQty && $options.normalizeMpQty(...args)),
    ab: $data.mpQty,
    ac: common_vendor.o(($event) => $data.mpQty = $event.detail.value),
    ad: common_vendor.o(($event) => $data.mpQty = Math.max(1, Number($data.mpQty) + 1)),
    ae: common_vendor.o((...args) => $options.closeSpecSheet && $options.closeSpecSheet(...args)),
    af: common_vendor.o((...args) => $options.confirmSpecToCart && $options.confirmSpecToCart(...args))
  }) : {}) : {}, {
    ag: common_vendor.o($options.closeRoomSheet),
    ah: common_vendor.o($options.onRoomSelect),
    ai: common_vendor.o($options.onRoomCreate),
    aj: common_vendor.o($options.onCreateAddress),
    ak: common_vendor.p({
      visible: $data.roomSelectorVisible,
      rooms: $options.selectorRooms,
      type: $options.selectorType,
      selectedName: $options.selectorSelectedName
    }),
    al: $data.mpSheet || $data.roomSelectorVisible ? 1 : "",
    am: $data.showOnboarding
  }, $data.showOnboarding ? {
    an: common_vendor.o($options.handleOnboardingNext),
    ao: common_vendor.o($options.handleOnboardingPrev),
    ap: common_vendor.o($options.closeOnboarding),
    aq: common_vendor.p({
      steps: $data.onboardingSteps,
      targets: $data.onboardingRects,
      initialIndex: $data.onboardingIndex
    })
  } : {}, {
    ar: common_vendor.o($options.closeLoginModal),
    as: common_vendor.o($options.goLogin),
    at: common_vendor.p({
      visible: $data.showLoginModal
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-a911e391"]]);
_sfc_main.__runtimeHooks = 6;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/product/index.js.map
