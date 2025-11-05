"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = {
  name: "Captcha",
  props: {
    length: { type: Number, default: 4 }
  },
  emits: ["change"],
  data() {
    return { code: "", dataUri: "" };
  },
  mounted() {
    this.refresh();
  },
  methods: {
    randomCode(len) {
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      let s = "";
      for (let i = 0; i < len; i++)
        s += chars[Math.floor(Math.random() * chars.length)];
      return s;
    },
    svgFor(code) {
      const w = 120, h = 40;
      const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
      const colors = ["#333", "#e1251b", "#ff5500", "#2f54eb", "#13c2c2"];
      const bg = "#f5f5f5";
      const letters = code.split("").map((ch, i) => {
        const x = 15 + i * 25 + rand(-3, 3);
        const y = 26 + rand(-3, 3);
        const rotate = rand(-20, 20);
        const fill = colors[rand(0, colors.length - 1)];
        return `<text x="${x}" y="${y}" fill="${fill}" font-size="22" transform="rotate(${rotate} ${x} ${y})" font-family="Arial">${ch}</text>`;
      }).join("");
      const lines = Array.from({ length: 3 }).map(() => {
        const x1 = rand(0, w), y1 = rand(0, h), x2 = rand(0, w), y2 = rand(0, h);
        const stroke = colors[rand(0, colors.length - 1)];
        return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="1" opacity="0.5"/>`;
      }).join("");
      const dots = Array.from({ length: 20 }).map(() => {
        const cx = rand(0, w), cy = rand(0, h);
        return `<circle cx="${cx}" cy="${cy}" r="1" fill="#999" opacity="0.4"/>`;
      }).join("");
      const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'>
        <rect width='100%' height='100%' fill='${bg}'/>
        ${letters}${lines}${dots}
      </svg>`;
      return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
    },
    refresh() {
      this.code = this.randomCode(this.length);
      this.dataUri = this.svgFor(this.code);
      this.$emit("change", this.code);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $data.dataUri,
    b: common_vendor.o((...args) => $options.refresh && $options.refresh(...args)),
    c: common_vendor.o((...args) => $options.refresh && $options.refresh(...args))
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-bff8b02f"]]);
wx.createComponent(Component);
