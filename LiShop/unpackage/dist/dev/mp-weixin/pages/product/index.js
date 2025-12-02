"use strict";
const common_vendor = require("../../common/vendor.js");
const api_index = require("../../api/index.js");
const _sfc_main = {
  data() {
    return { product: null, current: 0, qty: 1, specTemp: "", specLength: "", roomName: "", roomId: "", roomsRaw: [], mpSheet: false, mpRoomSheet: false, mpTemp: "", mpLength: "", mpRoom: "", mpQty: 1, specs: [], specsLoading: false, roomSheet: false, roomsList: [], roomInput: "", selectedSpecIndex: -1, isSpecsCollapsed: true };
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
      const imgs = arr(d.images);
      const price = Number(d.price ?? 0) || 0;
      const base = {
        id: d.available_product_id || id,
        title: d.name || "商品 " + id,
        price,
        sales: 0,
        shipping_origin: clean(d.shipping_origin) || "",
        image: main[0] || "/static/logo.png",
        images: imgs.length ? imgs : main.length ? main : ["/static/logo.png"]
      };
      this.product = base;
      this.fetchSpecs(base.id);
    }).catch(() => {
      this.product = { id, title: "商品 " + id, price: 0, sales: 0, shipping_origin: "", image: "/static/logo.png", images: ["/static/logo.png"] };
      this.fetchSpecs(id);
    });
  },
  computed: {
    images() {
      var _a;
      const imgs = this.product && this.product.images || [];
      return imgs.length ? imgs : [((_a = this.product) == null ? void 0 : _a.image) || "/static/logo.png"];
    },
    currentImage() {
      const arr = this.images;
      return arr[this.current] || arr[0];
    }
  },
  methods: {
    // 获取规格明细（按产品ID），适配返回 data.children
    fetchSpecs(availId) {
      if (!availId)
        return;
      this.specsLoading = true;
      const clean = (u) => typeof u === "string" ? u.replace(/`/g, "").trim() : "";
      api_index.getProductSpecs({ available_product_id: availId }).then((res) => {
        const children = res && res.data && Array.isArray(res.data.children) ? res.data.children : Array.isArray(res == null ? void 0 : res.children) ? res.children : [];
        this.specs = (children || []).map((it) => ({
          product_id: it.product_id || "",
          name: it.name || "",
          unit: it.unit || "",
          price: Number(it.price ?? 0) || 0,
          original_price: Number(it.original_price ?? 0) || 0,
          image_url: clean(it.image_url) || ""
        }));
      }).catch(() => {
        this.specs = [];
      }).finally(() => {
        this.specsLoading = false;
        this.selectedSpecIndex = -1;
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
        if (res && res.success)
          common_vendor.index.showToast({ title: "已加入购物车", icon: "success" });
        else
          common_vendor.index.showToast({ title: (res == null ? void 0 : res.message) || "加入失败", icon: "none" });
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
      const spec = this.selectedSpecIndex >= 0 && this.specs[this.selectedSpecIndex] ? this.specs[this.selectedSpecIndex] : null;
      const pid = spec ? spec.product_id : ((_a = this.product) == null ? void 0 : _a.id) || "";
      api_index.addCartItem({ room_id: this.roomId, product_id: pid, length: lengthVal, quantity: this.qty, color: this.specTemp || "", note: "" }).then((res) => {
        if (res && res.success)
          common_vendor.index.showToast({ title: `已加入房间：${chosen}`, icon: "success" });
        else
          common_vendor.index.showToast({ title: (res == null ? void 0 : res.message) || "加入失败", icon: "none" });
      }).catch(() => {
        common_vendor.index.showToast({ title: "加入购物车失败", icon: "none" });
      });
    },
    buyNow() {
      common_vendor.index.showToast({ title: "暂未接入下单", icon: "none" });
    },
    // MP-WEIXIN 规格填写
    openSpecSheet() {
      var _a;
      this.mpSheet = true;
      const pid = ((_a = this.product) == null ? void 0 : _a.id) || "";
      this.fetchSpecs(pid);
    },
    closeSpecSheet() {
      this.mpSheet = false;
    },
    // H5 房间选择弹窗
    openRoomSheet() {
      this.roomInput = this.roomName || "";
      this.roomSheet = true;
      api_index.getRooms().then((res) => {
        var _a, _b, _c;
        const raw = Array.isArray((_a = res == null ? void 0 : res.data) == null ? void 0 : _a.items) ? res.data.items : Array.isArray(res == null ? void 0 : res.items) ? res.items : Array.isArray((_b = res == null ? void 0 : res.data) == null ? void 0 : _b.children) ? res.data.children : Array.isArray((_c = res == null ? void 0 : res.data) == null ? void 0 : _c.list) ? res.data.list : Array.isArray(res == null ? void 0 : res.data) ? res.data : [];
        this.roomsRaw = (raw || []).map((it) => typeof it === "string" ? { id: "", name: it } : { id: (it == null ? void 0 : it.id) || (it == null ? void 0 : it.room_id) || "", name: (it == null ? void 0 : it.name) || (it == null ? void 0 : it.room_name) || "" });
        this.roomsList = this.roomsRaw.map((it) => it.name).filter((x) => !!x);
      }).catch(() => {
        this.roomsList = [];
      });
    },
    closeRoomSheet() {
      this.roomSheet = false;
    },
    confirmRoomSelect() {
      const name = (this.roomInput || "").trim();
      if (!name) {
        common_vendor.index.showToast({ title: "请填写房间名", icon: "none" });
        return;
      }
      const isNew = !this.roomsList.includes(name);
      if (isNew) {
        api_index.createRoom({ name }).then(() => {
          this.roomName = name;
          this.roomSheet = false;
          common_vendor.index.showToast({ title: "房间已创建", icon: "success" });
        }).catch(() => {
          common_vendor.index.showToast({ title: "创建房间失败", icon: "none" });
        });
      } else {
        this.roomName = name;
        const found = (this.roomsRaw || []).find((it) => it.name === name);
        this.roomId = found ? found.id : "";
        this.roomSheet = false;
      }
    },
    confirmSpecToCart() {
      var _a;
      if (!this.mpRoom || !this.mpTemp || !this.mpLength || !this.mpQty) {
        common_vendor.index.showToast({ title: "请填写房间名、色温、长度、数量", icon: "none" });
        return;
      }
      const chosen = (this.mpRoom || "").trim();
      const found = (this.roomsRaw || []).find((it) => it.name === chosen);
      const rid = found ? found.id : "";
      const lengthNum = (this.mpLength || "").replace(/[^0-9.]/g, "");
      const lengthVal = lengthNum ? Number(lengthNum) : void 0;
      const spec = this.selectedSpecIndex >= 0 && this.specs[this.selectedSpecIndex] ? this.specs[this.selectedSpecIndex] : null;
      const pid = spec ? spec.product_id : ((_a = this.product) == null ? void 0 : _a.id) || "";
      api_index.addCartItem({ room_id: rid, room_name: chosen, product_id: pid, length: lengthVal, quantity: this.mpQty, color: this.mpTemp || "", note: "" }).then((res) => {
        if (res && res.success) {
          this.mpSheet = false;
          common_vendor.index.showToast({ title: `已加入房间：${chosen}`, icon: "success" });
        } else {
          common_vendor.index.showToast({ title: (res == null ? void 0 : res.message) || "加入失败", icon: "none" });
        }
      }).catch(() => {
        common_vendor.index.showToast({ title: "加入购物车失败", icon: "none" });
      });
    },
    // MP Room Sheet Methods
    openMpRoomSheet() {
      this.roomInput = this.mpRoom || "";
      this.mpRoomSheet = true;
      api_index.getRooms().then((res) => {
        var _a, _b, _c;
        const raw = Array.isArray((_a = res == null ? void 0 : res.data) == null ? void 0 : _a.items) ? res.data.items : Array.isArray(res == null ? void 0 : res.items) ? res.items : Array.isArray((_b = res == null ? void 0 : res.data) == null ? void 0 : _b.children) ? res.data.children : Array.isArray((_c = res == null ? void 0 : res.data) == null ? void 0 : _c.list) ? res.data.list : Array.isArray(res == null ? void 0 : res.data) ? res.data : [];
        this.roomsRaw = (raw || []).map((it) => typeof it === "string" ? { id: "", name: it } : { id: (it == null ? void 0 : it.id) || (it == null ? void 0 : it.room_id) || "", name: (it == null ? void 0 : it.name) || (it == null ? void 0 : it.room_name) || "" });
        this.roomsList = this.roomsRaw.map((it) => it.name).filter((x) => !!x);
      }).catch(() => {
        this.roomsList = [];
      });
    },
    closeMpRoomSheet() {
      this.mpRoomSheet = false;
    },
    confirmMpRoomSelect() {
      const name = (this.roomInput || "").trim();
      if (!name) {
        common_vendor.index.showToast({ title: "请填写房间名", icon: "none" });
        return;
      }
      const isNew = !this.roomsList.includes(name);
      if (isNew) {
        api_index.createRoom({ name }).then(() => {
          this.mpRoom = name;
          this.mpRoomSheet = false;
          common_vendor.index.showToast({ title: "房间已创建", icon: "success" });
        }).catch(() => {
          common_vendor.index.showToast({ title: "创建房间失败", icon: "none" });
        });
      } else {
        this.mpRoom = name;
        this.mpRoomSheet = false;
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.product
  }, $data.product ? common_vendor.e({
    b: $data.product.image || "/static/logo.png",
    c: common_vendor.t($data.product.title),
    d: common_vendor.t($data.product.price.toFixed(2)),
    e: common_vendor.t($data.product.sales),
    f: common_vendor.t($data.product.id || "默认款"),
    g: common_vendor.t($data.product.title),
    h: common_vendor.t($data.product.shipping_origin || "—"),
    i: common_vendor.t($data.product.price.toFixed(2)),
    j: common_vendor.f($options.images, (src, i, i0) => {
      return {
        a: "md" + i,
        b: src
      };
    }),
    k: common_vendor.o((...args) => $options.openSpecSheet && $options.openSpecSheet(...args)),
    l: $data.mpSheet
  }, $data.mpSheet ? common_vendor.e({
    m: $data.specsLoading
  }, $data.specsLoading ? {} : $data.specs && $data.specs.length ? common_vendor.e({
    o: common_vendor.f($data.isSpecsCollapsed ? $data.specs.slice(0, 2) : $data.specs, (it, i, i0) => {
      return common_vendor.e({
        a: it.image_url || "/static/logo.png",
        b: common_vendor.t(it.name),
        c: common_vendor.t(Number(it.price).toFixed(2)),
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
    p: $data.specs.length > 3
  }, $data.specs.length > 3 ? {
    q: common_vendor.t($data.isSpecsCollapsed ? "展开更多" : "收起"),
    r: common_vendor.t($data.isSpecsCollapsed ? "▼" : "▲"),
    s: common_vendor.o(($event) => $data.isSpecsCollapsed = !$data.isSpecsCollapsed)
  } : {}) : {}, {
    n: $data.specs && $data.specs.length,
    t: common_vendor.t($data.mpRoom || "请选择房间"),
    v: common_vendor.o((...args) => $options.openMpRoomSheet && $options.openMpRoomSheet(...args)),
    w: $data.mpTemp,
    x: common_vendor.o(($event) => $data.mpTemp = $event.detail.value),
    y: $data.mpLength,
    z: common_vendor.o(($event) => $data.mpLength = $event.detail.value),
    A: common_vendor.o(($event) => $data.mpQty = Math.max(1, $data.mpQty - 1)),
    B: common_vendor.t($data.mpQty),
    C: common_vendor.o(($event) => $data.mpQty = $data.mpQty + 1),
    D: common_vendor.o((...args) => $options.closeSpecSheet && $options.closeSpecSheet(...args)),
    E: common_vendor.o((...args) => $options.confirmSpecToCart && $options.confirmSpecToCart(...args)),
    F: common_vendor.o(() => {
    }),
    G: common_vendor.o((...args) => $options.closeSpecSheet && $options.closeSpecSheet(...args)),
    H: common_vendor.o(() => {
    })
  }) : {}, {
    I: $data.mpRoomSheet
  }, $data.mpRoomSheet ? common_vendor.e({
    J: $data.roomInput,
    K: common_vendor.o(($event) => $data.roomInput = $event.detail.value),
    L: $data.roomsList && $data.roomsList.length
  }, $data.roomsList && $data.roomsList.length ? {
    M: common_vendor.f($data.roomsList, (name, i, i0) => {
      return {
        a: common_vendor.t(name),
        b: "mpr" + i,
        c: common_vendor.o(($event) => $data.roomInput = name, "mpr" + i)
      };
    })
  } : {}, {
    N: common_vendor.o((...args) => $options.closeMpRoomSheet && $options.closeMpRoomSheet(...args)),
    O: common_vendor.o((...args) => $options.confirmMpRoomSelect && $options.confirmMpRoomSelect(...args)),
    P: common_vendor.o(() => {
    }),
    Q: common_vendor.o((...args) => $options.closeMpRoomSheet && $options.closeMpRoomSheet(...args)),
    R: common_vendor.o(() => {
    })
  }) : {}) : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-a911e391"]]);
wx.createPage(MiniProgramPage);
