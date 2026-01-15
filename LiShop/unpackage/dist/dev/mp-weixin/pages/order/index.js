"use strict";
const common_vendor = require("../../common/vendor.js");
const api_index = require("../../api/index.js");
const common_assets = require("../../common/assets.js");
const FloatingNav = () => "../../components/FloatingNav.js";
const Skeleton = () => "../../components/Skeleton.js";
const OnboardingGuide = () => "../../components/OnboardingGuide.js";
const _sfc_main = {
  components: { FloatingNav, Skeleton, OnboardingGuide },
  data() {
    return { order: null, orders: [], activeTab: "all", loading: true, logisticsCollapsed: true, isH5: false, mapError: false, detailStatusHint: "", showOnboarding: false, onboardingRects: [], onboardingSteps: [], onboardingIndex: 0 };
  },
  onLoad(query) {
    const id = query == null ? void 0 : query.id;
    try {
      this.isH5 = typeof window !== "undefined";
    } catch (e) {
      this.isH5 = false;
    }
    const status = query == null ? void 0 : query.status;
    if (status) {
      this.detailStatusHint = String(status);
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
          this.refreshOnboardingRect(sel);
        });
      }
    } catch (e) {
    }
  },
  methods: {
    refreshOnboardingRect(sel) {
      const total = this.onboardingSteps.length || 0;
      const arr = new Array(total).fill(null);
      if (this.isH5) {
        const el = typeof document !== "undefined" ? document.querySelector(sel) : null;
        if (el) {
          const r = el.getBoundingClientRect();
          arr[this.onboardingIndex] = { left: r.left, top: r.top, width: r.width, height: r.height };
          this.onboardingRects = arr;
          this.showOnboarding = true;
        }
      } else {
        const tryMp = (attempt = 0) => {
          const q = common_vendor.index.createSelectorQuery().in(this);
          q.select(sel).boundingClientRect();
          q.exec((res) => {
            const r = (res || [])[0];
            if (r) {
              arr[this.onboardingIndex] = { left: r.left, top: r.top, width: r.width, height: r.height };
              this.onboardingRects = arr;
              this.showOnboarding = true;
            } else if (attempt < 3) {
              setTimeout(() => tryMp(attempt + 1), 140);
            }
          });
        };
        tryMp(0);
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
          common_vendor.index.setStorageSync("onboarding_target_selector", "#og-product-add");
          common_vendor.index.navigateTo({ url: "/pages/product/index" });
          return;
        }
        if (idx === 6) {
          common_vendor.index.setStorageSync("onboarding_target_selector", "#og-room-modal-list");
          common_vendor.index.navigateTo({ url: "/pages/product/index" });
          return;
        }
        if (idx === 7) {
          this.$nextTick(() => {
            this.refreshOnboardingRect("#og-order-tabs");
          });
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
          common_vendor.index.setStorageSync("onboarding_target_selector", "#og-product-add");
          common_vendor.index.navigateTo({ url: "/pages/product/index" });
          return;
        }
        if (idx === 5) {
          common_vendor.index.setStorageSync("onboarding_target_selector", "#og-room-modal-list");
          common_vendor.index.navigateTo({ url: "/pages/product/index" });
          return;
        }
        if (idx === 6) {
          common_vendor.index.setStorageSync("onboarding_target_selector", "#og-profile-info");
          if (common_vendor.index.switchTab)
            common_vendor.index.switchTab({ url: "/pages/profile/index" });
          else
            common_vendor.index.navigateTo({ url: "/pages/profile/index" });
          return;
        }
        if (idx === 7) {
          common_vendor.index.setStorageSync("onboarding_target_selector", "#og-profile-menu");
          if (common_vendor.index.switchTab)
            common_vendor.index.switchTab({ url: "/pages/profile/index" });
          else
            common_vendor.index.navigateTo({ url: "/pages/profile/index" });
          return;
        }
        if (idx === 8) {
          common_vendor.index.setStorageSync("onboarding_target_selector", "#og-profile-addr");
          if (common_vendor.index.switchTab)
            common_vendor.index.switchTab({ url: "/pages/profile/index" });
          else
            common_vendor.index.navigateTo({ url: "/pages/profile/index" });
          return;
        }
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
          common_vendor.index.setStorageSync("onboarding_target_selector", "#og-product-add");
          common_vendor.index.navigateTo({ url: "/pages/product/index" });
          return;
        }
        if (idx === 6) {
          common_vendor.index.setStorageSync("onboarding_target_selector", "#og-room-modal-list");
          common_vendor.index.navigateTo({ url: "/pages/product/index" });
          return;
        }
        if (idx === 7) {
          this.$nextTick(() => {
            this.refreshOnboardingRect("#og-order-tabs");
          });
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
          common_vendor.index.setStorageSync("onboarding_target_selector", "#og-product-add");
          common_vendor.index.navigateTo({ url: "/pages/product/index" });
          return;
        }
        if (idx === 5) {
          common_vendor.index.setStorageSync("onboarding_target_selector", "#og-room-modal-list");
          common_vendor.index.navigateTo({ url: "/pages/product/index" });
          return;
        }
        if (idx === 6) {
          common_vendor.index.setStorageSync("onboarding_target_selector", "#og-profile-info");
          if (common_vendor.index.switchTab)
            common_vendor.index.switchTab({ url: "/pages/profile/index" });
          else
            common_vendor.index.navigateTo({ url: "/pages/profile/index" });
          return;
        }
        if (idx === 7) {
          common_vendor.index.setStorageSync("onboarding_target_selector", "#og-profile-menu");
          if (common_vendor.index.switchTab)
            common_vendor.index.switchTab({ url: "/pages/profile/index" });
          else
            common_vendor.index.navigateTo({ url: "/pages/profile/index" });
          return;
        }
        if (idx === 8) {
          common_vendor.index.setStorageSync("onboarding_target_selector", "#og-profile-addr");
          if (common_vendor.index.switchTab)
            common_vendor.index.switchTab({ url: "/pages/profile/index" });
          else
            common_vendor.index.navigateTo({ url: "/pages/profile/index" });
          return;
        }
      }
    },
    isImageLink(url) {
      try {
        return /\.(png|jpg|jpeg|gif|bmp|webp)(\?.*)?$/i.test(String(url || ""));
      } catch (e) {
        return false;
      }
    },
    onMapError() {
      this.mapError = true;
      try {
        common_vendor.index.showToast({ title: "物流地图加载失败", icon: "none" });
      } catch (e) {
      }
    },
    isPendingReceipt(status) {
      try {
        const s = String(status || "");
        return s === "pending_receipt" || s.includes("待收货");
      } catch (e) {
        return false;
      }
    },
    formatTime(t) {
      try {
        let dateStr = t;
        if (typeof dateStr === "string") {
          dateStr = dateStr.replace(/-/g, "/");
        }
        return new Date(dateStr).toLocaleString();
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
    openDetail(id, status) {
      const qs = status ? "&status=" + encodeURIComponent(status) : "";
      common_vendor.index.navigateTo({ url: "/pages/order/index?id=" + id + qs });
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
        common_vendor.index.showLoading({ title: "请求导出" });
        const res = await api_index.exportOrderExcel({ order_id: order.id });
        common_vendor.index.hideLoading();
        if (res.success) {
          const msg = res.message || "导出请求已发送";
          common_vendor.index.showToast({ title: msg, icon: "success" });
          if (res.blob) {
            try {
              const fs = typeof common_vendor.wx$1 !== "undefined" && typeof common_vendor.wx$1.getFileSystemManager === "function" ? common_vendor.wx$1.getFileSystemManager() : null;
              const base = typeof common_vendor.wx$1 !== "undefined" && common_vendor.wx$1.env && common_vendor.wx$1.env.USER_DATA_PATH ? common_vendor.wx$1.env.USER_DATA_PATH : common_vendor.index && common_vendor.index.env && common_vendor.index.env.USER_DATA_PATH ? common_vendor.index.env.USER_DATA_PATH : "";
              const fname = res.filename || "订单导出.xlsx";
              const filePath = base ? base + "/" + fname : fname;
              if (fs && filePath) {
                fs.writeFile({
                  filePath,
                  data: res.blob,
                  success: () => {
                    common_vendor.index.showToast({ title: "文件已保存", icon: "success" });
                    try {
                      if (typeof common_vendor.wx$1 !== "undefined" && typeof common_vendor.wx$1.openDocument === "function")
                        common_vendor.wx$1.openDocument({ filePath });
                    } catch (e) {
                    }
                  },
                  fail: () => {
                    common_vendor.index.showToast({ title: "文件保存失败", icon: "none" });
                  }
                });
                return;
              }
            } catch (e) {
            }
          }
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
        let lat = null;
        let lng = null;
        const ac = ev.areaCenter || ev.area_center || "";
        if (ac) {
          const parts = String(ac).split(",");
          if (parts.length >= 2) {
            lng = Number(parts[0]);
            lat = Number(parts[1]);
          }
        }
        tracking.push({
          status: ev.status || "",
          desc: ev.context || "",
          time: ev.ftime || ev.time || "",
          place: ev.areaName || ev.location || "",
          lat,
          lng
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
          if (this.order && (!this.order.status || this.order.status === "unknown") && this.detailStatusHint) {
            this.order.status = this.detailStatusHint;
          }
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
      if (url.indexOf("http") === 0) {
        common_vendor.index.navigateTo({ url: "/pages/webview/index?url=" + encodeURIComponent(url) });
        return;
      }
      try {
        common_vendor.index.setClipboardData({ data: String(url) });
        common_vendor.index.showToast({ title: "链接已复制", icon: "none" });
      } catch (e) {
      }
    },
    hasMapCoords(list) {
      try {
        return Array.isArray(list) && list.some((it) => it && typeof it.lat === "number" && typeof it.lng === "number");
      } catch (e) {
        return false;
      }
    },
    mapCenter(list) {
      try {
        const arr = (Array.isArray(list) ? list : []).filter((it) => typeof it.lat === "number" && typeof it.lng === "number");
        if (!arr.length)
          return { latitude: 0, longitude: 0 };
        const last = arr[arr.length - 1];
        return { latitude: last.lat, longitude: last.lng };
      } catch (e) {
        return { latitude: 0, longitude: 0 };
      }
    },
    mapMarkers(list) {
      try {
        const arr = (Array.isArray(list) ? list : []).filter((it) => typeof it.lat === "number" && typeof it.lng === "number");
        return arr.map((it, i) => ({ id: i, latitude: it.lat, longitude: it.lng }));
      } catch (e) {
        return [];
      }
    },
    mapPolyline(list) {
      try {
        const pts = (Array.isArray(list) ? list : []).filter((it) => typeof it.lat === "number" && typeof it.lng === "number").map((it) => ({ latitude: it.lat, longitude: it.lng }));
        return pts.length > 1 ? [{ points: pts, color: "#FF4D4F", width: 4 }] : [];
      } catch (e) {
        return [];
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
    }
  }
};
if (!Array) {
  const _component_Skeleton = common_vendor.resolveComponent("Skeleton");
  const _component_OnboardingGuide = common_vendor.resolveComponent("OnboardingGuide");
  (_component_Skeleton + _component_OnboardingGuide)();
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
      return {
        a: common_vendor.t(ev.status),
        b: common_vendor.t($options.formatTime(ev.time)),
        c: common_vendor.t(ev.desc),
        d: i
      };
    })
  } : {
    v: common_vendor.t($data.order.trackingMessage || "暂无物流信息")
  }, {
    w: common_vendor.t($data.logisticsCollapsed ? "展开更多物流明细 ▼" : "收起物流明细 ▲"),
    x: common_vendor.o((...args) => $options.toggleLogistics && $options.toggleLogistics(...args)),
    y: $data.order.mapUrl
  }, $data.order.mapUrl ? common_vendor.e({
    z: $data.isH5
  }, $data.isH5 ? {
    A: $data.order.mapUrl
  } : common_vendor.e({
    B: $options.hasMapCoords($data.order.tracking)
  }, $options.hasMapCoords($data.order.tracking) ? {
    C: $options.mapCenter($data.order.tracking).latitude,
    D: $options.mapCenter($data.order.tracking).longitude,
    E: $options.mapMarkers($data.order.tracking),
    F: $options.mapPolyline($data.order.tracking)
  } : $options.isImageLink($data.order.mapUrl) ? {
    H: $data.mapError ? "/static/logo.png" : $data.order.mapUrl,
    I: common_vendor.o(($event) => $options.openMap($data.order.mapUrl)),
    J: common_vendor.o((...args) => $options.onMapError && $options.onMapError(...args))
  } : {
    K: common_vendor.o(($event) => $options.openMap($data.order.mapUrl))
  }, {
    G: $options.isImageLink($data.order.mapUrl)
  })) : {}, {
    L: common_vendor.f($data.order.rooms, (r, k0, i0) => {
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
    M: common_vendor.t($data.order.total.toFixed(2)),
    N: $options.isPendingReceipt($data.order.status)
  }, $options.isPendingReceipt($data.order.status) ? {
    O: common_vendor.o(($event) => $options.confirmReceipt($data.order.id))
  } : {}, {
    P: ["pending_payment", "pending_shipment"].includes($data.order.status)
  }, ["pending_payment", "pending_shipment"].includes($data.order.status) ? {
    Q: common_vendor.o(($event) => $options.handleCancelOrder($data.order.id))
  } : {}, {
    R: common_vendor.o(($event) => $options.exportExcel($data.order))
  }) : common_vendor.e({
    S: $data.orders.length
  }, $data.orders.length ? {
    T: common_vendor.f($data.orders, (o, k0, i0) => {
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
        j: common_vendor.o(($event) => $options.openDetail(o.id, o.status), o.id),
        k: o.id
      });
    })
  } : {}), {
    U: $data.showOnboarding
  }, $data.showOnboarding ? {
    V: common_vendor.o($options.handleOnboardingNext),
    W: common_vendor.o($options.handleOnboardingPrev),
    X: common_vendor.o($options.closeOnboarding),
    Y: common_vendor.p({
      steps: $data.onboardingSteps,
      targets: $data.onboardingRects,
      initialIndex: $data.onboardingIndex
    })
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-17a44f9d"]]);
wx.createPage(MiniProgramPage);
