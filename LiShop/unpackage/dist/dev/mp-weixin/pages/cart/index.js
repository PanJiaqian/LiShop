"use strict";
const common_vendor = require("../../common/vendor.js");
const api_index = require("../../api/index.js");
const FloatingNav = () => "../../components/FloatingNav.js";
const _sfc_main = {
  components: { FloatingNav },
  data() {
    return {
      cart: [],
      showSpecModal: false,
      editingItem: {},
      // 房间选择相关
      rooms: [],
      showRoomModal: false,
      targetGroup: null
    };
  },
  computed: {
    total() {
      return this.cart.reduce((s, it) => s + it.price * (it.quantity || 1), 0);
    },
    selectedTotal() {
      return this.cart.reduce((s, it) => s + (it.selected ? it.price * (it.quantity || 1) : 0), 0);
    },
    selectedCount() {
      return this.cart.filter((it) => it.selected).length;
    },
    isAllSelected() {
      return this.cart.length > 0 && this.selectedCount === this.cart.length;
    },
    selectedThumbs() {
      return this.cart.filter((it) => it.selected).slice(0, 2).map((it) => it.image || "/static/logo.png");
    },
    officialReduce() {
      return this.cart.reduce((s, it) => s + (it.selected ? it.officialReduce || 0 : 0), 0);
    },
    redReduce() {
      return this.cart.reduce((s, it) => s + (it.selected ? it.redReduce || 0 : 0), 0);
    },
    extraReduce() {
      return this.cart.reduce((s, it) => s + (it.selected ? it.reduce || 0 : 0), 0);
    },
    totalReduce() {
      return this.officialReduce + this.redReduce + this.extraReduce;
    },
    payable() {
      return Math.max(0, this.selectedTotal - this.totalReduce);
    },
    needForCoupon() {
      const need = Math.max(0, 800 - this.payable);
      return need.toFixed(2);
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
  },
  methods: {
    goBack() {
      const pages = getCurrentPages();
      if (pages.length > 1) {
        common_vendor.index.navigateBack();
      } else {
        common_vendor.index.switchTab({ url: "/pages/home/index" });
      }
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
            list.push({
              id: x && x.id ? x.id : "",
              title: x && x.product_id ? x.product_id : "",
              productId: x && x.product_id ? x.product_id : "",
              price: Number((x && x.price) !== void 0 ? x.price : 0) || 0,
              quantity: Number((x && x.quantity) !== void 0 ? x.quantity : 1) || 1,
              image: "/static/logo.png",
              roomName: roomName || "默认房间",
              roomId: g.room_id || "",
              length: x.length || 1,
              color: x.color || "暖白",
              note: x.note || "",
              attr: (x && x.length ? "长度 " + x.length : "") + (x && x.note ? " ｜ " + x.note : ""),
              selected: false
            });
          }
        }
        this.cart = list;
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
        length: item.length,
        quantity,
        color: item.color,
        note: item.note
      }).then((res) => {
        if (res && res.success) {
          item.quantity = quantity;
          this.sync();
        } else {
          common_vendor.index.showToast({ title: "更新失败", icon: "none" });
        }
      }).catch((err) => {
        console.error(err);
        common_vendor.index.showToast({ title: "更新出错", icon: "none" });
      });
    },
    removeById(id) {
      api_index.deleteCartItem({ id }).then(() => {
        const i = this.findIndexById(id);
        if (i >= 0) {
          this.cart.splice(i, 1);
          this.sync();
        }
        common_vendor.index.showToast({ title: "已删除", icon: "success" });
      }).catch(() => {
        const i = this.findIndexById(id);
        if (i >= 0) {
          this.cart.splice(i, 1);
          this.sync();
        }
        common_vendor.index.showToast({ title: "本地删除", icon: "none" });
      });
    },
    removeSelected() {
      this.cart = this.cart.filter((it) => !it.selected);
      this.sync();
    },
    clearRemote() {
      api_index.clearCart().then((res) => {
        if (res && res.success) {
          this.cart = [];
          this.sync();
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
        this.cart[i].selected = !this.cart[i].selected;
        this.sync();
      }
    },
    toggleAll() {
      const makeSelected = !(this.selectedCount === this.cart.length && this.cart.length > 0);
      this.cart.forEach((it) => it.selected = makeSelected);
      this.sync();
    },
    clear() {
      this.cart = [];
      this.sync();
    },
    checkout() {
      if (this.selectedCount === 0) {
        common_vendor.index.showToast({ title: "请选择商品", icon: "none" });
        return;
      }
      const selected = this.cart.filter((it) => it.selected);
      const groupMap = {};
      selected.forEach((it) => {
        const key = it.roomName || "默认房间";
        if (!groupMap[key])
          groupMap[key] = [];
        groupMap[key].push({
          id: it.id,
          title: it.title,
          price: it.price,
          quantity: it.quantity,
          specTemp: it.specTemp || "",
          specLength: it.specLength || "",
          roomName: key
        });
      });
      const rooms = Object.keys(groupMap).map((name) => {
        const items = groupMap[name];
        const roomTotal = items.reduce((s, x) => s + x.price * x.quantity, 0);
        return { name, items, roomTotal };
      });
      const now = /* @__PURE__ */ new Date();
      const id = Date.now();
      const orderNo = `JD${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}${String(id).slice(-6)}`;
      const waybillNo = `WB${Math.floor(Math.random() * 1e10).toString().padStart(10, "0")}`;
      const baseTime = now.getTime();
      const tracking = [
        { time: new Date(baseTime).toISOString(), status: "已下单", desc: "订单已提交，等待商家处理", place: "系统" },
        { time: new Date(baseTime + 5 * 60 * 1e3).toISOString(), status: "拣货中", desc: "商家正在为您拣货", place: "仓库" },
        { time: new Date(baseTime + 30 * 60 * 1e3).toISOString(), status: "已揽收", desc: "快递已揽收包裹", place: "揽收点" }
      ];
      const order = { id, orderNo, waybillNo, createdAt: now.toISOString(), rooms, total: rooms.reduce((s, r) => s + r.roomTotal, 0), tracking };
      try {
        const orders = common_vendor.index.getStorageSync("orders") || [];
        common_vendor.index.setStorageSync("orders", [order, ...orders]);
        this.cart = this.cart.filter((it) => !it.selected);
        this.sync();
        this.exportExcel(order);
        common_vendor.index.showToast({ title: "已生成订单", icon: "success" });
        common_vendor.index.navigateTo({ url: "/pages/order/index?id=" + order.id });
      } catch (e) {
        console.error(e);
      }
    },
    exportExcel(order) {
      try {
        const header = ["房间", "商品", "型号", "色温", "长度", "单价", "数量", "金额"];
        let html = '<table border="1" cellspacing="0" cellpadding="4"><tr>' + header.map((h) => `<th>${h}</th>`).join("") + "</tr>";
        order.rooms.forEach((r) => {
          r.items.forEach((x) => {
            const row = [r.name, x.title, x.id, x.specTemp || "", x.specLength || "", x.price.toFixed(2), x.quantity, (x.price * x.quantity).toFixed(2)];
            html += "<tr>" + row.map((v) => `<td>${v}</td>`).join("") + "</tr>";
          });
        });
        html += "</table>";
        const blob = new Blob([`\uFEFF${html}`], { type: "application/vnd.ms-excel" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `订单_${order.id}.xls`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (e) {
      }
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
          length: item.length,
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
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.cart.length
  }, $data.cart.length ? {
    b: common_vendor.f($options.groups, (grp, gi, i0) => {
      return {
        a: common_vendor.t(grp.name),
        b: common_vendor.o(($event) => $options.openRoomPopup(grp), grp.name),
        c: common_vendor.f(grp.items, (it, k1, i1) => {
          return {
            a: it.selected ? 1 : "",
            b: common_vendor.o(($event) => $options.toggleById(it.id), it.id),
            c: it.image || "/static/logo.png",
            d: common_vendor.t(it.title),
            e: common_vendor.t(it.attr),
            f: common_vendor.t(it.price.toFixed(2)),
            g: common_vendor.o(($event) => $options.decById(it.id), it.id),
            h: common_vendor.t(it.quantity),
            i: common_vendor.o(($event) => $options.incById(it.id), it.id),
            j: common_vendor.o(($event) => $options.removeById(it.id), it.id),
            k: it.id
          };
        }),
        d: grp.name
      };
    })
  } : {}, {
    c: $options.isAllSelected ? 1 : "",
    d: common_vendor.o((...args) => $options.toggleAll && $options.toggleAll(...args)),
    e: common_vendor.t($options.selectedTotal.toFixed(2)),
    f: common_vendor.o((...args) => $options.clear && $options.clear(...args)),
    g: common_vendor.t($options.selectedCount),
    h: $options.selectedCount === 0,
    i: common_vendor.o((...args) => $options.checkout && $options.checkout(...args)),
    j: $data.showRoomModal
  }, $data.showRoomModal ? {
    k: common_vendor.o((...args) => $options.closeRoomPopup && $options.closeRoomPopup(...args)),
    l: common_vendor.f($data.rooms, (r, k0, i0) => {
      return {
        a: common_vendor.t(r.name),
        b: r.id,
        c: $data.targetGroup && $data.targetGroup.name === r.name ? 1 : "",
        d: common_vendor.o(($event) => $options.selectRoom(r), r.id)
      };
    }),
    m: common_vendor.o(() => {
    }),
    n: common_vendor.o((...args) => $options.closeRoomPopup && $options.closeRoomPopup(...args))
  } : {}, {
    o: $data.showSpecModal
  }, $data.showSpecModal ? {
    p: $data.editingItem.image || "/static/logo.png",
    q: common_vendor.t($data.editingItem.price),
    r: common_vendor.t($data.editingItem.attr),
    s: common_vendor.o((...args) => $options.closeSpecPopup && $options.closeSpecPopup(...args)),
    t: common_vendor.o((...args) => $options.closeSpecPopup && $options.closeSpecPopup(...args)),
    v: common_vendor.o((...args) => $options.closeSpecPopup && $options.closeSpecPopup(...args)),
    w: common_vendor.o(() => {
    }),
    x: common_vendor.o((...args) => $options.closeSpecPopup && $options.closeSpecPopup(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-8039fbf1"]]);
wx.createPage(MiniProgramPage);
