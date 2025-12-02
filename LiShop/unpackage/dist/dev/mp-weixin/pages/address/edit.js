"use strict";
const common_vendor = require("../../common/vendor.js");
const api_index = require("../../api/index.js");
const _sfc_main = {
  data() {
    return {
      id: "",
      form: {
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
  onLoad(options) {
    if (options.id) {
      this.id = options.id;
      this.loadAddress(options.id);
      common_vendor.index.setNavigationBarTitle({ title: "编辑收货地址" });
    } else {
      common_vendor.index.setNavigationBarTitle({ title: "新建收货地址" });
    }
  },
  methods: {
    loadAddress(id) {
      const u = common_vendor.index.getStorageSync("user");
      const token = u && (u.token || u.data && u.data.token) || "";
      api_index.getAddresses({ addresses_id: id, token }).then((res) => {
        if (res && res.success && res.data) {
          const addr = res.data;
          this.form = {
            receiver: addr.receiver,
            phone: addr.phone,
            province: addr.province,
            city: addr.city,
            district: addr.district,
            detail_address: addr.detail_address,
            is_default: addr.is_default
          };
        }
      }).catch((err) => {
        console.error(err);
        common_vendor.index.showToast({ title: "获取地址详情失败", icon: "none" });
      });
    },
    onSwitchChange(e) {
      this.form.is_default = e.detail.value ? 1 : 0;
    },
    saveAddress() {
      if (!this.form.receiver)
        return common_vendor.index.showToast({ title: "请填写收货人", icon: "none" });
      if (!this.form.phone)
        return common_vendor.index.showToast({ title: "请填写手机号", icon: "none" });
      if (!this.form.province || !this.form.city || !this.form.district)
        return common_vendor.index.showToast({ title: "请填写完整地区", icon: "none" });
      if (!this.form.detail_address)
        return common_vendor.index.showToast({ title: "请填写详细地址", icon: "none" });
      const u = common_vendor.index.getStorageSync("user");
      const token = u && (u.token || u.data && u.data.token) || "";
      const payload = { ...this.form, token };
      let p;
      if (this.id) {
        payload.addresses_id = this.id;
        p = api_index.updateAddress(payload);
      } else {
        p = api_index.addAddress(payload);
      }
      p.then((res) => {
        if (res && res.success) {
          common_vendor.index.showToast({ title: "保存成功", icon: "success" });
          setTimeout(() => {
            common_vendor.index.navigateBack();
          }, 1500);
        } else {
          common_vendor.index.showToast({ title: res.message || "保存失败", icon: "none" });
        }
      }).catch((err) => {
        console.error(err);
        common_vendor.index.showToast({ title: "保存失败", icon: "none" });
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $data.form.receiver,
    b: common_vendor.o(($event) => $data.form.receiver = $event.detail.value),
    c: $data.form.phone,
    d: common_vendor.o(($event) => $data.form.phone = $event.detail.value),
    e: $data.form.province,
    f: common_vendor.o(($event) => $data.form.province = $event.detail.value),
    g: $data.form.city,
    h: common_vendor.o(($event) => $data.form.city = $event.detail.value),
    i: $data.form.district,
    j: common_vendor.o(($event) => $data.form.district = $event.detail.value),
    k: $data.form.detail_address,
    l: common_vendor.o(($event) => $data.form.detail_address = $event.detail.value),
    m: $data.form.is_default === 1,
    n: common_vendor.o((...args) => $options.onSwitchChange && $options.onSwitchChange(...args)),
    o: common_vendor.o((...args) => $options.saveAddress && $options.saveAddress(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
