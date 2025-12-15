"use strict";
const common_vendor = require("../../common/vendor.js");
const api_index = require("../../api/index.js");
const Skeleton = () => "../../components/Skeleton.js";
const _sfc_main = {
  components: { Skeleton },
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
      },
      loading: true
    };
  },
  onLoad(options) {
    if (options.id) {
      this.id = options.id;
      this.loadAddress(options.id);
      common_vendor.index.setNavigationBarTitle({ title: "编辑收货地址" });
    } else {
      common_vendor.index.setNavigationBarTitle({ title: "新建收货地址" });
      this.loading = false;
    }
  },
  methods: {
    loadAddress(id) {
      this.loading = true;
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
      }).finally(() => {
        this.loading = false;
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
if (!Array) {
  const _component_Skeleton = common_vendor.resolveComponent("Skeleton");
  _component_Skeleton();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.p({
      loading: $data.loading,
      showTitle: true
    }),
    b: $data.form.receiver,
    c: common_vendor.o(($event) => $data.form.receiver = $event.detail.value),
    d: $data.form.phone,
    e: common_vendor.o(($event) => $data.form.phone = $event.detail.value),
    f: $data.form.province,
    g: common_vendor.o(($event) => $data.form.province = $event.detail.value),
    h: $data.form.city,
    i: common_vendor.o(($event) => $data.form.city = $event.detail.value),
    j: $data.form.district,
    k: common_vendor.o(($event) => $data.form.district = $event.detail.value),
    l: $data.form.detail_address,
    m: common_vendor.o(($event) => $data.form.detail_address = $event.detail.value),
    n: $data.form.is_default === 1,
    o: common_vendor.o((...args) => $options.onSwitchChange && $options.onSwitchChange(...args)),
    p: common_vendor.o((...args) => $options.saveAddress && $options.saveAddress(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
