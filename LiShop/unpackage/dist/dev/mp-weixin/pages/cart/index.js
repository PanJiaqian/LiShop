"use strict";
const common_vendor = require("../../common/vendor.js");
const api_index = require("../../api/index.js");
const common_assets = require("../../common/assets.js");
const FloatingNav = () => "../../components/FloatingNav.js";
const RoomSelector = () => "../../components/RoomSelector.js";
const Skeleton = () => "../../components/Skeleton.js";
const _sfc_main = {
  components: { FloatingNav, RoomSelector, Skeleton },
  data() {
    return {
      loading: true,
      cart: [],
      showSpecModal: false,
      editingItem: {},
      // 房间选择相关
      rooms: [],
      showRoomModal: false,
      targetGroup: null,
      addresses: [],
      selectedAddress: null,
      showAddressSelector: false,
      orderNote: "",
      mpOrderNote: "",
      summaryData: {
        total_price: 0,
        total_original: 0,
        is_free_shipping: 0
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
      const validItems = this.cart.filter((it) => !it.isOutOfStock);
      return validItems.length > 0 && validItems.every((it) => it.selected);
    },
    selectedThumbs() {
      return this.cart.filter((it) => it.selected).slice(0, 4).map((it) => it.image || "/static/logo.png");
    },
    // officialReduce() { return this.cart.reduce((s, it) => s + (it.selected ? (it.officialReduce || 0) : 0), 0) },
    // redReduce() { return this.cart.reduce((s, it) => s + (it.selected ? (it.redReduce || 0) : 0), 0) },
    // extraReduce() { return this.cart.reduce((s, it) => s + (it.selected ? (it.reduce || 0) : 0), 0) },
    // totalReduce() { return this.officialReduce + this.redReduce + this.extraReduce },
    totalReduce() {
      return Math.max(0, (this.summaryData.total_original || 0) - (this.summaryData.total_price || 0));
    },
    payable() {
      return this.summaryData.total_price || 0;
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
        console.error("groups computed error", e);
        return [];
      }
    }
  },
  onShow() {
    this.load();
    this.loadAddresses();
  },
  methods: {
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
            const isOutOfStock = x.inventory === 0 || x.available_product_status === 0;
            list.push({
              id: x && x.id ? x.id : "",
              title: x && (x.available_product_name || x.product_name) ? x.available_product_name || x.product_name : "",
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
              isOutOfStock
            });
          }
        }
        this.cart = list;
        this.fetchSummary();
        this.loading = false;
      }).catch((err) => {
        console.error("Get cart failed", err);
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
      const selectedIds = this.cart.filter((it) => it.selected).map((it) => it.id);
      if (selectedIds.length === 0) {
        this.summaryData = { total_price: 0, total_original: 0, is_free_shipping: 0 };
        return;
      }
      api_index.getCartItemsByIDs({ ids: selectedIds }).then((res) => {
        if (res && res.success && res.data) {
          this.summaryData = res.data;
        }
      }).catch((e) => console.error(e));
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
        console.error(err);
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
    clearRemote() {
      api_index.clearCart().then((res) => {
        if (res && res.success) {
          this.cart = [];
          this.sync();
          this.fetchSummary();
          common_vendor.index.showToast({ title: "已清空", icon: "success" });
        } else {
          common_vendor.index.showToast({ title: res && res.message ? res.message : "清空失败", icon: "none" });
        }
      }).catch(() => {
        common_vendor.index.showToast({ title: "清空失败", icon: "none" });
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
    async checkout() {
      var _a;
      if (this.selectedCount === 0) {
        common_vendor.index.showToast({ title: "请选择商品", icon: "none" });
        return;
      }
      const selectedIds = this.cart.filter((it) => it.selected).map((it) => it.id);
      const addressId = ((_a = this.selectedAddress) == null ? void 0 : _a.id) || "";
      if (!addressId) {
        common_vendor.index.showToast({ title: "请先选择收货地址", icon: "none" });
        return;
      }
      if (!addressId) {
        common_vendor.index.showToast({ title: "地址选择异常", icon: "none" });
        return;
      }
      api_index.createOrderByIds({ ids: selectedIds, address_id: addressId, note: this.orderNote || this.mpOrderNote || "" }).then((res) => {
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
        console.error(err);
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
    },
    // 房间选择逻辑
    loadRooms() {
      api_index.getRooms().then((res) => {
        var _a;
        const items = Array.isArray((_a = res == null ? void 0 : res.data) == null ? void 0 : _a.items) ? res.data.items : [];
        this.rooms = items.map((r) => ({
          id: r.room_id,
          name: r.name
        }));
      }).catch((err) => {
        console.error("Get rooms failed", err);
        this.rooms = (common_vendor.index.getStorageSync("rooms") || []).map((n) => ({ id: n, name: n }));
      });
    },
    openRoomPopup(group) {
      this.targetGroup = group;
      this.showRoomModal = true;
      if (this.rooms.length === 0) {
        this.loadRooms();
      }
    },
    closeRoomPopup() {
      this.showRoomModal = false;
      this.targetGroup = null;
    },
    selectRoom(room) {
      if (!this.targetGroup || !this.targetGroup.items)
        return;
      const items = this.targetGroup.items;
      common_vendor.index.showLoading({ title: "移动中" });
      const promises = items.map((item) => {
        return api_index.updateCartItem({
          id: item.id,
          room_id: room.id,
          product_id: item.productId,
          length: Number(item.length) > 0 ? item.length : 0,
          quantity: item.quantity,
          color: item.color,
          note: item.note
        });
      });
      Promise.all(promises).then(() => {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({ title: "已移动到 " + room.name, icon: "success" });
        this.closeRoomPopup();
        this.load();
      }).catch(() => {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({ title: "移动部分失败", icon: "none" });
        this.closeRoomPopup();
        this.load();
      });
    }
  }
};
if (!Array) {
  const _component_Skeleton = common_vendor.resolveComponent("Skeleton");
  const _component_RoomSelector = common_vendor.resolveComponent("RoomSelector");
  (_component_Skeleton + _component_RoomSelector)();
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
    i: $data.mpOrderNote,
    j: common_vendor.o(($event) => $data.mpOrderNote = $event.detail.value),
    k: $data.cart.length
  }, $data.cart.length ? {
    l: common_vendor.f($options.groups, (grp, gi, i0) => {
      return {
        a: common_vendor.t(grp.name),
        b: common_vendor.o(($event) => $options.openRoomPopup(grp), grp.name),
        c: common_vendor.f(grp.items, (it, k1, i1) => {
          return common_vendor.e({
            a: it.isOutOfStock
          }, it.isOutOfStock ? {} : {}, {
            b: it.selected ? 1 : "",
            c: it.isOutOfStock ? 1 : "",
            d: common_vendor.o(($event) => $options.toggleById(it.id), it.id),
            e: it.image || "/static/logo.png",
            f: common_vendor.o(($event) => $options.openDetail(it), it.id),
            g: common_vendor.t(it.title),
            h: common_vendor.o(($event) => $options.openDetail(it), it.id),
            i: common_vendor.t(it.attr),
            j: common_vendor.t(it.price.toFixed(2)),
            k: common_vendor.o(($event) => $options.decById(it.id), it.id),
            l: common_vendor.t(it.quantity),
            m: common_vendor.o(($event) => $options.incById(it.id), it.id),
            n: it.isOutOfStock
          }, it.isOutOfStock ? {} : {}, {
            o: it.id,
            p: it.isOutOfStock ? 1 : ""
          });
        }),
        d: grp.name
      };
    })
  } : {}, {
    m: $options.isAllSelected ? 1 : "",
    n: common_vendor.o((...args) => $options.toggleAll && $options.toggleAll(...args)),
    o: common_vendor.t($options.selectedTotal.toFixed(2)),
    p: common_vendor.o((...args) => $options.clear && $options.clear(...args)),
    q: common_vendor.t($options.selectedCount),
    r: $options.selectedCount === 0 ? 1 : "",
    s: common_vendor.o((...args) => $options.checkout && $options.checkout(...args)),
    t: $data.showRoomModal
  }, $data.showRoomModal ? {
    v: common_vendor.o((...args) => $options.closeRoomPopup && $options.closeRoomPopup(...args)),
    w: common_vendor.f($data.rooms, (r, k0, i0) => {
      return {
        a: common_vendor.t(r.name),
        b: r.id,
        c: $data.targetGroup && $data.targetGroup.name === r.name ? 1 : "",
        d: common_vendor.o(($event) => $options.selectRoom(r), r.id)
      };
    }),
    x: common_vendor.o(() => {
    }),
    y: common_vendor.o((...args) => $options.closeRoomPopup && $options.closeRoomPopup(...args))
  } : {}, {
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
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-8039fbf1"]]);
wx.createPage(MiniProgramPage);
