"use strict";
const common_vendor = require("../common/vendor.js");
const common_assets = require("../common/assets.js");
const _sfc_main = {
  name: "RoomSelector",
  props: {
    visible: { type: Boolean, default: false },
    rooms: { type: Array, default: () => [] },
    selectedName: { type: String, default: "" }
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
      }
    };
  },
  computed: {
    isAddressMode() {
      const list = this.rooms || [];
      if (Array.isArray(list) && list.length > 0) {
        const a = list[0];
        return !!(a && a.raw);
      }
      return false;
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.newRoomName = "";
        this.createAddressMode = false;
        this.addrForm = { receiver: "", phone: "", province: "", city: "", district: "", detail_address: "", is_default: 0 };
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
    d: !$options.isAddressMode
  }, !$options.isAddressMode ? {
    e: $data.newRoomName,
    f: common_vendor.o(($event) => $data.newRoomName = $event.detail.value)
  } : {}, {
    g: $options.isAddressMode && $data.createAddressMode
  }, $options.isAddressMode && $data.createAddressMode ? {
    h: $data.addrForm.receiver,
    i: common_vendor.o(($event) => $data.addrForm.receiver = $event.detail.value),
    j: $data.addrForm.phone,
    k: common_vendor.o(($event) => $data.addrForm.phone = $event.detail.value),
    l: $data.addrForm.province,
    m: common_vendor.o(($event) => $data.addrForm.province = $event.detail.value),
    n: $data.addrForm.city,
    o: common_vendor.o(($event) => $data.addrForm.city = $event.detail.value),
    p: $data.addrForm.district,
    q: common_vendor.o(($event) => $data.addrForm.district = $event.detail.value),
    r: $data.addrForm.detail_address,
    s: common_vendor.o(($event) => $data.addrForm.detail_address = $event.detail.value),
    t: $data.addrForm.is_default === 1,
    v: common_vendor.o((...args) => $options.onAddrSwitchChange && $options.onAddrSwitchChange(...args))
  } : {}, {
    w: common_vendor.f($props.rooms, (room, index, i0) => {
      return {
        a: common_vendor.t(room.name),
        b: index,
        c: $props.selectedName === room.name ? 1 : "",
        d: common_vendor.o(($event) => $options.select(room), index)
      };
    }),
    x: common_assets._imports_0$2,
    y: common_vendor.o((...args) => $options.close && $options.close(...args)),
    z: !$options.isAddressMode
  }, !$options.isAddressMode ? {
    A: common_vendor.o((...args) => $options.confirmCreate && $options.confirmCreate(...args))
  } : {}, {
    B: $options.isAddressMode && !$data.createAddressMode
  }, $options.isAddressMode && !$data.createAddressMode ? {
    C: common_vendor.o((...args) => $options.toggleCreateAddress && $options.toggleCreateAddress(...args))
  } : {}, {
    D: $options.isAddressMode && $data.createAddressMode
  }, $options.isAddressMode && $data.createAddressMode ? {
    E: common_vendor.o((...args) => $options.saveAddress && $options.saveAddress(...args))
  } : {}, {
    F: common_vendor.o(() => {
    }),
    G: common_vendor.o((...args) => $options.close && $options.close(...args))
  }) : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-9c17e027"]]);
wx.createComponent(Component);
