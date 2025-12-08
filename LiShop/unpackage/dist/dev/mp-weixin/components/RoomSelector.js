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
      newRoomName: ""
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
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $props.visible
  }, $props.visible ? common_vendor.e({
    b: common_vendor.o((...args) => $options.close && $options.close(...args)),
    c: !$options.isAddressMode
  }, !$options.isAddressMode ? {
    d: $data.newRoomName,
    e: common_vendor.o(($event) => $data.newRoomName = $event.detail.value)
  } : {}, {
    f: common_vendor.f($props.rooms, (room, index, i0) => {
      return {
        a: common_vendor.t(room.name),
        b: index,
        c: $props.selectedName === room.name ? 1 : "",
        d: common_vendor.o(($event) => $options.select(room), index)
      };
    }),
    g: common_assets._imports_0$1,
    h: common_vendor.o((...args) => $options.close && $options.close(...args)),
    i: !$options.isAddressMode
  }, !$options.isAddressMode ? {
    j: common_vendor.o((...args) => $options.confirmCreate && $options.confirmCreate(...args))
  } : {}, {
    k: common_vendor.o(() => {
    }),
    l: common_vendor.o((...args) => $options.close && $options.close(...args))
  }) : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-9c17e027"]]);
wx.createComponent(Component);
