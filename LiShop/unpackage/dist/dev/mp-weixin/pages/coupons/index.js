"use strict";
const common_vendor = require("../../common/vendor.js");
const api_index = require("../../api/index.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      coupons: []
    };
  },
  onShow() {
    this.fetchCoupons();
  },
  methods: {
    formatDate(iso) {
      if (!iso)
        return "-";
      const d = new Date(iso);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    },
    fetchCoupons() {
      let token = "";
      try {
        const u = common_vendor.index.getStorageSync("user") || null;
        token = u && (u.token || u.data && u.data.token) || "";
      } catch (e) {
      }
      if (!token) {
        common_vendor.index.navigateTo({ url: "/pages/login/index" });
        return;
      }
      api_index.getUserCoupons({ token }).then((res) => {
        if (res && res.success && res.data && res.data.items) {
          this.coupons = res.data.items;
        }
      }).catch((err) => {
        common_vendor.index.showToast({ title: "获取优惠券失败", icon: "none" });
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.coupons.length > 0
  }, $data.coupons.length > 0 ? {
    b: common_vendor.f($data.coupons, (c, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(c.balance),
        b: c.rule && c.rule.min_order_amount > 0
      }, c.rule && c.rule.min_order_amount > 0 ? {
        c: common_vendor.t(c.rule.min_order_amount)
      } : {}, {
        d: common_vendor.t(c.name),
        e: common_vendor.t($options.formatDate(c.valid_start_time)),
        f: common_vendor.t($options.formatDate(c.valid_end_time)),
        g: c.status === 2
      }, c.status === 2 ? {
        h: common_assets._imports_0$1
      } : {}, {
        i: c.status === 2
      }, c.status === 2 ? {} : c.status === 3 ? {} : {}, {
        j: c.status === 3,
        k: c.record_id,
        l: c.status !== 1 ? 1 : ""
      });
    })
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/coupons/index.js.map
