"use strict";
const common_vendor = require("../../common/vendor.js");
const FloatingNav = () => "../../components/FloatingNav.js";
const _sfc_main = {
  components: { FloatingNav },
  data() {
    return { cart: [] };
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
    load() {
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
        this.cart[i].quantity += 1;
        this.sync();
      }
    },
    decById(id) {
      const i = this.findIndexById(id);
      if (i >= 0) {
        this.cart[i].quantity = Math.max(1, (this.cart[i].quantity || 1) - 1);
        this.sync();
      }
    },
    removeById(id) {
      const i = this.findIndexById(id);
      if (i >= 0) {
        this.cart.splice(i, 1);
        this.sync();
      }
    },
    removeSelected() {
      this.cart = this.cart.filter((it) => !it.selected);
      this.sync();
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
        b: common_vendor.f(grp.items, (it, k1, i1) => {
          return {
            a: it.selected ? 1 : "",
            b: common_vendor.o(($event) => $options.toggleById(it.id), it.id),
            c: it.image || "/static/logo.png",
            d: common_vendor.t(it.title),
            e: common_vendor.t(it.price.toFixed(2)),
            f: common_vendor.o(($event) => $options.decById(it.id), it.id),
            g: common_vendor.t(it.quantity),
            h: common_vendor.o(($event) => $options.incById(it.id), it.id),
            i: common_vendor.o(($event) => $options.removeById(it.id), it.id),
            j: it.id
          };
        }),
        c: grp.name
      };
    })
  } : {}, {
    c: $options.isAllSelected ? 1 : "",
    d: common_vendor.o((...args) => $options.toggleAll && $options.toggleAll(...args)),
    e: common_vendor.t($options.selectedTotal.toFixed(2)),
    f: common_vendor.o((...args) => $options.clear && $options.clear(...args)),
    g: common_vendor.t($options.selectedCount),
    h: $options.selectedCount === 0,
    i: common_vendor.o((...args) => $options.checkout && $options.checkout(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-8039fbf1"]]);
wx.createPage(MiniProgramPage);
