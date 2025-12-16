"use strict";
const common_vendor = require("../../common/vendor.js");
const api_index = require("../../api/index.js");
const common_assets = require("../../common/assets.js");
const FloatingNav = () => "../../components/FloatingNav.js";
const Skeleton = () => "../../components/Skeleton.js";
const _sfc_main = {
  components: { FloatingNav, Skeleton },
  data() {
    return { order: null, orders: [], activeTab: "all", loading: true, logisticsCollapsed: true, isH5: false, mapError: false };
  },
  onLoad(query) {
    const id = query == null ? void 0 : query.id;
    try {
      this.isH5 = typeof window !== "undefined";
    } catch (e) {
      this.isH5 = false;
    }
    if (id) {
      this.fetchDetail(id);
    } else {
      this.fetchOrders();
    }
  },
  onShow() {
    try {
      if (this.isH5) {
        const cur = typeof location !== "undefined" && location.href ? location.href : "";
        const ref = typeof document !== "undefined" && document.referrer ? document.referrer : "";
        if (ref && (!cur || ref !== cur)) {
          try {
            common_vendor.index.setStorageSync("last_order_back", ref);
          } catch (e) {
          }
        }
      }
    } catch (e) {
    }
  },
  methods: {
    onMapError() {
      this.mapError = true;
      try {
        common_vendor.index.showToast({ title: "物流地图加载失败", icon: "none" });
      } catch (e) {
      }
    },
    formatTime(t) {
      try {
        return new Date(t).toLocaleString();
      } catch {
        return t;
      }
    },
    copyWaybill(no) {
      try {
        common_vendor.index.setClipboardData({ data: String(no) });
        common_vendor.index.showToast({ title: "已复制运单号", icon: "success" });
      } catch (e) {
      }
    },
    openDetail(id) {
      common_vendor.index.navigateTo({ url: "/pages/order/index?id=" + id });
    },
    firstThumbs(o) {
      try {
        const imgs = [];
        o.rooms.forEach((r) => r.items.forEach((x) => imgs.push(x.image || "/static/logo.png")));
        return imgs.slice(0, 2);
      } catch {
        return [];
      }
    },
    async exportExcel(order) {
      try {
        common_vendor.index.showModal({ title: "提示", content: "小程序暂不支持导出", showCancel: false });
        return;
        common_vendor.index.showLoading({ title: "请求导出" });
        const res = await api_index.exportOrderExcel({ order_id: order.id });
        common_vendor.index.hideLoading();
        if (res.success) {
          const msg = res.message || "导出请求已发送";
          common_vendor.index.showToast({ title: msg, icon: "success" });
          const possibleUrl = res && res.url || res && res.data && res.data.url || (res && res.data && typeof res.data === "string" ? res.data : "");
          if (possibleUrl && typeof possibleUrl === "string") {
            const url = possibleUrl;
            common_vendor.index.setClipboardData({ data: url, success: () => common_vendor.index.showToast({ title: "下载链接已复制", icon: "none" }) });
          } else {
            common_vendor.index.showToast({ title: "未获取到导出链接", icon: "none" });
          }
        } else {
          common_vendor.index.showToast({ title: res.message || "导出失败", icon: "none" });
        }
      } catch (e) {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({ title: "导出出错", icon: "none" });
      }
    },
    mapApiOrderToLocal(apiOrder) {
      const roomsMap = {};
      (apiOrder.items || []).forEach((item) => {
        const roomName = item.room_name || "默认房间";
        if (!roomsMap[roomName]) {
          roomsMap[roomName] = { name: roomName, roomTotal: 0, items: [] };
        }
        const price = Number(item.price || 0);
        const localItem = {
          title: item.product_name || item.available_product_name,
          available_product_name: item.available_product_name || "",
          id: item.product_id || item.available_product_id,
          specTemp: item.color_temperature && item.color_temperature !== "None" && item.color_temperature !== "无" ? item.color_temperature : "",
          specLength: item.length,
          price,
          quantity: item.quantity,
          image: item.main_picture
        };
        roomsMap[roomName].items.push(localItem);
        roomsMap[roomName].roomTotal += price * (item.quantity || 0);
      });
      const tracking = [];
      let rawList = [];
      let trackingMessage = "";
      let mapUrl = "";
      try {
        const last = apiOrder && apiOrder.logistics_data && apiOrder.logistics_data.lastResult;
        rawList = last && Array.isArray(last.data) ? last.data : [];
        trackingMessage = last && (last.message || last.msg) || apiOrder && apiOrder.logistics_message || "";
        mapUrl = last && last.trailUrl ? String(last.trailUrl).replace(/`/g, "").trim() : "";
      } catch (e) {
        rawList = [];
      }
      rawList.forEach((ev) => {
        tracking.push({
          status: ev.status || "",
          desc: ev.context || "",
          time: ev.ftime || ev.time || "",
          place: ev.areaName || ev.location || ""
        });
      });
      return {
        id: apiOrder.order_id,
        orderNo: apiOrder.order_id,
        createdAt: null,
        total: Number(apiOrder.total_price || 0),
        waybillNo: apiOrder && apiOrder.tracking_number || apiOrder && apiOrder.logistics_data && apiOrder.logistics_data.lastResult && apiOrder.logistics_data.lastResult.nu || "",
        tracking,
        trackingMessage: tracking.length ? "" : trackingMessage || "",
        mapUrl,
        status: apiOrder.status || "unknown",
        rooms: Object.values(roomsMap)
      };
    },
    switchTab(tab) {
      this.activeTab = tab;
      this.fetchOrders();
    },
    async fetchOrders() {
      this.loading = true;
      this.orders = [];
      const allEndpoints = [
        { fn: api_index.getPendingPaymentOrders, status: "pending_payment" },
        { fn: api_index.getPendingShipmentOrders, status: "pending_shipment" },
        { fn: api_index.getPendingReceiptOrders, status: "pending_receipt" },
        { fn: api_index.getHistoryOrders, status: "" }
      ];
      let endpoints = [];
      if (this.activeTab === "all") {
        endpoints = allEndpoints;
      } else {
        const map = {
          "pending_payment": { fn: api_index.getPendingPaymentOrders, status: "pending_payment" },
          "pending_shipment": { fn: api_index.getPendingShipmentOrders, status: "pending_shipment" },
          "pending_receipt": { fn: api_index.getPendingReceiptOrders, status: "pending_receipt" },
          "history": { fn: api_index.getHistoryOrders, status: "" }
        };
        if (map[this.activeTab])
          endpoints = [map[this.activeTab]];
      }
      const seenIds = /* @__PURE__ */ new Set();
      const allOrders = [];
      for (const { fn, status } of endpoints) {
        try {
          const res = await fn();
          if (res.success && res.data && res.data.orders) {
            res.data.orders.forEach((o) => {
              if (!seenIds.has(o.order_id)) {
                seenIds.add(o.order_id);
                if (status && !o.status)
                  o.status = status;
                allOrders.push(this.mapApiOrderToLocal(o));
              }
            });
          }
        } catch (e) {
        }
      }
      this.orders = allOrders;
      this.loading = false;
    },
    async fetchDetail(id) {
      this.loading = true;
      try {
        const res = await api_index.getOrderDetail({ order_id: id });
        if (res.success && res.data) {
          this.order = this.mapApiOrderToLocal(res.data);
        }
      } catch (e) {
      }
      this.loading = false;
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
      if (this.order) {
        try {
          common_vendor.index.navigateTo({ url: "/pages/order/index" });
          return;
        } catch (e) {
        }
        this.goHome();
      } else {
        this.goHome();
      }
    },
    toggleLogistics() {
      this.logisticsCollapsed = !this.logisticsCollapsed;
    },
    openMap(url) {
      if (!url)
        return;
      try {
        if (this.isH5 && typeof window !== "undefined") {
          window.open(url, "_blank");
          return;
        }
      } catch (e) {
      }
      try {
        common_vendor.index.setClipboardData({ data: String(url) });
        common_vendor.index.showToast({ title: "链接已复制", icon: "none" });
      } catch (e) {
      }
    },
    async confirmReceipt(id) {
      try {
        const res = await api_index.confirmOrderReceipt({ order_id: id });
        if (res.success) {
          common_vendor.index.showToast({ title: "确认收货成功", icon: "success" });
          if (this.order && (this.order.id === id || this.order.orderNo === id)) {
            this.fetchDetail(id);
          } else {
            this.fetchOrders();
          }
        }
      } catch (e) {
      }
    },
    async handleCancelOrder(id) {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要取消该订单吗？",
        success: async (res) => {
          if (res.confirm) {
            try {
              const res2 = await api_index.cancelOrder({ order_id: id });
              if (res2.success) {
                common_vendor.index.showToast({ title: "订单已取消", icon: "success" });
                if (this.order && (this.order.id === id || this.order.orderNo === id)) {
                  this.fetchDetail(id);
                } else {
                  this.fetchOrders();
                }
              }
            } catch (e) {
              common_vendor.index.showToast({ title: "取消失败", icon: "none" });
            }
          }
        }
      });
    }
  }
};
if (!Array) {
  const _component_Skeleton = common_vendor.resolveComponent("Skeleton");
  _component_Skeleton();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.p({
      loading: $data.loading,
      showTitle: true
    }),
    b: common_assets._imports_0,
    c: !$data.order
  }, !$data.order ? {
    d: $data.activeTab === "all" ? 1 : "",
    e: common_vendor.o(($event) => $options.switchTab("all")),
    f: $data.activeTab === "pending_payment" ? 1 : "",
    g: common_vendor.o(($event) => $options.switchTab("pending_payment")),
    h: $data.activeTab === "pending_shipment" ? 1 : "",
    i: common_vendor.o(($event) => $options.switchTab("pending_shipment")),
    j: $data.activeTab === "pending_receipt" ? 1 : "",
    k: common_vendor.o(($event) => $options.switchTab("pending_receipt"))
  } : {}, {
    l: $data.order
  }, $data.order ? common_vendor.e({
    m: common_vendor.t($data.order.orderNo || $data.order.id),
    n: $data.order.createdAt
  }, $data.order.createdAt ? {
    o: common_vendor.t($options.formatTime($data.order.createdAt))
  } : {}, {
    p: $data.order.waybillNo
  }, $data.order.waybillNo ? {
    q: common_vendor.t($data.order.waybillNo),
    r: common_vendor.o(($event) => $options.copyWaybill($data.order.waybillNo))
  } : {}, {
    s: ($data.order.tracking || []).length
  }, ($data.order.tracking || []).length ? {
    t: common_vendor.f($data.logisticsCollapsed ? ($data.order.tracking || []).slice(0, 1) : $data.order.tracking, (ev, i, i0) => {
      return common_vendor.e({
        a: common_vendor.t(ev.status),
        b: common_vendor.t(ev.desc),
        c: common_vendor.t($options.formatTime(ev.time)),
        d: ev.place
      }, ev.place ? {
        e: common_vendor.t(ev.place)
      } : {}, {
        f: i
      });
    })
  } : {
    v: common_vendor.t($data.order.trackingMessage || "暂无物流信息")
  }, {
    w: common_vendor.t($data.logisticsCollapsed ? "▼" : "▲"),
    x: common_vendor.o((...args) => $options.toggleLogistics && $options.toggleLogistics(...args)),
    y: $data.order.mapUrl
  }, $data.order.mapUrl ? common_vendor.e({
    z: $data.isH5
  }, $data.isH5 ? {
    A: $data.order.mapUrl
  } : {
    B: $data.mapError ? "/static/logo.png" : $data.order.mapUrl,
    C: common_vendor.o(($event) => $options.openMap($data.order.mapUrl)),
    D: common_vendor.o((...args) => $options.onMapError && $options.onMapError(...args))
  }) : {}, {
    E: common_vendor.f($data.order.rooms, (r, k0, i0) => {
      return {
        a: common_vendor.t(r.name),
        b: common_vendor.t(r.roomTotal.toFixed(2)),
        c: common_vendor.f(r.items, (x, k1, i1) => {
          return {
            a: common_vendor.t(x.available_product_name),
            b: common_vendor.t(x.title),
            c: common_vendor.t(x.specTemp || "-"),
            d: common_vendor.t(x.specLength || "-"),
            e: common_vendor.t(x.price.toFixed(2)),
            f: common_vendor.t(x.quantity),
            g: x.id + "_" + x.specLength + "_" + x.specTemp
          };
        }),
        d: r.name
      };
    }),
    F: common_vendor.t($data.order.total.toFixed(2)),
    G: $data.order.status === "pending_receipt"
  }, $data.order.status === "pending_receipt" ? {
    H: common_vendor.o(($event) => $options.confirmReceipt($data.order.id))
  } : {}, {
    I: ["pending_payment", "pending_shipment"].includes($data.order.status)
  }, ["pending_payment", "pending_shipment"].includes($data.order.status) ? {
    J: common_vendor.o(($event) => $options.handleCancelOrder($data.order.id))
  } : {}, {
    K: common_vendor.o(($event) => $options.exportExcel($data.order))
  }) : common_vendor.e({
    L: $data.orders.length
  }, $data.orders.length ? {
    M: common_vendor.f($data.orders, (o, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(o.orderNo || o.id),
        b: o.createdAt
      }, o.createdAt ? {
        c: common_vendor.t($options.formatTime(o.createdAt))
      } : {}, {
        d: common_vendor.t(o.total.toFixed(2)),
        e: common_vendor.f($options.firstThumbs(o), (src, i, i1) => {
          return {
            a: i,
            b: src
          };
        }),
        f: o.status === "pending_receipt"
      }, o.status === "pending_receipt" ? {
        g: common_vendor.o(($event) => $options.confirmReceipt(o.orderNo || o.id), o.id)
      } : {}, {
        h: ["pending_payment", "pending_shipment"].includes(o.status)
      }, ["pending_payment", "pending_shipment"].includes(o.status) ? {
        i: common_vendor.o(($event) => $options.handleCancelOrder(o.orderNo || o.id), o.id)
      } : {}, {
        j: common_vendor.o(($event) => $options.openDetail(o.id), o.id),
        k: o.id
      });
    })
  } : {}));
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-17a44f9d"]]);
wx.createPage(MiniProgramPage);
