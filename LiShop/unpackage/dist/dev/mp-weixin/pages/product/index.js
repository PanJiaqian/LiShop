"use strict";
const common_vendor = require("../../common/vendor.js");
const api_index = require("../../api/index.js");
const RoomSelector = () => "../../components/RoomSelector.js";
const FloatingNav = () => "../../components/FloatingNav.js";
const Skeleton = () => "../../components/Skeleton.js";
const _sfc_main = {
  components: { RoomSelector, FloatingNav, Skeleton },
  data() {
    return { hls: null, product: null, current: 0, qty: 1, specTemp: "", specLength: "", roomName: "", roomId: "", roomsRaw: [], mpSheet: false, mpRoomSheet: false, mpTemp: "", mpLength: "", mpRoom: "", mpQty: 1, specs: [], specsLoading: false, roomSheet: false, roomsList: [], roomInput: "", selectedSpecIndex: -1, isSpecsCollapsed: true, lockScroll: false, lockScrollTop: 0, roomSelectorVisible: false, roomSelectorMode: "h5", addresses: [], selectedAddress: null, h5OrderNote: "", isFavorite: false };
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
      this.fetchSpecs(base.id);
    }).catch(() => {
      this.product = { id, title: "商品 " + id, price: 0, sales: 0, shipping_origin: "", image: "/static/logo.png", images: ["/static/logo.png"] };
      this.fetchSpecs(id);
    });
  },
  computed: {
    selectorType() {
      return this.roomSelectorMode === "addr" ? "addr" : "room";
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
      return src && !src.includes(".m3u8") ? src : "";
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
      const basePerM = sel ? Number(sel.price || 0) || 0 : Number(((_a = this.product) == null ? void 0 : _a.price) || 0) || 0;
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
    }
  },
  watch: {
    currentImage: {
      handler(val) {
        this.initHls(val);
      },
      immediate: true
    }
  },
  beforeDestroy() {
    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }
  },
  onShow() {
    this.loadAddresses();
  },
  methods: {
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
          specification: it.specification || ""
        }));
      }).catch(() => {
        this.specs = [];
      }).finally(() => {
        this.specsLoading = false;
        this.selectedSpecIndex = Array.isArray(this.specs) && this.specs.length > 0 ? 0 : -1;
      });
    },
    selectSpec(index) {
      if (this.selectedSpecIndex === index)
        return;
      this.selectedSpecIndex = index;
    },
    addToCart() {
      var _a;
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
      this.qty += 1;
    },
    decQty() {
      this.qty = Math.max(1, this.qty - 1);
    },
    addToCartWithQty() {
      var _a;
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
      api_index.addCartItem({ room_id: this.roomId, product_id: pid, length: lengthNum, quantity: this.qty, color: this.specTemp || "", note: "" }).then((res) => {
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
      api_index.addCartItem({ room_id: rid, product_id: pid, length: lengthVal, quantity: this.mpQty, color: this.mpTemp || "", note: "" }).then((res) => {
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
  (_component_Skeleton + _component_RoomSelector)();
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
        b: item
      } : {
        c: item
      }, {
        d: index
      });
    }),
    d: common_vendor.t($data.product.title),
    e: common_vendor.t($data.isFavorite ? "★" : "☆"),
    f: $data.isFavorite ? 1 : "",
    g: common_vendor.o((...args) => $options.favProduct && $options.favProduct(...args)),
    h: common_vendor.t($data.product.price.toFixed(2)),
    i: common_vendor.t($data.product.sales),
    j: common_vendor.t($data.product.id || "默认款"),
    k: common_vendor.t($data.product.title),
    l: common_vendor.t($data.product.shipping_origin ? $data.product.shipping_origin.replace(/省|市/g, "") : "—"),
    m: common_vendor.t($data.product.price.toFixed(2)),
    n: common_vendor.f($data.product.details_images, (src, i, i0) => {
      return {
        a: "md" + i,
        b: src
      };
    }),
    o: common_vendor.o((...args) => $options.openSpecSheet && $options.openSpecSheet(...args)),
    p: $data.mpSheet
  }, $data.mpSheet ? common_vendor.e({
    q: $data.selectedAddress
  }, $data.selectedAddress ? {
    r: common_vendor.t($data.selectedAddress.receiver),
    s: common_vendor.t($data.selectedAddress.phone)
  } : {}, {
    t: $data.selectedAddress
  }, $data.selectedAddress ? {
    v: common_vendor.t($data.selectedAddress.province),
    w: common_vendor.t($data.selectedAddress.city),
    x: common_vendor.t($data.selectedAddress.district),
    y: common_vendor.t($data.selectedAddress.detail_address)
  } : {}, {
    z: common_vendor.o((...args) => $options.openMpAddressSheet && $options.openMpAddressSheet(...args)),
    A: $data.specsLoading
  }, $data.specsLoading ? {} : $data.specs && $data.specs.length ? common_vendor.e({
    C: common_vendor.f($data.isSpecsCollapsed ? $data.specs.slice(0, 2) : $data.specs, (it, i, i0) => {
      return common_vendor.e({
        a: it.image_url || "/static/logo.png",
        b: common_vendor.t(it.name),
        c: common_vendor.t(Number(it.price || 0).toFixed(2)),
        d: Number(it.original_price) > 0
      }, Number(it.original_price) > 0 ? {
        e: common_vendor.t(Number(it.original_price).toFixed(2))
      } : {}, {
        f: common_vendor.t(it.unit || "—"),
        g: "mpsp" + i,
        h: $data.selectedSpecIndex === i ? 1 : "",
        i: common_vendor.o(($event) => $options.selectSpec(i), "mpsp" + i)
      });
    }),
    D: $data.specs.length > 3
  }, $data.specs.length > 3 ? {
    E: common_vendor.t($data.isSpecsCollapsed ? "展开更多" : "收起"),
    F: common_vendor.t($data.isSpecsCollapsed ? "▼" : "▲"),
    G: common_vendor.o(($event) => $data.isSpecsCollapsed = !$data.isSpecsCollapsed)
  } : {}) : {}, {
    B: $data.specs && $data.specs.length,
    H: common_vendor.t($data.mpRoom || "请选择房间"),
    I: common_vendor.o((...args) => $options.openMpRoomSheet && $options.openMpRoomSheet(...args)),
    J: $options.selectedSpec && $options.selectedSpec.has_length === 1
  }, $options.selectedSpec && $options.selectedSpec.has_length === 1 ? common_vendor.e({
    K: $data.mpLength,
    L: common_vendor.o(($event) => $data.mpLength = $event.detail.value),
    M: $options.selectedSpec.length_unit
  }, $options.selectedSpec.length_unit ? {
    N: common_vendor.t($options.selectedSpec.length_unit)
  } : {}) : {}, {
    O: $data.mpQty,
    P: common_vendor.o(($event) => $data.mpQty = $event.detail.value),
    Q: common_vendor.o((...args) => $options.closeSpecSheet && $options.closeSpecSheet(...args)),
    R: common_vendor.o((...args) => $options.confirmSpecToCart && $options.confirmSpecToCart(...args)),
    S: common_vendor.o(() => {
    }),
    T: common_vendor.o((...args) => $options.closeSpecSheet && $options.closeSpecSheet(...args)),
    U: common_vendor.o(() => {
    })
  }) : {}) : {}, {
    V: common_vendor.o($options.closeRoomSheet),
    W: common_vendor.o($options.onRoomSelect),
    X: common_vendor.o($options.onRoomCreate),
    Y: common_vendor.o($options.onCreateAddress),
    Z: common_vendor.p({
      visible: $data.roomSelectorVisible,
      rooms: $options.selectorRooms,
      type: $options.selectorType,
      selectedName: $options.selectorSelectedName
    }),
    aa: $data.mpSheet || $data.roomSelectorVisible ? 1 : ""
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-a911e391"]]);
wx.createPage(MiniProgramPage);
