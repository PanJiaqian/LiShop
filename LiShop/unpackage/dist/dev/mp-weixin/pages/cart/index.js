"use strict";
const common_vendor = require("../../common/vendor.js");
const api_index = require("../../api/index.js");
const common_assets = require("../../common/assets.js");
const FloatingNav = () => "../../components/FloatingNav.js";
const RoomSelector = () => "../../components/RoomSelector.js";
const Skeleton = () => "../../components/Skeleton.js";
const LoginPrompt = () => "../../components/LoginPrompt.js";
const _sfc_main = {
  components: { FloatingNav, RoomSelector, Skeleton, LoginPrompt },
  data() {
    return {
      loading: true,
      cart: [],
      showSpecModal: false,
      editingItem: {},
      addresses: [],
      selectedAddress: null,
      showAddressSelector: false,
      orderNote: "",
      mpOrderNote: "",
      showLoginModal: false,
      _noteLimitMax: 250,
      customToastVisible: false,
      customToastMessage: "",
      _customToastTimer: null,
      _summaryRequestSeq: 0,
      summaryData: {
        total_price: 0,
        total_original: 0,
        total_package_fee: 0,
        total_coupon_discount_amount: 0,
        is_free_shipping: 0,
        items: [],
        package_fee_groups: []
      }
    };
  },
  computed: {
    total() {
      return this.cart.reduce((s, it) => s + it.price * (it.quantity || 1), 0);
    },
    // selectedTotal() { return this.cart.reduce((s, it) => s + (it.selected ? it.price * (it.quantity || 1) : 0), 0) },
    selectedTotal() {
      return this.summaryData.total_original || 0;
    },
    // 使用API返回的总价
    selectedCount() {
      return this.cart.filter((it) => it.selected).length;
    },
    isAllSelected() {
      const validItems = this.cart.filter((it) => !it.isBlocked);
      return validItems.length > 0 && validItems.every((it) => it.selected);
    },
    orderNoteCount() {
      return Array.from(this.orderNote || "").length;
    },
    mpOrderNoteCount() {
      return Array.from(this.mpOrderNote || "").length;
    },
    selectedThumbs() {
      return this.cart.filter((it) => it.selected).slice(0, 4).map((it) => it.image || "/static/logo.png");
    },
    // officialReduce() { return this.cart.reduce((s, it) => s + (it.selected ? (it.officialReduce || 0) : 0), 0) },
    // redReduce() { return this.cart.reduce((s, it) => s + (it.selected ? (it.redReduce || 0) : 0), 0) },
    // extraReduce() { return this.cart.reduce((s, it) => s + (it.selected ? (it.reduce || 0) : 0), 0) },
    // totalReduce() { return this.officialReduce + this.redReduce + this.extraReduce },
    totalReduce() {
      const apiDiscount = Number(this.summaryData.total_coupon_discount_amount || 0);
      if (apiDiscount > 0)
        return apiDiscount;
      return Math.max(0, Number(this.summaryData.total_original || 0) - Number(this.summaryData.total_price || 0));
    },
    payable() {
      return Math.max(0, Number(this.summaryData.total_price || 0));
    },
    needForCoupon() {
      const need = Math.max(0, 800 - this.payable);
      return need.toFixed(2);
    },
    addressRooms() {
      return this.addresses.map((a) => ({
        name: `${a.receiver} ${a.phone} ${a.full}`.trim(),
        raw: a
      }));
    },
    groups: function() {
      try {
        const map = {};
        (this.cart || []).forEach((it) => {
          const key = it.roomName || "默认房间";
          if (!map[key])
            map[key] = [];
          map[key].push(it);
        });
        return Object.keys(map).map((name) => ({ name, items: map[name] }));
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/cart/index.vue:366", "groups computed error", e);
        return [];
      }
    },
    summaryItemMap() {
      const map = {};
      (this.summaryData && this.summaryData.items || []).forEach((item) => {
        if (item && item.cart_item_id) {
          map[item.cart_item_id] = item;
        }
      });
      return map;
    }
  },
  watch: {
    mpOrderNote(val) {
      this._applyNoteLimit("mpOrderNote", val);
    },
    orderNote(val) {
      this._applyNoteLimit("orderNote", val);
    }
  },
  onShow() {
    try {
      const u = common_vendor.index.getStorageSync("user") || null;
      const exp = common_vendor.index.getStorageSync("token_expiration") || 0;
      const ok = !!u && (!exp || Date.now() < exp);
      if (!ok) {
        this.showLoginModal = true;
        return;
      }
    } catch (e) {
    }
    this.load();
    this.loadAddresses();
  },
  onLoad() {
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
  methods: {
    onOrderNoteInput(e) {
      const val = e.detail.value || e.target.value || "";
      if (Array.from(val).length >= this._noteLimitMax) {
        this.showCustomToast(`最多输入${this._noteLimitMax}个字哦`);
      }
    },
    onMpOrderNoteInput(e) {
      const val = e.detail.value || e.target.value || "";
      if (Array.from(val).length >= this._noteLimitMax) {
        this.showCustomToast(`最多输入${this._noteLimitMax}个字哦`);
      }
    },
    showCustomToast(msg) {
      this.customToastMessage = msg;
      this.customToastVisible = true;
      if (this._customToastTimer)
        clearTimeout(this._customToastTimer);
      this._customToastTimer = setTimeout(() => {
        this.customToastVisible = false;
      }, 2e3);
    },
    closeLoginModal() {
      this.showLoginModal = false;
      try {
        let isH5 = false;
        try {
          isH5 = typeof window !== "undefined";
        } catch (e) {
          isH5 = false;
        }
        if (!isH5) {
          if (common_vendor.index && common_vendor.index.switchTab) {
            common_vendor.index.switchTab({ url: "/pages/home/index" });
            return;
          }
          if (common_vendor.index && common_vendor.index.navigateTo) {
            common_vendor.index.navigateTo({ url: "/pages/home/index" });
            return;
          }
        }
      } catch (e) {
      }
    },
    goLogin() {
      this.showLoginModal = false;
      common_vendor.index.navigateTo({ url: "/pages/login/index" });
    },
    goHome() {
      if (common_vendor.index && common_vendor.index.switchTab) {
        common_vendor.index.switchTab({ url: "/pages/home/index" });
        return;
      }
      if (common_vendor.index && common_vendor.index.navigateTo) {
        common_vendor.index.navigateTo({ url: "/pages/home/index" });
        return;
      }
    },
    goBack() {
      this.goHome();
    },
    openDetail(item) {
      try {
        if (item.isNoPermission) {
          common_vendor.index.showToast({ title: "该商品暂无货", icon: "none" });
          return;
        }
        const id = item && (item.availableProductId || item.available_product_id || item.productId || item.id) || "";
        if (!id) {
          common_vendor.index.showToast({ title: "商品ID缺失", icon: "none" });
          return;
        }
        common_vendor.index.navigateTo({ url: "/pages/product/index?id=" + encodeURIComponent(id) });
      } catch (e) {
      }
    },
    loadAddresses() {
      api_index.getAddresses().then((res) => {
        var _a;
        const raw = Array.isArray((_a = res == null ? void 0 : res.data) == null ? void 0 : _a.items) ? res.data.items : Array.isArray(res == null ? void 0 : res.items) ? res.items : [];
        this.addresses = raw.map((a) => ({
          id: a.addresses_id || a.id || "",
          receiver: a.receiver || "",
          phone: a.phone || "",
          full: [a.province, a.city, a.district, a.detail_address].filter(Boolean).join(" "),
          is_default: a.is_default === 1
        }));
        const cached = common_vendor.index.getStorageSync("selected_address_id") || "";
        let pick = this.addresses.find((x) => x.id === cached) || this.addresses.find((x) => x.is_default) || this.addresses[0];
        this.selectedAddress = pick || null;
        if (this.showAddressSelector && this.addresses.length === 0) {
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
    openAddressPicker() {
      this.showAddressSelector = true;
      this.loadAddresses();
    },
    onAddressSelect(room) {
      if (room && room.raw) {
        this.selectedAddress = room.raw;
        common_vendor.index.setStorageSync("selected_address_id", room.raw.id);
        this.showAddressSelector = false;
      }
    },
    onCreateAddress(payload) {
      const u = common_vendor.index.getStorageSync("user");
      const token = u && (u.token || u.data && u.data.token) || "";
      const data = { receiver: payload.receiver, phone: payload.phone, province: payload.province, city: payload.city, district: payload.district, detail_address: payload.detail_address, is_default: payload.is_default };
      api_index.addAddress({ ...data, token }).then((res) => {
        if (res && res.success) {
          const id = res && res.data && (res.data.addresses_id || res.data.id) || "";
          const item = { id, receiver: data.receiver, phone: data.phone, full: [data.province, data.city, data.district, data.detail_address].filter(Boolean).join(" "), is_default: data.is_default === 1 };
          this.addresses = [item, ...this.addresses];
          this.selectedAddress = item;
          try {
            common_vendor.index.setStorageSync("selected_address_id", id);
          } catch (e) {
          }
          common_vendor.index.showToast({ title: "已保存", icon: "success" });
          this.showAddressSelector = false;
        } else {
          common_vendor.index.showToast({ title: res && res.message ? res.message : "保存失败", icon: "none" });
        }
      }).catch(() => {
        common_vendor.index.showToast({ title: "保存失败", icon: "none" });
      });
    },
    /**
     * 重置购物车条目的聚合包装费回填状态。
     * @returns {void}
     * @example
     * this.resetCartAggregationState()
     */
    resetCartAggregationState() {
      this.cart = (this.cart || []).map((it) => ({
        ...it,
        package_fee: 0,
        package_fee_group_key: "",
        package_fee_selected_package_id: "",
        package_fee_is_group_owner: 0,
        item_amount: null,
        item_original: null,
        item_coupon_discount: 0
      }));
    },
    /**
     * 将结算接口返回的聚合明细回填到购物车列表。
     * @param {Array<Object>} items 结算接口返回的明细列表
     * @returns {void}
     * @example
     * this.applySummaryItems(res.data.items)
     */
    applySummaryItems(items) {
      this.resetCartAggregationState();
      (Array.isArray(items) ? items : []).forEach((detail) => {
        const idx = this.cart.findIndex((it) => it.id === detail.cart_item_id);
        if (idx >= 0) {
          const current = this.cart[idx];
          this.cart.splice(idx, 1, {
            ...current,
            package_fee: Number(detail.package_fee) || 0,
            package_fee_group_key: detail.package_fee_group_key || "",
            package_fee_selected_package_id: detail.package_fee_selected_package_id || "",
            package_fee_is_group_owner: Number(detail.package_fee_is_group_owner) || 0,
            item_amount: Number(detail.item_amount) || 0,
            item_original: Number(detail.item_original) || 0,
            item_coupon_discount: Number(detail.coupon_discount_amount) || 0,
            has_used_coupon: (Number(detail.coupon_discount_amount) || 0) > 0 || !!current.has_used_coupon
          });
        }
      });
    },
    /**
     * 获取购物车行展示价格。
     * @param {Object} item 购物车条目
     * @returns {number} 当前条目应展示的金额
     * @example
     * const price = this.getItemDisplayPrice(row)
     */
    getItemDisplayPrice(item) {
      const detail = this.summaryItemMap[item == null ? void 0 : item.id] || null;
      if ((item == null ? void 0 : item.selected) && detail && detail.item_amount !== void 0 && detail.item_amount !== null) {
        return Number(detail.item_amount) || 0;
      }
      return Number(item == null ? void 0 : item.price) || 0;
    },
    /**
     * 获取购物车条目的原价展示金额。
     * @param {Object} item 购物车条目
     * @returns {number} 当前条目原价金额
     * @example
     * const original = this.getItemOriginalPrice(row)
     */
    getItemOriginalPrice(item) {
      const detail = this.summaryItemMap[item == null ? void 0 : item.id] || null;
      if ((item == null ? void 0 : item.selected) && detail && detail.item_original !== void 0 && detail.item_original !== null) {
        return Number(detail.item_original) || 0;
      }
      if ((item == null ? void 0 : item.item_original) !== void 0 && (item == null ? void 0 : item.item_original) !== null) {
        return Number(item.item_original) || 0;
      }
      return Number(item == null ? void 0 : item.original_price) || 0;
    },
    /**
     * 获取购物车条目的优惠金额。
     * @param {Object} item 购物车条目
     * @returns {number} 当前条目优惠金额
     * @example
     * const discount = this.getItemCouponDiscount(row)
     */
    getItemCouponDiscount(item) {
      const detail = this.summaryItemMap[item == null ? void 0 : item.id] || null;
      if ((item == null ? void 0 : item.selected) && detail && detail.coupon_discount_amount !== void 0 && detail.coupon_discount_amount !== null) {
        return Number(detail.coupon_discount_amount) || 0;
      }
      if ((item == null ? void 0 : item.item_coupon_discount) !== void 0 && (item == null ? void 0 : item.item_coupon_discount) !== null) {
        return Number(item.item_coupon_discount) || 0;
      }
      return Number(item == null ? void 0 : item.coupon_discount_amount) || 0;
    },
    /**
     * 判断购物车条目是否需要展示原价划线价。
     * @param {Object} item 购物车条目
     * @returns {boolean} 是否展示原价
     * @example
     * const visible = this.shouldShowOriginalPrice(row)
     */
    shouldShowOriginalPrice(item) {
      return this.getItemOriginalPrice(item) > this.getItemDisplayPrice(item);
    },
    /**
     * 获取购物车条目的包装费标签文案。
     * @param {Object} item 购物车条目
     * @returns {string} 展示文案；不展示时返回空字符串
     * @example
     * const label = this.getItemPackageFeeLabel(row)
     */
    getItemPackageFeeLabel(item) {
      if (!item || !item.selected)
        return "";
      if (Number(item.package_fee_is_group_owner || 0) !== 1)
        return "";
      const fee = Number(item.package_fee || 0);
      if (fee <= 0)
        return "";
      return `本组包装费 ¥${fee.toFixed(2)}`;
    },
    toAddressPage() {
      common_vendor.index.navigateTo({ url: "/pages/address/index" });
    },
    load() {
      api_index.getCartItems().then((res) => {
        const isEmpty = typeof res === "string" && (res.includes("空") || res === "当前购物车为空");
        if (isEmpty) {
          this.cart = [];
          return;
        }
        const payload = res && res.data && typeof res.data === "object" ? res.data : res;
        const groups = Array.isArray(payload == null ? void 0 : payload.groups) ? payload.groups : [];
        const list = [];
        for (const g of groups) {
          const roomName = g && g.room_name ? g.room_name : "";
          const items = Array.isArray(g && g.items) ? g.items : [];
          for (const x of items) {
            const typeRaw = x && (x.product_type || x.available_product_type || x.type || x.comment) || "";
            const typeLower = String(typeRaw || "").toLowerCase();
            const isStagnant = typeLower.includes("stagnant") || typeLower.includes("呆滞");
            const isOutOfStock = x.available_product_status === 0 || x.inventory === 0 && isStagnant;
            const cartItemStatus = Number(x.cart_item_status) || 1;
            const isNoPermission = cartItemStatus === 2;
            list.push({
              id: x && x.id ? x.id : "",
              title: x && x.available_product_name && x.product_name ? x.available_product_name === x.product_name ? x.product_name : `${x.available_product_name} | ${x.product_name}` : x ? x.available_product_name || x.product_name || "" : "",
              productId: x && x.product_id ? x.product_id : "",
              availableProductId: x && x.available_product_id ? x.available_product_id : x && x.product_id ? x.product_id : "",
              price: Number((x && x.price) !== void 0 ? x.price : 0) || 0,
              final_price: Number((x && x.final_price) !== void 0 ? x.final_price : (x && x.price) !== void 0 ? x.price : 0) || 0,
              original_price: Number((x && x.original_price) !== void 0 ? x.original_price : 0) || 0,
              coupon_discount_amount: Number((x && x.coupon_discount_amount) !== void 0 ? x.coupon_discount_amount : 0) || 0,
              coupon_valid: Number((x && x.coupon_valid) !== void 0 ? x.coupon_valid : 1) || 0,
              coupon_message: x && x.coupon_message ? x.coupon_message : "",
              quantity: Number((x && x.quantity) !== void 0 ? x.quantity : 1) || 1,
              image: "/static/logo.png",
              roomName: roomName || "默认房间",
              roomId: g.room_id || "",
              length: Number(x.length) > 0 ? x.length : 0,
              color: x.color || "暖白",
              note: x.note || "",
              attr: (x && x.length ? "长度 " + x.length : "") + (x && x.note ? " ｜ " + x.note : ""),
              selected: false,
              inventory: x.inventory,
              status: x.status,
              available: x.available_product_status,
              stockMessage: x.message || (isNoPermission ? "该商品当前暂无货" : isOutOfStock ? "该商品已无库存" : ""),
              isOutOfStock,
              isNoPermission,
              isBlocked: isOutOfStock || isNoPermission,
              cart_item_status: cartItemStatus,
              category_id: x.category_id || "",
              has_used_coupon: Number((x && x.has_used_coupon) !== void 0 ? x.has_used_coupon : 0) === 1 || (Number((x && x.coupon_discount_amount) !== void 0 ? x.coupon_discount_amount : 0) || 0) > 0,
              package_fee: Number(x.package_fee) || 0,
              package_fee_group_key: x.package_fee_group_key || "",
              package_fee_selected_package_id: x.package_fee_selected_package_id || "",
              package_fee_is_group_owner: Number(x.package_fee_is_group_owner) || 0,
              item_amount: null,
              item_original: null,
              item_coupon_discount: Number((x && x.coupon_discount_amount) !== void 0 ? x.coupon_discount_amount : 0) || 0
            });
          }
        }
        this.cart = list;
        this.fetchSummary();
        this.loading = false;
      }).catch((err) => {
        common_vendor.index.__f__("error", "at pages/cart/index.vue:703", "Get cart failed", err);
        try {
          this.cart = common_vendor.index.getStorageSync("cart") || [];
        } catch (e) {
          this.cart = [];
        }
        this.cart = (this.cart || []).map((it) => ({
          ...it,
          quantity: it.quantity || 1,
          selected: !!it.selected
        }));
        this.loading = false;
      });
    },
    fetchSummary() {
      const requestSeq = ++this._summaryRequestSeq;
      const selectedItems = this.cart.filter((it) => it.selected);
      const selectedIds = selectedItems.map((it) => it.id);
      this.resetCartAggregationState();
      if (selectedIds.length === 0) {
        this.summaryData = { total_price: 0, total_original: 0, total_package_fee: 0, total_coupon_discount_amount: 0, is_free_shipping: 0, items: [], package_fee_groups: [] };
        return;
      }
      let token = "";
      try {
        const u = common_vendor.index.getStorageSync("user") || null;
        token = u && (u.token || u.data && u.data.token) || "";
      } catch (e) {
      }
      api_index.calculateCartPrice({ cart_item_ids: selectedIds, token }).then((res) => {
        if (requestSeq !== this._summaryRequestSeq) {
          return;
        }
        if (res && res.success && res.data) {
          this.summaryData = {
            total_price: res.data.total_amount || 0,
            total_original: res.data.total_original || 0,
            total_package_fee: res.data.total_package_fee || 0,
            total_coupon_discount_amount: res.data.total_coupon_discount_amount || 0,
            is_free_shipping: 0,
            items: Array.isArray(res.data.items) ? res.data.items : [],
            package_fee_groups: Array.isArray(res.data.package_fee_groups) ? res.data.package_fee_groups : []
          };
          this.applySummaryItems(res.data.items);
        }
      }).catch((e) => {
        if (requestSeq !== this._summaryRequestSeq) {
          return;
        }
        common_vendor.index.__f__("error", "at pages/cart/index.vue:748", e);
      });
    },
    sync() {
      common_vendor.index.setStorageSync("cart", this.cart);
    },
    findIndexById(id) {
      return this.cart.findIndex((it) => it.id === id);
    },
    incById(id) {
      const i = this.findIndexById(id);
      if (i >= 0) {
        const item = this.cart[i];
        if (item.isBlocked)
          return;
        this.updateItemQuantity(item, item.quantity + 1);
      }
    },
    decById(id) {
      const i = this.findIndexById(id);
      if (i >= 0) {
        const item = this.cart[i];
        if (item.isBlocked)
          return;
        if (item.quantity > 1) {
          this.updateItemQuantity(item, item.quantity - 1);
        }
      }
    },
    updateItemQuantity(item, quantity) {
      api_index.updateCartItem({
        id: item.id,
        room_id: item.roomId,
        product_id: item.productId,
        length: Number(item.length) > 0 ? item.length : 0,
        quantity,
        color: item.color,
        note: item.note
      }).then((res) => {
        if (res && res.success) {
          item.quantity = quantity;
          this.sync();
          this.refreshItemPrice(item.id);
        } else {
          common_vendor.index.showToast({ title: "更新失败", icon: "none" });
        }
      }).catch((err) => {
        common_vendor.index.__f__("error", "at pages/cart/index.vue:789", err);
        common_vendor.index.showToast({ title: "更新出错", icon: "none" });
      });
    },
    refreshItemPrice(id) {
      api_index.getCartItems().then((res) => {
        const payload = res && res.data && typeof res.data === "object" ? res.data : res;
        const groups = Array.isArray(payload == null ? void 0 : payload.groups) ? payload.groups : [];
        let found = null;
        for (const g of groups) {
          const items = Array.isArray(g && g.items) ? g.items : [];
          const x = items.find((xx) => xx && xx.id === id);
          if (x) {
            found = x;
            break;
          }
        }
        if (found) {
          const i = this.findIndexById(id);
          if (i >= 0) {
            const it = this.cart[i];
            it.price = Number(found.price !== void 0 ? found.price : it.price) || it.price;
            it.final_price = Number(found.final_price !== void 0 ? found.final_price : it.final_price) || it.final_price;
            it.original_price = Number(found.original_price !== void 0 ? found.original_price : it.original_price) || 0;
            it.coupon_discount_amount = Number(found.coupon_discount_amount !== void 0 ? found.coupon_discount_amount : it.coupon_discount_amount) || 0;
            it.coupon_valid = Number(found.coupon_valid !== void 0 ? found.coupon_valid : it.coupon_valid) || 0;
            it.coupon_message = found.coupon_message !== void 0 ? found.coupon_message : it.coupon_message;
            it.has_used_coupon = Number(found.has_used_coupon !== void 0 ? found.has_used_coupon : it.has_used_coupon) === 1 || (Number(found.coupon_discount_amount !== void 0 ? found.coupon_discount_amount : it.coupon_discount_amount) || 0) > 0;
            it.quantity = Number(found.quantity !== void 0 ? found.quantity : it.quantity) || it.quantity;
            it.inventory = found.inventory;
            it.available = found.available_product_status;
            const typeRaw = found && (found.product_type || found.available_product_type || found.type || found.comment) || "";
            const typeLower = String(typeRaw || "").toLowerCase();
            const isStagnant = typeLower.includes("stagnant") || typeLower.includes("呆滞");
            const isOutOfStock = found.available_product_status === 0 || found.inventory === 0 && isStagnant;
            const cartItemStatus = Number(found.cart_item_status) || it.cart_item_status || 1;
            const isNoPermission = cartItemStatus === 2;
            it.isOutOfStock = isOutOfStock;
            it.isNoPermission = isNoPermission;
            it.isBlocked = isOutOfStock || isNoPermission;
            it.cart_item_status = cartItemStatus;
            it.price = Number(found.price !== void 0 ? found.price : it.price) || it.price;
            it.package_fee = Number(found.package_fee) || 0;
            it.package_fee_group_key = found.package_fee_group_key || "";
            it.package_fee_selected_package_id = found.package_fee_selected_package_id || "";
            it.package_fee_is_group_owner = Number(found.package_fee_is_group_owner) || 0;
            it.item_amount = null;
            it.item_original = null;
            it.item_coupon_discount = Number(found.coupon_discount_amount !== void 0 ? found.coupon_discount_amount : 0) || 0;
          }
        }
      }).finally(() => {
        this.fetchSummary();
      });
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
    removeById(id) {
      api_index.deleteCartItem({ id }).then(() => {
        const i = this.findIndexById(id);
        if (i >= 0) {
          this.cart.splice(i, 1);
          this.sync();
          this.fetchSummary();
        }
        common_vendor.index.showToast({ title: "已删除", icon: "success" });
      }).catch(() => {
        const i = this.findIndexById(id);
        if (i >= 0) {
          this.cart.splice(i, 1);
          this.sync();
          this.fetchSummary();
        }
        common_vendor.index.showToast({ title: "本地删除", icon: "none" });
      });
    },
    removeSelected() {
      const ids = this.cart.filter((it) => it.selected).map((it) => it.id);
      if (ids.length === 0) {
        return;
      }
      const tasks = ids.map((id) => api_index.deleteCartItem({ id }));
      Promise.allSettled(tasks).then(() => {
        this.cart = this.cart.filter((it) => !ids.includes(it.id));
        this.sync();
        this.fetchSummary();
        common_vendor.index.showToast({ title: "已删除", icon: "success" });
      }).catch(() => {
        this.cart = this.cart.filter((it) => !ids.includes(it.id));
        this.sync();
        this.fetchSummary();
        common_vendor.index.showToast({ title: "本地删除", icon: "none" });
      });
    },
    toggleById(id) {
      const i = this.findIndexById(id);
      if (i >= 0) {
        if (this.cart[i].isBlocked)
          return;
        this.cart[i].selected = !this.cart[i].selected;
        this.sync();
        this.fetchSummary();
      }
    },
    toggleAll() {
      const validItems = this.cart.filter((it) => !it.isBlocked);
      if (validItems.length === 0)
        return;
      const makeSelected = !this.isAllSelected;
      this.cart.forEach((it) => {
        if (!it.isBlocked)
          it.selected = makeSelected;
        else
          it.selected = false;
      });
      this.sync();
      this.fetchSummary();
    },
    clear() {
      this.cart = [];
      this.sync();
      this.fetchSummary();
    },
    checkout() {
      var _a;
      if (!this.ensureLoggedIn())
        return;
      if (this.selectedCount === 0) {
        common_vendor.index.showToast({ title: "请选择商品", icon: "none" });
        return;
      }
      const hasNoPermission = this.cart.filter((it) => it.selected).some((it) => it.isNoPermission);
      if (hasNoPermission) {
        common_vendor.index.showToast({ title: "选中商品中包含无货商品，请删除或取消勾选后再结算", icon: "none" });
        return;
      }
      const selectedItems = this.cart.filter((it) => it.selected);
      const selectedIds = selectedItems.map((it) => it.id);
      const addressId = ((_a = this.selectedAddress) == null ? void 0 : _a.id) || "";
      if (!addressId) {
        common_vendor.index.showToast({ title: "请先选择收货地址", icon: "none" });
        return;
      }
      let token = "";
      try {
        const u = common_vendor.index.getStorageSync("user") || null;
        token = u && (u.token || u.data && u.data.token) || "";
      } catch (e) {
      }
      api_index.createOrderByIds({ ids: selectedIds, address_id: addressId, note: this.orderNote || this.mpOrderNote || "", token }).then((res) => {
        var _a2, _b;
        if (res && res.success) {
          common_vendor.index.showToast({ title: "下单成功", icon: "success" });
          this.cart = this.cart.filter((it) => !it.selected);
          this.sync();
          this.fetchSummary();
          const orderId = ((_a2 = res.data) == null ? void 0 : _a2.order_id) || ((_b = res.data) == null ? void 0 : _b.id);
          if (orderId) {
            setTimeout(() => {
              common_vendor.index.navigateTo({ url: "/pages/order/index?id=" + orderId });
            }, 1e3);
          } else {
            setTimeout(() => {
              common_vendor.index.navigateTo({ url: "/pages/order/index" });
            }, 1e3);
          }
        } else {
          common_vendor.index.showToast({ title: res.message || "下单失败", icon: "none" });
        }
      }).catch((err) => {
        common_vendor.index.showToast({ title: "下单出错", icon: "none" });
        common_vendor.index.__f__("error", "at pages/cart/index.vue:938", err);
      });
    },
    handleExportExcel() {
      if (this.selectedCount === 0) {
        common_vendor.index.showToast({ title: "请选择商品", icon: "none" });
        return;
      }
      this.cart.filter((it) => it.selected).map((it) => it.id);
      common_vendor.index.showModal({
        title: "导出提示",
        content: "导出Excel将为您自动生成订单，确认继续？",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.showModal({ title: "提示", content: "小程序暂不支持导出", showCancel: false });
            return;
          }
        }
      });
    },
    openSpecPopup(item) {
      this.editingItem = item;
      this.showSpecModal = true;
    },
    closeSpecPopup() {
      this.showSpecModal = false;
      this.editingItem = {};
    }
  }
};
if (!Array) {
  const _component_Skeleton = common_vendor.resolveComponent("Skeleton");
  const _component_RoomSelector = common_vendor.resolveComponent("RoomSelector");
  const _component_LoginPrompt = common_vendor.resolveComponent("LoginPrompt");
  (_component_Skeleton + _component_RoomSelector + _component_LoginPrompt)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.p({
      loading: $data.loading,
      showTitle: true
    }),
    b: common_assets._imports_0,
    c: $data.selectedAddress
  }, $data.selectedAddress ? {
    d: common_vendor.t($data.selectedAddress.receiver),
    e: common_vendor.t($data.selectedAddress.phone)
  } : {}, {
    f: $data.selectedAddress
  }, $data.selectedAddress ? {
    g: common_vendor.t($data.selectedAddress.full)
  } : {}, {
    h: common_vendor.o((...args) => $options.openAddressPicker && $options.openAddressPicker(...args)),
    i: common_vendor.t($options.mpOrderNoteCount),
    j: common_vendor.o([($event) => $data.mpOrderNote = $event.detail.value, (...args) => $options.onMpOrderNoteInput && $options.onMpOrderNoteInput(...args)]),
    k: $data.mpOrderNote,
    l: $data.cart.length
  }, $data.cart.length ? {
    m: common_vendor.f($options.groups, (grp, gi, i0) => {
      return {
        a: common_vendor.t(grp.name),
        b: common_vendor.f(grp.items, (it, k1, i1) => {
          return common_vendor.e({
            a: it.isBlocked
          }, it.isBlocked ? {} : {}, {
            b: it.selected ? 1 : "",
            c: it.isBlocked ? 1 : "",
            d: common_vendor.o(($event) => $options.toggleById(it.id), it.id),
            e: it.image || "/static/logo.png",
            f: common_vendor.o(($event) => $options.openDetail(it), it.id),
            g: it.has_used_coupon
          }, it.has_used_coupon ? {} : {}, {
            h: common_vendor.t(it.title),
            i: common_vendor.o(($event) => $options.openDetail(it), it.id),
            j: common_vendor.t(it.attr),
            k: $options.getItemPackageFeeLabel(it)
          }, $options.getItemPackageFeeLabel(it) ? {
            l: common_vendor.t($options.getItemPackageFeeLabel(it))
          } : {}, {
            m: common_vendor.t($options.getItemDisplayPrice(it).toFixed(2)),
            n: $options.shouldShowOriginalPrice(it)
          }, $options.shouldShowOriginalPrice(it) ? {
            o: common_vendor.t($options.getItemOriginalPrice(it).toFixed(2))
          } : {}, {
            p: $options.getItemCouponDiscount(it) > 0
          }, $options.getItemCouponDiscount(it) > 0 ? {
            q: common_vendor.t($options.getItemCouponDiscount(it).toFixed(2))
          } : {}, {
            r: common_vendor.o(($event) => $options.decById(it.id), it.id),
            s: common_vendor.t(it.quantity),
            t: common_vendor.o(($event) => $options.incById(it.id), it.id),
            v: it.isBlocked
          }, it.isBlocked ? {
            w: common_vendor.o(($event) => $options.removeById(it.id), it.id)
          } : {}, {
            x: it.isNoPermission
          }, it.isNoPermission ? {} : it.isOutOfStock ? {} : {}, {
            y: it.isOutOfStock,
            z: it.id,
            A: it.isOutOfStock ? 1 : "",
            B: it.isNoPermission ? 1 : ""
          });
        }),
        c: grp.name
      };
    })
  } : {}, {
    n: $options.isAllSelected ? 1 : "",
    o: common_vendor.o((...args) => $options.toggleAll && $options.toggleAll(...args)),
    p: common_vendor.t($options.payable.toFixed(2)),
    q: $data.summaryData.total_package_fee > 0
  }, $data.summaryData.total_package_fee > 0 ? {
    r: common_vendor.t($data.summaryData.total_package_fee.toFixed(2))
  } : {}, {
    s: $data.summaryData.total_coupon_discount_amount > 0
  }, $data.summaryData.total_coupon_discount_amount > 0 ? {
    t: common_vendor.t(Number($data.summaryData.total_coupon_discount_amount).toFixed(2))
  } : {}, {
    v: common_vendor.o((...args) => $options.removeSelected && $options.removeSelected(...args)),
    w: common_vendor.t($options.selectedCount),
    x: $options.selectedCount === 0 ? 1 : "",
    y: common_vendor.o((...args) => $options.checkout && $options.checkout(...args)),
    z: $data.showSpecModal
  }, $data.showSpecModal ? {
    A: $data.editingItem.image || "/static/logo.png",
    B: common_vendor.t($data.editingItem.price),
    C: common_vendor.t($data.editingItem.attr),
    D: common_vendor.o((...args) => $options.closeSpecPopup && $options.closeSpecPopup(...args)),
    E: common_vendor.o((...args) => $options.closeSpecPopup && $options.closeSpecPopup(...args)),
    F: common_vendor.o((...args) => $options.closeSpecPopup && $options.closeSpecPopup(...args)),
    G: common_vendor.o(() => {
    }),
    H: common_vendor.o((...args) => $options.closeSpecPopup && $options.closeSpecPopup(...args))
  } : {}, {
    I: common_vendor.o(($event) => $data.showAddressSelector = false),
    J: common_vendor.o($options.onAddressSelect),
    K: common_vendor.o($options.onCreateAddress),
    L: common_vendor.p({
      visible: $data.showAddressSelector,
      rooms: $options.addressRooms,
      type: "addr",
      selectedName: $data.selectedAddress ? ($data.selectedAddress.receiver + " " + $data.selectedAddress.phone + " " + $data.selectedAddress.full).trim() : ""
    }),
    M: $data.customToastVisible
  }, $data.customToastVisible ? {
    N: common_vendor.t($data.customToastMessage)
  } : {}, {
    O: common_vendor.o($options.closeLoginModal),
    P: common_vendor.o($options.goLogin),
    Q: common_vendor.p({
      visible: $data.showLoginModal
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-8039fbf1"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/cart/index.js.map
