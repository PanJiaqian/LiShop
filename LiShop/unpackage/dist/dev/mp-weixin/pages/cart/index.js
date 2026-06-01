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
      summaryData: {
        total_price: 0,
        total_original: 0,
        is_free_shipping: 0
      },
      couponDiscount: 0,
      showLoginModal: false,
      // 优惠券相关
      availableCoupons: [],
      selectedCouponRecordId: "",
      showCouponModal: false,
      _couponModalMousedownTarget: null,
      _noteLimitMax: 250,
      customToastVisible: false,
      customToastMessage: "",
      _customToastTimer: null
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
      const validItems = this.cart.filter((it) => !it.isOutOfStock);
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
      return Math.max(0, (this.summaryData.total_original || 0) - (this.summaryData.total_price || 0)) + this.couponDiscount;
    },
    payable() {
      return Math.max(0, (this.summaryData.total_price || 0) - this.couponDiscount);
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
        common_vendor.index.__f__("error", "at pages/cart/index.vue:381", "groups computed error", e);
        return [];
      }
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
    this.fetchCoupons();
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
    handleCouponModalMaskMousedown(e) {
      this._couponModalMousedownTarget = e.target;
    },
    handleCouponModalMaskMouseup(e) {
      if (this._couponModalMousedownTarget === e.currentTarget && e.target === e.currentTarget) {
        this.showCouponModal = false;
      }
      this._couponModalMousedownTarget = null;
    },
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
    fetchCoupons() {
      let token = "";
      try {
        const u = common_vendor.index.getStorageSync("user") || null;
        token = u && (u.token || u.data && u.data.token) || "";
      } catch (e) {
      }
      if (!token)
        return;
      api_index.getUserCoupons({ token }).then((res) => {
        if (res && res.success && res.data && res.data.items) {
          this.availableCoupons = res.data.items.filter((c) => c.status === 1);
        }
      }).catch(() => {
      });
    },
    selectCoupon(id) {
      this.selectedCouponRecordId = id;
      this.showCouponModal = false;
      this.updateCouponDiscount();
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
              stockMessage: x.message || (isOutOfStock ? "该商品已无库存" : ""),
              isOutOfStock: isOutOfStock || isNoPermission,
              isNoPermission,
              cart_item_status: cartItemStatus,
              category_id: x.category_id || "",
              has_used_coupon: false,
              package_fee: Number(x.package_fee) || 0
            });
          }
        }
        this.cart = list;
        this.fetchSummary();
        this.loading = false;
      }).catch((err) => {
        common_vendor.index.__f__("error", "at pages/cart/index.vue:608", "Get cart failed", err);
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
      const selectedItems = this.cart.filter((it) => it.selected);
      const selectedIds = selectedItems.map((it) => it.id);
      if (selectedIds.length === 0) {
        this.summaryData = { total_price: 0, total_original: 0, total_package_fee: 0, is_free_shipping: 0 };
        this.couponDiscount = 0;
        return;
      }
      let token = "";
      try {
        const u = common_vendor.index.getStorageSync("user") || null;
        token = u && (u.token || u.data && u.data.token) || "";
      } catch (e) {
      }
      api_index.calculateCartPrice({ cart_item_ids: selectedIds, token }).then((res) => {
        if (res && res.success && res.data) {
          this.summaryData = {
            total_price: res.data.total_amount || 0,
            total_original: res.data.total_original || 0,
            total_package_fee: res.data.total_package_fee || 0,
            is_free_shipping: 0,
            items: Array.isArray(res.data.items) ? res.data.items : []
          };
          if (res.data.items && Array.isArray(res.data.items)) {
            res.data.items.forEach((detail) => {
              const idx = this.cart.findIndex((it) => it.id === detail.cart_item_id);
              if (idx >= 0) {
                this.cart[idx].package_fee = detail.package_fee || 0;
              }
            });
          }
          this.updateCouponDiscount();
        }
      }).catch((e) => common_vendor.index.__f__("error", "at pages/cart/index.vue:654", e));
    },
    updateCouponDiscount() {
      if (!this.selectedCouponRecordId || this.summaryData.total_price <= 0) {
        this.couponDiscount = 0;
        this.cart.forEach((it) => {
          it.has_used_coupon = false;
        });
        return;
      }
      const coupon = this.availableCoupons.find((c) => c.record_id === this.selectedCouponRecordId);
      let applicable_order_amount = this.summaryData.total_original || 0;
      if (coupon && coupon.rule) {
        const cats = coupon.rule.applicable_categories || [];
        const isAll = cats.includes("ALL") || cats.length === 0;
        const summaryItemMap = {};
        (this.summaryData && this.summaryData.items || []).forEach((item) => {
          if (item && item.cart_item_id)
            summaryItemMap[item.cart_item_id] = item;
        });
        applicable_order_amount = 0;
        this.cart.forEach((it) => {
          if (!it.selected) {
            it.has_used_coupon = false;
            return;
          }
          if (isAll || cats.includes(it.category_id)) {
            it.has_used_coupon = true;
            const detail = summaryItemMap[it.id] || null;
            applicable_order_amount += Number(detail ? detail.item_original : 0) || 0;
          } else {
            it.has_used_coupon = false;
          }
        });
      }
      let token = "";
      try {
        const u = common_vendor.index.getStorageSync("user") || null;
        token = u && (u.token || u.data && u.data.token) || "";
      } catch (e) {
      }
      api_index.calculateCoupon({
        record_id: this.selectedCouponRecordId,
        order_amount: this.summaryData.total_price || 0,
        applicable_order_amount,
        token
      }).then((res) => {
        if (res && res.code === 200 && res.data) {
          this.couponDiscount = res.data.deduct_amount || 0;
        } else {
          this.couponDiscount = 0;
        }
      }).catch(() => {
        this.couponDiscount = 0;
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
        if (item.isOutOfStock)
          return;
        this.updateItemQuantity(item, item.quantity + 1);
      }
    },
    decById(id) {
      const i = this.findIndexById(id);
      if (i >= 0) {
        const item = this.cart[i];
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
        common_vendor.index.__f__("error", "at pages/cart/index.vue:747", err);
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
            it.quantity = Number(found.quantity !== void 0 ? found.quantity : it.quantity) || it.quantity;
            it.inventory = found.inventory;
            it.available = found.available_product_status;
            it.isOutOfStock = found.inventory === 0 || found.available_product_status === 0;
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
        if (this.cart[i].isOutOfStock)
          return;
        this.cart[i].selected = !this.cart[i].selected;
        this.sync();
        this.fetchSummary();
      }
    },
    toggleAll() {
      const validItems = this.cart.filter((it) => !it.isOutOfStock);
      if (validItems.length === 0)
        return;
      const makeSelected = !this.isAllSelected;
      this.cart.forEach((it) => {
        if (!it.isOutOfStock)
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
        common_vendor.index.showToast({ title: "选中商品中包含无货商品，请取消勾选后再结算", icon: "none" });
        return;
      }
      const selectedItems = this.cart.filter((it) => it.selected);
      const selectedIds = selectedItems.map((it) => it.id);
      const addressId = ((_a = this.selectedAddress) == null ? void 0 : _a.id) || "";
      if (!addressId) {
        common_vendor.index.showToast({ title: "请先选择收货地址", icon: "none" });
        return;
      }
      let coupon_record_id = this.selectedCouponRecordId || "";
      let token = "";
      try {
        const u = common_vendor.index.getStorageSync("user") || null;
        token = u && (u.token || u.data && u.data.token) || "";
      } catch (e) {
      }
      api_index.createOrderByIds({ ids: selectedIds, address_id: addressId, note: this.orderNote || this.mpOrderNote || "", coupon_record_id, token }).then((res) => {
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
        common_vendor.index.__f__("error", "at pages/cart/index.vue:876", err);
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
    l: $data.availableCoupons.length > 0
  }, $data.availableCoupons.length > 0 ? {
    m: common_vendor.t($data.selectedCouponRecordId ? "已选择1张" : "可使用优惠券 ▾"),
    n: common_vendor.o(($event) => $data.showCouponModal = true)
  } : {}, {
    o: $data.cart.length
  }, $data.cart.length ? {
    p: common_vendor.f($options.groups, (grp, gi, i0) => {
      return {
        a: common_vendor.t(grp.name),
        b: common_vendor.f(grp.items, (it, k1, i1) => {
          return common_vendor.e({
            a: it.isOutOfStock
          }, it.isOutOfStock ? {} : {}, {
            b: it.selected ? 1 : "",
            c: it.isOutOfStock ? 1 : "",
            d: common_vendor.o(($event) => $options.toggleById(it.id), it.id),
            e: it.image || "/static/logo.png",
            f: common_vendor.o(($event) => $options.openDetail(it), it.id),
            g: it.has_used_coupon
          }, it.has_used_coupon ? {} : {}, {
            h: common_vendor.t(it.title),
            i: common_vendor.o(($event) => $options.openDetail(it), it.id),
            j: common_vendor.t(it.attr),
            k: it.package_fee > 0
          }, it.package_fee > 0 ? {
            l: common_vendor.t(Number(it.package_fee).toFixed(2))
          } : {}, {
            m: common_vendor.t(it.price.toFixed(2)),
            n: common_vendor.o(($event) => $options.decById(it.id), it.id),
            o: common_vendor.t(it.quantity),
            p: common_vendor.o(($event) => $options.incById(it.id), it.id),
            q: it.isOutOfStock
          }, it.isOutOfStock ? {
            r: common_vendor.o(($event) => $options.removeById(it.id), it.id)
          } : {}, {
            s: it.isNoPermission
          }, it.isNoPermission ? {} : it.isOutOfStock ? {} : {}, {
            t: it.isOutOfStock,
            v: it.id,
            w: it.isOutOfStock ? 1 : "",
            x: it.isNoPermission ? 1 : ""
          });
        }),
        c: grp.name
      };
    })
  } : {}, {
    q: $options.isAllSelected ? 1 : "",
    r: common_vendor.o((...args) => $options.toggleAll && $options.toggleAll(...args)),
    s: common_vendor.t($options.payable.toFixed(2)),
    t: $data.summaryData.total_package_fee > 0
  }, $data.summaryData.total_package_fee > 0 ? {
    v: common_vendor.t($data.summaryData.total_package_fee.toFixed(2))
  } : {}, {
    w: $data.couponDiscount > 0
  }, $data.couponDiscount > 0 ? {
    x: common_vendor.t(Number($data.couponDiscount).toFixed(2))
  } : {}, {
    y: common_vendor.o((...args) => $options.removeSelected && $options.removeSelected(...args)),
    z: common_vendor.t($options.selectedCount),
    A: $options.selectedCount === 0 ? 1 : "",
    B: common_vendor.o((...args) => $options.checkout && $options.checkout(...args)),
    C: $data.showSpecModal
  }, $data.showSpecModal ? {
    D: $data.editingItem.image || "/static/logo.png",
    E: common_vendor.t($data.editingItem.price),
    F: common_vendor.t($data.editingItem.attr),
    G: common_vendor.o((...args) => $options.closeSpecPopup && $options.closeSpecPopup(...args)),
    H: common_vendor.o((...args) => $options.closeSpecPopup && $options.closeSpecPopup(...args)),
    I: common_vendor.o((...args) => $options.closeSpecPopup && $options.closeSpecPopup(...args)),
    J: common_vendor.o(() => {
    }),
    K: common_vendor.o((...args) => $options.closeSpecPopup && $options.closeSpecPopup(...args))
  } : {}, {
    L: common_vendor.o(($event) => $data.showAddressSelector = false),
    M: common_vendor.o($options.onAddressSelect),
    N: common_vendor.o($options.onCreateAddress),
    O: common_vendor.p({
      visible: $data.showAddressSelector,
      rooms: $options.addressRooms,
      type: "addr",
      selectedName: $data.selectedAddress ? ($data.selectedAddress.receiver + " " + $data.selectedAddress.phone + " " + $data.selectedAddress.full).trim() : ""
    }),
    P: $data.showCouponModal
  }, $data.showCouponModal ? {
    Q: common_vendor.o(($event) => $data.showCouponModal = false),
    R: $data.selectedCouponRecordId === "" ? 1 : "",
    S: common_vendor.o(($event) => $options.selectCoupon("")),
    T: common_vendor.f($data.availableCoupons, (c, k0, i0) => {
      return {
        a: common_vendor.t(c.name),
        b: common_vendor.t(c.balance),
        c: c.record_id,
        d: $data.selectedCouponRecordId === c.record_id ? 1 : "",
        e: common_vendor.o(($event) => $options.selectCoupon(c.record_id), c.record_id)
      };
    }),
    U: common_vendor.o(() => {
    }),
    V: common_vendor.o(() => {
    }),
    W: common_vendor.o(() => {
    }),
    X: common_vendor.o((...args) => $options.handleCouponModalMaskMousedown && $options.handleCouponModalMaskMousedown(...args)),
    Y: common_vendor.o((...args) => $options.handleCouponModalMaskMouseup && $options.handleCouponModalMaskMouseup(...args))
  } : {}, {
    Z: $data.customToastVisible
  }, $data.customToastVisible ? {
    aa: common_vendor.t($data.customToastMessage)
  } : {}, {
    ab: common_vendor.o($options.closeLoginModal),
    ac: common_vendor.o($options.goLogin),
    ad: common_vendor.p({
      visible: $data.showLoginModal
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-8039fbf1"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/cart/index.js.map
