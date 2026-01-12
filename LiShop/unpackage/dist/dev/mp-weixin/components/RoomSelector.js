"use strict";
const common_vendor = require("../common/vendor.js");
const common_assets = require("../common/assets.js");
const _sfc_main = {
  name: "RoomSelector",
  props: {
    visible: { type: Boolean, default: false },
    rooms: { type: Array, default: () => [] },
    selectedName: { type: String, default: "" },
    type: { type: String, default: "" }
  },
  data() {
    return {
      newRoomName: "",
      createAddressMode: false,
      addrForm: {
        receiver: "",
        phone: "",
        province: "",
        city: "",
        district: "",
        detail_address: "",
        is_default: 0
      },
      addrRegionRange: [[], [], []],
      addrRegionIndex: [0, 0, 0],
      addrAreaTree: {
        "北京市": { "北京市": ["东城区", "西城区", "朝阳区", "海淀区"] },
        "上海市": { "上海市": ["黄浦区", "徐汇区", "浦东新区"] },
        "广东省": { "广州市": ["天河区", "海珠区", "越秀区"], "深圳市": ["南山区", "福田区", "罗湖区"] },
        "浙江省": { "杭州市": ["西湖区", "上城区", "拱墅区"], "宁波市": ["海曙区", "江北区"] },
        "江苏省": { "南京市": ["玄武区", "秦淮区"], "苏州市": ["姑苏区", "吴中区"] },
        "重庆市": { "重庆市": ["渝中区", "江北区"] }
      }
    };
  },
  computed: {
    isAddressMode() {
      if (this.type === "addr")
        return true;
      if (this.type === "room")
        return false;
      const list = this.rooms || [];
      if (Array.isArray(list) && list.length > 0) {
        const a = list[0];
        return !!(a && a.raw);
      }
      return false;
    },
    addrRegionDisplay() {
      const { province, city, district } = this.addrForm;
      const arr = [province, city, district].filter(Boolean);
      return arr.length ? arr.join(" ") : "请选择省/市/区";
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.newRoomName = "";
        this.createAddressMode = false;
        this.addrForm = { receiver: "", phone: "", province: "", city: "", district: "", detail_address: "", is_default: 0 };
        this.initH5AddrRegion();
      }
    }
  },
  methods: {
    close() {
      this.$emit("close");
    },
    select(room) {
      this.$emit("select", room);
    },
    confirmSelect() {
      const list = this.rooms || [];
      const picked = list.find((r) => r && r.name === this.selectedName);
      if (picked) {
        this.$emit("select", picked);
        this.$emit("close");
      }
    },
    confirmCreate() {
      if (!this.newRoomName.trim()) {
        return;
      }
      this.$emit("create", this.newRoomName.trim());
    },
    toggleCreateAddress() {
      this.createAddressMode = true;
    },
    onAddrSwitchChange(e) {
      this.addrForm.is_default = e.detail.value ? 1 : 0;
    },
    onAddrRegionChange(e) {
      var _a;
      const val = ((_a = e == null ? void 0 : e.detail) == null ? void 0 : _a.value) || [];
      this.addrForm.province = val[0] || "";
      this.addrForm.city = val[1] || "";
      this.addrForm.district = val[2] || "";
    },
    initH5AddrRegion() {
      try {
        const isH5 = typeof window !== "undefined";
        if (!isH5)
          return;
        const provinces = Object.keys(this.addrAreaTree || {});
        const p = provinces[0] || "";
        const cities = Object.keys(this.addrAreaTree && this.addrAreaTree[p] || {});
        const c = cities[0] || "";
        const areas = this.addrAreaTree && this.addrAreaTree[p] && this.addrAreaTree[p][c] || [];
        this.addrRegionRange = [provinces, cities, areas];
        this.addrRegionIndex = [0, 0, 0];
      } catch (e) {
      }
    },
    onH5AddrRegionColumnChange(e) {
      const col = e.detail.column;
      const idx = e.detail.value;
      this.addrRegionIndex[col] = idx;
      const p = this.addrRegionRange[0][this.addrRegionIndex[0]] || "";
      if (col === 0) {
        const cities = Object.keys(this.addrAreaTree && this.addrAreaTree[p] || {});
        const c = cities[0] || "";
        const areas = this.addrAreaTree && this.addrAreaTree[p] && this.addrAreaTree[p][c] || [];
        this.addrRegionRange = [this.addrRegionRange[0], cities, areas];
        this.addrRegionIndex[1] = 0;
        this.addrRegionIndex[2] = 0;
      } else if (col === 1) {
        const c = this.addrRegionRange[1][this.addrRegionIndex[1]] || "";
        const areas = this.addrAreaTree && this.addrAreaTree[p] && this.addrAreaTree[p][c] || [];
        this.addrRegionRange = [this.addrRegionRange[0], this.addrRegionRange[1], areas];
        this.addrRegionIndex[2] = 0;
      }
    },
    onH5AddrRegionChange(e) {
      this.addrRegionIndex = e.detail.value;
      const p = this.addrRegionRange[0][this.addrRegionIndex[0]] || "";
      const c = this.addrRegionRange[1][this.addrRegionIndex[1]] || "";
      const a = this.addrRegionRange[2][this.addrRegionIndex[2]] || "";
      this.addrForm.province = p;
      this.addrForm.city = c;
      this.addrForm.district = a;
    },
    saveAddress() {
      const f = this.addrForm;
      if (!f.receiver || !f.phone || !f.province || !f.city || !f.district || !f.detail_address) {
        try {
          common_vendor.index.showToast({ title: "请填写完整地址信息", icon: "none" });
        } catch (e) {
        }
        return;
      }
      this.$emit("createAddress", { ...f });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $props.visible
  }, $props.visible ? common_vendor.e({
    b: $options.isAddressMode
  }, $options.isAddressMode ? {} : {}, {
    c: common_vendor.o((...args) => $options.close && $options.close(...args)),
    d: $options.isAddressMode && $props.rooms.length === 0
  }, $options.isAddressMode && $props.rooms.length === 0 ? {} : {}, {
    e: !$options.isAddressMode
  }, !$options.isAddressMode ? {
    f: $data.newRoomName,
    g: common_vendor.o(($event) => $data.newRoomName = $event.detail.value)
  } : {}, {
    h: $options.isAddressMode && $data.createAddressMode
  }, $options.isAddressMode && $data.createAddressMode ? {
    i: $data.addrForm.receiver,
    j: common_vendor.o(($event) => $data.addrForm.receiver = $event.detail.value),
    k: $data.addrForm.phone,
    l: common_vendor.o(($event) => $data.addrForm.phone = $event.detail.value),
    m: common_vendor.t($options.addrRegionDisplay),
    n: common_vendor.o((...args) => $options.onAddrRegionChange && $options.onAddrRegionChange(...args)),
    o: $data.addrForm.detail_address,
    p: common_vendor.o(($event) => $data.addrForm.detail_address = $event.detail.value),
    q: $data.addrForm.is_default === 1,
    r: common_vendor.o((...args) => $options.onAddrSwitchChange && $options.onAddrSwitchChange(...args))
  } : {}, {
    s: common_vendor.f($props.rooms, (room, index, i0) => {
      return {
        a: common_vendor.t(room.name),
        b: index,
        c: $props.selectedName === room.name ? 1 : "",
        d: common_vendor.o(($event) => $options.select(room), index)
      };
    }),
    t: common_assets._imports_0$2,
    v: common_vendor.o((...args) => $options.close && $options.close(...args)),
    w: !$options.isAddressMode
  }, !$options.isAddressMode ? {
    x: common_vendor.o((...args) => $options.confirmCreate && $options.confirmCreate(...args))
  } : {}, {
    y: $options.isAddressMode && !$data.createAddressMode
  }, $options.isAddressMode && !$data.createAddressMode ? {
    z: common_vendor.o((...args) => $options.toggleCreateAddress && $options.toggleCreateAddress(...args))
  } : {}, {
    A: $options.isAddressMode && $data.createAddressMode
  }, $options.isAddressMode && $data.createAddressMode ? {
    B: common_vendor.o((...args) => $options.saveAddress && $options.saveAddress(...args))
  } : {}, {
    C: common_vendor.o(() => {
    }),
    D: common_vendor.o((...args) => $options.close && $options.close(...args))
  }) : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-9c17e027"]]);
wx.createComponent(Component);
