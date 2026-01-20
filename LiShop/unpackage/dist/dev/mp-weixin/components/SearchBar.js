"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = {
  name: "SearchBar",
  props: {
    modelValue: { type: String, default: "" },
    placeholder: { type: String, default: "搜索商品、店铺" }
  },
  emits: ["update:modelValue", "search"],
  computed: {
    isH5() {
      try {
        return typeof window !== "undefined";
      } catch (e) {
        return false;
      }
    }
  },
  methods: {
    onInput(e) {
      var _a;
      const value = ((_a = e == null ? void 0 : e.detail) == null ? void 0 : _a.value) ?? "";
      this.$emit("update:modelValue", value);
    },
    onSearch() {
      this.$emit("search", this.modelValue);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $options.isH5
  }, $options.isH5 ? {} : {}, {
    b: $props.modelValue,
    c: $props.placeholder,
    d: common_vendor.o((...args) => $options.onInput && $options.onInput(...args)),
    e: common_vendor.o((...args) => $options.onSearch && $options.onSearch(...args))
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-2334f7bd"]]);
wx.createComponent(Component);
