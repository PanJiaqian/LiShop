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
    /**
     * 将订单状态转换为页面可读的中文标签。
     * @param {string} status 订单状态标识
     * @returns {string} 用于界面展示的订单状态文案
     * @example
     * this.orderStatusLabel('pending_receipt')
     */
    orderStatusLabel(status) {
      try {
        const raw = String(status || "").trim();
        if (!raw)
          return "订单处理中";
        const normalized = raw.replace(/^OrderStatus\./, "").toLowerCase();
        const mapping = {
          pending_payment: "待付款",
          pending_shipment: "待发货",
          pending_receipt: "待收货",
          cancelled: "已取消",
          canceled: "已取消",
          completed: "已完成",
          shipped: "运输中",
          paid: "已支付",
          processing: "订单处理中"
        };
        return mapping[normalized] || mapping[raw] || raw;
      } catch (e) {
        return "订单处理中";
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
    /**
     * 将时间值格式化为订单页面统一显示格式。
     * @param {string|number|Date} t 原始时间值
     * @returns {string} 格式化后的时间字符串
     * @example
     * this.formatTime('2026-06-08T14:29:56')
     */
    formatTime(t) {
      try {
        const date = this.parseDateValue(t);
        if (!date)
          return t;
        return this.formatDateObject(date);
      } catch (e) {
        return t;
      }
    },
    /**
     * 解析接口返回的时间值，兼容 ISO 字符串与无时区时间字符串。
     * @param {string|number|Date} value 原始时间值
     * @returns {Date|null} 解析后的时间对象，失败时返回 null
     * @example
     * const date = this.parseDateValue('2026-06-08T14:29:56')
     */
    parseDateValue(value) {
      try {
        if (!value)
          return null;
        if (value instanceof Date) {
          return isNaN(value.getTime()) ? null : value;
        }
        const raw = String(value).split("`").join("").trim();
        if (!raw)
          return null;
        const directDate = new Date(raw);
        if (!isNaN(directDate.getTime()))
          return directDate;
        const match = raw.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[T\s](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?(?:\.(\d{1,3}))?)?$/);
        if (!match)
          return null;
        const year = match[1];
        const month = match[2];
        const day = match[3];
        const hour = match[4] || "0";
        const minute = match[5] || "0";
        const second = match[6] || "0";
        const millisecond = match[7] || "0";
        const msText = String(millisecond);
        const normalizedMs = (msText + "000").slice(0, 3);
        const parsedDate = new Date(
          Number(year),
          Number(month) - 1,
          Number(day),
          Number(hour),
          Number(minute),
          Number(second),
          Number(normalizedMs)
        );
        return isNaN(parsedDate.getTime()) ? null : parsedDate;
      } catch (e) {
        return null;
      }
    },
    /**
     * 将时间对象格式化为 yyyy-MM-dd HH:mm:ss。
     * @param {Date} date 时间对象
     * @returns {string} 格式化后的字符串
     * @example
     * this.formatDateObject(new Date())
     */
    formatDateObject(date) {
      const pad = function(num) {
        return num < 10 ? "0" + num : String(num);
      };
      return [
        date.getFullYear(),
        pad(date.getMonth() + 1),
        pad(date.getDate())
      ].join("-") + " " + [
        pad(date.getHours()),
        pad(date.getMinutes()),
        pad(date.getSeconds())
      ].join(":");
    },
    /**
     * 对金额执行两位小数舍入，避免浮点误差污染展示结果。
     * @param {number|string} amount 原始金额
     * @returns {number} 舍入后的金额
     * @example
     * this.roundCurrency(10.005)
     */
    roundCurrency(amount) {
      const num = Number(amount || 0);
      if (isNaN(num))
        return 0;
      return Math.round(num * 100) / 100;
    },
    /**
     * 获取对象自身可枚举属性值数组，兼容较旧的运行环境。
     * @param {Object} obj 原始对象
     * @returns {Array} 属性值数组
     * @example
     * const values = this.getObjectValues({ a: 1, b: 2 })
     */
    getObjectValues(obj) {
      const result = [];
      const source = obj || {};
      for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          result.push(source[key]);
        }
      }
      return result;
    },
    /**
     * 将房间小计与订单总额做轻量对齐，修正前端逐项求和带来的分角差。
     * @param {Array} rooms 房间列表
     * @param {number|string} totalPrice 订单总额
     * @returns {void} 直接修改 rooms 中的 roomTotal
     * @example
     * this.reconcileRoomTotals(order.rooms, order.total)
     */
    reconcileRoomTotals(rooms, totalPrice) {
      if (!Array.isArray(rooms) || !rooms.length)
        return;
      const safeTotal = this.roundCurrency(totalPrice);
      const currentTotal = this.roundCurrency(rooms.reduce((sum, room) => sum + Number(room.roomTotal || 0), 0));
      const diff = this.roundCurrency(safeTotal - currentTotal);
      if (!diff || Math.abs(diff) > 0.1)
        return;
      const targetRoom = rooms[rooms.length - 1];
      targetRoom.roomTotal = this.roundCurrency(Number(targetRoom.roomTotal || 0) + diff);
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
                        common_vendor.wx$1.openDocument({ filePath, showMenu: true });
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
            common_vendor.index.downloadFile({
              url,
              success: (dres) => {
                const filePath = dres && dres.tempFilePath;
                if (filePath) {
                  try {
                    if (typeof common_vendor.wx$1 !== "undefined" && typeof common_vendor.wx$1.openDocument === "function")
                      common_vendor.wx$1.openDocument({ filePath, showMenu: true });
                  } catch (e) {
                  }
                } else {
                  common_vendor.index.setClipboardData({ data: url, success: () => common_vendor.index.showToast({ title: "下载链接已复制", icon: "none" }) });
                }
              },
              fail: () => {
                common_vendor.index.setClipboardData({ data: url, success: () => common_vendor.index.showToast({ title: "下载链接已复制", icon: "none" }) });
              }
            });
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
    /**
     * 将后端订单接口数据转换为前端页面展示结构。
     * @param {Object} apiOrder 后端返回的订单对象
     * @returns {Object} 前端展示使用的订单对象
     * @example
     * const order = this.mapApiOrderToLocal(res.data)
     */
    mapApiOrderToLocal(apiOrder) {
      const roomsMap = {};
      const orderTotal = this.roundCurrency(apiOrder.total_amount ?? apiOrder.total_price ?? 0);
      const orderOriginalTotal = this.roundCurrency(apiOrder.original_total_amount ?? (apiOrder.total_price || 0));
      const items = apiOrder.items || [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const roomName = item.room_name || "默认房间";
        if (!roomsMap[roomName]) {
          roomsMap[roomName] = { name: roomName, roomTotal: 0, items: [] };
        }
        const quantity = Number(item.quantity || 0) || 0;
        const lineTotal = this.roundCurrency(item.detail_total_price ?? item.line_total_price ?? 0);
        const fallbackUnitPrice = quantity > 0 ? this.roundCurrency(lineTotal / quantity) : 0;
        const price = this.roundCurrency(item.unit_price ?? item.price ?? fallbackUnitPrice);
        const originalLineTotal = this.roundCurrency(item.original_detail_total_price ?? item.original_price ?? lineTotal);
        const fallbackOriginalUnitPrice = quantity > 0 ? this.roundCurrency(originalLineTotal / quantity) : 0;
        const originalUnitPrice = this.roundCurrency(item.original_unit_price ?? fallbackOriginalUnitPrice);
        const couponDiscountAmount = this.roundCurrency(item.coupon_discount_amount ?? Math.max(0, originalLineTotal - lineTotal));
        const localItem = {
          title: item.product_name || item.available_product_name,
          available_product_name: item.available_product_name || "",
          id: item.product_id || item.available_product_id,
          specTemp: item.color_temperature && item.color_temperature !== "None" && item.color_temperature !== "无" ? item.color_temperature : "",
          specLength: item.length,
          price,
          quantity,
          lineTotal: this.roundCurrency(lineTotal || price * quantity || 0),
          originalUnitPrice,
          originalLineTotal,
          couponDiscountAmount,
          showOriginalPrice: originalLineTotal > this.roundCurrency(lineTotal || 0),
          image: String(item.main_picture || "").split("`").join("").trim(),
          productNote: item.product_note || "",
          itemNumber: item.item_number || "",
          nuomiItemNumber: item.nuomi_item_number || "",
          packageFee: Number(item.package_fee || 0),
          packageFeeGroupKey: item.package_fee_group_key || "",
          packageFeeSelectedPackageId: item.package_fee_selected_package_id || "",
          packageFeeIsGroupOwner: Number(item.package_fee_is_group_owner || 0) || 0
        };
        roomsMap[roomName].items.push(localItem);
        roomsMap[roomName].roomTotal = this.roundCurrency(roomsMap[roomName].roomTotal + lineTotal);
      }
      const rooms = this.getObjectValues(roomsMap);
      this.reconcileRoomTotals(rooms, orderTotal);
      const roomsOriginalTotal = this.roundCurrency(rooms.reduce((sum, room) => {
        const roomItems = Array.isArray(room.items) ? room.items : [];
        return sum + roomItems.reduce((itemSum, current) => itemSum + Number(current.originalLineTotal || 0), 0);
      }, 0));
      const tracking = [];
      let rawList = [];
      let trackingMessage = "";
      let mapUrl = "";
      try {
        const last = apiOrder && apiOrder.logistics_data && apiOrder.logistics_data.lastResult;
        rawList = last && Array.isArray(last.data) ? last.data : [];
        trackingMessage = last && (last.message || last.msg) || apiOrder && apiOrder.logistics_message || "";
        mapUrl = last && last.trailUrl ? String(last.trailUrl).split("`").join("").trim() : "";
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
        createdAt: apiOrder.created_at || null,
        total: orderTotal,
        originalTotal: orderOriginalTotal > 0 ? orderOriginalTotal : roomsOriginalTotal > 0 ? roomsOriginalTotal : orderTotal,
        totalPackageFee: Number(apiOrder.total_package_fee || 0),
        coupon_record_id: apiOrder.coupon_record_id || "",
        coupon_discount_amount: Number(apiOrder.coupon_discount_amount || 0),
        waybillNo: apiOrder && apiOrder.tracking_number || apiOrder && apiOrder.logistics_data && apiOrder.logistics_data.lastResult && apiOrder.logistics_data.lastResult.nu || "",
        tracking,
        trackingMessage: tracking.length ? "" : trackingMessage || "",
        mapUrl,
        status: apiOrder.status || "unknown",
        rooms
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
                try {
                  const mapped = this.mapApiOrderToLocal(o);
                  if (mapped)
                    allOrders.push(mapped);
                } catch (mapErr) {
                  common_vendor.index.__f__("error", "at pages/order/index.vue:889", "Map order error:", o.order_id, mapErr);
                }
              }
            });
          }
        } catch (e) {
          common_vendor.index.__f__("error", "at pages/order/index.vue:895", "fetchOrders error:", e);
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
          try {
            this.order = this.mapApiOrderToLocal(res.data);
            if (this.order && (!this.order.status || this.order.status === "unknown") && this.detailStatusHint) {
              this.order.status = this.detailStatusHint;
            }
          } catch (err) {
            common_vendor.index.__f__("error", "at pages/order/index.vue:912", "Detail map error:", err);
          }
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/order/index.vue:916", "fetchDetail error:", e);
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
    p: common_vendor.t($options.orderStatusLabel($data.order.status)),
    q: common_vendor.t($data.order.total.toFixed(2)),
    r: $data.order.originalTotal > $data.order.total
  }, $data.order.originalTotal > $data.order.total ? {
    s: common_vendor.t($data.order.originalTotal.toFixed(2))
  } : {}, {
    t: ($data.order.tracking || []).length
  }, ($data.order.tracking || []).length ? {} : {}, {
    v: $data.order.waybillNo
  }, $data.order.waybillNo ? common_vendor.e({
    w: $data.order.waybillNo
  }, $data.order.waybillNo ? {
    x: common_vendor.t($data.order.waybillNo),
    y: common_vendor.o(($event) => $options.copyWaybill($data.order.waybillNo))
  } : {}) : {}, {
    z: ($data.order.tracking || []).length
  }, ($data.order.tracking || []).length ? {
    A: common_vendor.f($data.logisticsCollapsed ? ($data.order.tracking || []).slice(0, 1) : $data.order.tracking, (ev, i, i0) => {
      return {
        a: common_vendor.t(ev.status),
        b: common_vendor.t($options.formatTime(ev.time)),
        c: common_vendor.t(ev.desc),
        d: i
      };
    })
  } : {
    B: common_vendor.t($data.order.trackingMessage || "商家发货后，这里会显示物流轨迹和配送进度")
  }, {
    C: ($data.order.tracking || []).length > 1
  }, ($data.order.tracking || []).length > 1 ? {
    D: common_vendor.t($data.logisticsCollapsed ? "展开更多物流明细 ▼" : "收起物流明细 ▲"),
    E: common_vendor.o((...args) => $options.toggleLogistics && $options.toggleLogistics(...args))
  } : {}, {
    F: $data.order.mapUrl
  }, $data.order.mapUrl ? common_vendor.e({
    G: $data.isH5
  }, $data.isH5 ? {
    H: $data.order.mapUrl
  } : common_vendor.e({
    I: $options.hasMapCoords($data.order.tracking)
  }, $options.hasMapCoords($data.order.tracking) ? {
    J: $options.mapCenter($data.order.tracking).latitude,
    K: $options.mapCenter($data.order.tracking).longitude,
    L: $options.mapMarkers($data.order.tracking),
    M: $options.mapPolyline($data.order.tracking)
  } : $options.isImageLink($data.order.mapUrl) ? {
    O: $data.mapError ? "/static/logo.png" : $data.order.mapUrl,
    P: common_vendor.o(($event) => $options.openMap($data.order.mapUrl)),
    Q: common_vendor.o((...args) => $options.onMapError && $options.onMapError(...args))
  } : {
    R: common_vendor.o(($event) => $options.openMap($data.order.mapUrl))
  }, {
    N: $options.isImageLink($data.order.mapUrl)
  })) : {}, {
    S: common_vendor.f($data.order.rooms, (r, k0, i0) => {
      return {
        a: common_vendor.t(r.name),
        b: common_vendor.t(r.roomTotal.toFixed(2)),
        c: common_vendor.f(r.items, (x, index, i1) => {
          return common_vendor.e({
            a: common_vendor.t(x.available_product_name),
            b: x.title
          }, x.title ? {
            c: common_vendor.t(x.title)
          } : {}, {
            d: common_vendor.t(x.specTemp || "-"),
            e: common_vendor.t(x.specLength || "-"),
            f: x.itemNumber
          }, x.itemNumber ? {
            g: common_vendor.t(x.itemNumber)
          } : {}, {
            h: x.nuomiItemNumber
          }, x.nuomiItemNumber ? {
            i: common_vendor.t(x.nuomiItemNumber)
          } : {}, {
            j: x.productNote
          }, x.productNote ? {
            k: common_vendor.t(x.productNote)
          } : {}, {
            l: x.packageFee > 0 || x.couponDiscountAmount > 0
          }, x.packageFee > 0 || x.couponDiscountAmount > 0 ? common_vendor.e({
            m: x.packageFee > 0
          }, x.packageFee > 0 ? {
            n: common_vendor.t(Number(x.packageFee).toFixed(2))
          } : {}, {
            o: x.couponDiscountAmount > 0
          }, x.couponDiscountAmount > 0 ? {
            p: common_vendor.t(x.couponDiscountAmount.toFixed(2))
          } : {}) : {}, {
            q: common_vendor.t(x.price.toFixed(2)),
            r: x.showOriginalPrice
          }, x.showOriginalPrice ? {
            s: common_vendor.t(x.originalUnitPrice.toFixed(2))
          } : {}, {
            t: common_vendor.t(x.quantity),
            v: common_vendor.t(x.lineTotal.toFixed(2)),
            w: x.id + "_" + index
          });
        }),
        d: r.name
      };
    }),
    T: $data.order.originalTotal > $data.order.total
  }, $data.order.originalTotal > $data.order.total ? {
    U: common_vendor.t($data.order.originalTotal.toFixed(2))
  } : {}, {
    V: $data.order.totalPackageFee > 0
  }, $data.order.totalPackageFee > 0 ? {
    W: common_vendor.t(Number($data.order.totalPackageFee).toFixed(2))
  } : {}, {
    X: $data.order.coupon_discount_amount > 0
  }, $data.order.coupon_discount_amount > 0 ? {
    Y: common_vendor.t(Number($data.order.coupon_discount_amount).toFixed(2))
  } : {}, {
    Z: common_vendor.t($data.order.total.toFixed(2)),
    aa: $data.order.originalTotal > $data.order.total
  }, $data.order.originalTotal > $data.order.total ? {
    ab: common_vendor.t($data.order.originalTotal.toFixed(2))
  } : {}, {
    ac: $options.isPendingReceipt($data.order.status)
  }, $options.isPendingReceipt($data.order.status) ? {
    ad: common_vendor.o(($event) => $options.confirmReceipt($data.order.id))
  } : {}, {
    ae: ["pending_payment", "pending_shipment"].includes($data.order.status)
  }, ["pending_payment", "pending_shipment"].includes($data.order.status) ? {
    af: common_vendor.o(($event) => $options.handleCancelOrder($data.order.id))
  } : {}, {
    ag: common_vendor.o(($event) => $options.exportExcel($data.order))
  }) : common_vendor.e({
    ah: $data.orders.length
  }, $data.orders.length ? {
    ai: common_vendor.f($data.orders, (o, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(o.orderNo || o.id),
        b: o.createdAt
      }, o.createdAt ? {
        c: common_vendor.t($options.formatTime(o.createdAt))
      } : {}, {
        d: common_vendor.f($options.firstThumbs(o), (src, i, i1) => {
          return {
            a: i,
            b: src
          };
        }),
        e: common_vendor.t($options.orderStatusLabel(o.status)),
        f: common_vendor.t(o.total.toFixed(2)),
        g: o.originalTotal > o.total
      }, o.originalTotal > o.total ? {
        h: common_vendor.t(o.originalTotal.toFixed(2))
      } : {}, {
        i: o.coupon_discount_amount > 0
      }, o.coupon_discount_amount > 0 ? {
        j: common_vendor.t(Number(o.coupon_discount_amount).toFixed(2))
      } : {}, {
        k: o.totalPackageFee > 0
      }, o.totalPackageFee > 0 ? {
        l: common_vendor.t(Number(o.totalPackageFee).toFixed(2))
      } : {}, {
        m: o.status === "pending_receipt"
      }, o.status === "pending_receipt" ? {
        n: common_vendor.o(($event) => $options.confirmReceipt(o.orderNo || o.id), o.id)
      } : {}, {
        o: ["pending_payment", "pending_shipment"].includes(o.status)
      }, ["pending_payment", "pending_shipment"].includes(o.status) ? {
        p: common_vendor.o(($event) => $options.handleCancelOrder(o.orderNo || o.id), o.id)
      } : {}, {
        q: common_vendor.o(($event) => $options.openDetail(o.id, o.status), o.id),
        r: o.id
      });
    })
  } : {}), {
    aj: $data.showOnboarding
  }, $data.showOnboarding ? {
    ak: common_vendor.o($options.handleOnboardingNext),
    al: common_vendor.o($options.handleOnboardingPrev),
    am: common_vendor.o($options.closeOnboarding),
    an: common_vendor.p({
      steps: $data.onboardingSteps,
      targets: $data.onboardingRects,
      initialIndex: $data.onboardingIndex
    })
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-17a44f9d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/order/index.js.map
